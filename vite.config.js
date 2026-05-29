import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const useHttps = process.env.VITE_DEV_HTTPS === 'true'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,
    https: useHttps
  },
  preview: {
    host: true,
    https: useHttps
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})