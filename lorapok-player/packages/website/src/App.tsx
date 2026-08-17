import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LorapokPlayer, Logo } from 'lorapok-player'
import type { LorapokPlayerRef } from 'lorapok-player'
import { Download, Zap, Cpu, Globe, CheckCircle, Monitor, X, ChevronDown, Terminal, Code2, Layers, Play } from 'lucide-react'

const FAQ_ITEMS = [
    { q: "What formats does Lorapok support?", a: "Lorapok natively supports HLS (.m3u8), DASH (.mpd), MP4, WebM, and MKV through our FFmpeg-powered pipeline. Neural Decoding V2 ensures zero-rebuffer track switching." },
    { q: "Is hardware acceleration supported?", a: "Yes, Lorapok leverages GPU-accelerated rasterization to deliver buttery smooth 4K and 8K media performance across all compatible platforms." },
    { q: "How do I use the API?", a: "You can control playback, track switching, and audio processing directly via the LorapokPlayerRef in React. We expose a comprehensive API for advanced developers." },
    { q: "Can I use it commercially?", a: "Lorapok is open-source under the MIT license and is completely free for both personal and commercial use." }
]

function App() {
    const [demoUrl, setDemoUrl] = useState("/demos/neon_waves.mp4")
    const [customUrl, setCustomUrl] = useState("")
    const [activeFaq, setActiveFaq] = useState<number | null>(null)
    const playerRef = useRef<LorapokPlayerRef>(null)

    // Android Update Notification State
    const [showAndroidNotice, setShowAndroidNotice] = useState(() => {
        return !localStorage.getItem('lorapok_website_android_notified');
    });

    const dismissAndroidNotice = () => {
        localStorage.setItem('lorapok_website_android_notified', 'true');
        setShowAndroidNotice(false);
    };

    const handleCustomUrlPlay = (e: React.FormEvent) => {
        e.preventDefault()
        if (customUrl.trim()) {
            playerRef.current?.load(customUrl.trim())
            setDemoUrl(customUrl.trim())
        }
    }

    const revealVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    }

    return (
        <div className="min-h-screen bg-[#030305] text-white selection:bg-neon-cyan selection:text-midnight font-inter overflow-hidden">

            {/* Android Update Notification Modal */}
            <AnimatePresence>
                {showAndroidNotice && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-[#030305]/80 backdrop-blur-md p-4"
                >
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-electric-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <button 
                        onClick={dismissAndroidNotice}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    <div className="flex flex-col items-center text-center gap-6 relative z-10">
                        <div className="w-20 h-20 rounded-full bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/50 shadow-[0_0_30px_rgba(0,243,255,0.3)]">
                        <Monitor className="w-10 h-10 text-neon-cyan" />
                        </div>
                        
                        <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Android Version is Here!</h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Lorapok Player is now officially available for Android devices. Take your organic media experience everywhere.
                        </p>
                        </div>

                        <a 
                        href="https://github.com/Maijied/Lorapok_Media_Player/releases/latest"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-neon-cyan text-midnight font-black uppercase tracking-widest rounded-xl hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.2)]"
                        onClick={dismissAndroidNotice}
                        >
                        <Download className="w-5 h-5" />
                        Download APK
                        </a>
                    </div>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-neon-cyan/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-electric-purple/5 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm border-b border-white/5 sticky top-0">
                <div className="flex items-center gap-3">
                    <Logo className="w-8 h-8" />
                    <span className="font-bold tracking-tighter text-xl">LORAPOK</span>
                </div>
                <div className="hidden md:flex gap-8 text-sm font-bold tracking-widest text-white/60">
                    <a href="#features" className="hover:text-neon-cyan transition-colors uppercase">Features</a>
                    <a href="#demo" className="hover:text-neon-cyan transition-colors uppercase">Demo</a>
                    <a href="#requirements" className="hover:text-neon-cyan transition-colors uppercase">Requirements</a>
                    <a href="#faq" className="hover:text-neon-cyan transition-colors uppercase">FAQ</a>
                </div>
                <a href="https://github.com/Maijied/Lorapok_Media_Player" className="hidden md:flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-mono text-sm transition-all border border-white/10">
                    <Code2 className="w-4 h-4" /> Github
                </a>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col gap-32">

                {/* Hero Section */}
                <section className="flex flex-col items-center text-center gap-8 pt-10 min-h-[70vh] justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-neon-cyan/30 blur-3xl animate-pulse" />
                        <Logo className="w-48 h-48 relative z-10 drop-shadow-[0_0_50px_rgba(0,243,255,0.5)]" />
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-6 max-w-5xl px-4"
                    >
                        <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 leading-[0.9] uppercase">
                            Supercomputing<br />Media Engine
                        </h1>
                        <p className="text-xl md:text-2xl text-neon-cyan font-mono tracking-wide">
                            Biological Aesthetics meets Ultra-Performance Playback
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-wrap gap-4 mt-8"
                    >
                        <a href="#demo" className="px-10 py-5 bg-neon-cyan text-midnight font-black rounded-full transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(0,243,255,0.4)] hover:bg-white hover:scale-105 active:scale-95">
                            <Zap className="w-5 h-5 fill-current" />
                            <span className="tracking-widest text-sm uppercase">Try Live Demo</span>
                        </a>
                        <a href="#download" className="px-10 py-5 bg-white/5 border border-white/20 backdrop-blur-md text-white font-black rounded-full transition-all flex items-center gap-2 hover:bg-white hover:text-black hover:scale-105 active:scale-95">
                            <Download className="w-5 h-5" />
                            <span className="tracking-widest text-sm uppercase">Download App</span>
                        </a>
                    </motion.div>
                </section>

                {/* Live Demo Section */}
                <motion.section 
                    variants={revealVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    id="demo" 
                    className="w-full max-w-5xl mx-auto scroll-mt-32"
                >
                    <div className="flex flex-col gap-8 mb-8 p-8 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-neon-cyan" />
                            </div>
                            <h2 className="text-3xl font-bold uppercase tracking-widest">Live Integration</h2>
                        </div>

                        {/* URL Input Box */}
                        <form onSubmit={handleCustomUrlPlay} className="flex gap-2 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Globe className="w-5 h-5 text-white/30" />
                            </div>
                            <input
                                type="text"
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                placeholder="Paste any .m3u8, .mpd, .mp4, or stream URL..."
                                className="flex-1 bg-black/40 border border-white/10 pl-12 pr-4 py-4 rounded-xl text-sm font-mono focus:outline-none focus:border-neon-cyan/50 transition-colors placeholder:text-white/30"
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 bg-neon-cyan text-midnight font-bold rounded-xl text-sm hover:bg-white transition-colors uppercase tracking-widest flex items-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-current" /> Play
                            </button>
                        </form>

                        {/* Sample Streams Gallery */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { label: 'Neon Waves', url: '/demos/neon_waves.mp4', type: 'MP4' },
                                { label: 'Cyber Grid', url: '/demos/hls/cyber_grid.m3u8', type: 'HLS' },
                                { label: 'Fractal Engine', url: '/demos/dash/fractal_dash.mpd', type: 'DASH' },
                            ].map((stream, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setDemoUrl(stream.url)}
                                    className={`px-4 py-3 border rounded-xl transition-all text-left flex items-center gap-3 group ${demoUrl === stream.url ? 'border-neon-cyan bg-neon-cyan/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] ${demoUrl === stream.url ? 'bg-neon-cyan text-midnight font-bold' : 'bg-white/10 text-white/50 group-hover:bg-white/20'}`}>
                                        {stream.type}
                                    </div>
                                    <span className={`block truncate font-bold text-sm ${demoUrl === stream.url ? 'text-neon-cyan' : 'text-white/70 group-hover:text-white'}`}>{stream.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="aspect-video w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative bg-black group p-2 bg-gradient-to-br from-white/5 to-white/0">
                        <div className="w-full h-full rounded-3xl overflow-hidden relative border border-white/5">
                            <LorapokPlayer
                                ref={playerRef}
                                src={demoUrl}
                                className="w-full h-full"
                                autoPlay={false}
                            />
                        </div>
                    </div>
                </motion.section>

                {/* Features Grid */}
                <motion.section 
                    variants={revealVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    id="features" 
                    className="scroll-mt-32"
                >
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Engine Capabilities</h2>
                        <p className="text-white/50 font-mono">Next-generation features for uncompromising performance.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Cpu, title: "Neural Decoding V2", desc: "FFmpeg-powered pipeline for high-performance MKV, AVI, WMV, and FLV playback." },
                            { icon: Globe, title: "Universal Stream", desc: "Native support for HLS (.m3u8) and DASH (.mpd) with zero-rebuffer track switching." },
                            { icon: CheckCircle, title: "Robust Probing", desc: "Intelligent metadata discovery (FFprobe) for 100% accurate duration and seeking." },
                            { icon: Layers, title: "Organic UI Engine", desc: "Dynamic ambient lighting that synchronizes reactive background color with video frames." },
                            { icon: Monitor, title: "Smart Resume", desc: "Atomic position tracking to resume playback precisely where you exited last time." },
                            { icon: Zap, title: "Hardware Accel", desc: "GPU-accelerated rasterization delivering buttery smooth 4K/8K media performance." }
                        ].map((feature, i) => (
                            <motion.div 
                                whileHover={{ y: -5 }}
                                key={i} 
                                className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 hover:border-neon-cyan/50 hover:bg-white/10 transition-all group shadow-xl"
                            >
                                <div className="w-14 h-14 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-6 text-neon-cyan group-hover:scale-110 transition-transform shadow-inner">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-wide">{feature.title}</h3>
                                <p className="text-white/60 leading-relaxed font-mono text-sm">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* API Teaser */}
                <motion.section 
                    variants={revealVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="w-full max-w-5xl mx-auto border border-white/10 bg-white/5 backdrop-blur-xl rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl"
                >
                    <div className="p-10 md:w-1/2 flex flex-col justify-center">
                        <Terminal className="w-10 h-10 text-electric-purple mb-6" />
                        <h2 className="text-3xl font-black uppercase mb-4">Developer Ready</h2>
                        <p className="text-white/60 font-mono text-sm leading-relaxed mb-8">
                            Integrate the Lorapok Player into your own React applications in seconds. We expose a robust API with full TypeScript support, custom hooks, and event listeners.
                        </p>
                        <a href="https://www.npmjs.com/package/lorapok-player" target="_blank" rel="noopener noreferrer" className="self-start px-6 py-3 bg-white text-black font-bold rounded-full uppercase tracking-widest text-xs hover:bg-neon-cyan transition-colors flex items-center gap-2">
                            View on NPM &rarr;
                        </a>
                    </div>
                    <div className="md:w-1/2 bg-[#09090b] p-8 border-l border-white/10 relative overflow-hidden font-mono text-sm leading-loose">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><Logo className="w-32 h-32" /></div>
                        <div className="text-electric-purple">npm <span className="text-white">install lorapok-player</span></div>
                        <br/>
                        <div className="text-white/40">{'// App.tsx'}</div>
                        <div><span className="text-neon-cyan">import</span> {'{ LorapokPlayer }'} <span className="text-neon-cyan">from</span> <span className="text-green-400">'lorapok-player'</span>;</div>
                        <div><span className="text-neon-cyan">import</span> <span className="text-green-400">'lorapok-player/style.css'</span>;</div>
                        <br/>
                        <div><span className="text-neon-cyan">function</span> <span className="text-blue-400">App</span>() {'{'}</div>
                        <div className="pl-4"><span className="text-neon-cyan">return</span> (</div>
                        <div className="pl-8 text-white/80">{'<LorapokPlayer'}</div>
                        <div className="pl-12 text-electric-purple">src=<span className="text-green-400">"stream.m3u8"</span></div>
                        <div className="pl-12 text-electric-purple">autoPlay=<span className="text-orange-400">true</span></div>
                        <div className="pl-12 text-electric-purple">ambientMode=<span className="text-orange-400">true</span></div>
                        <div className="pl-8 text-white/80">{'>'}</div>
                        <div className="pl-4">)</div>
                        <div>{'}'}</div>
                    </div>
                </motion.section>

                {/* FAQ Section */}
                <motion.section 
                    variants={revealVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    id="faq" 
                    className="max-w-3xl mx-auto w-full scroll-mt-32"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black uppercase tracking-tight">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-4">
                        {FAQ_ITEMS.map((faq, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                                <button 
                                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                    className="w-full p-6 text-left flex justify-between items-center font-bold text-lg hover:bg-white/5 transition-colors"
                                >
                                    {faq.q}
                                    <ChevronDown className={`w-5 h-5 transition-transform ${activeFaq === i ? 'rotate-180 text-neon-cyan' : 'text-white/50'}`} />
                                </button>
                                <AnimatePresence>
                                    {activeFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 text-white/60 font-mono text-sm leading-relaxed border-t border-white/5">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Downloads Section */}
                <motion.section 
                    variants={revealVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    id="download" 
                    className="w-full max-w-5xl mx-auto scroll-mt-32 bg-white/5 border border-white/10 p-12 rounded-[3rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-electric-purple to-neon-cyan" />
                    <div className="flex flex-col items-center text-center gap-6 mb-12 relative z-10">
                        <div className="w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/30 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
                            <Download className="w-8 h-8 text-neon-cyan" />
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tight">Download the App</h2>
                        <div className="flex gap-2 items-center">
                            <span className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-mono text-cyan-400 border border-white/10 uppercase tracking-widest">Stable Release v1.4.0</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                        {[
                            { os: 'Windows', ext: '.exe', file: 'Windows-Setup.exe' },
                            { os: 'macOS', ext: '.dmg', file: 'Mac-Installer.dmg' },
                            { os: 'Linux', ext: '.AppImage', file: 'Linux.AppImage' },
                            { os: 'Android', ext: '.apk', file: 'release.apk' }
                        ].map((build) => (
                            <a
                                key={build.os}
                                href={`https://github.com/Maijied/Lorapok_Media_Player/releases/download/latest/LorapokMediaPlayer-${build.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-6 bg-black/40 border border-white/10 rounded-2xl hover:bg-neon-cyan/10 hover:border-neon-cyan/50 transition-all group flex flex-col items-center text-center gap-4"
                            >
                                <h3 className="text-xl font-bold">{build.os}</h3>
                                <div className="text-xs font-mono text-white/50 group-hover:text-neon-cyan transition-colors">
                                    Get {build.ext} &rarr;
                                </div>
                            </a>
                        ))}
                    </div>
                </motion.section>

            </main>

            <footer className="py-12 text-center text-white/40 font-mono text-sm border-t border-white/5 relative z-10 bg-[#030305]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-3 opacity-50">
                        <Logo className="w-6 h-6 grayscale" />
                        <span>A product of Lorapok Labs</span>
                        <a href="https://lorapok.tech" className="hover:text-neon-cyan transition-colors" target="_blank" rel="noopener noreferrer">lorapok.tech</a>
                        <span>&copy; 2026 Lorapok Labs</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="https://github.com/Maijied/Lorapok_Media_Player" className="hover:text-white transition-colors">GitHub</a>
                        <a href="https://lorapok.tech" className="hover:text-white transition-colors">Company</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    </div>
                </div>
            </footer>

            {/* LorapokToon Watermark */}
            <div className="fixed bottom-4 right-4 z-[100] text-white/20 font-black tracking-widest pointer-events-none uppercase text-xs">
                LorapokToon
            </div>
        </div>
    )
}

export default App
