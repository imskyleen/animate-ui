// Builds a registry item per docs demo, for "Open in v0":
// public/r/demo-<library>-<name>.json holds the demo and every local file it
// imports (shadcn/ui components animated by Animate UI, backgrounds…), at the
// paths they'd have in a shadcn/ui project.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const demosDir = path.join(root, 'demos');
const outDir = path.join(root, 'public', 'r');
mkdirSync(outDir, { recursive: true });

// This repo's paths → a shadcn/ui project's.
const toProject = (source: string) =>
  source
    .replace(/@\/components\/ui\/(?:base-ui|react-aria)\//g, '@/components/ui/')
    .replace(/@\/registry\//g, '@/components/animate-ui/');

const IGNORED = new Set(['react', 'react-dom', 'next']);

const PEERS: Record<string, string> = {
  'radix-ui': 'radix-ui',
  'base-ui': '@base-ui/react',
  'react-aria': 'react-aria-components',
};

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
          // @animate-ui/react's peers: Motion, and the primitive library.
          if (pkg === '@animate-ui/react') {
            dependencies.add('motion');
            const library = specifier!.match(
              /primitives\/(radix-ui|base-ui|react-aria)/,
            )?.[1];
            if (library) dependencies.add(PEERS[library]!);
          }
        }
      }
      const relative = path.relative(root, absolute);
      files.push({
        path: relative,
        type: isDemo ? 'registry:component' : 'registry:ui',
        target: isDemo
          ? `components/${name}-demo.tsx`
          : toProject(`@/${relative}`).slice(2),
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
