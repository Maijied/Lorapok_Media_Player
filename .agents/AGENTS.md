# Lorapok Project Architecture & Guidelines

## Project Structure
This repository contains the Lorapok Media Player project, split into two main components:
1. **`lorapok-player/`**: The core desktop application built with Electron, React 18, TypeScript, and Vite.
2. **`lorapok-extension/`**: A Chrome extension (Manifest V3) that integrates with the player using a custom protocol handler (`lorapok://`).

## Technology Stack
- **Frontend UI**: React 18, Tailwind CSS, Framer Motion, and Lucide React.
- **Media Engine**: `fluent-ffmpeg`, `dashjs`, and `hls.js` for robust playback, HLS, and MPEG-DASH support.
- **Build System**: Vite, TypeScript, and `electron-builder` for multi-platform distribution.
- **Testing**: A custom script (`manage_lorapok.sh`) at the root directory handles downloading test media and testing the protocol handler and streams.

## Important Commands
Always use the provided `manage_lorapok.sh` script in the project root for building and testing to ensure consistency:
- **Build**: `./manage_lorapok.sh build` (Installs dependencies and uses electron-builder for Linux, Windows, macOS, and packages the extension).
- **Test**: `./manage_lorapok.sh test` (Downloads test files into `test_media/` and tests the protocol handler, local files, and streaming URLs).
- **Setup Media Only**: `./manage_lorapok.sh setup-media` (Downloads sample files for manual testing).
- **Build & Test**: `./manage_lorapok.sh all`

## Guidelines
- When making UI changes, adhere to the "biological aesthetics" and "organic UI" design language specified in the README, leveraging Tailwind CSS and Framer Motion.
- When working on the player core, start from `lorapok-player/` and ensure compatibility with Electron.
