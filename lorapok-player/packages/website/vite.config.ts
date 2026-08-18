import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/',
    resolve: {
        alias: {
            'framer-motion': path.resolve(__dirname, '../../node_modules/framer-motion/dist/cjs/index.js'),
            'react': path.resolve(__dirname, '../../node_modules/react'),
            'react-dom': path.resolve(__dirname, '../../node_modules/react-dom')
        }
    },
    build: {
        target: 'esnext',
        minify: 'esbuild',
        cssCodeSplit: true,
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                            return 'vendor-react'
                        }
                        if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
                            return 'vendor-motion'
                        }
                        if (id.includes('lucide-react')) {
                            return 'vendor-icons'
                        }
                        if (id.includes('hls.js') || id.includes('dashjs')) {
                            return 'vendor-media'
                        }
                        if (id.includes('canvas-confetti')) {
                            return 'vendor-confetti'
                        }
                        return 'vendor-deps'
                    }
                }
            }
        }
    }
})

