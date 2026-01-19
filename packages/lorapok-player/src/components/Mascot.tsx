import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';

// Mascot Component (Meta-Grade Minimalist)
export const Mascot = memo(({ state }: { state: 'idle' | 'playing' | 'buffering' | 'error' }) => {
    return (
        <div className="relative w-48 h-48 flex items-center justify-center pointer-events-none select-none">
            <div className={`absolute inset-0 rounded-full blur-3xl transition-colors duration-1000 ${state === 'playing' ? 'bg-neon-cyan/10' :
                state === 'buffering' ? 'bg-electric-purple/10' :
                    state === 'error' ? 'bg-red-500/10' : 'bg-white/5'
                }`} />

            <Logo className="w-32 h-32 relative z-10" />

            {/* Dynamic Status Rings */}
            <motion.div
                animate={{
                    rotate: state === 'playing' ? 360 : 0,
                    scale: state === 'buffering' ? [1, 1.1, 1] : 1
                }}
                transition={{
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                }}
                className={`absolute inset-0 border-2 rounded-full border-t-white/20 border-r-white/5 border-b-white/5 border-l-white/20 ${state === 'error' ? 'border-red-500/40' : ''}`}
            />
        </div>
    )
});
