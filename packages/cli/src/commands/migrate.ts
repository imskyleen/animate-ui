import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { styleText } from 'node:util';

import { PACKAGE } from '../lib/primitives';
import { PromptAbortedError, select, type Ask } from '../lib/prompt';
import {
  loadMigrateProject,
  stripExtension,
  type V1Module,
} from '../lib/migrate/project';
import {
  findMigration,
  listImports,
  moduleKey,
  rewrite,
  type RewriteResult,
} from '../lib/migrate/rewrite';
import {
  HEADLESS_PRIMITIVES,
  PRIMITIVES,
  REGISTRY_PRIMITIVES,
  UNSUPPORTED_PRIMITIVES,
  UNSUPPORTED_UTILITIES,
  UTILITIES,
} from '../lib/migrate/table';

export type MigrateOptions = {
  cwd: string;
  dryRun: boolean;
  exclude?: string[];
  delete?: boolean;
  keep?: boolean;
  interactive?: boolean;
  ask?: Ask;
  log?: (message: string) => void;
};

function selectionName(module: V1Module) {
  if (module.kind === 'primitive') return module.name;
  if (module.id === 'icons/icon') return 'icons';
  return module.id.split('/')[1]!;
}

function knownNames() {
  const names = new Set(['icons', 'icon']);
  for (const key of [
    ...Object.keys(PRIMITIVES),
    ...Object.keys(REGISTRY_PRIMITIVES),
    ...UNSUPPORTED_PRIMITIVES,
  ])
    names.add(key.split('/')[1]!);
  for (const name of HEADLESS_PRIMITIVES) names.add(name);
  for (const id of [...Object.keys(UTILITIES), ...UNSUPPORTED_UTILITIES]) {
    if (id !== 'icons/icon') names.add(id.split('/')[1]!);
  }
  return names;
}

const SHADCN_COMPONENTS: Record<string, string | null> = {
  menu: 'dropdown-menu',
  radio: 'radio-group',
  'preview-card': 'hover-card',
  files: null,
  'preview-link-card': null,
  sidebar: null,
};

