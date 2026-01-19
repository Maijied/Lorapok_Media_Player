import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, SkipForward, SkipBack, Maximize2, Minimize2, FolderOpen, Activity, Terminal, X, Minus, Square, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [filePath, setFilePath] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showDebug, setShowDebug] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [videoStats, setVideoStats] = useState<{ width: number; height: number } | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
    const file = await window.ipcRenderer.invoke('open-file')
    if (file) {
      setFilePath(file)
      setIsPlaying(true)
    }
  }

  // Drag and Drop Handler
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      // Electron exposes the full path on the File object
      // @ts-ignore - 'path' exists in Electron
      const path = file.path
      if (path) {
        setFilePath(path)
        setIsPlaying(true)
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
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // Mascot Component
  const MascotPlaceholder = () => (
    <div className="relative w-48 h-48 flex items-center justify-center pointer-events-none select-none">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full border-2 border-electric-purple blur-md"
      />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-4 rounded-full border border-dashed border-neon-cyan/30"
      />
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-24 h-24 bg-gradient-to-br from-neon-cyan to-electric-purple rounded-3xl opacity-90 blur-[1px] flex items-center justify-center shadow-[0_0_30px_rgba(0,243,255,0.4)]"
      >
        <Activity className="text-midnight w-12 h-12" />
      </motion.div>
    </div>
  )

  return (
    <div 
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="h-screen w-screen flex flex-col bg-midnight text-white selection:bg-neon-cyan selection:text-midnight overflow-hidden font-inter"
    >
      
      {/* Title Bar / Header */}
      <header className={`h-10 flex items-center justify-between px-4 border-b border-white/5 bg-midnight/50 backdrop-blur-md select-none drag-region z-50 ${isFullscreen ? 'hidden' : ''}`}>
        <div className="flex items-center gap-3 no-drag">
          <Terminal className="w-4 h-4 text-neon-cyan" />
          <span className="font-mono text-xs tracking-wider font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-electric-purple">
            LORAPOK_PLAYER
          </span>
        </div>
        
        {/* Real-ish Window Controls */}
        <div className="flex items-center no-drag">
           <button className="p-2 hover:bg-white/10 transition-colors"><Minus className="w-3 h-3" /></button>
           <button className="p-2 hover:bg-white/10 transition-colors"><Square className="w-3 h-3" /></button>
           <button className="p-2 hover:bg-red-500/80 transition-colors"><X className="w-3 h-3" /></button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-black/50">
        {/* Background Grid Effect - only visible if no file */}
        {!filePath && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        )}
        
        {/* Codec Info Overlay */}
        {showDebug && videoStats && (
          <div className="absolute top-4 left-4 z-40 bg-black/80 border border-neon-cyan/30 p-4 rounded-lg font-mono text-xs text-neon-cyan backdrop-blur-md shadow-lg pointer-events-none">
            <h3 className="font-bold border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
              <Info className="w-3 h-3" /> STATS_FOR_NERDS
            </h3>
            <div className="space-y-1 opacity-80">
              <p>RES: {videoStats.width}x{videoStats.height}</p>
              <p>DUR: {duration.toFixed(2)}s</p>
              <p>CUR: {currentTime.toFixed(4)}s</p>
              <p>SPD: {playbackRate}x</p>
              <p>SRC: {filePath?.split(/[/\\]/).pop()}</p>
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
              className="z-10 flex flex-col items-center gap-8"
            >
              <MascotPlaceholder />
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-light tracking-tight text-white/90">Awaiting Input</h2>
                <p className="text-neon-cyan/60 font-mono text-sm">Drop media file here or click to open</p>
              </div>
              <button 
                onClick={handleOpenFile}
                className="group relative px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-cyan/50 rounded-lg transition-all duration-300 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-neon-cyan/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <FolderOpen className="w-5 h-5 text-neon-cyan relative z-10" />
                <span className="font-mono text-sm relative z-10">OPEN_FILE</span>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex items-center justify-center relative group"
            >
              <video 
                ref={videoRef}
                src={`file://${filePath}`}
                className="max-w-full max-h-full shadow-2xl"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                autoPlay
              />
              
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
                {formatTime(currentTime)} / {formatTime(duration)}
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
              
              <div className="w-px h-4 bg-white/10 mx-1" />

              <button onClick={handleOpenFile} className="text-white/50 hover:text-neon-cyan transition-colors" title="Open File">
                <FolderOpen className="w-4 h-4" />
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
