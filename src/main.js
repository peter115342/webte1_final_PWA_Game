import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

(async () => {
  let manifest = {};

  // Import the manifest dynamically using import.meta.glob
  const importManifest = import.meta.glob('./public/manifest.json');
  const manifestPaths = Object.keys(importManifest);

  if (manifestPaths.length > 0) {
    // Use the first manifest path found
    const firstManifestPath = manifestPaths[0];
    manifest = await importManifest[firstManifestPath]();
  } else {
    console.error('Manifest file not found.');
  }

  console.log(manifest.name);

  app.mount('#app');
})();
