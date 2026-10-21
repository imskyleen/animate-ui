import { Step, Steps } from 'fumadocs-ui/components/steps';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import cssRemovals from '@/lib/css-removals.json';
import type { LibraryId } from '@/lib/libraries';

import {
  MANAGER_GROUP,
  MANAGER_NAMES,
  MANAGERS,
  type ManagerCommands,
} from './package-managers';
import { ServerCodeBlock } from './server-codeblock';
import { InstallTabs } from './install-tabs';
import { CodeTabs } from './tabs';

export { MANAGERS };

export async function Command({
  command,
}: {
  command: (manager: ManagerCommands) => string;
}) {
  return (
    <CodeTabs
      groupId={MANAGER_GROUP}
      persist
      tabs={MANAGER_NAMES.map((manager) => ({
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

const DROP_INS: Record<string, string> = {
  'input-otp': 'input-otp',
  questionnaire: '@shadcn/react/questionnaire',
};

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
          : (DROP_INS[library!] ?? library!);
  return { from, to: module };
}

const PRINT_WIDTH = 80;

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
  const component = demo.split(/^export\s+(?:\{|default\s|const\s)/m)[0]!;
  const statements = [
    ...component.matchAll(
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
    if (
      !named ||
      specifiers.length === 1 ||
      `${single} from '${from}';`.length <= PRINT_WIDTH
    ) {
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

const VUE_FIXTURES = path.join(
  process.cwd(),
  '../../packages/cli/test/fixtures-vue',
);
const VUE_MODULE = '@animate-ui/vue/primitives/reka-ui';

/** shadcn-vue's own files import reka-ui in each part: one statement per kind, values and types. */
async function VueImportDiff({ name }: { name: string }) {
  const dir = path.join(VUE_FIXTURES, name);
  const files = await readdir(dir).catch(() => [] as string[]);
  const values = new Set<string>();
  const types = new Set<string>();
  for (const file of files.filter((f) => f.endsWith('.vue')).sort()) {
    const code = await readFile(path.join(dir, file), 'utf8');
    for (const [, type, names] of code.matchAll(
      /^import\s+(type\s+)?\{([^}]*)\}\s+from\s+["']reka-ui["']/gm,
    ))
      for (const specifier of names!.split(','))
        if (specifier.trim()) (type ? types : values).add(specifier.trim());
  }
  const lines: string[] = [];
  let diff = '';
  for (const [kind, names] of [
    ['import type', types],
    ['import', values],
  ] as const) {
    if (!names.size) continue;
    const clause = `${kind} { ${[...names].sort().join(', ')} }`;
    if (`${clause} from 'reka-ui'`.length <= PRINT_WIDTH) {
      lines.push(`${clause} from 'reka-ui'`, `${clause} from '${VUE_MODULE}'`);
      diff += '-+';
      continue;
    }
    lines.push(
      `${kind} {`,
      ...[...names].sort().map((specifier) => `  ${specifier},`),
      `} from 'reka-ui'`,
      `} from '${VUE_MODULE}'`,
    );
    diff += ' '.repeat(names.size + 1) + '-+';
  }
  if (!lines.length) return null;
  return <ServerCodeBlock code={lines.join('\n')} lang="ts" diff={diff} />;
}

type CssRemoval = { part: string; removed: string[]; added: string[] };

const CSS_REMOVALS: Record<string, Record<string, CssRemoval[]>> = cssRemovals;

async function CssRemovals({ parts }: { parts: CssRemoval[] }) {
  const lines: string[] = [];
  let diff = '';
  parts.forEach((part, index) => {
    if (index) {
      lines.push('');
      diff += ' ';
    }
    lines.push(
      part.part,
      ...part.removed.map((name) => `  ${name}`),
      ...part.added.map((name) => `  ${name}`),
    );
    diff +=
      ' ' + '-'.repeat(part.removed.length) + '+'.repeat(part.added.length);
  });
  return (
    <div data-slot="css-removals">
      <ServerCodeBlock code={lines.join('\n')} lang="txt" diff={diff} />
    </div>
  );
}

function RemoveCss({ library, name }: { library?: LibraryId; name: string }) {
  if (library === 'animate-ui' || Object.hasOwn(DROP_INS, name)) return null;
  const parts = library ? CSS_REMOVALS[library]?.[name] : undefined;
  if (!parts)
    return (
      <Step>
        <h3>Remove the CSS animations</h3>
        <p>
          Delete the component&apos;s CSS animation classes, if it has any (
          <code>animate-in</code>, <code>fade-in-0</code>,{' '}
          <code>zoom-in-95</code>, <code>animate-accordion-down</code>…), and
          the transitions that came with them: Motion animates it now.
        </p>
      </Step>
    );
  return (
    <Step>
      <h3>Remove the CSS animations</h3>
      {parts.length ? (
        <>
          <p>
            Motion animates these parts now: delete their CSS animation classes,
            and the transitions that came with them.
          </p>
          <CssRemovals parts={parts} />
          <p className="text-sm text-muted-foreground">
            {library === 'reka-ui'
              ? 'As in shadcn-vue’s New York style.'
              : 'As in shadcn/ui’s Vega style. The other styles use the same classes, sometimes with other values.'}
          </p>
        </>
      ) : (
        <p>
          Nothing to remove: this component has no CSS animation, Motion
          animates it as it is.
        </p>
      )}
    </Step>
  );
}

export function Installation({
  name,
  library,
}: {
  name?: string;
  library?: LibraryId;
}) {
  const vue = library === 'reka-ui';
  const packages = vue
    ? '@animate-ui/vue motion-v'
    : '@animate-ui/react motion';
  const shadcn = vue ? 'shadcn-vue' : 'shadcn';
  const kit = vue ? 'shadcn-vue' : 'shadcn/ui';

  if (!name) {
    return <Command command={(m) => `${m.add} ${packages}`} />;
  }

  return (
    <InstallTabs
      groupId="installation"
      tabs={[
        {
          value: 'cli',
          label: 'CLI',
          content: (
            <Steps>
              <Step>
                <h3>Install the packages</h3>
                <Command command={(m) => `${m.add} ${packages}`} />
              </Step>
              <Step>
                <h3>Add the {kit} component</h3>
                <Command
                  command={(m) => `${m.dlx} ${shadcn}@latest add ${name}`}
                />
              </Step>
              <Step>
                <h3>Animate it</h3>
                <p>
                  The CLI finds your {kit} components through{' '}
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
                <Command command={(m) => `${m.add} ${packages}`} />
              </Step>
              <Step>
                <h3>Swap the import</h3>
                {vue ? (
                  <VueImportDiff name={name} />
                ) : (
                  library && <ImportDiff library={library} name={name} />
                )}
              </Step>
              <RemoveCss library={library} name={name} />
            </Steps>
          ),
        },
      ]}
    />
  );
}
