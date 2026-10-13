import { nextJsConfig } from '@workspace/eslint-config/next-js';

export default [
  {
    ignores: ['.next/**', '.source/**', 'next-env.d.ts'],
  },
  ...nextJsConfig,
];
