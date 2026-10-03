import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Entry point: index.html di root project
  root: '.',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./resources/js', import.meta.url)) },
  },
  build: {
    // Output hasil build ke dist/ (yang akan di-serve Vercel)
    outDir: 'dist',
    emptyOutDir: true,
  },
});
