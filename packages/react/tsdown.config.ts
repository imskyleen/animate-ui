import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/**/index.tsx'],
  root: 'src',
  unbundle: true,
  platform: 'neutral',
  dts: true,
  exports: false,
  inputOptions: {
    onLog(level, log, handler) {
      if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
      handler(level, log);
    },
  },
});
