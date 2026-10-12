/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/*
 * Protótipo da nova experiência do Acalma.
 *
 * - Service worker próprio (src/sw.ts): guarda só o app, nunca respostas da API.
 * - Fora do contexto "production" do Netlify (preview de PR, branch, local),
 *   a página sai com noindex.
 */
function semIndexacaoForaDeProducao(): Plugin {
  return {
    name: 'acalma-noindex-fora-de-producao',
    transformIndexHtml(html) {
      if (process.env.CONTEXT === 'production') return html
      return html.replace('</head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>')
    },
  }
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    semIndexacaoForaDeProducao(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false,
      registerType: 'autoUpdate',
      injectManifest: { globPatterns: ['**/*.{js,css,html,svg,woff2,png,ico,webmanifest}'] },
      manifest: {
        name: 'Acalma',
        short_name: 'Acalma',
        description: 'Ajuda prática na hora da birra e combinados visuais.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#FDF8F3',
        background_color: '#FDF8F3',
        icons: [
          { src: '/icons/acalma-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/acalma-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/acalma-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
