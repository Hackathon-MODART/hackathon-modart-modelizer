<template>
  <div class="toolbar">
    <div class="tool-section">
      <label>Current Color</label>
      <input type="color" v-model="selectedColor" class="color-picker" />
      <div class="hex-value">{{ selectedColor.toUpperCase() }}</div>
    </div>

    <div class="tool-section">
      <label>Tools</label>
      <div class="button-group">
        <button 
          class="btn" 
          :class="{ active: currentTool === 'draw' }" 
          @click="currentTool = 'draw'"
          title="Draw (Pen)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
        </button>
        <button 
          class="btn" 
          :class="{ active: currentTool === 'erase' }" 
          @click="currentTool = 'erase'"
          title="Erase"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z"></path><path d="M17 14L7 20"></path></svg>
        </button>
        <button 
          class="btn" 
          :class="{ active: currentTool === 'fill' }" 
          @click="currentTool = 'fill'"
          title="Fill"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 11h-8m-2 0h-2m11 4h-5m-2 0h-2m7 4h-3m-2 0h-2M12 3a9 9 0 0 0-9 9v9h18v-9a9 9 0 0 0-9-9z"></path></svg>
        </button>
      </div>
    </div>

    <div class="tool-section">
      <label>Animations (Generators)</label>
      <div class="button-group-vertical">
        <button class="btn" @click="$emit('generateBlink')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Gen: Blink
        </button>
        <button class="btn" @click="$emit('generateCircle')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
          Gen: Expanding Circle
        </button>
      </div>
    </div>

    <div class="tool-section" style="margin-top: auto;">
      <button class="btn danger" @click="clearGrid">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        Clear Frame
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useMatrixStore()
const { selectedColor, currentTool, clearGrid } = store

const emit = defineEmits(['generateBlink', 'generateCircle'])
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.tool-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.color-picker {
  height: 44px;
  padding: 4px;
}

.hex-value {
  text-align: center;
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-primary);
  background: rgba(0,0,0,0.3);
  padding: 6px;
  border-radius: 4px;
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.button-group-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn.active {
  background: var(--accent-color);
  color: #000;
  border-color: var(--accent-color);
  box-shadow: 0 0 12px rgba(88, 166, 255, 0.4);
}
.btn.active svg {
  stroke: #000;
}
</style>
