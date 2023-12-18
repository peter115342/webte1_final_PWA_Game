<template>
    <div class="render" ref="renderWindow" @keydown="handleKeyDown" tabindex="0">
      <img :style="{ left: `${imagePosition.x}px`, top: `${imagePosition.y}px`, width: `55px` }" src="/images/car_sport.png" alt="Car" />
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        imagePosition: { x: 0, y: 0 },
        moveStep: 3,
        imageWidth: 55,
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
        // Calculate the new x-coordinate
        const newX = this.imagePosition.x + deltaX;
  
        if (newX >= 0 && newX + this.imageWidth <= renderWindowWidth) {
          this.imagePosition.x = newX;
        }
      },
    },
    mounted() {
      this.imagePosition.x = (this.$refs.renderWindow.clientWidth - this.imageWidth) / 2;
      this.imagePosition.y = (this.$refs.renderWindow.clientHeight - this.imageWidth) / 1.25;
  
      // Add event listener for keydown events on the document
      document.addEventListener('keydown', this.handleKeyDown);
    },
    beforeDestroy() {
      // Remove event listener when the component is destroyed
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
    animation: scrollBackground 5s linear infinite; /* Adjust the speed (5s) and direction here */
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
  