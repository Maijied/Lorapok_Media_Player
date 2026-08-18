#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../');
const buildsDir = path.resolve(rootDir, 'lorapok-player/release/builds');
const downloadsDir = path.resolve(__dirname, '../public/downloads');

fs.mkdirSync(downloadsDir, { recursive: true });

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const copyMap = [
    { src: 'android/app-universal-release.apk', dest: 'lorapok-player-1.5.0-universal.apk', id: 'android-universal' },
    { src: 'android/app-arm64-v8a-release.apk', dest: 'lorapok-player-1.5.0-arm64-v8a.apk', id: 'android-arm64' },
    { src: 'android/app-armeabi-v7a-release.apk', dest: 'lorapok-player-1.5.0-armeabi-v7a.apk', id: 'android-armv7' },
    { src: 'android/app-x86_64-release.apk', dest: 'lorapok-player-1.5.0-x86_64.apk', id: 'android-x86_64' },
    { src: 'android/app-release.aab', dest: 'lorapok-player-1.5.0.aab', id: 'android-aab' },
    { src: 'linux/LorapokMediaPlayer-Linux.AppImage', dest: 'lorapok-player-1.5.0-x86_64.AppImage', id: 'linux-appimage' },
    { src: 'linux/LorapokMediaPlayer-Linux.deb', dest: 'lorapok-player-1.5.0-amd64.deb', id: 'linux-deb' },
    { src: 'extensions/lorapok-extension-firefox-1.5.0.xpi', dest: 'lorapok-extension-firefox-1.5.0.xpi', id: 'ext-firefox-xpi' },
    { src: 'extensions/lorapok-extension-firefox-1.5.0.zip', dest: 'lorapok-extension-firefox-1.5.0.zip', id: 'ext-firefox-zip' },
    { src: 'extensions/lorapok-extension-chrome-1.5.0.zip', dest: 'lorapok-extension-chrome-1.5.0.zip', id: 'ext-chrome-zip' },
    { src: 'extensions/lorapok-extension-edge-1.5.0.zip', dest: 'lorapok-extension-edge-1.5.0.zip', id: 'ext-edge-zip' },
    { src: 'extensions/lorapok-extension-1.5.0.zip', dest: 'lorapok-extension-1.5.0.zip', id: 'ext-universal-zip' },
    { src: 'extensions/lorapok-player-vscode-1.5.0.vsix', dest: 'lorapok-player-vscode-1.5.0.vsix', id: 'ext-vscode-vsix' }
];

// Check python dist
const pythonDist = path.resolve(rootDir, 'packages/lorapok-python/dist');
if (fs.existsSync(pythonDist)) {
    const files = fs.readdirSync(pythonDist);
    for (const f of files) {
        if (f.endsWith('.whl')) {
            copyMap.push({ srcPath: path.join(pythonDist, f), dest: f, id: 'python-whl' });
        } else if (f.endsWith('.tar.gz')) {
            copyMap.push({ srcPath: path.join(pythonDist, f), dest: f, id: 'python-sdist' });
        }
    }
}

const copiedAssets = {};

for (const item of copyMap) {
    const srcPath = item.srcPath || path.join(buildsDir, item.src);
    const destPath = path.join(downloadsDir, item.dest);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        const stats = fs.statSync(destPath);
        copiedAssets[item.id] = {
            url: `/downloads/${item.dest}`,
            filename: item.dest,
            size: formatBytes(stats.size),
            sizeBytes: stats.size
        };
        console.log(`✅ Synced ${item.dest} (${formatBytes(stats.size)})`);
    } else if (fs.existsSync(destPath)) {
        const stats = fs.statSync(destPath);
        copiedAssets[item.id] = {
            url: `/downloads/${item.dest}`,
            filename: item.dest,
            size: formatBytes(stats.size),
            sizeBytes: stats.size
        };
    }
}

const GITHUB_RELEASE_BASE = "https://github.com/Maijied/Lorapok_Media_Player/releases/download/v1.5.0";

