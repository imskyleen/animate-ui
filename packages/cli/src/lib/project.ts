import { existsSync } from 'node:fs';
import path from 'node:path';

import { readJson, readPathConfig, resolveWithConfig } from './tsconfig';

export type Project = {
  root: string;
  uiDir: string;
  hasPackage: boolean;
};

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
  const hasPackage = Boolean(
    pkg.dependencies?.['@animate-ui/react'] ??
    pkg.devDependencies?.['@animate-ui/react'],
  );

  return { root, uiDir: resolveAlias(root, uiAlias), hasPackage };
}
