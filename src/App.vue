<script setup>
import GameRender from './components/GameRender.vue';
import Modal from './components/Modal.vue';
import { ref } from 'vue';
import '@/assets/main.css';


</script>

<template>
  <div class="main-container">
    <GameRender @level-finished="openModal" @game-over="openModal" />
    <Modal :visible="isModalVisible" @close="closeModal" />

  </div>
  <footer>
    &copy; JT115106 and peter115342
  </footer>
</template>

<script>
import backgroundMusic from '@/assets/background-music.wav';

const audio = new Audio(backgroundMusic);
audio.loop = true;

export default {
  data() {
    return {
      isModalVisible: true,
    };
  },
  methods: {
    closeModal() {
      this.playBackgroundMusic();
      this.isModalVisible = false;
    },
    openModal() {
      this.pauseBackgroundMusic();
      this.isModalVisible = true;
    },
    playBackgroundMusic() {
      if (audio.paused) {
        audio.play();
      } else {
        audio.currentTime = 0;
      }
    },
    pauseBackgroundMusic() {
      audio.pause();
    },
  },
  mounted() {
    document.title = 'Speedy Escape';
  },
};
</script>
<style  >
body {
  margin: 0;
  margin-top: 0;
  text-align: center;
  overflow: hidden;
  background-color: rgb(145, 145, 132);
}

.main-container {
  position: relative;
  width: 100vw;
  height: 95vh;
  margin-top: 0;
  max-width: 600px;
  margin: 0 auto;
  overflow: hidden;
}

footer{
  padding-top: 10px;
  font-weight: bolder;
  color: rgb(62, 61, 61);
  text-align: center;
  justify-self: center;
}


@media print {
  body {
    visibility: hidden;
  }
  .tutorial-modal{
    visibility: visible;
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>