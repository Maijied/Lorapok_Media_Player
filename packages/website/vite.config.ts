import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/lorapok-player/', // Assuming repo name is lorapok-player, adjust if needed
})
