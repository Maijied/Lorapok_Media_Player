import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LorapokPlayer, Logo } from 'lorapok-player'
import type { LorapokPlayerRef } from 'lorapok-player'
import { Download, Zap, Globe, Monitor, ChevronDown, Code2, Layers, Play, Smartphone, Laptop, Radio, Sparkles, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react'

interface DownloadItem {
    url: string
    size: string
    label: string
    desc: string
}

interface PlatformDownloads {
    default: string
    size: string
    [key: string]: string | DownloadItem
}

interface Manifest {
    version: string
    releaseName: string
    updatedAt: string
    platforms: {
        android: PlatformDownloads
        linux: PlatformDownloads
        windows: PlatformDownloads
        macos: PlatformDownloads
        extension: PlatformDownloads
    }
}

const DEFAULT_MANIFEST: Manifest = {
    version: "1.5.0",
    releaseName: "Lorapok 1.5.0 Neural Release",
    updatedAt: new Date().toISOString(),
    platforms: {
        android: {
            default: "/downloads/lorapok-player-1.5.0-universal.apk",
            size: "2.8 MB",
            universal: {
                url: "/downloads/lorapok-player-1.5.0-universal.apk",
                size: "2.8 MB",
                label: "Universal APK",
                desc: "Compatible with all Android phones, tablets & Android TV"
            },
            arm64: {
                url: "/downloads/lorapok-player-1.5.0-arm64-v8a.apk",
                size: "2.8 MB",
                label: "ARM64-v8a APK",
                desc: "Optimized for modern Android smartphones"
            },
            armv7: {
                url: "/downloads/lorapok-player-1.5.0-armeabi-v7a.apk",
                size: "2.8 MB",
                label: "ARMv7 APK",
                desc: "For legacy Android devices & TV sticks"
            },
            x86_64: {
                url: "/downloads/lorapok-player-1.5.0-x86_64.apk",
                size: "2.8 MB",
                label: "x86_64 APK",
                desc: "For Android emulators and Chromebooks"
            },
            aab: {
                url: "/downloads/lorapok-player-1.5.0.aab",
                size: "3.3 MB",
                label: "Google Play Bundle (.aab)",
                desc: "Signed App Bundle for Google Play deployment"
            }
        },
        linux: {
            default: "/downloads/lorapok-player-1.5.0-x86_64.AppImage",
            size: "254 MB",
            appimage: {
                url: "/downloads/lorapok-player-1.5.0-x86_64.AppImage",
                size: "254 MB",
                label: "Linux AppImage",
                desc: "Self-contained portable binary for Ubuntu, Fedora, Arch, etc."
            },
            deb: {
                url: "/downloads/lorapok-player-1.5.0-amd64.deb",
                size: "154 MB",
                label: "Debian / Ubuntu (.deb)",
                desc: "Native dpkg package installer"
            }
        },
        windows: {
            default: "https://github.com/Maijied/Lorapok_Media_Player/releases/latest",
            size: "120 MB",
            exe: {
                url: "https://github.com/Maijied/Lorapok_Media_Player/releases/latest",
                size: "120 MB",
                label: "Windows 64-bit Installer (.exe)",
                desc: "Universal installer for Windows 10 & 11"
            }
        },
        macos: {
            default: "https://github.com/Maijied/Lorapok_Media_Player/releases/latest",
            size: "130 MB",
            dmg: {
                url: "https://github.com/Maijied/Lorapok_Media_Player/releases/latest",
                size: "130 MB",
                label: "macOS Universal DMG",
                desc: "Native Apple Silicon (M1/M2/M3) & Intel package"
            }
        },
        extension: {
            default: "/downloads/lorapok-extension-1.5.0.zip",
            size: "425 KB",
            zip: {
                url: "/downloads/lorapok-extension-1.5.0.zip",
                size: "425 KB",
                label: "Chrome Extension (.zip)",
                desc: "Manifest V3 Stream Interceptor & Video Grabber"
            }
        }
    }
}

const MEDIA_PRESETS = [
    {
        id: 'mp4',
        name: 'Neon Waves',
        category: 'Video',
        type: 'MP4 (H.264)',
        url: '/demos/neon_waves.mp4',
        desc: '1080p RGB spectrum color cycle benchmark with AAC 440Hz tone'
    },
    {
        id: 'hls',
        name: 'Cyber Grid Adaptive',
        category: 'Adaptive Stream',
        type: 'HLS (.m3u8)',
        url: '/demos/hls/cyber_grid.m3u8',
        desc: 'Multi-segment HLS broadcast stream with live segment indexing'
    },
    {
        id: 'dash',
        name: 'Fractal Engine',
        category: 'Adaptive Stream',
        type: 'DASH (.mpd)',
        url: '/demos/dash/fractal_dash.mpd',
        desc: 'MPEG-DASH fractal stream with zero-rebuffer switching'
    },
    {
        id: 'webm',
        name: 'Cyber Matrix',
        category: 'Video',
        type: 'WebM (VP9)',
        url: '/demos/cyber_matrix.webm',
        desc: 'Cellular automata generative video stream with pink noise audio'
    },
    {
        id: 'flac',
        name: 'Neural 528Hz Tone',
        category: 'Lossless Audio',
        type: 'FLAC (24-bit)',
        url: '/demos/audio_lossless.flac',
        desc: 'Audiophile lossless pure sinusoidal tone for audio visualizer testing'
    },
    {
        id: 'aac',
        name: 'Synthwave 432Hz Hi-Fi',
        category: 'Audio',
        type: 'AAC (320kbps)',
        url: '/demos/audio_synthwave.aac',
        desc: 'High-bitrate studio master stream with dynamic stereo panning'
    },
    {
        id: 'wav',
        name: 'Quantum Pulse 396Hz',
        category: 'Audio',
        type: 'WAV (PCM)',
        url: '/demos/audio_pulse.wav',
        desc: 'Uncompressed PCM 48kHz audio waveform demo'
    },
    {
        id: 'live-akamai',
        name: 'Akamai Live Stream',
        category: 'Live Broadcast',
        type: 'HLS Live CDN',
        url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
        desc: 'Production Akamai CDN live stream test'
    }
]

const FAQ_ITEMS = [
    { q: "What media formats does Lorapok support?", a: "Lorapok natively decodes HLS (.m3u8), MPEG-DASH (.mpd), MP4 (H.264/HEVC/AV1), WebM (VP8/VP9/AV1), MKV, FLV, AVI, WMV, MOV, FLAC, AAC, MP3, OGG, and WAV with hardware acceleration." },
    { q: "How do I install the Android / Android TV version?", a: "Download the Universal APK directly from the website buttons or GitHub Releases. Sideload the APK onto your Android phone, tablet, or Android TV box. It includes D-Pad Leanback remote control navigation and mobile gesture scrubbing." },
    { q: "Is hardware acceleration enabled by default?", a: "Yes. Lorapok dynamically queries GPU hardware codecs for zero-lag rasterization and buttery-smooth 4K/8K 60fps media playback." },
    { q: "How do I embed Lorapok into my React web application?", a: "Run `npm install lorapok-player` and import `{ LorapokPlayer }` from 'lorapok-player'. It includes built-in ambient lighting, audio equalizer, track selectors, and full TypeScript declarations." },
    { q: "Is Lorapok open source and free for commercial use?", a: "Yes! Lorapok is released under the permissive MIT license for personal and commercial usage." }
]

function App() {
    const [manifest, setManifest] = useState<Manifest>(DEFAULT_MANIFEST)
    const [detectedOS, setDetectedOS] = useState<'android' | 'linux' | 'windows' | 'macos' | 'extension'>('android')
    const [demoUrl, setDemoUrl] = useState<string>(MEDIA_PRESETS[0].url)
    const [customUrl, setCustomUrl] = useState("")
    const [activeFaq, setActiveFaq] = useState<number | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('All')
    const [copiedNpm, setCopiedNpm] = useState(false)
    const [selectedAndroidVariant, setSelectedAndroidVariant] = useState<'universal' | 'arm64' | 'armv7' | 'x86_64' | 'aab'>('universal')
    const playerRef = useRef<LorapokPlayerRef>(null)

    // Load download manifest
    useEffect(() => {
        fetch('/downloads/manifest.json')
            .then(res => res.json())
            .then(data => {
                if (data && data.platforms) {
                    setManifest(data)
                }
            })
            .catch(() => {
                // Keep default manifest
            })
    }, [])

    // Detect user OS
    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase()
        if (ua.includes('android')) {
            setDetectedOS('android')
        } else if (ua.includes('linux')) {
            setDetectedOS('linux')
        } else if (ua.includes('win')) {
            setDetectedOS('windows')
        } else if (ua.includes('mac')) {
            setDetectedOS('macos')
        } else {
            setDetectedOS('android')
        }
    }, [])

    const handleCustomUrlPlay = (e: React.FormEvent) => {
        e.preventDefault()
        if (customUrl.trim()) {
            playerRef.current?.load(customUrl.trim())
            setDemoUrl(customUrl.trim())
        }
    }

    const copyNpmCommand = () => {
        navigator.clipboard.writeText('npm install lorapok-player')
        setCopiedNpm(true)
        setTimeout(() => setCopiedNpm(false), 2000)
    }

    const categories = ['All', 'Video', 'Adaptive Stream', 'Lossless Audio', 'Audio', 'Live Broadcast']
    const filteredPresets = selectedCategory === 'All' 
        ? MEDIA_PRESETS 
        : MEDIA_PRESETS.filter(p => p.category === selectedCategory)

    // Primary Download CTA based on OS
    const primaryDownloadInfo = () => {
        if (detectedOS === 'android') {
            const variant = (manifest.platforms.android[selectedAndroidVariant] || manifest.platforms.android.universal) as DownloadItem
            return {
                label: `Download APK for Android`,
                sub: `${manifest.version} • ${variant.size} • Signed Universal / ARM64`,
                url: variant.url,
                icon: Smartphone
            }
        }
        if (detectedOS === 'linux') {
            const variant = manifest.platforms.linux.appimage as DownloadItem
            return {
                label: `Download Linux AppImage`,
                sub: `${manifest.version} • ${variant.size} • Universal Portable`,
                url: variant.url,
                icon: Laptop
            }
        }
        if (detectedOS === 'windows') {
            return {
                label: `Download for Windows`,
                sub: `${manifest.version} • 120 MB • Windows 10/11 64-bit`,
                url: manifest.platforms.windows.default,
                icon: Laptop
            }
        }
        if (detectedOS === 'macos') {
            return {
                label: `Download for macOS`,
                sub: `${manifest.version} • 130 MB • Universal Apple Silicon / Intel`,
                url: manifest.platforms.macos.default,
                icon: Laptop
            }
        }
        return {
            label: `Download APK for Android`,
            sub: `${manifest.version} • 2.8 MB • Universal Release`,
            url: manifest.platforms.android.default,
            icon: Smartphone
        }
    }

    const primaryCTA = primaryDownloadInfo()

    return (
        <div className="min-h-screen bg-[#030305] text-white selection:bg-neon-cyan selection:text-midnight font-sans overflow-x-hidden">
            {/* Ambient Lighting Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#00f3ff]/10 rounded-full blur-[160px]" />
                <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] bg-[#bc13fe]/10 rounded-full blur-[180px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[40vw] bg-[#00f3ff]/5 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(188,19,254,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
            </div>

            {/* Top Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto backdrop-blur-xl border-b border-white/5 sticky top-0 bg-[#030305]/70">
                <div className="flex items-center gap-3">
                    <Logo className="w-9 h-9" />
                    <div>
                        <span className="font-mono font-black tracking-tight text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#bc13fe]">
                            LORAPOK
                        </span>
                        <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-cyan-300">
                            v{manifest.version}
                        </span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-white/70">
                    <a href="#demo" className="hover:text-neon-cyan transition-colors uppercase">Interactive Lab</a>
                    <a href="#features" className="hover:text-neon-cyan transition-colors uppercase">Engine</a>
                    <a href="#downloads" className="hover:text-neon-cyan transition-colors uppercase">Downloads</a>
                    <a href="#developer" className="hover:text-neon-cyan transition-colors uppercase">SDK & API</a>
                    <a href="#faq" className="hover:text-neon-cyan transition-colors uppercase">FAQ</a>
                </div>

                <div className="flex items-center gap-3">
                    <a 
                        href="#downloads" 
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] text-midnight font-mono font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] flex items-center gap-2"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Get v{manifest.version}</span>
                    </a>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col gap-28">

                {/* Hero Section */}
                <section className="flex flex-col items-center text-center gap-8 pt-8 min-h-[65vh] justify-center relative">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00f3ff]/30 to-[#bc13fe]/30 blur-3xl rounded-full scale-150 animate-pulse" />
                        <Logo className="w-36 h-36 md:w-44 md:h-44 relative z-10 drop-shadow-[0_0_60px_rgba(0,243,255,0.4)]" />
                    </div>

                    <div className="space-y-4 max-w-4xl px-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
                            <span className="text-[11px] font-mono tracking-widest uppercase text-white/80">
                                Neural Supercomputing Media Engine • Release v{manifest.version}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.95]">
                            The Universal<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f3ff] to-[#bc13fe]">
                                Media Engine
                            </span>
                        </h1>
                        <p className="text-base md:text-xl text-white/70 font-mono max-w-2xl mx-auto leading-relaxed">
                            Hardware-accelerated playback for Android, Android TV, Desktop, and Web. Zero-rebuffer adaptive streaming with biological ambient UI.
                        </p>
                    </div>

                    {/* Primary Dynamic Download Button */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                        <a
                            href={primaryCTA.url}
                            download
                            className="group relative px-8 py-5 rounded-2xl bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] text-midnight font-bold transition-all duration-300 shadow-[0_0_40px_rgba(0,243,255,0.4)] hover:shadow-[0_0_60px_rgba(188,19,254,0.6)] hover:scale-105 active:scale-95 flex items-center gap-4 text-left"
                        >
                            <primaryCTA.icon className="w-8 h-8 text-midnight" />
                            <div>
                                <div className="font-mono text-sm font-black uppercase tracking-wider">{primaryCTA.label}</div>
                                <div className="text-[11px] text-midnight/80 font-mono font-medium">{primaryCTA.sub}</div>
                            </div>
                        </a>

                        <a
                            href="#demo"
                            className="px-8 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-mono text-xs uppercase tracking-widest transition-all backdrop-blur-md flex items-center gap-3"
                        >
                            <Play className="w-4 h-4 text-neon-cyan" />
                            <span>Test Live Media Player</span>
                        </a>
                    </div>

                    {/* Platform Badge Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-white/50">
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Android 8.0+ & TV Leanback</div>
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Linux AppImage / DEB</div>
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Windows 10/11 & macOS</div>
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Standalone React NPM SDK</div>
                    </div>
                </section>

                {/* Interactive Media Laboratory (Test All Formats) */}
                <section id="demo" className="scroll-mt-28 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                        <div>
                            <div className="flex items-center gap-2 text-neon-cyan font-mono text-xs uppercase tracking-widest mb-1">
                                <Radio className="w-4 h-4 animate-pulse" /> Live Interactive Laboratory
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                                Test Media Capabilities
                            </h2>
                            <p className="text-white/50 text-sm font-mono mt-1">
                                Test any video format, adaptive stream, or lossless audio file in real-time.
                            </p>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${selectedCategory === cat ? 'bg-neon-cyan text-midnight font-bold shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Stream Input Box */}
                    <form onSubmit={handleCustomUrlPlay} className="flex flex-col sm:flex-row gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-xl">
                        <div className="relative flex-1 flex items-center">
                            <Globe className="w-5 h-5 text-white/40 absolute left-4 pointer-events-none" />
                            <input
                                type="text"
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                placeholder="Paste custom media URL (.m3u8, .mpd, .mp4, .webm, .flac, .mp3, .wav)..."
                                className="w-full bg-transparent pl-12 pr-4 py-3 text-sm font-mono text-white placeholder:text-white/30 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-neon-cyan text-midnight font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-current" /> Load Stream
                        </button>
                    </form>

                    {/* Media Presets Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredPresets.map((preset) => {
                            const isSelected = demoUrl === preset.url
                            return (
                                <button
                                    key={preset.id}
                                    onClick={() => {
                                        setDemoUrl(preset.url)
                                        playerRef.current?.load(preset.url)
                                    }}
                                    className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between gap-3 group relative overflow-hidden ${isSelected ? 'bg-neon-cyan/10 border-neon-cyan shadow-[0_0_25px_rgba(0,243,255,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${isSelected ? 'bg-neon-cyan text-midnight' : 'bg-white/10 text-white/70'}`}>
                                                {preset.type}
                                            </span>
                                            {isSelected && <span className="w-2 h-2 rounded-full bg-neon-cyan animate-ping" />}
                                        </div>
                                        <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-neon-cyan' : 'text-white group-hover:text-white'}`}>
                                            {preset.name}
                                        </h4>
                                        <p className="text-[11px] text-white/50 font-mono line-clamp-2 mt-1">
                                            {preset.desc}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-mono text-neon-cyan/70 group-hover:text-neon-cyan pt-2 border-t border-white/5">
                                        <Play className="w-3 h-3 fill-current" /> Instant Play
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Embedded Lorapok Player Container */}
                    <div className="aspect-video w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-black p-2 bg-gradient-to-br from-white/10 to-transparent">
                        <div className="w-full h-full rounded-2xl overflow-hidden relative border border-white/5">
                            <LorapokPlayer
                                ref={playerRef}
                                src={demoUrl}
                                className="w-full h-full"
                                autoPlay={false}
                            />
                        </div>
                    </div>
                </section>

                {/* Direct Downloads Hub */}
                <section id="downloads" className="scroll-mt-28 flex flex-col gap-10">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono uppercase tracking-widest">
                            <Download className="w-4 h-4" /> Official Release Binaries
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            Download Lorapok Media Player
                        </h2>
                        <p className="text-white/50 font-mono text-sm max-w-xl mx-auto">
                            Direct local download links for all platforms, architectures, and store packages.
                        </p>
                    </div>

                    {/* Android Showcase Card */}
                    <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/15 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                            <div className="space-y-4 max-w-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight">Android & Android TV</h3>
                                        <p className="text-xs font-mono text-green-400">Version {manifest.version} • Direct APK & AAB Packages</p>
                                    </div>
                                </div>
                                <p className="text-white/70 text-sm font-mono leading-relaxed">
                                    Full touch gesture scrubbing, screen brightness swipe, fine volume tuning, and TV Leanback remote control support.
                                </p>

                                {/* Variant Selector */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                                    {[
                                        { key: 'universal', label: 'Universal APK', sub: 'All Devices (2.8 MB)' },
                                        { key: 'arm64', label: 'ARM64-v8a', sub: 'Modern Phones (2.8 MB)' },
                                        { key: 'armv7', label: 'ARMv7', sub: 'Legacy / TV Sticks (2.8 MB)' },
                                        { key: 'x86_64', label: 'x86_64', sub: 'Emulators (2.8 MB)' },
                                        { key: 'aab', label: 'App Bundle (.aab)', sub: 'Google Play (3.3 MB)' }
                                    ].map((v) => (
                                        <button
                                            key={v.key}
                                            onClick={() => setSelectedAndroidVariant(v.key as any)}
                                            className={`p-3 rounded-xl text-left border text-xs font-mono transition-all ${selectedAndroidVariant === v.key ? 'border-green-400 bg-green-500/10 text-white font-bold' : 'border-white/10 bg-black/40 text-white/60 hover:border-white/30'}`}
                                        >
                                            <div className="font-bold">{v.label}</div>
                                            <div className="text-[10px] opacity-60 mt-0.5">{v.sub}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-center sm:items-end gap-3 min-w-[280px]">
                                {(() => {
                                    const activeItem = (manifest.platforms.android[selectedAndroidVariant] || manifest.platforms.android.universal) as DownloadItem
                                    return (
                                        <>
                                            <a
                                                href={activeItem.url}
                                                download
                                                className="w-full py-5 px-8 rounded-2xl bg-green-400 hover:bg-white text-midnight font-mono font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(74,222,128,0.4)] flex items-center justify-center gap-3 text-center"
                                            >
                                                <Download className="w-5 h-5" />
                                                <span>Download {activeItem.label}</span>
                                            </a>
                                            <span className="text-[11px] font-mono text-white/50">
                                                Size: {activeItem.size} • Direct Download
                                            </span>
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Multi-Platform Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Linux Card */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between gap-6 hover:border-neon-cyan/40 transition-all">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                                    <Laptop className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold uppercase">Linux</h3>
                                <p className="text-xs font-mono text-white/60 leading-relaxed">
                                    Compatible with Ubuntu, Debian, Fedora, Arch, and Linux Mint.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <a
                                    href={(manifest.platforms.linux.appimage as DownloadItem).url}
                                    download
                                    className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-neon-cyan hover:text-midnight font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between border border-white/10"
                                >
                                    <span>Download AppImage</span>
                                    <span className="opacity-60 text-[10px]">{(manifest.platforms.linux.appimage as DownloadItem).size}</span>
                                </a>
                                <a
                                    href={(manifest.platforms.linux.deb as DownloadItem).url}
                                    download
                                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/15 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-between border border-white/5 text-white/80"
                                >
                                    <span>Download Debian (.deb)</span>
                                    <span className="opacity-60 text-[10px]">{(manifest.platforms.linux.deb as DownloadItem).size}</span>
                                </a>
                            </div>
                        </div>

                        {/* Windows & Mac Card */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between gap-6 hover:border-electric-purple/40 transition-all">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center text-purple-300">
                                    <Monitor className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold uppercase">Desktop Releases</h3>
                                <p className="text-xs font-mono text-white/60 leading-relaxed">
                                    Official binaries for Windows 64-bit and Apple Silicon / Intel macOS.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <a
                                    href={manifest.platforms.windows.default}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white hover:text-black font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between border border-white/10"
                                >
                                    <span>Windows 64-bit (.exe)</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </a>
                                <a
                                    href={manifest.platforms.macos.default}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/15 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-between border border-white/5 text-white/80"
                                >
                                    <span>macOS Universal (.dmg)</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        {/* Chrome Extension Card */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between gap-6 hover:border-cyan-400/40 transition-all">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold uppercase">Chrome Extension</h3>
                                <p className="text-xs font-mono text-white/60 leading-relaxed">
                                    Manifest V3 Stream Interceptor for web video extraction.
                                </p>
                            </div>
                            <a
                                href={(manifest.platforms.extension.zip as DownloadItem).url}
                                download
                                className="w-full py-3 px-4 rounded-xl bg-cyan-400 hover:bg-white text-midnight font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                            >
                                <span>Download Extension (.zip)</span>
                                <span className="opacity-80 text-[10px]">{(manifest.platforms.extension.zip as DownloadItem).size}</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Developer SDK & NPM Section */}
                <section id="developer" className="scroll-mt-28 bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 backdrop-blur-xl flex flex-col lg:flex-row gap-10">
                    <div className="lg:w-1/2 space-y-6 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-electric-purple font-mono text-xs uppercase tracking-widest">
                            <Code2 className="w-4 h-4" /> Standalone React NPM Library
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                            Build with @lorapok/player
                        </h2>
                        <p className="text-white/60 font-mono text-sm leading-relaxed">
                            Embed the entire Lorapok playback engine into your own React web applications. Includes hardware decoding, ambient lighting, custom controls, and TypeScript definitions.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <button
                                onClick={copyNpmCommand}
                                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-mono text-xs flex items-center gap-3 transition-all"
                            >
                                {copiedNpm ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-neon-cyan" />}
                                <span>npm install lorapok-player</span>
                            </button>

                            <a
                                href="https://www.npmjs.com/package/lorapok-player"
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-3 rounded-xl bg-white text-midnight font-mono font-bold text-xs uppercase tracking-wider hover:bg-neon-cyan transition-all flex items-center gap-2"
                            >
                                <span>NPM Package</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    <div className="lg:w-1/2 bg-[#09090c] border border-white/10 rounded-2xl p-6 font-mono text-xs text-white/80 leading-relaxed overflow-x-auto">
                        <div className="text-white/30 mb-2">// App.tsx</div>
                        <div><span className="text-neon-cyan">import</span> {'{ LorapokPlayer }'} <span className="text-neon-cyan">from</span> <span className="text-green-400">'lorapok-player'</span>;</div>
                        <div><span className="text-neon-cyan">import</span> <span className="text-green-400">'lorapok-player/style.css'</span>;</div>
                        <br />
                        <div><span className="text-neon-cyan">function</span> <span className="text-blue-400">MediaPlayerView</span>() {'{'}</div>
                        <div className="pl-4"><span className="text-neon-cyan">return</span> (</div>
                        <div className="pl-8 text-white/90">{'<LorapokPlayer'}</div>
                        <div className="pl-12 text-electric-purple">src=<span className="text-green-400">"https://example.com/stream.m3u8"</span></div>
                        <div className="pl-12 text-electric-purple">autoPlay=<span className="text-orange-400">true</span></div>
                        <div className="pl-12 text-electric-purple">ambientLighting=<span className="text-orange-400">true</span></div>
                        <div className="pl-8 text-white/90">{'/>'}</div>
                        <div className="pl-4">);</div>
                        <div>{'}'}</div>
                    </div>
                </section>

                {/* Engine Capabilities */}
                <section id="features" className="scroll-mt-28 space-y-12">
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                            Engine Capabilities
                        </h2>
                        <p className="text-white/50 font-mono text-sm">
                            Engineered for uncompromising fidelity across every screen size.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Smartphone, title: "Android Mobile Gestures", desc: "Left vertical swipe for brightness (0.2x-2.0x), right swipe for volume (0-150%), and double tap seek with HUD." },
                            { icon: Monitor, title: "Android TV Leanback", desc: "Full D-Pad remote control key mapping, TV banner integration, and non-touchscreen compatibility." },
                            { icon: Globe, title: "Universal Adaptive HLS/DASH", desc: "Zero-rebuffer track switching, multi-bitrate segment caching, and live low-latency stream playback." },
                            { icon: Layers, title: "Biological Ambient Glow", desc: "Real-time canvas color extraction synchronizes responsive ambient halo with media frames." },
                            { icon: Zap, title: "GPU Hardware Acceleration", desc: "Direct hardware decoding pipeline for effortless 4K/8K 60fps high-bitrate video playback." },
                            { icon: ShieldCheck, title: "Signed Store Bundles", desc: "Universal release APKs, architecture-split APKs (ARM64/ARMv7/x86_64), and signed Google Play AAB." }
                        ].map((feat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-3 hover:border-neon-cyan/40 transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neon-cyan">
                                    <feat.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold uppercase">{feat.title}</h3>
                                <p className="text-white/60 text-xs font-mono leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="scroll-mt-28 max-w-3xl mx-auto w-full space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {FAQ_ITEMS.map((item, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                                <button
                                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                    className="w-full p-5 text-left flex justify-between items-center font-bold text-sm hover:bg-white/5 transition-colors"
                                >
                                    <span>{item.q}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${activeFaq === idx ? 'rotate-180 text-neon-cyan' : 'text-white/40'}`} />
                                </button>
                                <AnimatePresence>
                                    {activeFaq === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-5 pb-5 text-white/60 font-mono text-xs leading-relaxed border-t border-white/5 pt-3"
                                        >
                                            {item.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-[#030305] text-xs font-mono text-white/40 mt-20">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Logo className="w-6 h-6 grayscale opacity-60" />
                        <span>A product of Lorapok Labs • &copy; 2026</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="https://github.com/Maijied/Lorapok_Media_Player" target="_blank" rel="noreferrer" className="hover:text-neon-cyan transition-colors">GitHub Repository</a>
                        <a href="https://lorapok.tech" target="_blank" rel="noreferrer" className="hover:text-neon-cyan transition-colors">Lorapok Labs</a>
                        <a href="https://www.npmjs.com/package/lorapok-player" target="_blank" rel="noreferrer" className="hover:text-neon-cyan transition-colors">NPM Package</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default App
