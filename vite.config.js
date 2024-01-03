import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import manifest from './public/manifest.json';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest,
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'src/assets/**/*',
      ],
      cleanupOutdatedCaches: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: '',
    sourcemap: false,
  },
});
