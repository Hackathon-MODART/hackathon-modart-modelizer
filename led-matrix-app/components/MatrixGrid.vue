<template>
  <div class="matrix-container">
    <div v-if="stableColorPallete.length > 0" class="color-palette glass">
      <span class="palette-label">Colors in frame:</span>
      <div 
        v-for="item in stableColorPallete" 
        :key="item.original" 
        class="palette-item-container"
      >
        <div 
          class="color-item" 
          :title="`Change all ${item.original} pixels`"
          @mouseenter="hoveredPaletteColor = item.current"
          @mouseleave="hoveredPaletteColor = null"
        >
          <input 
            type="color" 
            :value="item.current"
            @mouseenter="hoveredPaletteColor = item.current"
            @mouseleave="hoveredPaletteColor = null"
            @mousedown="onColorInputStart(item.current)"
            @input="(e) => changeColorInFrame(item.original, item.current, e)"
            class="palette-input"
          />
        </div>
        <button 
          v-if="item.current.toUpperCase() !== item.original.toUpperCase()" 
          class="reset-mini-btn" 
          @click="resetColorInFrame(item.original, item.current)"
          title="Reset to original color"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
        </button>
      </div>
    </div>

    <div class="shift-wrapper">
      <!-- Top arrow -->
      <div class="shift-row shift-top">
        <button class="shift-btn" @click="store.shiftGrid('up')" title="Shift Up">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </button>
      </div>

      <div class="shift-middle">
        <!-- Left arrow -->
        <button class="shift-btn" @click="store.shiftGrid('left')" title="Shift Left">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <!-- Matrix -->
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

        <!-- Right arrow -->
        <button class="shift-btn" @click="store.shiftGrid('right')" title="Shift Right">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <!-- Bottom arrow -->
      <div class="shift-row shift-bottom">
        <button class="shift-btn" @click="store.shiftGrid('down')" title="Shift Down">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMatrixStore, COLS, ROWS, DEFAULT_COLOR } from '../composables/useMatrixStore'

const store = useMatrixStore()
const { currentFrame, applyTool } = store

const hoveredPaletteColor = ref<string | null>(null)

const stableColorPallete = ref<{ original: string, current: string }[]>([])

// Logic to keep the palette stable while editing
const updateStablePalette = () => {
  const colors = new Set<string>()
  if (!currentFrame.value) {
    stableColorPallete.value = []
    return
  }
  
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      colors.add(currentFrame.value[r][c].toUpperCase())
    }
  }

  const newColors = Array.from(colors)
  
  // Update existing or add new
  const updatedPalette = newColors.map(hex => {
    const existing = stableColorPallete.value.find(item => item.current === hex)
    return existing ? existing : { original: hex, current: hex }
  })

  // Remove colors no longer in frame (optional, maybe keep them if they are being edited?)
  stableColorPallete.value = updatedPalette
}

// Initial load and watch for frame changes
watch(currentFrame, () => {
  // Only refresh if no major editing is happening? 
  // For now, simpler: refresh on frame change
  updateStablePalette()
}, { immediate: true, deep: true })

const onColorInputStart = (currentColor: string) => {
  store.saveSnapshot()
}

const changeColorInFrame = (originalColor: string, currentColor: string, event: Event) => {
  const newColor = (event.target as HTMLInputElement).value.toUpperCase()
  if (!currentFrame.value) return

  // Update data in grid
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (currentFrame.value[r][c].toUpperCase() === currentColor.toUpperCase()) {
        currentFrame.value[r][c] = newColor
      }
    }
  }

  // Update stable palette current state to keep the input bound
  const item = stableColorPallete.value.find(i => i.original === originalColor)
  if (item) item.current = newColor
}

const resetColorInFrame = (originalColor: string, currentColor: string) => {
  if (!currentFrame.value) return
  store.saveSnapshot()

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (currentFrame.value[r][c].toUpperCase() === currentColor.toUpperCase()) {
        currentFrame.value[r][c] = originalColor.toUpperCase()
      }
    }
  }

  const item = stableColorPallete.value.find(i => i.original === originalColor)
  if (item) item.current = originalColor.toUpperCase()
}

const isDrawing = ref(false)

const startDrawing = () => {
  // Save undo snapshot once at the start of a drawing stroke
  store.saveSnapshot()
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
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  flex-wrap: wrap;
  max-width: 100%;
}

.palette-item-container {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
}

.reset-mini-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-secondary);
  border-radius: 4px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.reset-mini-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: rotate(-45deg);
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

/* Shift wrapper layout */
.shift-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.shift-row {
  display: flex;
  justify-content: center;
}

.shift-middle {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shift-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
}

.shift-btn:hover {
  background: rgba(88, 166, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(88, 166, 255, 0.4);
}

.shift-btn:active {
  background: rgba(88, 166, 255, 0.3);
  transform: scale(0.92);
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
