// Writes Animate UI's Vue registry (public/r/vue/<name>.json), for
// `shadcn-vue add <url>`: each file lands under the project's components
// alias, at the path after `components/`.
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'r', 'vue');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

type Meta = { title: string; description: string; keywords?: string[] };

function write(
  name: string,
  meta: Meta,
  dependencies: string[],
  files: { content: string; path: string }[],
) {
  writeFileSync(
    path.join(outDir, `${name}.json`),
    `${JSON.stringify(
      {
        $schema: 'https://shadcn-vue.com/schema/registry-item.json',
        name,
        type: 'registry:component',
        title: meta.title,
        description: meta.description,
        dependencies,
        files: files.map((file) => ({ ...file, type: 'registry:component' })),
        ...(meta.keywords && { meta: { keywords: meta.keywords } }),
      },
      null,
      2,
    )}\n`,
  );
}

let count = 0;
for (const [library, prefix, target] of [
  ['icons', 'icons-lucide', 'components/animate-ui/icons'],
  ['hugeicons', 'icons-hugeicons', 'components/animate-ui/icons/hugeicons'],
] as const) {
  const dir = path.join(root, 'registry', 'vue', library);
  for (const name of readdirSync(dir).sort()) {
    const files = readdirSync(path.join(dir, name));
    const vue = files.find((file) => file.endsWith('.vue'))!;
    const meta = JSON.parse(
      readFileSync(path.join(dir, name, 'meta.json'), 'utf8'),
    ) as Meta;
    write(
      `${prefix}-${name}`,
      meta,
      ['@animate-ui/vue', 'motion-v'],
      [
        {
          path: `${target}/${vue}`,
          content: readFileSync(path.join(dir, name, vue), 'utf8'),
        },
      ],
    );
    count++;
  }
}

// Registry files import shadcn-vue's own `cn`.
const toRegistry = (source: string) =>
  source.replace(/from 'cn'/g, "from '@/lib/utils'");

const backgrounds = path.join(root, 'registry', 'vue', 'backgrounds');
for (const name of readdirSync(backgrounds).sort()) {
  const dir = path.join(backgrounds, name);
  const files = readdirSync(dir).filter((file) => file !== 'meta.json');
  const sources = files.map((file) =>
    readFileSync(path.join(dir, file), 'utf8'),
  );
  const imports = sources.join('\n');
  write(
    `backgrounds-${name}`,
    JSON.parse(readFileSync(path.join(dir, 'meta.json'), 'utf8')) as Meta,
    [
      'motion-v',
      ...(imports.includes('@animate-ui/vue') ? ['@animate-ui/vue'] : []),
    ],
    files.map((file, index) => ({
      path: `components/animate-ui/backgrounds/${name}/${file}`,
      content: toRegistry(sources[index]!),
    })),
  );
  count++;
}

console.log(`Vue registry: ${count}`);
