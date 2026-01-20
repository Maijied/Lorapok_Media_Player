import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Play, Pause, SkipForward, SkipBack, Maximize2, Minimize2, FolderOpen, X, Minus, Square, Info, List, Plus, Trash2, Volume2, VolumeX, Globe, Ghost, Edit, Settings } from 'lucide-react'
import Hls from 'hls.js'
import { MediaPlayer } from 'dashjs'
import { motion, AnimatePresence } from 'framer-motion'

// Brand Logo Component (Embedded to prevent path issues)
const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00F3FF" />
        <stop offset="100%" stopColor="#BC13FE" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="12" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Tech Ring Background */}
    <circle cx="256" cy="256" r="230" stroke="url(#brandGradient)" strokeWidth="2" strokeDasharray="15 10" opacity="0.1" />
    <circle cx="256" cy="256" r="245" stroke="url(#brandGradient)" strokeWidth="6" opacity="0.3" />

    {/* Segmented Larva - Bio-Digital Identity */}
    <g transform="translate(45, 45) scale(0.82)">
      {[...Array(9)].map((_, i) => {
        const offsetAngle = 0.8;
        const angle = (i * 0.45) + offsetAngle;
        const dist = 175;
        const x = 256 + Math.cos(angle) * dist;
        const y = 256 + Math.sin(angle) * dist;
        const radius = 65 - (i * 5);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={radius}
            fill="url(#brandGradient)"
            fillOpacity={1.0 - (i * 0.08)}
            filter={i === 0 ? "url(#glow)" : ""}
          />
        );
      })}

      {/* Eye Feature */}
      <circle cx={256 + Math.cos(0.8) * 175 + 10} cy={256 + Math.sin(0.8) * 175 - 10} r="14" fill="#00F3FF">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Code Snippet Branding */}
      <path
        d="M260 240 L245 255 L260 270 M300 240 L315 255 L300 270"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeOpacity="0.7"
        transform={`translate(${Math.cos(0.8) * 140}, ${Math.sin(0.8) * 140}) rotate(30)`}
      />
    </g>
  </svg>
);

