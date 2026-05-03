import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['giggly-rummage-wanted.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://web:3000',
        changeOrigin: true
      }
    }
  }
})
