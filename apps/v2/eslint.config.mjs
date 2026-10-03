import { nextJsConfig } from '@workspace/eslint-config/next-js';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['.next/**', '.source/**', 'next-env.d.ts'],
  },
  ...nextJsConfig,
];
