import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const outDir = path.join(import.meta.dirname, '..', 'public', 'r');

const items = readdirSync(outDir)
  .filter((file) =>
    /^(icons|backgrounds|buttons|components)-.+\.json$/.test(file),
  )
  .sort()
  .map((file) => {
    const { name, type, title, description } = JSON.parse(
      readFileSync(path.join(outDir, file), 'utf8'),
    );
    return { name, type, title, description };
  });

writeFileSync(
  path.join(outDir, 'registry.json'),
  JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      name: 'animate-ui',
      homepage: 'https://animate-ui.com',
      items,
    },
    null,
    2,
  ),
);

console.log(`${items.length} items → public/r/registry.json`);
