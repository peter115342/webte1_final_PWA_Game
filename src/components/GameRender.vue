<template>
  <div class="render" ref="renderWindow" @keydown="handleKeyDown" tabindex="0">
    <img
      :style="{ left: `${imagePosition.x}px`, top: `${imagePosition.y}px`, width: `55px` }"
      :src="selectedVehicleImage"
      alt="Car"
    />
    <img
      v-for="obstacle in visibleObstacles"
      :key="obstacle.id"
      :style="{ left: `${obstacle.x}px`, top: `${obstacle.y}px`, width: `${obstacle.width}px`, zIndex: obstacle.zIndex }"
      :src="obstacle.image"
      alt="Obstacle"
      @collision="handleCollision"
    />
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, createApp } from 'vue';
import { eventBus } from './utils/eventBus.js';

export default {
  data() {
    return {
      imagePosition: { x: 0, y: 0 },
      moveStep: 3, // Initial moveStep
      imageWidth: 55,
      selectedVehicleImage: '/images/car_sport.png',
      vehicles: [],
      selectedVehicle: 'sports_car',
      selectedVehicleSpeed: 3,
      selectedVehicleLives: 1,
      obstacles: [],
      visibleObstacles: [],
      modalClosed: false,
      obstacleInterval: null, // Declare obstacleInterval here
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

        // Update moveStep based on the selected vehicle's speed
        this.moveStep = 3 * this.selectedVehicleSpeed;
      } else {
        console.warn('Vehicle not found:', vehicle);
      }
    },
    isObstacleOutsideRenderArea(obstacle) {
      const renderWindowHeight = this.$refs.renderWindow.clientHeight;
      return obstacle.y > renderWindowHeight - 75;
    },
    checkCollision(obstacle) {
      const carLeft = this.imagePosition.x;
      const carRight = this.imagePosition.x + this.imageWidth;
      const carTop = this.imagePosition.y;
      const carBottom = this.imagePosition.y + this.imageWidth;

      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;
      const obstacleTop = obstacle.y;
      const obstacleBottom = obstacle.y + obstacle.height;

      return (
        carLeft < obstacleRight &&
        carRight > obstacleLeft &&
        carTop < obstacleBottom &&
        carBottom > obstacleTop
      );
    },
    handleCollision() {
      console.log('Collision with obstacle!');
      console.log('Car crashed!');
      window.location.reload();
    },
    addObstacle() {
      // Check if the modal is closed
      if (this.modalClosed) {
        console.log('Adding obstacle...');

        const images = [
          '/images/obstacle_van.png',
          '/images/obstacle_taxi.png',
          '/images/obstacle_ambulance.png',
        ];

        const newObstacle = {
          id: this.obstacles.length + 1,
          x: Math.random() * 400,
          y: -50,
          width: 55,
          speed: this.selectedVehicleSpeed,
          image: images[Math.floor(Math.random() * images.length)],
          zIndex: 0, // Initial zIndex
        };

        this.obstacles.push(newObstacle);
        this.visibleObstacles.push(newObstacle);
      }
    },
    closeModal() {
      this.modalClosed = true;
      // Start obstacle movement when the modal is closed
      this.startObstacleMovement();
    },
    startObstacleMovement() {
      // Clear existing interval if any
      clearInterval(this.obstacleInterval);
      // Start the interval for obstacle movement
      this.obstacleInterval = setInterval(() => {
        this.visibleObstacles.forEach((obstacle) => {
          obstacle.y += obstacle.speed;
          obstacle.zIndex = 0; // Update zIndex based on y-position
          if (this.checkCollision(obstacle)) {
            eventBus.emit('collision');
          }
        });

        this.visibleObstacles = this.visibleObstacles.filter(
          (obstacle) => !this.isObstacleOutsideRenderArea(obstacle)
        );

        if (this.visibleObstacles.length === 0) {
          this.addObstacle();
        }
      }, 16);
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

    // Initialize obstacles
    this.addObstacle(); // Add the first obstacle

    this.imagePosition.x = (this.$refs.renderWindow.clientWidth - this.imageWidth) / 2;
    this.imagePosition.y = (this.$refs.renderWindow.clientHeight - this.imageWidth) / 1.25;

    eventBus.on('vehicle-selected', this.updateSelectedVehicle);
    eventBus.on('closeModal', this.closeModal);

    document.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    eventBus.off('vehicle-selected', this.updateSelectedVehicle);
    clearInterval(this.obstacleInterval);
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
}

img {
  position: absolute;
}
</style>
