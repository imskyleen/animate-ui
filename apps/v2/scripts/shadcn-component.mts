import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string' },
    raw: { type: 'boolean', default: false },
    style: { type: 'string', default: 'nova' },
  },
});
const [dir, base, component] = positionals;
if (!dir || !base || !component) {
  console.error(
    'Usage: shadcn-component.mts <shadcn-dir> <radix|base|aria> <component> [--style <name>] [--out <file>] [--raw]',
  );
  process.exit(1);
}

const css = readFileSync(path.join(dir, `style-${values.style}.css`), 'utf8');
const rules = new Map<string, string>();
for (const [, name, classes] of css.matchAll(
  /\.(cn-[\w-]+)\s*\{\s*@apply\s+([^;}]+)/g,
))
  rules.set(name!, classes!.trim());

let code = readFileSync(path.join(dir, base, `${component}.tsx`), 'utf8');

code = code.replace(
  /(["'`])([^"'`\n]*\bcn-[^"'`\n]*)\1/g,
  (_, quote: string, value: string) => {
    const tokens = value
      .split(/\s+/)
      .flatMap((token) =>
        token.startsWith('cn-') ? (rules.get(token) ?? '') : token,
      )
      .filter(Boolean);
    return `${quote}${tokens.join(' ')}${quote}`;
  },
);

const icons = new Set<string>();
code = code.replace(/<IconPlaceholder([\s\S]*?)\/>/g, (_, attrs: string) => {
  const icon = attrs.match(/hugeicons="([^"]+)"/)?.[1];
  if (!icon)
    throw new Error(`IconPlaceholder without hugeicons in ${component}`);
  icons.add(icon);
  const rest = attrs.replace(
    /\s*(lucide|tabler|hugeicons|phosphor|remixicon)="[^"]*"/g,
    '',
  );
  const stroke = /strokeWidth=/.test(rest) ? '' : ' strokeWidth={2}';
  return `<HugeiconsIcon icon={${icon}}${stroke}${rest}/>`;
});
code = code.replace(
  /import \{ IconPlaceholder \} from "[^"]+"\n/,
  icons.size
    ? `import { ${[...icons].sort().join(', ')} } from "@hugeicons/core-free-icons"\nimport { HugeiconsIcon } from "@hugeicons/react"\n`
    : '',
);

const LIBRARY_FOLDERS: Record<string, string> = {
  base: 'base-ui/',
  aria: 'react-aria/',
};
const folder =
  (LIBRARY_FOLDERS[base] ?? '') +
  (values.style === 'nova' ? '' : `${values.style}/`);
code = code.replace(
  /@\/registry\/bases\/[\w-]+\/ui\//g,
  `@/components/ui/${folder}`,
);

if (!values.raw) {
  const project = mkdtempSync(path.join(tmpdir(), 'animate-ui-demo-'));
  writeFileSync(
    path.join(project, 'components.json'),
    JSON.stringify({ aliases: { ui: '@/components/ui' } }),
  );
  writeFileSync(
    path.join(project, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } }),
  );
  writeFileSync(
    path.join(project, 'package.json'),
    '{"dependencies":{"@animate-ui/react":"*"}}',
  );
  mkdirSync(path.join(project, 'components', 'ui'), { recursive: true });
  const file = path.join(project, 'components', 'ui', `${component}.tsx`);
  writeFileSync(file, code);
  const cli = path.join(
    import.meta.dirname,
    '..',
    '..',
    '..',
    'packages',
    'cli',
  );
  execFileSync(
    'pnpm',
    ['exec', 'tsx', 'src/index.ts', 'animate', component, '--cwd', project],
    {
      cwd: cli,
      stdio: ['ignore', 'ignore', 'inherit'],
    },
  );
  code = readFileSync(file, 'utf8');
}

if (values.out) writeFileSync(values.out, code);
else process.stdout.write(code);
