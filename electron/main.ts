import { app, BrowserWindow, ipcMain, dialog, protocol, screen } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Polyfill for legacy packages that expect global __dirname or require
Object.assign(globalThis, { __dirname, require })

let ffmpeg: any;
const debugLogPath = path.join(process.cwd(), 'debug.log');

function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(debugLogPath, `[${timestamp}] ${message}\n`);
}

process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// Register Custom Media Protocol Schemes
protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { bypassCSP: true, secure: true, supportFetchAPI: true, stream: true } }
])

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      const url = commandLine.pop()
      if (url?.startsWith('lorapok://')) {
        win.webContents.send('open-protocol-url', url)
      }
    }
  })
}

// GPU Configuration Strategy
const args = process.argv;
const isSafeMode = args.includes('--safe-mode');
const isDebug = args.includes('--debug');
let gpuCrashCount = 0;
const MAX_GPU_CRASHES = 2;

function applyGpuSettings() {
  if (process.platform === 'linux') {
    app.commandLine.appendSwitch('disable-gpu-sandbox');
    app.commandLine.appendSwitch('disable-dev-shm-usage');
    app.commandLine.appendSwitch('ignore-gpu-blocklist');
    app.commandLine.appendSwitch('no-sandbox');
  }

  // Enable additional media features
  app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,Vulkan,PlatformHEVCDecoderSupport');
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

  if (isSafeMode || gpuCrashCount >= MAX_GPU_CRASHES) {
    logToFile('⚠️ Forcing Software Rendering (Safe Mode)');
    app.disableHardwareAcceleration();
  }
}

applyGpuSettings();

app.on('child-process-gone', (_event, details) => {
  logToFile(`🚨 Process Gone: ${details.type} (${details.reason})`);
  if (details.type === 'GPU') {
    gpuCrashCount++;
    if (gpuCrashCount >= MAX_GPU_CRASHES) {
      logToFile('🛑 Critical GPU failure. Relaunching in Safe Mode...');
      app.relaunch({ args: process.argv.slice(1).concat(['--safe-mode']) });
      app.exit();
    } else if (win && !win.isDestroyed()) {
      win.reload();
    }
  }
});

