import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import Hls from 'hls.js'
import { MediaPlayer } from 'dashjs'
import { Play, Pause, Maximize2, Minimize2, FolderOpen, Info, Volume2, VolumeX, Subtitles, Languages, Scissors, SkipBack, SkipForward, X, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '../components/Logo'
import { Mascot } from '../components/Mascot'

export interface LorapokPlayerRef {
    load: (url: string) => void;
    play: () => void;
    pause: () => void;
    toggle: () => void;
    seek: (time: number) => void;
    setVolume: (v: number) => void;
    setMuted: (m: boolean) => void;
    setTheme: (themeName: 'Midnight Core' | 'Cyber Bloom' | 'Quantum Pulse') => void;
    videoElement: HTMLVideoElement | null;
}

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

export const LorapokPlayer = forwardRef<LorapokPlayerRef, LorapokPlayerProps>(({
    src,
    poster,
    autoPlay = false,
    className,
    style,
    onPlay,
    onPause,
    onEnded,
    onError
}, ref) => {
    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [isDragging, setIsDragging] = useState(false)
    const [codecError, setCodecError] = useState<string | null>(null)
    const [currentSrc, setCurrentSrc] = useState<string | null>(src || null)

    // A-B Loop State
    const [loopA, setLoopA] = useState<number | null>(null)
    const [loopB, setLoopB] = useState<number | null>(null)

    // Audio Enhancement State
    const [audioNormalization, setAudioNormalization] = useState<'none' | 'night' | 'voice' | 'ebu'>('none')
    const audioCtxRef = useRef<AudioContext | null>(null)
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
    const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null)
    const filterNodeRef = useRef<BiquadFilterNode | null>(null)
    const analyserNodeRef = useRef<AnalyserNode | null>(null)

    // Sync prop src changes & Reset State
    useEffect(() => {
        if (src !== currentSrc) {
            setCurrentSrc(src || null)
            setIsPlaying(autoPlay)
            setCurrentTime(0)
            setDuration(0)
            setCodecError(null)
            // Show buffering when new source is loading
            setIsBuffering(!!src)
            if (!autoPlay) {
                setShowControls(true)
            }
        }
    }, [src, autoPlay])

    // Dynamic Ambient Light Sampling
    useEffect(() => {
        if (!isPlaying || !currentSrc) return

        const interval = setInterval(() => {
            if (videoRef.current && ambientCanvasRef.current) {
                const video = videoRef.current
                const canvas = ambientCanvasRef.current
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
                    if (count > 0) {
                        r = Math.floor(r / count)
                        g = Math.floor(g / count)
                        b = Math.floor(b / count)
                        setAmbientColor(`rgba(${r}, ${g}, ${b}, 0.3)`)
                    }
                }
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [isPlaying, currentSrc])

    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showDebug, setShowDebug] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [ambientColor, setAmbientColor] = useState('rgba(0, 243, 255, 0.2)')
    const ambientCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const [isBuffering, setIsBuffering] = useState(false)
    const [volume, setVolume] = useState(0.8)
    const [isMuted, setIsMuted] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [aspectRatio, setAspectRatio] = useState<'original' | '1:1' | '4:3' | '5:4' | '16:9' | '16:10' | '21:9' | '2.35:1' | '2.39:1'>('original')
    const [showAspectNotification, setShowAspectNotification] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [showHelp, setShowHelp] = useState(false)

    // Theme Presets (matching standalone app)
    const themes = {
        'Midnight Core': { primary: '#00f3ff', secondary: '#bc13fe', bg: '#050510' },
        'Cyber Bloom': { primary: '#ff007a', secondary: '#00f3ff', bg: '#100510' },
        'Quantum Pulse': { primary: '#f0b429', secondary: '#00ccff', bg: '#051010' }
    }
    const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>('Midnight Core')
    const theme = themes[currentTheme]

    const exportSegment = async () => {
        if (loopA === null || loopB === null || !currentSrc || !(window as any).ipcRenderer) return

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `lorapok-clip-${timestamp}.mp4`

        try {
            const savedPath = await (window as any).ipcRenderer.invoke('export-segment', {
                filePath: currentSrc,
                start: loopA,
                end: loopB,
                filename
            })
            console.log(`[Export] Saved to: ${savedPath}`)
            alert(`Clip exported to: ${savedPath}`)
        } catch (err) {
            console.error('[Export] Failed:', err)
            alert('Export failed. Check console for details.')
        }
    }

    // Track Selection State
    const [audioTracks, setAudioTracks] = useState<{ id: number; name: string }[]>([])
    const [subtitleTracks, setSubtitleTracks] = useState<{ id: number; name: string }[]>([])
    const [currentAudioTrack, setCurrentAudioTrack] = useState(-1)
    const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState(-1)

    const setupAudio = () => {
        if (!videoRef.current || audioCtxRef.current) return

        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            audioCtxRef.current = ctx

            const source = ctx.createMediaElementSource(videoRef.current)
            sourceNodeRef.current = source

            const compressor = ctx.createDynamicsCompressor()
            compressorNodeRef.current = compressor

            const filter = ctx.createBiquadFilter()
            filterNodeRef.current = filter

            const analyser = ctx.createAnalyser()
            analyser.fftSize = 128
            analyserNodeRef.current = analyser

            // Connect to analyser by default
            source.connect(analyser)
            analyser.connect(ctx.destination)
        } catch (err) {
            console.error('Audio initialization failed:', err)
        }
    }

    useEffect(() => {
        if (!audioCtxRef.current || !sourceNodeRef.current || !compressorNodeRef.current || !filterNodeRef.current) return

        const ctx = audioCtxRef.current
        const source = sourceNodeRef.current
        const compressor = compressorNodeRef.current
        const filter = filterNodeRef.current

        source.disconnect()
        compressor.disconnect()
        filter.disconnect()

        switch (audioNormalization) {
            case 'night':
                compressor.threshold.setValueAtTime(-24, ctx.currentTime)
                compressor.knee.setValueAtTime(30, ctx.currentTime)
                compressor.ratio.setValueAtTime(12, ctx.currentTime)
                compressor.attack.setValueAtTime(0.003, ctx.currentTime)
                compressor.release.setValueAtTime(0.25, ctx.currentTime)
                source.connect(compressor)
                compressor.connect(ctx.destination)
                break
            case 'voice':
                filter.type = 'peaking'
                filter.frequency.setValueAtTime(2000, ctx.currentTime)
                filter.Q.setValueAtTime(1, ctx.currentTime)
                filter.gain.setValueAtTime(6, ctx.currentTime)
                source.connect(filter)
                filter.connect(compressor)
                compressor.connect(ctx.destination)
                break
            case 'ebu':
                compressor.threshold.setValueAtTime(-12, ctx.currentTime)
                compressor.ratio.setValueAtTime(20, ctx.currentTime)
                source.connect(compressor)
                compressor.connect(ctx.destination)
                break
            default:
                source.connect(ctx.destination)
        }
    }, [audioNormalization])


    const cycleAspectRatio = () => {
        const aspectRatios = ['original', '1:1', '4:3', '5:4', '16:9', '16:10', '21:9', '2.35:1', '2.39:1'] as const
        const currentIdx = aspectRatios.indexOf(aspectRatio)
        const nextIdx = (currentIdx + 1) % aspectRatios.length
        setAspectRatio(aspectRatios[nextIdx])
        setShowAspectNotification(true)
        setTimeout(() => setShowAspectNotification(false), 2000)
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

    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const hlsRef = useRef<Hls | null>(null)
    const dashRef = useRef<dashjs.MediaPlayerClass | null>(null)

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
            setupAudio()
            if (isPlaying) {
                videoRef.current.pause()
                onPause?.()
            } else {
                videoRef.current.play().catch(() => { })
                onPlay?.()
            }
            setIsPlaying(!isPlaying)
        }
    }

    // Expose Imperative API
    useImperativeHandle(ref, () => ({
        load: (url: string) => {
            setCurrentSrc(url)
            setIsPlaying(autoPlay)
            setCodecError(null)
            setIsBuffering(true)
        },
        play: () => {
            if (videoRef.current) {
                setupAudio()
                videoRef.current.play().catch(() => { })
                setIsPlaying(true)
                onPlay?.()
            }
        },
        pause: () => {
            if (videoRef.current) {
                videoRef.current.pause()
                setIsPlaying(false)
                onPause?.()
            }
        },
        toggle: () => togglePlay(),
        seek: (time: number) => {
            if (videoRef.current) {
                videoRef.current.currentTime = time
                setCurrentTime(time)
            }
        },
        setVolume: (v: number) => setVolume(Math.max(0, Math.min(1, v))),
        setMuted: (m: boolean) => setIsMuted(m),
        setTheme: (themeName: 'Midnight Core' | 'Cyber Bloom' | 'Quantum Pulse') => setCurrentTheme(themeName),
        videoElement: videoRef.current
    }))

    // HLS & DASH Stream Handler
    useEffect(() => {
        if (!currentSrc || !videoRef.current) return

        // Cleanup previous instances
        if (hlsRef.current) {
            hlsRef.current.destroy()
            hlsRef.current = null
        }
        if (dashRef.current) {
            dashRef.current.reset()
            dashRef.current = null
        }

        const isStream = currentSrc.match(/^https?:\/\//)
        const ext = currentSrc.split('.').pop()?.toLowerCase() || ''
        const isM3U8 = ext === 'm3u8' || currentSrc.includes('.m3u8')
        const isMPD = ext === 'mpd' || currentSrc.includes('.mpd')

        if (isStream) {
            if (isM3U8) {
                if (Hls.isSupported()) {
                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    })
                    hls.loadSource(currentSrc)
                    hls.attachMedia(videoRef.current)
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        setIsBuffering(false)
                        if (autoPlay || isPlaying) videoRef.current?.play().catch(() => { })
                    })
                    hls.on(Hls.Events.FRAG_LOADED, () => {
                        setIsBuffering(false)
                    })
                    hls.on(Hls.Events.ERROR, (_event, data) => {
                        if (data.fatal) {
                            setCodecError(`Stream Error: ${data.details}`)
                            setIsBuffering(false)
                        }
                    })

                    // Track Listeners
                    hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_event, data) => {
                        setAudioTracks(data.audioTracks.map(t => ({ id: t.id, name: t.name })))
                    })
                    hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_event, data) => {
                        setSubtitleTracks(data.subtitleTracks.map(t => ({ id: t.id, name: t.name })))
                    })
                    hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_event, data) => {
                        setCurrentAudioTrack(data.id)
                    })
                    hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_event, data) => {
                        setCurrentSubtitleTrack(data.id)
                    })

                    hlsRef.current = hls
                } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                    videoRef.current.src = currentSrc
                    setIsBuffering(false)
                }
            } else if (isMPD) {
                const player = MediaPlayer().create()
                player.initialize(videoRef.current, currentSrc, autoPlay || isPlaying)
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
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
            if (dashRef.current) {
                dashRef.current.reset()
                dashRef.current = null
            }
        }
    }, [currentSrc, autoPlay])

    // Keyboard Shortcuts Handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault()
                    togglePlay()
                    break
                case 'a':
                    cycleAspectRatio()
                    break
                case 'm':
                    setIsMuted(prev => !prev)
                    break
                case 'f':
                    toggleFullscreen()
                    break
                case 'h':
                case '?':
                    setShowHelp(prev => !prev)
                    break
                case 'arrowright':
                    if (videoRef.current) {
                        e.preventDefault()
                        const newTime = Math.min(duration, videoRef.current.currentTime + 10)
                        videoRef.current.currentTime = newTime
                        setCurrentTime(newTime)
                    }
                    break
                case 'arrowleft':
                    if (videoRef.current) {
                        e.preventDefault()
                        const newTime = Math.max(0, videoRef.current.currentTime - 10)
                        videoRef.current.currentTime = newTime
                        setCurrentTime(newTime)
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
                case '{':
                    // Speed down (Shift + [)
                    cyclePlaybackSpeed()
                    break
                case '}':
                    // Speed up (Shift + ])
                    cyclePlaybackSpeed()
                    break
                case '\\':
                    setLoopA(null)
                    setLoopB(null)
                    break
            }

            // A-B Loop markers (uses unshifted [ and ])
            if (e.key === '[' && !e.shiftKey) {
                setLoopA(currentTime)
            } else if (e.key === ']' && !e.shiftKey) {
                setLoopB(currentTime)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isPlaying, isMuted, volume, aspectRatio, isFullscreen, duration, currentTime, playbackRate]) // Refresh listener when state changes to capture newest values for cycle/toggle

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
        if (!videoRef.current) return
        const time = videoRef.current.currentTime
        setCurrentTime(time)

        // A-B Loop Logic
        if (loopA !== null && loopB !== null && time >= loopB) {
            videoRef.current.currentTime = loopA
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
                            {!isPlaying && !isBuffering && (
                                <div
                                    className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/10 transition-colors"
                                    onClick={togglePlay}
                                >
                                    <div className="w-24 h-24 rounded-full bg-midnight/80 backdrop-blur-md border border-neon-cyan/50 flex items-center justify-center group/play shadow-[0_0_50px_rgba(0,243,255,0.2)] hover:scale-110 transition-transform duration-300">
                                        <Play className="w-10 h-10 text-neon-cyan fill-neon-cyan ml-1 group-hover/play:scale-125 transition-transform" />
                                    </div>
                                </div>
                            )}

                            <div className="absolute top-4 right-4 z-40 scale-[0.4] origin-top-right opacity-0 group-hover:opacity-100 transition-opacity">
                                <Mascot state={isBuffering ? 'buffering' : (isPlaying ? 'playing' : (currentTime >= duration && duration > 0 ? 'ended' : 'idle'))} />
                            </div>

                            <video
                                ref={videoRef}
                                src={(() => {
                                    const isStream = currentSrc?.match(/^https?:\/\//);
                                    const isAdaptive = currentSrc?.includes('.m3u8') || currentSrc?.includes('.mpd');

                                    if (isStream) {
                                        if (isAdaptive && (Hls.isSupported() || currentSrc?.includes('.mpd'))) return undefined;
                                        return currentSrc || undefined;
                                    }
                                    return currentSrc || undefined;
                                })()}
                                poster={poster}
                                className="max-w-full max-h-full shadow-2xl transition-all duration-1000 border border-white/5 rounded-lg"
                                style={{
                                    boxShadow: `0 0 80px -20px ${ambientColor}`,
                                    aspectRatio: aspectRatio === 'original' ? 'auto' : aspectRatio.replace(':', '/'),
                                    objectFit: aspectRatio === 'original' ? 'contain' : 'fill'
                                }}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => { setIsPlaying(false); onEnded?.() }}
                                onWaiting={() => setIsBuffering(true)}
                                onPlaying={() => setIsBuffering(false)}
                                onError={handleVideoError}
                                onDoubleClick={toggleFullscreen}
                                autoPlay={autoPlay}
                                crossOrigin={currentSrc?.match(/^https?:\/\//) ? "anonymous" : undefined}
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

                            {codecError && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-midnight/90 backdrop-blur-xl"
                                >
                                    <div className="text-center space-y-4 max-w-sm px-6">
                                        <div className="relative w-20 h-20 mx-auto">
                                            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
                                            <Logo className="w-full h-full relative z-10" />
                                        </div>
                                        <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">STREAM ERROR</h3>
                                        <p className="text-white/40 text-xs font-mono">{codecError}</p>
                                        <button
                                            onClick={() => { setCurrentSrc(null); setCodecError(null); }}
                                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white border border-white/10 transition-all mt-4"
                                        >
                                            Back to Home
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Hidden sampling canvas */}
                            <canvas ref={ambientCanvasRef} width="10" height="10" className="hidden" />

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
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Control Deck */}
            <AnimatePresence>
                {showControls && (
                    <motion.footer
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-0 left-0 right-0 h-24 px-6 pb-6 pt-2 z-50 pointer-events-auto"
                        onMouseEnter={() => setShowControls(true)}
                    >
                        <div className="h-full bg-midnight/80 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col px-6 justify-center gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all hover:bg-midnight/90 relative overflow-hidden">
                            {/* Audio Visualizer (Subtle Background) */}
                            <div className="absolute inset-x-0 bottom-0 h-12 opacity-20 pointer-events-none">
                                <AudioVisualizer analyser={analyserNodeRef.current} />
                            </div>

                            {/* Progress Bar */}
                            <div
                                className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer group relative overflow-hidden z-10"
                                onClick={handleSeek}
                            >
                                <div
                                    className="absolute top-0 left-0 h-full transition-all"
                                    style={{
                                        width: `${(currentTime / Math.max(duration || 0, (videoRef.current?.duration && isFinite(videoRef.current.duration)) ? videoRef.current.duration : 0, currentTime || 1)) * 100}%`,
                                        backgroundColor: theme.primary,
                                        boxShadow: `0 0 15px ${theme.primary}`
                                    }}
                                />
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Buttons Row */}
                            <div className="flex items-center justify-between mt-1 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const v = videoRef.current;
                                                if (v) v.currentTime = Math.max(0, v.currentTime - 10);
                                            }}
                                            className="text-white/30 hover:text-white transition-colors"
                                        >
                                            <SkipBack className="w-4 h-4" />
                                        </button>
                                        <button onClick={togglePlay} className="w-8 h-8 rounded-full text-midnight flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: theme.primary }}>
                                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                        </button>
                                        <button
                                            onClick={() => {
                                                const v = videoRef.current;
                                                if (v) v.currentTime = Math.min(duration, v.currentTime + 10);
                                            }}
                                            className="text-white/30 hover:text-white transition-colors"
                                        >
                                            <SkipForward className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="font-mono text-[10px] text-white/50 ml-2">
                                        {formatTime(currentTime)} / {((duration && isFinite(duration) && duration > 0) || (videoRef.current?.duration && isFinite(videoRef.current.duration))) ? formatTime(Math.max(duration || 0, videoRef.current?.duration || 0, currentTime)) : '--:--'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 group/volume relative">
                                        <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white transition-colors">
                                            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                                        </button>
                                        <div className="w-20 h-1 bg-white/10 rounded-full cursor-pointer relative overflow-hidden group/volbar" onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const val = (e.clientX - rect.left) / rect.width;
                                            setVolume(Math.max(0, Math.min(1, val)));
                                            setIsMuted(false);
                                        }}>
                                            <div className="absolute top-0 left-0 h-full" style={{ width: `${isMuted ? 0 : volume * 100}%`, backgroundColor: theme.primary }} />
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/volbar:opacity-100 transition-opacity" />
                                        </div>
                                    </div>

                                    {/* Audio Track Selector */}
                                    {audioTracks.length > 1 && (
                                        <div className="relative group/tracks">
                                            <button className="text-white/30 hover:text-white transition-colors" title="Audio Tracks">
                                                <Languages className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-full right-0 mb-4 w-48 bg-midnight/95 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden opacity-0 group-hover/tracks:opacity-100 pointer-events-none group-hover/tracks:pointer-events-auto transition-all transform translate-y-2 group-hover/tracks:translate-y-0 shadow-2xl z-50">
                                                <div className="p-2 border-b border-white/5 bg-white/5">
                                                    <span className="text-[9px] font-mono text-[#00f3ff] uppercase tracking-widest">Audio Tracks</span>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto">
                                                    {audioTracks.map((track) => (
                                                        <button
                                                            key={track.id}
                                                            onClick={() => {
                                                                if (hlsRef.current) hlsRef.current.audioTrack = track.id
                                                            }}
                                                            className={`w-full text-left px-4 py-2 text-[10px] font-mono transition-colors hover:bg-white/5 ${currentAudioTrack === track.id ? 'text-[#00f3ff]' : 'text-white/60'}`}
                                                        >
                                                            {track.name || `Track ${track.id}`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Subtitle Track Selector */}
                                    {subtitleTracks.length > 0 && (
                                        <div className="relative group/subs">
                                            <button className="text-white/30 hover:text-white transition-colors" title="Subtitles">
                                                <Subtitles className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-full right-0 mb-4 w-48 bg-midnight/95 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden opacity-0 group-hover/subs:opacity-100 pointer-events-none group-hover/subs:pointer-events-auto transition-all transform translate-y-2 group-hover/subs:translate-y-0 shadow-2xl z-50">
                                                <div className="p-2 border-b border-white/5 bg-white/5">
                                                    <span className="text-[9px] font-mono text-[#00f3ff] uppercase tracking-widest">Subtitles</span>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto">
                                                    <button
                                                        onClick={() => {
                                                            if (hlsRef.current) hlsRef.current.subtitleTrack = -1
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-[10px] font-mono transition-colors hover:bg-white/5 ${currentSubtitleTrack === -1 ? 'text-[#00f3ff]' : 'text-white/60'}`}
                                                    >
                                                        DISABLED
                                                    </button>
                                                    {subtitleTracks.map((track) => (
                                                        <button
                                                            key={track.id}
                                                            onClick={() => {
                                                                if (hlsRef.current) hlsRef.current.subtitleTrack = track.id
                                                            }}
                                                            className={`w-full text-left px-4 py-2 text-[10px] font-mono transition-colors hover:bg-white/5 ${currentSubtitleTrack === track.id ? 'text-[#00f3ff]' : 'text-white/60'}`}
                                                        >
                                                            {track.name || `Subtitle ${track.id}`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Normalization Mode Selector */}
                                    <div className="flex items-center gap-1 border border-white/5 bg-white/5 rounded-lg p-0.5">
                                        {['none', 'night', 'voice', 'ebu'].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setAudioNormalization(mode as any)}
                                                className={`px-1.5 py-0.5 text-[8px] font-mono rounded transition-all`}
                                                style={{
                                                    backgroundColor: audioNormalization === mode ? theme.primary : 'transparent',
                                                    color: audioNormalization === mode ? '#050510' : 'rgba(255,255,255,0.3)'
                                                }}
                                            >
                                                {mode.toUpperCase()}
                                            </button>
                                        ))}
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

                                    {/* Playback Speed Button */}
                                    <button
                                        onClick={cyclePlaybackSpeed}
                                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors"
                                        style={{ color: theme.primary, borderColor: `${theme.primary}50`, borderWidth: '1px' }}
                                    >
                                        {playbackRate}x
                                    </button>

                                    <button onClick={() => setShowDebug(!showDebug)} className="transition-colors" style={{ color: showDebug ? theme.secondary : 'rgba(255,255,255,0.3)' }} title="Stats">
                                        <Info className="w-4 h-4" />
                                    </button>
                                    <button onClick={cycleAspectRatio} className="px-2 py-0.5 hover:bg-white/10 rounded transition-colors text-[9px] font-mono border" style={{ color: `${theme.primary}B3`, borderColor: `${theme.primary}33` }}>
                                        {aspectRatio.toUpperCase()}
                                    </button>
                                    <button onClick={() => setShowHelp(true)} className="text-white/30 hover:text-white transition-colors" title="Help (?)">
                                        <HelpCircle className="w-4 h-4" />
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
                                        <h3 className="font-black mb-2 tracking-widest text-[10px]" style={{ color: `${theme.primary}80` }}>PLAYBACK</h3>
                                        <div className="space-y-1">
                                            {[
                                                { key: 'SPACE', desc: 'Play / Pause' },
                                                { key: '← / →', desc: 'Seek 10s' },
                                                { key: '[ / ]', desc: 'Set A-B Loop' },
                                                { key: '\\', desc: 'Clear Loop' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between items-center py-1 group">
                                                    <span className="text-white font-bold">{item.key}</span>
                                                    <span className="text-white/40">{item.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-black mb-2 tracking-widest text-[10px]" style={{ color: `${theme.primary}80` }}>AUDIO</h3>
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
                                        <h3 className="font-black mb-2 tracking-widest text-[10px]" style={{ color: `${theme.primary}80` }}>SPEED</h3>
                                        <div className="space-y-1">
                                            {[
                                                { key: '{ / }', desc: 'Cycle Speed' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between items-center py-1 group">
                                                    <span className="text-white font-bold">{item.key}</span>
                                                    <span className="text-white/40">{item.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-black mb-2 tracking-widest text-[10px]" style={{ color: `${theme.primary}80` }}>WINDOW</h3>
                                        <div className="space-y-1">
                                            {[
                                                { key: 'F', desc: 'Toggle Fullscreen' },
                                                { key: 'A', desc: 'Aspect Ratio' },
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

            {/* A-B Loop Overlay / Indicators */}
            {(loopA !== null || loopB !== null) && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 bg-midnight/60 backdrop-blur-md border border-white/10 rounded-full font-mono text-[10px] text-neon-cyan select-none">
                    <div className="flex items-center gap-1">
                        <span className="opacity-50">A:</span>
                        <span>{loopA !== null ? formatTime(loopA) : '--:--'}</span>
                    </div>
                    <div className="w-px h-2 bg-white/10 mx-1" />
                    <div className="flex items-center gap-1">
                        <span className="opacity-50">B:</span>
                        <span>{loopB !== null ? formatTime(loopB) : '--:--'}</span>
                    </div>
                    {loopA !== null && loopB !== null && (window as any).ipcRenderer && (
                        <button
                            onClick={exportSegment}
                            className="ml-2 px-2 py-0.5 bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan rounded flex items-center gap-1 transition-all"
                        >
                            <Scissors className="w-3 h-3" />
                            <span>CLIP IT</span>
                        </button>
                    )}
                    <button
                        onClick={() => { setLoopA(null); setLoopB(null); }}
                        className="ml-2 hover:text-white transition-colors"
                    >
                        CLEAR
                    </button>
                </div>
            )}
        </div>
    )
}

const AudioVisualizer = ({ analyser }: { analyser: AnalyserNode | null }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!analyser || !canvasRef.current) return

        let animationFrame: number
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const draw = () => {
            animationFrame = requestAnimationFrame(draw)
            analyser.getByteFrequencyData(dataArray)

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const barWidth = (canvas.width / bufferLength) * 2
            let barHeight
            let x = 0

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height
                const opacity = dataArray[i] / 255
                ctx.fillStyle = `rgba(0, 243, 255, ${opacity * 0.5})`
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)
                x += barWidth
            }
        }

        draw()
        return () => cancelAnimationFrame(animationFrame)
    }, [analyser])

    return <canvas ref={canvasRef} className="w-64 h-full" width={256} height={48} />
}
