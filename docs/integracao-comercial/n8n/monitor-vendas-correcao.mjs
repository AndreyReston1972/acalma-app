// Monitor de Vendas - Hotmart v3 (n8n, workflow gaFlkQYrcpyP319M): correção mínima dos
// campos do aviso "Telegram - Venda Aprovada" e da planilha "Bot Andrey / Vendas".
//
// BACKUP: valores ORIGINAIS dos únicos campos alterados (versionId 9faf3d08-f60f-43f0-92e4-74cc3f6cd173,
// lido em 13/10/2026). Para voltar: recolocar estes valores nos dois nós e publicar.
// Nada mais muda: "É Nina AI?", MailerLite (adicionar/remover), demais Telegram e Webhook ficam iguais.
//
// Teste local (não envia mensagem nem grava linha): node monitor-vendas-correcao.mjs
export const ORIGINAL = {
  telegramVendaAprovada:
    "=✅ *VENDA APROVADA!*\n\n🛍️ Produto: {{ $('Webhook').first().json.body.product.name }}\n👤 Comprador: {{ $('Webhook').first().json.body.buyer.name }}\n💰 Valor: R$ {{ $('Webhook').first().json.body.purchase.price.value }}\n📧 Email: {{ $('Webhook').first().json.body.buyer.email }}\n📅 Data: {{ $('Webhook').first().json.body.purchase.approved_date }}\n\n✉️ Adicionado ao grupo MailerLite!",
  colunas: {
    Data: "={{ $('Webhook').first().json.body.purchase.approved_date }}",
    Evento: "={{ $('Webhook').first().json.body.event }}",
    Produto: "={{ $('Webhook').first().json.body.product.name }}",
    Comprador: "={{ $('Webhook').first().json.body.buyer.name }}",
    Email: "={{ $('Webhook').first().json.body.buyer.email }}",
    Valor: "={{ $('Webhook').first().json.body.purchase.price.value }}",
  },
}

const B = "$('Webhook').first().json.body"
const DATA = `(${B}.data.purchase.approved_date ? new Date(${B}.data.purchase.approved_date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '')`

// Webhook 2.0.0 da Hotmart: os dados ficam em body.data.*; body.event fica no topo.
// A linha "Adicionado ao grupo MailerLite!" saiu: neste caminho o MailerLite não roda (o "É Nina AI?" segue
// como está), e para o Acalma ela seria falsa. Entrou o ID do produto para distinguir Acalma (8715752) e Nina.
export const CORRIGIDO = {
  telegramVendaAprovada:
    `=✅ *VENDA APROVADA!*\n\n🛍️ Produto: {{ ${B}.data.product.name }} (ID {{ ${B}.data.product.id }})\n👤 Comprador: {{ ${B}.data.buyer.name }}\n💰 Valor: R$ {{ ${B}.data.purchase.price.value }}\n📧 Email: {{ ${B}.data.buyer.email }}\n📅 Data: {{ ${DATA} }}`,
  colunas: {
    Data: `={{ ${DATA} }}`,
    Evento: `={{ ${B}.event }}`,
    Produto: `={{ ${B}.data.product.name }} (ID {{ ${B}.data.product.id }})`,
    Comprador: `={{ ${B}.data.buyer.name }}`,
    Email: `={{ ${B}.data.buyer.email }}`,
    Valor: `={{ ${B}.data.purchase.price.value }}`,
  },
}

// ── Teste local: avalia as expressões como o n8n ({{ … }} com $('Webhook')) num payload 2.0.0 fictício ──
function avaliar(modelo, body) {
  const $ = () => ({ first: () => ({ json: { body } }) })
  return modelo.replace(/^=/, '').replace(/\{\{([\s\S]+?)\}\}/g, (_, expr) => {
    try {
      const v = new Function('$', `return (${expr})`)($)
      return v === undefined ? '«vazio»' : String(v)
    } catch {
      return '«ERRO»'
    }
  })
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/').replace(/^([A-Za-z]:)/, '/$1')}` || process.argv[1]?.endsWith('monitor-vendas-correcao.mjs')) {
  const exemplo = (produtoId, nome) => ({
    id: 'evt-exemplo', event: 'PURCHASE_APPROVED', version: '2.0.0', creation_date: 1791830000000,
    data: {
      product: { id: produtoId, name: nome },
      buyer: { name: 'Pessoa Exemplo', email: 'pessoa@exemplo.invalid' },
      purchase: { transaction: 'HP000', approved_date: 1791830000000, price: { value: 14.9 } },
    },
  })
  let falhas = 0
  for (const [id, nome] of [[8715752, 'Acalma | Ajuda prática na hora da birra'], [7129824, 'Nina AI | Apoio à parentalidade']]) {
    const body = exemplo(id, nome)
    const antes = avaliar(ORIGINAL.colunas.Produto, body)
    const tel = avaliar(CORRIGIDO.telegramVendaAprovada, body)
    const linha = Object.fromEntries(Object.entries(CORRIGIDO.colunas).map(([k, v]) => [k, avaliar(v, body)]))
    console.log(`\n${nome}\n  ANTES (planilha, Produto): ${antes}\n  DEPOIS (planilha):`, linha, `\n  DEPOIS (Telegram):\n${tel.replace(/^/gm, '    ')}`)
    if (/«vazio»|«ERRO»|Invalid Date/.test(tel + JSON.stringify(linha))) falhas++
    if (/MailerLite/.test(tel)) falhas++
    if (!tel.includes(`ID ${id}`)) falhas++
  }
  // "É Nina AI?" não é alterado: a condição continua lendo body.product.name (vazio no 2.0.0) → falso,
  // exatamente como hoje (execução real 1882 de 01/10). O MailerLite continua sem rodar por este caminho.
  console.log(falhas ? `\nFALHAS: ${falhas}` : '\nOK: todos os campos resolvem, sem menção ao MailerLite, com ID do produto.')
  process.exit(falhas ? 1 : 0)
}
