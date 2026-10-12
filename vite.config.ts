/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/*
 * Protótipo da nova experiência do Acalma.
 *
 * - Sem service worker e sem manifest: o protótipo não pode instalar nada no
 *   navegador nem disputar o escopo do app publicado. O offline de produção
 *   será desenhado e testado à parte (ver docs/prototipo/LEIA-ME.md).
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
  plugins: [tailwindcss(), react(), semIndexacaoForaDeProducao()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
