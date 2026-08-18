#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../');
const downloadsDir = path.resolve(__dirname, '../public/downloads');

fs.mkdirSync(downloadsDir, { recursive: true });

const GITHUB_RELEASE_BASE = "https://github.com/Maijied/Lorapok_Media_Player/releases/download/v1.5.0";

const manifest = {
    version: "1.5.0",
    releaseName: "Lorapok 1.5.0 Neural Release",
    updatedAt: new Date().toISOString(),
    platforms: {
        windows: {
            default: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Windows-Setup.exe`,
            size: "78 MB",
            installer: {
                url: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Windows-Setup.exe`,
                size: "78 MB",
                label: "Windows Installer (.exe)",
                badge: "INSTALLABLE",
                desc: "Complete installer for Windows 10 & 11 (64-bit)"
            },
            portable: {
                url: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer.exe`,
                size: "68 MB",
                label: "Windows Standalone (.exe)",
                badge: "PORTABLE",
                desc: "Zero-install standalone binary for USB / portable drives"
            }
        },
        linux: {
            default: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Linux.AppImage`,
            size: "108 MB",
            portable: {
                url: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Linux.AppImage`,
                size: "108 MB",
                label: "Linux AppImage",
                badge: "PORTABLE",
                desc: "Self-contained universal executable for all Linux distributions"
            },
            deb: {
                url: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Linux.deb`,
                size: "70 MB",
                label: "Debian / Ubuntu (.deb)",
                badge: "INSTALLABLE",
                desc: "Native APT package installer with desktop integration"
            },
            snap: {
                url: `https://snapcraft.io/lorapokmediaplayer`,
                size: "93 MB",
                label: "Snap Store (Universal Linux)",
                badge: "SNAP STORE",
                desc: "Install directly via snap install lorapokmediaplayer"
            }
        },
        macos: {
            default: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Mac-Installer.dmg`,
            size: "96 MB",
            dmgArm: {
                url: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Mac-Installer.dmg`,
                size: "96 MB",
                label: "macOS Apple Silicon (.dmg)",
                badge: "INSTALLABLE",
                desc: "Optimized for Apple M1, M2, M3, M4 Macs"
            },
            dmgIntel: {
                url: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Mac-Installer.dmg`,
                size: "96 MB",
                label: "macOS Intel (.dmg)",
                badge: "INSTALLABLE",
                desc: "For Intel-based Mac systems"
            },
            zipPortable: {
                url: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Mac-Installer.zip`,
                size: "97 MB",
                label: "macOS Portable (.zip)",
                badge: "PORTABLE",
                desc: "Direct drag-and-drop portable application archive"
            }
        },
        android: {
            default: `${GITHUB_RELEASE_BASE}/app-universal-release.apk`,
            size: "2.8 MB",
            universal: {
                url: `${GITHUB_RELEASE_BASE}/app-universal-release.apk`,
                size: "2.8 MB",
                label: "Universal APK",
                badge: "INSTALLABLE",
                desc: "Compatible with all Android phones, tablets & TV"
            },
            arm64: {
                url: `${GITHUB_RELEASE_BASE}/app-arm64-v8a-release.apk`,
                size: "2.8 MB",
                label: "ARM64-v8a APK",
                badge: "INSTALLABLE",
                desc: "Native 64-bit performance for modern Android flagships"
            },
            armv7: {
                url: `${GITHUB_RELEASE_BASE}/app-armeabi-v7a-release.apk`,
                size: "2.8 MB",
                label: "ARMv7 APK",
                badge: "INSTALLABLE",
                desc: "For legacy Android devices & TV sticks"
            },
            x86_64: {
                url: `${GITHUB_RELEASE_BASE}/app-x86_64-release.apk`,
                size: "2.8 MB",
                label: "x86_64 APK",
                badge: "INSTALLABLE",
                desc: "For Android emulators and ChromeOS"
            },
            aab: {
                url: `${GITHUB_RELEASE_BASE}/app-release.aab`,
                size: "3.3 MB",
                label: "Google Play Bundle (.aab)",
                badge: "STORE BUNDLE",
                desc: "Signed Android App Bundle for Store deployment"
            }
        },
        extensions: {
            firefoxXpi: {
                url: `${GITHUB_RELEASE_BASE}/lorapok-extension-firefox-1.5.0.xpi`,
                size: "428 KB",
                label: "Firefox Add-on (.xpi)",
                badge: "AMO READY",
                desc: "Mozilla Firefox Add-ons (AMO) installable package"
            },
            firefoxZip: {
                url: `${GITHUB_RELEASE_BASE}/lorapok-extension-firefox-1.5.0.zip`,
                size: "428 KB",
                label: "Firefox Source (.zip)",
                badge: "AMO ARCHIVE",
                desc: "Firefox Developer Edition / AMO submission archive"
            },
            chromeZip: {
                url: `${GITHUB_RELEASE_BASE}/lorapok-extension-chrome-1.5.0.zip`,
                size: "428 KB",
                label: "Google Chrome (.zip)",
                badge: "CHROME MV3",
                desc: "Chrome Web Store / Chromium unpacked extension"
            },
            edgeZip: {
                url: `${GITHUB_RELEASE_BASE}/lorapok-extension-edge-1.5.0.zip`,
                size: "428 KB",
                label: "Microsoft Edge (.zip)",
                badge: "EDGE ADD-ONS",
                desc: "Microsoft Edge Add-ons Store package"
            },
            vscodeVsix: {
                url: `${GITHUB_RELEASE_BASE}/lorapok-player-vscode-1.5.0.vsix`,
                size: "21 KB",
                label: "VS Code Extension (.vsix)",
                badge: "IDE EXTENSION",
                desc: "Visual Studio Code Media Player & Stream Previewer"
            }
        },
        packages: {
            pythonWhl: {
                url: `${GITHUB_RELEASE_BASE}/lorapok-1.5.0-py3-none-any.whl`,
                size: "4.5 KB",
                label: "Python Wheel (.whl)",
                badge: "PIP",
                desc: "Install via pip install lorapok"
            },
            pythonSdist: {
                url: `${GITHUB_RELEASE_BASE}/lorapok-1.5.0.tar.gz`,
                size: "4.2 KB",
                label: "Python Source (.tar.gz)",
                badge: "SDIST",
                desc: "Python Source Distribution"
            }
        }
    }
};

fs.writeFileSync(path.join(downloadsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✅ Generated public/downloads/manifest.json with permanent GitHub CDN links');
