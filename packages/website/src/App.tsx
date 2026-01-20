import { useState } from 'react'
import { motion } from 'framer-motion'
import { LorapokPlayer, Logo } from 'lorapok-player'
import { Download, Zap, Cpu, Globe } from 'lucide-react'

function App() {
    const [demoUrl, setDemoUrl] = useState("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")

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
                    <a href="#features" className="hover:text-neon-cyan transition-colors">FEATURES</a>
                    <a href="#demo" className="hover:text-neon-cyan transition-colors">LIVE_DEMO</a>
                    <a href="https://github.com/Maijied/Lorapok_Media_Player" className="hover:text-neon-cyan transition-colors">GITHUB</a>
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

                    <div className="space-y-4 max-w-3xl">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 leading-[0.9]">
                            ORGANIC
                            <br />
                            INTELLIGENCE
                        </h1>
                        <p className="text-xl md:text-2xl text-neon-cyan/80 font-mono tracking-wide">
                            The Next-Gen Media Engine for Modern Web & Desktop
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-8">
                        <a href="#demo" className="px-10 py-4 bg-neon-cyan text-midnight font-black rounded-none transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:bg-white hover:scale-105 active:scale-95">
                            <Zap className="w-5 h-5 fill-current" />
                            <span className="tracking-tighter text-sm">LIVE DEMO</span>
                        </a>
                        <a href="#download" className="px-10 py-4 bg-[#bc13fe] text-white font-black rounded-none transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(188,19,254,0.3)] hover:bg-white hover:text-black hover:scale-105 active:scale-95">
                            <Download className="w-5 h-5" />
                            <span className="tracking-tighter text-sm">DOWNLOAD LATEST</span>
                        </a>
                    </div>
                </section>

                {/* Downloads Section */}
                <section id="download" className="w-full max-w-5xl mx-auto scroll-mt-32">
                    <div className="flex items-center gap-4 mb-8">
                        <Download className="w-8 h-8 text-neon-cyan" />
                        <h2 className="text-3xl font-bold">GET LORAPOK</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { os: 'Windows', ext: '.exe', desc: 'Windows 10/11 (x64)', icon: 'blocks' },
                            { os: 'macOS', ext: '.dmg', desc: 'Universal (Intel/Apple Silicon)', icon: 'command' },
                            { os: 'Linux', ext: '.AppImage', desc: 'Most Distributions (x64)', icon: 'terminal' }
                        ].map((build) => (
                            <a
                                key={build.os}
                                href="https://github.com/Maijied/Lorapok_Media_Player/releases/latest"
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
                                        Latest Build {build.ext}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Live Demo Section */}
                <section id="demo" className="w-full max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <Zap className="w-6 h-6 text-neon-cyan" />
                            LIVE_DEMO
                        </h2>
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
                            src={demoUrl}
                            className="w-full h-full"
                            autoPlay={false}
                        />
                    </div>
                    <p className="mt-4 text-center text-white/40 font-mono text-sm">
                        Powered by {'<LorapokPlayer />'} React Component
                    </p>
                </section>

                {/* Features Grid */}
                <section id="features" className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Cpu,
                            title: "Neural Decoder",
                            desc: "Advanced ffmpeg-based engine for universal format support (MKV, AVI, etc.) on Desktop."
                        },
                        {
                            icon: Globe,
                            title: "Universal Stream",
                            desc: "Native support for HLS (.m3u8), DASH (.mpd), and direct MP4/WebM streaming."
                        },
                        {
                            icon: Zap,
                            title: "Hardware Accel",
                            desc: "Optimized playback pipeline utilizing GPU acceleration for 4K/8K content."
                        },
                        {
                            icon: Cpu,
                            title: "Workstation Tools",
                            desc: "Phase 2: A-B Loop, Instant Segment Export ('Clip It'), and Burst Mode screenshots."
                        },
                        {
                            icon: Zap,
                            title: "Audio Intelligence",
                            desc: "Real-time Normalization (Night Mode), Voice Boost, and Spectrum Visualization."
                        },
                        {
                            icon: Globe,
                            title: "Network Hive",
                            desc: "Universal Protocol Browser (SMB/SFTP) and Local Network Casting."
                        }
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
                <p>&copy; 2024 LORAPOK TEAM. ALL RIGHTS RESERVED.</p>
            </footer>
        </div>
    )
}

export default App
