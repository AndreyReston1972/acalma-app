import type { AcaoId, ModeloId, SituacaoId } from '../content/tipos'
import { buscarCaminho, buscarSituacao, ehSituacaoId } from '../content/situacoes'
import { ehAcaoId, ehModeloId, NOME_MAX, PASSOS_MAX, PASSOS_MIN } from '../content/combinados'

/*
 * Persistência local do protótipo (v2).
 *
 * - Chave atual: "acalma.prototipo.v2".
 * - Migração: se a v2 ainda não existe e há dados na chave da v1
 *   ("acalma.prototipo.v1"), favoritos e registros são convertidos e gravados
 *   na v2. A chave v1 NÃO é apagada (permite voltar à versão anterior).
 * - As chaves do app publicado (prefixo "acalma_", ex.: acalma_diario_*)
 *   NUNCA são lidas, escritas ou apagadas aqui.
 * - Dado corrompido ou de versão desconhecida: o app começa vazio e só
 *   sobrescreve na próxima gravação.
 * - Sem localStorage disponível, funciona em memória.
 */
export const CHAVE = 'acalma.prototipo.v2'
export const CHAVE_V1 = 'acalma.prototipo.v1'
const VERSAO = 2

export type Resposta = 'ajudou' | 'um-pouco' | 'nao-ajudou' | 'nao-tentei'

export const respostas: { id: Resposta; rotulo: string }[] = [
  { id: 'ajudou', rotulo: 'Ajudou' },
  { id: 'um-pouco', rotulo: 'Um pouco' },
  { id: 'nao-ajudou', rotulo: 'Não ajudou' },
  { id: 'nao-tentei', rotulo: 'Ainda não tentei' },
]

export interface Favorito {
  situacaoId: SituacaoId
  /** null = a primeira orientação; senão, o caminho escolhido */
  caminhoId: string | null
  salvoEm: string
}

export interface Registro {
  id: string
  situacaoId: SituacaoId
  caminhoId: string | null
  criadoEm: string
  resposta: Resposta
  anotacao: string
}

export interface Combinado {
  id: string
  nome: string
  modeloId: ModeloId | null
  passos: AcaoId[]
  criadoEm: string
  atualizadoEm: string
}

export interface Estado {
  versao: typeof VERSAO
  favoritos: Favorito[]
  registros: Registro[]
  combinados: Combinado[]
}

export const ANOTACAO_MAX = 280

const vazio = (): Estado => ({ versao: VERSAO, favoritos: [], registros: [], combinados: [] })

const memoria = new Map<string, string>()

function ler(chave: string): string | null {
  try {
    return window.localStorage.getItem(chave)
  } catch {
    return memoria.get(chave) ?? null
  }
}

function gravarBruto(chave: string, valor: string | null) {
  if (valor === null) memoria.delete(chave)
  else memoria.set(chave, valor)
  try {
    if (valor === null) window.localStorage.removeItem(chave)
    else window.localStorage.setItem(chave, valor)
  } catch {
    /* sem armazenamento: segue em memória */
  }
}

const ehResposta = (v: unknown): v is Resposta => respostas.some((r) => r.id === v)
const ehTexto = (v: unknown): v is string => typeof v === 'string'

/** O caminho precisa existir na situação; caso contrário, vira a orientação base. */
function caminhoValido(situacaoId: SituacaoId, caminhoId: unknown): string | null {
  if (!ehTexto(caminhoId)) return null
  return buscarCaminho(buscarSituacao(situacaoId), caminhoId) ? caminhoId : null
}

function sanearFavoritos(lista: unknown): Favorito[] {
  if (!Array.isArray(lista)) return []
  const vistos = new Set<string>()
  const out: Favorito[] = []
  for (const f of lista) {
    if (!f || !ehSituacaoId(String(f.situacaoId)) || !ehTexto(f.salvoEm)) continue
    const caminhoId = caminhoValido(f.situacaoId, f.caminhoId)
    const chave = `${f.situacaoId}/${caminhoId ?? ''}`
    if (vistos.has(chave)) continue
    vistos.add(chave)
    out.push({ situacaoId: f.situacaoId, caminhoId, salvoEm: f.salvoEm })
  }
  return out
}

function sanearRegistros(lista: unknown): Registro[] {
  if (!Array.isArray(lista)) return []
  return lista
    .filter((r) => r && ehTexto(r.id) && ehSituacaoId(String(r.situacaoId)) && ehTexto(r.criadoEm) && ehResposta(r.resposta))
    .map((r) => ({
      id: r.id,
      situacaoId: r.situacaoId,
      caminhoId: caminhoValido(r.situacaoId, r.caminhoId),
      criadoEm: r.criadoEm,
      resposta: r.resposta,
      anotacao: ehTexto(r.anotacao) ? r.anotacao.slice(0, ANOTACAO_MAX) : '',
    }))
}

function sanearCombinados(lista: unknown): Combinado[] {
  if (!Array.isArray(lista)) return []
  const out: Combinado[] = []
  for (const c of lista) {
    if (!c || !ehTexto(c.id) || !Array.isArray(c.passos)) continue
    const passos = [...new Set(c.passos.filter((p: unknown) => ehTexto(p) && ehAcaoId(p)))] as AcaoId[]
    if (passos.length < PASSOS_MIN || passos.length > PASSOS_MAX) continue
    out.push({
      id: c.id,
      nome: ehTexto(c.nome) ? c.nome.slice(0, NOME_MAX) : '',
      modeloId: ehTexto(c.modeloId) && ehModeloId(c.modeloId) ? c.modeloId : null,
      passos,
      criadoEm: ehTexto(c.criadoEm) ? c.criadoEm : new Date(0).toISOString(),
      atualizadoEm: ehTexto(c.atualizadoEm) ? c.atualizadoEm : new Date(0).toISOString(),
    })
  }
  return out
}

