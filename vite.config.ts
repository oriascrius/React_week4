import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 設定 base 路徑
export default defineConfig({
  base: '/React_week4/',
  plugins: [react()]
})
