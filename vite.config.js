import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base path: "/" for Vercel, "/bishleshok.ai" for GitHub Pages
const base = process.env.VITE_BASE_PATH || "/";

export default defineConfig({
  plugins: [react()],
  base: base
})
