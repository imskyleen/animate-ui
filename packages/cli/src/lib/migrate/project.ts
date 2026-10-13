import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { loadProject } from '../project';

export type V1Module =
  | { kind: 'primitive'; library: string; name: string }
  | { kind: 'utility'; id: string };

export type MigrateProject = {
  root: string;
  hasPackage: boolean;
  hasDependency: (name: string) => boolean;
  componentsDir: string;
  libDir: string;
  hooksDir: string;
  resolve: (fromFile: string, specifier: string) => string | undefined;
  classify: (target: string) => V1Module | undefined;
  sourceFiles: () => string[];
};

export const SOURCE_EXTENSIONS = [
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.mts',
  '.cts',
  '.mjs',
  '.cjs',
];

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  'storybook-static',
]);

function parseJsonc(text: string) {
  const withoutComments = text.replace(
    /("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
    (match, string: string | undefined) => string ?? '',
  );
  return JSON.parse(withoutComments.replace(/,(\s*[}\]])/g, '$1'));
}

function readJson(file: string) {
  try {
    return parseJsonc(readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

type PathMapping = { prefix: string; targets: string[]; exact: boolean };

function readPathMappings(root: string): PathMapping[] {
  const mappings: PathMapping[] = [];
  for (const name of ['tsconfig.json', 'tsconfig.app.json', 'jsconfig.json']) {
    const file = path.join(root, name);
    if (!existsSync(file)) continue;
    const options = readJson(file).compilerOptions ?? {};
    const baseUrl = path.join(root, options.baseUrl ?? '.');
    for (const [pattern, targets] of Object.entries<string[]>(
      options.paths ?? {},
    )) {
      mappings.push({
        prefix: pattern.replace(/\*$/, ''),
        exact: !pattern.endsWith('*'),
        targets: targets.map((target) =>
          path.join(baseUrl, target.replace(/\*$/, '')),
        ),
      });
    }
  }
  return mappings.sort((a, b) => b.prefix.length - a.prefix.length);
}

export function stripExtension(file: string) {
  const extension = path.extname(file);
  const bare = SOURCE_EXTENSIONS.includes(extension)
    ? file.slice(0, -extension.length)
    : file;
  return bare.replace(/[\\/]index$/, '');
}

function isDirectory(dir: string) {
  try {
    return statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

export function loadMigrateProject(cwd: string): MigrateProject {
  const { root, hasPackage } = loadProject(cwd);
  const aliases = readJson(path.join(root, 'components.json')).aliases ?? {};
  const pkg = readJson(path.join(root, 'package.json'));
  const dependencies = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);
  const mappings = readPathMappings(root);

  const resolveAlias = (specifier: string) => {
    for (const { prefix, targets, exact } of mappings) {
      if (exact ? specifier !== prefix : !specifier.startsWith(prefix))
        continue;
      const rest = exact ? '' : specifier.slice(prefix.length);
      const candidates = targets.map((target) => path.join(target, rest));
      return (
        candidates.find(
          (candidate) =>
            isDirectory(candidate) ||
            SOURCE_EXTENSIONS.some((ext) => existsSync(candidate + ext)),
        ) ?? candidates[0]
      );
    }
    const match = specifier.match(/^[@~]\/(.*)$/);
    if (!match) return undefined;
    const fromRoot = path.join(root, match[1]!);
    const fromSrc = path.join(root, 'src', match[1]!);
    const top = match[1]!.split('/')[0]!;
    return !isDirectory(path.join(root, top)) &&
      isDirectory(path.join(root, 'src', top))
      ? fromSrc
      : fromRoot;
  };

  const resolveDir = (alias: string) =>
    resolveAlias(alias) ?? path.join(root, alias);

  const componentsAlias: string = aliases.components ?? '@/components';
  const libAlias: string =
    aliases.lib ??
    (aliases.utils ? path.posix.dirname(aliases.utils) : '@/lib');
  const hooksAlias: string = aliases.hooks ?? '@/hooks';

  const componentsDir = resolveDir(componentsAlias);
  const libDir = resolveDir(libAlias);
  const hooksDir = resolveDir(hooksAlias);

  const resolve = (fromFile: string, specifier: string) => {
    const target = specifier.startsWith('.')
      ? path.resolve(path.dirname(fromFile), specifier)
      : resolveAlias(specifier);
    return target === undefined ? undefined : stripExtension(target);
  };

  const classify = (target: string): V1Module | undefined => {
    const fromComponents = path
      .relative(componentsDir, target)
      .split(path.sep)
      .join('/');
    const primitive = fromComponents.match(
      /^animate-ui\/primitives\/([a-z-]+)\/([a-z0-9-]+)$/,
    );
    if (primitive)
      return { kind: 'primitive', library: primitive[1]!, name: primitive[2]! };
    if (fromComponents === 'animate-ui/icons/icon')
      return { kind: 'utility', id: 'icons/icon' };
    if (path.relative(libDir, target) === 'get-strict-context')
      return { kind: 'utility', id: 'lib/get-strict-context' };
    const inHooks = path.relative(hooksDir, target);
    if (/^use-[a-z-]+$/.test(inHooks))
      return { kind: 'utility', id: `hooks/${inHooks}` };
    return undefined;
  };

  const sourceFiles = () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!IGNORED_DIRS.has(entry.name)) walk(full);
        } else if (
          entry.isFile() &&
          SOURCE_EXTENSIONS.includes(path.extname(entry.name)) &&
          !/\.d\.[cm]?ts$/.test(entry.name)
        ) {
          files.push(full);
        }
      }
    };
    walk(root);
    return files.sort();
  };

  return {
    root,
    hasPackage,
    hasDependency: (name) => dependencies.has(name),
    componentsDir,
    libDir,
    hooksDir,
    resolve,
    classify,
    sourceFiles,
  };
}