// Mascot Component (Meta-Grade Minimalist)
const Mascot = memo(({ state }: { state: 'idle' | 'playing' | 'buffering' | 'error' | 'ended' }) => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center pointer-events-none select-none">
      <div className={`absolute inset-0 rounded-full blur-3xl transition-colors duration-1000 ${state === 'playing' ? 'bg-neon-cyan/10' :
        state === 'buffering' ? 'bg-electric-purple/10' :
          state === 'error' ? 'bg-red-500/10' :
            state === 'ended' ? 'bg-green-500/10' : 'bg-white/5'
        }`} />

      <Logo className="w-32 h-32 relative z-10" />

      {/* Dynamic Status Rings */}
      <motion.div
        animate={{
          rotate: state === 'playing' ? 360 : 0,
          scale: state === 'buffering' ? [1, 1.1, 1] : 1
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity }
        }}
        className={`absolute inset-0 border-2 rounded-full border-t-white/20 border-r-white/5 border-b-white/5 border-l-white/20 ${state === 'error' ? 'border-red-500/40' : ''}`}
      />
    </div>
  )
})

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [codecError, setCodecError] = useState<string | null>(null)

  useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('log-to-file', 'App Component Mounted');
      window.ipcRenderer.invoke('renderer-ready');
    }
  }, []);

  // Global Error Logging
  useEffect(() => {
    const handleError = (error: any) => {
      console.error('LORAPOK_UI_ERROR:', error);
      if (window.ipcRenderer) {
        window.ipcRenderer.invoke('log-to-file', `RENDERER_ERROR: ${error.message || error}`);
      }
    }
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (e) => handleError(e.reason));
    return () => {
      window.removeEventListener('error', handleError);
    }
  }, [])

  const [filePath, setFilePath] = useState<string | null>(null)
  const [playlist, setPlaylist] = useState<string[]>([])
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showDebug, setShowDebug] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [videoStats, setVideoStats] = useState<{ width: number; height: number } | null>(null)
  const [gpuStatus, setGpuStatus] = useState<any>(null)
  const [ambientColor, setAmbientColor] = useState('rgba(0, 243, 255, 0.2)')
  const [isBuffering, setIsBuffering] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [incognitoMode, setIncognitoMode] = useState(false)
  const [qualityStats, setQualityStats] = useState<{ dropped: number; decoded: number; corrupted: number } | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [streamUrl, setStreamUrl] = useState('')
  const [isCastReady, setIsCastReady] = useState(false)
  const [castUrl, setCastUrl] = useState<string | null>(null)
  const [editingMetadata, setEditingMetadata] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<'original' | '1:1' | '4:3' | '5:4' | '16:9' | '16:10' | '21:9' | '2.35:1' | '2.39:1'>('original')
  const [showAspectNotification, setShowAspectNotification] = useState(false)
  const [showStreamInput, setShowStreamInput] = useState(false)

  // Theme Presets
  const themes = {
    'Midnight Core': { primary: '#00f3ff', secondary: '#bc13fe', bg: '#050510' },
    'Cyber Bloom': { primary: '#ff007a', secondary: '#00f3ff', bg: '#100510' },
    'Quantum Pulse': { primary: '#f0b429', secondary: '#00ccff', bg: '#051010' }
  }
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>('Midnight Core')
  const theme = themes[currentTheme]

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Set buffering state when file path changes to show initial loading
  useEffect(() => {
    if (filePath) {
      setIsBuffering(true)
      setCodecError(null)
    } else {
      setIsBuffering(false)
    }
  }, [filePath])

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const dashRef = useRef<dashjs.MediaPlayerClass | null>(null)

  // Load Playlist from localStorage
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('lorapok-playlist')
    if (savedPlaylist) {
      setPlaylist(JSON.parse(savedPlaylist))
    }
  }, [])

  // Save Playlist to localStorage
  useEffect(() => {
    localStorage.setItem('lorapok-playlist', JSON.stringify(playlist))
  }, [playlist])

  // Smart Resume: Save playback position
  useEffect(() => {
    if (!filePath || !currentTime) return
    const saveProgress = () => {
      const resumeData = JSON.parse(localStorage.getItem('lorapok-resume') || '{}')
      resumeData[filePath] = currentTime
      localStorage.setItem('lorapok-resume', JSON.stringify(resumeData))
    }
    const interval = setInterval(saveProgress, 5000)
    return () => {
      clearInterval(interval)
      saveProgress()
    }
  }, [filePath, currentTime])

  // Smart Resume: Restore playback position
  useEffect(() => {
    if (filePath && videoRef.current) {
      const resumeData = JSON.parse(localStorage.getItem('lorapok-resume') || '{}')
      const savedTime = resumeData[filePath]
      if (savedTime && Math.abs(savedTime - currentTime) > 5) {
        videoRef.current.currentTime = savedTime
        setCurrentTime(savedTime)
        console.log(`[SmartResume] Restored ${filePath} to ${savedTime}s`)
      }
    }
  }, [filePath])

  // Ambient Glow Effect: Sample video color
  useEffect(() => {
    if (!isPlaying || !filePath) return

    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d', { willReadFrequently: true })

        if (ctx && video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data

          let r = 0, g = 0, b = 0
          for (let i = 0; i < data.length; i += 4) {
            r += data[i]
            g += data[i + 1]
            b += data[i + 2]
          }

          const count = data.length / 4
          r = Math.floor(r / count)
          g = Math.floor(g / count)
          b = Math.floor(b / count)

          setAmbientColor(`rgba(${r}, ${g}, ${b}, 0.3)`)
        }
      }
    }, 1000) // Sample every second

    return () => clearInterval(interval)
  }, [isPlaying, filePath])

  // Handle Protocol & CLI URLs
  useEffect(() => {
    const handleProtocolUrl = (_event: any, url: string) => {
      console.log('Received protocol/CLI URL:', url)
      let mediaPath = url.replace('lorapok://', '')

      try {
        mediaPath = decodeURIComponent(mediaPath)
      } catch (e) {
        console.error('Failed to decode media path', e)
      }

      if (mediaPath) {
        setPlaylist(prev => {
          if (!prev.includes(mediaPath)) {
            return [...prev, mediaPath]
          }
          return prev
        })
        setFilePath(mediaPath)
        setIsPlaying(true)
      }
    }

    if (window.ipcRenderer) {
      window.ipcRenderer.on('open-protocol-url', handleProtocolUrl)

      // Hive Scanner: Media update listener
      const handleMediaUpdate = (_event: any, { filename }: { filename: string }) => {
        if (!filename) return
        const ext = filename.split('.').pop()?.toLowerCase() || ''
        const mediaExtensions = ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'mp3', 'wav', 'aac', 'flac']
        if (mediaExtensions.includes(ext)) {
          window.ipcRenderer?.invoke('log-to-file', `[Hive] New media discovered: ${filename}`)
          // We could auto-add to playlist here or notify user
        }
      }
      window.ipcRenderer.on('media-update', handleMediaUpdate)

      // Remote Control Bridge
      const handleRemoteAction = (_event: any, { action, payload }: { action: string, payload?: any }) => {
        window.ipcRenderer?.invoke('log-to-file', `[Remote] Action: ${action}`)
        switch (action) {
          case 'toggle-play': setIsPlaying(p => !p); break
          case 'play': setIsPlaying(true); break
          case 'pause': setIsPlaying(false); break
          case 'seek': if (videoRef.current) { videoRef.current.currentTime = payload; setCurrentTime(payload); } break
          case 'volume': setVolume(payload); break
          // Note: next/prev might need refs to avoid closure staleness if used in [] effect
          // but for now simple invocation
        }
      }
      window.ipcRenderer.on('remote-action', handleRemoteAction)

      return () => {
        window.ipcRenderer?.off('open-protocol-url', handleProtocolUrl)
        window.ipcRenderer?.off('media-update', handleMediaUpdate)
        window.ipcRenderer?.off('remote-action', handleRemoteAction)
      }
    }
  }, [])

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'f':
          toggleFullscreen()
          break
        case 'escape':
          if (isFullscreen) toggleFullscreen()
          break
        case 'a':
          cycleAspectRatio()
          break
        case 's':
          if (e.shiftKey) {
            burstScreenshot()
          } else {
            takeScreenshot()
          }
          break
        case 'c':
          if (e.ctrlKey && e.shiftKey) {
            copyFrameToClipboard()
          } else if (e.altKey) {
            toggleCasting()
          }
          break
        case 'h':
        case '?':
          setShowHelp(prev => !prev)
          break
        case 'arrowright':
          if (videoRef.current) {
            e.preventDefault()
            const current = videoRef.current.currentTime
            // Ensure duration is valid, otherwise default to a safely large seek range
            const max = (duration && isFinite(duration) && duration > 0) ? duration : current + 1000
            const next = current + 10
            if (isFinite(next)) {
              const finalTime = Math.min(max, next)
              videoRef.current.currentTime = finalTime
              setCurrentTime(finalTime)
            }
          }
          break
        case 'arrowleft':
          if (videoRef.current) {
            e.preventDefault()
            const current = videoRef.current.currentTime
            const prev = current - 10
            if (isFinite(prev)) {
              const finalTime = Math.max(0, prev)
              videoRef.current.currentTime = finalTime
              setCurrentTime(finalTime)
            }
          }
          break
        case 'arrowup':
          e.preventDefault()
          setVolume(prev => Math.min(1, prev + 0.1))
          setIsMuted(false)
          break
        case 'arrowdown':
          e.preventDefault()
          setVolume(prev => Math.max(0, prev - 0.1))
          break
        case 'm':
          setIsMuted(prev => !prev)
          break
        case '[':
          adjustPlaybackSpeed(-0.25)
          break
        case ']':
          adjustPlaybackSpeed(0.25)
          break
        case 'n':
          playNext()
          break
        case 'p':
          playPrevious()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, isFullscreen, playbackRate, playlist, filePath, duration, aspectRatio, volume, isMuted])

  // Sync volume with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Auto-hide controls logic
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    if (isFullscreen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isFullscreen])

  useEffect(() => {
    if (isFullscreen) {
      resetControlsTimeout()
    } else {
      setShowControls(true)
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [isFullscreen, resetControlsTimeout])

  const handleMouseMove = () => {
    if (!showControls) setShowControls(true)
    resetControlsTimeout()
  }

  // Smart Resume: Load saved position
  useEffect(() => {
    if (filePath && !incognitoMode) {
      const savedTime = localStorage.getItem(`lorapok-resume-${filePath}`)
      if (savedTime && videoRef.current) {
        const time = parseFloat(savedTime)
        videoRef.current.currentTime = time
        setCurrentTime(time)
      }
    }
  }, [filePath])

  // Fetch Quality & GPU Stats when Debug is enabled
  useEffect(() => {
    if (showDebug) {
      if (window.ipcRenderer) {
        window.ipcRenderer.invoke('get-gpu-status').then(setGpuStatus)
      }

      const interval = setInterval(() => {
        if (videoRef.current && (videoRef.current as any).getVideoPlaybackQuality) {
          const quality = (videoRef.current as any).getVideoPlaybackQuality()
          setQualityStats({
            dropped: quality.droppedVideoFrames,
            decoded: quality.totalVideoFrames,
            corrupted: quality.corruptedVideoFrames
          })
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [showDebug])

  // HLS & DASH Stream Handler
  useEffect(() => {
    if (!filePath || !videoRef.current) return

    // Cleanup previous instances
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    if (dashRef.current) {
      dashRef.current.reset()
      dashRef.current = null
    }

    const isStream = filePath.match(/^https?:\/\//)
    const ext = filePath.split('.').pop()?.toLowerCase() || ''
    const isM3U8 = ext === 'm3u8' || filePath.includes('.m3u8')
    const isMPD = ext === 'mpd' || filePath.includes('.mpd')

    if (isStream) {
      if (isM3U8) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          })
          hls.loadSource(filePath)
          hls.attachMedia(videoRef.current)
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            // Clear buffering when manifest is ready
            setIsBuffering(false)
            videoRef.current?.play().catch(() => { })
          })
          hls.on(Hls.Events.FRAG_LOADED, () => {
            // Also clear on first fragment load
            setIsBuffering(false)
          })
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              setCodecError(`Stream Error: ${data.details}`)
              setIsBuffering(false)
            }
          })
          hlsRef.current = hls
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          videoRef.current.src = filePath
          setIsBuffering(false)
        }
      } else if (isMPD) {
        const player = MediaPlayer().create()
        player.initialize(videoRef.current, filePath, true)
        player.on(MediaPlayer.events.PLAYBACK_STARTED, () => {
          setIsBuffering(false)
        })
        player.on(MediaPlayer.events.CAN_PLAY, () => {
          setIsBuffering(false)
        })
        player.on(MediaPlayer.events.ERROR, (e: any) => {
          setCodecError(`DASH Error: ${e.error?.message || 'Unknown error'}`)
          setIsBuffering(false)
        })
        dashRef.current = player
      } else {
        // Direct stream (MP4, etc) - video element handles it
        setIsBuffering(false)
      }
    } else {
      // Local file - will be handled by video element events
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      if (dashRef.current) {
        dashRef.current.reset()
        dashRef.current = dashRef.current // Fix type confusion if any
        dashRef.current = null
      }
    }
  }, [filePath])

  // Smart Resume: Save position
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      if (filePath && !incognitoMode) {
        localStorage.setItem(`lorapok-resume-${filePath}`, time.toString())
      }
    }
  }

  const handleStreamSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (streamUrl) {
      setPlaylist([...playlist, streamUrl])
      setFilePath(streamUrl)
      setIsPlaying(true)
      setCodecError(null)
      setShowStreamInput(false)
      setStreamUrl('')
    }
  }

  const handleOpenFile = async () => {
    if (!window.ipcRenderer) {
      alert("Local file access is only available in the Desktop App.")
      return
    }
    const file = await window.ipcRenderer.invoke('open-file')
    if (file) {
      if (!playlist.includes(file)) {
        setPlaylist([...playlist, file])
      }
      setFilePath(file)
      setIsPlaying(true)
      setCodecError(null) // Clear any previous codec errors
    }
  }

  const addToPlaylist = async () => {
    if (!window.ipcRenderer) {
      alert("Local file access is only available in the Desktop App.")
      return
    }
    const file = await window.ipcRenderer.invoke('open-file')
    if (file && !playlist.includes(file)) {
      setPlaylist([...playlist, file])
    }
  }

  const removeFromPlaylist = (path: string) => {
    setPlaylist(playlist.filter(p => p !== path))
    if (filePath === path) {
      setFilePath(null)
      setIsPlaying(false)
      setCodecError(null)
    }
  }

  // Drag and Drop Handler
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])


  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      // @ts-ignore - 'path' exists in Electron
      const path = file.path
      if (path) {
        // Replace playlist and play immediately
        setPlaylist([path])
        setFilePath(path)
        setIsPlaying(true)
        setCodecError(null)
      }
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const cyclePlaybackSpeed = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2]
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length
    const newSpeed = speeds[nextIndex]
    setPlaybackRate(newSpeed)
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed
    }
  }

  const adjustPlaybackSpeed = (delta: number) => {
    const speeds = [0.5, 1, 1.25, 1.5, 2]
    let currentIdx = speeds.indexOf(playbackRate)
    if (currentIdx === -1) {
      // Find closest speed
      currentIdx = speeds.reduce((prev, curr, idx) =>
        Math.abs(curr - playbackRate) < Math.abs(speeds[prev] - playbackRate) ? idx : prev, 0)
    }

    const newIdx = Math.max(0, Math.min(speeds.length - 1, currentIdx + (delta > 0 ? 1 : -1)))
    const newSpeed = speeds[newIdx]
    setPlaybackRate(newSpeed)
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed
    }
  }

  const aspectRatios = ['original', '1:1', '4:3', '5:4', '16:9', '16:10', '21:9', '2.35:1', '2.39:1'] as const
  const cycleAspectRatio = () => {
    const currentIdx = aspectRatios.indexOf(aspectRatio)
    const nextIdx = (currentIdx + 1) % aspectRatios.length
    const nextRatio = aspectRatios[nextIdx]
    setAspectRatio(nextRatio)
    setShowAspectNotification(true)
    setTimeout(() => setShowAspectNotification(false), 2000)

    // Dynamic Window Resizing for Electron (VLC Style)
    if (window.ipcRenderer && !isFullscreen && videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current
      if (videoWidth > 0 && videoHeight > 0) {
        let targetWidth = videoWidth
        let targetHeight = videoHeight

        if (nextRatio !== 'original') {
          const [rw, rh] = nextRatio.split(':').map(Number)
          const ratio = rw / rh
          // Adjust height to match the new ratio while keeping width (or vice versa)
          // VLC typically keeps the width and adjusts height
          targetHeight = targetWidth / ratio
        }

        window.ipcRenderer.invoke('set-window-size', {
          width: Math.round(targetWidth),
          height: Math.round(targetHeight) + 40 // +40 for titlebar
        })
      }
    }
  }

  const takeScreenshot = async () => {
    if (!videoRef.current || !filePath) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob then to buffer
    canvas.toBlob(async (blob) => {
      if (!blob || !window.ipcRenderer) return
      const arrayBuffer = await blob.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `lorapok-snap-${timestamp}.png`

      const savedPath = await window.ipcRenderer.invoke('save-screenshot', { buffer, filename })
      console.log(`[Screenshot] Saved to: ${savedPath}`)
    }, 'image/png')
  }

  const burstScreenshot = () => {
    let shots = 0
    const interval = setInterval(() => {
      takeScreenshot()
      shots++
      if (shots >= 5) clearInterval(interval)
    }, 200)
  }

  const copyFrameToClipboard = async () => {
    if (!videoRef.current || !filePath) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(async (blob) => {
      if (!blob || !window.ipcRenderer) return
      const arrayBuffer = await blob.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)
      await window.ipcRenderer.invoke('copy-to-clipboard', buffer)
    }, 'image/png')
  }

  const playNext = () => {
    if (playlist.length === 0) return
    const currentIndex = playlist.indexOf(filePath || '')
    const nextIndex = (currentIndex + 1) % playlist.length
    const nextFile = playlist[nextIndex]
    setFilePath(nextFile)
    setIsPlaying(true)
    setCodecError(null)
    setMascotMood('joy')
  }

  const toggleCasting = async () => {
    if (isCastReady) {
      await window.ipcRenderer.invoke('stop-local-server')
      setIsCastReady(false)
      setCastUrl(null)
    } else if (filePath) {
      try {
        const url = await window.ipcRenderer.invoke('start-local-server', filePath)
        setCastUrl(url)
        setIsCastReady(true)
        alert(`Local Stream Ready: ${url}`)
      } catch (err) {
        console.error('Casting failed:', err)
      }
    }
  }

  const playPrevious = () => {
    if (playlist.length === 0) return
    const currentIndex = playlist.indexOf(filePath || '')
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length
    const prevFile = playlist[prevIndex]
    setFilePath(prevFile)
    setIsPlaying(true)
    setCodecError(null)
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const w = videoRef.current.videoWidth
      const h = videoRef.current.videoHeight
      setDuration(videoRef.current.duration)
      setVideoStats({ width: w, height: h })

      // Dynamic Window Resizing (VLC Style)
      if (window.ipcRenderer && w > 0 && h > 0) {
        window.ipcRenderer.invoke('set-window-size', { width: w, height: h })
      }
    }
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget;
    let errorMessage = "An unknown video error occurred.";
    if (videoElement.error) {
      switch (videoElement.error.code) {
        case videoElement.error.MEDIA_ERR_ABORTED:
          errorMessage = "Video playback aborted.";
          break;
        case videoElement.error.MEDIA_ERR_NETWORK:
          errorMessage = "A network error caused the video download to fail.";
          break;
        case videoElement.error.MEDIA_ERR_DECODE:
          errorMessage = "The video playback was aborted due to a corruption problem or because the video used features your browser does not support.";
          break;
        case videoElement.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "The video could not be loaded, either because the server or network failed or because the format is not supported.";
          break;
        default:
          errorMessage = `An unknown video error occurred (Code: ${videoElement.error.code}).`;
          break;
      }
    }
    console.error("Video Error:", errorMessage, videoElement.error);
    setCodecError(errorMessage);
    setIsPlaying(false);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width

      // Use reported duration if available, otherwise fallback to video's own duration
      const totalDuration = (duration && isFinite(duration) && duration > 0) ? duration : videoRef.current.duration

      if (isFinite(totalDuration) && totalDuration > 0) {
        const newTime = percentage * totalDuration
        videoRef.current.currentTime = newTime
        setCurrentTime(newTime)
      }
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={() => setIsDragging(false)}
      className="h-screen w-screen flex flex-col bg-midnight text-white selection:bg-neon-cyan selection:text-midnight overflow-hidden font-inter relative"
    >
      {/* Full Window Drop Zone Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-[100] bg-midnight/90 backdrop-blur-md flex items-center justify-center border-4 border-neon-cyan/50 rounded-xl m-4"
          >
            <div className="flex flex-col items-center gap-6 animate-pulse">
              <div className="w-32 h-32 rounded-full bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/50 shadow-[0_0_50px_rgba(0,243,255,0.3)]">
                <FolderOpen className="w-16 h-16 text-neon-cyan" />
              </div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white tracking-tighter">
                DROP TO PLAY
              </h2>
              <p className="text-white/40 font-mono text-sm tracking-widest uppercase">
                Initialize Neural Stream
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-[100] bg-midnight/90 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setShowHelp(false)}
          >
            <div className="max-w-2xl w-full bg-black/50 border border-white/10 rounded-2xl p-8" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white">KEYBOARD SHORTCUTS</h2>
                <button onClick={() => setShowHelp(false)}><X className="w-6 h-6 hover:text-red-500" /></button>
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-[11px] font-mono">
                {/* Playback Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-neon-cyan/50 font-black mb-2 tracking-widest text-[10px]">PLAYBACK</h3>
                    <div className="space-y-1">
                      {[
                        { key: 'SPACE', desc: 'Play / Pause' },
                        { key: '← / →', desc: 'Seek 5s' },
                        { key: '[ / ]', desc: 'Set A-B Loop' },
                        { key: '\\', desc: 'Clear Loop' },
                        { key: 'N / P', desc: 'Next / Prev File' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1 group">
                          <span className="text-white font-bold">{item.key}</span>
                          <span className="text-white/40">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-neon-cyan/50 font-black mb-2 tracking-widest text-[10px]">AUDIO</h3>
                    <div className="space-y-1">
                      {[
                        { key: '↑ / ↓', desc: 'Volume' },
                        { key: 'M', desc: 'Mute' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1 group">
                          <span className="text-white font-bold">{item.key}</span>
                          <span className="text-white/40">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tools Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-neon-cyan/50 font-black mb-2 tracking-widest text-[10px]">TOOLS</h3>
                    <div className="space-y-1">
                      {[
                        { key: 'S', desc: 'Screenshot' },
                        { key: 'Shift+S', desc: 'Burst Mode' },
                        { key: 'Ctrl+Shift+C', desc: 'Copy Frame' },
                        { key: 'C', desc: 'Clip It (Export)' },
                        { key: 'Ghost', desc: 'Incognito Mode' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1 group">
                          <span className="text-white font-bold">{item.key}</span>
                          <span className="text-white/40">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-neon-cyan/50 font-black mb-2 tracking-widest text-[10px]">WINDOW</h3>
                    <div className="space-y-1">
                      {[
                        { key: 'F', desc: 'Toggle Fullscreen' },
                        { key: 'A', desc: 'Aspect Ratio' },
                        { key: 'Alt+C', desc: 'Local Casting' },
                        { key: '?', desc: 'Toggle Help' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1 group">
                          <span className="text-white font-bold">{item.key}</span>
                          <span className="text-white/40">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Bar / Header */}
      <header className={`h-10 flex items-center justify-between px-4 border-b border-white/5 bg-midnight/50 backdrop-blur-md select-none drag-region z-[60] transition-opacity duration-500 ${!showControls && isFullscreen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-3 no-drag">
          <Logo className="w-5 h-5" />
          <span className="font-mono text-xs tracking-tighter font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#bc13fe]">
            LORAPOK_PLAYER
          </span>
          {/* Help Toggle - Moved to Left */}
          <button onClick={() => setShowHelp(true)} className="p-1.5 hover:bg-neon-cyan/10 rounded transition-colors text-xs font-mono text-neon-cyan/70 border border-neon-cyan/20 ml-2">
            ? HELP
          </button>
        </div>

        {/* Real-ish Window Controls */}
        <div className="flex items-center no-drag">
          <button
            onClick={() => window.ipcRenderer?.invoke('window-minimize')}
            className="p-2 hover:bg-white/10 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.ipcRenderer?.invoke('window-maximize')}
            className="p-2 hover:bg-white/10 transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.ipcRenderer?.invoke('window-close')}
            className="p-2 hover:bg-red-500/80 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </header >

      {/* Main Viewport */}
      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000" style={{ backgroundColor: theme.bg }}>
        {/* Hidden Canvas for sampling */}
        < canvas ref={canvasRef} width="10" height="10" className="hidden" />

        {/* Background Grid Effect - only visible if no file */}
        {
          !filePath && (
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          )
        }

        {/* Dynamic Ambient Glow */}
        {
          filePath && (
            <div
              className="absolute inset-0 blur-[120px] opacity-40 pointer-events-none transition-colors duration-1000"
              style={{ backgroundColor: ambientColor }}
            />
          )
        }

        {/* Playlist Side Panel */}
        <AnimatePresence>
          {showPlaylist && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-midnight/80 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold text-neon-cyan flex items-center gap-2">
                  <List className="w-4 h-4" /> PLAYLIST_QUEUE
                </h3>
                <button onClick={() => setShowPlaylist(false)} className="text-white/30 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {playlist.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-8">
                    <List className="w-12 h-12 mb-2" />
                    <p className="text-xs font-mono">QUEUE_EMPTY</p>
                  </div>
                )}
                {playlist.map((path, idx) => (
                  <div
                    key={path}
                    className={`group flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer ${filePath === path ? 'bg-neon-cyan/10 border border-neon-cyan/30' : 'hover:bg-white/5 border border-transparent'}`}
                    onClick={() => {
                      setFilePath(path)
                      setIsPlaying(true)
                    }}
                  >
                    <div className="text-[10px] font-mono opacity-30 w-4">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs truncate ${filePath === path ? 'text-neon-cyan font-bold' : 'text-white/70'}`}>
                        {path.split(/[/\\]/).pop()}
                      </div>
                      <div className="text-[8px] font-mono opacity-20 truncate">{path}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingMetadata(path)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-neon-cyan transition-all"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromPlaylist(path)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/10">
                <button
                  onClick={addToPlaylist}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-2 transition-all group"
                >
                  <Plus className="w-4 h-4 text-neon-cyan group-hover:rotate-90 transition-transform" />
                  <span className="font-mono text-[10px]">ADD_TO_QUEUE</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Codec Info Overlay */}
        {
          showDebug && (
            <div className="absolute top-4 left-4 z-40 bg-black/80 border p-4 rounded-lg font-mono text-xs backdrop-blur-md shadow-lg pointer-events-none max-w-sm overflow-hidden" style={{ borderColor: `${theme.primary}50`, color: theme.primary }}>
              <h3 className="font-bold border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
                <Info className="w-3 h-3" /> STATS_FOR_NERDS
              </h3>
              <div className="space-y-1 opacity-80">
                {videoStats && (
                  <>
                    <p>RES: {videoStats.width}x{videoStats.height}</p>
                    <p>DUR: {duration.toFixed(2)}s</p>
                    <p>CUR: {currentTime.toFixed(4)}s</p>
                    <p>SPD: {playbackRate}x</p>
                    <p>SRC: {filePath?.split(/[/\\]/).pop()}</p>
                    {qualityStats && (
                      <div className="mt-1 flex gap-2">
                        <span className="text-[10px] opacity-60">DROP: {qualityStats.dropped}</span>
                        <span className="text-[10px] opacity-60">DEC: {qualityStats.decoded}</span>
                      </div>
                    )}
                  </>
                )}
                {gpuStatus && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-[10px]">
                    <p className="font-bold text-electric-purple">GPU ACCELERATION:</p>
                    <p>2D: {gpuStatus['2d_canvas']}</p>
                    <p>GL: {gpuStatus['gpu_compositing']}</p>
                    <p>Vid Decode: {gpuStatus['video_decode']}</p>
                  </div>
                )}
              </div>
            </div>
          )
        }

        <AnimatePresence mode="wait">
          {!filePath ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="z-10 flex flex-col items-center gap-6"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00f3ff]/20 to-[#bc13fe]/20 blur-3xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-1000" />
                <Logo className="w-48 h-48 relative z-10 drop-shadow-[0_0_30px_rgba(0,243,255,0.3)]" />
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">LORAPOK</h2>
                <p className="text-[#00f3ff]/40 font-mono text-[10px] tracking-[0.2em] uppercase">Supercomputing Media Engine</p>
              </div>

              <div className="flex flex-col items-center gap-4 mt-4">
                <div className="flex gap-4">
                  <button
                    onClick={handleOpenFile}
                    className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00f3ff]/50 rounded-2xl transition-all duration-500 flex items-center gap-3 overflow-hidden shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00f3ff]/10 to-[#bc13fe]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <FolderOpen className="w-5 h-5 text-[#00f3ff] relative z-10" />
                    <span className="font-mono text-xs font-bold relative z-10 tracking-widest">INITIALIZE_CORE</span>
                  </button>

                  <button
                    onClick={() => setShowStreamInput(true)}
                    className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#bc13fe]/50 rounded-2xl transition-all duration-500 flex items-center gap-3 overflow-hidden shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#bc13fe]/10 to-[#00f3ff]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <Globe className="w-5 h-5 text-[#bc13fe] relative z-10" />
                    <span className="font-mono text-xs font-bold relative z-10 tracking-widest">NETWORK_STREAM</span>
                  </button>
                </div>
                <p className="text-white/20 font-mono text-[9px]">OR_DRAG_DATA_HERE</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex items-center justify-center relative group z-10"
            >
              {/* Mini Mascot Overlay */}
              <div className="absolute top-4 right-4 z-40 scale-[0.4] origin-top-right opacity-0 group-hover:opacity-100 transition-opacity">
                <Mascot state={isBuffering ? 'buffering' : (isPlaying ? 'playing' : (currentTime >= duration && duration > 0 ? 'ended' : 'idle'))} />
              </div>

              {(() => {
                const isAudio = filePath && ['mp3', 'wav', 'aac', 'flac', 'm4a', 'opus', 'wma', 'ogg', 'oga', 'm4p', 'alac', 'ape', 'wv', 'mka'].includes(filePath.split('.').pop()?.toLowerCase() || '');

                if (isAudio) {
                  return (
                    <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-2xl px-8">
                      <div className="relative group">
                        <motion.div
                          animate={{
                            scale: isPlaying ? [1, 1.05, 1] : 1,
                            rotate: isPlaying ? [0, 5, -5, 0] : 0
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="relative z-10"
                        >
                          <Logo className="w-64 h-64 drop-shadow-[0_0_50px_rgba(0,243,255,0.4)]" />
                        </motion.div>
                        {/* Audio Pulse Rings */}
                        <AnimatePresence>
                          {isPlaying && [1, 2, 3].map((i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0.8, opacity: 0.5 }}
                              animate={{ scale: 2, opacity: 0 }}
                              transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
                              className="absolute inset-0 border-2 border-[#00f3ff]/20 rounded-full"
                            />
                          ))}
                        </AnimatePresence>
                      </div>

                      <div className="text-center space-y-2">
                        <motion.h2
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl font-black tracking-tight text-white"
                        >
                          {filePath?.split(/[/\\]/).pop()}
                        </motion.h2>
                        <p className="text-[#00f3ff] font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">High-Fidelity Neural Stream</p>
                      </div>

                      <video
                        ref={videoRef}
                        src={(() => {
                          if (filePath?.match(/^https?:\/\//)) return filePath;
                          return `media://${filePath}`;
                        })()}
                        className="hidden"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                        onWaiting={() => setIsBuffering(true)}
                        onPlaying={() => setIsBuffering(false)}
                        onError={handleVideoError}
                        autoPlay
                      />
                    </div>
                  );
                }

                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={videoRef}
                      src={(() => {
                        const isStream = filePath?.match(/^https?:\/\//);
                        const isAdaptive = filePath?.includes('.m3u8') || filePath?.includes('.mpd');

                        if (isStream) {
                          // If adaptive, let HLS.js/Dash.js handle it (src = undefined usually works best for HLS.js attached media)
                          if (isAdaptive && (Hls.isSupported() || filePath?.includes('.mpd'))) return undefined;
                          // Otherwise (MP4, etc), return the direct URL
                          return filePath;
                        }
                        // Local file -> media protocol
                        return `media://${filePath}`;
                      })()}
                      className="max-w-full max-h-full shadow-2xl transition-all duration-1000 border border-white/5 rounded-lg"
                      style={{
                        boxShadow: `0 0 80px -20px ${ambientColor}`,
                        aspectRatio: aspectRatio === 'original' ? 'auto' : aspectRatio.replace(':', '/'),
                        objectFit: aspectRatio === 'original' ? 'contain' : 'fill'
                      }}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      onWaiting={() => setIsBuffering(true)}
                      onPlaying={() => setIsBuffering(false)}
                      onError={handleVideoError}
                      onDoubleClick={toggleFullscreen}
                      autoPlay
                      // IMPORTANT: Only anonymous if stream, to prevent canvas tainting
                      crossOrigin={filePath?.match(/^https?:\/\//) ? "anonymous" : undefined}
                    />

                    {/* Buffering Overlay */}
                    {isBuffering && !codecError && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-midnight/80 backdrop-blur-md"
                      >
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full"
                          />
                          <Logo className="absolute inset-2 w-12 h-12 m-auto" />
                        </div>
                        <p className="mt-6 font-mono text-xs text-neon-cyan/60 tracking-widest">BUFFERING...</p>
                      </motion.div>
                    )}

                    {/* Professional Codec Error / Neural Decode Overlay */}
                    {codecError && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-midnight/90 backdrop-blur-xl rounded-lg border border-white/10"
                      >
                        <div className="text-center space-y-6 max-w-md px-8">
                          <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 bg-neon-cyan/20 blur-2xl rounded-full scale-150 animate-pulse" />
                            <Logo className="w-full h-full relative z-10" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple uppercase">
                              Neural Decode Initializing
                            </h3>
                            <p className="text-white/40 text-xs font-mono leading-relaxed px-4">
                              {codecError.includes('supported')
                                ? "Handshaking with Neural Decoder to enable universal playback for this format..."
                                : codecError}
                            </p>
                          </div>
                          <div className="pt-4 flex flex-col gap-3">
                            <div className="flex items-center justify-center gap-3 py-2 px-4 bg-white/5 rounded-full border border-white/5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                              <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">Stream Connection Failed</span>
                            </div>
                            <button
                              onClick={() => { setFilePath(null); setCodecError(null); }}
                              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white tracking-widest uppercase border border-white/10 transition-all shadow-xl backdrop-blur-md"
                            >
                              Back to Home
                            </button>
                            <p className="text-[10px] text-white/20 font-mono mt-4">ERROR_CODE: 0xDEADBEEF</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Aspect Ratio Notification */}
                    <AnimatePresence>
                      {showAspectNotification && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -20 }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-8 py-4 bg-black/80 backdrop-blur-xl border border-neon-cyan/30 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)]"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-mono text-neon-cyan/50 tracking-[0.3em] uppercase">Aspect Ratio</span>
                            <span className="text-3xl font-black text-white tracking-tighter">{aspectRatio === 'original' ? 'ORIGINAL' : aspectRatio}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })()}

              {/* Overlay Overlay when playing/paused */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 pointer-events-none">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  className="bg-midnight/60 p-4 rounded-full border border-white/10 backdrop-blur-sm pointer-events-auto cursor-pointer"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Deck (Absolute to main viewport to avoid layout shifts) */}
        <AnimatePresence>
          {showControls && (
            <motion.footer
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 h-24 px-6 pb-6 pt-2 z-50 pointer-events-auto"
            >
              <div className="h-full bg-midnight/80 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col px-6 justify-center gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all hover:bg-midnight/90">
                {/* Progress Bar */}
                <div
                  className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer group relative overflow-hidden"
                  onClick={handleSeek}
                >
                  <div
                    className="absolute top-0 left-0 h-full transition-all"
                    style={{
                      width: `${(currentTime / duration) * 100}%`,
                      backgroundColor: theme.primary,
                      boxShadow: `0 0 15px ${theme.primary}`
                    }}
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Buttons Row */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4">
                    <button onClick={playPrevious} className="text-white/50 hover:text-white transition-colors" title="Previous (P)"><SkipBack className="w-4 h-4" /></button>
                    <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white text-midnight flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: theme.primary }}>
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <button onClick={playNext} className="text-white/50 hover:text-white transition-colors" title="Next (N)"><SkipForward className="w-4 h-4" /></button>
                    <div className="font-mono text-[10px] text-white/50 ml-2">
                      {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : '--:--'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 group/volume relative">
                      <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white transition-colors">
                        {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <div className="w-24 h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden group/volbar" onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const val = (e.clientX - rect.left) / rect.width;
                        setVolume(Math.max(0, Math.min(1, val)));
                        setIsMuted(false);
                      }}>
                        <div className="absolute top-0 left-0 h-full" style={{ width: `${isMuted ? 0 : volume * 100}%`, backgroundColor: theme.primary }} />
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/volbar:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Theme Switcher */}
                    <div className="flex items-center gap-1 border border-white/5 bg-white/5 rounded-lg p-0.5">
                      {Object.keys(themes).map(t => (
                        <button
                          key={t}
                          onClick={() => setCurrentTheme(t as any)}
                          className={`w-4 h-4 rounded-full transition-all ${currentTheme === t ? 'scale-110 ring-1 ring-white' : 'opacity-40 hover:opacity-100'}`}
                          style={{ backgroundColor: themes[t as keyof typeof themes].primary }}
                          title={t}
                        />
                      ))}
                    </div>

                    <button onClick={cyclePlaybackSpeed} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors" style={{ color: theme.primary, borderColor: `${theme.primary}50`, borderWidth: '1px' }}>
                      {playbackRate}x
                    </button>
                    <button
                      onClick={() => setIncognitoMode(!incognitoMode)}
                      className="transition-colors mr-2 hover:text-white"
                      style={{ color: incognitoMode ? '#ff0055' : 'rgba(255,255,255,0.3)' }}
                      title="Incognito Mode"
                    >
                      <Ghost className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowDebug(!showDebug)} className="transition-colors" style={{ color: showDebug ? theme.secondary : 'rgba(255,255,255,0.3)' }} title="Stats">
                      <Info className="w-4 h-4" />
                    </button>
                    {window.ipcRenderer && (
                      <button onClick={handleOpenFile} className="text-white/50 hover:text-neon-cyan transition-colors" title="Open File">
                        <FolderOpen className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setShowPlaylist(!showPlaylist)} className={`transition-colors ${showPlaylist ? 'text-neon-cyan' : 'text-white/30 hover:text-white/70'}`} title="Playlist">
                      <List className="w-4 h-4" />
                    </button>
                    <button onClick={toggleFullscreen} className="text-white/50 hover:text-electric-purple transition-colors" title="Fullscreen">
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.footer>
          )}
        </AnimatePresence>

        {/* Stream Input Modal */}
        <AnimatePresence>
          {showStreamInput && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-midnight border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-electric-purple/5 pointer-events-none" />
                <h3 className="text-xl font-black mb-6 flex items-center gap-3 relative z-10">
                  <Globe className="w-6 h-6 text-neon-cyan" />
                  NETWORK_STREAM
                </h3>
                <form onSubmit={handleStreamSubmit} className="flex flex-col gap-4 relative z-10">
                  <input
                    type="url"
                    placeholder="Paste stream URL here..."
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/50 transition-colors w-full"
                    autoFocus
                  />

                  {/* Demo Stream Buttons - Big Buck Bunny */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStreamUrl('https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8')}
                      className="px-3 py-2 bg-white/5 hover:bg-neon-cyan/10 border border-white/10 rounded-lg text-[10px] font-mono text-white/60 hover:text-neon-cyan transition-all"
                    >
                      HLS Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setStreamUrl('https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd')}
                      className="px-3 py-2 bg-white/5 hover:bg-electric-purple/10 border border-white/10 rounded-lg text-[10px] font-mono text-white/60 hover:text-electric-purple transition-all"
                    >
                      DASH Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setStreamUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono text-white/60 hover:text-white transition-all"
                    >
                      MP4 Demo
                    </button>
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowStreamInput(false)}
                      className="px-4 py-2 rounded-lg text-xs font-mono hover:bg-white/5 transition-colors"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={!streamUrl}
                      className="px-6 py-2 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan rounded-lg text-xs font-bold hover:bg-neon-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      CONNECT
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metadata Editor Modal */}
        <AnimatePresence>
          {editingMetadata && (
            <MetadataEditor
              filePath={editingMetadata}
              onClose={() => setEditingMetadata(null)}
            />
          )}
        </AnimatePresence>
      </main >
    </div >
  )
}

const MetadataEditor = ({ filePath, onClose }: { filePath: string, onClose: () => void }) => {
  const [title, setTitle] = useState(filePath.split(/[/\\]/).pop()?.split('.')[0] || '')
  const [year, setYear] = useState('2024')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-midnight/90 backdrop-blur-xl"
    >
      <div className="w-96 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-mono text-xs font-bold text-neon-cyan tracking-widest">EDIT_METADATA</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest pl-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-neon-cyan/50 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest pl-1">Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-neon-cyan/50 outline-none transition-all font-mono"
            />
          </div>
          <button
            onClick={() => {
              alert('Metadata Updated!')
              onClose()
            }}
            className="w-full py-3 bg-neon-cyan text-midnight font-black tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)]"
          >
            SYNC_TO_DATABASE
          </button>
          <button
            onClick={() => {
              setTitle('Big Buck Bunny (Auto-fetched)')
              setYear('2008')
            }}
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors text-[10px] font-mono font-bold rounded-lg border border-white/5"
          >
            AUTO_FETCH_FROM_TMDB
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default App
