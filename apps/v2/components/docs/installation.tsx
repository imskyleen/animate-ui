import { Step, Steps } from 'fumadocs-ui/components/steps';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { LibraryId } from '@/lib/libraries';

import { ServerCodeBlock } from './server-codeblock';
import { CodeTabs, DocsTabs } from './tabs';

export const MANAGERS = {
  pnpm: { add: 'pnpm add', dlx: 'pnpm dlx' },
  npm: { add: 'npm install', dlx: 'npx' },
  yarn: { add: 'yarn add', dlx: 'yarn dlx' },
  bun: { add: 'bun add', dlx: 'bunx --bun' },
} as const;

type Manager = keyof typeof MANAGERS;

export async function Command({
  command,
}: {
  command: (manager: (typeof MANAGERS)[Manager]) => string;
}) {
  const managers = Object.keys(MANAGERS) as Manager[];
  return (
    <CodeTabs
      groupId="package-manager"
      persist
      tabs={managers.map((manager) => ({
        value: manager,
        label: manager,
        content: (
          <ServerCodeBlock code={command(MANAGERS[manager])} lang="bash" />
        ),
      }))}
    />
  );
}

const PRIMITIVES = '@animate-ui/react/primitives/';

/**
 * The package an Animate UI primitive's module stands in for, and the module
 * the CLI writes for it (shadcn/ui's Radix Drawer imports Vaul, whose
 * replacement is Radix UI's drawer).
 */
function swap(module: string, names: string[]) {
  const [library, ...rest] = module.slice(PRIMITIVES.length).split('/');
  const sub = rest.join('/');
  if (library === 'radix-ui' && (sub === 'drawer' || names.includes('Drawer')))
    return { from: 'vaul', to: `${PRIMITIVES}radix-ui/drawer` };
  const from =
    library === 'radix-ui'
      ? sub
        ? `@radix-ui/react-${sub}`
        : 'radix-ui'
      : library === 'base-ui'
        ? sub
          ? `@base-ui/react/${sub}`
          : '@base-ui/react'
        : library === 'react-aria'
          ? 'react-aria-components'
          : // Animate UI's own drop-ins (`input-otp`) stand in for the package.
            library!;
  return { from, to: module };
}

/** Prettier's line length, which shadcn/ui's components are printed with. */
const PRINT_WIDTH = 80;

/**
 * The imports to swap, as a diff: those of the shadcn/ui component (the
 * page's demo, before its demo function), from the library and from Animate
 * UI, as the CLI swaps them: value imports only, each with the names the
 * component uses. A multi-line import only changes its last line.
 */
async function ImportDiff({
  library,
  name,
}: {
  library: LibraryId;
  name: string;
}) {
  const demo = await readFile(
    path.join(process.cwd(), 'demos', library, `${name}.tsx`),
    'utf8',
  ).catch(() => '');
  // The component: up to its exports, before the demo.
  const component = demo.split(/^export\s+(?:\{|default\s|const\s)/m)[0]!;
  const statements = [
    ...component.matchAll(
      // One statement: its clause never runs into the next `import`.
      /^import\s+((?:(?!\nimport\s)[\s\S])*?)\s+from\s+["']([^"']+)["'];?$/gm,
    ),
  ];
  const body = statements.reduce(
    (code, [statement]) => code.replace(statement, ''),
    component,
  );
  const uses = (local: string) =>
    new RegExp(`(?<![\\w$.])${local.replace(/\$/g, '\\$')}(?![\\w$])`).test(
      body,
    );

  const lines: string[] = [];
  let diff = '';
  for (const [, clause, module] of statements) {
    // Type-only imports stay: the CLI leaves them alone.
    if (!module!.startsWith(PRIMITIVES) || /^type\s/.test(clause!)) continue;
    const named = /^\{([\s\S]*)\}$/.exec(clause!.trim());
    let specifiers: string[] = [];
    if (named) {
      specifiers = named[1]!
        .split(',')
        .map((specifier) => specifier.trim())
        .filter(
          (specifier) =>
            specifier &&
            uses(
              specifier
                .split(/\s+as\s+/)
                .pop()!
                .trim(),
            ),
        );
      if (!specifiers.length) continue;
    }
    const imported = specifiers.map(
      (specifier) => specifier.replace(/^type\s+/, '').split(/\s+/)[0]!,
    );
    const { from, to } = swap(module!, imported);
    const single = named
      ? `import { ${specifiers.join(', ')} }`
      : `import ${clause!.trim()}`;
    if (!named || `${single} from '${from}';`.length <= PRINT_WIDTH) {
      lines.push(`${single} from '${from}';`, `${single} from '${to}';`);
      diff += '-+';
      continue;
    }
    lines.push(
      'import {',
      ...specifiers.map((specifier) => `  ${specifier},`),
      `} from '${from}';`,
      `} from '${to}';`,
    );
    diff += ' '.repeat(specifiers.length + 1) + '-+';
  }
  if (!lines.length) return null;
  return <ServerCodeBlock code={lines.join('\n')} lang="tsx" diff={diff} />;
}

/**
 * Two paths. CLI: packages, the shadcn/ui component, then the CLI animates
 * it. Manual (built on the library directly): the package, then swap the
 * import. Without `name` (Animate UI's own primitives), the package is all
 * it takes.
 */
export function Installation({
  name,
  library,
}: {
  name?: string;
  /** The page's library (its demo shows the imports to swap). */
  library?: LibraryId;
}) {
  if (!name) {
    return <Command command={(m) => `${m.add} @animate-ui/react motion`} />;
  }

  return (
    <DocsTabs
      groupId="installation"
      persist
      lazy
      label="Installation"
      tabs={[
        {
          value: 'cli',
          label: 'CLI',
          content: (
            <Steps>
              <Step>
                <h3>Install the packages</h3>
                <Command command={(m) => `${m.add} @animate-ui/react motion`} />
              </Step>
              <Step>
                <h3>Add the shadcn/ui component</h3>
                <Command
                  command={(m) => `${m.dlx} shadcn@latest add ${name}`}
                />
              </Step>
              <Step>
                <h3>Animate it</h3>
                <p>
                  The CLI finds your shadcn/ui components through{' '}
                  <code>components.json</code>, swaps their primitive imports
                  for Animate UI&apos;s and removes the CSS animation classes
                  Motion replaces.
                </p>
                <Command
                  command={(m) =>
                    `${m.dlx} @animate-ui/cli@latest animate ${name}`
                  }
                />
              </Step>
            </Steps>
          ),
        },
        {
          value: 'manual',
          label: 'Manual',
          content: (
            <Steps>
              <Step>
                <h3>Install the packages</h3>
                <Command command={(m) => `${m.add} @animate-ui/react motion`} />
              </Step>
              <Step>
                <h3>Swap the import</h3>
                {library && <ImportDiff library={library} name={name} />}
                {library !== 'animate-ui' && (
                  <p>
                    Then delete the component&apos;s CSS animation classes, if
                    it has any (<code>animate-in</code>, <code>fade-in-0</code>,{' '}
                    <code>zoom-in-95</code>, <code>animate-accordion-down</code>
                    …), and the transitions that came with them: Motion animates
                    it now.
                  </p>
                )}
              </Step>
            </Steps>
          ),
        },
      ]}
    />
  );
}
