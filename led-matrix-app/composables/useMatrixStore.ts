import { ref, computed } from 'vue'

export type ToolType = 'draw' | 'erase' | 'fill'
export type MatrixFrame = string[][]

export const COLS = 32
export const ROWS = 16
export const DEFAULT_COLOR = '#000000'

export function createEmptyFrame(): MatrixFrame {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(DEFAULT_COLOR))
}

// Global state using Vue refs
const frames = ref<MatrixFrame[]>([createEmptyFrame()])
const currentFrameIndex = ref<number>(0)
const selectedColor = ref<string>('#58a6ff')
const currentTool = ref<ToolType>('draw')
const isPlaying = ref<boolean>(false)
const fps = ref<number>(10)

export const useMatrixStore = () => {
    const currentFrame = computed(() => frames.value[currentFrameIndex.value])

    const setPixel = (row: number, col: number, color: string) => {
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            frames.value[currentFrameIndex.value][row][col] = color
        }
    }

    const applyTool = (row: number, col: number) => {
        if (currentTool.value === 'draw') {
            setPixel(row, col, selectedColor.value)
        } else if (currentTool.value === 'erase') {
            setPixel(row, col, DEFAULT_COLOR)
        } else if (currentTool.value === 'fill') {
            fillGrid(selectedColor.value)
        }
    }

    const fillGrid = (color: string) => {
        frames.value[currentFrameIndex.value] = frames.value[currentFrameIndex.value].map(r => r.map(() => color))
    }

    const clearGrid = () => {
        fillGrid(DEFAULT_COLOR)
    }

    const addFrame = () => {
        frames.value.push(createEmptyFrame())
        currentFrameIndex.value = frames.value.length - 1
    }

    const duplicateFrame = () => {
        const cloned = JSON.parse(JSON.stringify(currentFrame.value))
        frames.value.splice(currentFrameIndex.value + 1, 0, cloned)
        currentFrameIndex.value++
    }

    const deleteFrame = (index: number) => {
        if (frames.value.length > 1) {
            frames.value.splice(index, 1)
            if (currentFrameIndex.value >= frames.value.length) {
                currentFrameIndex.value = frames.value.length - 1
            }
        }
    }

    const selectFrame = (index: number) => {
        if (index >= 0 && index < frames.value.length) {
            currentFrameIndex.value = index
        }
    }

    return {
        frames,
        currentFrameIndex,
        currentFrame,
        selectedColor,
        currentTool,
        isPlaying,
        fps,
        setPixel,
        applyTool,
        fillGrid,
        clearGrid,
        addFrame,
        duplicateFrame,
        deleteFrame,
        selectFrame
    }
}
