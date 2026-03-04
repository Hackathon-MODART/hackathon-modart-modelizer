import { ref, computed } from 'vue'

export type ToolAction = 'draw' | 'erase' | 'fill'
export type ActionMode = 'single' | 'row' | 'col'
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
const selectedColor = ref<string>('#072667')
const selectedIntensity = ref<number>(60)
const currentTool = ref<ToolAction>('draw')
const currentActionMode = ref<ActionMode>('single')
const isPlaying = ref<boolean>(false)
const fps = ref<number>(10)

// Helper to apply intensity (0-100) to a hex color (#RRGGBB)
export const applyIntensity = (hexColor: string, intensityPercent: number) => {
    if (hexColor === '#000000' || hexColor.toLowerCase() === '#000') return hexColor;

    let r = parseInt(hexColor.slice(1, 3), 16)
    let g = parseInt(hexColor.slice(3, 5), 16)
    let b = parseInt(hexColor.slice(5, 7), 16)

    const factor = intensityPercent / 100
    r = Math.min(255, Math.max(0, Math.floor(r * factor)))
    g = Math.min(255, Math.max(0, Math.floor(g * factor)))
    b = Math.min(255, Math.max(0, Math.floor(b * factor)))

    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export const useMatrixStore = () => {
    const currentFrame = computed(() => frames.value[currentFrameIndex.value])

    const setPixel = (row: number, col: number, color: string) => {
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            frames.value[currentFrameIndex.value][row][col] = color
        }
    }

    const applyTool = (row: number, col: number) => {
        const activeColor = applyIntensity(selectedColor.value, selectedIntensity.value)

        if (currentTool.value === 'fill') {
            fillGrid(activeColor)
            return
        }

        const colorToApply = currentTool.value === 'erase' ? DEFAULT_COLOR : activeColor

        if (currentActionMode.value === 'single') {
            setPixel(row, col, colorToApply)
        } else if (currentActionMode.value === 'row') {
            for (let c = 0; c < COLS; c++) {
                setPixel(row, c, colorToApply)
            }
        } else if (currentActionMode.value === 'col') {
            for (let r = 0; r < ROWS; r++) {
                setPixel(r, col, colorToApply)
            }
        }
    }

    const fillGrid = (color: string) => {
        frames.value[currentFrameIndex.value] = frames.value[currentFrameIndex.value].map(r => r.map(() => color))
    }

    const clearGrid = () => {
        fillGrid(DEFAULT_COLOR)
    }

    const clearAllFrames = () => {
        frames.value = [createEmptyFrame()]
        currentFrameIndex.value = 0
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

    const moveFrame = (fromIndex: number, toIndex: number) => {
        if (fromIndex >= 0 && fromIndex < frames.value.length && toIndex >= 0 && toIndex < frames.value.length && fromIndex !== toIndex) {
            const frameToMove = frames.value.splice(fromIndex, 1)[0]
            frames.value.splice(toIndex, 0, frameToMove)
            currentFrameIndex.value = toIndex
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
        selectedIntensity,
        currentTool,
        currentActionMode,
        isPlaying,
        fps,
        setPixel,
        applyTool,
        fillGrid,
        clearGrid,
        clearAllFrames,
        addFrame,
        duplicateFrame,
        deleteFrame,
        moveFrame,
        selectFrame
    }
}
