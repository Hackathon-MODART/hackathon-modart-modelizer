<template>
  <div class="app-container">
    <header class="glass header">
      <div class="logo">
        <div class="logo-dot"></div>
        <h1>LED Matrix Studio <span class="version">v{{ APP_VERSION }}</span> - Hackathon Timer</h1>
      </div>
      <div class="actions">
        <NuxtLink to="/" class="btn outline" style="margin-right: 8px;">Back to Editor</NuxtLink>
      </div>
    </header>

    <main class="main-content" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 20px;">
      <div class="workspace-area">
        <h2 style="color: white; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;">
          Time Left: {{ timeLeftFormatted }}
        </h2>
        
        <!-- Game Board (32x16) -->
        <div class="board glass">
          <div v-for="y in ROWS" :key="'row-'+y" class="board-row">
            <div 
              v-for="x in COLS" 
              :key="'col-'+x" 
              class="board-cell"
              :style="{ backgroundColor: getPixelColor(x-1, y-1) }"
            ></div>
          </div>
        </div>

        <div style="margin-top: 30px; display:flex; gap:16px;">
          <button class="btn primary" @click="startTimer" v-if="!isRunning">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Start Display
          </button>
          <button class="btn hazard-hover" @click="stopTimer" v-else>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
            Stop
          </button>
        </div>
        
        <p style="color: var(--text-secondary); margin-top: 20px; font-size: 0.85rem;">
          Countdown to March 6th 14:00 CET. Output streams automatically to http://192.168.4.1/static
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { APP_VERSION } from '~/utils/version'
import { applyIntensity } from '~/composables/useMatrixStore'

const COLS = 32
const ROWS = 16

const isRunning = ref(false)
const timeLeftFormatted = ref("00:00:00")
const timeLeftStruct = ref({ h: 0, m: 0, s: 0 })

let intervalId: any = null
let isTransmitting = false

const bgColor = '#000000'
const baseTextColor = '#58A6FF'
const textColor = applyIntensity(baseTextColor, 20)

// 3x5 digit font
const digitPixels = [
  [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]], // 0
  [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]], // 1
  [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]], // 2
  [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]], // 3
  [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]], // 4
  [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]], // 5
  [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]], // 6
  [[1,1,1],[0,0,1],[0,0,1],[0,0,1],[0,0,1]], // 7
  [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]], // 8
  [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]], // 9
]
const colonPixels = [
  [0],
  [1],
  [0],
  [1],
  [0]
]

// Target: March 6th, 2026 14:00 CET
const targetDate = new Date("2026-03-06T14:00:00+01:00").getTime()

const updateTime = () => {
  const now = new Date().getTime()
  const diff = targetDate - now

  if (diff <= 0) {
    timeLeftFormatted.value = "00:00:00"
    timeLeftStruct.value = { h: 0, m: 0, s: 0 }
    return
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  timeLeftStruct.value = { h: hours, m: minutes, s: seconds }
  timeLeftFormatted.value = 
    hours.toString().padStart(2, '0') + ':' + 
    minutes.toString().padStart(2, '0') + ':' + 
    seconds.toString().padStart(2, '0')
}

// Logic to draw time on a 32x8 subgrid
const drawTimeOnSubgrid = (x: number, py: number) => {
  if (py < 0 || py > 4) return bgColor
  
  const text = timeLeftFormatted.value || "00:00:00"
  let cursorX = 3 // Starting X to center text width of 27 in 32 cols
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === ':') {
      if (x === cursorX && colonPixels[py][0]) return textColor
      cursorX += 2 
    } else {
      const idx = parseInt(char, 10)
      if (idx >= 0 && idx <= 9) {
        if (x >= cursorX && x < cursorX + 3) {
          const px = x - cursorX
          if (digitPixels[idx][py][px]) return textColor
        }
        cursorX += 4 
      }
    }
  }
  return bgColor
}

const getPixelColor = (x: number, y: number) => {
  // We want to center the 5-pixel high text in the 8-pixel high half-screen.
  // 8 - 5 = 3 => 1 pixel top margin, 2 pixel bottom margin if we start at y=1.
  
  if (y < 8) {
    // Top half: 0 to 7 -> Rotated 180 (Inverted)
    const rotatedX = 31 - x
    const rotatedY = 7 - y
    return drawTimeOnSubgrid(rotatedX, rotatedY - 1) 
  } else {
    // Bottom half: 8 to 15 -> Normal
    const normalY = y - 8
    return drawTimeOnSubgrid(x, normalY - 1)
  }
}

const buildHexStream = () => {
  // Exact mapping: [X][Y] with origin at bottom-left
  let result = ''
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      let internalY = (ROWS - 1) - y
      let color = getPixelColor(x, internalY)
      result += color.substring(1).toUpperCase()
    }
  }
  return result
}

const sendFrameToEsp = async () => {
  if (isTransmitting) return
  isTransmitting = true

  try {
    const hexData = buildHexStream()
    const payload = { data: hexData }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 800)

    await fetch('http://192.168.4.1/static', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
  } catch (err) {
    // silently fail
  } finally {
    isTransmitting = false
  }
}

const tickFrame = () => {
  updateTime()
  if (isRunning.value) {
    sendFrameToEsp()
  }
}

const startTimer = () => {
  isRunning.value = true
  updateTime()
  sendFrameToEsp()
  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(tickFrame, 1000)
}

const stopTimer = () => {
  isRunning.value = false
  if (intervalId) clearInterval(intervalId)
}

onMounted(() => {
  updateTime() // Initial calc
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #0b0f19;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
}

.workspace-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.board {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.board-row {
  display: flex;
}

.board-cell {
  width: 20px;
  height: 20px;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 50%;
  margin: 1px;
  transition: background-color 0.1s;
}

.version {
  font-size: 0.7rem;
  font-weight: 500;
  color: #58a6ff;
  background: rgba(88, 166, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
  border: 1px solid rgba(88, 166, 255, 0.2);
  letter-spacing: 0.5px;
}
</style>
