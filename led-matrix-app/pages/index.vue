<template>
  <div class="app-container">
    <header class="glass header">
      <div class="logo">
        <div class="logo-dot"></div>
        <h1>LED Matrix Studio <span class="version">v{{ APP_VERSION }}</span></h1>
      </div>
      <div class="actions">
        <NuxtLink to="/snake" class="btn primary" style="margin-right: 8px; background-color: #33FF33; color: black; border: none;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><circle cx="15" cy="13" r="1"></circle><circle cx="18" cy="11" r="1"></circle></svg>
          Play Snake
        </NuxtLink>
        <label class="btn outline" style="margin-right: 8px; cursor: pointer">
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Import Code
          <input
            type="file"
            @change="importCode"
            accept=".h"
            style="display: none"
          />
        </label>
        <label class="btn outline" style="margin-right: 8px; cursor: pointer">
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
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          Import Image
          <input
            type="file"
            @change="importImage"
            accept="image/png,image/jpeg,image/heic,image/heif,.png,.jpg,.jpeg,.heic,.heif"
            style="display: none"
          />
        </label>
        <button
          class="btn primary"
          @click="openLoadModal"
          style="
            margin-right: 8px;
            background-color: var(--accent-color);
            border-color: var(--accent-color);
          "
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
            <polyline points="8 17 12 21 16 17"></polyline>
            <line x1="12" y1="12" x2="12" y2="21"></line>
            <path
              d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"
            ></path>
          </svg>
          Load from Firebase
        </button>
        <button
          class="btn primary"
          @click="openSaveModal"
          style="
            margin-right: 8px;
            background-color: var(--accent-color);
            border-color: var(--accent-color);
          "
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
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            ></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Save to Firebase
        </button>
        <button 
          class="btn primary" 
          @click="exportCode"
          :disabled="isSending"
          style="position: relative;"
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {{ isSending ? 'Sending...' : 'Send to ESP32' }}
        </button>
      </div>
    </header>

    <main class="main-content">
      <div class="workspace">
        <div class="toolbar-wrapper glass">
          <h3>Tools</h3>
          <Toolbar
            @generateCircle="onGenerateCircle"
            @generateLogo="onGenerateLogo"
            @generateLogoAnimation="onGenerateLogoAnimation"
            @generatePlasma="onGeneratePlasma"
            @generateScrollText="onGenerateScrollText"
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

    <!-- Load Modal -->
    <div
      v-if="isLoadModalOpen"
      class="modal-overlay"
      @click.self="closeLoadModal"
    >
      <div class="modal-content glass">
        <div class="modal-header">
          <h2>Load Pattern from Firebase</h2>
          <button class="close-btn" @click="closeLoadModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingPatterns" class="loading-state">
            Loading patterns...
          </div>
          <div v-else-if="savedPatterns.length === 0" class="empty-state">
            No patterns found in Firebase.
          </div>
          <ul v-else class="pattern-list">
            <li
              v-for="pattern in savedPatterns"
              :key="pattern.id"
              class="pattern-item"
            >
              <div class="pattern-info">
                <strong>{{ pattern.name }}</strong>
                <span class="pattern-meta"
                  >{{ pattern.frameCount }} frames | {{ pattern.fps }} FPS</span
                >
              </div>
              <button class="btn primary small" @click="loadPattern(pattern)">
                Load
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Save Modal -->
    <div
      v-if="isSaveModalOpen"
      class="modal-overlay"
      @click.self="closeSaveModal"
    >
      <div class="modal-content glass">
        <div class="modal-header">
          <h2>Save to Firebase</h2>
          <button class="close-btn" @click="closeSaveModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="save-tabs">
            <button
              class="tab-btn"
              :class="{ active: saveTab === 'new' }"
              @click="saveTab = 'new'"
            >
              Create New
            </button>
            <button
              class="tab-btn"
              :class="{ active: saveTab === 'overwrite' }"
              @click="saveTab = 'overwrite'"
            >
              Overwrite Existing
            </button>
          </div>

          <div v-if="saveTab === 'new'" class="save-section">
            <label>Pattern Name:</label>
            <div style="display: flex; gap: 8px">
              <input
                type="text"
                v-model="newPatternName"
                placeholder="My Awesome Pattern"
                class="pattern-name-input"
                @keyup.enter="saveAsNewPattern"
              />
              <button
                class="btn primary"
                @click="saveAsNewPattern"
                :disabled="isSaving || !newPatternName.trim()"
              >
                {{ isSaving ? "Saving..." : "Save" }}
              </button>
            </div>
          </div>

          <div v-if="saveTab === 'overwrite'" class="save-section">
            <div v-if="isLoadingPatterns" class="loading-state">
              Loading patterns...
            </div>
            <div v-else-if="savedPatterns.length === 0" class="empty-state">
              No patterns found in Firebase.
            </div>
            <ul v-else class="pattern-list">
              <li
                v-for="pattern in savedPatterns"
                :key="pattern.id"
                class="pattern-item"
              >
                <div class="pattern-info">
                  <strong>{{ pattern.name }}</strong>
                  <span class="pattern-meta"
                    >{{ pattern.frameCount }} frames |
                    {{ pattern.fps }} FPS</span
                  >
                </div>
                <button
                  class="btn danger small"
                  @click="overwritePattern(pattern)"
                  :disabled="isSaving"
                >
                  {{
                    isSaving && savingTargetId === pattern.id
                      ? "Saving..."
                      : "Overwrite"
                  }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications Container -->
    <div class="toast-container">
      <transition-group name="toast">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="toast"
          :class="`toast-${notif.type}`"
        >
          <div class="toast-icon">
            <svg
              v-if="notif.type === 'success'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="toast-content">{{ notif.message }}</div>
          <button class="toast-close" @click="removeNotification(notif.id)">
            ✕
          </button>
          <div
            class="toast-progress"
            :class="`toast-progress-${notif.type}`"
            :style="{ animationDuration: `${notif.duration}ms` }"
          ></div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import MatrixGrid from "~/components/MatrixGrid.vue";
import Toolbar from "~/components/Toolbar.vue";
import Timeline from "~/components/Timeline.vue";
import {
  useMatrixStore,
  COLS,
  ROWS,
  applyIntensity,
} from "~/composables/useMatrixStore";
import { usePatterns } from "~/composables/usePatterns";
import type { LedPattern } from "~/composables/usePatterns";
import { FONT_7X10 } from "~/utils/font";
import { APP_VERSION } from "~/utils/version";
import { ref, onMounted, onUnmounted } from "vue";

const store = useMatrixStore();
const { savePattern, getPatterns, updatePattern, checkPatternExists } =
  usePatterns();

// --- Custom Notifications System ---
interface ToastNotification {
  id: number;
  message: string;
  type: "success" | "error";
  duration: number;
}

const notifications = ref<ToastNotification[]>([]);
let notifIdCounter = 0;

const showNotification = (
  message: string,
  type: "success" | "error" = "success",
  duration: number = 4500,
) => {
  const id = notifIdCounter++;
  notifications.value.push({ id, message, type, duration });

  // Auto remove after duration
  setTimeout(() => {
    removeNotification(id);
  }, duration);
};

const removeNotification = (id: number) => {
  const index = notifications.value.findIndex((n) => n.id === id);
  if (index !== -1) notifications.value.splice(index, 1);
};

const onKeyDown = (e: KeyboardEvent) => {
  // Ignore if user is typing in an input
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  )
    return;
  if (e.repeat) return; // Prevent lag when holding the key down

  let handled = true;

  // Ctrl+Z / Cmd+Z for undo
  if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    if (store.undo()) {
      showNotification("Action undone", "success", 1500);
    }
    return;
  }

  switch (e.key.toLowerCase()) {
    case "z":
      if (!e.ctrlKey && !e.metaKey) {
        store.currentTool.value = "erase";
      }
      break;
    case "t":
      store.currentTool.value = "draw";
      break;
    case "f":
      store.currentTool.value = "fill";
      break;
    case "p":
      store.currentTool.value = "picker";
      break;
    case " ":
      if (store.currentTool.value !== "fill") {
        store.currentActionMode.value = "single";
      }
      break;
    case "x":
      if (store.currentTool.value !== "fill") {
        store.currentActionMode.value = "row";
      }
      break;
    case "c":
      if (store.currentTool.value !== "fill") {
        store.currentActionMode.value = "col";
      }
      break;
    default:
      handled = false;
      break;
  }

  if (handled) {
    e.preventDefault();
  }
};

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
});

