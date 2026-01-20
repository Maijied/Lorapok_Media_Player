# LORAPOK PLAYER (Core Library)
### SUPERCOMPUTING MEDIA ENGINE

[![NPM Version](https://img.shields.io/npm/v/lorapok-player?style=flat-square&color=BC13FE)](https://www.npmjs.com/package/lorapok-player)
[![Peer Dependencies](https://img.shields.io/badge/react-18.x-00F3FF?style=flat-square)](https://react.dev)

Integration library for the next-generation media engine. Engineered for ultra-low latency playback and high-fidelity sensory experiences.

## 📦 INSTALLATION

```bash
npm install lorapok-player
```

## 🚀 QUICK START

```tsx
import { LorapokPlayer } from 'lorapok-player';
import 'lorapok-player/style.css';

const App = () => (
  <div style={{ width: '100%', aspectRatio: '16/9' }}>
    <LorapokPlayer 
      src="https://example.com/stream.m3u8" 
      autoPlay={false}
      className="rounded-2xl shadow-2xl"
    />
  </div>
);
```

## 🧬 FEATURES
- **Universal Stream**: HLS (.m3u8) & DASH (.mpd) support.
- **Organic UI**: Reactive ambient lighting engine.
- **Smart Resume**: Native position tracking.
- **Hardware Accel**: GPU-accelerated rendering.

## 📜 LICENSE
[MIT](LICENSE) © 2026 Lorapok Team
