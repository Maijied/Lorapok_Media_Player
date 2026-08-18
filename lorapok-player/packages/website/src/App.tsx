import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LorapokPlayer, Logo } from 'lorapok-player'
import type { LorapokPlayerRef } from 'lorapok-player'
import { 
    Download, Zap, Globe, Monitor, ChevronDown, Code2, Layers, Play, Smartphone, 
    Laptop, Radio, Sparkles, ArrowRight, ShieldCheck, Copy, Check, ExternalLink, 
    Compass, Shield, FileText, CheckCircle2, Box, Cpu, HardDrive
} from 'lucide-react'

interface DownloadItem {
    url: string
    size: string
    label: string
    badge?: string
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
        extensions: {
            [key: string]: DownloadItem
        }
    }
}

const GITHUB_RELEASE_BASE = "https://github.com/Maijied/Lorapok_Media_Player/releases/download/v1.5.0"

const DEFAULT_MANIFEST: Manifest = {
    version: "1.5.0",
    releaseName: "Lorapok 1.5.0 Neural Release",
    updatedAt: new Date().toISOString(),
    platforms: {
        windows: {
            default: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Windows-Setup-1.5.0.exe`,
            size: "78 MB",
            installer: {
                url: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Windows-Setup-1.5.0.exe`,
                size: "78 MB",
                label: "Windows Installer (.exe)",
                badge: "INSTALLABLE",
                desc: "Complete installer for Windows 10 & 11 (64-bit)"
            },
            portable: {
                url: `${GITHUB_RELEASE_BASE}/LorapokMediaPlayer-Windows-Setup-1.5.0.exe`,
                size: "78 MB",
                label: "Windows Standalone (.exe)",
                badge: "PORTABLE",
                desc: "Zero-install standalone binary for USB / portable drives"
            }
        },
        linux: {
            default: "/downloads/lorapok-player-1.5.0-x86_64.AppImage",
            size: "108 MB",
            portable: {
                url: "/downloads/lorapok-player-1.5.0-x86_64.AppImage",
                size: "108 MB",
                label: "Linux AppImage",
                badge: "PORTABLE",
                desc: "Self-contained universal executable for all Linux distributions"
            },
            deb: {
                url: "/downloads/lorapok-player-1.5.0-amd64.deb",
                size: "70 MB",
                label: "Debian / Ubuntu (.deb)",
                badge: "INSTALLABLE",
                desc: "Native APT package installer with desktop integration"
            }
        },
        macos: {
            default: `${GITHUB_RELEASE_BASE}/Lorapok-Media-Player-1.5.0-arm64.dmg`,
            size: "96 MB",
            dmgArm: {
                url: `${GITHUB_RELEASE_BASE}/Lorapok-Media-Player-1.5.0-arm64.dmg`,
                size: "96 MB",
                label: "macOS Apple Silicon (.dmg)",
                badge: "INSTALLABLE",
                desc: "Optimized for Apple M1, M2, M3, M4 Macs"
            },
            dmgIntel: {
                url: `${GITHUB_RELEASE_BASE}/Lorapok-Media-Player-1.5.0.dmg`,
                size: "96 MB",
                label: "macOS Intel (.dmg)",
                badge: "INSTALLABLE",
                desc: "For Intel-based Mac systems"
            },
            zipPortable: {
                url: `${GITHUB_RELEASE_BASE}/Lorapok-Media-Player-1.5.0-arm64-mac.zip`,
                size: "97 MB",
                label: "macOS Portable (.zip)",
                badge: "PORTABLE",
                desc: "Direct drag-and-drop portable application archive"
            }
        },
        android: {
            default: "/downloads/lorapok-player-1.5.0-universal.apk",
            size: "2.8 MB",
            universal: {
                url: "/downloads/lorapok-player-1.5.0-universal.apk",
                size: "2.8 MB",
                label: "Universal APK",
                badge: "INSTALLABLE",
                desc: "Compatible with all Android phones, tablets & TV"
            },
            arm64: {
                url: "/downloads/lorapok-player-1.5.0-arm64-v8a.apk",
                size: "2.8 MB",
                label: "ARM64-v8a APK",
                badge: "INSTALLABLE",
                desc: "Native 64-bit performance for modern Android flagships"
            },
            armv7: {
                url: "/downloads/lorapok-player-1.5.0-armeabi-v7a.apk",
                size: "2.8 MB",
                label: "ARMv7 APK",
                badge: "INSTALLABLE",
                desc: "For legacy Android devices & TV sticks"
            },
            x86_64: {
                url: "/downloads/lorapok-player-1.5.0-x86_64.apk",
                size: "2.8 MB",
                label: "x86_64 APK",
                badge: "INSTALLABLE",
                desc: "For Android emulators and ChromeOS"
            },
            aab: {
                url: "/downloads/lorapok-player-1.5.0.aab",
                size: "3.3 MB",
                label: "Google Play Bundle (.aab)",
                badge: "STORE BUNDLE",
                desc: "Signed Android App Bundle for Store deployment"
            }
        },
        extensions: {
            firefoxXpi: {
                url: "/downloads/lorapok-extension-firefox-1.5.0.xpi",
                size: "428 KB",
                label: "Firefox Add-on (.xpi)",
                badge: "AMO READY",
                desc: "Mozilla Firefox Add-ons (AMO) installable package"
            },
            firefoxZip: {
                url: "/downloads/lorapok-extension-firefox-1.5.0.zip",
                size: "428 KB",
                label: "Firefox Source (.zip)",
                badge: "AMO ARCHIVE",
                desc: "Firefox Developer Edition / AMO submission archive"
            },
            chromeZip: {
                url: "/downloads/lorapok-extension-chrome-1.5.0.zip",
                size: "428 KB",
                label: "Google Chrome (.zip)",
                badge: "CHROME MV3",
                desc: "Chrome Web Store / Chromium unpacked extension"
            },
            edgeZip: {
                url: "/downloads/lorapok-extension-edge-1.5.0.zip",
                size: "428 KB",
                label: "Microsoft Edge (.zip)",
                badge: "EDGE ADD-ONS",
                desc: "Microsoft Edge Add-ons Store package"
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
    { q: "What is the difference between Portable and Installable versions?", a: "Installable versions (.exe setup, .deb) register system protocol handlers (lorapok://) and start menu shortcuts. Portable versions (AppImage, Standalone .exe, .zip) run without installation or administrative rights directly from any USB or directory." },
    { q: "How do I install the Android / Android TV version?", a: "Download the Universal APK directly from the website buttons or GitHub Releases. Sideload the APK onto your Android phone, tablet, or Android TV box. It includes D-Pad Leanback remote control navigation and mobile gesture scrubbing." },
    { q: "How do I install the browser extension on Firefox / Chrome?", a: "For Firefox, download the .xpi file and install it directly or submit via AMO. For Chrome/Edge, load unpacked extension or install the provided .zip. It sniffs videos on any page and opens them in Lorapok." },
    { q: "How do I embed Lorapok into my React web application?", a: "Run `npm install lorapok-player` and import `{ LorapokPlayer }` from 'lorapok-player'. It includes built-in ambient lighting, audio equalizer, track selectors, and full TypeScript declarations." },
    { q: "Is Lorapok open source and free for commercial use?", a: "Yes! Lorapok is released under the permissive MIT license for personal and commercial usage." }
]

export function App() {
    const [manifest, setManifest] = useState<Manifest>(DEFAULT_MANIFEST)
    const [detectedOS, setDetectedOS] = useState<'android' | 'linux' | 'windows' | 'macos'>('android')
    const [demoUrl, setDemoUrl] = useState<string>(MEDIA_PRESETS[0].url)
    const [customUrl, setCustomUrl] = useState("")
    const [activeFaq, setActiveFaq] = useState<number | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('All')
    const [copiedNpm, setCopiedNpm] = useState(false)
    const [selectedAndroidVariant, setSelectedAndroidVariant] = useState<'universal' | 'arm64' | 'armv7' | 'x86_64' | 'aab'>('universal')
    const [selectedWindowsType, setSelectedWindowsType] = useState<'installer' | 'portable'>('installer')
    const [selectedLinuxType, setSelectedLinuxType] = useState<'portable' | 'deb'>('portable')
    const [selectedMacType, setSelectedMacType] = useState<'dmgArm' | 'dmgIntel' | 'zipPortable'>('dmgArm')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
                sub: `${manifest.version} • ${variant.size} • Signed Universal & ARM64`,
                url: variant.url,
                icon: Smartphone
            }
        }
        if (detectedOS === 'linux') {
            const variant = (manifest.platforms.linux.portable || manifest.platforms.linux.appimage) as DownloadItem
            return {
                label: `Download Linux AppImage`,
                sub: `${manifest.version} • ${variant.size} • Portable Executable`,
                url: variant.url,
                icon: Laptop
            }
        }
        if (detectedOS === 'windows') {
            const variant = (manifest.platforms.windows.installer || manifest.platforms.windows.default) as DownloadItem
            return {
                label: `Download for Windows`,
                sub: `${manifest.version} • ${variant.size || "78 MB"} • Installable Setup & Portable`,
                url: typeof variant === 'string' ? variant : variant.url,
                icon: Laptop
            }
        }
        if (detectedOS === 'macos') {
            const variant = (manifest.platforms.macos.dmgArm || manifest.platforms.macos.default) as DownloadItem
            return {
                label: `Download for macOS`,
                sub: `${manifest.version} • 96 MB • Apple Silicon & Intel DMG`,
                url: typeof variant === 'string' ? variant : variant.url,
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

            {/* Top Header & Ultra-Professional Navbar */}
            <header className="sticky top-0 z-50 px-4 sm:px-8 py-3 w-full backdrop-blur-2xl bg-[#030305]/85 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Brand Logo & Domain Badge */}
                    <div className="flex items-center gap-3">
                        <a href="#" className="flex items-center gap-3 group">
                            <Logo className="w-8 h-8 md:w-9 md:h-9 transition-transform group-hover:scale-105 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]" />
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-black tracking-tight text-base md:text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-white to-[#bc13fe]">
                                        LORAPOK
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                        v{manifest.version}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono text-white/40 tracking-wider">
                                    media.lorapok.tech
                                </span>
                            </div>
                        </a>
                    </div>

                    {/* Navigation Desktop Links */}
                    <nav className="hidden lg:flex items-center gap-7 text-xs font-mono tracking-widest text-white/70">
                        <a href="#lab" className="hover:text-neon-cyan transition-colors uppercase">Media Lab</a>
                        <a href="#downloads" className="hover:text-neon-cyan transition-colors uppercase">Downloads</a>
                        <a href="#extensions" className="hover:text-neon-cyan transition-colors uppercase">Extensions</a>
                        <a href="#features" className="hover:text-neon-cyan transition-colors uppercase">Engine</a>
                        <a href="#developer" className="hover:text-neon-cyan transition-colors uppercase">SDK</a>
                        <a href="#faq" className="hover:text-neon-cyan transition-colors uppercase">FAQ</a>
                    </nav>

                    {/* Right Header CTAs */}
                    <div className="flex items-center gap-3">
                        <a 
                            href="#lab" 
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-white transition-all"
                        >
                            <Play className="w-3.5 h-3.5 text-neon-cyan" />
                            <span>Web Player</span>
                        </a>

                        <a 
                            href="#downloads" 
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] text-midnight font-mono font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] flex items-center gap-2"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Downloads</span>
                        </a>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col gap-28">

                {/* Hero Section */}
                <section className="flex flex-col items-center text-center gap-8 pt-6 min-h-[60vh] justify-center relative">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00f3ff]/30 to-[#bc13fe]/30 blur-3xl rounded-full scale-150 animate-pulse" />
                        <Logo className="w-32 h-32 md:w-40 md:h-40 relative z-10 drop-shadow-[0_0_60px_rgba(0,243,255,0.4)]" />
                    </div>

                    <div className="space-y-4 max-w-4xl px-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
                            <span className="text-[11px] font-mono tracking-widest uppercase text-white/80">
                                Official Production Release v{manifest.version} • media.lorapok.tech
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.95]">
                            The Universal<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f3ff] to-[#bc13fe]">
                                Media Engine
                            </span>
                        </h1>
                        <p className="text-base md:text-xl text-white/70 font-mono max-w-2xl mx-auto leading-relaxed">
                            Hardware-accelerated playback with Portable & Installable binaries for Android TV, Android Mobile, Linux, Windows, macOS, and Browser Extensions.
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
                                <div className="text-xs font-mono uppercase tracking-widest text-midnight/80 font-bold">
                                    Instant Direct Download
                                </div>
                                <div className="text-lg md:text-xl font-black tracking-tight leading-tight">
                                    {primaryCTA.label}
                                </div>
                                <div className="text-[11px] font-mono text-midnight/70 font-medium mt-0.5">
                                    {primaryCTA.sub}
                                </div>
                            </div>
                        </a>

                        <a
                            href="#downloads"
                            className="px-6 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-3 backdrop-blur-md text-white/80 hover:text-white"
                        >
                            <span>All Platforms (Portable & Setup)</span>
                            <ChevronDown className="w-4 h-4 text-neon-cyan" />
                        </a>
                    </div>
                </section>

                {/* Interactive Media Testing Laboratory */}
                <section id="lab" className="scroll-mt-28 flex flex-col gap-8">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono uppercase tracking-widest">
                            <Radio className="w-4 h-4" /> Live Interactive Laboratory
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            Stream Testing Sandbox
                        </h2>
                        <p className="text-white/50 font-mono text-sm max-w-xl mx-auto">
                            Test all 8 formats directly in your browser or input any custom stream URL.
                        </p>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-gradient-to-r from-neon-cyan to-electric-purple text-midnight font-black shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Media Sandbox Player Canvas */}
                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {/* Player Container */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/15 bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md">
                                <LorapokPlayer
                                    ref={playerRef}
                                    src={demoUrl}
                                    autoPlay={false}
                                    ambientLighting={true}
                                    className="w-full h-full"
                                />
                            </div>

                            {/* Custom URL Input Bar */}
                            <form onSubmit={handleCustomUrlPlay} className="flex gap-2">
                                <input
                                    type="text"
                                    value={customUrl}
                                    onChange={(e) => setCustomUrl(e.target.value)}
                                    placeholder="Paste any HLS (.m3u8), DASH (.mpd), MP4, or WebM URL..."
                                    className="flex-1 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-neon-cyan transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3.5 rounded-2xl bg-neon-cyan hover:bg-white text-midnight font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>Stream</span>
                                </button>
                            </form>
                        </div>

                        {/* Presets List */}
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            <div className="text-xs font-mono text-white/40 uppercase tracking-widest px-1">
                                Test Media Presets ({filteredPresets.length})
                            </div>
                            {filteredPresets.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => {
                                        setDemoUrl(preset.url)
                                        playerRef.current?.load(preset.url)
                                    }}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 ${demoUrl === preset.url ? 'bg-white/10 border-neon-cyan/60 shadow-[0_0_20px_rgba(0,243,255,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-white">{preset.name}</span>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/10 text-neon-cyan border border-white/10">
                                            {preset.type}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-mono text-white/60 leading-relaxed">
                                        {preset.desc}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Direct Downloads Hub: Both Portable & Installable */}
                <section id="downloads" className="scroll-mt-28 flex flex-col gap-10">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono uppercase tracking-widest">
                            <Download className="w-4 h-4" /> Portable & Installable Binaries
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            Download Lorapok Player
                        </h2>
                        <p className="text-white/50 font-mono text-sm max-w-xl mx-auto">
                            Choose between standalone zero-install portable executables and full system package installers.
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
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-black uppercase tracking-tight">Android & Android TV</h3>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                                                NATIVE APK
                                            </span>
                                        </div>
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
                                        { key: 'armv7', label: 'ARMv7', sub: 'TV Sticks / Legacy (2.8 MB)' },
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
                                                Size: {activeItem.size} • Direct 1-Click Download
                                            </span>
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Multi-Platform Grid: Windows, Linux, macOS with Portable & Installable */}
                    <div className="grid md:grid-cols-3 gap-6">
                        
                        {/* Windows Card */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between gap-6 hover:border-blue-400/40 transition-all">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                                        <Laptop className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                        WIN 10 / 11
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold uppercase">Windows</h3>
                                <p className="text-xs font-mono text-white/60 leading-relaxed">
                                    Hardware-accelerated DirectX / Vulkan rendering pipeline for 64-bit Windows.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <a
                                    href={((manifest.platforms.windows.installer as DownloadItem)?.url || manifest.platforms.windows.default)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-white text-midnight font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                >
                                    <div className="flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        <span>Installable Setup (.exe)</span>
                                    </div>
                                    <span className="text-[10px] opacity-80">78 MB</span>
                                </a>

                                <a
                                    href={((manifest.platforms.windows.portable as DownloadItem)?.url || manifest.platforms.windows.default)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/15 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-between border border-white/10 text-white/80"
                                >
                                    <div className="flex items-center gap-2">
                                        <Box className="w-4 h-4 text-neon-cyan" />
                                        <span>Portable Standalone</span>
                                    </div>
                                    <span className="text-[10px] opacity-60">PORTABLE</span>
                                </a>
                            </div>
                        </div>

                        {/* Linux Card */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between gap-6 hover:border-neon-cyan/40 transition-all">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                                        <Cpu className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                                        ALL DISTROS
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold uppercase">Linux</h3>
                                <p className="text-xs font-mono text-white/60 leading-relaxed">
                                    Zero-dependency AppImage portable binary and native Debian/Ubuntu APT packages.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <a
                                    href={(manifest.platforms.linux.portable as DownloadItem)?.url || (manifest.platforms.linux.appimage as DownloadItem)?.url || "/downloads/lorapok-player-1.5.0-x86_64.AppImage"}
                                    download
                                    className="w-full py-3 px-4 rounded-xl bg-neon-cyan hover:bg-white text-midnight font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                                >
                                    <div className="flex items-center gap-2">
                                        <Box className="w-4 h-4" />
                                        <span>Portable AppImage</span>
                                    </div>
                                    <span className="text-[10px] opacity-80">108 MB</span>
                                </a>

                                <a
                                    href={(manifest.platforms.linux.deb as DownloadItem)?.url || "/downloads/lorapok-player-1.5.0-amd64.deb"}
                                    download
                                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/15 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-between border border-white/10 text-white/80"
                                >
                                    <div className="flex items-center gap-2">
                                        <Download className="w-4 h-4 text-electric-purple" />
                                        <span>Debian / Ubuntu (.deb)</span>
                                    </div>
                                    <span className="text-[10px] opacity-60">70 MB</span>
                                </a>
                            </div>
                        </div>

                        {/* macOS Card */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between gap-6 hover:border-electric-purple/40 transition-all">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center text-purple-300">
                                        <Monitor className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-electric-purple/10 text-purple-300 border border-electric-purple/20">
                                        M1/M2/M3/M4 & INTEL
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold uppercase">macOS</h3>
                                <p className="text-xs font-mono text-white/60 leading-relaxed">
                                    Metal hardware-accelerated universal release for Apple Silicon and Intel Macs.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <a
                                    href={((manifest.platforms.macos.dmgArm as DownloadItem)?.url || manifest.platforms.macos.default)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 px-4 rounded-xl bg-electric-purple hover:bg-white hover:text-midnight font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-[0_0_20px_rgba(188,19,254,0.3)]"
                                >
                                    <div className="flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        <span>Apple Silicon (.dmg)</span>
                                    </div>
                                    <span className="text-[10px] opacity-80">96 MB</span>
                                </a>

                                <a
                                    href={((manifest.platforms.macos.dmgIntel as DownloadItem)?.url || manifest.platforms.macos.default)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/15 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-between border border-white/10 text-white/80"
                                >
                                    <div className="flex items-center gap-2">
                                        <Laptop className="w-4 h-4 text-neon-cyan" />
                                        <span>Intel Mac (.dmg)</span>
                                    </div>
                                    <span className="text-[10px] opacity-60">96 MB</span>
                                </a>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Browser Extensions for All Browsers (Firefox AMO, Chrome, Edge) */}
                <section id="extensions" className="scroll-mt-28 bg-gradient-to-br from-[#bc13fe]/10 via-white/5 to-transparent border border-white/15 rounded-3xl p-8 lg:p-12 backdrop-blur-2xl space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center gap-2 text-electric-purple font-mono text-xs uppercase tracking-widest">
                                <Compass className="w-4 h-4" /> Universal Browser Extension Hub
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                                Lorapok Browser Connector
                            </h2>
                            <p className="text-white/70 font-mono text-sm leading-relaxed">
                                Sniff any active video, audio, HLS (.m3u8), or DASH stream on any webpage and send it directly to Lorapok Player desktop or web player with 1 click.
                            </p>
                        </div>

                        <a 
                            href="https://github.com/Maijied/Lorapok_Media_Player/blob/main/lorapok-extension/AMO_SUBMISSION_DETAILS.md"
                            target="_blank"
                            rel="noreferrer"
                            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-mono flex items-center gap-2 transition-all self-start md:self-auto"
                        >
                            <FileText className="w-4 h-4 text-neon-cyan" />
                            <span>AMO / Store Submission Guide</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </a>
                    </div>

                    {/* Browser Download Cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        {/* Firefox AMO Card */}
                        <div className="bg-black/40 border border-orange-500/30 rounded-2xl p-5 space-y-4 hover:border-orange-400 transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg">🦊</span>
                                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                        AMO READY
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm">Mozilla Firefox</h4>
                                <p className="text-[11px] font-mono text-white/50 leading-relaxed">
                                    Direct .xpi add-on package compatible with Firefox 109+ and AMO.
                                </p>
                            </div>
                            <a
                                href="/downloads/lorapok-extension-firefox-1.5.0.xpi"
                                download
                                className="w-full py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-white text-midnight font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                            >
                                <span>Get Firefox (.xpi)</span>
                                <span className="opacity-80 text-[10px]">428 KB</span>
                            </a>
                        </div>

                        {/* Google Chrome Card */}
                        <div className="bg-black/40 border border-blue-500/30 rounded-2xl p-5 space-y-4 hover:border-blue-400 transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg">🌐</span>
                                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                        MANIFEST V3
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm">Google Chrome</h4>
                                <p className="text-[11px] font-mono text-white/50 leading-relaxed">
                                    Chrome Web Store package for Chrome, Brave, Opera, and Vivaldi.
                                </p>
                            </div>
                            <a
                                href="/downloads/lorapok-extension-chrome-1.5.0.zip"
                                download
                                className="w-full py-2.5 px-3 rounded-xl bg-blue-500 hover:bg-white text-midnight font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            >
                                <span>Get Chrome (.zip)</span>
                                <span className="opacity-80 text-[10px]">428 KB</span>
                            </a>
                        </div>

                        {/* Microsoft Edge Card */}
                        <div className="bg-black/40 border border-teal-500/30 rounded-2xl p-5 space-y-4 hover:border-teal-400 transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg">🌊</span>
                                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                        EDGE STORE
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm">Microsoft Edge</h4>
                                <p className="text-[11px] font-mono text-white/50 leading-relaxed">
                                    Microsoft Edge Add-ons compatible package with deep link triggers.
                                </p>
                            </div>
                            <a
                                href="/downloads/lorapok-extension-edge-1.5.0.zip"
                                download
                                className="w-full py-2.5 px-3 rounded-xl bg-teal-500 hover:bg-white text-midnight font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                            >
                                <span>Get Edge (.zip)</span>
                                <span className="opacity-80 text-[10px]">428 KB</span>
                            </a>
                        </div>

                        {/* Firefox Source Archive */}
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4 hover:border-white/30 transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg">📦</span>
                                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/15">
                                        AMO ARCHIVE
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm">Firefox (.zip)</h4>
                                <p className="text-[11px] font-mono text-white/50 leading-relaxed">
                                    Complete source zip for Firefox Developer Edition manual loading.
                                </p>
                            </div>
                            <a
                                href="/downloads/lorapok-extension-firefox-1.5.0.zip"
                                download
                                className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-between border border-white/10 text-white/80"
                            >
                                <span>Download (.zip)</span>
                                <span className="opacity-60 text-[10px]">428 KB</span>
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
                            { icon: ShieldCheck, title: "Portable & Installable Packages", desc: "Universal release APKs, Debian .deb, Windows setup & portable, macOS DMG, and Firefox/Chrome extensions." }
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
                        <p className="text-white/50 font-mono text-sm">
                            Everything you need to know about the Lorapok ecosystem.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {FAQ_ITEMS.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md transition-all"
                            >
                                <button
                                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                    className="w-full p-6 text-left font-bold text-sm md:text-base flex items-center justify-between gap-4"
                                >
                                    <span>{item.q}</span>
                                    <ChevronDown className={`w-5 h-5 transition-transform text-neon-cyan ${activeFaq === idx ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {activeFaq === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-6 pb-6 text-xs md:text-sm font-mono text-white/60 leading-relaxed border-t border-white/5 pt-4"
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
            <footer className="border-t border-white/10 bg-[#020204] py-12 mt-20 text-center text-xs font-mono text-white/50 space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <Logo className="w-6 h-6" />
                    <span className="font-bold text-white tracking-widest uppercase">Lorapok Labs</span>
                </div>
                <div className="flex justify-center gap-6 text-xs text-white/60">
                    <a href="https://media.lorapok.tech" className="hover:text-neon-cyan">media.lorapok.tech</a>
                    <span>•</span>
                    <a href="https://github.com/Maijied/Lorapok_Media_Player" className="hover:text-neon-cyan">GitHub Repository</a>
                    <span>•</span>
                    <a href="https://github.com/Maijied/Lorapok_Media_Player/releases" className="hover:text-neon-cyan">Release Assets</a>
                </div>
                <p>© {new Date().getFullYear()} Lorapok Labs. Released under MIT License.</p>
            </footer>
        </div>
    )
}

export default App
