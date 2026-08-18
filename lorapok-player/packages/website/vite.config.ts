import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/',
    build: {
        target: 'esnext',
        minify: 'esbuild',
        cssCodeSplit: true,
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('hls.js') || id.includes('dashjs')) {
                            return 'vendor-media'
                        }
                        if (id.includes('canvas-confetti')) {
                            return 'vendor-confetti'
                        }
                        if (id.includes('lucide-react')) {
                            return 'vendor-icons'
                        }
                    }
                }
            }
        }
    }
})

