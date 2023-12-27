<script setup>
import GameRender from './components/GameRender.vue';
import Modal from './components/Modal.vue';
import { ref } from 'vue';
</script>

<template>
  <div class="main-container">
    <GameRender @level-finished="openModal" />
    <Modal :visible="isModalVisible" @close="closeModal" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      isModalVisible: true,
    };
  },
  methods: {
    closeModal() {
      this.isModalVisible = false;
    },
    openModal() {
      this.isModalVisible = true;
    },
  },
};
</script>
<style scoped>
body {
  margin: 0;
  margin-top: 0;
  text-align: center;
  overflow: hidden;
}

.main-container {
  position: relative;
  width: 100vw;
  height: 95vh;
  max-width: 600px;
  margin: 0 auto;
  overflow: hidden;
}

@media (max-width: 600px) {
  .main-container {
    height: 90vh;
  }
}
</style>