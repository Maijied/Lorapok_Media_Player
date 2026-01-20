# LORAPOK PLAYER (Core Library)
### SUPERCOMPUTING MEDIA ENGINE

[![NPM Version](https://img.shields.io/npm/v/lorapok-player?style=flat-square&color=BC13FE)](https://www.npmjs.com/package/lorapok-player)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/lorapok-player?style=flat-square&color=00F3FF)](https://bundlephobia.com/package/lorapok-player)
[![NPM Downloads](https://img.shields.io/npm/dm/lorapok-player?style=flat-square&color=white&labelColor=050510)](https://www.npmjs.com/package/lorapok-player)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square&labelColor=050510)](LICENSE)

**Lorapok Player** is a high-performance React media engine engineered for ultra-low latency playback and biological aesthetics. It seamlessly handles MP4, HLS, and DASH streams with 4K/8K hardware acceleration.

---

## 🧬 FEATURES

- **Adaptive Multi-Platform**: Native support for HLS (.m3u8), DASH (.mpd), and standard Mp4.
- **Organic UI Engine**: Biological aesthetics with real-time reactive ambient lighting.
- **Hardware Acceleration**: GPU-optimized rasterization for buttery smooth 8K playback.
- **Neural Probing**: Accurate duration and metadata discovery using supercomputing pipelines.
- **Theme Injection**: Runtime theme switching with zero-latency visual transition.

---

## 📦 INSTALLATION

```bash
npm install lorapok-player
```

## 🚀 QUICK START

```tsx
import { LorapokPlayer } from 'lorapok-player';
import 'lorapok-player/style.css';

const App = () => (
  <div className="player-wrapper">
    <LorapokPlayer 
      src="https://example.com/stream.m3u8" 
      autoPlay={false}
      className="lorapok-themed"
    />
  </div>
);
```

---

## 🧬 API REFERENCE

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **src** | `string` | *Required* | Source URL (supports `.mp4`, `.m3u8`, `.mpd`). |
| **autoPlay** | `boolean` | `false` | Enable automatic playback. |
| **loop** | `boolean` | `false` | Restart media when finished. |
| **muted** | `boolean` | `false` | Start with volume at 0. |
| **poster** | `string` | `undefined` | Image displayed before video starts. |
| **className** | `string` | `undefined` | Custom CSS classes for the container. |
| **initialPosition** | `number` | `0` | Start playback from a specific timestamp (seconds). |
| **showControls** | `boolean` | `true` | Toggle the high-fidelity control deck. |

### Event Callbacks

| Callback | Signature | Description |
| :--- | :--- | :--- |
| **onPlay** | `() => void` | Fired when playback starts. |
| **onPause** | `() => void` | Fired when playback is paused. |
| **onEnded** | `() => void` | Fired when the media reaches the end. |
| **onTimeUpdate** | `(time: number) => void` | Fired periodically during playback. |
| **onError** | `(error: any) => void` | Fired when a loading or playback error occurs. |

---

## 🎮 PROGRAMMATIC CONTROL (Imperative API)

The `LorapokPlayer` component exposes a functional API via React `refs`. This allows you to control the player procedurally from your own components.

### Usage Example

```tsx
import { useRef } from 'react';
import { LorapokPlayer, LorapokPlayerRef } from 'lorapok-player';

const MyComponent = () => {
  const playerRef = useRef<LorapokPlayerRef>(null);

  const handleAction = () => {
    // Programmatically load a new video
    playerRef.current?.load('https://example.com/new-video.mp4');
    
    // Control playback
    playerRef.current?.play();
    
    // Seek to 30 seconds
    playerRef.current?.seek(30);
    
    // Switch themes on the fly
    playerRef.current?.setTheme('Cyber Bloom');
  };

  return <LorapokPlayer ref={playerRef} src="..." />;
};
```

### Exposed Methods

| Method | Signature | Description |
| :--- | :--- | :--- |
| **load** | `(url: string) => void` | Updates the source and prepares for playback. |
| **play** | `() => void` | Starts or resumes playback. |
| **pause** | `() => void` | Pauses playback. |
| **toggle** | `() => void` | Toggles play/pause state. |
| **seek** | `(time: number) => void` | Jumps to a specific timestamp (seconds). |
| **setVolume** | `(v: number) => void` | Sets volume level (0.0 to 1.0). |
| **setMuted** | `(m: boolean) => void` | Toggles or sets mute state. |
| **setTheme** | `(name: 'Midnight Core' | 'Cyber Bloom' | 'Quantum Pulse') => void` | Switches visual styling. |

---

## 🎨 STYLING & ADAPTIVE THEME

The player uses **biological aesthetics** with a reactive ambient lighting system. You can override global styles using the provided CSS variables:

```css
:root {
  --lorapok-neon-cyan: #00F3FF;
  --lorapok-electric-purple: #BC13FE;
  --lorapok-midnight: #050510;
}
```

---

## 🛠 ADVANCED USAGE

### HLS / DASH Support
The engine automatically detects and initializes `hls.js` or `dash.js` based on the file extension. No additional configuration is required.

### Custom Keyboard Shortcuts
The library comes with a built-in interactive help system and standard shortcuts:
- `SPACE` : Play/Pause
- `← / →` : Seek 5s
- `F` : Fullscreen
- `M` : Mute

---

## 🛠 TECH STACK
- **React 18** (Functional Components & Hooks)
- **HLS.js / Dash.js** (Adaptive Streaming)
- **Framer Motion** (Organic Transitions)
- **Vite** (Next-gen Bundling)

---

## 📜 LICENSE
[MIT](LICENSE) © 2026 Lorapok Team. The core media engine and biological aesthetics are optimized for high-performance open computing.
