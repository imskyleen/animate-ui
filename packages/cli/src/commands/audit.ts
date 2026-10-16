import { styleText } from 'node:util';

import {
  audit as runAudit,
  type Cost,
  type Fact,
  type FactKind,
} from '../lib/audit';

type AuditOptions = {
  cwd: string;
  json?: boolean;
  log?: (message: string) => void;
};

const LABELS: Record<FactKind, string> = {
  'animated-properties': 'moves',
  'transition-all': 'transition all',
  'ease-in': 'ease-in',
  'long-duration': 'long duration',
  'hover-scale': 'hover scale',
  'scale-from-zero': 'scale from 0',
  'infinite-loop': 'loop',
  'layout-animation': 'layout prop',
  'will-change': 'will-change',
  'no-origin': 'no origin',
  'css-transition-conflict': 'css vs motion',
  'hidden-on-first-paint': 'hidden heading',
  'hover-not-gated': 'hover on touch',
  'no-reduced-motion': 'reduced motion',
};

const COSTS: Cost[] = ['compositor', 'main-thread', 'paint', 'layout', 'other'];

function describe(fact: Fact) {
  if (!fact.properties) return fact.detail;
  const groups = COSTS.flatMap((cost) => {
    const names = [
      ...new Set(
        fact.properties!.filter((p) => p.cost === cost).map((p) => p.name),
      ),
    ];
    return names.length ? [`${names.join(', ')} (${cost})`] : [];
  });
  return `${fact.detail}: ${groups.join(' · ')}`;
}

export function audit(targets: string[], options: AuditOptions) {
  const log = options.log ?? console.log;
  const report = runAudit(options.cwd, targets);

  if (options.json) {
    log(JSON.stringify({ ...report, root: undefined }, null, 2));
    return 0;
  }

  const moving = report.filesWithMotion.length;
  log(
    `Motion audit: ${moving} of ${report.files} files move, ${report.facts.length} facts.`,
  );
  log(
    styleText(
      'dim',
      'These are facts, not verdicts: weigh each one against how often the element is used and what its motion is for.',
    ),
  );

  const byFile = new Map<string, Fact[]>();
  for (const fact of report.facts) {
    const list = byFile.get(fact.file) ?? [];
    list.push(fact);
    byFile.set(fact.file, list);
  }
  const width = Math.max(
    ...report.facts.map((fact) => String(fact.line).length),
    1,
  );
  for (const [file, facts] of byFile) {
    log('');
    log(styleText('bold', file));
    for (const fact of facts.sort(
      (a, b) => (a.line || Infinity) - (b.line || Infinity),
    )) {
      const line = fact.line
        ? String(fact.line).padStart(width)
        : '–'.padStart(width);
      log(`  ${line}  ${LABELS[fact.kind].padEnd(16)} ${describe(fact)}`);
    }
  }

  const count = (kind: FactKind) =>
    report.facts.filter((fact) => fact.kind === kind).length;
  const properties = report.facts.flatMap((fact) => fact.properties ?? []);
  const costs = COSTS.flatMap((cost) => {
    const names = properties.filter((p) => p.cost === cost).map((p) => p.name);
    if (!names.length) return [];
    const unique = [...new Set(names)];
    return [
      cost === 'compositor'
        ? `${cost} ${names.length}`
        : `${cost} ${names.length} (${unique.slice(0, 6).join(', ')}${unique.length > 6 ? ', …' : ''})`,
    ];
  });
  const withPath = report.filesWithMotion.filter((file) =>
    report.reducedMotion.files.includes(file),
  ).length;

  log('');
  log(styleText('bold', 'Totals'));
  log(`  properties      ${costs.join(' · ') || 'none'}`);
  log(
    `  patterns        transition all ${count('transition-all')} · ease-in ${count('ease-in')} · long durations ${count('long-duration')} · hover scale ${count('hover-scale')} · scale from 0 ${count('scale-from-zero')} · loops ${count('infinite-loop')} · layout props ${count('layout-animation')} · will-change ${count('will-change')} · no origin ${count('no-origin')} · css vs motion ${count('css-transition-conflict')} · hidden heading ${count('hidden-on-first-paint')} · hover on touch ${count('hover-not-gated')}`,
  );
  log(
    `  reduced motion  ${withPath} of ${moving} files that move have a path${
      report.reducedMotion.project.length
        ? ` · project-wide: ${report.reducedMotion.project.join(', ')}`
        : ' · none project-wide'
    }`,
  );
  if (report.unreadable.length)
    log(
      `\n${styleText('yellow', '!')} Couldn't parse, so not read: ${report.unreadable.join(', ')}`,
    );
  return 0;
}