// --- Generators ---
const onGenerateCircle = () => {
  const color = store.selectedColor.value;
  const maxRadius = Math.ceil(
    Math.sqrt(Math.pow(COLS / 2, 2) + Math.pow(ROWS / 2, 2)),
  );
  const cx = COLS / 2;
  const cy = ROWS / 2;

  // Animate outwards
  for (let r = 0; r <= maxRadius; r++) {
    // Add a new empty frame for this step
    store.addFrame();
    store.clearGrid();

    // Draw circle of radius r
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        // Distance from center
        const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
        // Thickness of 1-1.5 pixels
        if (Math.abs(dist - r) <= 1.2) {
          store.setPixel(y, x, color);
        }
      }
    }
  }

  // Optionally: select the first frame of the new animation
  store.selectFrame(store.frames.value.length - maxRadius - 1);
};

const drawLogoStaticParts = (color: string) => {
  // Top bar
  for (let x = 12; x <= 19; x++) {
    store.setPixel(1, x, color);
  }

  // Inner 'z'
  store.setPixel(6, 14, color);
  store.setPixel(6, 15, color);
  store.setPixel(6, 16, color);
  store.setPixel(7, 14, color);
  store.setPixel(7, 17, color);
  for (let y = 8; y <= 11; y++) {
    store.setPixel(y, 14, color);
  }
};

