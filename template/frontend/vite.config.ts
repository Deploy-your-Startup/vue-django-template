import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.FRONTEND_PORT || 8080),
    strictPort: true,
    proxy: { '/api': process.env.BACKEND_SERVICE_URL || 'http://127.0.0.1:8000' },
  },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
