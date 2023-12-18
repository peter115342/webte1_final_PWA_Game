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
        <button class="close_button" @click="closeModalAndNotify">Close</button>
      </div>
    </div>
  </template>
  
  <script>
  import { eventBus } from './utils/eventBus.js';
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
      // Fetch the JSON data
      fetch('/cars.json')
        .then((response) => response.json())
        .then((data) => {
          this.vehicles = data.cars.map((car) => ({
            value: car.name.toLowerCase().replace(/\s/g, '_'),
            image: car.url,
            name: car.name,
            lives: car.lives,
            speed: car.speed,
          }));
        });
    },
    methods: {
      closeModalAndNotify() {
        this.$emit('close', this.selectedVehicle);
// In the component that updates the selected vehicle (modal component)
eventBus.emit('vehicle-selected', this.selectedVehicle);
      },
      getSelectedVehicleDetails() {
        const selectedVehicle = this.vehicles.find(
          (vehicle) => vehicle.value === this.selectedVehicle
        );
        return selectedVehicle
          ? `${selectedVehicle.name} - Lives: ${selectedVehicle.lives}, Speed: ${selectedVehicle.speed}`
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
    background-color: rgb(186, 183, 183);
    font-weight: bolder;
    border: 3px solid black;
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
