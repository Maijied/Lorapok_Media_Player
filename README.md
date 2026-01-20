<div align="center">

  <img src="assets/logo.png" alt="Lorapok Player Logo" width="180" height="180" />

  # LORAPOK PLAYER
  ### SUPERCOMPUTING MEDIA ENGINE

  [![Version](https://img.shields.io/badge/version-1.2.0-00F3FF?style=flat-square&labelColor=050510)](https://github.com/Maijied/Lorapok_Media_Player)
  [![License](https://img.shields.io/badge/license-MIT-BC13FE?style=flat-square&labelColor=050510)](LICENSE)
  [![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-white?style=flat-square&labelColor=050510)](https://github.com/Maijied/Lorapok_Media_Player)

  <p align="center">
    The next-generation media player blending <b>biological aesthetics</b> with <b>supercomputing performance</b>.
    <br />
    Engineered for ultra-low latency playback and high-fidelity sensory experiences.
  </p>

  <div align="center">
    <a href="https://maijied.github.io/Lorapok_Media_Player/">
      <img src="assets/btn-demo.svg" width="200" alt="Try Live Demo" />
    </a>
    &nbsp;&nbsp;
    <a href="https://github.com/Maijied/Lorapok_Media_Player/releases/latest">
      <img src="assets/btn-download.svg" width="200" alt="Download Latest" />
    </a>
  </div>

  <br />

  <img src="assets/showcase-video.png" alt="Lorapok Main Interface" width="100%" style="border-radius: 12px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.1);" />

  <br />

  <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 20px;">
     <img src="assets/showcase-empty.png" alt="Main Interface" width="31%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);" />
     <img src="assets/showcase-audio.png" alt="Audio Intelligence" width="31%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);" />
     <img src="assets/showcase-neural.png" alt="Neural Decoding" width="31%" style="border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);" />
  </div>

</div>

---

## 🧬 ENGINE CAPABILITIES

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Neural Decoding V2** | High-performance FFmpeg-powered pipeline for MKV, AVI, WMV, and FLV. | 🟢 Ready |
| **Universal Stream** | Native HLS (.m3u8) and DASH (.mpd) support with zero-buffer track switching. | 🟢 Ready |
| **Robust Probing** | Intelligent metadata discovery (FFprobe) for 100% accurate duration/seeking. | 🟢 Ready |
| **Organic UI** | Dynamic ambient lighting engine that reacts to video colors in real-time. | 🟢 Ready |
| **Smart Resume** | Atomic position tracking to resume playback exactly where you left off. | 🟢 Ready |
| **Hardware Accel** | GPU-accelerated rasterization for buttery smooth 4K/8K playback. | 🟢 Ready |

---

## 🖥 SYSTEM REQUIREMENTS

### Desktop Application
| Component | Minimum Requirement | Recommended |
| :--- | :--- | :--- |
| **OS (Windows)** | Windows 10 (Build 19041+) | Windows 11 |
| **OS (macOS)** | macOS 12.0 (Monterey) | macOS 14.0 (Sonoma) |
| **OS (Linux)** | Ubuntu 22.04+, Debian 11+ | Latest Fedora / Arch |
| **Processor** | Dual Core 2.0GHz | Quad Core 3.0GHz+ |
| **Memory** | 4 GB RAM | 8 GB RAM+ |
| **Graphics** | DirectX 11 / OpenGL 4.1 | NVIDIA GTX 1050 / Apple M1+ |

### Development Environment
- **Node.js**: v20.x or higher (LTS recommended)
- **NPM**: v10.x or higher
- **Git**: Latest version for source control

---

## 📦 INSTALLATION & USAGE

### 1. Download Pre-built (Recommended)
Simply grab the latest installer for your OS from the [Releases Page](https://github.com/Maijied/Lorapok_Media_Player/releases/latest).

### 2. NPM Package for Developers
Integrate the Lorapok Player core into your own React applications.

```bash
npm install lorapok-player
```

```tsx
import { LorapokPlayer } from 'lorapok-player';
import 'lorapok-player/style.css';

const App = () => (
  <LorapokPlayer 
    src="https://example.com/stream.m3u8" 
    className="rounded-2xl"
  />
);
```

### 3. Build from Source
```bash
# Clone the repository
git clone https://github.com/Maijied/Lorapok_Media_Player.git
cd Lorapok_Media_Player

# Install all dependencies
npm install

# Start development mode
npm run dev:electron

# Build production binaries
npm run build
```

---

## 🎹 KEYBOARD SHORTCUTS

| Key | Action |
| :---: | :--- |
| `Space` / `K` | Play / Pause |
| `Left` / `Right` | Seek Backward / Forward (10s) |
| `Up` / `Down` | Volume Up / Down |
| `F` | Toggle Fullscreen |
| `M` | Mute / Unmute |
| `S` | Take Screenshot (Saved to Pictures/Lorapok) |
| `A` | Cycle Aspect Ratio (16:9, 4:3, etc.) |
| `N` / `P` | Next / Previous Track |

---

## 🏗 TECH STACK
- **Core**: React 18, TypeScript, Tailwind CSS
- **Runtime**: Electron 30
- **Animations**: Framer Motion
- **Media Engine**: HLS.js, Dash.js, Fluent-FFmpeg
- **Icons**: Lucide React

---

## 📜 LICENSE

[MIT](LICENSE) © 2026 Lorapok Team. The core media engine and biological aesthetics are optimized for high-performance open computing.