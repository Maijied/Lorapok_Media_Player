import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import Hls from 'hls.js'
import { MediaPlayer } from 'dashjs'
import { Play, Pause, Maximize2, Minimize2, FolderOpen, Info, Volume2, VolumeX, Subtitles, Languages, Scissors, SkipBack, SkipForward, X, Activity, Music, Sliders } from 'lucide-react'
import { Logo } from '../components/Logo'

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

/**
 * Browser-compatible URL normalizer
 * Handles common issues: trailing dots, double-encoding, whitespace
 */
function normalizeUrl(url: string): string {
    // Clean trailing garbage and whitespace
    let clean = url.trim().replace(/\.+$/, '').replace(/[\r\n]+/g, '');

    // Recursive decode for double/triple encoded URLs
    let maxIterations = 3;
    while (maxIterations-- > 0 && /%[0-9A-Fa-f]{2}/.test(clean)) {
        try {
            const decoded = decodeURIComponent(clean);
            if (decoded === clean) break;
            clean = decoded;
        } catch {
            break;
        }
    }

    // Re-encode for safe usage (properly encode spaces, brackets, etc.)
    try {
        const parsed = new URL(clean);
        return parsed.href;
    } catch {
        return clean; // Return as-is if not a valid URL
    }
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
    const [currentSrc, setCurrentSrc] = useState<string | null>(src ? normalizeUrl(src) : null)

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
        const normalizedSrc = src ? normalizeUrl(src) : null
        if (normalizedSrc !== currentSrc) {
            setCurrentSrc(normalizedSrc)
            setIsPlaying(autoPlay)
            setCurrentTime(0)
            setDuration(0)
            setCodecError(null)
            // Only set buffering if autoPlay is requested
            setIsBuffering(autoPlay)
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
    const [showVisualizerHUD, setShowVisualizerHUD] = useState(false)
    const [showMobileSettings, setShowMobileSettings] = useState(false)
    const isAudioTrack = !!(currentSrc && /\.(mp3|flac|wav|aac|m4a|ogg|wma)(\?.*)?$/i.test(currentSrc))

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
        if (!videoRef.current) return

        if (audioCtxRef.current) {
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume().catch(() => {})
            }
            return
        }

        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            audioCtxRef.current = ctx
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {})
            }

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
            {isDragging && (
                <div
                    className="absolute inset-0 z-[100] bg-midnight/90 backdrop-blur-md flex items-center justify-center border-4 border-neon-cyan/50 rounded-xl m-4 pointer-events-none transition-all duration-300"
                >
                    <div className="flex flex-col items-center gap-6 animate-pulse">
                        <div className="w-32 h-32 rounded-full bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/50 shadow-[0_0_50px_rgba(0,243,255,0.3)]">
                            <FolderOpen className="w-16 h-16 text-neon-cyan" />
                        </div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white tracking-tighter">
                            DROP TO PLAY
                        </h2>
                    </div>
                </div>
            )}

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

                {!currentSrc ? (
                    <div
                        key="empty"
                        className="z-10 flex flex-col items-center gap-6 transition-all duration-300"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#00f3ff]/20 to-[#bc13fe]/20 blur-3xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-1000" />
                            <Logo className="w-48 h-48 relative z-10 drop-shadow-[0_0_30px_rgba(0,243,255,0.3)]" />
                        </div>
                        <div className="text-center space-y-1">
                            <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">LORAPOK</h2>
                            <p className="text-[#00f3ff]/40 font-mono text-[10px] tracking-[0.2em] uppercase">Web Media Engine</p>
                        </div>
                    </div>
                ) : (
                    <div
                        key="player"
                        className="w-full h-full flex items-center justify-center relative group z-10 transition-opacity duration-300"
                    >
                        {!isPlaying && (
                            <div
                                className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer bg-black/25 hover:bg-black/15 transition-colors"
                                onClick={togglePlay}
                            >
                                <div className="w-24 h-24 rounded-full bg-midnight/85 backdrop-blur-md border border-neon-cyan/50 flex items-center justify-center group/play shadow-[0_0_50px_rgba(0,243,255,0.25)] hover:scale-110 transition-transform duration-300">
                                    <Play className="w-10 h-10 text-neon-cyan fill-neon-cyan ml-1 group-hover/play:scale-125 transition-transform" />
                                </div>
                            </div>
                        )}

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
                                className={`max-w-full max-h-full shadow-2xl transition-all duration-1000 border border-white/5 rounded-lg ${isAudioTrack ? 'opacity-0 absolute pointer-events-none' : 'opacity-100'}`}
                                style={{
                                    boxShadow: isAudioTrack ? 'none' : `0 0 80px -20px ${ambientColor}`,
                                    aspectRatio: aspectRatio === 'original' ? 'auto' : aspectRatio.replace(':', '/'),
                                    objectFit: aspectRatio === 'original' ? 'contain' : 'fill'
                                }}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onCanPlay={() => setIsBuffering(false)}
                                onCanPlayThrough={() => setIsBuffering(false)}
                                onLoadedData={() => setIsBuffering(false)}
                                onPause={() => setIsBuffering(false)}
                                onEnded={() => { setIsPlaying(false); onEnded?.() }}
                                onWaiting={() => { if (isPlaying) setIsBuffering(true); }}
                                onPlaying={() => { setIsBuffering(false); setIsPlaying(true); }}
                                onError={handleVideoError}
                                onDoubleClick={toggleFullscreen}
                                autoPlay={autoPlay}
                                crossOrigin={currentSrc?.match(/^https?:\/\//) ? "anonymous" : undefined}
                            />

                            {/* Neural Audio Stage for Audio Playback */}
                            {isAudioTrack && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none p-6 select-none">
                                    <div className="relative flex flex-col items-center gap-6 max-w-lg w-full">
                                        {/* Holographic Vinyl Disc */}
                                        <div className="relative group pointer-events-auto cursor-pointer" onClick={togglePlay}>
                                            <div className={`w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-black/90 border-4 border-white/10 shadow-[0_0_60px_rgba(0,243,255,0.25)] flex items-center justify-center relative overflow-hidden transition-all duration-700 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : 'opacity-80 scale-95'}`}>
                                                <div className="absolute inset-2 rounded-full border border-white/5" />
                                                <div className="absolute inset-6 rounded-full border border-white/5" />
                                                <div className="absolute inset-10 rounded-full border border-white/10" />
                                                <div className="absolute inset-14 rounded-full border border-white/5" />
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#00f3ff] via-[#bc13fe] to-[#ff007a] flex items-center justify-center shadow-inner relative z-10">
                                                    <Music className="w-8 h-8 text-midnight drop-shadow" />
                                                </div>
                                            </div>
                                            <div className="absolute -inset-4 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 blur-2xl rounded-full -z-10 animate-pulse" />
                                        </div>

                                        {/* Track Metadata & Reactive Equalizer */}
                                        <div className="w-full text-center space-y-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-mono text-neon-cyan uppercase tracking-widest">
                                                <Activity className="w-3 h-3 animate-pulse" />
                                                <span>Lossless Audio Engine</span>
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate max-w-md mx-auto">
                                                {currentSrc?.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Audio Track'}
                                            </h3>
                                        </div>

                                        {/* Stage Visualizer */}
                                        <div className="w-full h-24 sm:h-28 px-4 flex items-center justify-center">
                                            <AudioVisualizer analyser={analyserNodeRef.current} isPlaying={isPlaying} mode="stage" />
                                        </div>
                                    </div>
                                </div>
                            )}

                        {/* Buffering Overlay */}
                        {isBuffering && isPlaying && !codecError && (
                            <div
                                className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-midnight/80 backdrop-blur-md transition-opacity duration-300"
                            >
                                <div className="relative">
                                    <div
                                        className="w-20 h-20 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin"
                                    />
                                    <Logo className="absolute inset-2 w-12 h-12 m-auto" />
                                </div>
                                <p className="mt-6 font-mono text-xs text-neon-cyan/60 tracking-widest">BUFFERING...</p>
                            </div>
                        )}

                        {codecError && (
                            <div
                                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-midnight/90 backdrop-blur-xl transition-opacity duration-300"
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
                            </div>
                        )}

                        {/* Hidden sampling canvas */}
                        <canvas ref={ambientCanvasRef} width="10" height="10" className="hidden" />

                        {/* Aspect Ratio Notification */}
                        {showAspectNotification && (
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-8 py-4 bg-black/80 backdrop-blur-xl border border-neon-cyan/30 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] transition-all duration-300"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-mono text-neon-cyan/50 tracking-[0.3em] uppercase">Aspect Ratio</span>
                                    <span className="text-3xl font-black text-white tracking-tighter">{aspectRatio === 'original' ? 'ORIGINAL' : aspectRatio}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Control Deck */}
            {showControls && (
                <footer
                    className="absolute bottom-0 left-0 right-0 h-auto sm:h-24 p-2 sm:px-6 sm:pb-6 sm:pt-2 z-50 pointer-events-auto transition-all duration-300"
                    onMouseEnter={() => setShowControls(true)}
                >
                    <div className="h-full bg-midnight/85 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col p-3 sm:px-6 sm:py-3 justify-center gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all hover:bg-midnight/90 relative overflow-hidden">
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
                        <div className="flex items-center justify-between gap-2 mt-1 z-10">
                            {/* Left Group: Playback Controls & Time */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                <button
                                    onClick={() => {
                                        const v = videoRef.current;
                                        if (v) v.currentTime = Math.max(0, v.currentTime - 10);
                                    }}
                                    className="text-white/40 hover:text-white transition-colors p-1"
                                    title="Rewind 10s"
                                >
                                    <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                    onClick={togglePlay}
                                    className="w-8 h-8 sm:w-8 sm:h-8 rounded-full text-midnight flex items-center justify-center transition-all hover:scale-110 shadow-lg shrink-0"
                                    style={{ backgroundColor: theme.primary }}
                                    title={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />}
                                </button>
                                <button
                                    onClick={() => {
                                        const v = videoRef.current;
                                        if (v) v.currentTime = Math.min(duration, v.currentTime + 10);
                                    }}
                                    className="text-white/40 hover:text-white transition-colors p-1"
                                    title="Forward 10s"
                                >
                                    <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                                <div className="font-mono text-[9px] sm:text-[10px] text-white/50 whitespace-nowrap pl-1">
                                    {formatTime(currentTime)} / {((duration && isFinite(duration) && duration > 0) || (videoRef.current?.duration && isFinite(videoRef.current.duration))) ? formatTime(Math.max(duration || 0, videoRef.current?.duration || 0, currentTime)) : '--:--'}
                                </div>
                            </div>

                            {/* Middle Group: Desktop Only Secondary Controls */}
                            <div className="hidden lg:flex items-center gap-2.5">
                                {/* Normalization Mode Selector */}
                                <div className="flex items-center gap-1 border border-white/5 bg-white/5 rounded-lg p-0.5">
                                    {['none', 'night', 'voice', 'ebu'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setAudioNormalization(mode as any)}
                                            className="px-1.5 py-0.5 text-[8px] font-mono rounded transition-all"
                                            style={{
                                                backgroundColor: audioNormalization === mode ? theme.primary : 'transparent',
                                                color: audioNormalization === mode ? '#050510' : 'rgba(255,255,255,0.4)'
                                            }}
                                        >
                                            {mode.toUpperCase()}
                                        </button>
                                    ))}
                                </div>

                                {/* Theme Switcher */}
                                <div className="flex items-center gap-1 border border-white/5 bg-white/5 rounded-lg p-1">
                                    {Object.keys(themes).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setCurrentTheme(t as any)}
                                            className={`w-3.5 h-3.5 rounded-full transition-all ${currentTheme === t ? 'scale-110 ring-1 ring-white' : 'opacity-40 hover:opacity-100'}`}
                                            style={{ backgroundColor: themes[t as keyof typeof themes].primary }}
                                            title={t}
                                        />
                                    ))}
                                </div>

                                {/* Aspect Ratio */}
                                <button
                                    onClick={cycleAspectRatio}
                                    className="px-2 py-0.5 hover:bg-white/10 rounded transition-colors text-[9px] font-mono border"
                                    style={{ color: `${theme.primary}B3`, borderColor: `${theme.primary}33` }}
                                    title="Aspect Ratio"
                                >
                                    {aspectRatio.toUpperCase()}
                                </button>
                            </div>

                            {/* Right Group: Essential Media Actions + Mobile Settings Popover Trigger */}
                            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                                {/* Volume Control */}
                                <div className="flex items-center gap-1.5 group/volume relative">
                                    <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white transition-colors p-1" title={isMuted ? "Unmute" : "Mute"}>
                                        {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                    </button>
                                    <div
                                        className="hidden sm:block w-16 md:w-20 h-1 bg-white/10 rounded-full cursor-pointer relative overflow-hidden group/volbar"
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const val = (e.clientX - rect.left) / rect.width;
                                            setVolume(Math.max(0, Math.min(1, val)));
                                            setIsMuted(false);
                                        }}
                                    >
                                        <div className="absolute top-0 left-0 h-full" style={{ width: `${isMuted ? 0 : volume * 100}%`, backgroundColor: theme.primary }} />
                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/volbar:opacity-100 transition-opacity" />
                                    </div>
                                </div>

                                {/* Audio Track Selector (Desktop) */}
                                {audioTracks.length > 1 && (
                                    <div className="hidden sm:block relative group/tracks">
                                        <button className="text-white/40 hover:text-white transition-colors p-1" title="Audio Tracks">
                                            <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                        <div className="absolute bottom-full right-0 mb-3 w-44 bg-midnight/95 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden opacity-0 group-hover/tracks:opacity-100 pointer-events-none group-hover/tracks:pointer-events-auto transition-all shadow-2xl z-50">
                                            <div className="p-2 border-b border-white/5 bg-white/5">
                                                <span className="text-[9px] font-mono text-[#00f3ff] uppercase tracking-widest">Audio Tracks</span>
                                            </div>
                                            <div className="max-h-40 overflow-y-auto">
                                                {audioTracks.map((track) => (
                                                    <button
                                                        key={track.id}
                                                        onClick={() => {
                                                            if (hlsRef.current) hlsRef.current.audioTrack = track.id
                                                        }}
                                                        className={`w-full text-left px-3 py-1.5 text-[10px] font-mono transition-colors hover:bg-white/5 ${currentAudioTrack === track.id ? 'text-[#00f3ff]' : 'text-white/60'}`}
                                                    >
                                                        {track.name || `Track ${track.id}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Subtitle Track Selector (Desktop) */}
                                {subtitleTracks.length > 0 && (
                                    <div className="hidden sm:block relative group/subs">
                                        <button className="text-white/40 hover:text-white transition-colors p-1" title="Subtitles">
                                            <Subtitles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                        <div className="absolute bottom-full right-0 mb-3 w-44 bg-midnight/95 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden opacity-0 group-hover/subs:opacity-100 pointer-events-none group-hover/subs:pointer-events-auto transition-all shadow-2xl z-50">
                                            <div className="p-2 border-b border-white/5 bg-white/5">
                                                <span className="text-[9px] font-mono text-[#00f3ff] uppercase tracking-widest">Subtitles</span>
                                            </div>
                                            <div className="max-h-40 overflow-y-auto">
                                                <button
                                                    onClick={() => {
                                                        if (hlsRef.current) hlsRef.current.subtitleTrack = -1
                                                    }}
                                                    className={`w-full text-left px-3 py-1.5 text-[10px] font-mono transition-colors hover:bg-white/5 ${currentSubtitleTrack === -1 ? 'text-[#00f3ff]' : 'text-white/60'}`}
                                                >
                                                    OFF
                                                </button>
                                                {subtitleTracks.map((track) => (
                                                    <button
                                                        key={track.id}
                                                        onClick={() => {
                                                            if (hlsRef.current) hlsRef.current.subtitleTrack = track.id
                                                        }}
                                                        className={`w-full text-left px-3 py-1.5 text-[10px] font-mono transition-colors hover:bg-white/5 ${currentSubtitleTrack === track.id ? 'text-[#00f3ff]' : 'text-white/60'}`}
                                                    >
                                                        {track.name || `Subtitle ${track.id}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Visualizer FX Toggle */}
                                <button
                                    onClick={() => setShowVisualizerHUD(!showVisualizerHUD)}
                                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[9px] font-mono border transition-all flex items-center gap-1 ${showVisualizerHUD ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_12px_rgba(0,243,255,0.3)]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/30'}`}
                                    title="Toggle Visualizer HUD"
                                >
                                    <Activity className="w-3 h-3" />
                                    <span>FX</span>
                                </button>

                                {/* Playback Speed */}
                                <button
                                    onClick={cyclePlaybackSpeed}
                                    className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors"
                                    style={{ color: theme.primary, borderColor: `${theme.primary}50`, borderWidth: '1px' }}
                                    title="Playback Speed"
                                >
                                    {playbackRate}x
                                </button>

                                {/* Mobile Options Drawer Button */}
                                <button
                                    onClick={() => setShowMobileSettings(!showMobileSettings)}
                                    className={`lg:hidden p-1.5 rounded-lg border transition-all ${showMobileSettings ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
                                    title="Player Options"
                                >
                                    <Sliders className="w-3.5 h-3.5" />
                                </button>

                                {/* Stats Info (Desktop) */}
                                <button onClick={() => setShowDebug(!showDebug)} className="hidden sm:block text-white/40 hover:text-white transition-colors p-1" title="Stats">
                                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>

                                {/* Fullscreen */}
                                <button onClick={toggleFullscreen} className="text-white/60 hover:text-electric-purple transition-colors p-1" title="Fullscreen">
                                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Settings Drawer / Popover */}
                    {showMobileSettings && (
                        <div className="lg:hidden absolute bottom-24 right-2 left-2 sm:left-auto sm:right-6 sm:w-80 bg-midnight/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl z-50 space-y-3.5 animate-fadeIn">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <div className="flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-neon-cyan" />
                                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Audio & Display</span>
                                </div>
                                <button onClick={() => setShowMobileSettings(false)} className="text-white/40 hover:text-white p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Theme Preset */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Theme Palette</span>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {Object.keys(themes).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setCurrentTheme(t as any)}
                                            className={`px-2 py-1.5 rounded-xl text-[10px] font-mono border transition-all flex items-center justify-center gap-1.5 ${currentTheme === t ? 'border-white/40 bg-white/15 text-white font-bold' : 'border-white/5 bg-white/5 text-white/50'}`}
                                        >
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themes[t as keyof typeof themes].primary }} />
                                            <span className="truncate">{t.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Audio Normalization */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Audio EQ Profile</span>
                                <div className="grid grid-cols-4 gap-1">
                                    {['none', 'night', 'voice', 'ebu'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setAudioNormalization(mode as any)}
                                            className={`py-1.5 text-[9px] font-mono rounded-lg border transition-all uppercase ${audioNormalization === mode ? 'border-neon-cyan/40 bg-neon-cyan/20 text-neon-cyan font-bold' : 'border-white/5 bg-white/5 text-white/50'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Aspect Ratio */}
                            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Aspect Ratio</span>
                                <button
                                    onClick={cycleAspectRatio}
                                    className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white font-bold"
                                >
                                    {aspectRatio.toUpperCase()}
                                </button>
                            </div>
                        </div>
                    )}
                </footer>
            )}

            {/* Help Modal */}
            {showHelp && (
                <div
                    className="absolute inset-0 z-[100] bg-midnight/90 backdrop-blur-xl flex items-center justify-center p-8 transition-all duration-300"
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
                    </div>
                )}

            {/* A-B Loop Overlay / Indicators */}
            {(loopA !== null || loopB !== null) && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 bg-midnight/60 backdrop-blur-md border border-white/10 rounded-full font-mono text-[10px] text-neon-cyan select-none">
                    <div className="flex items-center gap-1">
                        <span className="opacity-50">A:</span>
                        <span>{loopA !== null ? formatTime(loopA as number) : '--:--'}</span>
                    </div>
                    <div className="w-px h-2 bg-white/10 mx-1" />
                    <div className="flex items-center gap-1">
                        <span className="opacity-50">B:</span>
                        <span>{loopB !== null ? formatTime(loopB as number) : '--:--'}</span>
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
})

const AudioVisualizer = ({ 
    analyser, 
    isPlaying = true, 
    mode = 'bar' 
}: { 
    analyser: AnalyserNode | null; 
    isPlaying?: boolean; 
    mode?: 'bar' | 'stage' | 'wave' 
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!canvasRef.current) return

        let animationFrame: number
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const bufferLength = analyser ? analyser.frequencyBinCount : 32
        const dataArray = new Uint8Array(bufferLength)
        let phase = 0

        const draw = () => {
            animationFrame = requestAnimationFrame(draw)
            phase += 0.04

            let hasRealData = false
            if (analyser) {
                analyser.getByteFrequencyData(dataArray)
                for (let i = 0; i < bufferLength; i++) {
                    if (dataArray[i] > 0) {
                        hasRealData = true
                        break
                    }
                }
            }

            if (!hasRealData && isPlaying) {
                for (let i = 0; i < bufferLength; i++) {
                    const harmonic1 = Math.sin(phase * 1.5 + i * 0.22) * 0.5 + 0.5
                    const harmonic2 = Math.cos(phase * 2.7 + i * 0.35) * 0.5 + 0.5
                    const harmonic3 = Math.sin(phase * 0.9 + i * 0.12) * 0.5 + 0.5
                    const val = (harmonic1 * 0.5 + harmonic2 * 0.3 + harmonic3 * 0.2) * 210 + 25
                    dataArray[i] = Math.min(255, Math.max(10, val))
                }
            } else if (!hasRealData && !isPlaying) {
                dataArray.fill(4)
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (mode === 'stage') {
                const numBars = 32
                const barWidth = Math.max(2, (canvas.width / numBars) - 4)
                
                for (let i = 0; i < numBars; i++) {
                    const dataIdx = Math.floor((i / numBars) * bufferLength)
                    const val = dataArray[dataIdx] / 255
                    const barHeight = Math.max(4, val * (canvas.height - 8))
                    const x = i * (barWidth + 4) + 2
                    const y = canvas.height - barHeight

                    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0)
                    gradient.addColorStop(0, 'rgba(0, 243, 255, 0.4)')
                    gradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.9)')
                    gradient.addColorStop(1, 'rgba(188, 19, 254, 1)')

                    ctx.fillStyle = gradient
                    ctx.shadowColor = '#00f3ff'
                    ctx.shadowBlur = isPlaying ? 8 : 0
                    ctx.fillRect(x, y, barWidth, barHeight)

                    // Peak line
                    ctx.fillStyle = '#ffffff'
                    ctx.fillRect(x, Math.max(0, y - 2), barWidth, 2)
                }
            } else {
                const barWidth = (canvas.width / bufferLength) * 2
                let x = 0
                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * canvas.height
                    const opacity = dataArray[i] / 255
                    ctx.fillStyle = `rgba(0, 243, 255, ${Math.max(0.2, opacity * 0.6)})`
                    ctx.fillRect(x, canvas.height - barHeight, Math.max(1, barWidth - 1), barHeight)
                    x += barWidth
                }
            }
        }

        draw()
        return () => cancelAnimationFrame(animationFrame)
    }, [analyser, isPlaying, mode])

    return (
        <canvas 
            ref={canvasRef} 
            className={mode === 'stage' ? "w-full h-full" : "w-64 h-full"} 
            width={mode === 'stage' ? 512 : 256} 
            height={mode === 'stage' ? 96 : 48} 
        />
    )
}
