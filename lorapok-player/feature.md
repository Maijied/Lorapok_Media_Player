# Lorapok Media Player Features

## Core Identity: "Organic Intelligence"
- **Mascot:** Stylized soldier fly larva (Lorapok).
- **Vibe:** Approachable curiosity, friendly assistant.

## Visual Palette: "Dark Mode Futurism"
- **Primary Background:** Deep Midnight (#050510).
- **Accent 1:** Neon Cyan (#00f3ff) - Data/Code.
- **Accent 2:** Electric Purple (#bc13fe) - AI/Magic.
- **Texture:** Glassmorphism, holographic interfaces, smooth animations.

## Technical Specifications
- **Framework:** Electron + React + TypeScript.
- **Resolution Support:** 
  - [x] 1080p (Standard HD)
  - [x] 4K (Ultra HD) - GPU Acceleration Enabled.
  - [x] 8K (Extreme HD) - Zero-copy decoding enabled.
- **Playback Engine:** 
  - [x] Standard HTML5 Video (MP4, WebM, OGG).
  - [x] Neural Decode Core (FFmpeg Transcoding for MKV, AVI, FLV, WMV).
- **Native OS & Mobile/TV Integration:**
  - [x] Frameless Window (Custom title bar).
  - [x] Native File Dialog (Open local files).
  - [x] Hardware Acceleration (Optimized for 4K/8K).
  - [x] Android Mobile (Capacitor 8 + Home Screen Widget + MediaSession).
  - [x] Android TV (Leanback launcher + D-Pad remote navigation + TV Banner).
  - [x] Mobile Touch Gestures (Swipe Brightness/Volume, double-tap seek).
  - [x] Picture-in-Picture (PiP) background playback.
- **High-Res Optimization:**
  - [x] GPU Rasterization support.
  - [x] Dynamic viewport scaling & aspect ratio presets.

## Ecosystem Distribution
- **Desktop:** Windows (.exe), Linux (.AppImage, .deb, .snap), macOS (.dmg).
- **Mobile & TV:** Android APK (Universal & ABI Splits), Android App Bundle (.aab), Android TV Leanback.
- **NPM Package:** `@lorapok/player` (Reusable React component).
- **Browser Extension:** Chrome / Chromium Web Store extension (`lorapok-extension`).
- **Showcase Website:** Web live demo & documentation portal on GitHub Pages.
