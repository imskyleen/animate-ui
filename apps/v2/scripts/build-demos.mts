import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import { peersOf } from './react-peers.mts';

const root = path.join(import.meta.dirname, '..');
const demosDir = path.join(root, 'demos');
const outDir = path.join(root, 'public', 'r');
mkdirSync(outDir, { recursive: true });

const toProject = (source: string) =>
  source
    .replace(
      /@\/components\/ui\/(?:base-ui|react-aria)\/(?:rhea\/)?/g,
      '@/components/ui/',
    )
    .replace(/@\/registry\//g, '@/components/animate-ui/')
    .replace(/@\/demos\/[\w-]+\/([\w-]+)/g, '@/components/$1-demo');

const toAlias = (target: string) =>
  target
    .replace(/^components\/ui\//, '@ui/')
    .replace(/^(components|hooks|lib)\//, '@$1/');

const IGNORED = new Set(['react', 'react-dom', 'next']);

function resolveLocal(specifier: string) {
  const base = path.join(root, specifier.slice(2));
  for (const candidate of [
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, 'index.tsx'),
    path.join(base, 'index.ts'),
  ])
    if (existsSync(candidate)) return candidate;
  return undefined;
}

let count = 0;
for (const library of readdirSync(demosDir)) {
  for (const file of readdirSync(path.join(demosDir, library))) {
    if (!file.endsWith('.tsx')) continue;
    const name = file.replace(/\.tsx$/, '');
    const files: {
      path: string;
      type: string;
      target: string;
      content: string;
    }[] = [];
    const dependencies = new Set<string>();
    const seen = new Set<string>();
    const visit = (absolute: string, isDemo: boolean) => {
      if (seen.has(absolute)) return;
      seen.add(absolute);
      const source = readFileSync(absolute, 'utf8');
      for (const [, specifier] of source.matchAll(/from\s+["']([^"']+)["']/g)) {
        if (specifier!.startsWith('@/')) {
          const local = resolveLocal(specifier!);
          if (local) visit(local, false);
        } else if (!specifier!.startsWith('.')) {
          const pkg = specifier!.match(/^(@[^/]+\/[^/]+|[^/]+)/)![1]!;
          if (!IGNORED.has(pkg)) dependencies.add(pkg);
          if (pkg === '@animate-ui/react') {
            dependencies.add('motion');
            for (const peer of peersOf(specifier!)) dependencies.add(peer);
          }
        }
      }
      const relative = path.relative(root, absolute);
      files.push({
        path: relative,
        type:
          isDemo || relative.startsWith('demos/')
            ? 'registry:component'
            : relative.startsWith('hooks/')
              ? 'registry:hook'
              : 'registry:ui',
        target: toAlias(
          isDemo
            ? `components/${name}-demo.tsx`
            : toProject(`@/${relative}`)
                .slice(2)
                .replace(
                  /^(components\/animate-ui\/[\w-]+\/[\w-]+)\/index\.tsx$/,
                  '$1.tsx',
                ),
        ),
        content: toProject(source),
      });
    };
    visit(path.join(demosDir, library, file), true);
    writeFileSync(
      path.join(outDir, `demo-${library}-${name}.json`),
      JSON.stringify(
        {
          $schema: 'https://ui.shadcn.com/schema/registry-item.json',
          name: `demo-${library}-${name}`,
          type: 'registry:component',
          dependencies: [...dependencies].sort(),
          files,
        },
        null,
        2,
      ),
    );
    count++;
  }
}

console.log(`${count} demos → public/r/demo-*.json`);
