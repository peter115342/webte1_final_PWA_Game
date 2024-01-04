import { ref } from 'vue';
import mitt from 'mitt';

export const selectedVehicle = ref(null);
const emitter = mitt();

const eventBus = {
  emit: (event, data) => {
    selectedVehicle.value = data;
    emitter.emit(event, data);
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  on: (event, callback) => {
    emitter.on(event, callback);
    document.addEventListener(event, (e) => {
      callback(e.detail);
    });
  },
  off: (event, callback) => {
    emitter.off(event, callback);
    document.removeEventListener(event, callback);
  },
};
const events = mitt();

export const EVENTS = {
  START_GAME: 'start-game',
  SET_CURRENT_LEVEL: 'set-current-level',
};

export { eventBus };
