# Lorapok Media Player — Extended Feature Specification (Phase 2)

### Document Overview
This document outlines advanced functionality, creator tools, and network capabilities for the **Lorapok Media Player**. These features are designed to elevate the software from a simple player to a robust "Media Workstation" for power users and developers, aligning with the "Organic Intelligence" brand.

---

## 🎛️ Advanced Playback Engine
*Precision tools for detailed media analysis and consumption.*

- **A-B Loop & Segment Export:** 
  - Set specific start (A) and end (B) points for continuous looping.
  - **"Clip It" Button:** Instantly export the looped segment without re-encoding (Direct Stream Copy).
- **Audio Normalization Modes:**
  - **Night Mode:** Compresses dynamic range to boost quiet dialogue and lower loud explosions.
  - **Voice Boost:** Frequency-targeted amplification for clarity in muddled audio tracks.
  - **EBU R128:** Broadcast-standard volume normalization.
- **Pro Video Controls:**
  - Real-time Deinterlacing (Yadif/Bwdif filters).
  - HDR-to-SDR Tone Mapping toggle (for viewing 4K HDR on standard monitors).
  - Geometry controls: Rotation, Mirror, Zoom/Pan, and Aspect Ratio override.

---

## 📚 Smart Library & Metadata
*Organizing chaos with "Organic Intelligence".*

- **"Hive" Media Scanner:**
  - Watch-folder support (auto-detects new files in defined directories).
  - Intelligent grouping: Automatically bundles TV show episodes and movie sequels.
- **Privacy-First History:**
  - **Incognito Mode:** Toggle to suspend watch history logging.
  - **Resume Points:** Visual progress bars on thumbnails for partially watched files.
- **Metadata Editor:**
  - Auto-fetch metadata (TMDB/TVDB integration) for poster art and descriptions.
  - Manual override for custom home videos or project files.

---

## 💬 Subtitle Commander
*The most powerful text rendering engine in a desktop player.*

- **Auto-Search & Sync:** 
  - Built-in OpenSubtitles/SubDB integration to find subtitles by file hash.
  - **Live Sync Slider:** Adjust subtitle timing (+/- ms) in real-time using the scroll wheel.
- **Styling Profiles:**
  - Save presets like "Anime" (Yellow, glowing outline) or "Cinema" (White, slight shadow, bottom-black-bar positioning).
- **OCR Import (Add-on):** 
  - Convert image-based subtitles (PGS/VobSub) to text (SRT) for searchability and resizing.

---

## 🌐 Network & Streaming Nexus
*Seamless connectivity across the "Lorapok Ecosystem".*

- **Universal Protocol Browser:**
  - Native support for SMB, SFTP, NFS, and WebDAV.
  - "Secure Vault" for saving server credentials encrypted locally.
- **Local Casting (Sender):**
  - Cast local files to Chromecast, DLNA, and AirPlay targets.
- **"Stream This" Server:**
  - Right-click any file to generate a temporary local HTTP link (e.g., `http://192.168.1.5:8080/movie.mp4`) to watch on other devices immediately without transferring.

---

## 🛠️ Creator & Developer Tools
*Features specifically for the coding/creating demographic.*

- **Frame Capture Suite:**
  - **Burst Mode:** Capture 5 frames per second for thumbnail generation.
  - **Clipboard Copy:** Copy current frame directly to clipboard (Ctrl+Shift+C) for instant pasting into Slack/Discord/Photoshop.
- **Audio Visualization Engine:**
  - Render real-time spectrograms, oscilloscopes, or "Neon Waveforms" that match the Lorapok theme.
- **Debug Overlay:**
  - Detailed OSD showing bitrate, dropped frames, keyframe intervals, and color space (4:2:0 vs 4:4:4).

---

## 🌍 Web Plugin Parity
*Bringing the desktop power to the browser.*

- **Remote Control Bridge:** 
  - Allow the Web Plugin (running in a browser) to control the Desktop App (Play/Pause/Seek) via WebSocket if on the same LAN.
- **Secure Embed Mode:**
  - A strict mode for the web player that disables local file access/drag-and-drop, strictly playing the provided URL source (useful for enterprise documentation).
- **Unified Config:**
  - Export settings (Hotkeys, EQ presets, Theme colors) to a JSON file that can be imported into the Web Plugin instance.

---

*Feature Set v1.1 — Approved for Roadmap*
