import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const debugLogPath = path.join(process.cwd(), 'debug.log');

function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(debugLogPath, `[${timestamp}] ${message}\n`);
}

logToFile('--- LORAPOK STARTUP ---');

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
      '.wmv', '.m4v', '.mpg', '.mpeg', '.m2ts', '.mts', '.ts', '.3gp',
      '.wav', '.aac', '.flac', '.m4a', '.opus', '.wma'
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
      { name: 'Movies', extensions: ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg', 'm2ts', 'mts', 'ts', '3gp'] },
      { name: 'Audio', extensions: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'opus', 'wma'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return canceled ? null : filePaths[0]
})

ipcMain.handle('get-gpu-status', async () => app.getGPUFeatureStatus())

ipcMain.handle('set-window-size', async (_event, { width, height }) => {
  if (win && !win.isDestroyed() && !win.isFullScreen()) {
    const { screen } = require('electron')
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

app.whenReady().then(() => {
  // Register Media Protocol Handler
  protocol.handle('media', (request) => {
    const url = request.url.replace('media://', '')
    let decodedPath = decodeURIComponent(url)

    if (process.platform !== 'win32' && !decodedPath.startsWith('/')) {
      decodedPath = '/' + decodedPath
    }
    if (process.platform === 'win32' && decodedPath.startsWith('/')) {
      decodedPath = decodedPath.substring(1)
    }

    try {
      const stats = fs.statSync(decodedPath)
      const range = request.headers.get('range')

      if (!range) {
        return new Response(fs.createReadStream(decodedPath) as any, {
          status: 200,
          headers: {
            'Content-Type': 'video/mp4', // browser will sniff anyway
            'Content-Length': stats.size.toString(),
            'Accept-Ranges': 'bytes'
          }
        })
      }

      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1
      const chunksize = (end - start) + 1
      const file = fs.createReadStream(decodedPath, { start, end })

      return new Response(file as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': 'video/mp4'
        }
      })
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
