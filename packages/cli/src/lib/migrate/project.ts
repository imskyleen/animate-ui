import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { loadProject } from '../project';
import { readJson, readPathConfig, resolveWithConfig } from '../tsconfig';

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
  textFiles: () => string[];
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

const TEXT_EXTENSIONS = [
  ...SOURCE_EXTENSIONS,
  '.mdx',
  '.md',
  '.vue',
  '.svelte',
  '.astro',
];

const GENERATED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  '.output',
  '.svelte-kit',
  '.turbo',
  '.vercel',
  '.cache',
  '.parcel-cache',
  '.yarn',
  '.pnpm-store',
  '.expo',
]);

const IGNORED_DIRS = new Set([
  ...GENERATED_DIRS,
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  'storybook-static',
]);

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

function workspaceRoot(root: string) {
  for (let dir = root; ;) {
    if (
      ['pnpm-workspace.yaml', 'lerna.json', 'nx.json', 'turbo.json'].some(
        (name) => existsSync(path.join(dir, name)),
      ) ||
      readJson(path.join(dir, 'package.json')).workspaces
    )
      return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return root;
    dir = parent;
  }
}

function walkFiles(
  dir: string,
  skipDir: (name: string) => boolean,
  keep: (name: string) => boolean,
  files: string[] = [],
) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDir(entry.name)) walkFiles(full, skipDir, keep, files);
    } else if (entry.isFile() && keep(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

export function loadMigrateProject(cwd: string): MigrateProject {
  const { root, hasPackage } = loadProject(cwd);
  const aliases = readJson(path.join(root, 'components.json')).aliases ?? {};
  const pkg = readJson(path.join(root, 'package.json'));
  const dependencies = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);
  const pathConfig = readPathConfig(root);

  const resolveAlias = (specifier: string) => {
    const configured = resolveWithConfig(pathConfig, specifier);
    if (configured !== undefined) return configured;
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

  const sourceFiles = () =>
    walkFiles(
      root,
      (name) => IGNORED_DIRS.has(name),
      (name) =>
        SOURCE_EXTENSIONS.includes(path.extname(name)) &&
        !/\.d\.[cm]?ts$/.test(name),
    ).sort();

  const textFiles = () =>
    walkFiles(
      workspaceRoot(root),
      (name) => GENERATED_DIRS.has(name),
      (name) => TEXT_EXTENSIONS.includes(path.extname(name)),
    ).sort();

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
    textFiles,
  };
}
