import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // read BROWSER from .env so the auto-open target is configurable, not hardcoded
  const env = loadEnv(mode, process.cwd(), '')
  if (env.BROWSER) process.env.BROWSER = env.BROWSER

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      open: '/',
    },
  }
})