import { createApp } from 'vue';
import App from './App.vue';
import manifest from './public/manifest.json';

const app = createApp(App);

console.log(manifest.name);

app.mount('#app');
