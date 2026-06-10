import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/kauth': {
        target: 'https://kauth.kakao.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kauth/, ''),
      },
      '/kapi': {
        target: 'https://kapi.kakao.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kapi/, ''),
      },
    },
  },
})
