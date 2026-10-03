import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type Project = {
  root: string;
  /** Directory of the shadcn/ui components (components.json `aliases.ui`). */
  uiDir: string;
  hasPackage: boolean;
};

/** Parses JSON with comments and trailing commas (tsconfig files). */
function parseJsonc(text: string) {
  const withoutComments = text.replace(
    /("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
    (match, string: string | undefined) => string ?? '',
  );
  return JSON.parse(withoutComments.replace(/,(\s*[}\]])/g, '$1'));
}

function readJson(file: string) {
  return parseJsonc(readFileSync(file, 'utf8'));
}

/** Resolves an import alias (`@/components/ui`) with the tsconfig paths. */
function resolveAlias(root: string, alias: string) {
  for (const name of ['tsconfig.json', 'tsconfig.app.json', 'jsconfig.json']) {
    const file = path.join(root, name);
    if (!existsSync(file)) continue;
    const options = readJson(file).compilerOptions ?? {};
    const baseUrl = path.join(root, options.baseUrl ?? '.');
    for (const [pattern, targets] of Object.entries<string[]>(
      options.paths ?? {},
    )) {
      const prefix = pattern.replace(/\*$/, '');
      if (!alias.startsWith(prefix) || !targets[0]) continue;
      return path.join(
        baseUrl,
        targets[0].replace(/\*$/, ''),
        alias.slice(prefix.length),
      );
    }
  }
  return path.join(root, alias.replace(/^[@~]\//, ''));
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
