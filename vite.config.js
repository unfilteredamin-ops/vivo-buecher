import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'chrome84',
    chunkSizeWarningLimit: 2000,
  },
});
