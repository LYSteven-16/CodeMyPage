import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  shortcuts: {
    'btn': 'px-3 py-1.5 rounded-xl text-13px font-500 transition-all cursor-pointer',
    'btn-icon': 'w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer',
    'panel': 'rounded-2xl bg-white/95 backdrop-blur-xl',
  },
  theme: {
    colors: {
      ios: {
        text: '#1d1d1f',
        secondary: '#8e8e93',
        blue: '#007aff',
        red: '#ff3b30',
        bg: '#f5f5f7',
      }
    }
  }
})
