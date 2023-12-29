// vite.config.js
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import manifest from './public/manifest.json'; // Adjust the path as needed

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest, // Use the manually imported manifest object
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
