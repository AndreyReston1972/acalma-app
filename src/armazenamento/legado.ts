import { ANOTACAO_LEGADO_MAX, type Registro } from './armazenamento'

/*
 * Registros do Acalma anterior (acalma.nexo-edu.com, até 10/2026), guardados em
 * localStorage nas chaves "acalma_diario_AAAA-MM-DD" como lista de
 *   { data, emocaoId, acoes[], antes, reacao, terminou }.
 *
 * Regras:
 *   • SÓ LEITURA: nenhuma chave "acalma_*" é escrita ou apagada.
 *   • Importação só quando a pessoa pede, e identificada como "app anterior".
 *   • A emoção anotada NÃO vira situação: o app anterior classificava emoções,
 *     o atual orienta por situação. Os dados originais vão em "legado", como vieram.
 *   • Id estável (derivado do conteúdo): importar de novo não duplica.
 */
const PREFIXO = 'acalma_diario_'

const EMOCOES: Record<string, string> = {
  raiva: 'raiva', tristeza: 'tristeza', medo: 'medo', alegria: 'alegria', ansiedade: 'ansiedade',
  frustracao: 'frustração', ciume: 'ciúme', vergonha: 'vergonha',
}

export function rotuloEmocaoAnterior(legado: Record<string, unknown> | null): string | null {
  const id = legado && typeof legado.emocaoId === 'string' ? legado.emocaoId : null
  return id ? (EMOCOES[id] ?? null) : null
}

function hash(texto: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

/** Lê (sem alterar) os registros do app anterior presentes neste navegador. */
export function lerRegistrosAnteriores(armazenamento: Storage | null = typeof window !== 'undefined' ? window.localStorage : null): Registro[] {
  if (!armazenamento) return []
  const out: Registro[] = []
  let chaves: string[]
  try {
    chaves = Array.from({ length: armazenamento.length }, (_, i) => armazenamento.key(i) ?? '').filter((k) => k.startsWith(PREFIXO))
  } catch {
    return []
  }
  for (const chave of chaves) {
    let lista: unknown
    try {
      lista = JSON.parse(armazenamento.getItem(chave) ?? '[]')
    } catch {
      continue
    }
    if (!Array.isArray(lista)) continue
    const dia = chave.slice(PREFIXO.length)
    for (const e of lista) {
      if (!e || typeof e !== 'object') continue
      const d = e as Record<string, unknown>
      const quando = texto(d.data) || `${dia}T12:00:00.000Z`
      if (Number.isNaN(Date.parse(quando))) continue
      const linhas = [
        texto(d.antes) && `Antes: ${texto(d.antes)}`,
        texto(d.reacao) && `Como reagi: ${texto(d.reacao)}`,
        texto(d.terminou) && `Como terminou: ${texto(d.terminou)}`,
      ].filter(Boolean)
      const legado = {
        emocaoId: typeof d.emocaoId === 'string' ? d.emocaoId : null,
        acoes: Array.isArray(d.acoes) ? d.acoes.filter((a) => typeof a === 'string') : [],
        antes: texto(d.antes), reacao: texto(d.reacao), terminou: texto(d.terminou), dia,
      }
      out.push({
        id: `leg-${hash(JSON.stringify([quando, legado]))}`,
        situacaoId: null,
        caminhoId: null,
        criadoEm: new Date(quando).toISOString(),
        resposta: null,
        anotacao: linhas.join('\n').slice(0, ANOTACAO_LEGADO_MAX),
        origem: 'app-anterior',
        legado,
      })
    }
  }
  return out.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
}

/**
 * Todas as chaves do app anterior ("acalma_*", com sublinhado), cruas e sem alteração,
 * para a cópia que a pessoa baixa. Não inclui as chaves do app atual ("acalma.").
 */
export function lerChavesAnteriores(armazenamento: Storage | null = typeof window !== 'undefined' ? window.localStorage : null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!armazenamento) return out
  try {
    for (let i = 0; i < armazenamento.length; i++) {
      const k = armazenamento.key(i) ?? ''
      if (k.startsWith('acalma_')) out[k] = armazenamento.getItem(k) ?? ''
    }
  } catch {
    /* armazenamento indisponível */
  }
  return out
}

/** Há algo do app anterior neste navegador? (aviso de transição) */
export const temDadosAnteriores = () => Object.keys(lerChavesAnteriores()).length > 0
