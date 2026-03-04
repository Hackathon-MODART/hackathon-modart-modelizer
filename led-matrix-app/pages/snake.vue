<template>
  <div class="app-container">
    <header class="glass header">
      <div class="logo">
        <div class="logo-dot"></div>
        <h1>LED Matrix Studio - Snake Game</h1>
      </div>
      <div class="actions">
        <NuxtLink to="/" class="btn outline" style="margin-right: 8px;">Back to Editor</NuxtLink>
      </div>
    </header>

    <main class="main-content" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 20px;">
      <div class="workspace-area">
        <h2 style="color: white; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;">Score: {{ score }}</h2>
        
        <!-- Game Board (32x16) -->
        <div class="board glass">
          <div v-for="y in ROWS" :key="'row-'+y" class="board-row">
            <div 
              v-for="x in COLS" 
              :key="'col-'+x" 
              class="board-cell"
              :style="{ backgroundColor: getPixelColor(x-1, y-1) }"
              :class="{ 
                'cell-snake': isSnake(x-1, y-1), 
                'cell-food': isFood(x-1, y-1) 
              }"
            ></div>
          </div>
        </div>

        <div style="margin-top: 30px; display:flex; gap:16px;">
          <button class="btn primary" @click="startGame" v-if="!isPlaying">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Start Game
          </button>
          <button class="btn hazard-hover" @click="stopGame" v-else>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
            Stop
          </button>
        </div>
        
        <p style="color: var(--text-secondary); margin-top: 20px; font-size: 0.85rem;">
          Use Arrow Keys or WASD to control. Output streams automatically to http://192.168.4.1/animation
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const COLS = 32
const ROWS = 16
const GAME_COLS = 20 // Playable area limit, leaving right side for score

const snake = ref<{x: number, y: number}[]>([])
const food = ref<{x: number, y: number}>({x: 0, y: 0})
const direction = ref<{dx: number, dy: number}>({dx: 1, dy: 0})
const nextDirection = ref<{dx: number, dy: number}>({dx: 1, dy: 0})
const isPlaying = ref(false)
const isGameOver = ref(false)
const score = ref(0)
let gameInterval: any = null

const snakeColor = '#33FF33'
const snakeHeadColor = '#66FF66'
const foodColor = '#FF3333'
const bgColor = '#000000'

// Fetch wrapper optimized to avoid pile up
let isTransmitting = false

const isSnake = (x: number, y: number) => {
  return snake.value.some(segment => segment.x === x && segment.y === y)
}

const isFood = (x: number, y: number) => {
  return food.value.x === x && food.value.y === y
}

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

const getScorePixelColor = (x: number, y: number) => {
  const yStart = 5
  if (y < yStart || y >= yStart + 5) return bgColor

  // Get score padded to 3 digits (e.g. 010)
  const scoreStr = score.value.toString().padStart(3, '0')
  
  // Digit pos: 21-23, 25-27, 29-31
  let digitIndex = -1
  let px = -1
  if (x >= 21 && x <= 23) { digitIndex = 0; px = x - 21 }
  else if (x >= 25 && x <= 27) { digitIndex = 1; px = x - 25 }
  else if (x >= 29 && x <= 31) { digitIndex = 2; px = x - 29 }

  if (digitIndex !== -1) {
    const digitNum = parseInt(scoreStr[digitIndex], 10)
    const pattern = digitPixels[digitNum]
    const py = y - yStart
    if (pattern && pattern[py] && pattern[py][px]) {
      return '#FFA500' // Score color (orange)
    }
  }
  return bgColor
}

const gameOverText = [
  "  GGG   AA   M   M  EEE  ",
  " G     A  A  MM MM  E    ",
  " G  GG AAAA  M M M  EEE  ",
  " G   G A  A  M   M  E    ",
  "  GGG  A  A  M   M  EEE  ",
  "                         ",
  "                         ",
  "  OOO  V   V  EEE  RRR   ",
  " O   O V   V  E    R  R  ",
  " O   O  V V   EEE  RRR   ",
  " O   O  V V   E    R R   ",
  "  OOO    V    EEE  R  R  "
]

