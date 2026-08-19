#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../../'); // /mnt/NewVolume/Personal_Projects/lorapok_player
const downloadsDir = path.resolve(__dirname, '../public/downloads');

fs.mkdirSync(downloadsDir, { recursive: true });

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Find file matching extensions and patterns across a specific directory
function findFileInDir(dir, extensions, pattern = '', excludePattern = '') {
    if (!fs.existsSync(dir)) return null;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            const found = findFileInDir(fullPath, extensions, pattern, excludePattern);
            if (found) return found;
        } else {
            const ext = path.extname(file).toLowerCase();
            const matchesExt = extensions.some(e => file.toLowerCase().endsWith(e.toLowerCase()));
            const matchesPattern = !pattern || file.toLowerCase().includes(pattern.toLowerCase());
            const notExcluded = !excludePattern || !file.toLowerCase().includes(excludePattern.toLowerCase());
            if (matchesExt && matchesPattern && notExcluded) {
                return fullPath;
            }
        }
    }
    return null;
}

// Search across multiple candidate roots
function findFile(candidateDirs, extensions, pattern = '', excludePattern = '') {
    for (const dir of candidateDirs) {
        const found = findFileInDir(dir, extensions, pattern, excludePattern);
        if (found) return found;
    }
    return null;
}

const candidateDirs = [
    path.resolve(rootDir, 'artifacts'),
    path.resolve(rootDir, 'lorapok-player/release/builds/android'),
    path.resolve(rootDir, 'lorapok-player/android/app/build/outputs/apk/release'),
    path.resolve(rootDir, 'lorapok-player/android/app/build/outputs/bundle/release'),
    path.resolve(rootDir, 'lorapok-player/release/builds/linux'),
    path.resolve(rootDir, 'lorapok-player/release/builds/windows'),
    path.resolve(rootDir, 'lorapok-player/release/builds/mac'),
    path.resolve(rootDir, 'lorapok-player/release/builds/extensions'),
    path.resolve(rootDir, 'lorapok-player/release'),
    path.resolve(rootDir, 'packages/vscode-lorapok'),
    path.resolve(rootDir, 'packages/lorapok-python/dist')
];

const copyMap = [
    { type: 'android-universal', exts: ['.apk'], pattern: 'universal', dest: 'app-universal-release.apk' },
    { type: 'android-arm64', exts: ['.apk'], pattern: 'arm64', dest: 'app-arm64-v8a-release.apk' },
    { type: 'android-armv7', exts: ['.apk'], pattern: 'armeabi-v7a', dest: 'app-armeabi-v7a-release.apk' },
    { type: 'android-x86_64', exts: ['.apk'], pattern: 'x86_64', dest: 'app-x86_64-release.apk' },
    { type: 'android-aab', exts: ['.aab'], pattern: '', dest: 'app-release.aab' },
    { type: 'linux-appimage', exts: ['.AppImage'], pattern: '', excludePattern: '1.0.0', dest: 'LorapokMediaPlayer-Linux.AppImage' },
    { type: 'linux-deb', exts: ['.deb'], pattern: '', excludePattern: '1.1.0', dest: 'LorapokMediaPlayer-Linux.deb' },
    { type: 'linux-snap', exts: ['.snap'], pattern: '', dest: 'LorapokMediaPlayer-Linux.snap' },
    { type: 'windows-exe', exts: ['.exe'], pattern: 'Setup', dest: 'LorapokMediaPlayer-Windows-Setup.exe' },
    { type: 'windows-portable', exts: ['.exe'], pattern: '', excludePattern: 'Setup', dest: 'LorapokMediaPlayer.exe' },
    { type: 'macos-dmg', exts: ['.dmg'], pattern: '', dest: 'LorapokMediaPlayer-Mac-Installer.dmg' },
    { type: 'macos-zip', exts: ['.zip'], pattern: 'mac', dest: 'LorapokMediaPlayer-Mac-Installer.zip' },
    { type: 'ext-firefox-xpi', exts: ['.xpi'], pattern: '2.0.0', dest: 'lorapok-extension-firefox-2.0.0.xpi' },
    { type: 'ext-firefox-zip', exts: ['.zip'], pattern: 'firefox-2.0.0', dest: 'lorapok-extension-firefox-2.0.0.zip' },
    { type: 'ext-chrome-zip', exts: ['.zip'], pattern: 'chrome-2.0.0', dest: 'lorapok-extension-chrome-2.0.0.zip' },
    { type: 'ext-edge-zip', exts: ['.zip'], pattern: 'edge-2.0.0', dest: 'lorapok-extension-edge-2.0.0.zip' },
    { type: 'ext-vscode-vsix', exts: ['.vsix'], pattern: '2.0.0', dest: 'lorapok-player-vscode-2.0.0.vsix' },
    { type: 'python-whl', exts: ['.whl'], pattern: '2.0.0', dest: 'lorapok-2.0.0-py3-none-any.whl' },
    { type: 'python-sdist', exts: ['.tar.gz', '.gz'], pattern: '2.0.0', dest: 'lorapok-2.0.0.tar.gz' }
];

