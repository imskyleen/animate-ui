import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { expect, test } from '../test';

const OUT = join(__dirname, '../../public/r');
const SHADCN_REGISTRY = join(
  realpathSync(join(__dirname, '../../node_modules/shadcn')),
  '../@shadcn/registry/dist',
);
const load = (file: string) =>
  import(pathToFileURL(join(SHADCN_REGISTRY, file)).href);

const CWD = '/project';
const config = (registries: Record<string, string> = {}) => ({
  style: 'new-york',
  tailwind: { config: '', css: 'src/app.css', baseColor: 'neutral' },
  rsc: true,
  tsx: true,
  aliases: {
    components: '~/kit',
    ui: '~/kit/base',
    lib: '~/helpers',
    hooks: '~/use',
    utils: '~/helpers/utils',
  },
  registries,
  resolvedPaths: {
    cwd: CWD,
    tailwindConfig: '',
    tailwindCss: `${CWD}/src/app.css`,
    components: `${CWD}/src/kit`,
    ui: `${CWD}/src/kit/base`,
    lib: `${CWD}/src/helpers`,
    hooks: `${CWD}/src/use`,
    utils: `${CWD}/src/helpers/utils`,
  },
});

test('every registry file lands where components.json points', async () => {
  const { resolveFilePath } = await load('utils/updaters/update-files.js');
  const roots = Object.values(config().resolvedPaths).filter(
    (dir) => dir.startsWith(`${CWD}/src/`) && !dir.endsWith('.css'),
  );
  const stray: string[] = [];
  for (const file of readdirSync(OUT)) {
    if (file === 'registry.json' || !file.endsWith('.json')) continue;
    const item = JSON.parse(readFileSync(join(OUT, file), 'utf8'));
    for (const entry of item.files ?? []) {
      const target = resolveFilePath(entry, config(), { isSrcDir: true });
      if (!roots.some((root) => target.startsWith(`${root}/`)))
        stray.push(`${item.name}: ${target}`);
    }
  }
  expect(stray).toEqual([]);
});

test('a demo that imports another demo installs it as a demo, and imports it there', () => {
  for (const library of ['base-ui', 'radix-ui', 'react-aria']) {
    const item = JSON.parse(
      readFileSync(join(OUT, `demo-${library}-questionnaire.json`), 'utf8'),
    );
    const targets = item.files.map((file: { target: string }) => file.target);
    expect(targets).toContain('@components/toast-demo.tsx');
    const demo = item.files.find(
      (file: { target: string }) =>
        file.target === '@components/questionnaire-demo.tsx',
    );
    expect(demo.content).toContain('from "@/components/toast-demo"');
    expect(demo.content).not.toContain('@/demos/');
  }
});

test('the shadcn MCP finds items in the @animate-ui registry', async ({
  baseURL,
}) => {
  const { searchRegistries } = await load('registry/index.js');
  const result = await searchRegistries(['@animate-ui'], {
    query: 'bell',
    config: config({
      '@animate-ui': `${baseURL}/r/{name}.json`,
    }),
  });
  expect(result.items.map((item: { name: string }) => item.name)).toContain(
    'icons-lucide-bell',
  );
});

test('the shadcn MCP finds the styled buttons in the @animate-ui registry', async ({
  baseURL,
}) => {
  const { searchRegistries } = await load('registry/index.js');
  const result = await searchRegistries(['@animate-ui'], {
    query: 'liquid',
    config: config({
      '@animate-ui': `${baseURL}/r/{name}.json`,
    }),
  });
  expect(result.items.map((item: { name: string }) => item.name)).toContain(
    'buttons-liquid',
  );
});

test('the manual steps show the file path a default project gets', async ({
  page,
}) => {
  await page.goto('/docs/backgrounds/bubble', { waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: 'Manual' }).first().click();
  await expect(
    page.locator('code', {
      hasText: /^components\/animate-ui\/backgrounds\/bubble\.tsx$/,
    }),
  ).toBeAttached();
});

test('no registry component shadows a global name', () => {
  const shadowing: string[] = [];
  for (const library of [
    'icons',
    'hugeicons',
    'backgrounds',
    'buttons',
    'components',
  ]) {
    const dir = join(__dirname, '../../registry', library);
    for (const name of readdirSync(dir)) {
      const file = join(dir, name, 'index.tsx');
      if (!existsSync(file)) continue;
      const source = readFileSync(file, 'utf8');
      if (/\bfunction (Infinity|NaN|undefined|eval|arguments)\b/.test(source))
        shadowing.push(`${library}/${name}`);
    }
  }
  expect(shadowing).toEqual([]);
});

test('the styled buttons and code block are registry files, not package exports', () => {
  const PACKAGE = join(__dirname, '../../../../packages/react/src/primitives');
  for (const name of ['liquid', 'flip', 'github-stars', 'theme-toggler']) {
    const item = JSON.parse(
      readFileSync(join(OUT, `buttons-${name}.json`), 'utf8'),
    ) as {
      dependencies: string[];
      files: { target: string; content: string }[];
    };
    expect(item.files[0]!.target).toBe(
      `@components/animate-ui/buttons/${name}.tsx`,
    );
    expect(item.dependencies).toContain('@animate-ui/react');
    expect(item.files[0]!.content).not.toMatch(/from '\.\.?\//);
    expect(existsSync(join(PACKAGE, 'buttons', name))).toBe(false);
  }
  const block = JSON.parse(
    readFileSync(join(OUT, 'components-code-block.json'), 'utf8'),
  ) as { dependencies: string[]; files: { target: string }[] };
  expect(block.files[0]!.target).toBe(
    '@components/animate-ui/components/code-block.tsx',
  );
  expect(block.dependencies).toContain('shiki');
  expect(existsSync(join(PACKAGE, 'code-block'))).toBe(true);
});

test('a demo built on a primitive that uses another one declares that one’s peers too', () => {
  const item = JSON.parse(
    readFileSync(join(OUT, 'demo-animate-ui-avatar-group.json'), 'utf8'),
  ) as { dependencies: string[] };
  expect(item.dependencies).toContain('@floating-ui/react');
});

test('registry.json lists every item but the demos', () => {
  const listed = (
    JSON.parse(readFileSync(join(OUT, 'registry.json'), 'utf8')) as {
      items: { name: string }[];
    }
  ).items
    .map((item) => item.name)
    .sort();
  const files = readdirSync(OUT)
    .filter(
      (file) =>
        file.endsWith('.json') &&
        file !== 'registry.json' &&
        !file.startsWith('demo-'),
    )
    .map((file) => file.replace(/\.json$/, ''))
    .sort();
  expect(listed).toEqual(files);
});
