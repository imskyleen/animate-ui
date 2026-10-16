import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'r');
mkdirSync(outDir, { recursive: true });

type Meta = { title: string; description: string };

let count = 0;
for (const category of ['backgrounds', 'buttons', 'components']) {
  const dir = path.join(root, 'registry', category);
  const names = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const name of names) {
    const itemDir = path.join(dir, name);
    const meta = JSON.parse(
      readFileSync(path.join(itemDir, 'meta.json'), 'utf8'),
    ) as Meta;
    const content = readFileSync(path.join(itemDir, 'index.tsx'), 'utf8');
    const packages = new Set(
      [...content.matchAll(/from '([^'.][^']*)'/g)]
        .map(([, source]) => source!.match(/^(@[^/]+\/[^/]+|[^/]+)/)![1]!)
        .filter((pkg) => pkg !== 'react' && pkg !== 'react-dom'),
    );
    if (packages.has('@animate-ui/react')) packages.add('motion');
    if (content.includes('@animate-ui/react/primitives/code-block'))
      packages.add('shiki');
    const dependencies = [...packages].sort();
    writeFileSync(
      path.join(outDir, `${category}-${name}.json`),
      JSON.stringify(
        {
          $schema: 'https://ui.shadcn.com/schema/registry-item.json',
          name: `${category}-${name}`,
          type: 'registry:ui',
          title: meta.title,
          description: meta.description,
          dependencies,
          files: [
            {
              path: `registry/${category}/${name}/index.tsx`,
              type: 'registry:ui',
              target: `@components/animate-ui/${category}/${name}.tsx`,
              content,
            },
          ],
        },
        null,
        2,
      ),
    );
  }

  count += names.length;
}

console.log(
  `${count} components → public/r/{backgrounds,buttons,components}-*.json`,
);
