import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Play, Pause, SkipForward, SkipBack, Maximize2, Minimize2, FolderOpen, X, Minus, Square, Info, List, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Brand Logo Component (Embedded to prevent path issues)
const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00F3FF" />
        <stop offset="100%" stop-color="#BC13FE" />
      </linearGradient>
      <filter id="glassBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="15" flood-opacity="0.3" />
      </filter>
    </defs>
    <rect x="64" y="64" width="384" height="384" rx="80" fill="#050510" />
    <path d="M180 160 C 140 160, 120 200, 120 256 C 120 312, 140 352, 180 352 L 320 352 C 380 352, 400 300, 340 260 L 220 180 C 200 165, 180 160, 180 160 Z"
      fill="url(#brandGradient)" fill-opacity="0.15" stroke="url(#brandGradient)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" filter="url(#softShadow)" />
    <path d="M340 260 L 220 180 C 210 175, 200 175, 190 180 C 170 190, 170 230, 170 256 C 170 282, 170 322, 190 332"
      stroke="white" stroke-width="2" stroke-opacity="0.4" filter="url(#glassBlur)" />
    <circle cx="180" cy="220" r="10" fill="white">
      <animate attributeName="opacity" values="1;0.5;1" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="340" cy="260" r="40" fill="#00F3FF" fill-opacity="0.1" filter="url(#glassBlur)" />
  </svg>
);

