import { app, BrowserWindow, ipcMain, dialog, protocol, screen, nativeImage, clipboard } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'

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

/**
 * Intelligent Path Decoder
 * Handles various protocol prefixes, mixed slashes, and platform variances.
 * - Strips media://, lorapok://, etc.
 * - Detects valid Remote URLs (http/https) even if malformed with leading slashes.
 * - Normalizes local paths for Windows/Linux.
 */
function decodeSmartPath(rawPath: string): string {
  // 1. Intelligent Network Protocol Extraction
  // This recovers the real URL even if wrapped in multiple layers like media://media//http://...
  const networkMatch = rawPath.match(/((https?|smb|ftp|sftp|ftps|rtsp|rtp|mms|rtmp):\/\/.*)$/i);
  if (networkMatch) {
    let url = networkMatch[1];
    // Strip internal player state parameters that shouldn't be passed to the remote server
    url = url.replace(/([?&])(transcode|audioStream|subStream|t)=[^&]*&?/g, '$1').replace(/[?&]$/, '');
    return url;
  }

  // 2. Local File Processing
  // Strip Wrapper Protocols (media://, lorapok://, app://)
  let clean = rawPath.replace(/^(media|lorapok|app):\/\//, '');

  // Strip File Protocol if present
  clean = clean.replace(/^file:\/\//, '');

  // Strip query parameters
  clean = clean.split('?')[0];

  // Decode URI components
  clean = decodeURIComponent(clean);

  // 3. Platform specific normalization
  if (process.platform === 'win32') {
    // Handle /C:/path -> C:/path
    if (clean.match(/^\/[a-zA-Z]:/)) {
      clean = clean.substring(1);
    }
    return path.normalize(clean);
  } else {
    // Linux/Mac: Ensure absolute path for local files
    if (!clean.startsWith('/') && !clean.includes('://')) {
      clean = '/' + clean;
    }
    return clean;
  }
}

process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// Register Custom Media Protocol Schemes
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
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
      allowRunningInsecureContent: true,
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

  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    logToFile(`[RENDERER CONSOLE] L:${level} ${message} (${sourceId}:${line})`)
  })

  win.webContents.on('did-finish-load', () => {
    logToFile('Renderer Finished Load');
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadURL('app://lorapok/index.html')
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

ipcMain.handle('save-screenshot', async (_event, { buffer, filename }) => {
  const picturesPath = app.getPath('pictures')
  const lorapokPath = path.join(picturesPath, 'Lorapok')
  if (!fs.existsSync(lorapokPath)) fs.mkdirSync(lorapokPath, { recursive: true })

  const filePath = path.join(lorapokPath, filename)
  fs.writeFileSync(filePath, buffer)
  return filePath
})

ipcMain.handle('export-segment', async (_event, { filePath, start, end, filename }) => {
  const picturesPath = app.getPath('pictures')
  const lorapokPath = path.join(picturesPath, 'Lorapok')
  if (!fs.existsSync(lorapokPath)) fs.mkdirSync(lorapokPath, { recursive: true })

  const savePath = path.join(lorapokPath, filename)

  // Convert lorapok:// path to real path if necessary
  // Convert lorapok:// path to real path using smart decoder
  const realPath = decodeSmartPath(filePath);

  return new Promise((resolve, reject) => {
    if (!ffmpeg) {
      reject(new Error('FFmpeg not initialized'))
      return
    }

    ffmpeg(realPath)
      .setStartTime(start)
      .setDuration(end - start)
      .output(savePath)
      .videoCodec('copy')
      .audioCodec('copy')
      .on('end', () => resolve(savePath))
      .on('error', (err: any) => {
        logToFile(`[Export] Error: ${err.message}`)
        reject(err)
      })
      .run()
  })
})

ipcMain.handle('copy-to-clipboard', async (_event, buffer) => {
  const image = nativeImage.createFromBuffer(buffer)
  clipboard.writeImage(image)
  return true
})

const watchers = new Map<string, fs.FSWatcher>()

ipcMain.handle('add-watch-folder', (_event, folderPath) => {
  try {
    if (watchers.has(folderPath)) return true

    // Check if path exists and is a directory
    if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
      return false
    }

    const watcher = fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('media-update', { folderPath, eventType, filename })
      }
    })

    watchers.set(folderPath, watcher)
    logToFile(`[Hive] Scanning Hive: ${folderPath}`)
    return true
  } catch (err: any) {
    logToFile(`[Hive] Error watching ${folderPath}: ${err.message}`)
    return false
  }
})

ipcMain.handle('remove-watch-folder', (_event, folderPath) => {
  const watcher = watchers.get(folderPath)
  if (watcher) {
    watcher.close()
    watchers.delete(folderPath)
    logToFile(`[Hive] Removed watcher: ${folderPath}`)
    return true
  }
  return false
})

let localServer: http.Server | null = null

