<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal">
      <div class="banner">
        <h2 class="banner-text">Speedy Escape</h2>
        <p>Try not to crash and reach the finish!</p>
        <p>Choose your vehicle:</p>
      </div>

      <label v-for="vehicle in vehicles" :key="vehicle.value">
        <input
          type="radio"
          v-model="selectedVehicle"
          :value="vehicle.value"
        />
        <img
          :src="vehicle.image"
          :alt="vehicle.name"
          :class="{ 'selected': selectedVehicle === vehicle.value }"
        />
      </label>

      <p id="vehicle-details" v-if="selectedVehicle">
        Selected: {{ getSelectedVehicleDetails() }}
      </p>
      <button class="close_button" @click="closeModalAndNotify">Start</button>
    </div>
  </div>
</template>

<script>
import { eventBus } from './utils/eventBus.js';

// Import images for each car
import sportsCarImage from '@/assets/car_sport.png';
import muscleCarImage from '@/assets/car_muscle.png';
import truckImage from '@/assets/car_truck.png';

export default {
  props: {
    visible: Boolean,
  },
  data() {
    return {
      selectedVehicle: 'sports_car',
      vehicles: [],
    };
  },
  mounted() {
    const isProduction = import.meta.env.PROD;
    const baseURL = isProduction
      ? 'https://webte1.fei.stuba.sk/~xmuzslay/anbzvavapva/' // Adjust for your dev environment
      : '/';

    const jsonPath = `${baseURL}cars.json`;
    fetch(jsonPath)
      .then((response) => response.json())
      .then((data) => {
        this.vehicles = data.cars.map((car) => ({
          value: car.name.toLowerCase().replace(/\s/g, '_'),
          image: this.getCarImage(car.name),
          name: car.name,
          lives: car.lives,
          speed: car.speed,
        }));
      });
  },
  methods: {
    getCarImage(carName) {
      switch (carName) {
        case 'Sports Car':
          return sportsCarImage;
        case 'Muscle Car':
          return muscleCarImage;
        case 'Pickup Truck':
          return truckImage;
        default:
          return ''; // Provide a default image or handle accordingly
      }
    },
    closeModalAndNotify() {
      this.$emit('close', this.selectedVehicle);
      console.log("Modal closed");
      eventBus.emit('closeModal');
      eventBus.emit('vehicle-selected', this.selectedVehicle);
    },
    getSelectedVehicleDetails() {
      const selectedVehicle = this.vehicles.find(
        (vehicle) => vehicle.value === this.selectedVehicle
      );
      return selectedVehicle
        ? `${selectedVehicle.name} - Lives: ${selectedVehicle.lives}, Speed: ${Math.round(selectedVehicle.speed)}`
        : '';
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
p {
  font-weight: bolder;
  color: rgb(31, 30, 30);
}
h2 {
  font-weight: bolder;
  color: rgb(31, 30, 30);
}
.modal {
  background: rgb(233, 135, 6);
  padding: 45px;
  padding-top: 7px;
  border-radius: 8px;
  width: 400px;
}
label {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
}
img {
  width: 50px;
  height: auto;
  transition: transform 0.2s;
}
input[type="radio"] {
  display: none;
}
.close_button {
  margin-top: 10px;
  width: 125px;
  height: 25px;
  border-radius: 5px;
  text-align: center;
  align-self: center;
  display: block;
  margin-left: auto;
  margin-right: auto;
  background-color: rgb(174, 176, 173);
  font-weight: bolder;
  border: 5px solid rgb(72, 159, 10);
}
.selected {
  transform: scale(1.25);
}
.banner {
  text-align: center;
  position: relative;
  margin-bottom: 17px;
  margin-top: 0px;
}
.banner-text {
  margin-top: 0px;
}
#vehicle-details{
  text-align: center;
}
</style>
