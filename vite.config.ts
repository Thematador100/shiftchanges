import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // Environment variables starting with VITE_ are automatically exposed via import.meta.env
  // No need to manually define them - Vite handles this automatically
  server: {
    proxy: {
      '/api': {
        target: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})