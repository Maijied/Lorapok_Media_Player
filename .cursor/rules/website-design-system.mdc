---
description: Inviolable Lorapok website and player design system standards
globs: ["**/*website*/**", "**/*player*/**", "**/*.tsx", "**/*.css", "**/*.html"]
alwaysApply: true
---

# Lorapok Website & Player Design System Inviolable Standards

## 1. Aesthetic Palette & Theme Tokens
- **Primary Cyber Glow**: `#00f3ff` (Neon Cyan)
- **Secondary Atmospheric Accent**: `#bc13fe` (Electric Purple)
- **Tertiary Alert / Bloom**: `#ff007a` (Cyber Bloom)
- **Background Base**: `#050510` (Deep Space Midnight) with radial ambient lighting blur rings (`blur-[140px]`).
- **Surface Panels**: `bg-midnight/80 backdrop-blur-xl border border-white/10 rounded-2xl` or `rounded-3xl`.

## 2. Zero-Dependency Animation Policy
- **DO NOT** re-import `framer-motion` or heavy runtime animation bundles.
- Use pure Tailwind CSS transitions (`transition-all duration-300`, `ease-out`, `@keyframes fadeIn`) and zero-overhead React `forwardRef` shims to guarantee sub-50ms LCP and zero hydration lag.

## 3. Responsive Dual-Tier Control Deck Standard
- **Desktop (>= 1024px)**: Horizontal sleek bar with inline EQ pills (`NONE/NIGHT/VOICE/EBU`), theme dots, and hover volume slider.
- **Mobile (< 1024px)**: Strict single-line primary bar (Rewind 10s, Play/Pause, Forward 10s, Timestamp, Mute, Visualizer FX, Speed, Options, Fullscreen) with **0 button overlaps**. Secondary options must live inside the dedicated frosted glass drawer (`Sliders` trigger).

## 4. Direct Downloads & Interactive Stream Mechanics
- All binary download triggers must have native HTML `download` attributes and never open blank tabs.
- Clicking any media stream, preset card, or documentary chapter must immediately invoke `playTrackUrl()`, initiating instant non-blocking playback and smooth-scrolling to the Media Lab.
