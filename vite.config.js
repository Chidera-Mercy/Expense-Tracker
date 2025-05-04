import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // Explicitly set the base path
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
