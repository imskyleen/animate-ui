import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { styleText } from 'node:util';

import { PACKAGE } from '../lib/primitives';
import { loadProject } from '../lib/project';
import { transform } from '../lib/transform';

type AnimateOptions = {
  cwd: string;
  dryRun: boolean;
  /** Components left out (`all` but these). */
  exclude?: string[];
  log?: (message: string) => void;
};

const EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js'];

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter(
      (entry) =>
        entry.isFile() && EXTENSIONS.includes(path.extname(entry.name)),
    )
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
}

function findComponent(dir: string, name: string) {
  for (const extension of EXTENSIONS) {
    const file = path.join(dir, `${name}${extension}`);
    if (existsSync(file)) return file;
  }
  return undefined;
}

/**
 * `animate-ui animate <components...|all>`: swaps the primitives of installed
 * shadcn/ui components for Animate UI's. Returns the exit code.
 */
export function animate(components: string[], options: AnimateOptions) {
  const log = options.log ?? console.log;
  const project = loadProject(options.cwd);
  const relative = (file: string) => path.relative(project.root, file);

  let exitCode = 0;
  const files: string[] = [];

  if (components.includes('all')) {
    files.push(...listFiles(project.uiDir));
  } else {
    for (const name of components) {
      const file = findComponent(project.uiDir, name);
      if (file) {
        files.push(file);
      } else {
        exitCode = 1;
        log(
          `${styleText('red', '✖')} ${name} isn't installed in ${relative(project.uiDir)}. ` +
            `Add it first: pnpm dlx shadcn@latest add ${name}`,
        );
      }
    }
  }

  // `--exclude`: left out, as named (`sidebar`) or with their extension.
  const excluded = new Set(
    (options.exclude ?? []).map((name) => name.replace(/\.[jt]sx?$/, '')),
  );
  for (const name of excluded) {
    if (findComponent(project.uiDir, name)) continue;
    log(
      `${styleText('yellow', '!')} ${name} isn't installed in ${relative(project.uiDir)}: nothing to exclude.`,
    );
  }
  const baseName = (file: string) => path.basename(file, path.extname(file));
  const kept = files.filter((file) => !excluded.has(baseName(file)));
  files.length = 0;
  files.push(...kept);

  let changedFiles = 0;
  const unsupported = new Set<string>();

  for (const file of files) {
    const code = readFileSync(file, 'utf8');
    const result = transform(code);
    result.unsupported.forEach((name) => unsupported.add(name));
    if (result.code === code) continue;

    changedFiles++;
    if (!options.dryRun) writeFileSync(file, result.code);

    log(`${styleText('green', '✔')} ${relative(file)}`);
    for (const change of result.imports) {
      log(`    ${change.name}: ${change.from} → ${change.to}`);
    }
    if (result.removedClasses.length > 0) {
      log(`    removed CSS animations: ${result.removedClasses.join(' ')}`);
    }
  }

  if (changedFiles === 0 && exitCode === 0) {
    log(
      'Nothing to animate: the components already use Animate UI, or use no supported primitive.',
    );
  } else if (changedFiles > 0) {
    const verb = options.dryRun ? 'would be animated' : 'animated';
    log(`\n${changedFiles} file${changedFiles > 1 ? 's' : ''} ${verb}.`);
  }

  if (unsupported.size > 0) {
    log(
      styleText(
        'dim',
        `Not animated yet, left as is: ${[...unsupported].sort().join(', ')}`,
      ),
    );
  }

  if (changedFiles > 0 && !project.hasPackage) {
    log(
      `\n${styleText('yellow', '!')} ${PACKAGE} isn't installed yet: pnpm add ${PACKAGE} motion`,
    );
  }

  return exitCode;
}
