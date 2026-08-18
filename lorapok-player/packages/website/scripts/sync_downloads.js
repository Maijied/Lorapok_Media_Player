#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../');
const buildsDir = path.resolve(rootDir, 'release/builds');
const downloadsDir = path.resolve(__dirname, '../public/downloads');

fs.mkdirSync(downloadsDir, { recursive: true });

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
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
    { src: 'lorapok-extension.zip', dest: 'lorapok-extension-1.5.0.zip', id: 'extension-zip' }
];

const copiedAssets = {};

for (const item of copyMap) {
    const srcPath = path.join(buildsDir, item.src);
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
    } else {
        console.log(`⚠️ Missing build source: ${item.src} (Skipping copy)`);
    }
}

const manifest = {
    version: "1.5.0",
    releaseName: "Lorapok 1.5.0 Neural Release",
    updatedAt: new Date().toISOString(),
    platforms: {
        android: {
            default: copiedAssets['android-universal']?.url || "/downloads/lorapok-player-1.5.0-universal.apk",
            size: copiedAssets['android-universal']?.size || "2.8 MB",
            universal: {
                url: copiedAssets['android-universal']?.url || "/downloads/lorapok-player-1.5.0-universal.apk",
                size: copiedAssets['android-universal']?.size || "2.8 MB",
                label: "Universal APK",
                desc: "Compatible with all Android phones, tablets & TV"
            },
            arm64: {
                url: copiedAssets['android-arm64']?.url || "/downloads/lorapok-player-1.5.0-arm64-v8a.apk",
                size: copiedAssets['android-arm64']?.size || "2.8 MB",
                label: "ARM64-v8a APK",
                desc: "Optimized for modern Android flagships"
            },
            armv7: {
                url: copiedAssets['android-armv7']?.url || "/downloads/lorapok-player-1.5.0-armeabi-v7a.apk",
                size: copiedAssets['android-armv7']?.size || "2.8 MB",
                label: "ARMv7 APK",
                desc: "For legacy Android devices & TV sticks"
            },
            x86_64: {
                url: copiedAssets['android-x86_64']?.url || "/downloads/lorapok-player-1.5.0-x86_64.apk",
                size: copiedAssets['android-x86_64']?.size || "2.8 MB",
                label: "x86_64 APK",
                desc: "For Android emulators and ChromeOS"
            },
            aab: {
                url: copiedAssets['android-aab']?.url || "/downloads/lorapok-player-1.5.0.aab",
                size: copiedAssets['android-aab']?.size || "3.3 MB",
                label: "Google Play Bundle (.aab)",
                desc: "Signed Android App Bundle for Store deployment"
            }
        },
        linux: {
            default: copiedAssets['linux-appimage']?.url || "/downloads/lorapok-player-1.5.0-x86_64.AppImage",
            size: copiedAssets['linux-appimage']?.size || "254 MB",
            appimage: {
                url: copiedAssets['linux-appimage']?.url || "/downloads/lorapok-player-1.5.0-x86_64.AppImage",
                size: copiedAssets['linux-appimage']?.size || "254 MB",
                label: "Linux AppImage",
                desc: "Portable self-contained bundle for all Linux distros"
            },
            deb: {
                url: copiedAssets['linux-deb']?.url || "/downloads/lorapok-player-1.5.0-amd64.deb",
                size: copiedAssets['linux-deb']?.size || "154 MB",
                label: "Debian / Ubuntu (.deb)",
                desc: "Native package installer"
            }
        },
        windows: {
            default: "https://github.com/Maijied/Lorapok_Media_Player/releases/latest",
            size: "120 MB",
            exe: {
                url: "https://github.com/Maijied/Lorapok_Media_Player/releases/latest",
                size: "120 MB",
                label: "Windows 64-bit Installer (.exe)",
                desc: "Windows 10 / 11 installer"
            }
        },
        macos: {
            default: "https://github.com/Maijied/Lorapok_Media_Player/releases/latest",
            size: "130 MB",
            dmg: {
                url: "https://github.com/Maijied/Lorapok_Media_Player/releases/latest",
                size: "130 MB",
                label: "macOS Universal DMG",
                desc: "Apple Silicon & Intel DMG"
            }
        },
        extension: {
            default: copiedAssets['extension-zip']?.url || "/downloads/lorapok-extension-1.5.0.zip",
            size: copiedAssets['extension-zip']?.size || "425 KB",
            zip: {
                url: copiedAssets['extension-zip']?.url || "/downloads/lorapok-extension-1.5.0.zip",
                size: copiedAssets['extension-zip']?.size || "425 KB",
                label: "Chrome / Chromium Extension",
                desc: "Manifest V3 Stream Interceptor"
            }
        }
    }
};

fs.writeFileSync(path.join(downloadsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✅ Generated public/downloads/manifest.json');
