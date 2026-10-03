import { nextJsConfig } from '@workspace/eslint-config/next-js';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      '.next/**',
      '.source/**',
      '__registry__/**',
      'public/**',
      'tests/.results/**',
      'next-env.d.ts',
    ],
  },
  ...nextJsConfig,
];
