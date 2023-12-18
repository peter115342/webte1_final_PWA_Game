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
  text-align: center;
}

.main-container {
  margin: 0 auto;
  position: relative;
  width: 600px;
  height: 596px;
  margin-top: 325px;
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