<template>
  <div class="app-container">
    <header class="glass header">
      <div class="logo">
        <div class="logo-dot"></div>
        <h1>LED Matrix Studio</h1>
      </div>
      <div class="actions">
        <input 
          type="text" 
          v-model="animationName" 
          placeholder="Animation Name" 
          class="animation-name-input"
          title="Name for the exported variable and file"
        />
        <label class="btn outline" style="margin-right: 8px; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Import Code
          <input type="file" @change="importCode" accept=".h" style="display: none;" />
        </label>
        <button class="btn primary" @click="exportCode">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export Code (ESP32)
        </button>
      </div>
    </header>

    <main class="main-content">
      <div class="workspace">
        <div class="toolbar-wrapper glass">
          <h3>Tools</h3>
          <Toolbar 
            @generateBlink="onGenerateBlink" 
            @generateCircle="onGenerateCircle" 
            @generateLogo="onGenerateLogo"
            @generateLogoAnimation="onGenerateLogoAnimation"
            @generatePlasma="onGeneratePlasma"
          />
        </div>
        
        <div class="matrix-wrapper glass">
          <MatrixGrid />
        </div>
      </div>

      <div class="timeline-wrapper glass">
        <h3>Timeline & Animation</h3>
        <Timeline />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import MatrixGrid from './components/MatrixGrid.vue'
import Toolbar from './components/Toolbar.vue'
import Timeline from './components/Timeline.vue'
// Add store import explicitly in case auto-imports are not fully enabled during startup
import { useMatrixStore, COLS, ROWS, applyIntensity } from './composables/useMatrixStore'
import { ref, onMounted, onUnmounted } from 'vue'

const store = useMatrixStore()

const animationName = ref<string>('matrix_animation')

const onKeyDown = (e: KeyboardEvent) => {
  // Ignore if user is typing in an input
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.repeat) return // Prevent lag when holding the key down
  
  let handled = true
  switch(e.key.toLowerCase()) {
    case 'r': store.currentTool.value = 'erase'; break;
    case 't': store.currentTool.value = 'draw'; break;
    case 'f': store.currentTool.value = 'fill'; break;
    case 'x': store.currentTool.value = 'row_pencil'; break;
    case 'c': store.currentTool.value = 'col_pencil'; break;
    default: handled = false; break;
  }
  
  if (handled) {
    e.preventDefault()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

// --- Generators ---
const onGenerateBlink = () => {
  const color = store.selectedColor.value
  
  // Gen Blink: Fill with color, then frame of black
  store.addFrame()
  store.fillGrid(color)
  
  store.addFrame()
  store.fillGrid(store.DEFAULT_COLOR)
}

const onGenerateCircle = () => {
  const color = store.selectedColor.value
  const maxRadius = Math.ceil(Math.sqrt(Math.pow(COLS/2, 2) + Math.pow(ROWS/2, 2)))
  const cx = COLS / 2
  const cy = ROWS / 2

  // Animate outwards
  for (let r = 0; r <= maxRadius; r++) {
    // Add a new empty frame for this step
    store.addFrame()
    store.clearGrid()
    
    // Draw circle of radius r
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        // Distance from center
        const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2))
        // Thickness of 1-1.5 pixels
        if (Math.abs(dist - r) <= 1.2) {
          store.setPixel(y, x, color)
        }
      }
    }
  }
  
  // Optionally: select the first frame of the new animation
  store.selectFrame(store.frames.value.length - maxRadius - 1)
}

const drawLogoStaticParts = (color: string) => {
  // Top bar
  for (let x = 12; x <= 19; x++) {
    store.setPixel(1, x, color)
  }

  // Inner 'r'
  store.setPixel(6, 14, color)
  store.setPixel(6, 15, color)
  store.setPixel(6, 16, color)
  store.setPixel(7, 14, color)
  store.setPixel(7, 17, color)
  for (let y = 8; y <= 11; y++) {
    store.setPixel(y, 14, color)
  }
}

const drawLogoCircle = (color: string) => {
  // Exact circle from your screenshot
  for (let x = 13; x <= 18; x++) {
    store.setPixel(3, x, color)
    store.setPixel(14, x, color)
  }
  store.setPixel(4, 12, color)
  store.setPixel(4, 19, color)
  store.setPixel(5, 11, color)
  store.setPixel(5, 20, color)
  store.setPixel(12, 11, color)
  store.setPixel(12, 20, color)
  store.setPixel(13, 12, color)
  store.setPixel(13, 19, color)
  for (let y = 6; y <= 11; y++) {
    store.setPixel(y, 10, color)
    store.setPixel(y, 21, color)
  }
}

const onGenerateLogo = () => {
  const color = '#072667' // RGB 7 38 103
  store.addFrame()
  store.clearGrid()
  drawLogoStaticParts(color)
  drawLogoCircle(color)
}

const onGenerateLogoAnimation = () => {
  const color = '#072667'
  
  // Frame 1: Original logo
  onGenerateLogo()
  
  const cx = 15.5
  const cy = 8.5
  const startRadius = 6 // Logo circle radius
  const maxRadius = Math.ceil(Math.sqrt(Math.pow(COLS/2, 2) + Math.pow(ROWS/2, 2))) + 2
  
  for (let r = startRadius + 1; r <= maxRadius; r++) {
    store.addFrame()
    store.clearGrid()
    drawLogoStaticParts(color)
    
    // Draw expanding circle
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2))
        // 1.0 thickness works nicely for this scale
        if (Math.abs(dist - r) <= 1.0) {
          store.setPixel(y, x, color)
        }
      }
    }
  }
  
  // select the first frame of the new animation
  store.selectFrame(store.frames.value.length - (maxRadius - startRadius) - 1)
}

