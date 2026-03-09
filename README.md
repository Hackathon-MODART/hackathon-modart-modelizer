# LED Matrix Studio — Modelizer

**LED Matrix Studio** is a browser-based visual editor and animation tool for designing, previewing, and deploying content to a **32×16 WS2812B LED matrix** driven by the ESP32 firmware in the [hackathon-modart](https://github.com/Hackathon-MODART/hackathon-modart) repository.

---

## Table of Contents

- [Relationship with hackathon-modart](#relationship-with-hackathon-modart)
- [Features](#features)
  - [LED Matrix Editor](#led-matrix-editor)
  - [Drawing Tools](#drawing-tools)
  - [Frame-based Animation](#frame-based-animation)
  - [Pattern Generators](#pattern-generators)
  - [Image Import](#image-import)
  - [Code Import / Export (.h files)](#code-import--export-h-files)
  - [Cloud Storage (Firebase)](#cloud-storage-firebase)
  - [ESP32 Live Streaming](#esp32-live-streaming)
  - [Snake Game](#snake-game)
  - [Hackathon Timer](#hackathon-timer)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

---

## Relationship with hackathon-modart

This repository and [hackathon-modart](https://github.com/Hackathon-MODART/hackathon-modart) form two complementary halves of the same system:

| | This repo (Modelizer) | [hackathon-modart](https://github.com/Hackathon-MODART/hackathon-modart) |
|---|---|---|
| **Role** | Web-based visual design tool | ESP32 Arduino firmware |
| **Runs on** | Any modern browser | Adafruit ESP32-S2 Feather |
| **Purpose** | Create, preview, and manage LED animations | Drive the physical 32×16 WS2812B LED matrix |

### How they connect

1. **Direct Wi-Fi streaming** — The modelizer can push animations in real time to the ESP32 over its Wi-Fi access point (`Resonance`, `192.168.4.1`):
   - `POST /animation` — streams a multi-frame animation with an FPS value.
   - `POST /static` — sends a single static frame.
   - The Snake game page streams its frames live to `http://192.168.4.1/animation`.
   - The Timer page pushes each tick as a static frame to `http://192.168.4.1/static`.

2. **C header file export** — The editor can export animations as `.h` C header files (PROGMEM arrays) that can be compiled directly into the firmware and added to the built-in animation list.

3. **C header file import** — Existing `.h` animation headers from the firmware repository (e.g. `logo_anim_v4.h`, `plasma_v2.h`) can be imported back into the editor for further modification.

4. **Shared animation format** — Both projects use the same column-major 32×16 pixel layout (`x` outer, `y` inner) with 3-byte RGB pixels, ensuring full round-trip compatibility between the browser editor and the hardware.

---

## Features

### LED Matrix Editor

- **32×16 pixel canvas** — interactive grid that matches the physical LED panel exactly.
- **Selection modes** — paint individual pixels, entire rows, or entire columns at once.
- **Color palette panel** — shows every color currently used in the active frame; click any swatch to switch to that color.
- **Color intensity slider** — adjust LED brightness per color from 1 % to 100 %.
- **Grid shift controls** — shift all content Up / Down / Left / Right with wrap-around.
- **Undo / Redo** — up to 5-level history with per-operation snapshots.
- **Auto-save** — current frames, colors, and settings are persisted to `localStorage` and restored on reload.

### Drawing Tools

| Tool | Description |
|------|-------------|
| **Draw** | Paint pixels with the active color |
| **Erase** | Clear pixels back to black |
| **Fill** | Flood-fill a contiguous region with the active color |
| **Color Picker** | Sample any pixel on the canvas to set the active color |

### Frame-based Animation

- Create and manage **multiple frames** to build sprite animations.
- **Drag-to-reorder** frames in the timeline.
- Per-frame **thumbnail previews** in the timeline panel.
- Adjustable **FPS** (1–30 frames per second) for playback.
- **Animated preview** panel with configurable scale.
- Play / pause / stop controls.

### Pattern Generators

Auto-generate starting frames without drawing from scratch:

| Generator | Description |
|-----------|-------------|
| **Logo Base** | Static ModArt logo frame |
| **Logo Animation** | Pre-built animated logo sequence |
| **Plasma Flow** | Colorful plasma wave animation |
| **Scrolling Text** | Render custom text as a scrolling marquee across the matrix |

### Image Import

- Import **PNG, JPG/JPEG, HEIC, HEIF** image files.
- The image is automatically scaled and dithered to fit the 32×16 grid, converting it into an LED-ready pixel frame.

### Code Import / Export (.h files)

- **Export to `.h`** — save the current animation as a C PROGMEM header file ready to be included in the ESP32 firmware.
- **Import from `.h`** — load an existing firmware animation header (e.g. those in the `hackathon-modart` repository) back into the editor for modification.

### Cloud Storage (Firebase)

- **Save** the current animation to Firestore with a custom name.
- **Load** any previously saved animation from the cloud library.
- **Update** an existing saved pattern in place.
- **Delete** patterns from the cloud library.
- Each saved entry stores name, FPS, frame count, and creation timestamp.

### ESP32 Live Streaming

Connect to the ESP32's Wi-Fi access point (`Resonance`) and stream content directly from the browser:

- **Send animation** — pushes the full multi-frame animation to `POST http://192.168.4.1/animation`, which the firmware plays back immediately.
- **Send static frame** — pushes the current frame to `POST http://192.168.4.1/static`.

### Snake Game

Available at `/snake`:

- A fully playable **Snake game** rendered on the 32×16 matrix canvas in the browser.
- Each game tick is streamed live to the ESP32 (`POST /animation`) so the physical LED panel mirrors the browser game in real time.
- Tracks and displays the current score.

### Hackathon Timer

Available at `/timer`:

- A **live countdown timer** displayed on the 32×16 matrix canvas.
- Digits are rendered using a compact **3×5 pixel font**.
- Each tick is pushed to the ESP32 (`POST /static`) so the physical panel shows the countdown in real time.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Nuxt 3](https://nuxt.com) (Vue 3 + TypeScript) |
| State management | Vue composables (`useMatrixStore`) |
| Backend / database | [Firebase](https://firebase.google.com) (Firestore) |
| Hardware target | Adafruit ESP32-S2 Feather + 32×16 WS2812B |

---

## Getting Started

```bash
cd led-matrix-app

# Install dependencies
npm install

# Start the development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

> **Firebase:** create a `.env` file in `led-matrix-app/` with your Firebase project credentials:
> ```
> NUXT_PUBLIC_FIREBASE_API_KEY=...
> NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
> NUXT_PUBLIC_FIREBASE_PROJECT_ID=...
> NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
> NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
> NUXT_PUBLIC_FIREBASE_APP_ID=...
> NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
> ```

> **ESP32 streaming:** connect to the `Resonance` Wi-Fi access point created by the ESP32, then use the streaming features from within the editor.

---

## Project Structure

```
hackathon-modart-modelizer/
└── led-matrix-app/               # Nuxt 3 application
    ├── components/
    │   ├── MatrixGrid.vue         # Core 32×16 LED canvas
    │   ├── Toolbar.vue            # Drawing tools, color picker, generators
    │   └── Timeline.vue           # Frame list, playback controls, FPS
    ├── composables/
    │   ├── useMatrixStore.ts      # Global state: frames, tools, undo history
    │   └── usePatterns.ts         # Firebase CRUD operations
    ├── pages/
    │   ├── index.vue              # Main editor page
    │   ├── snake.vue              # Snake game page
    │   └── timer.vue              # Hackathon countdown timer page
    ├── server/                    # Nuxt server routes
    ├── utils/
    │   ├── firebase.ts            # Firebase initialization
    │   └── version.ts             # App version constant
    └── nuxt.config.ts             # Nuxt + Firebase configuration
```
