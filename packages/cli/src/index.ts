#!/usr/bin/env node
import { parseArgs } from 'node:util';

import pkg from '../package.json' with { type: 'json' };
import { animate } from './commands/animate';
import { migrate } from './commands/migrate';

const HELP = `Usage: animate-ui <command> [components...] [options]

Commands:
  animate <components...|all>   Swap the primitives of installed shadcn/ui
                                components for Animate UI's animated ones.
  migrate <components...|all>   Migrate Animate UI v1 components to v2.

Options:
  --cwd <path>    Project directory (default: current directory)
  --dry-run       Show the changes without writing them
  --exclude <components...>
                  Leave these components out (with all): --exclude sidebar,
                  or several, comma-separated or repeated
  --delete        migrate: delete the v1 files nothing imports anymore,
                  without asking (in a terminal, migrate asks)
  --keep          migrate: keep them, without asking
  -h, --help      Show this help
  -v, --version   Show the version
`;

const COMMANDS = ['animate', 'migrate'] as const;
type Command = (typeof COMMANDS)[number];

function isCommand(value: string | undefined): value is Command {
  return COMMANDS.includes(value as Command);
}

async function main(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      cwd: { type: 'string', default: process.cwd() },
      'dry-run': { type: 'boolean', default: false },
      exclude: { type: 'string', multiple: true, default: [] },
      delete: { type: 'boolean', default: false },
      keep: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', short: 'v', default: false },
    },
  });

  if (values.version) {
    console.log(pkg.version);
    return 0;
  }

  const [command, ...components] = positionals;

  if (values.help || !command) {
    console.log(HELP);
    return 0;
  }

  if (!isCommand(command)) {
    console.error(`Unknown command "${command}".\n\n${HELP}`);
    return 1;
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
