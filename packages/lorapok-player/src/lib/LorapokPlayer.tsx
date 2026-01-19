import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Maximize2, Minimize2, FolderOpen, Info, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '../components/Logo'
import { Mascot } from '../components/Mascot'

export interface LorapokPlayerProps {
    src?: string;
    poster?: string;
    autoPlay?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
    onError?: (error: any) => void;
}

export function LorapokPlayer({
    src,
    poster,
    autoPlay = false,
    className,
    style,
    onPlay,
    onPause,
    onEnded,
    onError
}: LorapokPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [isDragging, setIsDragging] = useState(false)
    const [codecError, setCodecError] = useState<string | null>(null)

    // Local state for internal player control logic
    const [currentSrc, setCurrentSrc] = useState<string | null>(src || null)

    // Sync prop src changes
    useEffect(() => {
        if (src) setCurrentSrc(src)
    }, [src])

    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showDebug, setShowDebug] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [ambientColor, setAmbientColor] = useState('rgba(0, 243, 255, 0.2)')
    const [isBuffering, setIsBuffering] = useState(false)
    const [volume, setVolume] = useState(0.8)
    const [isMuted, setIsMuted] = useState(false)
    const [showControls, setShowControls] = useState(true)

    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Ambient Glow Effect
    useEffect(() => {
        if (!isPlaying || !currentSrc) return

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
        }, 1000)

        return () => clearInterval(interval)
    }, [isPlaying, currentSrc])

    // Sync volume with video element
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = isMuted ? 0 : volume
        }
    }, [volume, isMuted])

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
                onPause?.()
            } else {
                videoRef.current.play()
                onPlay?.()
            }
            setIsPlaying(!isPlaying)
        }
    }

    // Handle Drag & Drop (Web API File)
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0]
            const objectUrl = URL.createObjectURL(file)
            setCurrentSrc(objectUrl)
            setIsPlaying(true)
            setCodecError(null)
        }
    }, [])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isDragging) setIsDragging(true)
    }

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const videoElement = e.currentTarget;
        let errorMessage = "An unknown video error occurred.";
        if (videoElement.error) {
            errorMessage = `Error Code: ${videoElement.error.code} - ${videoElement.error.message}`;
        }
        console.error("Video Error:", errorMessage, videoElement.error);
        setCodecError(errorMessage);
        setIsPlaying(false);
        onError?.(videoElement.error);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
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

    const formatTime = (time: number) => {
        if (isNaN(time) || !isFinite(time)) return '0:00'
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current) {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percentage = x / rect.width
            const totalDuration = (duration && isFinite(duration) && duration > 0) ? duration : videoRef.current.duration
            if (isFinite(totalDuration) && totalDuration > 0) {
                const newTime = percentage * totalDuration
                videoRef.current.currentTime = newTime
                setCurrentTime(newTime)
            }
        }
    }

    return (
        <div
            ref={containerRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={() => setIsDragging(false)}
            className={`relative flex flex-col bg-midnight text-white selection:bg-neon-cyan selection:text-midnight overflow-hidden font-inter ${className}`}
            style={{ ...style, backgroundColor: ambientColor.replace('0.3', '0.05') }}
        >
            {/* Full Window Drop Zone Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-[100] bg-midnight/90 backdrop-blur-md flex items-center justify-center border-4 border-neon-cyan/50 rounded-xl m-4 pointer-events-none"
                    >
                        <div className="flex flex-col items-center gap-6 animate-pulse">
                            <div className="w-32 h-32 rounded-full bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/50 shadow-[0_0_50px_rgba(0,243,255,0.3)]">
                                <FolderOpen className="w-16 h-16 text-neon-cyan" />
                            </div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white tracking-tighter">
                                DROP TO PLAY
                            </h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000">
                <canvas ref={canvasRef} width="10" height="10" className="hidden" />

                {!currentSrc && (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                )}

                {currentSrc && (
                    <div
                        className="absolute inset-0 blur-[120px] opacity-40 pointer-events-none transition-colors duration-1000"
                        style={{ backgroundColor: ambientColor }}
                    />
                )}

                {/* Info/Debug Overlay */}
                {showDebug && (
                    <div className="absolute top-4 left-4 z-40 bg-black/80 border border-neon-cyan/30 p-4 rounded-lg font-mono text-xs text-neon-cyan backdrop-blur-md shadow-lg pointer-events-none max-w-sm overflow-hidden">
                        <p>DUR: {duration.toFixed(2)}s</p>
                        <p>CUR: {currentTime.toFixed(4)}s</p>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {!currentSrc ? (
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
                                <p className="text-[#00f3ff]/40 font-mono text-[10px] tracking-[0.2em] uppercase">Web Media Engine</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="player"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full flex items-center justify-center relative group z-10"
                        >
                            <div className="absolute top-4 right-4 z-40 scale-[0.4] origin-top-right opacity-0 group-hover:opacity-100 transition-opacity">
                                <Mascot state={isBuffering ? 'buffering' : (isPlaying ? 'playing' : 'idle')} />
                            </div>

                            <video
                                ref={videoRef}
                                src={currentSrc}
                                poster={poster}
                                className="max-w-full max-h-full shadow-2xl transition-all duration-1000 border border-white/5 rounded-lg"
                                style={{ boxShadow: `0 0 80px -20px ${ambientColor}` }}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => { setIsPlaying(false); onEnded?.() }}
                                onWaiting={() => setIsBuffering(true)}
                                onPlaying={() => setIsBuffering(false)}
                                onError={handleVideoError}
                                onDoubleClick={toggleFullscreen}
                                autoPlay={autoPlay}
                            />

                            {codecError && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-midnight/90 backdrop-blur-xl">
                                    <p className="text-red-500">{codecError}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Controls Bar */}
            <footer
                className={`h-20 bg-midnight/80 backdrop-blur-md border-t border-white/5 px-6 flex items-center justify-between gap-6 relative z-50 transition-transform duration-300 ${!showControls && isFullscreen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
                onMouseEnter={() => setShowControls(true)}
            >
                <div className="flex flex-col flex-1 gap-2">
                    <div
                        className="relative h-1 bg-white/10 rounded-full cursor-pointer group"
                        onClick={handleSeek}
                    >
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full transition-all duration-100"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_10px_#00f3ff] scale-0 group-hover:scale-100 transition-transform" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-full text-neon-cyan hover:text-white transition-all hover:scale-110 active:scale-95">
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                            </button>
                            <div className="flex items-center gap-2 text-xs font-mono text-neon-cyan/70">
                                <span>{formatTime(currentTime)}</span>
                                <span className="opacity-30">/</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 group/vol">
                                <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 hover:text-neon-cyan transition-colors">
                                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                                <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-300 flex items-center">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => {
                                            setVolume(parseFloat(e.target.value));
                                            setIsMuted(parseFloat(e.target.value) === 0);
                                        }}
                                        className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-cyan"
                                    />
                                </div>
                            </div>

                            <button onClick={() => setShowDebug(!showDebug)} className={`p-1.5 rounded hover:bg-white/10 transition-colors ${showDebug ? 'text-neon-cyan' : 'text-white/30'}`}>
                                <Info className="w-4 h-4" />
                            </button>
                            <button onClick={toggleFullscreen} className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
