import { existsSync } from 'node:fs';
import path from 'node:path';

import { readJson, readPathConfig, resolveWithConfig } from './tsconfig';

export type Project = {
  root: string;
  uiDir: string;
  hasPackage: boolean;
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

export function loadProject(cwd: string): Project {
  const root = path.resolve(cwd);
  const configFile = path.join(root, 'components.json');
  if (!existsSync(configFile)) {
    throw new Error(
      `No components.json in ${root}. Run this in a shadcn/ui project (or pass --cwd).`,
    );
  }
  const aliases = readJson(configFile).aliases ?? {};
  const uiAlias: string =
    aliases.ui ?? `${aliases.components ?? '@/components'}/ui`;

  const pkgFile = path.join(root, 'package.json');
  const pkg = existsSync(pkgFile) ? readJson(pkgFile) : {};
  const hasPackage =
    Boolean(
      pkg.dependencies?.['@animate-ui/react'] ??
      pkg.devDependencies?.['@animate-ui/react'] ??
      pkg.peerDependencies?.['@animate-ui/react'],
    ) || installedAbove(root, '@animate-ui/react');

  return {
    root,
    uiDir: resolveAlias(root, uiAlias),
    hasPackage,
    ...packageManager(root),
  };
}