const drawLogoCircle = (color: string) => {
  // Exact circle from your screenshot
  for (let x = 13; x <= 18; x++) {
    store.setPixel(3, x, color);
    store.setPixel(14, x, color);
  }
  store.setPixel(4, 12, color);
  store.setPixel(4, 19, color);
  store.setPixel(5, 11, color);
  store.setPixel(5, 20, color);
  store.setPixel(12, 11, color);
  store.setPixel(12, 20, color);
  store.setPixel(13, 12, color);
  store.setPixel(13, 19, color);
  for (let y = 6; y <= 11; y++) {
    store.setPixel(y, 10, color);
    store.setPixel(y, 21, color);
  }
};

const onGenerateLogo = () => {
  const color = "#072667"; // RGB 7 38 103
  store.addFrame();
  store.clearGrid();
  drawLogoStaticParts(color);
  drawLogoCircle(color);
};

const onGenerateLogoAnimation = () => {
  const color = "#072667";

  // Frame 1: Original logo
  onGenerateLogo();

  const cx = 15.5;
  const cy = 8.5;
  const startRadius = 6; // Logo circle radius
  const maxRadius =
    Math.ceil(Math.sqrt(Math.pow(COLS / 2, 2) + Math.pow(ROWS / 2, 2))) + 2;

  for (let r = startRadius + 1; r <= maxRadius; r++) {
    store.addFrame();
    store.clearGrid();
    drawLogoStaticParts(color);

    // Draw expanding circle
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
        // 1.0 thickness works nicely for this scale
        if (Math.abs(dist - r) <= 1.0) {
          store.setPixel(y, x, color);
        }
      }
    }
  }

  // select the first frame of the new animation
  store.selectFrame(store.frames.value.length - (maxRadius - startRadius) - 1);
};

const onGeneratePlasma = () => {
  const color = store.selectedColor.value;
  const maxIntens = store.selectedIntensity.value;
  const numFrames = 30; // A good loop length

  for (let f = 0; f < numFrames; f++) {
    store.addFrame();
    store.clearGrid();
    // t completes exactly one full circle (2 * PI) over numFrames for seamless looping
    let t = (f / numFrames) * Math.PI * 2;

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        // Break symmetry: Use different frequencies and phase shifts for X and Y
        // Variables added to `t` must be integers multiplied by `t` (e.g. t, 2*t, -t) to loop perfectly
        let v1 = Math.sin(x * 0.35 + t);
        let v2 = Math.sin(y * 0.25 + x * 0.1 - t);

        // Diagonal offset that skews over time
        let v3 = Math.sin(x * 0.3 + y * 0.5 + t * 2);

        // Moving center point that wanders around the grid circularly
        let cx = x - (COLS / 2 + COLS * 0.3 * Math.sin(t));
        let cy = y - (ROWS / 2 + ROWS * 0.4 * Math.cos(t));
        let v4 = Math.sin(Math.sqrt(cx * cx + cy * cy) * 0.45 + t);

        let v = v1 + v2 + v3 + v4;

        // Map to 0..1 broadly (-4 to 4 range)
        let intensity = (v + 4) / 8;

        // Sharpen contrast for halftone style
        intensity = Math.pow(intensity, 2);

        if (intensity < 0.15) intensity = 0; // Some completely black regions

        let finalIntens = intensity * maxIntens * 1.8; // Allow some bright hot spots
        if (finalIntens > 100) finalIntens = 100;

        if (finalIntens > 0) {
          store.setPixel(y, x, applyIntensity(color, finalIntens));
        }
      }
    }
  }

  // Select first frame of the new animation
  store.selectFrame(store.frames.value.length - numFrames);
};

