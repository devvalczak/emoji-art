import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this repo from /emoji-art/, so only the production
  // build needs the non-root base — dev/preview stay at "/".
  base: command === 'build' ? '/emoji-art/' : '/',
  plugins: [react()],
}))