ipcMain.handle('start-local-server', async (_event, filePath) => {
  if (localServer) {
    localServer.close()
  }

  // Convert media:// path to real path
  let realPath = filePath.replace('media://', '')
  if (process.platform === 'win32' && realPath.startsWith('/')) {
    realPath = realPath.substring(1)
  }
  realPath = decodeURIComponent(realPath)

  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(realPath)) {
        reject(new Error('File not found'))
        return
      }

      localServer = http.createServer((req, res) => {
        const stats = fs.statSync(realPath)
        const range = req.headers.range

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-")
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1
          const chunksize = (end - start) + 1
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stats.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'
          })
          fs.createReadStream(realPath, { start, end }).pipe(res)
        } else {
          res.writeHead(200, {
            'Content-Length': stats.size,
            'Content-Type': 'video/mp4'
          })
          fs.createReadStream(realPath).pipe(res)
        }
      })

      localServer.listen(0, '0.0.0.0', () => {
        const addr = localServer!.address() as any
        const port = addr.port

        const nets = os.networkInterfaces()
        let localIp = '127.0.0.1'
        for (const name of Object.keys(nets)) {
          for (const net of nets[name]!) {
            if (net.family === 'IPv4' && !net.internal) {
              localIp = net.address
              break
            }
          }
        }

        const url = `http://${localIp}:${port}`
        logToFile(`[Server] Local stream ready at: ${url}`)
        resolve(url)
      })
    } catch (err) {
      reject(err)
    }
  })
})

ipcMain.handle('stop-local-server', () => {
  if (localServer) {
    localServer.close()
    localServer = null
    return true
  }
  return false
})