// Mascot Component (Meta-Grade Minimalist)
const Mascot = memo(({ state }: { state: 'idle' | 'playing' | 'buffering' | 'error' }) => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center pointer-events-none select-none">
      <div className={`absolute inset-0 rounded-full blur-3xl transition-colors duration-1000 ${state === 'playing' ? 'bg-neon-cyan/10' :
        state === 'buffering' ? 'bg-electric-purple/10' :
          state === 'error' ? 'bg-red-500/10' : 'bg-white/5'
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

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      return () => {
        window.ipcRenderer.off('open-protocol-url', handleProtocolUrl)
      }
    }
  }, [])

  // Smart Resume: Load saved position
  useEffect(() => {
    if (filePath) {
      const savedTime = localStorage.getItem(`lorapok-resume-${filePath}`)
      if (savedTime && videoRef.current) {
        const time = parseFloat(savedTime)
        videoRef.current.currentTime = time
        setCurrentTime(time)
      }
    }
  }, [filePath])

  // Fetch GPU Status when Debug is enabled
  useEffect(() => {
    if (showDebug && window.ipcRenderer) {
      window.ipcRenderer.invoke('get-gpu-status').then(setGpuStatus)
    }
  }, [showDebug])

  // Smart Resume: Save position
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      if (filePath) {
        localStorage.setItem(`lorapok-resume-${filePath}`, time.toString())
      }
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
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      // @ts-ignore - 'path' exists in Electron
      const path = file.path
      if (path) {
        setPlaylist(prev => {
          if (!prev.includes(path)) {
            return [...prev, path]
          }
          return prev
        })
        setFilePath(path)
        setIsPlaying(true)
        setCodecError(null) // Clear any previous codec errors
      }
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
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

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setVideoStats({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      })
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
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      const newTime = percentage * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
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
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="h-screen w-screen flex flex-col bg-midnight text-white selection:bg-neon-cyan selection:text-midnight overflow-hidden font-inter"
    >

      {/* Title Bar / Header */}
      <header className={`h-10 flex items-center justify-between px-4 border-b border-white/5 bg-midnight/50 backdrop-blur-md select-none drag-region z-50 ${isFullscreen ? 'hidden' : ''}`}>
        <div className="flex items-center gap-2 no-drag">
          <Logo className="w-5 h-5" />
          <span className="font-mono text-xs tracking-tighter font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#bc13fe]">
            LORAPOK_PLAYER
          </span>
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
      </header>

      {/* Main Viewport */}
      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-black/50 transition-colors duration-1000" style={{ backgroundColor: ambientColor.replace('0.3', '0.05') }}>
        {/* Hidden Canvas for sampling */}
        <canvas ref={canvasRef} width="10" height="10" className="hidden" />

        {/* Background Grid Effect - only visible if no file */}
        {!filePath && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        )}

        {/* Dynamic Ambient Glow */}
        {filePath && (
          <div
            className="absolute inset-0 blur-[120px] opacity-40 pointer-events-none transition-colors duration-1000"
            style={{ backgroundColor: ambientColor }}
          />
        )}

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
        {showDebug && (
          <div className="absolute top-4 left-4 z-40 bg-black/80 border border-neon-cyan/30 p-4 rounded-lg font-mono text-xs text-neon-cyan backdrop-blur-md shadow-lg pointer-events-none max-w-sm overflow-hidden">
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
        )}

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
                <button
                  onClick={handleOpenFile}
                  className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00f3ff]/50 rounded-2xl transition-all duration-500 flex items-center gap-3 overflow-hidden shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00f3ff]/10 to-[#bc13fe]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <FolderOpen className="w-5 h-5 text-[#00f3ff] relative z-10" />
                  <span className="font-mono text-xs font-bold relative z-10 tracking-widest">INITIALIZE_CORE</span>
                </button>
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
                <Mascot state={isBuffering ? 'buffering' : (isPlaying ? 'playing' : 'idle')} />
              </div>

              {(() => {
                const isAudio = filePath && ['mp3', 'wav', 'aac', 'flac', 'm4a', 'opus', 'wma', 'ogg', 'oga', 'm4p', 'alac'].includes(filePath.split('.').pop()?.toLowerCase() || '');

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
                        src={`media://${filePath}`}
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
                      src={`media://${filePath}`}
                      className="max-w-full max-h-full shadow-2xl transition-all duration-1000 border border-white/5 rounded-lg"
                      style={{ boxShadow: `0 0 80px -20px ${ambientColor}` }}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      onWaiting={() => setIsBuffering(true)}
                      onPlaying={() => setIsBuffering(false)}
                      onError={handleVideoError}
                      autoPlay
                    />

                    {/* Professional Codec Error Overlay */}
                    {codecError && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-midnight/90 backdrop-blur-xl rounded-lg border border-white/10"
                      >
                        <div className="text-center space-y-6 max-w-md px-8">
                          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
                            <Info className="w-8 h-8 text-red-500" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Neural Decode Failed</h3>
                            <p className="text-white/40 text-sm leading-relaxed">
                              {codecError}
                              <br />
                              <span className="text-[#00f3ff] uppercase text-[10px] mt-2 block">Path: {filePath?.split(/[/\\]/).pop()}</span>
                            </p>
                          </div>
                          <div className="pt-4 flex flex-col gap-3">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60">
                              TRY CONVERTING TO H.264 / MP4
                            </div>
                            <button
                              onClick={() => { setFilePath(null); setCodecError(null); }}
                              className="text-white/40 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest"
                            >
                              RETURN_TO_CORE
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
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
      </main>

      {/* Control Deck */}
      <footer className="h-24 px-6 pb-6 pt-2 z-50">
        <div className="h-full bg-midnight/80 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col px-6 justify-center gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all hover:bg-midnight/90">

          {/* Progress Bar */}
          <div
            className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer group relative overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-cyan to-electric-purple shadow-[0_0_15px_#00f3ff] transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            {/* Hover highlight for seek */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <button className="text-white/50 hover:text-white transition-colors"><SkipBack className="w-4 h-4" /></button>

              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white text-midnight flex items-center justify-center hover:bg-neon-cyan hover:shadow-[0_0_15px_#00f3ff] transition-all duration-300"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button className="text-white/50 hover:text-white transition-colors"><SkipForward className="w-4 h-4" /></button>

              <div className="font-mono text-[10px] text-white/50 ml-2">
                {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : '--:--'}
              </div>
            </div>

            <div className="font-mono text-[10px] text-white/30 tracking-widest truncate max-w-[300px] uppercase hidden sm:block">
              {filePath ? `// ${filePath.split(/[/\\]/).pop()}` : '// READY'}
            </div>

            <div className="flex items-center gap-3">
              {/* Playback Speed */}
              <button
                onClick={cyclePlaybackSpeed}
                className="text-[10px] font-mono font-bold text-neon-cyan border border-neon-cyan/30 px-1.5 py-0.5 rounded hover:bg-neon-cyan/10 transition-colors"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>

              <button
                onClick={() => setShowDebug(!showDebug)}
                className={`transition-colors ${showDebug ? 'text-electric-purple' : 'text-white/30 hover:text-white/70'}`}
                title="Stats for Nerds"
              >
                <Info className="w-4 h-4" />
              </button>

              {window.ipcRenderer && (
                <>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button onClick={handleOpenFile} className="text-white/50 hover:text-neon-cyan transition-colors" title="Open File">
                    <FolderOpen className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`transition-colors ${showPlaylist ? 'text-neon-cyan' : 'text-white/30 hover:text-white/70'}`}
                title="Toggle Playlist"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="text-white/50 hover:text-electric-purple transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
