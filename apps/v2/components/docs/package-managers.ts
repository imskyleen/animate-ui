/**
 * The package managers every install command is offered in, in the order of
 * their tabs (npm first, as in v1 and in MDX's ```npm blocks). Readers pick
 * one once: every command on the docs follows (tabs group "package-manager").
 */
export const MANAGERS = {
  npm: { add: 'npm install', dlx: 'npx' },
  pnpm: { add: 'pnpm add', dlx: 'pnpm dlx' },
  yarn: { add: 'yarn add', dlx: 'yarn dlx' },
  bun: { add: 'bun add', dlx: 'bunx --bun' },
} as const;

export type Manager = keyof typeof MANAGERS;

export type ManagerCommands = (typeof MANAGERS)[Manager];

export const MANAGER_NAMES = Object.keys(MANAGERS) as Manager[];

/** The tab group every package manager choice is saved under. */
export const MANAGER_GROUP = 'package-manager';
