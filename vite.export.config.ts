import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  build: {
    outDir: 'dist-export',
    rollupOptions: {
      input: path.resolve(__dirname, 'export-entry.html')
    }
  }
})
