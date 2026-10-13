import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const backgroundsDir = path.join(root, 'registry', 'backgrounds');
const outDir = path.join(root, 'public', 'r');
mkdirSync(outDir, { recursive: true });

type Meta = { title: string; description: string };

const names = readdirSync(backgroundsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const name of names) {
  const dir = path.join(backgroundsDir, name);
  const meta = JSON.parse(
    readFileSync(path.join(dir, 'meta.json'), 'utf8'),
  ) as Meta;
  const content = readFileSync(path.join(dir, 'index.tsx'), 'utf8');
  const dependencies = [
    ...new Set(
      [...content.matchAll(/from '([^'.][^']*)'/g)]
        .map(([, source]) => source!.match(/^(@[^/]+\/[^/]+|[^/]+)/)![1]!)
        .filter((pkg) => pkg !== 'react' && pkg !== 'react-dom'),
    ),
  ].sort();
  writeFileSync(
    path.join(outDir, `backgrounds-${name}.json`),
    JSON.stringify(
      {
        $schema: 'https://ui.shadcn.com/schema/registry-item.json',
        name: `backgrounds-${name}`,
        type: 'registry:ui',
        title: meta.title,
        description: meta.description,
        dependencies,
        files: [
          {
            path: `registry/backgrounds/${name}/index.tsx`,
            type: 'registry:ui',
            target: `@components/animate-ui/backgrounds/${name}.tsx`,
            content,
          },
        ],
      },
      null,
      2,
    ),
  );
}

console.log(`${names.length} backgrounds → public/r/backgrounds-*.json`);
