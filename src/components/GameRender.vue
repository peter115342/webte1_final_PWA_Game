<template>
  <div class="render" ref="renderWindow" @keydown="handleKeyDown" tabindex="0">
    <img
    :style="{ left: `${imagePosition.x}px`, top: `${imagePosition.y}px`, width: `${vehicleSize}px` }"
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
    <img class="hint-button" :src="hint_icon" alt="Hint" @click="toggleHintModal" />

    <div v-if="showHintModal" class="hint-modal">
  <div class="hint-content">
    <p v-if="isMobile">Steer by tilting your device</p>
    <p v-else>Steer using arrow keys</p>
    <div class="hint-images-container">
      <img id="gyro" v-if="isMobile" class="hint-image" :src="gyroPhone" alt="Gyro" style="width: 60px; height: 60px;" />
      <div  v-else class="hint-images-container" >
        <img  id="left-arrow" class="hint-image" :src="arrowLeft" alt="Left"/>
        <img  id="right-arrow" class="hint-image" :src="arrowRight" alt="Right"/>
      </div>
    </div>
  </div>
</div>
    <div class="lives-container"> Lives: {{ selectedVehicleLives }}</div>

    
      <img :src="pause" alt="Speedy Escape"  @click="togglePause"  class="pause-button" />
    <img v-if="paused" class="pause-image" :src="pause" alt="Pause" />
    <button v-if="paused" class="menu-button" @click="resetGameAndTogglePause">Menu</button>


    <div class="level-counter">Level: {{ currentLevel }} - {{ getCurrentLevelDifficulty() }}</div>
  </div>
</template>

<script>
import carMuscleImage from '@/assets/car_muscle.png';
import carSportImage from '@/assets/car_sport.png';
import carTruckImage from '@/assets/car_truck.png';
import obstacleAmbulanceImage from '@/assets/obstacle_ambulance.png';
import obstacleTaxiImage from '@/assets/obstacle_taxi.png';
import obstacleVanImage from '@/assets/obstacle_van.png';
import { EVENTS, eventBus } from './utils/eventBus.js'; // Import EVENTS from eventBus.js

