# Lorapok Connector — Mozilla Add-ons (AMO) & Store Submission Guide

This document contains **all official metadata, descriptions, permissions justifications, and technical specifications** required to manually submit or update the Lorapok Connector extension on **Mozilla Add-ons (AMO)**, **Chrome Web Store**, and **Microsoft Edge Add-ons**.

---

## 🦊 1. Mozilla Add-ons (AMO) Submission Details

### Basic Metadata
- **Add-on Name**: `Lorapok Connector - Media Stream Sniffer & Player`
- **Add-on URL Slug**: `lorapok-connector`
- **Gecko ID**: `lorapok-connector@media.lorapok.tech`
- **Supported Application**: Firefox Desktop (`109.0` to `*`), Firefox for Android
- **Category**: `Photos, Music & Videos` / `Feeds, News & Blogging`
- **Version**: `1.5.0`
- **License**: `MIT License`
- **Support Email**: `lorapokdev@gmail.com`
- **Support Website**: `https://media.lorapok.tech`

### Summary (Short Description — Max 250 characters)
```
Seamlessly sniff and stream video & audio from any webpage directly into Lorapok Media Player desktop or high-performance Web Player.
```

### Full Description (Markdown supported on AMO)
```markdown
# ⚡ Lorapok Connector: High-Performance Media Stream Sniffer

**Lorapok Connector** bridges your web browser directly to the **Lorapok Media Player** ecosystem (Desktop, Android, and Web). Detect any active video/audio stream on any webpage with 1-click and stream with hardware acceleration, sensory cyber UI, and lossless playback.

### 🌟 Key Features:
- 🎬 **Instant Stream Sniffing**: Automatically discovers HLS (`.m3u8`), MPEG-DASH (`.mpd`), MP4, WebM, FLAC, and AAC media URLs embedded on pages.
- 🚀 **1-Click Native Desktop Launch**: Handoff any live media stream directly to the desktop Lorapok Media Player via `lorapok://` deep link protocol.
- 🌐 **Web Player Integration**: Stream instantly via our online sandbox player at `https://media.lorapok.tech`.
- 🖱️ **Context Menu Action**: Right-click any video, audio tag, or media link and select *"Open in Lorapok"* for immediate playback.
- 📋 **1-Click Copy Stream URL**: Cleanly copy direct stream manifests with auth query strings preserved.
- 🔒 **Zero Telemetry / 100% Private**: Runs entirely client-side without tracking, cookies, or remote server analytics.

### 📥 Desktop & Mobile App:
Download the native Lorapok Media Player for Linux, Windows, macOS, and Android at:
https://media.lorapok.tech
```

### Permissions Justification (For AMO Reviewers)
| Permission | Technical Justification for Reviewer |
| :--- | :--- |
| `contextMenus` | Creates a context menu item ("Open in Lorapok") when right-clicking video, audio, or media links to allow users to send the link to Lorapok Player. |
| `activeTab` | Scans the DOM of the active tab ONLY when the user clicks the extension icon, discovering `<video>`, `<audio>`, and `<source>` elements. |
| `scripting` | Executes a lightweight client-side DOM query on the user's explicit request to extract media streams from the active tab. |

### Source Code Submission (AMO)
- **Do you use a bundler or minifier?**: `No` (Pure standard ES6 JavaScript and HTML/CSS).
- **Archive to Upload**: `lorapok-extension/release/builds/extensions/lorapok-extension-firefox-1.5.0.xpi` (or `.zip`).

---

## 🌐 2. Chrome Web Store & Edge Add-ons Details

### Store Listing
- **Item Name**: `Lorapok Connector - Media Stream Sniffer & Player`
- **Short Description**: `Sniff and stream videos, HLS, DASH, and audio directly to Lorapok Media Player and Web Player.`
- **Primary Category**: `Productivity` / `Accessibility` / `Multimedia`
- **Visibility**: `Public`
- **Package Archive**: `lorapok-extension-chrome-1.5.0.zip`

### Privacy Policy Declaration
- **Single Purpose**: To allow users to detect video/audio streams on web pages and forward them to the local or web-based Lorapok Media Player.
- **Data Collection**: No personal data, browsing history, user credentials, or keystrokes are collected, stored, or transmitted.
- **Privacy Policy URL**: `https://media.lorapok.tech` (or `https://lorapok.tech/privacy`)

---

## 🚀 3. Step-by-Step Submission Instructions

### For Mozilla AMO:
1. Navigate to: [https://addons.mozilla.org/developers/addon/submit/upload-listed](https://addons.mozilla.org/developers/addon/submit/upload-listed)
2. Sign in with your Mozilla developer account.
3. Upload `lorapok-extension/release/builds/extensions/lorapok-extension-firefox-1.5.0.xpi`.
4. Paste the **Gecko ID**, **Summary**, and **Full Description** from above.
5. Provide the **Permissions Justification** text.
6. Submit for automated validation and review!

### For Chrome Web Store:
1. Navigate to: [https://chrome.google.com/webstore/devconsole/](https://chrome.google.com/webstore/devconsole/)
2. Click **New Item** and upload `lorapok-extension/release/builds/extensions/lorapok-extension-chrome-1.5.0.zip`.
3. Fill in the listing details, 128x128 icon, and store description.
4. Submit for review.
