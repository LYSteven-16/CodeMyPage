import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

const configPlugin = () => ({
  name: 'config-loader',
  transform(code: string, id: string) {
    if (id.endsWith('.config')) {
      return {
        code: `export default ${code}`,
        map: null
      }
    }
    return null
  }
})

export default defineConfig({
  plugins: [
    UnoCSS(),
    configPlugin(),
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
