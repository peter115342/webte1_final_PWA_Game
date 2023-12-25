<script setup>
import GameRender from './components/GameRender.vue';
import Modal from './components/Modal.vue';
</script>

<template>
  <div class="main-container">
    <GameRender />
    <Modal :visible="isModalVisible" @close="closeModal" />
  </div>
</template>

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

@media (max-width: 1024px) {

}
</style>

<script>
export default {
  data() {
    return {
      isModalVisible: false,
    };
  },
  mounted() {
    this.isModalVisible = true;
  },
  methods: {
    closeModal() {
      this.isModalVisible = false;
    },
  },
};
</script>
