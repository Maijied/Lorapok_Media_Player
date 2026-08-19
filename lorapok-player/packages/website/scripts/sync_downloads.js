#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../../'); // /mnt/NewVolume/Personal_Projects/lorapok_player
const artifactsDir = path.resolve(rootDir, 'artifacts');
const downloadsDir = path.resolve(__dirname, '../public/downloads');

fs.mkdirSync(downloadsDir, { recursive: true });

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Find files in artifacts directory
function findFile(dir, extensions, pattern = '') {
    if (!fs.existsSync(dir)) return null;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            const found = findFile(fullPath, extensions, pattern);
            if (found) return found;
        } else {
            const ext = path.extname(file).toLowerCase();
            if (extensions.includes(ext) && file.includes(pattern)) {
                return fullPath;
            }
        }
    }
    return null;
}

const copyMap = [
    { type: 'android-universal', exts: ['.apk'], pattern: 'universal', dest: 'app-universal-release.apk' },
    { type: 'android-arm64', exts: ['.apk'], pattern: 'arm64', dest: 'app-arm64-v8a-release.apk' },
    { type: 'android-armv7', exts: ['.apk'], pattern: 'armeabi-v7a', dest: 'app-armeabi-v7a-release.apk' },
    { type: 'android-x86_64', exts: ['.apk'], pattern: 'x86_64', dest: 'app-x86_64-release.apk' },
    { type: 'android-aab', exts: ['.aab'], pattern: '', dest: 'app-release.aab' },
    { type: 'linux-appimage', exts: ['.AppImage'], pattern: '', dest: 'LorapokMediaPlayer-Linux.AppImage' },
    { type: 'linux-deb', exts: ['.deb'], pattern: '', dest: 'LorapokMediaPlayer-Linux.deb' },
    { type: 'linux-snap', exts: ['.snap'], pattern: '', dest: 'LorapokMediaPlayer-Linux.snap' },
    { type: 'windows-exe', exts: ['.exe'], pattern: 'Setup', dest: 'LorapokMediaPlayer-Windows-Setup.exe' },
    { type: 'windows-portable', exts: ['.exe'], pattern: '', excludePattern: 'Setup', dest: 'LorapokMediaPlayer.exe' },
    { type: 'macos-dmg', exts: ['.dmg'], pattern: '', dest: 'LorapokMediaPlayer-Mac-Installer.dmg' },
    { type: 'macos-zip', exts: ['.zip'], pattern: 'mac', dest: 'LorapokMediaPlayer-Mac-Installer.zip' },
    { type: 'ext-firefox-xpi', exts: ['.xpi'], pattern: 'firefox', dest: 'lorapok-extension-firefox-2.0.0.xpi' },
    { type: 'ext-firefox-zip', exts: ['.zip'], pattern: 'firefox', dest: 'lorapok-extension-firefox-2.0.0.zip' },
    { type: 'ext-chrome-zip', exts: ['.zip'], pattern: 'chrome', dest: 'lorapok-extension-chrome-2.0.0.zip' },
    { type: 'ext-edge-zip', exts: ['.zip'], pattern: 'edge', dest: 'lorapok-extension-edge-2.0.0.zip' },
    { type: 'ext-vscode-vsix', exts: ['.vsix'], pattern: '', dest: 'lorapok-player-vscode-2.0.0.vsix' },
    { type: 'python-whl', exts: ['.whl'], pattern: '', dest: 'lorapok-2.0.0-py3-none-any.whl' },
    { type: 'python-sdist', exts: ['.gz'], pattern: 'tar.gz', dest: 'lorapok-2.0.0.tar.gz' }
];

const copiedAssets = {};

for (const item of copyMap) {
    let srcPath = findFile(artifactsDir, item.exts, item.pattern);
    if (srcPath && item.excludePattern && srcPath.includes(item.excludePattern)) {
        srcPath = null;
        // Need a more specific search if we want to exclude Setup from portable
        // But let's keep it simple for now, we'll try to rely on exact file if needed
        // Re-searching manually
        const searchWithoutExclude = (dir) => {
             if (!fs.existsSync(dir)) return null;
             const files = fs.readdirSync(dir);
             for (const file of files) {
                 const fullPath = path.join(dir, file);
                 const stat = fs.statSync(fullPath);
                 if (stat.isDirectory()) {
                     const found = searchWithoutExclude(fullPath);
                     if (found) return found;
                 } else {
                     const ext = path.extname(file).toLowerCase();
                     if (item.exts.includes(ext) && file.includes(item.pattern) && !file.includes(item.excludePattern)) {
                         return fullPath;
                     }
                 }
             }
             return null;
        };
        srcPath = searchWithoutExclude(artifactsDir);
    }
    
    // If not found in artifacts, maybe they are already in lorapok-extension or other local folders (like during local dev)?
    if (!srcPath && item.dest.includes('lorapok-extension')) {
        srcPath = findFile(path.resolve(rootDir, 'lorapok-player/release/builds/extensions'), item.exts, item.pattern);
    }
    
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
        console.log(`✅ Synced ${item.dest} (${formatBytes(stats.size)})`);
    } else {
        console.log(`⚠️ Missing build source for: ${item.type} (pattern: ${item.pattern}${item.exts.join(',')})`);
    }
}