const onGeneratePlasma = () => {
  const color = store.selectedColor.value
  const maxIntens = store.selectedIntensity.value
  const numFrames = 30 // A good loop length
  
  for (let f = 0; f < numFrames; f++) {
    store.addFrame()
    store.clearGrid()
    let t = f * 0.3 // Time step
    
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        // Plasma math combining sine waves with higher frequency for smaller zones
        let v1 = Math.sin(x * 0.4 + t)
        let v2 = Math.sin(y * 0.4 + t)
        let v3 = Math.sin((x + y + t) * 0.4)
        let cx = x + 0.5 * Math.sin(t / 2.0)
        let cy = y + 0.5 * Math.cos(t / 1.5)
        let v4 = Math.sin(Math.sqrt(cx*cx + cy*cy) * 0.4)
        
        let v = v1 + v2 + v3 + v4
        
        // Map to 0..1
        let intensity = (v + 4) / 8
        
        // Sharpen contrast for halftone style
        intensity = Math.pow(intensity, 2)
        
        if (intensity < 0.15) intensity = 0 // Some completely black regions
        
        let finalIntens = intensity * maxIntens * 1.8 // Allow some bright hot spots
        if (finalIntens > 100) finalIntens = 100
        
        if (finalIntens > 0) {
          store.setPixel(y, x, applyIntensity(color, finalIntens))
        }
      }
    }
  }
  
  // Select first frame of the new animation
  store.selectFrame(store.frames.value.length - numFrames)
}

// --- Import Functionality ---
const importCode = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  
  const file = target.files[0]
  const text = await file.text()
  
  const hexMatches = text.match(/0x[A-Fa-f0-9]{6}/g)
  if (!hexMatches || hexMatches.length === 0) {
    alert('No valid frame data found in the file.')
    target.value = ''
    return
  }

  const frameSize = ROWS * COLS
  if (hexMatches.length % frameSize !== 0) {
    alert('Invalid number of pixels found in the file. Dimensions must be 32x16.')
    target.value = ''
    return
  }

  const numFrames = hexMatches.length / frameSize
  store.frames.value = []
  
  for (let f = 0; f < numFrames; f++) {
    const frame: string[][] = []
    for (let y = 0; y < ROWS; y++) {
      const row: string[] = []
      for (let x = 0; x < COLS; x++) {
        const index = f * frameSize + y * COLS + x
        const hex = hexMatches[index].replace('0x', '#')
        row.push(hex)
      }
      frame.push(row)
    }
    store.frames.value.push(frame)
  }
  
  store.currentFrameIndex.value = 0
  target.value = ''
}

// --- Export Functionality ---
const exportCode = () => {
  // Sanitize name for C++ variable and guard
  let baseName = animationName.value.trim() || 'matrix_animation'
  baseName = baseName.replace(/[^a-zA-Z0-9_]/g, '_')
  const guardName = baseName.toUpperCase() + '_H'

  let hCode = `// Generated by LED Matrix Studio\n`
  hCode += `#ifndef ${guardName}\n`
  hCode += `#define ${guardName}\n\n`
  hCode += `#include <stdint.h>\n`
  hCode += `#include <avr/pgmspace.h> // For PROGMEM on generic boards if needed\n\n`
  
  hCode += `const uint16_t FRAME_COUNT_${baseName.toUpperCase()} = ${store.frames.value.length};\n`
  hCode += `const uint8_t MATRIX_WIDTH_${baseName.toUpperCase()} = ${COLS};\n`
  hCode += `const uint8_t MATRIX_HEIGHT_${baseName.toUpperCase()} = ${ROWS};\n\n`

  // Store 1D array of uint32_t for each frame
  hCode += `const uint32_t ${baseName}[${store.frames.value.length}][${ROWS * COLS}] PROGMEM = {\n`
  
  store.frames.value.forEach((frame, fIndex) => {
    hCode += `  {\n    // Frame ${fIndex + 1}\n    `
    let colors: string[] = []
    
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        let hex = frame[y][x]
        // Convert #RRGGBB to 0xRRGGBB
        hex = '0x' + hex.substring(1).toUpperCase()
        colors.push(hex)
      }
    }
    
    // format to max 8 colors per line to keep it clean
    for (let i = 0; i < colors.length; i += 8) {
      hCode += colors.slice(i, i + 8).join(', ')
      if (i + 8 < colors.length) {
        hCode += ',\n    '
      }
    }
    hCode += `\n  }${fIndex < store.frames.value.length - 1 ? ',' : ''}\n`
  })

  hCode += `};\n\n#endif // ${guardName}\n`

  // Create a download link and trigger download for the generated header file
  const blob = new Blob([hCode], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${baseName}.h`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 16px;
  gap: 16px;
  max-width: 1600px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.actions {
  display: flex;
  align-items: center;
}

.animation-name-input {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 6px;
  margin-right: 12px;
  font-family: monospace;
  font-size: 0.9rem;
  width: 180px;
}
.animation-name-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent-color);
  box-shadow: 0 0 12px rgba(88, 166, 255, 0.8), 0 0 24px rgba(189, 86, 255, 0.4);
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.header h1 {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.5px;
  background: linear-gradient(90deg, #c9d1d9, #8b949e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.workspace {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.toolbar-wrapper {
  width: 260px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.toolbar-wrapper h3, .timeline-wrapper h3 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.matrix-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  overflow: auto;
  position: relative;
}

.timeline-wrapper {
  height: 180px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
}
</style>
