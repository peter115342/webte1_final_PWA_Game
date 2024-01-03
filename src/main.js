import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

let manifest = {};

if (import.meta.env.MODE === 'development') {
  const importManifest = await   import.meta.glob('./public/manifest.json');
  const manifestPaths = Object.keys(importManifest);

  if (manifestPaths.length > 0) {
    const firstManifestPath = manifestPaths[0];
    manifest = await importManifest[firstManifestPath]();
  } else {
    console.error('Manifest file not found.');
  }
}

console.log(manifest.name);

app.mount('#app');
