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
        name: 'Pralis Conduta',
        short_name: 'Pralis',
        description: 'Código de Ética e Conduta da Padaria Pralis',
        theme_color: '#5e3731',
        background_color: '#5e3731',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
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
