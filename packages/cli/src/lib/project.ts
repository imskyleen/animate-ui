import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  parseJsonc,
  readJson,
  readPathConfig,
  resolveWithConfig,
} from './tsconfig';

export type Project = {
  root: string;
  framework: 'react' | 'vue';
  uiDir: string;
  hasPackage: boolean;
  tailwind?: 3 | 4;
  install: string;
  dlx: string;
};

const PACKAGE_MANAGERS: [string, string, string][] = [
  ['pnpm-lock.yaml', 'pnpm add', 'pnpm dlx'],
  ['bun.lock', 'bun add', 'bun x'],
  ['bun.lockb', 'bun add', 'bun x'],
  ['yarn.lock', 'yarn add', 'yarn'],
  ['package-lock.json', 'npm install', 'npx'],
];

function installedAbove(root: string, name: string) {
  for (let dir = root; ;) {
    if (existsSync(path.join(dir, 'node_modules', name, 'package.json')))
      return true;
    const parent = path.dirname(dir);
    if (parent === dir) return false;
    dir = parent;
  }
}

function packageManager(root: string) {
  for (let dir = root; ;) {
    for (const [lockfile, install, dlx] of PACKAGE_MANAGERS)
      if (existsSync(path.join(dir, lockfile))) return { install, dlx };
    const parent = path.dirname(dir);
    if (parent === dir) return { install: 'npm install', dlx: 'npx' };
    dir = parent;
  }
}

function resolveAlias(root: string, alias: string) {
  return (
    resolveWithConfig(readPathConfig(root), alias) ??
    path.join(root, alias.replace(/^[@~]\//, ''))
  );
}

type Manifest = Record<string, Record<string, string> | undefined>;

function tailwindVersion(
  root: string,
  pkg: Manifest,
  components: { tailwind?: { config?: string } },
): 3 | 4 | undefined {
  const range =
    pkg.dependencies?.tailwindcss ?? pkg.devDependencies?.tailwindcss;
  const major = range?.match(/(\d+)/)?.[1];
  if (major === '3') return 3;
  if (major === '4') return 4;
  if (components.tailwind?.config) return 3;
  if (components.tailwind && components.tailwind.config === '') return 4;
  for (const extension of ['js', 'cjs', 'mjs', 'ts'])
    if (existsSync(path.join(root, `tailwind.config.${extension}`))) return 3;
  return undefined;
}

export function loadProject(cwd: string): Project {
  const root = path.resolve(cwd);
  const configFile = path.join(root, 'components.json');
  if (!existsSync(configFile)) {
    throw new Error(
      `No components.json in ${root}. Run this in a shadcn/ui project (or pass --cwd).`,
    );
  }
  let config: { $schema?: string; aliases?: Record<string, string> };
  try {
    config = parseJsonc(
      readFileSync(configFile, 'utf8').replace(/^\uFEFF/, ''),
    );
  } catch (error) {
    throw new Error(
      `components.json in ${root} isn't valid JSON${error instanceof Error ? `: ${error.message}` : ''}.`,
      { cause: error },
    );
  }
  const aliases = config.aliases ?? {};
  const uiAlias: string =
    aliases.ui ?? `${aliases.components ?? '@/components'}/ui`;

  const pkgFile = path.join(root, 'package.json');
  const pkg = existsSync(pkgFile) ? readJson(pkgFile) : {};
  const depends = (name: string) =>
    Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
  const framework =
    config.$schema?.includes('shadcn-vue') ||
    (!config.$schema && depends('vue') && !depends('react'))
      ? 'vue'
      : 'react';
  const animateUI =
    framework === 'vue' ? '@animate-ui/vue' : '@animate-ui/react';
  const hasPackage =
    Boolean(
      pkg.dependencies?.[animateUI] ??
      pkg.devDependencies?.[animateUI] ??
      pkg.peerDependencies?.[animateUI],
    ) || installedAbove(root, animateUI);

  return {
    root,
    framework,
    uiDir: resolveAlias(root, uiAlias),
    hasPackage,
    tailwind: tailwindVersion(root, pkg, readJson(configFile)),
    ...packageManager(root),
  };
}
