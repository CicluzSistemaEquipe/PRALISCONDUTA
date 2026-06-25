import fs from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

const BROKEN_PUBLIC_ENTRIES = new Set(['video-lis-questionario'])

function copyPublicAssetsPlugin(): Plugin {
  const copyDir = (from: string, to: string, root = true) => {
    fs.mkdirSync(to, { recursive: true })
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      if (root && BROKEN_PUBLIC_ENTRIES.has(entry.name)) continue

      const source = path.join(from, entry.name)
      const target = path.join(to, entry.name)
      if (entry.isDirectory()) {
        copyDir(source, target, false)
      } else if (entry.isFile()) {
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
  },
})