const getPixelColor = (x: number, y: number) => {
  if (isGameOver.value) {
    const textStartX = 4
    const textStartY = 2
    const py = y - textStartY
    const px = x - textStartX
    if (py >= 0 && py < gameOverText.length && px >= 0 && px < gameOverText[0].length) {
      if (gameOverText[py][px] !== ' ') {
        return '#FF0000' // Red text
      }
    }
    return bgColor // Black background for the rest
  }

  if (x >= GAME_COLS) {
    if (x === GAME_COLS) return '#1a1a1a' // Vertical border
    return getScorePixelColor(x, y)
  }
  if (isFood(x, y)) return foodColor
  if (snake.value.length > 0 && snake.value[0].x === x && snake.value[0].y === y) return snakeHeadColor
  if (isSnake(x, y)) return snakeColor
  return bgColor
}

const spawnFood = () => {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GAME_COLS),
      y: Math.floor(Math.random() * ROWS)
    }
    if (!snake.value.some(s => s.x === newFood.x && s.y === newFood.y)) {
      break
    }
  }
  food.value = newFood
}

const startGame = () => {
  snake.value = [
    {x: 8, y: 8},
    {x: 7, y: 8},
    {x: 6, y: 8}
  ]
  direction.value = {dx: 1, dy: 0}
  nextDirection.value = {dx: 1, dy: 0}
  score.value = 0
  isGameOver.value = false
  spawnFood()
  isPlaying.value = true
  
  if (gameInterval) clearInterval(gameInterval)
  // 150ms delay for snake speed as default
  gameInterval = setInterval(gameLoop, 150)
  
  // Send first frame immediately
  sendFrameToEsp()
}

const stopGame = () => {
  isPlaying.value = false
  if (gameInterval) clearInterval(gameInterval)
}

const gameLoop = async () => {
  if (!isPlaying.value) return

  // Update direction from queued
  direction.value = { ...nextDirection.value }

  const head = { ...snake.value[0] }
  head.x += direction.value.dx
  head.y += direction.value.dy

  // Board wrap around or collision
  // Using GAME_COLS for right boundary limit
  if (head.x < 0 || head.x >= GAME_COLS || head.y < 0 || head.y >= ROWS) {
    isGameOver.value = true
    stopGame()
    sendFrameToEsp()
    return
  }

  // Check collision with self
  if (snake.value.some(s => s.x === head.x && s.y === head.y)) {
    isGameOver.value = true
    stopGame()
    sendFrameToEsp()
    return
  }

  snake.value.unshift(head)

  if (head.x === food.value.x && head.y === food.value.y) {
    score.value += 10
    spawnFood()
  } else {
    snake.value.pop()
  }

  // Broadcast to Matrix
  sendFrameToEsp()
}

const buildHexStream = () => {
  // Exact mapping: [X][Y] with origin at bottom-left
  let result = ''
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      let internalY = (ROWS - 1) - y
      // Use the unified getPixelColor safely rendering snake and score
      let color = getPixelColor(x, internalY)
      result += color.substring(1).toUpperCase()
    }
  }
  return result
}

const sendFrameToEsp = async () => {
  if (isTransmitting) return // drop frames if network is lagging behind
  isTransmitting = true

  try {
    const hexData = buildHexStream()
    
    // Exact payload the ESP expects
    const payload = {
      frameCount: 1,
      delay: 150,
      data: hexData
    }

    // Using beacon or promise-fetch but keep timeout low
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 200) // fast timeout so not blocking loops

    await fetch('http://192.168.4.1/animation', {
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

const onKeyDown = (e: KeyboardEvent) => {
  if (!isPlaying.value) return
  
  // Prevent default scrolling and interactions for arrows/wasd
  switch(e.key) {
    case 'ArrowUp':
    case 'w':
      if (direction.value.dy === 0) {
        nextDirection.value = {dx: 0, dy: -1}
        e.preventDefault()
      }
      break
    case 'ArrowDown':
    case 's':
      if (direction.value.dy === 0) {
        nextDirection.value = {dx: 0, dy: 1}
        e.preventDefault()
      }
      break
    case 'ArrowLeft':
    case 'a':
      if (direction.value.dx === 0) {
        nextDirection.value = {dx: -1, dy: 0}
        e.preventDefault()
      }
      break
    case 'ArrowRight':
    case 'd':
      if (direction.value.dx === 0) {
        nextDirection.value = {dx: 1, dy: 0}
        e.preventDefault()
      }
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  stopGame()
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
  border-radius: 50%; /* LED look */
  margin: 1px;
  transition: background-color 0.1s;
}

.board-cell.cell-snake {
  border-radius: 4px; /* More blocky for snake body */
  box-shadow: 0 0 6px #33FF33;
}

.board-cell.cell-food {
  border-radius: 50%;
  box-shadow: 0 0 8px #FF3333;
}
</style>