let win: BrowserWindow | null

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.mjs');
  logToFile('Creating Window...');

  win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#050510',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      webSecurity: false,
      contextIsolation: true,
    },
  })

  win.once('ready-to-show', () => {
    logToFile('Window Ready to Show');
    setTimeout(() => {
      if (win && !win.isDestroyed()) {
        win.show();
        if (isDebug) win.webContents.openDevTools();
      }
    }, 100);
  });

  win.webContents.on('did-fail-load', (_e, code, desc) => {
    logToFile(`❌ Renderer Failed to Load: ${code} - ${desc}`);
  });

  win.webContents.on('did-finish-load', () => {
    logToFile('Renderer Finished Load');
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

ipcMain.handle('renderer-ready', () => {
  logToFile('Renderer reported READY');

  // 1. Check for protocol URL
  const protocolUrl = process.argv.find(arg => arg.startsWith('lorapok://'))
  if (protocolUrl && win) {
    win.webContents.send('open-protocol-url', protocolUrl)
    return;
  }

  // 2. Check for file path
  const possibleFile = process.argv.slice(1).find(arg => {
    const ext = path.extname(arg).toLowerCase();
    const mediaExtensions = [
      '.mp4', '.webm', '.ogg', '.mp3', '.mkv', '.avi', '.mov', '.flv',
      '.wmv', '.m4v', '.mpg', '.mpeg', '.m2ts', '.mts', '.ts', '.3gp', '.3g2',
      '.vob', '.mxf', '.rm', '.rmvb', '.asf', '.divx', '.ogm', '.ogv',
      '.wav', '.aac', '.flac', '.m4a', '.opus', '.wma', '.ape', '.wv', '.mka'
    ];
    return mediaExtensions.includes(ext);
  });

  if (possibleFile && win) {
    const absolutePath = path.isAbsolute(possibleFile) ? possibleFile : path.join(process.cwd(), possibleFile);
    win.webContents.send('open-protocol-url', `lorapok://${absolutePath}`);
  }
})

ipcMain.handle('log-to-file', (_event, message) => {
  logToFile(`[RENDERER] ${message}`);
})

ipcMain.handle('open-file', async () => {
  if (!win) return null
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [
      { name: 'Movies & TV', extensions: ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg', 'm2ts', 'mts', 'ts', '3gp', '3g2', 'vob', 'mxf', 'rm', 'rmvb', 'asf', 'divx', 'ogm', 'ogv'] },
      { name: 'Audio', extensions: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'opus', 'wma', 'ape', 'wv', 'mka', 'm4p', 'alac', 'oga'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return canceled ? null : filePaths[0]
})

ipcMain.handle('get-gpu-status', async () => app.getGPUFeatureStatus())

ipcMain.handle('set-window-size', async (_event, { width, height }) => {
  if (win && !win.isDestroyed() && !win.isFullScreen()) {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

    // Don't resize if already maximized or in fullscreen (redundant check)
    if (win.isMaximized()) return

    // Calculate sane bounds (max 80% of screen)
    const maxWidth = Math.floor(screenWidth * 0.9)
    const maxHeight = Math.floor(screenHeight * 0.9)

    let finalWidth = Math.min(width + 40, maxWidth) // Add padding for UI
    let finalHeight = Math.min(height + 120, maxHeight) // Add padding for header/footer

    // Maintain aspect ratio if we hit max bounds
    const videoRatio = width / height
    if (finalWidth === maxWidth) {
      finalHeight = Math.floor(finalWidth / videoRatio) + 120
    } else if (finalHeight === maxHeight) {
      finalWidth = Math.floor((finalHeight - 120) * videoRatio) + 40
    }

    win.setSize(finalWidth, finalHeight, true)
    win.center()
  }
})

// Window Control Handlers
ipcMain.handle('window-minimize', () => {
  if (win && !win.isDestroyed()) win.minimize()
})

ipcMain.handle('window-maximize', () => {
  if (win && !win.isDestroyed()) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})

ipcMain.handle('window-close', () => {
  if (win && !win.isDestroyed()) win.close()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('open-url', (event, url) => {
  event.preventDefault()
  if (url.startsWith('lorapok://') && win) {
    win.webContents.send('open-protocol-url', url)
  }
})

app.whenReady().then(async () => {
  logToFile('--- LORAPOK STARTUP ---');

  // Use dynamic imports to ensure polyfills are applied before dependency evaluation
  try {
    ffmpeg = (await import('fluent-ffmpeg')).default
    let ffmpegStatic = (await import('ffmpeg-static')).default

    // Fix for dev environment where __dirname points to dist-electron
    if (ffmpegStatic && !fs.existsSync(ffmpegStatic)) {
      // Check common locations based on platform
      const executable = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
      const possiblePaths = [
        path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg'), // Linux/Mac structure
        path.join(process.cwd(), 'node_modules', 'ffmpeg-static', executable), // Flat with ext
        path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'bin', process.platform, process.arch, executable), // Nested
        path.join(process.cwd(), '..', 'node_modules', 'ffmpeg-static', executable), // Parent dir check
        path.join(app.getAppPath(), '..', 'node_modules', 'ffmpeg-static', executable), // App path check
        // Add specific Windows check if platform is win32, blindly looking for ffmpeg.exe
        ...(process.platform === 'win32' ? [
          path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
          path.join(process.cwd(), 'resources', 'ffmpeg.exe') // Prod check
        ] : [])
      ]

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          ffmpegStatic = p
          break
        }
      }
    }

    if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
      ffmpeg.setFfmpegPath(ffmpegStatic)
      logToFile(`✅ FFmpeg Engine Initialized: ${ffmpegStatic}`);
    } else {
      logToFile('⚠️ FFmpeg binary not found at static path, checking system path...');
    }
  } catch (err) {
    logToFile(`❌ FFmpeg Load failed: ${err}`);
  }

  // Register Media Protocol Handler
  protocol.handle('media', async (request) => {
    const url = request.url.replace('media://', '')
    let decodedPath = decodeURIComponent(url)

    // Handle Windows drive letters (e.g., /C:/path -> C:/path)
    if (process.platform === 'win32') {
      // Remove leading slash if it precedes a drive letter (e.g. /C:)
      if (decodedPath.match(/^\/[a-zA-Z]:/)) {
        decodedPath = decodedPath.substring(1)
      }
    } else {
      // Ensure leading slash for Linux/Mac
      if (!decodedPath.startsWith('/')) {
        decodedPath = '/' + decodedPath
      }
    }

    try {
      const stats = fs.statSync(decodedPath)
      const ext = path.extname(decodedPath).toLowerCase()

      // Native Chromium support check
      const nativeSupport = ['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.aac', '.flac', '.m4a', '.opus'].includes(ext)

      if (nativeSupport) {
        const range = request.headers.get('range')
        if (!range) {
          return new Response(fs.createReadStream(decodedPath) as any, {
            status: 200,
            headers: {
              'Content-Type': 'video/mp4',
              'Content-Length': stats.size.toString(),
              'Accept-Ranges': 'bytes'
            }
          })
        }

        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1
        const chunksize = (end - start) + 1
        return new Response(fs.createReadStream(decodedPath, { start, end }) as any, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${stats.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize.toString(),
            'Content-Type': 'video/mp4'
          }
        })
      }

      // 🧠 NEURAL DECODE: FFmpeg Real-time Transcoding
      logToFile(`🧠 Universal Decode: ${ext} -> fMP4`);

      const ffstream = ffmpeg(decodedPath)
        .format('mp4')
        .videoCodec('libx264')
        .audioCodec('aac')
        .videoBitrate('2000k')
        .audioBitrate('128k')
        .outputOptions([
          '-movflags frag_keyframe+empty_moov+default_base_moof',
          '-preset veryfast',
          '-tune zerolatency'
        ])
        .on('error', (err: Error) => {
          logToFile(`FFmpeg Error: ${err.message}`)
        })
        .pipe();

      return new Response(ffstream as any, {
        status: 200,
        headers: {
          'Content-Type': 'video/mp4',
          'Transfer-Encoding': 'chunked'
        }
      });

    } catch (e) {
      logToFile(`Media Protocol Error: ${e}`)
      return new Response('File not found', { status: 404 })
    }
  })

  // Register Protocol for Windows/Linux
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('lorapok', process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient('lorapok')
  }
  createWindow()
})
