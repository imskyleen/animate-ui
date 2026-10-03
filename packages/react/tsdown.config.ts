import { defineConfig } from 'tsdown';

export default defineConfig({
  // One entry per public subpath: src/utils/motion/index.tsx is imported as
  // `@animate-ui/react/utils/motion`.
  entry: ['src/**/index.tsx'],
  root: 'src',
  // Mirror the source tree: each output module keeps its own "use client".
  unbundle: true,
  platform: 'neutral',
  dts: true,
  // package.json maps every subpath with a wildcard (sources in the monorepo,
  // dist once published), so new entries need no exports update.
  exports: false,
  inputOptions: {
    onLog(level, log, handler) {
      // Rolldown warns about "use client" but keeps it in unbundle mode.
      if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
      handler(level, log);
    },
  },
});
