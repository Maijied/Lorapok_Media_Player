<div align="center">

  <img src="packages/website/public/logo.png" alt="Lorapok Player Logo" width="200" height="200" />

  # LORAPOK PLAYER
  ### ORGANIC INTELLIGENCE MEDIA ENGINE

  <p align="center">
    <a href="https://maijied.github.io/Lorapok_Media_Player/">
      <img src="https://img.shields.io/badge/LIVE_DEMO-00F3FF?style=for-the-badge&logo=googlechrome&logoColor=black" alt="Live Demo" />
    </a>
    <a href="https://github.com/Maijied/Lorapok_Media_Player/releases/latest">
      <img src="https://img.shields.io/badge/DOWNLOAD_LATEST-BC13FE?style=for-the-badge&logo=windows&logoColor=white" alt="Download" />
    </a>
  </p>

  <p align="center">
    The next-generation media player blending <b>biological aesthetics</b> with <b>supercomputing performance</b>.
    <br />
    Built for the modern web and desktop.
  </p>

</div>

---

## 🧬 CORE FEATURES

- **Neural Decoding**: Advanced playback engine supporting all major formats (MKV, AVI, WMV) via FFmpeg integration.
- **Organic UI**: A "living" interface that reacts to media content with dynamic ambient lighting and micro-animations.
- **Universal Drop**: Drag-and-drop any media file to instantly initialize the playback core.
- **Network Stream**: Direct URL streaming with protocol-agnostic handling.
- **Cross-Platform**: Optimized builds for Windows, macOS, and Linux.

## 📦 COMPONENT LIBRARY

Lorapok Player is also available as a standalone React component for web developers.

```bash
npm install lorapok-player
```

```tsx
import { LorapokPlayer } from 'lorapok-player';
import 'lorapok-player/style.css';

function App() {
  return (
    <LorapokPlayer
      src="https://example.com/video.mp4"
      className="w-full aspect-video rounded-xl"
    />
  );
}
```

## 🚀 DEVELOPMENT

### Desktop App (Electron)

```bash
# Install dependencies
npm install

# Start development server
npm run dev:electron

# Build for production
npm run build:electron
```

### Website

```bash
cd packages/website
npm install
npm run dev
```

## 🏗 ARCHITECTURE

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Runtime**: Electron (Main + Renderer Process Isolation)
- **Media Engine**: Fluent-FFmpeg + Custom Protocol Handler (`media://`)

## 📜 LICENSE

[MIT](LICENSE) © 2024 Lorapok Team