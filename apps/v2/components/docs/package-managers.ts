export const MANAGERS = {
  npm: { add: 'npm install', dlx: 'npx' },
  pnpm: { add: 'pnpm add', dlx: 'pnpm dlx' },
  yarn: { add: 'yarn add', dlx: 'yarn dlx' },
  bun: { add: 'bun add', dlx: 'bunx --bun' },
} as const;

export type Manager = keyof typeof MANAGERS;

export type ManagerCommands = (typeof MANAGERS)[Manager];

export const MANAGER_NAMES = Object.keys(MANAGERS) as Manager[];

export const MANAGER_GROUP = 'package-manager';
