import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LorapokPlayer, Logo } from 'lorapok-player'
import type { LorapokPlayerRef } from 'lorapok-player'
import { 
    Download, Zap, Globe, Monitor, ChevronDown, Code2, Layers, Play, Smartphone, 
    Laptop, Radio, Sparkles, ArrowRight, ShieldCheck, Copy, Check, ExternalLink, 
    Compass, Shield, FileText, CheckCircle2, Box, Cpu, HardDrive, Search, FolderPlus,
    ListPlus, HelpCircle, X, Terminal, Shuffle, Repeat, Music, Film, Sliders
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
            },
            vscodeVsix: {
                url: "/downloads/lorapok-player-vscode-1.5.0.vsix",
                size: "21 KB",
                label: "VS Code Extension (.vsix)",
                badge: "IDE EXTENSION",
                desc: "Visual Studio Code Media Player & Stream Previewer"
            }
        }
    }
}

interface PlaylistItem {
    id: string
    name: string
    category: string
    type: string
    url: string
    desc: string
}

const INITIAL_MEDIA_PRESETS: PlaylistItem[] = [
    {
        id: 'mp4',
        name: 'Neon Waves 1080p',
        category: 'Video',
        type: 'MP4 (H.264)',
        url: '/demos/neon_waves.mp4',
        desc: '1080p RGB spectrum color cycle benchmark with AAC audio'
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
        name: 'Akamai Live CDN',
        category: 'Live Broadcast',
        type: 'HLS Live',
        url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
        desc: 'Production Akamai CDN live stream test'
    }
]

const FAQ_ITEMS = [
    { q: "What media formats does Lorapok support?", a: "Lorapok natively decodes HLS (.m3u8), MPEG-DASH (.mpd), MP4 (H.264/HEVC/AV1), WebM (VP8/VP9/AV1), MKV, FLV, AVI, WMV, MOV, FLAC, AAC, MP3, OGG, and WAV with hardware acceleration." },
    { q: "What is the difference between Portable and Installable versions?", a: "Installable versions (.exe setup, .deb) register system protocol handlers (lorapok://) and start menu shortcuts. Portable versions (AppImage, Standalone .exe, .zip) run without installation or administrative rights directly from any USB or directory." },
    { q: "How do I install the Python / PHP / Yarn / VS Code packages?", a: "For Python: `pip install lorapok`. For PHP: `composer require lorapok/player`. For Yarn: `yarn add lorapok-player`. For VS Code: Download the .vsix package or search 'Lorapok' in Extensions." },
    { q: "How do I install the Android / Android TV version?", a: "Download the Universal APK directly from the website buttons or GitHub Releases. Sideload the APK onto your Android phone, tablet, or Android TV box. It includes D-Pad Leanback remote control navigation and mobile gesture scrubbing." },
    { q: "How do I install the browser extension on Firefox / Chrome / Edge?", a: "For Firefox, download the .xpi file for direct installation. For Chrome/Edge, load unpacked extension or install the provided .zip. It sniffs videos on any page and opens them in Lorapok." },
    { q: "How do I embed Lorapok into my React web application?", a: "Run `npm install lorapok-player` and import `{ LorapokPlayer }` from 'lorapok-player'. It includes built-in ambient lighting, audio equalizer, track selectors, and full TypeScript declarations." }
]

