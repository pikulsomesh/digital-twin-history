import { defineConfig } from 'vite';

// Relative base so the same build works on GitHub Pages (/digital-twin-history/) and Vercel (/).
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 1200 },
});