const onGenerateScrollText = (text: string) => {
  if (!text) return;
  const color = store.selectedColor.value;
  const upperText = text.toUpperCase();
  
  // Calculate total width of the text in pixels
  // Each character is 7px wide + 1px spacing
  let textWidth = 0;
  for (const char of upperText) {
    if (FONT_7X10[char]) textWidth += 8;
    else textWidth += 8; // Unknown chars take 8px space
  }
  
  // To make it slide in from right and slide out to left:
  // We need frames = COLS + textWidth + COLS (maybe less, just textWidth + COLS is enough to leave)
  const totalFrames = COLS + textWidth;
  const startFrameIndex = store.frames.value.length;

  for (let f = 0; f < totalFrames; f++) {
    store.addFrame();
    store.clearGrid();
    
    // Calculate the current X offset for the entire string
    // Starts at x = COLS, moves left by 1 pixel each frame
    let currentX = COLS - f;
    
    // Draw each character
    for (let charIndex = 0; charIndex < upperText.length; charIndex++) {
      const char = upperText[charIndex];
      const bitmap = FONT_7X10[char] || FONT_7X10['?']; // Fallback to '?'
      
      // If the character is completely off-screen to the left, skip it
      if (currentX + 7 < 0) {
        currentX += 8;
        continue;
      }
      
      // If the character is completely off-screen to the right, stop drawing
      if (currentX >= COLS) {
        break;
      }
      
      // Draw the 7x10 bitmap (centered vertically: top Y = 3)
      const startY = 3;
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 7; x++) {
          if (bitmap[y][x]) {
            store.setPixel(startY + y, currentX + x, color);
          }
        }
      }
      
      currentX += 8; // Move to the next character position (7 width + 1 spacing)
    }
  }

  // Select first frame of the new animation
  store.selectFrame(startFrameIndex);
};

// --- Import Functionality ---
const importCode = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const text = await file.text();

  const hexMatches = text.match(/0x[A-Fa-f0-9]{6}/g);
  if (!hexMatches || hexMatches.length === 0) {
    showNotification("No valid frame data found in the file.", "error");
    target.value = "";
    return;
  }

  const frameSize = ROWS * COLS;
  if (hexMatches.length % frameSize !== 0) {
    showNotification(
      "Invalid number of pixels found in the file. Dimensions must be 32x16.",
      "error",
    );
    target.value = "";
    return;
  }

  const numFrames = hexMatches.length / frameSize;
  store.frames.value = [];

  for (let f = 0; f < numFrames; f++) {
    // Create an empty MatrixFrame (ROWS x COLS filled with black)
    const frame: string[][] = Array.from({ length: ROWS }, () =>
      Array(COLS).fill("#000000"),
    );

    // Parse the [X][Y] format where Y=0 is bottom
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        const index = f * frameSize + x * ROWS + y;
        const hex = hexMatches[index].replace("0x", "#");

        // Map Y coordinate (origin bottom-left) to internal row (origin top-left)
        const internalY = ROWS - 1 - y;
        frame[internalY][x] = hex;
      }
    }
    store.frames.value.push(frame);
  }

  store.currentFrameIndex.value = 0;
  target.value = "";
  showNotification("Code imported successfully!", "success");
};

// --- Import Image Functionality ---
const importImage = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];

  // Create an image element
  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = objectUrl;
    });

    // Create a hidden canvas at 32x16
    const canvas = document.createElement("canvas");
    canvas.width = COLS;
    canvas.height = ROWS;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      showNotification("Canvas not supported in this browser.", "error");
      return;
    }

    // Draw the image scaled to 32x16
    ctx.drawImage(img, 0, 0, COLS, ROWS);

    // Read pixel data
    const imageData = ctx.getImageData(0, 0, COLS, ROWS);
    const pixels = imageData.data; // RGBA flat array

    // Create a new frame from the pixel data
    store.addFrame();
    store.clearGrid();

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = (y * COLS + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        // alpha ignored — treat as opaque

        const toHex = (n: number) => n.toString(16).padStart(2, "0");
        const rawHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        const hexColor = applyIntensity(rawHex, 20);

        store.setPixel(y, x, hexColor);
      }
    }

    showNotification(
      `Image imported as ${COLS}x${ROWS} frame!`,
      "success"
    );
  } catch (err) {
    console.error("Image import error:", err);
    showNotification("Failed to import image. Try PNG or JPG format.", "error");
  } finally {
    URL.revokeObjectURL(objectUrl);
    target.value = "";
  }
};