export async function migrate(components: string[], options: MigrateOptions) {
  const log = options.log ?? console.log;
  const project = loadMigrateProject(options.cwd);
  const relative = (file: string) => path.relative(project.root, file);

  let exitCode = 0;
  const all = components.some((name) => name.toLowerCase() === 'all');
  const known = knownNames();
  const names = new Set<string>();
  for (const name of components.map((name) => name.toLowerCase())) {
    if (name === 'all') continue;
    if (!known.has(name)) {
      exitCode = 1;
      log(`${styleText('red', '✖')} ${name} isn't an Animate UI v1 primitive.`);
      continue;
    }
    names.add(name === 'icon' ? 'icons' : name);
  }
  if (!all && names.size === 0) return exitCode;

  const excluded = new Set<string>();
  for (const raw of options.exclude ?? []) {
    const name = raw.toLowerCase();
    if (!known.has(name)) {
      log(
        `${styleText('red', '✖')} ${raw} isn't an Animate UI v1 primitive: check --exclude.`,
      );
      return 1;
    }
    excluded.add(name === 'icon' ? 'icons' : name);
  }
  for (const name of excluded) names.delete(name);

  const selected = (module: V1Module) =>
    !excluded.has(selectionName(module)) &&
    (all || names.has(selectionName(module)));

  const replacedModule = (file: string) => {
    const module = project.classify(stripExtension(file));
    return module && findMigration(module) ? module : undefined;
  };

  const isKeptPrimitive = (file: string) => {
    const module = project.classify(stripExtension(file));
    return module?.kind === 'primitive' && !findMigration(module);
  };
  const selectedInKeptPrimitive = (module: V1Module) =>
    selected(module) &&
    !(
      module.kind === 'primitive' &&
      (module.library === 'radix' || module.library === 'base')
    );

  const files = project.sourceFiles();
  const contents = new Map<string, string>();
  const results: { file: string; result: RewriteResult; changed: boolean }[] =
    [];
  const found = new Set<string>();

  for (const file of files) {
    const code = readFileSync(file, 'utf8');
    contents.set(file, code);
    if (replacedModule(file)) continue;
    let result: RewriteResult;
    try {
      result = rewrite(code, {
        project,
        file,
        selected: isKeptPrimitive(file) ? selectedInKeptPrimitive : selected,
      });
    } catch (error) {
      if (code.includes('animate-ui'))
        log(
          `${styleText('yellow', '!')} ${relative(file)}: couldn't parse it (${error instanceof Error ? error.message : error}), skipped.`,
        );
      continue;
    }
    result.found.forEach((key) => found.add(key));
    const changed = result.code !== code;
    if (!changed && result.manual.length === 0) continue;
    if (changed && !options.dryRun) {
      try {
        writeFileSync(file, result.code);
      } catch (error) {
        exitCode = 1;
        log(
          `${styleText('red', '✖')} ${relative(file)}: couldn't write it (${error instanceof Error ? error.message : error}), skipped.`,
        );
        continue;
      }
    }
    if (changed) contents.set(file, result.code);
    results.push({ file, result, changed });
  }

  let changedFiles = 0;
  let manualSteps = 0;
  for (const { file, result, changed } of results) {
    if (changed) changedFiles++;
    manualSteps += result.manual.length;
    log(
      `${changed ? styleText('green', '✔') : styleText('yellow', '!')} ${relative(file)}`,
    );
    for (const change of result.imports) {
      log(
        `    ${change.names.join(', ')}: ${change.from} → ${change.to.join(', ')}`,
      );
    }
    for (const change of result.changes) log(`    ${change}`);
    for (const step of result.manual) {
      log(
        `    ${styleText('yellow', '!')} ${relative(file)}:${options.dryRun ? step.line : step.migratedLine} ${step.message}`,
      );
    }
    const component = path
      .relative(project.componentsDir, file)
      .split(path.sep)
      .join('/')
      .match(/^animate-ui\/components\/(radix|base)\/([a-z0-9-]+)\.[jt]sx?$/);
    if (component && result.imports.length > 0) {
      const name = component[2]!;
      const shadcn = name in SHADCN_COMPONENTS ? SHADCN_COMPONENTS[name] : name;
      log(
        styleText(
          'dim',
          `    A v1 component: it keeps working on v2.${shadcn ? ` You can also swap it for shadcn/ui's ${shadcn} (${project.dlx} shadcn@latest add ${shadcn}) and run animate-ui animate ${shadcn}.` : ''}`,
        ),
      );
    }
  }

  for (const name of names) {
    if (
      ![...found].some(
        (key) =>
          key.split('/')[1] === name ||
          (name === 'icons' && key === 'icons/icon'),
      )
    )
      log(`${styleText('yellow', '!')} No import of the v1 ${name} found.`);
  }

  if (changedFiles === 0 && manualSteps === 0) {
    log(
      `Nothing to migrate: no import of ${all ? 'Animate UI v1' : `the v1 ${[...names].join(', ')}`} left.`,
    );
  } else {
    const verb = options.dryRun ? 'would be migrated' : 'migrated';
    log(
      `\n${changedFiles} file${changedFiles === 1 ? '' : 's'} ${verb}` +
        (manualSteps > 0
          ? `, ${manualSteps} manual step${manualSteps === 1 ? '' : 's'} left (marked !).`
          : '.'),
    );
  }

  const candidates = new Map<string, string>();
  for (const file of files) {
    const module = replacedModule(file);
    if (!module || !selected(module)) continue;
    const code = contents.get(file)!;
    const v1 = Object.keys(findMigration(module)!.values).every((name) =>
      new RegExp(`\\b${name}\\b`).test(code),
    );
    if (v1) candidates.set(moduleKey(module), file);
  }
  const imports = new Map<string, string[]>();
  for (const [file, code] of contents) {
    let sources: string[] = [];
    try {
      sources = listImports(code, file);
    } catch {}
    imports.set(
      file,
      sources.flatMap((source) => {
        const target = project.resolve(file, source);
        const module =
          target === undefined ? undefined : project.classify(target);
        const candidate = module && candidates.get(moduleKey(module));
        return candidate ? [candidate] : [];
      }),
    );
  }
  const candidateFiles = new Set(candidates.values());
  const mentions = new Map<string, string[]>();
  const patterns = [...candidateFiles].map((file): [string, RegExp] => {
    const tail = stripExtension(file).split(path.sep).slice(-2).join('/');
    return [
      file,
      new RegExp(
        `['"\`]([^'"\`\\s]*/${tail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/index)?(?:\\.[cm]?[jt]sx?)?)['"\`]`,
        'g',
      ),
    ];
  });
  const mentionsIt = (
    code: string,
    from: string,
    candidate: string,
    pattern: RegExp,
  ) =>
    [...code.matchAll(pattern)].some(([, specifier]) => {
      const target = project.resolve(from, specifier!);
      const own = stripExtension(candidate);
      return (
        target === undefined || target === own || target === `${own}/index`
      );
    });
  if (patterns.length > 0)
    for (const file of project.textFiles()) {
      if (candidateFiles.has(file)) continue;
      let code = contents.get(file);
      if (code === undefined)
        try {
          code = readFileSync(file, 'utf8');
        } catch {
          continue;
        }
      for (const [candidate, pattern] of patterns)
        if (mentionsIt(code, file, candidate, pattern))
          mentions.set(candidate, [...(mentions.get(candidate) ?? []), file]);
    }
  const used = new Set<string>(mentions.keys());
  for (let grew = true; grew;) {
    grew = false;
    for (const [file, targets] of imports) {
      if (candidateFiles.has(file) && !used.has(file)) continue;
      for (const target of targets) {
        if (!used.has(target)) {
          used.add(target);
          grew = true;
        }
      }
    }
  }
  const unused = [...candidateFiles].filter((file) => !used.has(file)).sort();

  const importersOf = (file: string) =>
    [
      ...new Set([
        ...[...imports]
          .filter(
            ([importer, targets]) =>
              !candidateFiles.has(importer) && targets.includes(file),
          )
          .map(([importer]) => importer),
        ...(mentions.get(file) ?? []),
      ]),
    ]
      .map(relative)
      .sort();
  const stillImported = [...used]
    .sort()
    .filter((file) => importersOf(file).length > 0);
  if (stillImported.length > 0) {
    log('\nStill imported (v1 files @animate-ui/react replaces):');
    for (const file of stillImported) {
      const importers = importersOf(file);
      const more =
        importers.length > 3 ? ` and ${importers.length - 3} more` : '';
      log(
        `    ${relative(file)}: still imported by ${importers.slice(0, 3).join(', ')}${more}, kept.`,
      );
    }
    const along = used.size - stillImported.length;
    if (along > 0)
      log(
        `    and the ${along} v1 file${along === 1 ? '' : 's'} ${stillImported.length === 1 ? 'it imports' : 'they import'}, kept.`,
      );
  }

  if (unused.length > 0) {
    const interactive =
      options.interactive ??
      Boolean(process.stdin.isTTY && process.stdout.isTTY);
    const header = (verb: string) =>
      log(`\n${verb} (v1 files @animate-ui/react replaces):`);
    const list = () => {
      for (const file of unused) log(`    ${relative(file)}`);
    };

    if (options.dryRun) {
      header(options.delete ? 'Would remove' : 'No longer imported');
      list();
      if (!options.delete)
        log(styleText('dim', 'Run again with --delete to remove them.'));
    } else if (options.delete) {
      header('Removed');
      for (const file of unused) {
        log(`    ${relative(file)}`);
        unlinkSync(file);
      }
    } else if (options.keep || !interactive) {
      header('No longer imported');
      list();
      if (!options.keep)
        log(styleText('dim', 'Run again with --delete to remove them.'));
    } else {
      header('No longer imported');
      list();
      log('');
      const ask = options.ask ?? select;
      const removed: string[] = [];
      try {
        for (let i = 0; i < unused.length; i++) {
          const file = relative(unused[i]!);
          const others = unused.length - i - 1;
          const choices: [string, 'delete' | 'keep', 'one' | 'all'][] = [
            [`Delete ${file}`, 'delete', 'one'],
          ];
          if (others > 0)
            choices.push([
              `Delete ${file} and the ${others} other unused v1 file${others === 1 ? '' : 's'}`,
              'delete',
              'all',
            ]);
          choices.push([`Keep ${file}`, 'keep', 'one']);
          if (others > 0) choices.push(['Keep every v1 file', 'keep', 'all']);
          const [, action, scope] =
            choices[
              await ask(
                `Nothing imports ${file} anymore (${i + 1}/${unused.length}).`,
                choices.map(([label]) => label),
              )
            ]!;
          const files = scope === 'all' ? unused.slice(i) : [unused[i]!];
          if (action === 'delete')
            for (const target of files) {
              unlinkSync(target);
              removed.push(target);
            }
          if (scope === 'all') break;
        }
      } catch (error) {
        if (!(error instanceof PromptAbortedError)) throw error;
        log(
          `${styleText('yellow', '!')} Aborted: ${removed.length === 0 ? 'no v1 file removed' : `removed ${removed.map(relative).join(', ')}`}, the rest kept.`,
        );
        return 130;
      }
      const kept = unused.length - removed.length;
      log(
        `${removed.length} v1 file${removed.length === 1 ? '' : 's'} removed, ${kept} kept.`,
      );
    }
  }

  const baseUI =
    !project.hasDependency('@base-ui/react') &&
    results.some(({ result }) =>
      result.imports.some((change) =>
        change.to.some((to) => to.startsWith(`${PACKAGE}/primitives/base-ui/`)),
      ),
    );
  const missing = [
    ...(changedFiles > 0 && !project.hasPackage ? [PACKAGE, 'motion'] : []),
    ...(baseUI ? ['@base-ui/react'] : []),
  ];
  if (missing.length > 0) {
    log(
      `\n${styleText('yellow', '!')} ${missing[0]} isn't installed yet: ${project.install} ${missing.join(' ')}`,
    );
    if (baseUI)
      log(
        styleText(
          'dim',
          "    @base-ui/react is Base UI 1, which v2's Base UI primitives use (v1's were built on its beta, @base-ui-components/react).",
        ),
      );
  }

  return exitCode;
}
