import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { styleText } from 'node:util';

import { PACKAGE } from '../lib/primitives';
import { loadProject } from '../lib/project';
import { transform } from '../lib/transform';
import { transformVue, VUE_PACKAGE, VUE_PRIMITIVES } from '../lib/vue';

type AnimateOptions = {
  cwd: string;
  dryRun: boolean;
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

export function animate(components: string[], options: AnimateOptions) {
  const project = loadProject(options.cwd);
  if (project.framework === 'vue')
    return animateVue(components, project, options);
  const log = options.log ?? console.log;
  const relative = (file: string) => path.relative(project.root, file);

  let exitCode = 0;
  const files: string[] = [];

  if (!existsSync(project.uiDir)) {
    log(
      `${styleText('red', '✖')} No ui folder at ${relative(project.uiDir)}: check the ui alias in components.json and your tsconfig paths.`,
    );
    return 1;
  }

  if (components.includes('all')) {
    files.push(...listFiles(project.uiDir));
  } else {
    for (const name of new Set(
      components.map((name) => name.replace(/\.[jt]sx?$/, '').toLowerCase()),
    )) {
      const file = findComponent(project.uiDir, name);
      if (file) {
        files.push(file);
      } else {
        exitCode = 1;
        log(
          `${styleText('red', '✖')} ${name} isn't installed in ${relative(project.uiDir)}. ` +
            `Add it first: ${project.dlx} shadcn@latest add ${name}`,
        );
      }
    }
  }

  const excluded = new Set(
    (options.exclude ?? []).map((name) =>
      name.replace(/\.[jt]sx?$/, '').toLowerCase(),
    ),
  );
  for (const name of excluded) {
    if (findComponent(project.uiDir, name)) continue;
    log(
      `${styleText('yellow', '!')} ${name} isn't installed in ${relative(project.uiDir)}: nothing to exclude.`,
    );
  }
  const baseName = (file: string) => path.basename(file, path.extname(file));
  const kept = files.filter(
    (file) => !excluded.has(baseName(file).toLowerCase()),
  );
  files.length = 0;
  files.push(...kept);

  let changedFiles = 0;
  const unsupported = new Set<string>();

  for (const file of files) {
    const code = readFileSync(file, 'utf8');
    let result;
    try {
      result = transform(code, file, { tailwind: project.tailwind });
    } catch (error) {
      exitCode = 1;
      log(
        `${styleText('red', '✖')} ${relative(file)}: couldn't parse it (${error instanceof Error ? error.message : error}), skipped.`,
      );
      continue;
    }
    result.unsupported.forEach((name) => unsupported.add(name));
    for (const source of result.beta)
      log(
        `${styleText('yellow', '!')} ${relative(file)} imports ${source}, Base UI's beta: move it to @base-ui/react (Base UI 1) first, then run animate again.`,
      );
    if (result.code === code) continue;

    if (!options.dryRun) {
      try {
        writeFileSync(file, result.code);
      } catch (error) {
        exitCode = 1;
        log(
          `${styleText('red', '✖')} ${relative(file)}: couldn't write it (${error instanceof Error ? error.message : error}), skipped.`,
        );
        continue;
      }
    }
    changedFiles++;

    log(`${styleText('green', '✔')} ${relative(file)}`);
    for (const change of result.imports) {
      log(`    ${change.name}: ${change.from} → ${change.to}`);
    }
    if (result.removedClasses.length > 0) {
      log(`    removed CSS animations: ${result.removedClasses.join(' ')}`);
    }
    if (result.centering.length > 0) {
      log(
        `    centered with margins: ${result.centering.join(' ')} → inset-0 m-auto h-fit (under Tailwind 3 a translate would fight Motion's transform)`,
      );
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
      `\n${styleText('yellow', '!')} ${PACKAGE} isn't installed yet: ${project.install} ${PACKAGE} motion`,
    );
  }

  return exitCode;
}

const VUE_FILES = ['.vue', '.ts', '.js'];

/** shadcn-vue keeps each component in a folder: every file of it is transformed. */
function animateVue(
  components: string[],
  project: ReturnType<typeof loadProject>,
  options: AnimateOptions,
) {
  const log = options.log ?? console.log;
  const relative = (file: string) => path.relative(project.root, file);
  let exitCode = 0;

  if (!existsSync(project.uiDir)) {
    log(
      `${styleText('red', '✖')} No ui folder at ${relative(project.uiDir)}: check the ui alias in components.json and your tsconfig paths.`,
    );
    return 1;
  }

  const installed = readdirSync(project.uiDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const excluded = new Set(
    (options.exclude ?? []).map((name) => name.toLowerCase()),
  );
  for (const name of excluded)
    if (!installed.includes(name))
      log(
        `${styleText('yellow', '!')} ${name} isn't installed in ${relative(project.uiDir)}: nothing to exclude.`,
      );

  const names: string[] = [];
  if (components.includes('all')) names.push(...installed);
  else
    for (const name of new Set(components.map((c) => c.toLowerCase()))) {
      if (installed.includes(name)) names.push(name);
      else {
        exitCode = 1;
        log(
          `${styleText('red', '✖')} ${name} isn't installed in ${relative(project.uiDir)}. ` +
            `Add it first: ${project.dlx} shadcn-vue@latest add ${name}`,
        );
      }
    }

  let changedFiles = 0;
  const unsupported = new Set<string>();
  for (const name of names) {
    if (excluded.has(name)) continue;
    if (!VUE_PRIMITIVES[name]) {
      unsupported.add(name);
      continue;
    }
    const dir = path.join(project.uiDir, name);
    const files = readdirSync(dir)
      .filter((file) => VUE_FILES.includes(path.extname(file)))
      .sort()
      .map((file) => path.join(dir, file));
    for (const file of files) {
      const code = readFileSync(file, 'utf8');
      const result = transformVue(code, name, {
        tailwind: project.tailwind,
      })!;
      if (result.code === code) continue;
      if (!options.dryRun) {
        try {
          writeFileSync(file, result.code);
        } catch (error) {
          exitCode = 1;
          log(
            `${styleText('red', '✖')} ${relative(file)}: couldn't write it (${error instanceof Error ? error.message : error}), skipped.`,
          );
          continue;
        }
      }
      changedFiles++;
      log(`${styleText('green', '✔')} ${relative(file)}`);
      if (result.imports > 0)
        log(`    reka-ui → ${VUE_PACKAGE}/primitives/reka-ui`);
      if (result.removedClasses.length > 0)
        log(`    removed CSS animations: ${result.removedClasses.join(' ')}`);
      if (result.centering.length > 0)
        log(
          `    centered with margins: ${result.centering.join(' ')} → inset-0 m-auto h-fit (under Tailwind 3 a translate would fight Motion's transform)`,
        );
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
      `\n${styleText('yellow', '!')} ${VUE_PACKAGE} isn't installed yet: ${project.install} ${VUE_PACKAGE} motion-v`,
    );
  }

  return exitCode;
}
