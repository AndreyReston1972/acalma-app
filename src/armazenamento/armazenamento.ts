import type { SituacaoId } from '../content/tipos'
import { ehSituacaoId } from '../content/situacoes'

/*
 * Persistência local do protótipo.
 *
 * - Uma única chave, versionada e própria do protótipo.
 * - As chaves do app publicado (prefixo "acalma_", ex.: acalma_diario_*,
 *   acalma_perfil, acalma_checklist) NUNCA são lidas, escritas ou apagadas aqui.
 * - Se o conteúdo salvo estiver corrompido ou em versão desconhecida, o app
 *   começa vazio e só sobrescreve na próxima gravação desta mesma chave.
 * - Sem localStorage (navegação privada restrita), funciona em memória.
 */
export const CHAVE = 'acalma.prototipo.v1'
const VERSAO = 1

export type Resposta = 'ajudou' | 'um-pouco' | 'nao-ajudou' | 'nao-tentei'

export const respostas: { id: Resposta; rotulo: string }[] = [
  { id: 'ajudou', rotulo: 'Ajudou' },
  { id: 'um-pouco', rotulo: 'Um pouco' },
  { id: 'nao-ajudou', rotulo: 'Não ajudou' },
  { id: 'nao-tentei', rotulo: 'Ainda não tentei' },
]

export interface Favorito {
  situacaoId: SituacaoId
  salvoEm: string
}

export interface Registro {
  id: string
  situacaoId: SituacaoId
  criadoEm: string
  resposta: Resposta
  anotacao: string
}

export interface Estado {
  versao: typeof VERSAO
  favoritos: Favorito[]
  registros: Registro[]
}

export const ANOTACAO_MAX = 280

const vazio = (): Estado => ({ versao: VERSAO, favoritos: [], registros: [] })

let memoria: string | null = null

function lerBruto(): string | null {
  try {
    return window.localStorage.getItem(CHAVE)
  } catch {
    return memoria
  }
}

function gravarBruto(valor: string | null) {
  memoria = valor
  try {
    if (valor === null) window.localStorage.removeItem(CHAVE)
    else window.localStorage.setItem(CHAVE, valor)
  } catch {
    /* sem armazenamento: segue em memória */
  }
}

const ehResposta = (v: unknown): v is Resposta => respostas.some((r) => r.id === v)

function sanear(dado: unknown): Estado {
  if (!dado || typeof dado !== 'object') return vazio()
  const d = dado as Partial<Estado>
  if (d.versao !== VERSAO) return vazio()
  const favoritos = Array.isArray(d.favoritos)
    ? d.favoritos.filter((f): f is Favorito => !!f && ehSituacaoId(String(f.situacaoId)) && typeof f.salvoEm === 'string')
    : []
  const registros = Array.isArray(d.registros)
    ? d.registros.filter(
        (r): r is Registro =>
          !!r &&
          typeof r.id === 'string' &&
          ehSituacaoId(String(r.situacaoId)) &&
          typeof r.criadoEm === 'string' &&
          ehResposta(r.resposta) &&
          typeof r.anotacao === 'string',
      )
    : []
  return { versao: VERSAO, favoritos, registros }
}

let cacheBruto: string | null | undefined
let cacheEstado: Estado = vazio()

export function lerEstado(): Estado {
  const bruto = lerBruto()
  if (bruto === cacheBruto) return cacheEstado
  cacheBruto = bruto
  try {
    cacheEstado = bruto ? sanear(JSON.parse(bruto)) : vazio()
  } catch {
    cacheEstado = vazio()
  }
  return cacheEstado
}

const ouvintes = new Set<() => void>()

function gravar(estado: Estado) {
  gravarBruto(JSON.stringify(estado))
  ouvintes.forEach((o) => o())
}

export function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  const aoMudarEmOutraAba = (e: StorageEvent) => {
    if (e.key === CHAVE) ouvinte()
  }
  window.addEventListener('storage', aoMudarEmOutraAba)
  return () => {
    ouvintes.delete(ouvinte)
    window.removeEventListener('storage', aoMudarEmOutraAba)
  }
}

export function ehFavorito(id: SituacaoId) {
  return lerEstado().favoritos.some((f) => f.situacaoId === id)
}

/** Alterna o favorito e devolve o novo estado (true = salvo). */
export function alternarFavorito(id: SituacaoId, agora = new Date()): boolean {
  const e = lerEstado()
  const ja = e.favoritos.some((f) => f.situacaoId === id)
  const favoritos = ja
    ? e.favoritos.filter((f) => f.situacaoId !== id)
    : [{ situacaoId: id, salvoEm: agora.toISOString() }, ...e.favoritos]
  gravar({ ...e, favoritos })
  return !ja
}

function novoId() {
  try {
    return crypto.randomUUID()
  } catch {
    return `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }
}

export function adicionarRegistro(
  dados: { situacaoId: SituacaoId; resposta: Resposta; anotacao?: string },
  agora = new Date(),
): Registro {
  const registro: Registro = {
    id: novoId(),
    situacaoId: dados.situacaoId,
    resposta: dados.resposta,
    anotacao: (dados.anotacao ?? '').trim().slice(0, ANOTACAO_MAX),
    criadoEm: agora.toISOString(),
  }
  const e = lerEstado()
  gravar({ ...e, registros: [registro, ...e.registros] })
  return registro
}

export function excluirRegistro(id: string) {
  const e = lerEstado()
  gravar({ ...e, registros: e.registros.filter((r) => r.id !== id) })
}

/** Apaga só os dados deste protótipo (a chave própria). */
export function apagarDadosDoPrototipo() {
  gravarBruto(null)
  ouvintes.forEach((o) => o())
}
