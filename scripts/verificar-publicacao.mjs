// Barreira de publicação comercial. Roda no build (package.json) e só age quando o build
// é o comercial (VITE_ACALMA_MODO=integrado): falha se os termos/privacidade ainda tiverem
// trechos pendentes [entre colchetes] ou versão "rascunho". O preview de demonstração
// continua publicando os rascunhos, rotulados como tal.
// Confere os TEXTOS FINAIS (o módulo é importado), não o código-fonte: um array do
// TypeScript não é confundido com um trecho pendente.
if (process.env.VITE_ACALMA_MODO !== 'integrado') process.exit(0)

// ACALMA_DOCUMENTOS_TESTE: só para o teste da própria barreira (arquivo de rascunho de exemplo).
const { pathToFileURL } = await import('node:url')
const alvo = process.env.ACALMA_DOCUMENTOS_TESTE
  ? pathToFileURL(process.env.ACALMA_DOCUMENTOS_TESTE)
  : new URL('../src/content/documentos.ts', import.meta.url)
const { termos, privacidade } = await import(alvo)
const problemas = []
for (const doc of [termos, privacidade]) {
  if (!doc?.versao || /rascunho/i.test(doc.versao)) problemas.push(`${doc?.titulo}: versão "${doc?.versao}"`)
  for (const s of doc.secoes)
    for (const p of [s.titulo, ...s.paragrafos])
      for (const m of p.matchAll(/\[[^\]]{2,}\]/g)) problemas.push(`${doc.titulo} › ${s.titulo}: ${m[0]}`)
}
if (problemas.length) {
  console.error('Publicação comercial bloqueada: termos/privacidade ainda são rascunho.')
  for (const p of problemas) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(`Termos ${termos.versao} e privacidade ${privacidade.versao}: sem pendências.`)
