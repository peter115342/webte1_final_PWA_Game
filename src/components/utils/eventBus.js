// eventBus.js

import { ref } from 'vue';

// Create a ref to hold the selected vehicle
export const selectedVehicle = ref(null);

// Create an event bus
export const eventBus = {
  emit(event, data) {
    selectedVehicle.value = data; // Update the selected vehicle
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  on(event, callback) {
    document.addEventListener(event, (e) => {
      callback(e.detail);
    });
  },
  off(event, callback) {
    document.removeEventListener(event, callback);
  },
};
