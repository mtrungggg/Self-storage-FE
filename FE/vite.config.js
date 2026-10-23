import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // read BROWSER from .env so the auto-open target is configurable, not hardcoded
  const env = loadEnv(mode, process.cwd(), '')
  if (env.BROWSER) process.env.BROWSER = env.BROWSER

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'esnext',
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('framer-motion') || id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('html5-qrcode')) {
                return 'vendor-qrcode';
              }
              if (id.includes('gsap')) {
                return 'vendor-gsap';
              }
              if (id.includes('axios')) {
                return 'vendor-axios';
              }
            }
          },
        },
      },
    },
    server: {
      open: '/',
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
    },
  }
})
