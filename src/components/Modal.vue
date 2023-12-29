<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal">
      <div class="banner">
        <img :src="logo" alt="Speedy Escape" style="width: 250px; height: 30px;" />
        <p>Try not to crash and reach the finish!</p>
        <p>Choose your vehicle:</p>
        <button class="tutorial-button" @click="showTutorial">How to Play?</button>
      </div>

      <div v-if="showTutorialModal" class="tutorial-modal">
        <h2 class="tutorial-banner">How to Play?</h2>
        <p>Welcome to Speedy Escape! Follow these instructions to play the game:</p>
        <ul class="tutorial-list">
          <li>The car accelerates automatically</li>
          <li class="icon-label">Steer with arrow keys on a computer</li>
          <li class="icon-li">
            <img :src="arrowLeft" alt="Arrow Keys" style="width: 50px; height: 45px;" />
            <img :src="arrowRight" alt="Arrow Keys" style="width: 50px; height: 45px;" />
          </li>
          <li class="icon-label">Steer by tilting your mobile device </li>
          <li class="icon-li">
            <img :src="gyroPhone" alt="Phone tilting" style="width: 70px; height: 80px;" />
          </li>

          <li>You lose a life when you crash</li>
          <li>When you have no lives, it takes you back to the menu</li>
          <li>Select which level to play in the menu</li>
          <li>Pause by tapping the logo at the bottom</li>
          <li>Select a car and get going, no time to waste!</li>
        </ul>

        <button class="close_tutorial" @click="closeTutorialModal">Menu</button>
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
      <p>Select a level:</p>

      <div class="level-buttons">
        <!-- Remove the start button and directly trigger the game with the selected level -->
        <label
          v-for="level in levels"
          :key="level"
          :for="'level' + level"
          class="level-button"
          @click="startGame(level)"
        >
          {{ level }}
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { eventBus, EVENTS } from './utils/eventBus.js';

import sportsCarImage from '@/assets/car_sport.png';
import muscleCarImage from '@/assets/car_muscle.png';
import truckImage from '@/assets/car_truck.png';
import arrowLeft from '@/assets/arrow_left.svg';
import arrowRight from '@/assets/arrow_right.svg';
import gyroPhone from '@/assets/gyro_phone.svg';
import logo from '@/assets/logo.png';

export default {
  props: {
    visible: Boolean,
  },
  data() {
    return {
      selectedVehicle: 'sports_car',
      vehicles: [],
      levels: [1, 2, 3, 4, 5],
      showTutorialModal: false,
      arrowLeft: arrowLeft,
      arrowRight: arrowRight,
      gyroPhone: gyroPhone,
      logo: logo,
    };
  },
  mounted() {
    const isProduction = import.meta.env.PROD;
    const baseURL = isProduction
      ? 'https://webte1.fei.stuba.sk/~xmuzslay/anbzvavapva/'
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
          return '';
      }
    },
    closeModalAndNotify() {
      this.$emit('close', this.selectedVehicle);
      console.log('Modal closed');
      eventBus.emit('closeModal');
      eventBus.emit(EVENTS.START_GAME, this.selectedLevel); // Emit event to start the game with the selected level
      eventBus.emit('vehicle-selected', this.selectedVehicle);
      eventBus.emit(EVENTS.SET_CURRENT_LEVEL, this.selectedLevel);
    },
    getSelectedVehicleDetails() {
      const selectedVehicle = this.vehicles.find(
        (vehicle) => vehicle.value === this.selectedVehicle
      );
      return selectedVehicle
        ? `${selectedVehicle.name} - Lives: ${selectedVehicle.lives}, Speed: ${Math.round(selectedVehicle.speed)}`
        : '';
    },
    showTutorial() {
      this.showTutorialModal = true;
    },
    closeTutorialModal() {
      this.showTutorialModal = false;
    },
    startGame(selectedLevel) {
      // Close the modal and start the game with the selected level
      this.$emit('close', this.selectedVehicle);
      console.log('Modal closed');
      eventBus.emit('closeModal');
      eventBus.emit(EVENTS.START_GAME, selectedLevel); // Emit event to start the game with the selected level
      eventBus.emit('vehicle-selected', this.selectedVehicle);
      eventBus.emit(EVENTS.SET_CURRENT_LEVEL, selectedLevel);
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

  .tutorial-list li {
    font-weight: bolder;
    color: rgb(31, 30, 30);
    margin-top: 5px;
    margin-left: 0px;
  }

  p {
    font-weight: bolder;
    color: rgb(31, 30, 30);
  }

  h2 {
    font-weight: bolder;
    color: rgb(31, 30, 30);
  }

  .icon-li {
    list-style-type: none;
    margin: 0;
    margin-top: 0;
  }

  .icon-label {
    margin-bottom: 0;
  }

  .modal {
    background: rgb(233, 135, 6);
    padding: 45px;
    padding-top: 20px;
    border-radius: 8px;
    width: 400px;

    position: relative;
    z-index: 3;
  }

  .tutorial-modal {
    background: #7e7c7c;
    padding: 20px;
    border-radius: 8px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 4;
  }

  .tutorial-banner {
    text-align: center;
    color: rgb(233, 135, 6);
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
    height: 35px;
    border-radius: 5px;
    text-align: center;
    align-self: center;
    display: block;
    margin-left: auto;
    margin-right: auto;
    background-color: #4caf50;
    font-weight: bolder;
    cursor: pointer;
    border: none;
    color: white;
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

  .tutorial-button {
    margin-top: 10px;
    padding: 8px 16px;
    background-color: #564caf;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bolder;
  }

  .close_tutorial {
    margin-top: 25px;
    width: 125px;
    height: 35px;
    border-radius: 5px;
    text-align: center;
    align-self: center;
    display: block;
    margin-left: auto;
    margin-right: auto;
    background-color: #003cff;
    font-weight: bolder;
    cursor: pointer;
    border: none;
    color: white;
  }

  #vehicle-details {
    text-align: center;
    margin-bottom: 20px;
  }

  .level-buttons {
    display: inline-block;
    text-align: center;
  }

  .level-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #564caf;
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bolder;
    margin: 5px;
  }

  .level-button.selected {
    background-color: #003cff;
  }

  .level-button span {
    display: inline-block;
  }
</style>