// --- Export Functionality (Send to ESP32 via JSON) ---
const isSending = ref(false);

const exportCode = async () => {
  if (store.frames.value.length === 0) {
    showNotification("No frames to export!", "error");
    return;
  }

  if (window.location.protocol === "https:") {
    const proceed = confirm(
      "Attention : Vous êtes sur un site sécurisé (HTTPS). Le navigateur bloque par défaut les appels vers l'ESP32 (HTTP).\n\n" +
      "Pour corriger cela :\n" +
      "1. Cliquez sur le cadenas à gauche de l'URL\n" +
      "2. Paramètres du site\n" +
      "3. Autorisez le 'Contenu non sécurisé'\n\n" +
      "Voulez-vous quand même essayer ?"
    );
    if (!proceed) return;
  }

  const fpsInput = prompt("FPS (frames per second):", "20");
  if (fpsInput === null) return; // User cancelled
  const fps = parseInt(fpsInput, 10) || 20;

  isSending.value = true;
  showNotification("Sending animation to ESP32...", "success", 2000);

  try {
    const frameCount = store.frames.value.length;

    const hexParts: string[] = [];

    // The Python script expects frames in column-major order (x outer, y inner)
    // with Y=0 at the top left of the actual LED matrix.
    // Store format is [ROWS][COLS] with [0][0] at top-left.
    for (const frame of store.frames.value) {
      for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
          // ESP32 expects Y=0 to be the bottom left
          // Our store has Y=0 at the top left.
          const internalY = ROWS - 1 - y;
          const hexColor = frame[internalY][x]; // e.g. "#RRGGBB"
          // Convert "#RRGGBB" to "RRGGBB"
          const cleanHex = hexColor.substring(1).toUpperCase();
          hexParts.push(cleanHex);
        }
      }
    }

    const payload = {
      frameCount: frameCount,
      fps: fps,
      data: hexParts.join("")
    };

    const response = await fetch("http://192.168.4.1/animation", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    showNotification("Animation successfully sent to ESP32!", "success");
  } catch (error) {
    console.error("Error sending to ESP32:", error);
    showNotification(
      "Failed to connect to ESP32. Ensure you are connected to its Wi-Fi.",
      "error",
      6000
    );
  } finally {
    isSending.value = false;
  }
};

// --- Firebase Integration (Save) ---
const isSaveModalOpen = ref(false);
const saveTab = ref<"new" | "overwrite">("new");
const newPatternName = ref("");
const isSaving = ref(false);
const savingTargetId = ref<string | null>(null);

const openSaveModal = async () => {
  isSaveModalOpen.value = true;
  saveTab.value = "new";
  newPatternName.value = "matrix_animation";
  savingTargetId.value = null;

  // Pre-load patterns for overwrite tab
  isLoadingPatterns.value = true;
  try {
    savedPatterns.value = await getPatterns();
  } catch (e) {
    // Ignore error, empty state will show
  } finally {
    isLoadingPatterns.value = false;
  }
};

const closeSaveModal = () => {
  isSaveModalOpen.value = false;
};

const saveAsNewPattern = async () => {
  const name = newPatternName.value.trim();
  if (!name) return;

  isSaving.value = true;
  try {
    const isTaken = await checkPatternExists(name);
    if (isTaken) {
      showNotification(
        "Ce nom de motif est déjà utilisé. Veuillez choisir un autre nom.",
        "error",
      );
      return;
    }

    const framesClone = JSON.parse(JSON.stringify(store.frames.value));
    await savePattern(
      name,
      store.fps.value,
      store.frames.value.length,
      framesClone,
    );

    showNotification(`Motif '${name}' créé avec succès !`, "success");
    closeSaveModal();
  } catch (error) {
    console.error("Save failed:", error);
    showNotification("Erreur lors de l'enregistrement dans Firebase.", "error");
  } finally {
    isSaving.value = false;
  }
};

