import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/**/index.ts'],
  root: 'src',
  unbundle: true,
  platform: 'neutral',
  dts: true,
  exports: false,
});
