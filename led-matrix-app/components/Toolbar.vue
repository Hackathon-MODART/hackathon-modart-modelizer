<template>
  <div class="toolbar">
    <div class="tool-section">
      <label>Current Color</label>
      <input type="color" v-model="selectedColor" class="color-picker" />
      <div class="intensity-control">
        <label>Intensity: {{ selectedIntensity }}%</label>
        <input
          type="range"
          v-model.number="selectedIntensity"
          min="1"
          max="100"
        />
      </div>
    </div>

    <div class="tool-section">
      <label>Action</label>
      <div class="button-group tools-grid">
        <button
          class="btn tool-btn"
          :class="{ active: currentTool === 'draw' }"
          @click="toggleTool('draw')"
          title="Draw (T)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
            <path d="M2 2l7.586 7.586"></path>
            <circle cx="11" cy="11" r="2"></circle>
          </svg>
          <span class="shortcut-hint">T</span>
        </button>
        <button
          class="btn tool-btn"
          :class="{ active: currentTool === 'erase' }"
          @click="toggleTool('erase')"
          title="Erase (Z)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z"></path>
            <path d="M17 14L7 20"></path>
          </svg>
          <span class="shortcut-hint">Z</span>
        </button>
        <button
          class="btn tool-btn fill-btn"
          :class="{ active: currentTool === 'fill' }"
          @click="toggleTool('fill')"
          title="Fill Frame (F)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M19 11h-8m-2 0h-2m11 4h-5m-2 0h-2m7 4h-3m-2 0h-2M12 3a9 9 0 0 0-9 9v9h18v-9a9 9 0 0 0-9-9z"
            ></path>
          </svg>
          <span class="shortcut-hint">F</span>
        </button>
        <button
          class="btn tool-btn"
          :class="{ active: currentTool === 'picker' }"
          @click="toggleTool('picker')"
          title="Pipette (P)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
          <span class="shortcut-hint">P</span>
        </button>
      </div>
    </div>

    <div class="tool-section">
      <label>Selection Mode</label>
      <div class="button-group tools-grid modes-grid">
        <button
          class="btn tool-btn"
          :class="{
            active: currentActionMode === 'single',
            disabled: currentTool === 'fill',
          }"
          @click="setActionMode('single')"
          title="Single Pixel"
          :disabled="currentTool === 'fill'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="6" height="6"></rect>
          </svg>
          <span class="shortcut-hint">_</span>
        </button>
        <button
          class="btn tool-btn"
          :class="{
            active: currentActionMode === 'row',
            disabled: currentTool === 'fill',
          }"
          @click="setActionMode('row')"
          title="Row Pencil (X)"
          :disabled="currentTool === 'fill'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <span class="shortcut-hint">X</span>
        </button>
        <button
          class="btn tool-btn"
          :class="{
            active: currentActionMode === 'col',
            disabled: currentTool === 'fill',
          }"
          @click="setActionMode('col')"
          title="Column Pencil (C)"
          :disabled="currentTool === 'fill'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="3" x2="12" y2="21"></line>
            <line x1="6" y1="3" x2="6" y2="21"></line>
            <line x1="18" y1="3" x2="18" y2="21"></line>
          </svg>
          <span class="shortcut-hint">C</span>
        </button>
      </div>
    </div>

    <div class="tool-section">
      <label>Insert</label>
      <div class="button-group-vertical">
        <button class="btn" @click="$emit('generateLogo')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Gen: Logo Base
        </button>
      </div>
    </div>

    <div class="tool-section">
      <label>Animations (Generators)</label>
      <div class="button-group-vertical">
        <button class="btn" @click="$emit('generateLogoAnimation')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <rect x="9" y="9" width="6" height="6"></rect>
          </svg>
          Gen: Logo Animation
        </button>
        <button class="btn" @click="$emit('generatePlasma')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 2v20"></path>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          Gen: Plasma Flow
        </button>
        <div style="display: flex; gap: 4px; margin-top: 8px;">
          <input 
            type="text" 
            v-model="scrollText" 
            placeholder="Text to scroll" 
            style="flex: 1; padding: 4px; border-radius: 4px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: white;" 
          />
          <button 
            class="btn primary" 
            @click="$emit('generateScrollText', scrollText)"
            :disabled="!scrollText"
            title="Gen: Scroll Text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="tool-section" style="margin-top: auto">
      <button class="btn danger" @click="clearGrid">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z"></path>
          <path d="M17 14L7 20"></path>
        </svg>
        Clear Frame
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const scrollText = ref('')
const store = useMatrixStore();
const {
  selectedColor,
  selectedIntensity,
  currentTool,
  currentActionMode,
  clearGrid,
} = store;

const emit = defineEmits([
  "generateBlink",
  "generateCircle",
  "generateLogo",
  "generateLogoAnimation",
  "generatePlasma",
  "generateScrollText"
]);

const toggleTool = (tool: "draw" | "erase" | "fill" | "picker") => {
  currentTool.value = tool;
};

const setActionMode = (mode: "single" | "row" | "col") => {
  if (currentTool.value !== "fill") {
    currentActionMode.value = mode;
  }
};
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

@media (max-width: 1200px) {
  .toolbar {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
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

.intensity-control {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.intensity-control label {
  font-size: 0.65rem;
  color: var(--text-secondary);
}

.intensity-control input[type="range"] {
  width: 100%;
  accent-color: var(--accent-color);
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.tools-grid {
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.modes-grid {
  grid-template-columns: repeat(3, 1fr);
}

.tool-btn {
  height: 44px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tool-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.shortcut-hint {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background-color: var(--accent-color);
  color: #000;
  font-size: 0.55rem;
  font-weight: 800;
  font-family: monospace;
  padding: 1px 3px;
  border-radius: 3px;
  pointer-events: none;
  opacity: 0.8;
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
