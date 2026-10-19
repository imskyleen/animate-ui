import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { peersOf } from './react-peers.mts';

const root = path.join(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'r');
mkdirSync(outDir, { recursive: true });

type Meta = {
  title: string;
  description: string;
  from?: string;
  target?: string;
  replace?: [string, string][];
};

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
    const content = (meta.replace ?? []).reduce(
      (source, [search, value]) => {
        if (!source.includes(search))
          throw new Error(`${name}: "${search}" not found in ${meta.from}`);
        return source.replaceAll(search, value);
      },
      readFileSync(path.join(dir, meta.from ?? name, 'index.tsx'), 'utf8'),
    );
    const specifiers = [
      ...content.matchAll(
        /(?:from\s+|import\s+|import\(\s*)["']([^"'.][^"']*)["']/g,
      ),
    ].map(([, source]) => source!);
    const packages = new Set(
      specifiers
        .map((source) => source.match(/^(@[^/]+\/[^/]+|[^/]+)/)![1]!)
        .filter((pkg) => pkg !== 'react' && pkg !== 'react-dom'),
    );
    if (packages.has('@animate-ui/react')) packages.add('motion');
    for (const specifier of specifiers)
      for (const peer of peersOf(specifier)) packages.add(peer);
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
              target: `@components/animate-ui/${category}/${meta.target ?? meta.from ?? name}.tsx`,
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