function sanearV2(dado: unknown): Estado {
  if (!dado || typeof dado !== 'object') return vazio()
  const d = dado as Record<string, unknown>
  if (d.versao !== VERSAO) return vazio()
  return {
    versao: VERSAO,
    favoritos: sanearFavoritos(d.favoritos),
    registros: sanearRegistros(d.registros),
    combinados: sanearCombinados(d.combinados),
  }
}

/** v1 → v2: favoritos e registros ganham caminhoId = null; combinados começam vazios. */
export function migrarV1(dado: unknown): Estado | null {
  if (!dado || typeof dado !== 'object') return null
  const d = dado as Record<string, unknown>
  if (d.versao !== 1) return null
  return {
    versao: VERSAO,
    favoritos: sanearFavoritos(Array.isArray(d.favoritos) ? d.favoritos.map((f) => ({ ...f, caminhoId: null })) : []),
    registros: sanearRegistros(Array.isArray(d.registros) ? d.registros.map((r) => ({ ...r, caminhoId: null })) : []),
    combinados: [],
  }
}

function json(bruto: string | null): unknown {
  if (!bruto) return null
  try {
    return JSON.parse(bruto)
  } catch {
    return undefined
  }
}

let cacheBruto: string | null | undefined
let cacheEstado: Estado = vazio()

export function lerEstado(): Estado {
  let bruto = ler(CHAVE)
  if (bruto === null) {
    const migrado = migrarV1(json(ler(CHAVE_V1)))
    if (migrado) {
      bruto = JSON.stringify(migrado)
      gravarBruto(CHAVE, bruto)
    }
  }
  if (bruto === cacheBruto) return cacheEstado
  cacheBruto = bruto
  const dado = json(bruto)
  cacheEstado = dado ? sanearV2(dado) : vazio()
  return cacheEstado
}

const ouvintes = new Set<() => void>()

function gravar(estado: Estado) {
  gravarBruto(CHAVE, JSON.stringify(estado))
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

function novoId(prefixo: string) {
  try {
    return `${prefixo}-${crypto.randomUUID()}`
  } catch {
    return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }
}

/* ── Favoritos ─────────────────────────────────────────── */

const mesmo = (f: Favorito, s: SituacaoId, c: string | null) => f.situacaoId === s && f.caminhoId === c

export function ehFavorito(situacaoId: SituacaoId, caminhoId: string | null = null) {
  return lerEstado().favoritos.some((f) => mesmo(f, situacaoId, caminhoId))
}

/** Alterna o favorito (da orientação base ou de um caminho) e devolve true se ficou salvo. */
export function alternarFavorito(situacaoId: SituacaoId, caminhoId: string | null = null, agora = new Date()): boolean {
  const e = lerEstado()
  const ja = e.favoritos.some((f) => mesmo(f, situacaoId, caminhoId))
  const favoritos = ja
    ? e.favoritos.filter((f) => !mesmo(f, situacaoId, caminhoId))
    : [{ situacaoId, caminhoId, salvoEm: agora.toISOString() }, ...e.favoritos]
  gravar({ ...e, favoritos })
  return !ja
}

/* ── Registros ─────────────────────────────────────────── */

export function adicionarRegistro(
  dados: { situacaoId: SituacaoId; caminhoId?: string | null; resposta: Resposta; anotacao?: string },
  agora = new Date(),
): Registro {
  const registro: Registro = {
    id: novoId('r'),
    situacaoId: dados.situacaoId,
    caminhoId: caminhoValido(dados.situacaoId, dados.caminhoId),
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

/* ── Combinados ────────────────────────────────────────── */

export function novoIdCombinado() {
  return novoId('c')
}

export function buscarCombinado(id: string | undefined) {
  return lerEstado().combinados.find((c) => c.id === id)
}

/**
 * Cria ou atualiza pelo id (upsert). Chamadas repetidas com o mesmo id não
 * duplicam o combinado, então toques repetidos em Salvar são inofensivos.
 */
export function salvarCombinado(
  dados: { id: string; nome: string; modeloId: ModeloId | null; passos: AcaoId[] },
  agora = new Date(),
): Combinado {
  const passos = [...new Set(dados.passos)]
  if (passos.length < PASSOS_MIN || passos.length > PASSOS_MAX) {
    throw new Error(`Um combinado precisa ter de ${PASSOS_MIN} a ${PASSOS_MAX} passos.`)
  }
  const e = lerEstado()
  const anterior = e.combinados.find((c) => c.id === dados.id)
  const combinado: Combinado = {
    id: dados.id,
    nome: dados.nome.trim().slice(0, NOME_MAX),
    modeloId: dados.modeloId,
    passos,
    criadoEm: anterior?.criadoEm ?? agora.toISOString(),
    atualizadoEm: agora.toISOString(),
  }
  const combinados = anterior
    ? e.combinados.map((c) => (c.id === combinado.id ? combinado : c))
    : [combinado, ...e.combinados]
  gravar({ ...e, combinados })
  return combinado
}

export function excluirCombinado(id: string) {
  const e = lerEstado()
  gravar({ ...e, combinados: e.combinados.filter((c) => c.id !== id) })
}

/** Apaga só os dados deste protótipo (v2 e a v1 de origem). */
export function apagarDadosDoPrototipo() {
  gravarBruto(CHAVE, null)
  gravarBruto(CHAVE_V1, null)
  ouvintes.forEach((o) => o())
}
