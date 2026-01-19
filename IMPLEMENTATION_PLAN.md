# Lorapok Media Player - Implementation Plan

## 1. Project Overview
**Product Name:** Lorapok Media Player
**Core Identity:** "Organic Intelligence"
**Visual Style:** Dark Mode Futurism (Midnight Blue, Neon Cyan, Electric Purple)
**Platform:** Windows, Ubuntu, macOS (via Electron)

## 2. Technical Architecture

### 2.1 Core Player Engine
*   **Framework:** Electron + React.
*   **High-Resolution Support (4K/8K):**
    *   **Hardware Acceleration:** Explicitly enable `--ignore-gpu-blacklist`, `--enable-gpu-rasterization`, and `--enable-zero-copy` in Electron's main process to utilize the OS's native GPU decoding capabilities for smooth 4K/8K playback.
    *   **Upscaling Strategy (Future):** While native 8K files will play directly, for upscaling 1080p content to 4K, we will implement a WebGL-based shader pipeline (using a custom video renderer canvas) to apply sharpening and upscaling filters in real-time.
*   **Codecs:** Native Chromium support (MP4, WebM, OGG) initially. 
    *   *Roadmap:* Integration of `mpv.js` or `webchimera` for full VLC-like codec support (MKV, AVI, FLV) in Phase 2.

### 2.2 The "Web Plugin" (Browser Extension)
*   **Concept:** A "Lorapok Connector" browser extension.
*   **Functionality:** Adds an "Open in Lorapok" context menu option to video links and detects downloadable media on web pages.
*   **Mechanism:** Registers a custom protocol handler (`lorapok://`) in the OS. The extension opens URLs using this protocol, which triggers the desktop app to launch and stream the video immediately.

## 3. Visual Design System ("The Lorapok Theme")
*   **Colors:**
    *   `midnight`: `#050510` (Backgrounds)
    *   `glass`: `rgba(5, 5, 16, 0.7)` (Panels)
    *   `neon-cyan`: `#00f3ff` (Primary Accent / Data)
    *   `electric-purple`: `#bc13fe` (Secondary Accent / AI)
*   **Typography:** JetBrains Mono (Code/Technical), Inter (UI).
*   **Effects:** 
    *   Background blurs (`backdrop-filter: blur(12px)`).
    *   Holographic borders (1px solid rgba(0, 243, 255, 0.1)).

## 4. Development Phases

### Phase 1: Foundation & Theming (Current)
1.  **Tailwind Configuration:** Define the custom color palette and font stacks.
2.  **App Shell:** Create the frameless window with a custom "Traffic Light" control set (Mac/Windows style) integrated into the design.
3.  **Mascot Integration:** Add the "Lorapok" larva placeholder on the welcome screen.

### Phase 2: Core Player Mechanics
1.  **Video Player Component:** Build a custom React video player wrapping the HTML5 `<video>` tag.
2.  **Custom Controls:** Replicate VLC controls (Play, Pause, Scrub, Volume, Speed) but with the Neon/Glass aesthetic.
3.  **File System Access:** Implement Electron IPC to open local files via drag-and-drop and system dialogs.

### Phase 3: Advanced Features & Web Plugin
1.  **Protocol Handler:** Register `lorapok://` in `electron/main.ts`.
2.  **Web Extension:** Create a minimal Chrome/Firefox extension manifest to send URLs to the app.
3.  **4K Optimization:** Stress test with high-bitrate files and tune Electron's GPU flags.

## 5. Next Steps
- Configure `tailwind.config.js`.
- Build the `AppShell` layout.
