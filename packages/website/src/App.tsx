import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { LorapokPlayer, Logo, LorapokPlayerRef } from 'lorapok-player'
import { Download, Zap, Cpu, Globe, Keyboard, Info, CheckCircle } from 'lucide-react'

function App() {
    const [demoUrl, setDemoUrl] = useState("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
    const [customUrl, setCustomUrl] = useState("")
    const playerRef = useRef<LorapokPlayerRef>(null)

    const handleCustomUrlPlay = (e: React.FormEvent) => {
        e.preventDefault()
        if (customUrl.trim()) {
            playerRef.current?.load(customUrl.trim())
            setDemoUrl(customUrl.trim())
        }
    }

    return (
        <div className="min-h-screen bg-midnight text-white selection:bg-neon-cyan selection:text-midnight font-inter overflow-hidden">

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-neon-cyan/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-electric-purple/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <Logo className="w-8 h-8" />
                    <span className="font-bold tracking-tighter text-xl">LORAPOK</span>
                </div>
                <div className="flex gap-6 text-sm font-mono text-white/60">
                    <a href="#features" className="hover:text-neon-cyan transition-colors uppercase">Features</a>
                    <a href="#demo" className="hover:text-neon-cyan transition-colors uppercase">Demo</a>
                    <a href="#requirements" className="hover:text-neon-cyan transition-colors uppercase">Requirements</a>
                    <a href="https://github.com/Maijied/Lorapok_Media_Player" className="hover:text-neon-cyan transition-colors uppercase">Github</a>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col gap-32">

                {/* Hero Section */}
                <section className="flex flex-col items-center text-center gap-8 pt-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-neon-cyan/20 blur-3xl animate-pulse" />
                        <Logo className="w-48 h-48 relative z-10 drop-shadow-[0_0_50px_rgba(0,243,255,0.5)]" />
                    </motion.div>

                    <div className="space-y-4 max-w-5xl px-4">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[calc(-0.02em)] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 leading-[0.95] uppercase break-words">
                            Supercomputing
                            <br />
                            Media Engine
                        </h1>
                        <p className="text-xl md:text-2xl text-neon-cyan/80 font-mono tracking-wide">
                            Biological Aesthetics meets Ultra-Performance Playback
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-8">
                        <a href="#demo" className="px-10 py-4 bg-neon-cyan text-midnight font-black rounded-none transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:bg-white hover:scale-105 active:scale-95">
                            <Zap className="w-5 h-5 fill-current" />
                            <span className="tracking-tighter text-sm uppercase">Try Live Demo</span>
                        </a>
                        <a href="#download" className="px-10 py-4 bg-[#bc13fe] text-white font-black rounded-none transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(188,19,254,0.3)] hover:bg-white hover:text-black hover:scale-105 active:scale-95">
                            <Download className="w-5 h-5" />
                            <span className="tracking-tighter text-sm uppercase">Download v1.3.0</span>
                        </a>
                    </div>
                </section>

                {/* Live Demo Section */}
                <section id="demo" className="w-full max-w-5xl mx-auto scroll-mt-32">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <Zap className="w-6 h-6 text-neon-cyan" />
                            LIVE_DEMO
                        </h2>

                        {/* URL Input Box */}
                        <form onSubmit={handleCustomUrlPlay} className="flex-1 max-w-lg w-full flex gap-2">
                            <input
                                type="text"
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                placeholder="Paste .m3u8, .mpd or video URL..."
                                className="flex-1 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm font-mono focus:outline-none focus:border-neon-cyan/50 transition-colors"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-neon-cyan text-midnight font-bold rounded-lg text-sm hover:bg-white transition-colors uppercase"
                            >
                                Test_Link
                            </button>
                        </form>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setDemoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")}
                                className={`px-3 py-1 text-xs font-mono border rounded ${demoUrl.includes('BigBuckBunny') ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10' : 'border-white/10 text-white/50'}`}
                            >
                                MP4
                            </button>
                            <button
                                onClick={() => setDemoUrl("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8")}
                                className={`px-3 py-1 text-xs font-mono border rounded ${demoUrl.includes('.m3u8') ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10' : 'border-white/10 text-white/50'}`}
                            >
                                HLS
                            </button>
                            <button
                                onClick={() => setDemoUrl("https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd")}
                                className={`px-3 py-1 text-xs font-mono border rounded ${demoUrl.includes('.mpd') ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10' : 'border-white/10 text-white/50'}`}
                            >
                                DASH
                            </button>
                        </div>
                    </div>

                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-black">
                        <LorapokPlayer
                            ref={playerRef}
                            src={demoUrl}
                            className="w-full h-full"
                            autoPlay={false}
                        />
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-12">
                        <Cpu className="w-8 h-8 text-neon-cyan" />
                        <h2 className="text-3xl font-bold uppercase tracking-tight">Engine Capabilities</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Cpu, title: "Neural Decoding V2", desc: "FFmpeg-powered pipeline for high-performance MKV, AVI, WMV, and FLV playback." },
                            { icon: Globe, title: "Universal Stream", desc: "Native support for HLS (.m3u8) and DASH (.mpd) with zero-rebuffer track switching." },
                            { icon: CheckCircle, title: "Robust Probing", desc: "Intelligent metadata discovery (FFprobe) for 100% accurate duration and seeking." },
                            { icon: Zap, title: "Organic UI Engine", desc: "Dynamic ambient lighting that synchronizes reactive background color with video frames." },
                            { icon: CheckCircle, title: "Smart Resume", desc: "Atomic position tracking to resume playback precisely where you exited last time." },
                            { icon: Zap, title: "Hardware Accel", desc: "GPU-accelerated rasterization delivering buttery smooth 4K/8K media performance." }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-neon-cyan/30 transition-all group">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 text-neon-cyan group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-white/60 leading-relaxed font-mono text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Requirements Section */}
                <section id="requirements" className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-12">
                        <Info className="w-8 h-8 text-electric-purple" />
                        <h2 className="text-3xl font-bold uppercase tracking-tight">System Requirements</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 bg-white/5 font-bold text-sm tracking-widest text-white/50">DESKTOP APPLICATION</div>
                            <div className="p-6 space-y-6">
                                {[
                                    { label: 'OS', value: 'Windows 10+, macOS 12+, Ubuntu 22.04+' },
                                    { label: 'CPU', value: 'Dual Core 2.0GHz (Quad Core 3.0GHz+ Recommended)' },
                                    { label: 'RAM', value: '4 GB (8 GB+ Recommended)' },
                                    { label: 'GPU', value: 'DirectX 11 / OpenGL 4.1 or Newer' }
                                ].map((req, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <span className="text-sm font-mono text-white/40">{req.label}</span>
                                        <span className="text-sm font-bold text-neon-cyan">{req.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 bg-white/5 font-bold text-sm tracking-widest text-white/50">NPM PACKAGE & DEV</div>
                            <div className="p-6 space-y-6">
                                {[
                                    { label: 'Node.js', value: 'v20.x or higher (LTS)' },
                                    { label: 'NPM', value: 'v10.x or higher' },
                                    { label: 'Framework', value: 'React 18.x compatible' },
                                    { label: 'Bundler', value: 'Vite / Webpack / Turbopack' }
                                ].map((req, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <span className="text-sm font-mono text-white/40">{req.label}</span>
                                        <span className="text-sm font-bold text-electric-purple">{req.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Shortcuts Section */}
                <section id="shortcuts" className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-12">
                        <Keyboard className="w-8 h-8 text-neon-cyan" />
                        <h2 className="text-3xl font-bold uppercase tracking-tight">Keyboard Shortcuts</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { group: 'PLAYBACK', items: [['SPACE', 'Play / Pause'], ['← / →', 'Seek 5s'], ['[ / ]', 'Set A-B Loop'], ['\\', 'Clear Loop']] },
                            { group: 'AUDIO', items: [['↑ / ↓', 'Volume Up/Down'], ['M', 'Mute Toggle']] },
                            { group: 'TOOLS', items: [['S', 'Screenshot'], ['Shift+S', 'Burst Mode'], ['C', 'Clip It (Export)'], ['Ghost', 'Incognito']] },
                            { group: 'WINDOW', items: [['F', 'Fullscreen'], ['A', 'Aspect Ratio'], ['Alt+C', 'Local Casting'], ['?', 'Help Toggle']] }
                        ].map((grp, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                                <h4 className="text-xs font-bold text-neon-cyan/50 mb-4 tracking-widest uppercase">{grp.group}</h4>
                                <div className="space-y-3">
                                    {grp.items.map(([key, label], j) => (
                                        <div key={j} className="flex flex-col">
                                            <span className="text-xs font-bold font-mono text-white">{key}</span>
                                            <span className="text-[10px] text-white/40 uppercase">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Downloads Section */}
                <section id="download" className="w-full max-w-5xl mx-auto scroll-mt-32">
                    <div className="flex items-center gap-4 mb-8">
                        <Download className="w-8 h-8 text-neon-cyan" />
                        <h2 className="text-3xl font-bold uppercase tracking-tight">Get Lorapok Desktop</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {[
                            { os: 'Windows', ext: '.exe', desc: 'Windows 10/11 (x64)', file: 'Windows-Setup.exe' },
                            { os: 'macOS', ext: '.dmg', desc: 'Universal (Intel/Apple Silicon)', file: 'Mac-Installer.dmg' },
                            { os: 'Linux', ext: '.AppImage', desc: 'Most Distributions (x64)', file: 'Linux.AppImage' }
                        ].map((build) => (
                            <a
                                key={build.os}
                                href={`https://github.com/Maijied/Lorapok_Media_Player/releases/download/latest/LorapokMediaPlayer-${build.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-neon-cyan/50 transition-all group flex flex-col gap-4"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold">{build.os}</h3>
                                    <div className="w-8 h-8 rounded-full bg-neon-cyan/10 flex items-center justify-center text-neon-cyan">
                                        <Download className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <p className="text-sm font-mono text-white/50 mb-1">{build.desc}</p>
                                    <div className="text-xs text-neon-cyan font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                        Download Build {build.ext}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Snap Store Integration */}
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-1 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <span className="text-xs font-bold tracking-[0.2em] text-white/50">OFFICIAL SNAP STORE PORTAL</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                            </div>
                        </div>
                        <div className="bg-black/20">
                            <iframe
                                src="https://snapcraft.io/lorapokmediaplayer/embedded?button=black&channels=true&summary=true"
                                frameborder="0"
                                width="100%"
                                height="420px"
                                style={{ border: 'none', borderRadius: '0px' }}
                                title="Snap Store Installation"
                            />
                        </div>
                    </div>
                </section>

                <section className="text-center py-20 border-t border-white/5">
                    <h2 className="text-4xl font-black mb-8">Ready to Integrate?</h2>
                    <div className="bg-black/50 p-6 rounded-xl border border-white/10 max-w-md mx-auto font-mono text-left">
                        <div className="flex gap-2 mb-4 opacity-50">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <p className="text-electric-purple mb-2">$ npm install lorapok-player</p>
                        <p className="text-white/50 text-sm">
                            import {'{ LorapokPlayer }'} from 'lorapok-player';<br />
                            import 'lorapok-player/style.css';
                        </p>
                    </div>
                </section>

            </main>

            <footer className="py-8 text-center text-white/20 font-mono text-xs border-t border-white/5">
                <p>&copy; 2026 LORAPOK TEAM. ALL RIGHTS RESERVED.</p>
            </footer>
        </div>
    )
}

export default App
