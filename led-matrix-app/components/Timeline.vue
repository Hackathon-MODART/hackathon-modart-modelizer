<template>
  <div class="timeline-container">
    <div class="playback-controls">
      <button class="btn" @click="togglePlay" :class="{ primary: isPlaying }">
        <svg
          v-if="!isPlaying"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      </button>
      <div class="fps-control">
        <label>FPS: {{ fps }}</label>
        <input type="range" v-model.number="fps" min="1" max="30" />
      </div>
    </div>

    <div class="frames-list" ref="framesListRef">
      <div
        v-for="(frame, index) in frames"
        :key="index"
        class="frame-thumbnail"
        :class="{ active: currentFrameIndex === index }"
        draggable="true"
        @click="selectFrame(index)"
        @dragstart="onDragStart($event, index)"
        @dragover.prevent
        @dragenter.prevent
        @drop="onDrop($event, index)"
      >
        <div class="frame-number">{{ index + 1 }}</div>
        <!-- Thumbnail representation -->
        <div class="thumbnail-grid">
          <div v-for="(row, r) in frame" :key="r" class="tb-row">
            <div
              v-for="(color, c) in row"
              :key="c"
              class="tb-cell"
              :style="{
                backgroundColor: color !== '#000000' ? color : 'transparent',
              }"
            ></div>
          </div>
        </div>

        <button
          class="delete-btn"
          @click.stop="deleteFrame(index)"
          v-if="frames.length > 1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="add-frame-actions">
      <button class="btn" @click="addFrameAndScroll" title="Add blank frame">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <button
        class="btn"
        @click="duplicateFrameAndScroll"
        title="Duplicate current frame"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path
            d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
          ></path>
        </svg>
      </button>

      <button
        class="btn hazard-hover"
        @click="deleteCurrentFrame"
        title="Delete current frame"
        :disabled="frames.length <= 1"
        :class="{ disabled: frames.length <= 1 }"
      >
        <svg
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
          <polyline points="3 6 5 6 21 6"></polyline>
          <path
            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          ></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>

      <div
        style="
          width: 2px;
          height: 28px;
          background: var(--border-color);
          border-radius: 2px;
          margin: 0 4px;
        "
      ></div>

      <button
        class="btn super-danger"
        @click="clearAllFrames"
        title="Clear ALL frames (Reset workspace)"
      >
        <svg
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
          <!-- Back layer trash effect -->
          <path
            d="M5 8h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8z"
            opacity="0.3"
          ></path>
          <!-- Front trash -->
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
          <path d="M8 6V4a2 2 0 0 1 2-2h4c1 0 2 1 2 2v2"></path>
          <!-- ALL typography -->
          <text
            x="12"
            y="15.5"
            font-size="6.5"
            text-anchor="middle"
            font-weight="900"
            font-family="sans-serif"
            fill="currentColor"
            stroke="none"
          >
            ALL
          </text>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from "vue";

const store = useMatrixStore();
const {
  frames,
  currentFrameIndex,
  isPlaying,
  fps,
  selectFrame,
  addFrame,
  duplicateFrame,
  deleteFrame,
  clearAllFrames,
} = store;

const deleteCurrentFrame = () => {
  if (frames.value.length > 1) {
    deleteFrame(currentFrameIndex.value);
  }
};

let timer: ReturnType<typeof setInterval> | null = null;
const framesListRef = ref<HTMLElement | null>(null);

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    if (frames.value.length <= 1) {
      isPlaying.value = false;
      return;
    }
    startTimer();
  } else {
    stopTimer();
  }
};

const startTimer = () => {
  stopTimer();
  timer = setInterval(() => {
    let nextIndex = currentFrameIndex.value + 1;
    if (nextIndex >= frames.value.length) {
      nextIndex = 0;
    }
    currentFrameIndex.value = nextIndex;
    scrollToActiveFrame();
  }, 1000 / fps.value);
};

const stopTimer = () => {
  if (timer) clearInterval(timer);
};

watch(fps, () => {
  if (isPlaying.value) {
    startTimer();
  }
});

onUnmounted(() => {
  stopTimer();
});

const scrollToActiveFrame = async () => {
  await nextTick();
  if (framesListRef.value) {
    const activeEl = framesListRef.value.querySelector(
      ".frame-thumbnail.active",
    ) as HTMLElement;
    if (activeEl) {
      const containerLeft = framesListRef.value.scrollLeft;
      const containerRight = containerLeft + framesListRef.value.clientWidth;
      const elLeft = activeEl.offsetLeft;
      const elRight = elLeft + activeEl.clientWidth;

      if (elLeft < containerLeft || elRight > containerRight) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }
};

const addFrameAndScroll = async () => {
  addFrame();
  await scrollToActiveFrame();
};

const duplicateFrameAndScroll = async () => {
  duplicateFrame();
  await scrollToActiveFrame();
};

const onDragStart = (e: DragEvent, index: number) => {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }
}

const onDrop = (e: DragEvent, dropIndex: number) => {
  if (e.dataTransfer) {
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (!isNaN(dragIndex) && dragIndex !== dropIndex) {
      moveFrame(dragIndex, dropIndex)
      scrollToActiveFrame()
    }
  }
}

watch(currentFrameIndex, () => {
  if (!isPlaying.value) {
    scrollToActiveFrame();
  }
});
</script>

<style scoped>
.timeline-container {
  display: flex;
  height: 100%;
  gap: 24px;
  align-items: center;
}

.playback-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 120px;
  padding-right: 24px;
  border-right: 1px solid var(--border-color);
}

.fps-control {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fps-control label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.fps-control input[type="range"] {
  width: 100%;
  accent-color: var(--accent-color);
}

.frames-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0;
  flex: 1;
  align-items: center;
  scroll-behavior: smooth;
}

.frames-list::-webkit-scrollbar {
  height: 8px;
}

.frames-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.frames-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.frame-thumbnail {
  flex: 0 0 80px;
  height: 50px;
  background: #111;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}

.frame-thumbnail:hover {
  border-color: var(--text-secondary);
}

.frame-thumbnail.active {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.3);
}

.frame-number {
  position: absolute;
  top: -8px;
  left: -8px;
  font-size: 0.6rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid var(--border-color);
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 10;
}

.thumbnail-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 2px;
}

.tb-row {
  display: flex;
  flex: 1;
}

.tb-cell {
  flex: 1;
}

.delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  background: #f85149;
  border: none;
  border-radius: 50%;
  color: #fff;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.frame-thumbnail:hover .delete-btn {
  display: flex;
}

.add-frame-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
  align-items: center;
}

.add-frame-actions .btn {
  width: 44px;
  height: 44px;
  padding: 0;
}

.add-frame-actions .btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.add-frame-actions .hazard-hover {
  color: var(--text-secondary);
}

.add-frame-actions .hazard-hover:hover:not(:disabled) {
  color: #f85149;
  border-color: #f85149;
  background-color: rgba(248, 81, 73, 0.1);
}

.add-frame-actions .super-danger {
  color: #f85149;
  border-color: #f85149;
  background-color: rgba(248, 81, 73, 0.1);
}

.add-frame-actions .super-danger:hover {
  border-color: #ff7b72;
  box-shadow: 0 0 8px rgba(248, 81, 73, 0.4);
  background-color: rgba(248, 81, 73, 0.2);
}
</style>