const manifest = {
    version: "2.0.0",
    releaseName: "Lorapok 2.0.0 Neural Release",
    updatedAt: new Date().toISOString(),
    platforms: {
        windows: {
            default: copiedAssets['windows-exe']?.url || "/downloads/LorapokMediaPlayer-Windows-Setup.exe",
            size: copiedAssets['windows-exe']?.size || "78 MB",
            installer: {
                url: copiedAssets['windows-exe']?.url || "/downloads/LorapokMediaPlayer-Windows-Setup.exe",
                size: copiedAssets['windows-exe']?.size || "78 MB",
                label: "Windows Installer (.exe)",
                badge: "INSTALLABLE",
                desc: "Complete installer for Windows 10 & 11 (64-bit)"
            },
            portable: {
                url: copiedAssets['windows-portable']?.url || "/downloads/LorapokMediaPlayer.exe",
                size: copiedAssets['windows-portable']?.size || "68 MB",
                label: "Windows Standalone (.exe)",
                badge: "PORTABLE",
                desc: "Zero-install standalone binary for USB / portable drives"
            }
        },
        linux: {
            default: copiedAssets['linux-appimage']?.url || "/downloads/LorapokMediaPlayer-Linux.AppImage",
            size: copiedAssets['linux-appimage']?.size || "108 MB",
            portable: {
                url: copiedAssets['linux-appimage']?.url || "/downloads/LorapokMediaPlayer-Linux.AppImage",
                size: copiedAssets['linux-appimage']?.size || "108 MB",
                label: "Linux AppImage",
                badge: "PORTABLE",
                desc: "Self-contained universal executable for all Linux distributions"
            },
            deb: {
                url: copiedAssets['linux-deb']?.url || "/downloads/LorapokMediaPlayer-Linux.deb",
                size: copiedAssets['linux-deb']?.size || "70 MB",
                label: "Debian / Ubuntu (.deb)",
                badge: "INSTALLABLE",
                desc: "Native APT package installer with desktop integration"
            },
            snap: {
                url: `https://snapcraft.io/lorapokmediaplayer`,
                size: copiedAssets['linux-snap']?.size || "93 MB",
                label: "Snap Store (Universal Linux)",
                badge: "SNAP STORE",
                desc: "Install directly via snap install lorapokmediaplayer"
            }
        },
        macos: {
            default: copiedAssets['macos-dmg']?.url || "/downloads/LorapokMediaPlayer-Mac-Installer.dmg",
            size: copiedAssets['macos-dmg']?.size || "96 MB",
            dmgArm: {
                url: copiedAssets['macos-dmg']?.url || "/downloads/LorapokMediaPlayer-Mac-Installer.dmg",
                size: copiedAssets['macos-dmg']?.size || "96 MB",
                label: "macOS Apple Silicon (.dmg)",
                badge: "INSTALLABLE",
                desc: "Optimized for Apple M1, M2, M3, M4 Macs"
            },
            dmgIntel: {
                url: copiedAssets['macos-dmg']?.url || "/downloads/LorapokMediaPlayer-Mac-Installer.dmg",
                size: copiedAssets['macos-dmg']?.size || "96 MB",
                label: "macOS Intel (.dmg)",
                badge: "INSTALLABLE",
                desc: "For Intel-based Mac systems"
            },
            zipPortable: {
                url: copiedAssets['macos-zip']?.url || "/downloads/LorapokMediaPlayer-Mac-Installer.zip",
                size: copiedAssets['macos-zip']?.size || "97 MB",
                label: "macOS Portable (.zip)",
                badge: "PORTABLE",
                desc: "Direct drag-and-drop portable application archive"
            }
        },
        android: {
            default: copiedAssets['android-universal']?.url || "/downloads/app-universal-release.apk",
            size: copiedAssets['android-universal']?.size || "2.8 MB",
            universal: {
                url: copiedAssets['android-universal']?.url || "/downloads/app-universal-release.apk",
                size: copiedAssets['android-universal']?.size || "2.8 MB",
                label: "Universal APK",
                badge: "INSTALLABLE",
                desc: "Compatible with all Android phones, tablets & TV"
            },
            arm64: {
                url: copiedAssets['android-arm64']?.url || "/downloads/app-arm64-v8a-release.apk",
                size: copiedAssets['android-arm64']?.size || "2.8 MB",
                label: "ARM64-v8a APK",
                badge: "INSTALLABLE",
                desc: "Native 64-bit performance for modern Android flagships"
            },
            armv7: {
                url: copiedAssets['android-armv7']?.url || "/downloads/app-armeabi-v7a-release.apk",
                size: copiedAssets['android-armv7']?.size || "2.8 MB",
                label: "ARMv7 APK",
                badge: "INSTALLABLE",
                desc: "For legacy Android devices & TV sticks"
            },
            x86_64: {
                url: copiedAssets['android-x86_64']?.url || "/downloads/app-x86_64-release.apk",
                size: copiedAssets['android-x86_64']?.size || "2.8 MB",
                label: "x86_64 APK",
                badge: "INSTALLABLE",
                desc: "For Android emulators and ChromeOS"
            },
            aab: {
                url: copiedAssets['android-aab']?.url || "/downloads/app-release.aab",
                size: copiedAssets['android-aab']?.size || "3.3 MB",
                label: "Google Play Bundle (.aab)",
                badge: "STORE BUNDLE",
                desc: "Signed Android App Bundle for Store deployment"
            }
        },
        extensions: {
            firefoxXpi: {
                url: copiedAssets['ext-firefox-xpi']?.url || "/downloads/lorapok-extension-firefox-2.0.0.xpi",
                size: copiedAssets['ext-firefox-xpi']?.size || "428 KB",
                label: "Firefox Add-on (.xpi)",
                badge: "AMO READY",
                desc: "Mozilla Firefox Add-ons (AMO) installable package"
            },
            firefoxZip: {
                url: copiedAssets['ext-firefox-zip']?.url || "/downloads/lorapok-extension-firefox-2.0.0.zip",
                size: copiedAssets['ext-firefox-zip']?.size || "428 KB",
                label: "Firefox Source (.zip)",
                badge: "AMO ARCHIVE",
                desc: "Firefox Developer Edition / AMO submission archive"
            },
            chromeZip: {
                url: copiedAssets['ext-chrome-zip']?.url || "/downloads/lorapok-extension-chrome-2.0.0.zip",
                size: copiedAssets['ext-chrome-zip']?.size || "428 KB",
                label: "Google Chrome (.zip)",
                badge: "CHROME MV3",
                desc: "Chrome Web Store / Chromium unpacked extension"
            },
            edgeZip: {
                url: copiedAssets['ext-edge-zip']?.url || "/downloads/lorapok-extension-edge-2.0.0.zip",
                size: copiedAssets['ext-edge-zip']?.size || "428 KB",
                label: "Microsoft Edge (.zip)",
                badge: "EDGE ADD-ONS",
                desc: "Microsoft Edge Add-ons Store package"
            },
            vscodeVsix: {
                url: copiedAssets['ext-vscode-vsix']?.url || "/downloads/lorapok-player-vscode-2.0.0.vsix",
                size: copiedAssets['ext-vscode-vsix']?.size || "21 KB",
                label: "VS Code Extension (.vsix)",
                badge: "IDE EXTENSION",
                desc: "Visual Studio Code Media Player & Stream Previewer"
            }
        },
        packages: {
            pythonWhl: {
                url: copiedAssets['python-whl']?.url || "/downloads/lorapok-2.0.0-py3-none-any.whl",
                size: copiedAssets['python-whl']?.size || "4.5 KB",
                label: "Python Wheel (.whl)",
                badge: "PIP",
                desc: "Install via pip install lorapok"
            },
            pythonSdist: {
                url: copiedAssets['python-sdist']?.url || "/downloads/lorapok-2.0.0.tar.gz",
                size: copiedAssets['python-sdist']?.size || "4.2 KB",
                label: "Python Source (.tar.gz)",
                badge: "SDIST",
                desc: "Python Source Distribution"
            }
        }
    }
};

fs.writeFileSync(path.join(downloadsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✅ Generated public/downloads/manifest.json with direct binary copies.');