const overwritePattern = async (pattern: LedPattern) => {
  if (!pattern.id) return;

  isSaving.value = true;
  savingTargetId.value = pattern.id;
  try {
    const framesClone = JSON.parse(JSON.stringify(store.frames.value));
    await updatePattern(
      pattern.id,
      pattern.name,
      store.fps.value,
      store.frames.value.length,
      framesClone,
    );

    showNotification(`Motif '${pattern.name}' écrasé avec succès !`, "success");
    closeSaveModal();
  } catch (error) {
    console.error("Overwrite failed:", error);
    showNotification("Erreur lors de la mise à jour dans Firebase.", "error");
  } finally {
    isSaving.value = false;
    savingTargetId.value = null;
  }
};

// --- Load Logic ---
const isLoadModalOpen = ref(false);
const isLoadingPatterns = ref(false);
const savedPatterns = ref<LedPattern[]>([]);

const openLoadModal = async () => {
  isLoadModalOpen.value = true;
  isLoadingPatterns.value = true;
  try {
    savedPatterns.value = await getPatterns();
  } catch (e) {
    showNotification("Erreur lors de la récupération des motifs", "error");
  } finally {
    isLoadingPatterns.value = false;
  }
};

const closeLoadModal = () => {
  isLoadModalOpen.value = false;
};

const loadPattern = (pattern: LedPattern) => {
  store.fps.value = pattern.fps;

  const importedFrames = JSON.parse(JSON.stringify(pattern.frames));

  // Check if workspace is just one empty black frame
  const isBlank =
    store.frames.value.length === 1 &&
    store.frames.value[0].every((row: string[]) =>
      row.every((pixel: string) => pixel === "#000000" || pixel === "#000"),
    );

  if (isBlank) {
    store.frames.value = importedFrames;
  } else {
    store.frames.value.push(...importedFrames);
  }

  // Go to the start of the newly imported frames
  store.currentFrameIndex.value = isBlank
    ? 0
    : store.frames.value.length - importedFrames.length;

  closeLoadModal();
  showNotification(
    `Les frames du motif '${pattern.name}' ont été ajoutées !`,
    "success",
  );
};
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
  box-shadow:
    0 0 12px rgba(88, 166, 255, 0.8),
    0 0 24px rgba(189, 86, 255, 0.4);
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
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

@media (max-width: 1200px) {
  .workspace {
    flex-direction: column;
  }
  .toolbar-wrapper {
    width: 100%;
    max-height: 300px;
  }
}

.toolbar-wrapper {
  width: 260px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.toolbar-wrapper h3,
.timeline-wrapper h3 {
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  background-color: #161b22;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.loading-state,
.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 0;
}

.save-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

.tab-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.tab-btn.active {
  color: var(--accent-color);
  background: rgba(88, 166, 255, 0.1);
}

.tab-btn:hover:not(.active) {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.save-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-section label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.pattern-name-input {
  flex-grow: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px 14px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  outline: none;
}

.pattern-name-input:focus {
  border-color: var(--accent-color);
}

.pattern-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pattern-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.pattern-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pattern-meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.btn.small {
  padding: 6px 12px;
  font-size: 0.85rem;
}

/* --- Toast Notifications --- */
.toast-container {
  position: fixed;
  top: 24px;
  left: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2000;
  pointer-events: none; /* Let clicks pass through empty space */
}

.toast {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #161b22;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 14px 44px 14px 16px; /* Right padding handles close button */
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  min-width: 250px;
  max-width: 400px;
  pointer-events: auto; /* Re-enable clicks on the toast itself */
  font-weight: 500;
}

.toast-success {
  border-left: 4px solid var(--accent-color);
}
.toast-success .toast-icon {
  color: var(--accent-color);
}
.toast-progress-success {
  background-color: var(--accent-color);
}

.toast-error {
  border-left: 4px solid var(--secondary-color);
}
.toast-error .toast-icon {
  color: var(--secondary-color);
}
.toast-progress-error {
  background-color: var(--secondary-color);
}

.toast-content {
  flex-grow: 1;
  font-size: 14px;
  white-space: pre-line;
}

.toast-close {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.1s;
}
.toast-close:hover {
  color: var(--text-primary);
}

/* Base progress bar style and animation */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Vue Transition for Toasts - Top left animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-60px) scale(0.9) translateY(-20px);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.version {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--accent-color);
  background: rgba(88, 166, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
  border: 1px solid rgba(88, 166, 255, 0.2);
  letter-spacing: 0.5px;
}
</style>