import arrowLeft from '@/assets/arrow_left.svg';
import arrowRight from '@/assets/arrow_right.svg';
import gyroPhone from '@/assets/gyro_phone.svg';
import hint_icon from '@/assets/hint.svg';
import logo from '@/assets/logo.png';
import pause from '@/assets/pause.svg';
export default {
  data() {
    return {
      imagePosition: { x: 0, y: 0 },
      moveStep: 3,
      imageWidth: 65,
      selectedVehicleImage: carSportImage,
      vehicles: [],
      selectedVehicle: 'sports_car',
      selectedVehicleSpeed: 3,
      selectedVehicleLives: 1,
      obstacles: [],
      visibleObstacles: [],
      modalClosed: false,
      obstacleInterval: null,
      currentLevel: 1,
      maxObstacles: 0,
      levels: [],
      finishLine: { x: 0, y: 0, speed: 2 },
      passedObstaclesCount: 0,
      displayModal: true,
      isGyroscopeSupported: false,
      logo: logo,
      pause : pause,
      hint_icon:hint_icon,
      paused: false,
      showHintModal: false,
      arrowLeft: arrowLeft,
      arrowRight: arrowRight,
      gyroPhone: gyroPhone,
      vehicleSize: window.innerWidth <= 600 ? 40 : 65,
    };
  },
  methods: {
    handleKeyDown(event) {
      if (this.paused) return;

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
    updateVehicleSize() {
      this.vehicleSize = window.innerWidth <= 600 ? 40 : 65;
    },
    moveImage(deltaX, deltaY, renderWindowWidth) {
      const newX = this.imagePosition.x + deltaX;

      if (newX >= 0 && newX + this.imageWidth <= renderWindowWidth) {
        this.imagePosition.x = newX;
      }
    },
    getCurrentLevelDifficulty() {
      const level = this.levels.find((lvl) => lvl.id === this.currentLevel);

      if (level) {
        return level.difficulty;
      } else {
        console.warn('Level not found:', this.currentLevel);
        return 'Unknown';
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
    resetGameAndTogglePause() {
    this.togglePause();
    this.$emit('game-over');
    this.resetGame(true);
  },

    checkCollision(obstacle) {
      const carLeft = this.imagePosition.x;
      const carRight = carLeft + this.imageWidth;
      const carTop = this.imagePosition.y;
      const carBottom = carTop + this.imageWidth;

      if (!obstacle || obstacle.collided) {
        return false;
      }

      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacleLeft + 65;
      const obstacleTop = obstacle.y;
      const obstacleBottom = obstacleTop + 65;

      const horizontalOverlap = carLeft - 5 < obstacleRight && carRight + 5 > obstacleLeft;
      const verticalOverlap = carTop - 5 < obstacleBottom && carBottom + 5 > obstacleTop;

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
          this.$emit('game-over');
          this.resetGame();
        } else {
          console.log(`Lives remaining: ${this.selectedVehicleLives}`);
        }
      }
    },

    addObstacle() {
  if (this.modalClosed && this.selectedVehicleLives > 0 && this.visibleObstacles.length < this.maxObstacles) {
    console.log('Adding obstacle...');

    const images = [obstacleVanImage, obstacleTaxiImage, obstacleAmbulanceImage];

    const obstacleWidth = window.innerWidth <= 600 ? 40 : 65;

    const newObstacle = {
      id: this.obstacles.length + 1,
      x: Math.random() * (this.$refs.renderWindow.clientWidth - obstacleWidth),
      y: Math.random() * -450,
      width: obstacleWidth,
      speed: this.selectedVehicleSpeed * 2,
      image: images[Math.floor(Math.random() * images.length)],
      zIndex: 0,
    };

    const collision = this.visibleObstacles.some((obstacle) => {
      const horizontalGap = 25;
      const verticalGap = 25;

      const horizontalOverlap = Math.abs(newObstacle.x - obstacle.x) < obstacleWidth + horizontalGap;
      const verticalOverlap = Math.abs(newObstacle.y - obstacle.y) < obstacleWidth + verticalGap;

      return horizontalOverlap && verticalOverlap;
    });
    if (!collision) {
      this.obstacles.push(newObstacle);
      this.visibleObstacles.push(newObstacle);

      this.passedObstaclesCount++;
    }
  }
},
openHintModal() {
      this.showHintModal = true;
    },

    closeHintModal() {
      this.showHintModal = false;
    },
    toggleHintModal() {
      this.showHintModal = !this.showHintModal;
    },
    resetGame() {
      this.obstacles = [];
      this.visibleObstacles = [];
      this.passedObstaclesCount = 0;
      this.displayModal = true;
      this.modalClosed = false;
      this.paused = false;
    },

    togglePause() {
      this.paused = !this.paused;
      if (this.paused) {
        clearInterval(this.obstacleInterval);
      } else {
        this.startObstacleMovement();
      }
    },

    closeModal() {
      this.modalClosed = true;
      this.startObstacleMovement();
    },
    getCarImage(carName) {
      switch (carName.toLowerCase()) {
        case 'sports car':
          return carSportImage;
        case 'muscle car':
          return carMuscleImage;
        case 'pickup truck':
          return carTruckImage;
        default:
          console.warn('Car image not found for:', carName);
          return carSportImage;
      }
    },

    setMaxObstacles(difficulty) {
  switch (difficulty) {
    case 'easy':
      this.maxObstacles = 2;
      break;
    case 'medium':
      this.maxObstacles = 4;
      break;
    case 'hard':
      this.maxObstacles = 6;
      break;
    default:
      this.maxObstacles = 0;
  }
},
isLevelCompleted(level) {
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || [];
    return completedLevels.includes(level);
},
loadLevel(levelId) {
  const level = this.levels.find((lvl) => lvl.id === levelId);

  if (level) {
    this.setMaxObstacles(level.difficulty);
  } else {
    console.warn('Level not found:', levelId);
  }
},
startGame(selectedLevel) {
  this.currentLevel = selectedLevel;
  this.displayModal = false;
  this.loadLevel(this.currentLevel);
  this.startObstacleMovement();
},
startObstacleMovement() {
  clearInterval(this.obstacleInterval);
  this.obstacleInterval = setInterval(() => {
    if (this.selectedVehicleLives > 0 && !this.paused) {
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

      if (this.visibleObstacles.length < this.maxObstacles) {
        this.addObstacle();
      }

      const currentLevel = this.levels.find((lvl) => lvl.id === this.currentLevel);
      const difficulty = currentLevel ? currentLevel.difficulty : '';

      let obstaclesToPass = 15;
      switch (difficulty) {
        case 'easy':
          obstaclesToPass = 15;
          break;
        case 'medium':
          obstaclesToPass = 30;
          break;
        case 'hard':
          obstaclesToPass = 45;
          break;
      }

      if (this.passedObstaclesCount >= obstaclesToPass) {
        this.nextLevel();
      }
    }
  }, 16);
},


    nextLevel() {
  const completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || [];
  completedLevels.push(this.currentLevel);
  localStorage.setItem('completedLevels', JSON.stringify(completedLevels));

  this.passedObstaclesCount = 0;
  this.currentLevel++;
  this.displayModal = true;
  this.loadLevel(this.currentLevel);

  this.imagePosition.x = (this.$refs.renderWindow.clientWidth - this.imageWidth) / 2;
  this.imagePosition.y = (this.$refs.renderWindow.clientHeight - this.imageWidth) / 1.2;

  this.resetGame();
  this.$emit('level-finished');
  console.log('Event emitted:', this.currentLevel);
},

    handleGyroscope(event) {
      if (event.beta !== null && event.gamma !== null) {
        const tiltLR = event.gamma / 2;
        const tiltFB = event.beta / 4;
        this.moveCarWithGyroscope(tiltLR, tiltFB);
      }
    },

    moveCarWithGyroscope(tiltLR) {
      const sensitivity = 2.5;
      const newX = this.imagePosition.x + tiltLR * sensitivity;

      const renderWindowWidth = this.$refs.renderWindow.clientWidth;

      if (newX >= 0 && newX + this.imageWidth <= renderWindowWidth) {
        this.imagePosition.x = newX;
      }
    },
  },
  computed: {
    isMobile() {
      return window.innerWidth <= 600;
    },
  },
  mounted() {
    const isProduction = process.env.NODE_ENV === 'production';
    const baseURL = isProduction ? 'https://webte1.fei.stuba.sk/~xmuzslay/anbzvavapva/' : '/';
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
      const completedLevelsKey = 'completedLevels';
  const storedCompletedLevels = localStorage.getItem(completedLevelsKey);

  if (!storedCompletedLevels || JSON.parse(storedCompletedLevels).length === 0) {
    const initialCompletedLevels = [-1];
    localStorage.setItem(completedLevelsKey, JSON.stringify(initialCompletedLevels));
  }
    const levelsPath = `${baseURL}levels.json`;
    fetch(levelsPath)
      .then((response) => response.json())
      .then((data) => {
        this.levels = data.levels;
        this.loadLevel(this.currentLevel);
      });

    this.imagePosition.x = (this.$refs.renderWindow.clientWidth - this.imageWidth) / 2;
    if (window.innerWidth <= 600) {
      this.imagePosition.y = (this.$refs.renderWindow.clientHeight - this.imageWidth) / 1.21;
    } else {
      this.imagePosition.y = (this.$refs.renderWindow.clientHeight - this.imageWidth) / 1.2;
    }

    eventBus.on('vehicle-selected', this.updateSelectedVehicle);
    eventBus.on('closeModal', this.closeModal);
    eventBus.on(EVENTS.SET_CURRENT_LEVEL, this.handleSetCurrentLevel);
    eventBus.on(EVENTS.START_GAME, (selectedLevel) => {
    this.startGame(selectedLevel);
  });
    document.addEventListener('keydown', this.handleKeyDown);

    if (window.DeviceOrientationEvent) {
      this.isGyroscopeSupported = true;

      window.addEventListener('deviceorientation', this.handleGyroscope);
    } else {
      console.warn('Gyroscope not supported on this device.');
    }

    if (this.displayModal) {
    }
    this.updateVehicleSize();

    window.addEventListener('resize', this.updateVehicleSize);
  },
  beforeDestroy() {
    eventBus.off('vehicle-selected', this.updateSelectedVehicle);
    clearInterval(this.obstacleInterval);
    document.removeEventListener('keydown', this.handleKeyDown);
    eventBus.off(EVENTS.SET_CURRENT_LEVEL, this.handleSetCurrentLevel);

    window.removeEventListener('deviceorientation', this.handleGyroscope);
    window.removeEventListener('resize', this.updateVehicleSize);
  },
};
</script>

<style scoped>
.render {
  width: 100%;
  height: 100%;
  background-image: url("@/assets/background_road.png");
  background-size: cover;
  position: relative;
  margin: 0 auto;
}

img {
  position: absolute;
}


  .lives-container,
  .finish-line,
  .level-counter {
    font-size: 2px;
  }
  .logo-container {
    position: absolute;
  bottom: 50px;
  left: 25%;
  cursor: pointer;
}
.lives-container {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 28px;
  color: rgb(210, 26, 5);
  font-weight: bolder;
}



.level-counter {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 28px;
  color: #08fcab;
  font-weight: bolder;
}
.pause-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
}
.menu-button{
  position: absolute;
  top: 64%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 32px;
  width: 80px;
  font-size: 18px;
  font-weight: bolder;
  background-color: rgb(210, 26, 5);
  border: none;
  color: #f4f4f4;
  border-radius: 7px;
  cursor: pointer;

}


.hint-button {
  position: absolute;
  top: 10px;
  left: 10px;
  cursor: pointer;
  width: 80px;
  height: 55px;
}
.pause-button {
  position: absolute;
  top: 85px;
  left: 10px;
  cursor: pointer;
  width: 85px;
  height: 65px;
}

.hint-modal {
  position: absolute;
  top: 70px;
  left: 10px;
  width: 125px;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hint-content {
  background: rgba(131, 130, 130, 0.9);
  padding: 20px;
  border-radius: 5px;
  height: 120px;
  text-align: center;
  z-index: 1;
}
.hint-images-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
}

.hint-image {
  width: 50px;
  height: 50px;
  margin-top: 25px;
}

#left-arrow{
  transform: translateX(-50%);
}
#right-arrow{
  transform: translateX(50%);
} 

</style>