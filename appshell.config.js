import { defineAppShellConfig } from 'fzl-fund-appshell--lit/config'

export default defineAppShellConfig({
  title: '3DPrinter4You',
  storagePrefix: '3dprinter4you',
  accessibility: {
    fonts: ['atkinson', 'opendyslexic'],
    themes: ['light', 'dark', 'high-contrast-light', 'high-contrast-dark'],
    textScale: { min: 1, max: 2 },
    defaults: { font: 'system', theme: 'system', textScale: 1 },
  },
  analytics: {
    requireConsent: false,
  },
  base: process.env.VITE_BASE_PATH || '/',
  manifest: {
    name: '3DPrinter4You — Impressão 3D sob Demanda',
    short_name: '3DPrinter4You',
    description: 'Catálogo de modelos 3D interativos, orçamentos em tempo real e pedidos de impressão sob demanda',
    lang: 'pt-BR',
    start_url: '.',
    display: 'standalone',
    background_color: '#fffbfe',
    theme_color: '#0284c7',
    icons: [48, 72, 96, 128, 144, 152, 192, 384, 512]
      .map((s) => ({ src: `icons/icon-${s}.png`, sizes: `${s}x${s}`, type: 'image/png' }))
      .concat({ src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }),
  },
  workbox: {
    maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
  },
})
