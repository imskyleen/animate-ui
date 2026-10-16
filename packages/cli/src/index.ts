#!/usr/bin/env node
import { parseArgs } from 'node:util';

import pkg from '../package.json' with { type: 'json' };
import { animate } from './commands/animate';
import { audit } from './commands/audit';
import { migrate } from './commands/migrate';

const HELP = `Usage: animate-ui <command> [components...] [options]

Commands:
  animate <components...|all>   Swap the primitives of installed shadcn/ui
                                components for Animate UI's animated ones.
  migrate <components...|all>   Migrate Animate UI v1 components to v2.
  audit [paths...]              List what moves in the project and how, for
                                you or your AI to judge.

Options:
  --cwd <path>    Project directory (default: current directory)
  --dry-run       Show the changes without writing them
  --exclude <components...>
                  Leave these components out (with all): --exclude sidebar,
                  or several, comma-separated or repeated
  --delete        migrate: delete the v1 files nothing imports anymore,
                  without asking (in a terminal, migrate asks)
  --keep          migrate: keep them, without asking
  --json          audit: print the report as JSON
  -h, --help      Show this help
  -v, --version   Show the version
`;

const COMMAND_OPTIONS = `Options:
  --cwd <path>    the project directory (default: the current directory)
  --dry-run       show the changes without writing them
  --exclude <components...>
                  leave these components out: comma-separated
                  (--exclude sidebar,tooltip) or repeated`;

const COMMAND_HELP = {
  animate: `Usage: animate-ui animate <components...|all> [options]

Arguments:
  components      the components to animate (their file names in your ui
                  folder), or all

${COMMAND_OPTIONS}
  -h, --help      show the help`,
  migrate: `Usage: animate-ui migrate <components...|all> [options]

Arguments:
  components      the v1 primitives to migrate, or all

${COMMAND_OPTIONS}
  --delete        delete the v1 files nothing imports anymore, without asking
  --keep          keep them, without asking
  -h, --help      show the help`,
  audit: `Usage: animate-ui audit [paths...] [options]

Arguments:
  paths           the files or folders to read (default: the whole project,
                  without node_modules and build output)

Options:
  --cwd <path>    the project directory (default: the current directory)
  --json          print the report as JSON
  -h, --help      show the help`,
};

const COMMANDS = ['animate', 'migrate', 'audit'] as const;
type Command = (typeof COMMANDS)[number];

function isCommand(value: string | undefined): value is Command {
  return COMMANDS.includes(value as Command);
}

async function main(argv: string[]) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        cwd: { type: 'string', default: process.cwd() },
        'dry-run': { type: 'boolean', default: false },
        exclude: { type: 'string', multiple: true, default: [] },
        delete: { type: 'boolean', default: false },
        keep: { type: 'boolean', default: false },
        json: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
        version: { type: 'boolean', short: 'v', default: false },
      },
    });
  } catch (error) {
    console.error(
      `${error instanceof Error ? error.message : error}\n\n${HELP}`,
    );
    return 1;
  }
  const { values, positionals } = parsed;

  if (values.version) {
    console.log(pkg.version);
    return 0;
  }

  const [command, ...components] = positionals;

  if (values.help && isCommand(command)) {
    console.log(COMMAND_HELP[command]);
    return 0;
  }

  if (values.help || !command) {
    console.log(HELP);
    return 0;
  }

  if (!isCommand(command)) {
    console.error(`Unknown command "${command}".\n\n${HELP}`);
    return 1;
  }

  if (command === 'audit') {
    try {
      return audit(components, { cwd: values.cwd, json: values.json });
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      return 1;
    }
  }

  if (components.length === 0) {
    console.error(
      `Name the components to ${command}, or pass "all".\n\n${HELP}`,
    );
    return 1;
  }

  const exclude = values.exclude.flatMap((value) =>
    value.split(',').flatMap((name) => (name.trim() ? [name.trim()] : [])),
  );

  try {
    if (command === 'animate') {
      return animate(components, {
        cwd: values.cwd,
        dryRun: values['dry-run'],
        exclude,
      });
    }
    if (values.delete && values.keep) {
      console.error('Pass --delete or --keep, not both.');
      return 1;
    }
    return await migrate(components, {
      cwd: values.cwd,
      dryRun: values['dry-run'],
      exclude,
      delete: values.delete,
      keep: values.keep,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 1;
  }
}

process.exitCode = await main(process.argv.slice(2));
