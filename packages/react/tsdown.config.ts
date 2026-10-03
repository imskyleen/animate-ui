import { defineConfig } from 'tsdown';

export default defineConfig({
  // One entry per public subpath: src/utils/motion/index.tsx is imported as
  // `@animate-ui/react/utils/motion`.
  entry: ['src/**/index.{ts,tsx}'],
  root: 'src',
  // Mirror the source tree: each output module keeps its own "use client".
  unbundle: true,
  platform: 'neutral',
  dts: true,
  exports: true,
  inputOptions: {
    onLog(level, log, handler) {
      // Rolldown warns about "use client" but keeps it in unbundle mode.
      if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
      handler(level, log);
    },
  },
});
