import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Treat three and meshoptimizer as external CDN libs
      external: ['three', 'three/addons/loaders/GLTFLoader.js', 'three/addons/libs/meshopt_decoder.module.js'],
      output: {
        globals: {
          'three': 'THREE',
        },
      },
    },
  },
  server: {
    open: true,
  },
  // Map CDN imports for dev mode
  resolve: {
    alias: {},
  },
  optimizeDeps: {
    exclude: ['three'],
  },
});
