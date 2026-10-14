import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export function parseJsonc(text: string) {
  const withoutComments = text.replace(
    /("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
    (match, string: string | undefined) => string ?? '',
  );
  return JSON.parse(withoutComments.replace(/,(\s*[}\]])/g, '$1'));
}

export function readJson(file: string) {
  try {
    return parseJsonc(readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

export type PathMapping = {
  prefix: string;
  targets: string[];
  exact: boolean;
};

export type PathConfig = { mappings: PathMapping[]; baseUrls: string[] };

type Options = {
  baseUrl?: string;
  paths?: Record<string, string[]>;
  pathsDir?: string;
};

function isFile(file: string) {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

function isDirectory(dir: string) {
  try {
    return statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

function extendedFile(dir: string, name: string) {
  const candidates = name.startsWith('.') ? [path.resolve(dir, name)] : [];
  for (let up = dir; !name.startsWith('.');) {
    candidates.push(path.join(up, 'node_modules', name));
    const parent = path.dirname(up);
    if (parent === up) break;
    up = parent;
  }
  for (const candidate of candidates)
    for (const file of [
      candidate,
      `${candidate}.json`,
      path.join(candidate, 'tsconfig.json'),
    ])
      if (isFile(file)) return file;
  return undefined;
}

function compilerOptions(file: string, seen = new Set<string>()): Options {
  if (seen.has(file) || !existsSync(file)) return {};
  seen.add(file);
  const json = readJson(file);
  const dir = path.dirname(file);
  let options: Options = {};
  const bases: string[] = Array.isArray(json.extends)
    ? json.extends
    : typeof json.extends === 'string'
      ? [json.extends]
      : [];
  for (const base of bases) {
    const baseFile = extendedFile(dir, base);
    if (baseFile) options = { ...options, ...compilerOptions(baseFile, seen) };
  }
  const own = json.compilerOptions ?? {};
  if (typeof own.baseUrl === 'string')
    options.baseUrl = path.resolve(dir, own.baseUrl);
  if (own.paths && typeof own.paths === 'object') {
    options.paths = own.paths;
    options.pathsDir = dir;
  }
  return options;
}

export function readPathConfig(root: string): PathConfig {
  const mappings: PathMapping[] = [];
  const baseUrls: string[] = [];
  for (const name of ['tsconfig.json', 'tsconfig.app.json', 'jsconfig.json']) {
    const options = compilerOptions(path.join(root, name));
    if (options.baseUrl) baseUrls.push(options.baseUrl);
    const base = options.baseUrl ?? options.pathsDir ?? root;
    for (const [pattern, targets] of Object.entries(options.paths ?? {})) {
      if (!Array.isArray(targets)) continue;
      mappings.push({
        prefix: pattern.replace(/\*$/, ''),
        exact: !pattern.endsWith('*'),
        targets: targets.map((target) =>
          path.join(base, target.replace(/\*$/, '')),
        ),
      });
    }
  }
  mappings.sort((a, b) => b.prefix.length - a.prefix.length);
  return { mappings, baseUrls };
}

const RESOLVED_EXTENSIONS = [
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.mts',
  '.cts',
  '.mjs',
  '.cjs',
];

function exists(candidate: string) {
  return (
    isDirectory(candidate) ||
    RESOLVED_EXTENSIONS.some((ext) => existsSync(candidate + ext))
  );
}

export function resolveWithConfig(
  { mappings, baseUrls }: PathConfig,
  specifier: string,
) {
  for (const { prefix, targets, exact } of mappings) {
    if (exact ? specifier !== prefix : !specifier.startsWith(prefix)) continue;
    const rest = exact ? '' : specifier.slice(prefix.length);
    const candidates = targets.map((target) => path.join(target, rest));
    return candidates.find(exists) ?? candidates[0];
  }
  if (specifier.startsWith('.') || path.isAbsolute(specifier)) return undefined;
  for (const baseUrl of baseUrls) {
    const candidate = path.join(baseUrl, specifier);
    if (exists(candidate)) return candidate;
  }
  return undefined;
}
