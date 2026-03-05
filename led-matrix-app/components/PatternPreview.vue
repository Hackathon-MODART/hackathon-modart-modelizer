<template>
  <canvas
    ref="canvas"
    :width="32 * scale"
    :height="16 * scale"
    class="pattern-preview"
    @mouseenter="startAnimation"
    @mouseleave="stopAnimation"
    :title="frames.length > 1 ? 'Survolez pour prévisualiser l\'animation' : ''"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    frames: string[][][];
    fps?: number;
    scale?: number;
  }>(),
  {
    fps: 10,
    scale: 3,
  }
);

const canvas = ref<HTMLCanvasElement | null>(null);
let animationId: number | null = null;
let currentFrameIndex = 0;
let lastDrawTime = 0;

const defaultFrame = computed(() => {
  if (!props.frames || props.frames.length === 0) return null;

  for (const frame of props.frames) {
    const hasColor = frame.some((row) =>
      row.some((pixel) => pixel !== "#000000" && pixel !== "#000")
    );
    if (hasColor) return frame;
  }
  return props.frames[0];
});

const drawFrame = (frame: string[][]) => {
  if (!canvas.value || !frame) return;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;

  const cols = 32;
  const rows = 16;
  const scale = props.scale;

  ctx.fillStyle = "#111111"; 
  ctx.fillRect(0, 0, cols * scale, rows * scale);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = frame[r]?.[c] || "#000000";
      if (color !== "#000000" && color !== "#000") {
        ctx.fillStyle = color;
        ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    }
  }
};

const drawDefault = () => {
  if (defaultFrame.value) {
    drawFrame(defaultFrame.value);
  }
};

const animate = (timestamp: number) => {
  if (!animationId) return;

  const frameDuration = 1000 / (props.fps || 10);

  if (timestamp - lastDrawTime >= frameDuration) {
    if (props.frames && props.frames.length > 0) {
      drawFrame(props.frames[currentFrameIndex]);
      currentFrameIndex = (currentFrameIndex + 1) % props.frames.length;
    }
    lastDrawTime = timestamp;
  }

  animationId = requestAnimationFrame(animate);
};

const startAnimation = () => {
  if (!props.frames || props.frames.length <= 1) return;
  currentFrameIndex = 0;
  lastDrawTime = performance.now();
  
  if (!animationId) {
    animationId = requestAnimationFrame(animate);
  }
};

const stopAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  drawDefault();
};

onMounted(() => {
  drawDefault();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});

watch(
  () => props.frames,
  () => {
    stopAnimation();
    drawDefault();
  },
  { deep: true }
);
</script>

<style scoped>
.pattern-preview {
  border-radius: 4px;
  border: 1px solid var(--border-color);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  display: block;
  transition: border-color 0.2s;
}

.pattern-preview:hover {
  border-color: var(--accent-color);
  cursor: pointer;
}
</style>
