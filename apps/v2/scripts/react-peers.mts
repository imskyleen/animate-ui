import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const packageDir = path.join(
  import.meta.dirname,
  '..',
  '..',
  '..',
  'packages',
  'react',
);
const sourceDir = path.join(packageDir, 'src');
const peers = new Set(
  Object.keys(
    JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8'))
      .peerDependencies ?? {},
  ),
);
peers.delete('react');
peers.delete('react-dom');

const packageName = (specifier: string) =>
  specifier.match(/^(@[^/]+\/[^/]+|[^/]+)/)![1]!;

function resolveFile(base: string) {
  for (const candidate of [
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, 'index.tsx'),
    path.join(base, 'index.ts'),
  ])
    if (existsSync(candidate)) return candidate;
  return undefined;
}

const cache = new Map<string, Set<string>>();

export function peersOf(specifier: string) {
  if (!specifier.startsWith('@animate-ui/react/')) return new Set<string>();
  const entry = resolveFile(
    path.join(sourceDir, specifier.slice('@animate-ui/react/'.length)),
  );
  if (!entry) return new Set<string>();
  const cached = cache.get(entry);
  if (cached) return cached;
  const found = new Set<string>();
  const seen = new Set<string>();
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    for (const [, from] of source.matchAll(
      /(?:(?:^|\n)\s*(?:import|export)(?!\s+type\b)[^'"]*?from\s+|\bimport\(\s*)["']([^"']+)["']/g,
    )) {
      if (from!.startsWith('.')) {
        const next = resolveFile(path.resolve(path.dirname(file), from!));
        if (next) visit(next);
      } else if (peers.has(packageName(from!))) found.add(packageName(from!));
    }
  };
  visit(entry);
  cache.set(entry, found);
  return found;
}
