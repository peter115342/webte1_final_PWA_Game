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
    />

    <div class="lives-container"> Lives : {{ selectedVehicleLives }}</div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, createApp } from 'vue';
import { eventBus } from './utils/eventBus.js';

export default {
  data() {
    return {
      imagePosition: { x: 0, y: 0 },
      moveStep: 3,
      imageWidth: 55,
      selectedVehicleImage: '/images/car_sport.png',
      vehicles: [],
      selectedVehicle: 'sports_car',
      selectedVehicleSpeed: 3,
      selectedVehicleLives: 1,
      obstacles: [],
      visibleObstacles: [],
      modalClosed: false,
      obstacleInterval: null,
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

        this.moveStep = 3 * this.selectedVehicleSpeed;
      } else {
        console.warn('Vehicle not found:', vehicle);
      }
    },
    isObstacleOutsideRenderArea(obstacle) {
      const renderWindowHeight = this.$refs.renderWindow.clientHeight;
      return obstacle.y > renderWindowHeight - 75;
    },

    checkCollision() {
      const carLeft = this.imagePosition.x;
      const carRight = carLeft + this.imageWidth;
      const carTop = this.imagePosition.y;
      const carBottom = carTop + this.imageWidth;

      const obstacle = this.visibleObstacles[0];

      if (!obstacle || obstacle.collided) {
        return false;
      }

      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacleLeft + 55;
      const obstacleTop = obstacle.y;
      const obstacleBottom = obstacleTop + 55;

      const horizontalOverlap = carLeft < obstacleRight && carRight > obstacleLeft;
      const verticalOverlap = carTop < obstacleBottom && carBottom > obstacleTop;

      if (horizontalOverlap && verticalOverlap) {
        console.log('Collision Detected:');
        this.handleCollision();

        obstacle.collided = true;

        this.visibleObstacles = this.visibleObstacles.filter((o) => o !== obstacle);

        return true;
      }

      return false;
    },

    handleCollision() {
      console.log('Collision with obstacle!');

      if (this.selectedVehicleLives > 0) {
        this.selectedVehicleLives -= 1;

        if (this.selectedVehicleLives === 0) {
          console.log('Game Over!');
        } else {
          console.log(`Lives remaining: ${this.selectedVehicleLives}`);
        }
      }
    },

    addObstacle() {
      if (this.modalClosed && this.selectedVehicleLives > 0) {
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
          zIndex: 0,
        };

        this.obstacles.push(newObstacle);
        this.visibleObstacles.push(newObstacle);
      }
    },
    closeModal() {
      this.modalClosed = true;
      this.startObstacleMovement();
    },
    startObstacleMovement() {
      clearInterval(this.obstacleInterval);
      this.obstacleInterval = setInterval(() => {
        if (this.selectedVehicleLives > 0) {
          this.visibleObstacles.forEach((obstacle) => {
            obstacle.y += obstacle.speed;
            obstacle.zIndex = 0;
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
        } else {
          clearInterval(this.obstacleInterval);
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

    this.addObstacle();

    this.imagePosition.x = (this.$refs.renderWindow.clientWidth - this.imageWidth) / 2;
    this.imagePosition.y = (this.$refs.renderWindow.clientHeight - this.imageWidth) / 1.2;

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
.lives-container {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 28px;
  color: rgb(210, 26, 5);
  font-weight: bolder;
}
</style>
