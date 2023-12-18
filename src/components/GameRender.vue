<template>
    <div class="render" ref="renderWindow" @keydown="handleKeyDown" tabindex="0">
      <img
        :style="{ left: `${imagePosition.x}px`, top: `${imagePosition.y}px`, width: `55px` }"
        :src="selectedVehicleImage"
        alt="Car"
      />
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { eventBus } from './utils/eventBus.js';
  
  export default {
    data() {
      return {
        imagePosition: { x: 0, y: 0 },
        moveStep: 3,
        imageWidth: 55,
        vehicles: [],
        selectedVehicle: "sports_car",
        selectedVehicleSpeed: 3,
        selectedVehicleImage: '/images/car_sport.png',
        selectedVehicleLives: 1

      };
    },
    methods: {
      handleKeyDown(event) {
        const renderWindowWidth = this.$refs.renderWindow.clientWidth;
  
        switch (event.key) {
          case 'ArrowLeft':
            this.moveImage(-this.moveStep, 0, renderWindowWidth);
            break;
          case 'ArrowRight':
            this.moveImage(this.moveStep, 0, renderWindowWidth);
            break;
        }
      },
      moveImage(deltaX, deltaY, renderWindowWidth) {
        const newX = this.imagePosition.x + deltaX;
  
        if (newX >= 0 && newX + this.imageWidth <= renderWindowWidth) {
          this.imagePosition.x = newX;
        }
      },
      updateSelectedVehicle(vehicle) {
        const selectedVehicle = this.vehicles.find((v) => v.value === vehicle);
  
        if (selectedVehicle) {
          this.selectedVehicle = selectedVehicle;
          this.selectedVehicleImage = selectedVehicle.image;
          this.selectedVehicleLives = selectedVehicle.lives;
          this.selectedVehicleSpeed = selectedVehicle.speed;
          console.log('Selected Vehicle:', this.selectedVehicle);
        } else {
          console.warn('Vehicle not found:', vehicle);
        }
      },
    },
    mounted() {
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
  
      this.imagePosition.x = (this.$refs.renderWindow.clientWidth - this.imageWidth) / 2;
      this.imagePosition.y = (this.$refs.renderWindow.clientHeight - this.imageWidth) / 1.25;
  
      eventBus.on('vehicle-selected', this.updateSelectedVehicle);
  
      console.log('Updated Selected Vehicle from JSON:', this.selectedVehicle);
  
      document.addEventListener('keydown', this.handleKeyDown);
    },
    beforeDestroy() {
      eventBus.off('vehicle-selected', this.updateSelectedVehicle);
  
      document.removeEventListener('keydown', this.handleKeyDown);
    },
  };
  </script>
  
  <style scoped>
  .render {
    width: 100%;
    height: 100%;
    background-image: url("/images/background_road.png");
    background-size: cover;
    position: relative;
    margin: 0 auto;
    animation: scrollBackground 5s linear infinite;
  }
  
  @keyframes scrollBackground {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 100% 0;
    }
  }
  
  img {
    position: absolute;
  }
  </style>
  