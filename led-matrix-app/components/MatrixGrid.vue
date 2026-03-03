<template>
  <div 
    class="matrix-grid" 
    @mousedown="startDrawing" 
    @mouseup="stopDrawing" 
    @mouseleave="stopDrawing"
    @dragstart.prevent
  >
    <div 
      v-for="(row, rIndex) in currentFrame" 
      :key="'r-'+rIndex" 
      class="matrix-row"
    >
      <div 
        v-for="(color, cIndex) in row" 
        :key="'c-'+cIndex" 
        class="matrix-cell"
        :style="{ backgroundColor: color }"
        @mousedown="applyTool(rIndex, cIndex)"
        @mouseenter="onMouseEnter(rIndex, cIndex)"
      >
        <div class="led-inner"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const store = useMatrixStore()
const { currentFrame, applyTool } = store

const isDrawing = ref(false)

const startDrawing = () => {
  isDrawing.value = true
}

const stopDrawing = () => {
  isDrawing.value = false
}

const onMouseEnter = (row: number, col: number) => {
  if (isDrawing.value) {
    applyTool(row, col)
  }
}
</script>

<style scoped>
.matrix-grid {
  display: flex;
  flex-direction: column;
  background: #111;
  border: 4px solid #222;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8), 0 0 10px rgba(88, 166, 255, 0.1);
  cursor: crosshair;
  user-select: none;
  padding: 4px;
  gap: 2px;
}

.matrix-row {
  display: flex;
  gap: 2px;
}

.matrix-cell {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  transition: transform 0.05s;
  position: relative;
  background-color: var(--matrix-bg);
  box-shadow: inset 0 0 2px rgba(0,0,0,0.8);
}

.led-inner {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border-radius: 2px;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%);
  pointer-events: none;
}

.matrix-cell:hover {
  transform: scale(1.1);
  z-index: 10;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}
</style>
