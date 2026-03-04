<template>
  <div class="matrix-container">
    <div v-if="presentColors.length > 0" class="color-palette glass">
      <span class="palette-label">Colors in frame:</span>
      <div 
        v-for="c in presentColors" 
        :key="c" 
        class="color-item" 
        :title="`Change all ${c} pixels`"
        @mouseenter="hoveredPaletteColor = c"
        @mouseleave="hoveredPaletteColor = null"
      >
        <input 
          type="color" 
          :value="c"
          @mouseenter="hoveredPaletteColor = c"
          @mouseleave="hoveredPaletteColor = null"
          @change="(e) => changeColorInFrame(c, e)"
          class="palette-input"
        />
      </div>
    </div>

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
        :class="{ 'highlighted-cell': hoveredPaletteColor && color.toUpperCase() === hoveredPaletteColor }"
        :style="{ backgroundColor: color }"
        @mousedown="applyTool(rIndex, cIndex)"
        @mouseenter="onMouseEnter(rIndex, cIndex)"
      >
        <div class="led-inner"></div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMatrixStore, COLS, ROWS, DEFAULT_COLOR } from '../composables/useMatrixStore'

const store = useMatrixStore()
const { currentFrame, applyTool } = store

const hoveredPaletteColor = ref<string | null>(null)

const presentColors = computed(() => {
  const colors = new Set<string>()
  if (!currentFrame.value) return []
  
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const color = currentFrame.value[r][c]
      if (color !== DEFAULT_COLOR) {
        colors.add(color.toUpperCase())
      }
    }
  }
  return Array.from(colors)
})

const changeColorInFrame = (oldColor: string, event: Event) => {
  const newColor = (event.target as HTMLInputElement).value.toUpperCase()
  if (!currentFrame.value) return

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (currentFrame.value[r][c].toUpperCase() === oldColor) {
        currentFrame.value[r][c] = newColor
      }
    }
  }
}

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
.matrix-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.color-palette {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  flex-wrap: wrap;
  max-width: 100%;
}

.palette-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-right: 4px;
}

.color-item {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.color-item:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

.palette-input {
  width: 150%;
  height: 150%;
  border: none;
  cursor: pointer;
  background: none;
  padding: 0;
}

.highlighted-cell {
  box-shadow: 0 0 0 2px white, inset 0 0 2px rgba(0,0,0,0.8) !important;
  z-index: 5;
}

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
