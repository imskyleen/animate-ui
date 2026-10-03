#!/usr/bin/env node
import { parseArgs } from 'node:util';

import pkg from '../package.json' with { type: 'json' };
import { animate } from './commands/animate';

const HELP = `Usage: animate-ui <command> [components...] [options]

Commands:
  animate <components...|all>   Swap the primitives of installed shadcn/ui
                                components for Animate UI's animated ones.
  migrate <components...|all>   Migrate Animate UI v1 components to v2.

Options:
  --cwd <path>    Project directory (default: current directory)
  --dry-run       Show the changes without writing them
  -h, --help      Show this help
  -v, --version   Show the version
`;

const COMMANDS = ['animate', 'migrate'] as const;
type Command = (typeof COMMANDS)[number];

function isCommand(value: string | undefined): value is Command {
  return COMMANDS.includes(value as Command);
}

function main(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      cwd: { type: 'string', default: process.cwd() },
      'dry-run': { type: 'boolean', default: false },
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

  try {
    if (command === 'animate') {
      return animate(components, {
        cwd: values.cwd,
        dryRun: values['dry-run'],
      });
    }
    console.error(`"${command}" is not implemented yet.`);
    return 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 1;
  }
}

process.exitCode = main(process.argv.slice(2));
