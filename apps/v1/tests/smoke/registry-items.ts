import fs from 'node:fs';
import path from 'node:path';

// Reads item names from the generated registry index without importing it
// (the index is TSX with lazy React imports, not loadable from Node).
export function getRegistryItems(prefix: string): string[] {
  const source = fs.readFileSync(
    path.join(__dirname, '../../__registry__/index.tsx'),
    'utf8',
  );
  return [...source.matchAll(/^ {2}'([^']+)': \{/gm)]
    .map((match) => match[1]!)
    .filter((name) => name.startsWith(prefix));
}
