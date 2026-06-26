import fs from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

const BROKEN_PUBLIC_ENTRIES = new Set(['video-lis-questionario'])

// Só copiamos para o build os formatos realmente servidos pelo app. As fontes
// de edição (.mov, .gif, .tmp, .sfk…) ficam em public/ apenas para referência e
// NÃO vão para dist/ — isso reduz o output de ~5GB para ~200MB.
const SERVED_EXTENSIONS = new Set([
  '.mp4', '.webm', '.mp3', '.m4a', '.ogg', '.wav',
  '.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.ico',
  '.json', '.txt', '.xml', '.woff', '.woff2', '.riv', '.lottie',
])
// .gif e .mov NÃO entram: auditoria confirmou 0 referências em src (peso morto).
const ALWAYS_COPY_NAMES = new Set(['_redirects', '_headers', 'robots.txt', 'manifest.webmanifest'])

function copyPublicAssetsPlugin(): Plugin {
  const copyDir = (from: string, to: string, root = true) => {
    let made = false
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      if (root && BROKEN_PUBLIC_ENTRIES.has(entry.name)) continue

      const source = path.join(from, entry.name)
      const target = path.join(to, entry.name)
      if (entry.isDirectory()) {
        copyDir(source, target, false)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (!SERVED_EXTENSIONS.has(ext) && !ALWAYS_COPY_NAMES.has(entry.name)) continue
        if (!made) {
          fs.mkdirSync(to, { recursive: true })
          made = true
        }
        fs.copyFileSync(source, target)
      }
    }
  }

  return {
    name: 'copy-public-assets-with-local-skips',
    apply: 'build',
    closeBundle() {
      copyDir(path.resolve(__dirname, 'public'), path.resolve(__dirname, 'dist'))
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copyPublicAssetsPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'favicon.svg'],
      manifest: {
        name: 'Pralís Conduta',
        short_name: 'Pralís',
        description: 'Código de Ética e Conduta da Padaria Pralís — experiência interativa de treinamento.',
        lang: 'pt-BR',
        theme_color: '#B8860B',
        background_color: '#2E1A10',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    copyPublicDir: false,
    rollupOptions: {
      output: {
        // Separa libs pesadas em chunks de vendor estáveis → cache entre deploys.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('@rive-app')) return 'vendor-rive'
          if (id.includes('lottie')) return 'vendor-lottie'
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'vendor-react'
        },
      },
    },
  },
})
