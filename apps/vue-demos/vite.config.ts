import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// The demos are served by the docs site, which mounts them in its preview frames.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    // The icons live in the docs' registry: their imports resolve from here.
    dedupe: ['vue', 'motion-v', '@animate-ui/vue', '@hugeicons/vue', 'vue-router'],
  },
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: '../v2/public/vue-demos',
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
  },
})
