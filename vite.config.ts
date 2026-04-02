import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    UnoCSS(),
  ],
  base: '/CodeMyPage/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        preview: 'preview.html',
      },
    },
  },
})
