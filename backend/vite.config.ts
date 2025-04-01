import { defineConfig } from 'vite';

import { builtinModules } from 'module';
import packagejson from './package.json'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es'], // Output in ES module format
    },
    outDir: 'dist',
    target: 'esnext',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      external: [
        ...builtinModules, // Node.js built-in modules
        ...Object.keys(packagejson.dependencies), // Dependencies in package.json
      ],
    },
  },
});
