<template>
    <div class="render" ref="renderWindow" @keydown="handleKeyDown" tabindex="0">
      <img :style="{ left: `${imagePosition.x}px`, top: `${imagePosition.y}px`, width: `55px` }" src="/images/car_sport.png" alt="Car" />
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        imagePosition: { x: 250, y: 350 },
        moveStep: 10,
        imageWidth: 55,
      };
    },
    methods: {
      handleKeyDown(event) {
        this.$nextTick(() => {
          const renderWindowWidth = this.$refs.renderWindow.clientWidth;
  
          switch (event.key) {
            case 'ArrowLeft':
              this.moveImage(-this.moveStep, 0, renderWindowWidth);
              break;
            case 'ArrowRight':
              this.moveImage(this.moveStep, 0, renderWindowWidth);
              break;
          }
        });
      },
      moveImage(deltaX, deltaY, renderWindowWidth) {
        // Calculate the new x-coordinate
        const newX = this.imagePosition.x + deltaX;
  
        if (newX >= 0 && newX + this.imageWidth <= renderWindowWidth) {
          this.imagePosition.x = newX;
        }
      },
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
  