ipcMain.handle('remote-control', (_event, { action, payload }) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send('remote-action', { action, payload })
    return true
  }
  return false
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

    // Initialize FFprobe
    try {
      // @ts-ignore
      const ffprobeStatic = (await import('ffprobe-static')).default
      let ffprobePath = ffprobeStatic.path

      // Fix for development environment where path might be mangled to point into dist-electron
      if (!fs.existsSync(ffprobePath)) {
        const nodeModulesBase = path.join(process.cwd(), 'node_modules')
        const manualPath = path.join(nodeModulesBase, 'ffprobe-static', 'bin', process.platform, process.arch, process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe')
        if (fs.existsSync(manualPath)) {
          ffprobePath = manualPath
        }
      }

      ffmpeg.setFfprobePath(ffprobePath)
      logToFile(`✅ FFprobe Initialized: ${ffprobePath}`)
    } catch (e) {
      logToFile(`❌ FFprobe Init Error: ${e}`)
    }
  } catch (err) {
    logToFile(`❌ FFmpeg Load failed: ${err}`);
  }

  // Register Media Protocol Handler
  const protocols = ['media', 'smb', 'sftp', 'nfs', 'webdav']
  protocols.forEach(p => {
    protocol.handle(p, async (request) => {
      logToFile(`[MEDIA DEBUG] Raw URL: ${request.url}`)

      const fullUrl = request.url.replace(`${p}://`, '') // Keep full URL for query string extraction
      const [_, queryString] = fullUrl.split('?')

      const decodedPath = decodeSmartPath(request.url);
      const forceTranscode = queryString?.includes('transcode=true')

      // Normalize logic is now in decodeSmartPath


      try {
        const isRemote = /^[a-z][a-z0-9+.-]+:\/\//i.test(decodedPath);
        let stats;
        let ext = '';

        if (!isRemote) {
          stats = fs.statSync(decodedPath)
          ext = path.extname(decodedPath).toLowerCase()
        } else {
          // For remote URLs, infer extension from path or default to transcoding
          try {
            const urlObj = new URL(decodedPath);
            ext = path.extname(urlObj.pathname).toLowerCase();
          } catch {
            ext = '';
          }
        }
        // Native Chromium support check (Local files only, unless forced)
        let nativeSupport = !forceTranscode && !isRemote && ['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.aac', '.flac', '.m4a', '.opus'].includes(ext)

        // 🧠 DEEP PROBE: Verify Codec Safety (Fix for HEVC/AC3 hiding in MP4s)
        if (nativeSupport && ['.mp4', '.mov', '.mkv'].includes(ext)) {
          try {
            const isSafe = await new Promise<boolean>((resolve) => {
              ffmpeg.ffprobe(decodedPath, (err: any, metadata: any) => {
                if (err || !metadata) {
                  logToFile(`Probe Failed: ${err}. Defaulting to Transcode.`);
                  resolve(false);
                  return;
                }

                // Check Video Codec
                const video = metadata.streams.find((s: any) => s.codec_type === 'video');
                if (video) {
                  const vCodec = video.codec_name?.toLowerCase();
                  if (!['h264', 'vp8', 'vp9', 'av1'].includes(vCodec)) {
                    logToFile(`❌ Unsupported Video Codec: ${vCodec}. Transcoding.`);
                    resolve(false);
                    return;
                  }
                }

                // Check Audio Codec
                const audio = metadata.streams.find((s: any) => s.codec_type === 'audio');
                if (audio) {
                  const aCodec = audio.codec_name?.toLowerCase();
                  if (['ac3', 'eac3', 'dts', 'truehd'].includes(aCodec)) {
                    logToFile(`❌ Unsupported Audio Codec: ${aCodec}. Transcoding.`);
                    resolve(false);
                    return;
                  }
                }

                resolve(true);
              });
            });
            nativeSupport = isSafe;
          } catch (e) {
            logToFile(`Deep Probe Error: ${e}`);
            nativeSupport = false;
          }
        }

        if (nativeSupport) {
          const range = request.headers.get('range')
          if (!range) {
            return new Response(fs.createReadStream(decodedPath) as any, {
              status: 200,
              headers: {
                'Content-Type': 'video/mp4',
                'Content-Length': stats!.size.toString(),
                'Accept-Ranges': 'bytes'
              }
            })
          }

          const parts = range.replace(/bytes=/, "").split("-")
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : stats!.size - 1
          const chunksize = (end - start) + 1
          return new Response(fs.createReadStream(decodedPath, { start, end }) as any, {
            status: 206,
            headers: {
              'Content-Range': `bytes ${start}-${end}/${stats!.size}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize.toString(),
              'Content-Type': 'video/mp4'
            }
          })
        }

        // 🧠 NEURAL DECODE: FFmpeg Real-time Transcoding
        logToFile(`🧠 Universal Decode: ${ext} -> fMP4`);

        const params = new URLSearchParams(queryString);
        const startTime = params.get('t') || params.get('startTime');
        const audioIndex = params.get('audioStream');
        const subIndex = params.get('subStream');

        // Ensure remote URLs are properly encoded for FFmpeg
        const cleanPath = isRemote ? new URL(decodedPath).href : decodedPath;

        let command = ffmpeg(cleanPath);
        if (startTime) {
          command = command.seekInput(startTime);
          logToFile(`Seeking to ${startTime}s`);
        }

        if (audioIndex) {
          command.outputOptions(['-map 0:v:0', `-map 0:${audioIndex}`]);
        }

        if (subIndex) {
          const escapedPath = cleanPath.replace(/:/g, '\\:').replace(/'/g, "\\'");
          command.complexFilter(`subtitles='${escapedPath}':si=${subIndex}`);
        }

        const ffstream = command
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
  })

  // Register GUI Protocol Handler
  protocol.handle('app', async (request) => {
    const url = new URL(request.url)
    let pathName = url.pathname
    if (pathName === '/' || !pathName) pathName = '/index.html'

    // Remove leading slash for path.join
    if (pathName.startsWith('/')) pathName = pathName.slice(1)

    const filePath = path.join(app.getAppPath(), 'dist', pathName)
    logToFile(`[APP PROTOCOL] Request: ${request.url} -> ${filePath}`)

    try {
      const stats = fs.statSync(filePath)
      const ext = path.extname(filePath).toLowerCase()
      const mimeTypes: { [key: string]: string } = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.json': 'application/json',
        '.woff2': 'font/woff2'
      }

      const contentType = mimeTypes[ext] || 'application/octet-stream'

      return new Response(fs.createReadStream(filePath) as any, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': stats.size.toString()
        }
      })
    } catch (e) {
      return new Response('Not Found', { status: 404 })
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

ipcMain.handle('get-video-duration', async (_event, filePath) => {
  let targetPath = decodeSmartPath(filePath);

  if (targetPath.startsWith('http')) {
    // Re-encode for FFprobe
    try { targetPath = new URL(targetPath).href } catch { }
  }

  return new Promise((resolve) => {
    ffmpeg.ffprobe(targetPath, (err: any, metadata: any) => {
      if (err || !metadata) {
        resolve(0);
      } else {
        let dur = metadata.format.duration || 0;
        if (!dur && metadata.streams) {
          // Fallback to max duration from streams
          const streamDurs = metadata.streams
            .map((s: any) => parseFloat(s.duration))
            .filter((d: any) => !isNaN(d) && isFinite(d));
          if (streamDurs.length > 0) {
            dur = Math.max(...streamDurs);
          }
        }
        resolve(dur);
      }
    });
  });
});

ipcMain.handle('get-media-tracks', async (_event, filePath) => {
  let targetPath = decodeSmartPath(filePath);

  if (targetPath.startsWith('http')) {
    try { targetPath = new URL(targetPath).href } catch { }
  }

  return new Promise((resolve) => {
    ffmpeg.ffprobe(targetPath, (err: any, metadata: any) => {
      if (err || !metadata || !metadata.streams) {
        resolve([]);
        return;
      }
      const tracks = metadata.streams.map((s: any) => ({
        index: s.index, // Absolute stream index
        type: s.codec_type,
        codec: s.codec_name,
        language: s.tags?.language || 'und',
        title: s.tags?.title || s.tags?.handler_name || `${s.codec_type} ${s.index}`
      })).filter((t: any) => t.type === 'audio' || t.type === 'subtitle');
      resolve(tracks);
    });
  });
});
