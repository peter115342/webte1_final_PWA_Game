// eventBus.js
import { ref } from 'vue';
import mitt from 'mitt';

// Create a ref to hold the selected vehicle
export const selectedVehicle = ref(null);
const emitter = mitt();

// Create an event bus
const eventBus = {
  emit: (event, data) => {
    selectedVehicle.value = data; // Update the selected vehicle
    emitter.emit(event, data); // Emit the event using mitt
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  on: (event, callback) => {
    emitter.on(event, callback); // Listen for the event using mitt
    document.addEventListener(event, (e) => {
      callback(e.detail);
    });
  },
  off: (event, callback) => {
    emitter.off(event, callback); // Remove the event listener using mitt
    document.removeEventListener(event, callback);
  },
};

// Define events
export const EVENTS = {
  START_GAME: 'start-game',
  SET_CURRENT_LEVEL: 'set-current-level',
};

export { eventBus };