export function App() {
    const [manifest, setManifest] = useState<Manifest>(DEFAULT_MANIFEST)
    const [detectedOS, setDetectedOS] = useState<'android' | 'linux' | 'windows' | 'macos'>('android')
    const [playlist, setPlaylist] = useState<PlaylistItem[]>(INITIAL_MEDIA_PRESETS)
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0)
    const [demoUrl, setDemoUrl] = useState<string>(INITIAL_MEDIA_PRESETS[0].url)
    const [customUrl, setCustomUrl] = useState("")
    const [activeFaq, setActiveFaq] = useState<number | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('All')
    const [selectedPackageTab, setSelectedPackageTab] = useState<'npm' | 'pip' | 'composer' | 'yarn' | 'vscode'>('npm')
    const [copiedSnippet, setCopiedSnippet] = useState(false)
    const [selectedAndroidVariant, setSelectedAndroidVariant] = useState<'universal' | 'arm64' | 'armv7' | 'x86_64' | 'aab'>('universal')
    const [showSearchModal, setShowSearchModal] = useState(false)
    const [showHowToUseModal, setShowHowToUseModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isShuffle, setIsShuffle] = useState(false)
    const [isRepeat, setIsRepeat] = useState(false)
    const playerRef = useRef<LorapokPlayerRef>(null)
    const folderInputRef = useRef<HTMLInputElement>(null)

    // Load download manifest
    useEffect(() => {
        fetch('/downloads/manifest.json')
            .then(res => res.json())
            .then(data => {
                if (data && data.platforms) {
                    setManifest(data)
                }
            })
            .catch(() => {})
    }, [])

    // Detect user OS
    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase()
        if (ua.includes('android')) setDetectedOS('android')
        else if (ua.includes('linux')) setDetectedOS('linux')
        else if (ua.includes('win')) setDetectedOS('windows')
        else if (ua.includes('mac')) setDetectedOS('macos')
        else setDetectedOS('android')
    }, [])

    // Global Keyboard Shortcuts (Cmd/Ctrl+K for search, ? for How-to-use)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                setShowSearchModal(prev => !prev)
            } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault()
                setShowHowToUseModal(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleCustomUrlPlay = (e: React.FormEvent) => {
        e.preventDefault()
        if (customUrl.trim()) {
            const newTrack: PlaylistItem = {
                id: `custom-${Date.now()}`,
                name: customUrl.split('/').pop()?.split('?')[0] || 'Custom Stream',
                category: 'Custom Stream',
                type: customUrl.includes('.m3u8') ? 'HLS' : (customUrl.includes('.mpd') ? 'DASH' : 'Direct URL'),
                url: customUrl.trim(),
                desc: 'User-specified media stream stream'
            }
            setPlaylist(prev => [newTrack, ...prev])
            setCurrentTrackIndex(0)
            setDemoUrl(newTrack.url)
            playerRef.current?.load(newTrack.url)
            setCustomUrl("")
        }
    }

    const selectTrack = (index: number) => {
        if (index >= 0 && index < playlist.length) {
            setCurrentTrackIndex(index)
            const track = playlist[index]
            setDemoUrl(track.url)
            playerRef.current?.load(track.url)
        }
    }

    const playNextTrack = () => {
        if (playlist.length === 0) return
        if (isShuffle) {
            const nextIdx = Math.floor(Math.random() * playlist.length)
            selectTrack(nextIdx)
        } else {
            const nextIdx = (currentTrackIndex + 1) % playlist.length
            selectTrack(nextIdx)
        }
    }

    const playPrevTrack = () => {
        if (playlist.length === 0) return
        const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length
        selectTrack(prevIdx)
    }

    const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const mediaExtensions = ['.mp4', '.mkv', '.webm', '.avi', '.mov', '.flac', '.mp3', '.wav', '.aac', '.ogg', '.m3u8', '.mpd']
        const newTracks: PlaylistItem[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const ext = '.' + file.name.split('.').pop()?.toLowerCase()
            if (mediaExtensions.includes(ext)) {
                const objectUrl = URL.createObjectURL(file)
                newTracks.push({
                    id: `local-${i}-${Date.now()}`,
                    name: file.name,
                    category: file.type.startsWith('audio') ? 'Audio' : 'Video',
                    type: ext.toUpperCase().replace('.', ''),
                    url: objectUrl,
                    desc: `Local File • ${(file.size / (1024 * 1024)).toFixed(1)} MB`
                })
            }
        }

        if (newTracks.length > 0) {
            setPlaylist(prev => [...newTracks, ...prev])
            setCurrentTrackIndex(0)
            setDemoUrl(newTracks[0].url)
            playerRef.current?.load(newTracks[0].url)
        }
    }

    const copyCode = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedSnippet(true)
        setTimeout(() => setCopiedSnippet(false), 2000)
    }

    const categories = ['All', 'Video', 'Adaptive Stream', 'Lossless Audio', 'Audio', 'Live Broadcast']
    const filteredPresets = selectedCategory === 'All' 
        ? playlist 
        : playlist.filter(p => p.category === selectedCategory)

    const searchResults = searchQuery.trim() === ''
        ? playlist
        : playlist.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )

    return (
        <div className="min-h-screen bg-[#050510] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Ambient Background Lights */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#00f3ff]/10 via-[#bc13fe]/5 to-transparent blur-[140px] rounded-full" />
                <div className="absolute top-[40%] -left-40 w-[600px] h-[600px] bg-[#bc13fe]/5 blur-[160px] rounded-full" />
                <div className="absolute top-[60%] -right-40 w-[600px] h-[600px] bg-[#00f3ff]/5 blur-[160px] rounded-full" />
            </div>

            {/* Sticky Glassmorphism Header */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#050510]/80 border-b border-white/10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    {/* Logo Branding */}
                    <a href="#" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan to-electric-purple rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition duration-300" />
                            <div className="relative w-9 h-9 rounded-xl bg-midnight border border-white/20 flex items-center justify-center p-1.5 shadow-lg">
                                <Logo className="w-full h-full text-neon-cyan" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-lg tracking-wider text-white font-mono">LORAPOK</span>
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
                                    v{manifest.version}
                                </span>
                            </div>
                            <span className="text-[10px] font-mono text-white/40 block -mt-1 tracking-widest">
                                media.lorapok.tech
                            </span>
                        </div>
                    </a>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6 text-xs font-mono tracking-wider text-white/70">
                        <a href="#medialab" className="hover:text-neon-cyan transition-colors">Media Lab</a>
                        <a href="#downloads" className="hover:text-neon-cyan transition-colors">Downloads</a>
                        <a href="#extensions" className="hover:text-neon-cyan transition-colors">Extensions</a>
                        <a href="#developer" className="hover:text-neon-cyan transition-colors">Developer SDK</a>
                        <a href="#features" className="hover:text-neon-cyan transition-colors">Engine</a>
                        <a href="#faq" className="hover:text-neon-cyan transition-colors">FAQ</a>
                    </nav>

                    {/* Top Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSearchModal(true)}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/60 hover:text-white transition-all"
                            title="Search Streams & Files (Cmd/Ctrl + K)"
                        >
                            <Search className="w-3.5 h-3.5 text-neon-cyan" />
                            <span>Search</span>
                            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-white/40">⌘K</kbd>
                        </button>

                        <button
                            onClick={() => setShowHowToUseModal(true)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
                            title="How to Use & Shortcuts (?)"
                        >
                            <HelpCircle className="w-4 h-4 text-neon-cyan" />
                        </button>

                        <a
                            href="#downloads"
                            className="px-4 py-2 rounded-xl bg-neon-cyan hover:bg-white text-midnight font-mono font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] flex items-center gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 relative z-10">
                
                {/* Hero Section */}
                <section className="text-center space-y-8 pt-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-neon-cyan text-xs font-mono uppercase tracking-widest backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Neural Computing & Sensory Media Engine
                    </div>

                    <h1 className="fluid-title font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
                        The Universal Playback Engine for Every Screen
                    </h1>

                    <p className="text-white/60 font-mono text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        Hardware-accelerated 8K video, lossless 24-bit audio, adaptive HLS/DASH streaming, and biological ambient lighting. Available across Desktop, Android, Browser Extensions, VS Code, and NPM.
                    </p>

                    {/* Hero CTA Hub */}
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <a
                            href="#medialab"
                            className="px-8 py-4 rounded-2xl bg-white text-midnight font-mono font-black text-sm uppercase tracking-wider hover:bg-neon-cyan transition-all shadow-[0_0_30px_rgba(0,243,255,0.4)] flex items-center gap-3"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Launch Live Media Lab</span>
                        </a>

                        <a
                            href="#downloads"
                            className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 font-mono font-bold text-sm uppercase tracking-wider text-white transition-all flex items-center gap-3"
                        >
                            <Download className="w-4 h-4 text-neon-cyan" />
                            <span>Get App & Packages</span>
                        </a>
                    </div>
                </section>

                {/* Media Sandbox / Codec Lab */}
                <section id="medialab" className="deferred-render scroll-mt-28 flex flex-col gap-8">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-electric-purple/10 border border-electric-purple/30 text-purple-300 text-xs font-mono uppercase tracking-widest">
                            <Radio className="w-4 h-4 text-electric-purple animate-pulse" /> Live Multi-Codec Testing Lab
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            Interactive Stream Engine
                        </h2>
                        <p className="text-white/50 font-mono text-sm max-w-xl mx-auto">
                            Test all 8 formats directly in your browser, import local folders, or input any custom stream URL.
                        </p>
                    </div>

                    {/* Toolbar: Category Filters, Folder Upload, Search, Playlist Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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

                        {/* Local Folder & File Ingestion */}
                        <div className="flex items-center gap-2">
                            <input
                                ref={folderInputRef}
                                type="file"
                                // @ts-ignore
                                webkitdirectory=""
                                directory=""
                                multiple
                                onChange={handleFolderUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => folderInputRef.current?.click()}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white/80 hover:text-white flex items-center gap-2 transition-all"
                                title="Add Folder with Videos/Audios to Playlist"
                            >
                                <FolderPlus className="w-4 h-4 text-neon-cyan" />
                                <span>Add Folder</span>
                            </button>
                        </div>
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
                                    className="w-full h-full"
                                />
                            </div>

                            {/* Custom URL Input Bar & Controls */}
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

                        {/* Playlist & Presets Explorer */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 backdrop-blur-xl max-h-[580px] flex flex-col justify-between">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div>
                                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">Media Playlist</div>
                                    <div className="text-[10px] font-mono text-white/40">{playlist.length} items loaded</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsShuffle(prev => !prev)}
                                        className={`p-1.5 rounded-lg border transition-all ${isShuffle ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40' : 'text-white/40 border-white/5 hover:text-white'}`}
                                        title="Toggle Shuffle"
                                    >
                                        <Shuffle className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setIsRepeat(prev => !prev)}
                                        className={`p-1.5 rounded-lg border transition-all ${isRepeat ? 'bg-electric-purple/20 text-purple-300 border-purple-500/40' : 'text-white/40 border-white/5 hover:text-white'}`}
                                        title="Toggle Repeat"
                                    >
                                        <Repeat className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                                {filteredPresets.map((preset, idx) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => selectTrack(playlist.indexOf(preset))}
                                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 ${demoUrl === preset.url ? 'bg-white/10 border-neon-cyan/60 shadow-[0_0_20px_rgba(0,243,255,0.2)]' : 'bg-black/30 border-white/5 hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-white truncate max-w-[180px]">{preset.name}</span>
                                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-neon-cyan border border-white/10">
                                                {preset.type}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-mono text-white/50 line-clamp-1">
                                            {preset.desc}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Direct Downloads Hub: Both Portable & Installable */}
                <section id="downloads" className="deferred-render scroll-mt-28 flex flex-col gap-10">
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
                                    href={(manifest.platforms.linux.portable as DownloadItem)?.url || "/downloads/lorapok-player-1.5.0-x86_64.AppImage"}
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

                {/* Universal Browser Extensions & VS Code Extension */}
                <section id="extensions" className="deferred-render scroll-mt-28 bg-gradient-to-br from-[#bc13fe]/10 via-white/5 to-transparent border border-white/15 rounded-3xl p-8 lg:p-12 backdrop-blur-2xl space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center gap-2 text-electric-purple font-mono text-xs uppercase tracking-widest">
                                <Compass className="w-4 h-4" /> Universal Extensions Hub
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                                Browser & IDE Connectors
                            </h2>
                            <p className="text-white/70 font-mono text-sm leading-relaxed">
                                Sniff any active video, audio, HLS (.m3u8), or DASH stream on any webpage or preview media directly in Visual Studio Code.
                            </p>
                        </div>

                        <a 
                            href="https://github.com/Maijied/Lorapok_Media_Player/blob/main/lorapok-extension/AMO_SUBMISSION_DETAILS.md"
                            target="_blank"
                            rel="noreferrer"
                            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-mono flex items-center gap-2 transition-all self-start md:self-auto"
                        >
                            <FileText className="w-4 h-4 text-neon-cyan" />
                            <span>AMO / Store Submission Details</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </a>
                    </div>

                    {/* Browser & VS Code Download Cards */}
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

                        {/* VS Code Extension Card */}
                        <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-5 space-y-4 hover:border-purple-400 transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg">💻</span>
                                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        VS CODE IDE
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm">VS Code Extension</h4>
                                <p className="text-[11px] font-mono text-white/50 leading-relaxed">
                                    Custom media editor & stream previewer inside Visual Studio Code.
                                </p>
                            </div>
                            <a
                                href="/downloads/lorapok-player-vscode-1.5.0.vsix"
                                download
                                className="w-full py-2.5 px-3 rounded-xl bg-electric-purple hover:bg-white text-white hover:text-midnight font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-[0_0_15px_rgba(188,19,254,0.3)]"
                            >
                                <span>Get VSIX Package</span>
                                <span className="opacity-80 text-[10px]">21 KB</span>
                            </a>
                        </div>

                    </div>
                </section>

                {/* Developer SDK Hub: NPM, Python PIP, PHP Composer, Yarn, VS Code */}
                <section id="developer" className="deferred-render scroll-mt-28 bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 backdrop-blur-xl space-y-8">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 text-electric-purple font-mono text-xs uppercase tracking-widest">
                            <Code2 className="w-4 h-4" /> Multi-Language Ecosystem SDK
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                            Developer Packages & Integration
                        </h2>
                        <p className="text-white/60 font-mono text-sm max-w-2xl leading-relaxed">
                            Integrate the Lorapok media engine into any tech stack with zero friction.
                        </p>
                    </div>

                    {/* Language / Package Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
                        {[
                            { id: 'npm', label: 'JavaScript / React', badge: 'NPM' },
                            { id: 'pip', label: 'Python SDK & CLI', badge: 'PIP' },
                            { id: 'composer', label: 'PHP / Laravel', badge: 'Composer' },
                            { id: 'yarn', label: 'Yarn Monorepo', badge: 'Yarn' },
                            { id: 'vscode', label: 'VS Code Extension', badge: 'VSIX' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedPackageTab(tab.id as any)}
                                className={`px-4 py-2.5 rounded-xl font-mono text-xs flex items-center gap-2 transition-all whitespace-nowrap ${selectedPackageTab === tab.id ? 'bg-neon-cyan text-midnight font-bold shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'bg-white/5 text-white/60 hover:text-white'}`}
                            >
                                <span>{tab.label}</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-black/30 font-mono font-bold">
                                    {tab.badge}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Panels */}
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* Left description & install command */}
                        <div className="space-y-6">
                            {selectedPackageTab === 'npm' && (
                                <>
                                    <h3 className="text-2xl font-bold">React & TypeScript Component</h3>
                                    <p className="text-xs font-mono text-white/70 leading-relaxed">
                                        Embed the hardware-accelerated video/audio player, ambient lighting, and audio equalization into your React applications with native TypeScript types.
                                    </p>
                                    <button
                                        onClick={() => copyCode('npm install lorapok-player')}
                                        className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-black/60 border border-white/15 font-mono text-xs text-neon-cyan flex items-center justify-between gap-4 hover:border-neon-cyan transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Terminal className="w-4 h-4 opacity-60" />
                                            <span>npm install lorapok-player</span>
                                        </div>
                                        {copiedSnippet ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-60" />}
                                    </button>
                                </>
                            )}

                            {selectedPackageTab === 'pip' && (
                                <>
                                    <h3 className="text-2xl font-bold">Python SDK & CLI Streaming Server</h3>
                                    <p className="text-xs font-mono text-white/70 leading-relaxed">
                                        Launch streams from Python scripts, generate HTML player embeds, run the local media streaming server, and inspect HLS/DASH media characteristics.
                                    </p>
                                    <button
                                        onClick={() => copyCode('pip install lorapok')}
                                        className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-black/60 border border-white/15 font-mono text-xs text-neon-cyan flex items-center justify-between gap-4 hover:border-neon-cyan transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Terminal className="w-4 h-4 opacity-60" />
                                            <span>pip install lorapok</span>
                                        </div>
                                        {copiedSnippet ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-60" />}
                                    </button>
                                </>
                            )}

                            {selectedPackageTab === 'composer' && (
                                <>
                                    <h3 className="text-2xl font-bold">PHP & Laravel Media Player Library</h3>
                                    <p className="text-xs font-mono text-white/70 leading-relaxed">
                                        Render self-contained player components in Blade/Twig templates and generate master adaptive HLS (.m3u8) playlists directly in PHP.
                                    </p>
                                    <button
                                        onClick={() => copyCode('composer require lorapok/player')}
                                        className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-black/60 border border-white/15 font-mono text-xs text-neon-cyan flex items-center justify-between gap-4 hover:border-neon-cyan transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Terminal className="w-4 h-4 opacity-60" />
                                            <span>composer require lorapok/player</span>
                                        </div>
                                        {copiedSnippet ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-60" />}
                                    </button>
                                </>
                            )}

                            {selectedPackageTab === 'yarn' && (
                                <>
                                    <h3 className="text-2xl font-bold">Yarn Modern & Classic Support</h3>
                                    <p className="text-xs font-mono text-white/70 leading-relaxed">
                                        Fully compatible with Yarn Berry (v3/v4) and Yarn Classic monorepos with zero hoisting conflicts.
                                    </p>
                                    <button
                                        onClick={() => copyCode('yarn add lorapok-player')}
                                        className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-black/60 border border-white/15 font-mono text-xs text-neon-cyan flex items-center justify-between gap-4 hover:border-neon-cyan transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Terminal className="w-4 h-4 opacity-60" />
                                            <span>yarn add lorapok-player</span>
                                        </div>
                                        {copiedSnippet ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-60" />}
                                    </button>
                                </>
                            )}

                            {selectedPackageTab === 'vscode' && (
                                <>
                                    <h3 className="text-2xl font-bold">VS Code Custom Media Editor</h3>
                                    <p className="text-xs font-mono text-white/70 leading-relaxed">
                                        Preview all media types (.mp4, .webm, .mkv, .m3u8, .flac, .mp3) directly inside Visual Studio Code with hardware acceleration.
                                    </p>
                                    <a
                                        href="/downloads/lorapok-player-vscode-1.5.0.vsix"
                                        download
                                        className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-electric-purple text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-4 hover:bg-white hover:text-midnight transition-all shadow-[0_0_20px_rgba(188,19,254,0.3)]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Download className="w-4 h-4" />
                                            <span>Download .vsix Extension (21 KB)</span>
                                        </div>
                                    </a>
                                </>
                            )}
                        </div>

                        {/* Right code snippet box */}
                        <div className="bg-[#09090c] border border-white/10 rounded-2xl p-6 font-mono text-xs text-white/80 leading-relaxed overflow-x-auto shadow-2xl">
                            {selectedPackageTab === 'npm' && (
                                <>
                                    <div className="text-white/30 mb-2">// React App.tsx</div>
                                    <div><span className="text-neon-cyan">import</span> {'{ LorapokPlayer }'} <span className="text-neon-cyan">from</span> <span className="text-green-400">'lorapok-player'</span>;</div>
                                    <div><span className="text-neon-cyan">import</span> <span className="text-green-400">'lorapok-player/style.css'</span>;</div>
                                    <br />
                                    <div><span className="text-neon-cyan">export default function</span> <span className="text-blue-400">App</span>() {'{'}</div>
                                    <div className="pl-4"><span className="text-neon-cyan">return</span> (</div>
                                    <div className="pl-8 text-white/90">{'<LorapokPlayer'}</div>
                                    <div className="pl-12 text-electric-purple">src=<span className="text-green-400">"https://example.com/stream.m3u8"</span></div>
                                    <div className="pl-12 text-electric-purple">autoPlay=<span className="text-orange-400">true</span></div>
                                    <div className="pl-12 text-electric-purple">ambientLighting=<span className="text-orange-400">true</span></div>
                                    <div className="pl-8 text-white/90">{'/>'}</div>
                                    <div className="pl-4">);</div>
                                    <div>{'}'}</div>
                                </>
                            )}

                            {selectedPackageTab === 'pip' && (
                                <>
                                    <div className="text-white/30 mb-2"># Python main.py</div>
                                    <div><span className="text-neon-cyan">import</span> lorapok</div>
                                    <br />
                                    <div className="text-white/40"># 1. Open stream in desktop/web player</div>
                                    <div>lorapok.<span className="text-blue-400">play</span>(<span className="text-green-400">"https://example.com/stream.m3u8"</span>)</div>
                                    <br />
                                    <div className="text-white/40"># 2. Inspect media characteristics</div>
                                    <div>info = lorapok.<span className="text-blue-400">inspect_media</span>(<span className="text-green-400">"https://example.com/stream.m3u8"</span>)</div>
                                    <div><span className="text-neon-cyan">print</span>(f<span className="text-green-400">"Format: &#123;info.format&#125;"</span>)</div>
                                </>
                            )}

                            {selectedPackageTab === 'composer' && (
                                <>
                                    <div className="text-white/30 mb-2">// PHP / Laravel Blade</div>
                                    <div><span className="text-neon-cyan">use</span> Lorapok\LorapokPlayer;</div>
                                    <br />
                                    <div className="text-white/40">// Render player component</div>
                                    <div><span className="text-neon-cyan">echo</span> LorapokPlayer::<span className="text-blue-400">create</span>(<span className="text-green-400">"https://example.com/stream.m3u8"</span>, [</div>
                                    <div className="pl-4"><span className="text-green-400">'autoPlay'</span> =&gt; <span className="text-orange-400">true</span>,</div>
                                    <div className="pl-4"><span className="text-green-400">'ambientLighting'</span> =&gt; <span className="text-orange-400">true</span></div>
                                    <div>]);</div>
                                </>
                            )}

                            {selectedPackageTab === 'yarn' && (
                                <>
                                    <div className="text-white/30 mb-2">// package.json</div>
                                    <div>{'{'}</div>
                                    <div className="pl-4"><span className="text-neon-cyan">"dependencies"</span>: {'{'}</div>
                                    <div className="pl-8"><span className="text-green-400">"lorapok-player"</span>: <span className="text-orange-400">"^1.5.0"</span></div>
                                    <div className="pl-4">{'}'}</div>
                                    <div>{'}'}</div>
                                </>
                            )}

                            {selectedPackageTab === 'vscode' && (
                                <>
                                    <div className="text-white/30 mb-2">// VS Code Command Palette</div>
                                    <div className="text-white/50">&gt; Lorapok: Open Media Stream URL</div>
                                    <div className="text-green-400">&gt; Enter: https://example.com/stream.m3u8</div>
                                    <br />
                                    <div className="text-white/50">// Or simply click any .mp4, .webm, .mkv file in your project explorer</div>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Engine Capabilities */}
                <section id="features" className="deferred-render scroll-mt-28 space-y-12">
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
                            { icon: ShieldCheck, title: "Multi-Ecosystem Toolchain", desc: "Universal release APKs, Debian .deb, Windows setup, macOS DMG, Python PIP, PHP Composer, and VS Code extension." }
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
                <section id="faq" className="deferred-render scroll-mt-28 max-w-3xl mx-auto w-full space-y-8">
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

            {/* Global Search Modal (Cmd/Ctrl + K) */}
            <AnimatePresence>
                {showSearchModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSearchModal(false)}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-start justify-center pt-24 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0b0e18] border border-white/15 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4 p-6"
                        >
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <Search className="w-5 h-5 text-neon-cyan" />
                                <input
                                    type="text"
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search test media presets, formats, audio or custom streams..."
                                    className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder-white/40"
                                />
                                <button onClick={() => setShowSearchModal(false)}>
                                    <X className="w-5 h-5 text-white/40 hover:text-white" />
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                                {searchResults.length === 0 ? (
                                    <div className="py-8 text-center text-xs font-mono text-white/40">
                                        No media found matching "{searchQuery}"
                                    </div>
                                ) : (
                                    searchResults.map((item, idx) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                selectTrack(playlist.indexOf(item))
                                                setShowSearchModal(false)
                                                document.getElementById('medialab')?.scrollIntoView({ behavior: 'smooth' })
                                            }}
                                            className="w-full text-left p-3 rounded-xl border border-white/5 hover:border-neon-cyan/40 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between group"
                                        >
                                            <div>
                                                <div className="font-bold text-sm text-white group-hover:text-neon-cyan transition-colors">{item.name}</div>
                                                <div className="text-[10px] font-mono text-white/50">{item.desc}</div>
                                            </div>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-neon-cyan">
                                                {item.type}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Interactive "How to Use" Guide Modal */}
            <AnimatePresence>
                {showHowToUseModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowHowToUseModal(false)}
                        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0b0e18] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 space-y-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white">
                                        How to Use Lorapok Player
                                    </h2>
                                    <p className="text-xs font-mono text-white/50">Complete user guide, shortcuts & ecosystem features</p>
                                </div>
                                <button onClick={() => setShowHowToUseModal(false)}>
                                    <X className="w-6 h-6 text-white/40 hover:text-white" />
                                </button>
                            </div>

                            {/* Section 1: Keyboard Shortcuts */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-mono font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-2">
                                    <Laptop className="w-4 h-4" /> 1. Desktop Keyboard Shortcuts
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
                                    {[
                                        { key: "SPACE", action: "Play / Pause playback" },
                                        { key: "← / →", action: "Seek backward / forward 10 seconds" },
                                        { key: "↑ / ↓", action: "Increase / Decrease volume (10%)" },
                                        { key: "M", action: "Mute / Unmute audio" },
                                        { key: "F", action: "Toggle Fullscreen mode" },
                                        { key: "A", action: "Cycle Aspect Ratio (16:9, 4:3, 21:9, Original)" },
                                        { key: "[ / ]", action: "Set A-B Loop Start & End points" },
                                        { key: "\\", action: "Clear active A-B Loop" },
                                        { key: "{ / }", action: "Cycle playback speed (0.5x, 1x, 1.25x, 1.5x, 2x)" },
                                        { key: "⌘K / Ctrl+K", action: "Open Instant File & Stream Search" },
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                                            <span className="font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">{s.key}</span>
                                            <span className="text-white/60">{s.action}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section 2: Mobile Gestures */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" /> 2. Android Mobile Gestures & Android TV
                                </h3>
                                <div className="grid sm:grid-cols-3 gap-3 text-xs font-mono">
                                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                        <div className="font-bold text-green-300">Left Vertical Swipe</div>
                                        <div className="text-white/50 text-[11px]">Adjust screen brightness (0.2x to 2.0x)</div>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                        <div className="font-bold text-green-300">Right Vertical Swipe</div>
                                        <div className="text-white/50 text-[11px]">Adjust audio volume with 150% boost</div>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                        <div className="font-bold text-green-300">Double Tap & Remote</div>
                                        <div className="text-white/50 text-[11px]">Double tap to seek 10s • Full D-Pad TV remote support</div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Browser & IDE Extensions */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-mono font-bold text-electric-purple uppercase tracking-wider flex items-center gap-2">
                                    <Compass className="w-4 h-4" /> 3. Browser Connector & VS Code Extension
                                </h3>
                                <p className="text-xs font-mono text-white/60 leading-relaxed">
                                    Install the Firefox AMO (.xpi), Chrome (.zip), Edge (.zip), or VS Code (.vsix) extensions to sniff media streams on any webpage or preview video files directly in your IDE code editor with 1 click.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