const manifest = {
    version: "1.5.0",
    releaseName: "Lorapok 1.5.0 Neural Release",
    updatedAt: new Date().toISOString(),
    platforms: {
        windows: {
            default: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Windows-Setup-1.5.0.exe`,
            size: "78 MB",
            installer: {
                url: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Windows-Setup-1.5.0.exe`,
                size: "78 MB",
                label: "Windows Installer (.exe)",
                badge: "INSTALLABLE",
                desc: "Complete installer for Windows 10 & 11 (64-bit)"
            },
            portable: {
                url: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Windows-Setup-1.5.0.exe`,
                size: "78 MB",
                label: "Windows Standalone (.exe)",
                badge: "PORTABLE",
                desc: "Zero-install standalone binary for USB / portable drives"
            }
        },
        linux: {
            default: copiedAssets['linux-appimage']?.url || "/downloads/lorapok-player-1.5.0-x86_64.AppImage",
            size: copiedAssets['linux-appimage']?.size || "108 MB",
            portable: {
                url: copiedAssets['linux-appimage']?.url || "/downloads/lorapok-player-1.5.0-x86_64.AppImage",
                size: copiedAssets['linux-appimage']?.size || "108 MB",
                label: "Linux AppImage",
                badge: "PORTABLE",
                desc: "Self-contained universal executable for all Linux distributions"
            },
            deb: {
                url: copiedAssets['linux-deb']?.url || "/downloads/lorapok-player-1.5.0-amd64.deb",
                size: copiedAssets['linux-deb']?.size || "70 MB",
                label: "Debian / Ubuntu (.deb)",
                badge: "INSTALLABLE",
                desc: "Native APT package installer with desktop integration"
            }
        },
        macos: {
            default: `${GITHUB_RELEASE_BASE}/Lorapok-Media-Player-1.5.0-arm64.dmg`,
            size: "96 MB",
            dmgArm: {
                url: `${GITHUB_RELEASE_BASE}/Lorapok-Media-Player-1.5.0-arm64.dmg`,
                size: "96 MB",
                label: "macOS Apple Silicon (.dmg)",
                badge: "INSTALLABLE",
                desc: "Optimized for Apple M1, M2, M3, M4 Macs"
            },
            dmgIntel: {
                url: `${GITHUB_RELEASE_BASE}/Lorapok-Media-Player-1.5.0.dmg`,
                size: "96 MB",
                label: "macOS Intel (.dmg)",
                badge: "INSTALLABLE",
                desc: "For Intel-based Mac systems"
            },
            zipPortable: {
                url: `${GITHUB_RELEASE_BASE}/Lorapok-Media-Player-1.5.0-arm64-mac.zip`,
                size: "97 MB",
                label: "macOS Portable (.zip)",
                badge: "PORTABLE",
                desc: "Direct drag-and-drop portable application archive"
            }
        },
        android: {
            default: copiedAssets['android-universal']?.url || "/downloads/lorapok-player-1.5.0-universal.apk",
            size: copiedAssets['android-universal']?.size || "2.8 MB",
            universal: {
                url: copiedAssets['android-universal']?.url || "/downloads/lorapok-player-1.5.0-universal.apk",
                size: copiedAssets['android-universal']?.size || "2.8 MB",
                label: "Universal APK",
                badge: "INSTALLABLE",
                desc: "Compatible with all Android phones, tablets & TV"
            },
            arm64: {
                url: copiedAssets['android-arm64']?.url || "/downloads/lorapok-player-1.5.0-arm64-v8a.apk",
                size: copiedAssets['android-arm64']?.size || "2.8 MB",
                label: "ARM64-v8a APK",
                badge: "INSTALLABLE",
                desc: "Native 64-bit performance for modern Android flagships"
            },
            armv7: {
                url: copiedAssets['android-armv7']?.url || "/downloads/lorapok-player-1.5.0-armeabi-v7a.apk",
                size: copiedAssets['android-armv7']?.size || "2.8 MB",
                label: "ARMv7 APK",
                badge: "INSTALLABLE",
                desc: "For legacy Android devices & TV sticks"
            },
            x86_64: {
                url: copiedAssets['android-x86_64']?.url || "/downloads/lorapok-player-1.5.0-x86_64.apk",
                size: copiedAssets['android-x86_64']?.size || "2.8 MB",
                label: "x86_64 APK",
                badge: "INSTALLABLE",
                desc: "For Android emulators and ChromeOS"
            },
            aab: {
                url: copiedAssets['android-aab']?.url || "/downloads/lorapok-player-1.5.0.aab",
                size: copiedAssets['android-aab']?.size || "3.3 MB",
                label: "Google Play Bundle (.aab)",
                badge: "STORE BUNDLE",
                desc: "Signed Android App Bundle for Store deployment"
            }
        },
        extensions: {
            firefoxXpi: {
                url: copiedAssets['ext-firefox-xpi']?.url || "/downloads/lorapok-extension-firefox-1.5.0.xpi",
                size: copiedAssets['ext-firefox-xpi']?.size || "428 KB",
                label: "Firefox Add-on (.xpi)",
                badge: "AMO READY",
                desc: "Mozilla Firefox Add-ons (AMO) installable package"
            },
            firefoxZip: {
                url: copiedAssets['ext-firefox-zip']?.url || "/downloads/lorapok-extension-firefox-1.5.0.zip",
                size: copiedAssets['ext-firefox-zip']?.size || "428 KB",
                label: "Firefox Source (.zip)",
                badge: "AMO ARCHIVE",
                desc: "Firefox Developer Edition / AMO submission archive"
            },
            chromeZip: {
                url: copiedAssets['ext-chrome-zip']?.url || "/downloads/lorapok-extension-chrome-1.5.0.zip",
                size: copiedAssets['ext-chrome-zip']?.size || "428 KB",
                label: "Google Chrome (.zip)",
                badge: "CHROME MV3",
                desc: "Chrome Web Store / Chromium unpacked extension"
            },
            edgeZip: {
                url: copiedAssets['ext-edge-zip']?.url || "/downloads/lorapok-extension-edge-1.5.0.zip",
                size: copiedAssets['ext-edge-zip']?.size || "428 KB",
                label: "Microsoft Edge (.zip)",
                badge: "EDGE ADD-ONS",
                desc: "Microsoft Edge Add-ons Store package"
            },
            vscodeVsix: {
                url: copiedAssets['ext-vscode-vsix']?.url || "/downloads/lorapok-player-vscode-1.5.0.vsix",
                size: copiedAssets['ext-vscode-vsix']?.size || "21 KB",
                label: "VS Code Extension (.vsix)",
                badge: "IDE EXTENSION",
                desc: "Visual Studio Code Media Player & Stream Previewer"
            }
        }
    }
};

fs.writeFileSync(path.join(downloadsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✅ Generated public/downloads/manifest.json');
