// Barreira de publicação comercial. Roda no build (package.json) e só age quando o build
// é o comercial (VITE_ACALMA_MODO=integrado): falha se os termos/privacidade ainda tiverem
// trechos pendentes [entre colchetes] ou versão "rascunho". O preview de demonstração
// continua publicando os rascunhos, rotulados como tal.
import { readFileSync } from 'node:fs'

if (process.env.VITE_ACALMA_MODO !== 'integrado') process.exit(0)

const texto = readFileSync(new URL('../src/content/documentos.ts', import.meta.url), 'utf8')
const semComentarios = texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const pendentes = [...semComentarios.matchAll(/\[[^\]'"]{3,}\]/g)].map((m) => m[0])
const rascunho = /versao:\s*'[^']*rascunho[^']*'/.test(semComentarios)

if (pendentes.length || rascunho) {
  console.error('Publicação comercial bloqueada: termos/privacidade ainda são rascunho.')
  if (rascunho) console.error('  - versão marcada como "rascunho"')
  for (const p of pendentes) console.error(`  - pendente: ${p}`)
  process.exit(1)
}