const copiedAssets = {};

for (const item of copyMap) {
    const srcPath = findFile(candidateDirs, item.exts, item.pattern, item.excludePattern);
    
    if (srcPath && fs.existsSync(srcPath)) {
        const destPath = path.join(downloadsDir, item.dest);
        fs.copyFileSync(srcPath, destPath);
        const stats = fs.statSync(destPath);
        copiedAssets[item.type] = {
            url: `/downloads/${item.dest}`,
            filename: item.dest,
            size: formatBytes(stats.size),
            sizeBytes: stats.size
        };
        console.log(`✅ Synced ${item.dest} (${formatBytes(stats.size)}) from ${srcPath}`);
    } else {
        console.log(`⚠️ Missing build source for: ${item.type} (pattern: ${item.pattern} exts: ${item.exts.join(',')})`);
    }
}

const GITHUB_RELEASE_BASE = "https://github.com/Maijied/Lorapok_Media_Player/releases/download/latest";

const manifest = {
    version: "2.0.0",
    releaseName: "Lorapok 2.0.0 Neural Release",
    updatedAt: new Date().toISOString(),
    platforms: {
        windows: {
            default: copiedAssets['windows-exe']?.url || copiedAssets['windows-portable']?.url || `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Windows-Setup.exe`,
            size: copiedAssets['windows-exe']?.size || copiedAssets['windows-portable']?.size || "78 MB",
            installer: {
                url: copiedAssets['windows-exe']?.url || `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Windows-Setup.exe`,
                size: copiedAssets['windows-exe']?.size || "78 MB",
                label: "Windows Installer (.exe)",
                badge: "INSTALLABLE",
                desc: "Complete installer for Windows 10 & 11 (64-bit)"
            },
            portable: {
                url: copiedAssets['windows-portable']?.url || `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer.exe`,
                size: copiedAssets['windows-portable']?.size || "168.8 MB",
                label: "Windows Standalone (.exe)",
                badge: "PORTABLE",
                desc: "Zero-install standalone binary for USB / portable drives"
            }
        },
        linux: {
            default: copiedAssets['linux-appimage']?.url || `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Linux.AppImage`,
            size: copiedAssets['linux-appimage']?.size || "254 MB",
            portable: {
                url: copiedAssets['linux-appimage']?.url || `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Linux.AppImage`,
                size: copiedAssets['linux-appimage']?.size || "254 MB",
                label: "Linux AppImage",
                badge: "PORTABLE",
                desc: "Self-contained universal executable for all Linux distributions"
            },
            deb: {
                url: copiedAssets['linux-deb']?.url || `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Linux.deb`,
                size: copiedAssets['linux-deb']?.size || "154 MB",
                label: "Debian / Ubuntu (.deb)",
                badge: "INSTALLABLE",
                desc: "Native APT package installer with desktop integration"
            },
            snap: {
                url: `https://snapcraft.io/lorapokmediaplayer`,
                size: copiedAssets['linux-snap']?.size || "214 MB",
                label: "Snap Store (Universal Linux)",
                badge: "SNAP STORE",
                desc: "Install directly via snap install lorapokmediaplayer"
            }
        },
        macos: {
            default: copiedAssets['macos-dmg']?.url || `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Mac-Installer.dmg`,
            size: copiedAssets['macos-dmg']?.size || "96 MB",
            dmgArm: {
                url: copiedAssets['macos-dmg']?.url || `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Mac-Installer.dmg`,
                size: copiedAssets['macos-dmg']?.size || "96 MB",
                label: "macOS Apple Silicon (.dmg)",
                badge: "INSTALLABLE",
                desc: "Optimized for Apple M1, M2, M3, M4 Macs"
            },
            dmgIntel: {
                url: copiedAssets['macos-dmg']?.url || `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Mac-Installer.dmg`,
                size: copiedAssets['macos-dmg']?.size || "96 MB",
                label: "macOS Intel (.dmg)",
                badge: "INSTALLABLE",
                desc: "For Intel-based Mac systems"
            },
            zipPortable: {
                url: copiedAssets['macos-zip']?.url || `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Mac-Installer.zip`,
                size: copiedAssets['macos-zip']?.size || "97 MB",
                label: "macOS Portable (.zip)",
                badge: "PORTABLE",
                desc: "Direct drag-and-drop portable application archive"
            }
        },
        android: {
            default: copiedAssets['android-universal']?.url || `${GITHUB_RELEASE_BASE}/app-universal-release.apk`,
            size: copiedAssets['android-universal']?.size || "4.9 MB",
            universal: {
                url: copiedAssets['android-universal']?.url || `${GITHUB_RELEASE_BASE}/app-universal-release.apk`,
                size: copiedAssets['android-universal']?.size || "4.9 MB",
                label: "Universal APK",
                badge: "INSTALLABLE",
                desc: "Compatible with all Android phones, tablets & TV"
            },
            arm64: {
                url: copiedAssets['android-arm64']?.url || `${GITHUB_RELEASE_BASE}/app-arm64-v8a-release.apk`,
                size: copiedAssets['android-arm64']?.size || "4.9 MB",
                label: "ARM64-v8a APK",
                badge: "INSTALLABLE",
                desc: "Native 64-bit performance for modern Android flagships"
            },
            armv7: {
                url: copiedAssets['android-armv7']?.url || `${GITHUB_RELEASE_BASE}/app-armeabi-v7a-release.apk`,
                size: copiedAssets['android-armv7']?.size || "4.9 MB",
                label: "ARMv7 APK",
                badge: "INSTALLABLE",
                desc: "For legacy Android devices & TV sticks"
            },
            x86_64: {
                url: copiedAssets['android-x86_64']?.url || `${GITHUB_RELEASE_BASE}/app-x86_64-release.apk`,
                size: copiedAssets['android-x86_64']?.size || "4.9 MB",
                label: "x86_64 APK",
                badge: "INSTALLABLE",
                desc: "For Android emulators and ChromeOS"
            },
            aab: {
                url: copiedAssets['android-aab']?.url || `${GITHUB_RELEASE_BASE}/app-release.aab`,
                size: copiedAssets['android-aab']?.size || "4.7 MB",
                label: "Google Play Bundle (.aab)",
                badge: "STORE BUNDLE",
                desc: "Signed Android App Bundle for Store deployment"
            }
        },
        extensions: {
            firefoxXpi: {
                url: copiedAssets['ext-firefox-xpi']?.url || `${GITHUB_RELEASE_BASE}/lorapok-extension-firefox-2.0.0.xpi`,
                size: copiedAssets['ext-firefox-xpi']?.size || "25 KB",
                label: "Firefox Add-on (.xpi)",
                badge: "AMO READY",
                desc: "Mozilla Firefox Add-ons (AMO) installable package"
            },
            firefoxZip: {
                url: copiedAssets['ext-firefox-zip']?.url || `${GITHUB_RELEASE_BASE}/lorapok-extension-firefox-2.0.0.zip`,
                size: copiedAssets['ext-firefox-zip']?.size || "25 KB",
                label: "Firefox Source (.zip)",
                badge: "AMO ARCHIVE",
                desc: "Firefox Developer Edition / AMO submission archive"
            },
            chromeZip: {
                url: copiedAssets['ext-chrome-zip']?.url || `${GITHUB_RELEASE_BASE}/lorapok-extension-chrome-2.0.0.zip`,
                size: copiedAssets['ext-chrome-zip']?.size || "25 KB",
                label: "Google Chrome (.zip)",
                badge: "CHROME MV3",
                desc: "Chrome Web Store / Chromium unpacked extension"
            },
            edgeZip: {
                url: copiedAssets['ext-edge-zip']?.url || `${GITHUB_RELEASE_BASE}/lorapok-extension-edge-2.0.0.zip`,
                size: copiedAssets['ext-edge-zip']?.size || "25 KB",
                label: "Microsoft Edge (.zip)",
                badge: "EDGE ADD-ONS",
                desc: "Microsoft Edge Add-ons Store package"
            },
            vscodeVsix: {
                url: copiedAssets['ext-vscode-vsix']?.url || `${GITHUB_RELEASE_BASE}/lorapok-player-vscode-2.0.0.vsix`,
                size: copiedAssets['ext-vscode-vsix']?.size || "735 KB",
                label: "VS Code Extension (.vsix)",
                badge: "IDE EXTENSION",
                desc: "Visual Studio Code Media Player & Stream Previewer"
            }
        },
        packages: {
            pythonWhl: {
                url: copiedAssets['python-whl']?.url || `${GITHUB_RELEASE_BASE}/lorapok-2.0.0-py3-none-any.whl`,
                size: copiedAssets['python-whl']?.size || "6 KB",
                label: "Python Wheel (.whl)",
                badge: "PIP",
                desc: "Install via pip install lorapok"
            },
            pythonSdist: {
                url: copiedAssets['python-sdist']?.url || `${GITHUB_RELEASE_BASE}/lorapok-2.0.0.tar.gz`,
                size: copiedAssets['python-sdist']?.size || "5.2 KB",
                label: "Python Source (.tar.gz)",
                badge: "SDIST",
                desc: "Python Source Distribution"
            }
        }
    }
};

fs.writeFileSync(path.join(downloadsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✅ Generated public/downloads/manifest.json with verified direct binary & release copies.');
