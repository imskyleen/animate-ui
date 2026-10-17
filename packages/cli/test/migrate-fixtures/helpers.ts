import {
  cpSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import ts from 'typescript';

const REACT = path.resolve(import.meta.dirname, '..', '..', '..', 'react');

/** v1 registry files are stored as `<file>.txt` so the CLI's tsc and eslint skip them. */
export function copyFixture(name = 'v1-project') {
  const root = mkdtempSync(path.join(tmpdir(), 'animate-ui-migrate-'));
  cpSync(path.join(import.meta.dirname, name), root, { recursive: true });
  for (const entry of readdirSync(root, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (entry.isFile() && entry.name.endsWith('.txt')) {
      const file = path.join(entry.parentPath, entry.name);
      renameSync(file, file.slice(0, -'.txt'.length));
    }
  }
  return root;
}

export function snapshot(root: string) {
  const files: Record<string, string> = {};
  for (const entry of readdirSync(root, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath, entry.name);
    files[path.relative(root, file)] = readFileSync(file, 'utf8');
  }
  return files;
}

export type Diagnostic = {
  file: string;
  line: number;
  code: number;
  message: string;
};

/**
 * Type-checks `files` with `@animate-ui/react/*` pointing at its sources and
 * bare imports (react, radix-ui, motion…) at its node_modules. Returns the
 * diagnostics of `files` only.
 */
export function typecheck(
  files: string[],
  paths: Record<string, string[]> = {},
): Diagnostic[] {
  const program = ts.createProgram(files, {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    lib: ['lib.es2023.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    types: [],
    paths: {
      '@animate-ui/react/*': [path.join(REACT, 'src', '*')],
      ...paths,
      '*': [
        path.join(REACT, 'node_modules', '@types', '*'),
        path.join(REACT, 'node_modules', '*'),
      ],
    },
  });
  const wanted = new Set(files.map((file) => path.resolve(file)));
  return ts
    .getPreEmitDiagnostics(program)
    .filter((d) => d.file && wanted.has(path.resolve(d.file.fileName)))
    .map((d) => ({
      file: path.resolve(d.file!.fileName),
      line: d.file!.getLineAndCharacterOfPosition(d.start ?? 0).line + 1,
      code: d.code,
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
    }));
}
