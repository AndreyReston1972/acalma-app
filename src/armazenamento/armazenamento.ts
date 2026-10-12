import type { AcaoId, ModeloId, SituacaoId } from '../content/tipos'
import { buscarCaminho, buscarSituacao, ehSituacaoId } from '../content/situacoes'
import { ehAcaoId, ehModeloId, NOME_MAX, PASSOS_MAX, PASSOS_MIN } from '../content/combinados'
import { aplicarResposta, chaveFavorito, enfileirar, sincVazio, type Operacao, type RespostaSinc, type Sinc } from './sincronizacao'

/*
 * Persistência local.
 *
 * ESPAÇOS: o mesmo formato vale para dois lugares diferentes.
 *   • demonstração: "acalma.prototipo.v2" (com migração da v1). Nunca sincroniza.
 *   • conta: "acalma.conta.v1.<id da conta>". Um espaço por pessoa: trocar de conta
 *     no mesmo aparelho não mistura dados. Cada mudança entra numa fila de
 *     sincronização (ver sincronizacao.ts).
 * Dados da demonstração NUNCA são levados para uma conta.
 *
 * As chaves do app publicado antigo (prefixo "acalma_", ex.: acalma_diario_*)
 * nunca são escritas nem apagadas aqui. A importação opcional (legado.ts) só as lê.
 * Dado corrompido ou de versão desconhecida: começa vazio e só sobrescreve na
 * próxima gravação. Sem localStorage, funciona em memória.
 */
export const CHAVE = 'acalma.prototipo.v2'
export const CHAVE_V1 = 'acalma.prototipo.v1'
export const prefixoConta = 'acalma.conta.v1.'
const VERSAO = 2

interface Espaco {
  chave: string
  migrarDe: string | null
  sincroniza: boolean
}
const DEMONSTRACAO: Espaco = { chave: CHAVE, migrarDe: CHAVE_V1, sincroniza: false }
let espaco: Espaco = DEMONSTRACAO

export function usarEspacoDemonstracao() {
  trocarEspaco(DEMONSTRACAO)
}
export function usarEspacoDaConta(userId: string) {
  trocarEspaco({ chave: prefixoConta + userId, migrarDe: null, sincroniza: true })
}
export const espacoSincroniza = () => espaco.sincroniza
function trocarEspaco(e: Espaco) {
  if (e.chave === espaco.chave) return
  espaco = e
  cacheBruto = undefined
  avisarOuvintes()
}

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
  /** null só em registros importados do app anterior */
  situacaoId: SituacaoId | null
  caminhoId: string | null
  criadoEm: string
  resposta: Resposta | null
  anotacao: string
  origem: 'acalma' | 'app-anterior'
  /** dados originais do app anterior, exibidos como estão (sem converter emoção em situação) */
  legado: Record<string, unknown> | null
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
  /** só nos espaços de conta */
  sinc?: Sinc
}

export const ANOTACAO_MAX = 280
export const ANOTACAO_LEGADO_MAX = 2000

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
function caminhoValido(situacaoId: SituacaoId | null, caminhoId: unknown): string | null {
  if (!situacaoId || !ehTexto(caminhoId)) return null
  return buscarCaminho(buscarSituacao(situacaoId), caminhoId) ? caminhoId : null
}

function sanearFavoritos(lista: unknown): Favorito[] {
  if (!Array.isArray(lista)) return []
  const vistos = new Set<string>()
  const out: Favorito[] = []
  for (const f of lista) {
    if (!f || !ehSituacaoId(String(f.situacaoId)) || !ehTexto(f.salvoEm)) continue
    const caminhoId = caminhoValido(f.situacaoId, f.caminhoId)
    const chave = chaveFavorito(f.situacaoId, caminhoId)
    if (vistos.has(chave)) continue
    vistos.add(chave)
    out.push({ situacaoId: f.situacaoId, caminhoId, salvoEm: f.salvoEm })
  }
  return out
}

function sanearRegistros(lista: unknown): Registro[] {
  if (!Array.isArray(lista)) return []
  const out: Registro[] = []
  for (const r of lista) {
    if (!r || !ehTexto(r.id) || !ehTexto(r.criadoEm)) continue
    const origem = r.origem === 'app-anterior' ? 'app-anterior' : 'acalma'
    if (origem === 'acalma') {
      if (!ehSituacaoId(String(r.situacaoId)) || !ehResposta(r.resposta)) continue
      out.push({
        id: r.id, situacaoId: r.situacaoId, caminhoId: caminhoValido(r.situacaoId, r.caminhoId), criadoEm: r.criadoEm,
        resposta: r.resposta, anotacao: ehTexto(r.anotacao) ? r.anotacao.slice(0, ANOTACAO_MAX) : '', origem, legado: null,
      })
    } else {
      out.push({
        id: r.id, situacaoId: null, caminhoId: null, criadoEm: r.criadoEm, resposta: null,
        anotacao: ehTexto(r.anotacao) ? r.anotacao.slice(0, ANOTACAO_LEGADO_MAX) : '', origem,
        legado: r.legado && typeof r.legado === 'object' ? r.legado : null,
      })
    }
  }
  return out
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

function sanearSinc(s: unknown): Sinc | undefined {
  if (!s || typeof s !== 'object') return undefined
  const x = s as Partial<Sinc>
  if (!Array.isArray(x.fila)) return undefined
  return {
    fila: x.fila as Operacao[],
    seq: typeof x.seq === 'number' ? x.seq : 0,
    versoes: x.versoes && typeof x.versoes === 'object' ? x.versoes : {},
    favoritosEm: x.favoritosEm && typeof x.favoritosEm === 'object' ? x.favoritosEm : {},
    cursor: ehTexto(x.cursor) ? x.cursor : null,
    ultimaEm: ehTexto(x.ultimaEm) ? x.ultimaEm : null,
  }
}

function sanearV2(dado: unknown): Estado {
  if (!dado || typeof dado !== 'object') return vazio()
  const d = dado as Record<string, unknown>
  if (d.versao !== VERSAO) return vazio()
  const e: Estado = {
    versao: VERSAO,
    favoritos: sanearFavoritos(d.favoritos),
    registros: sanearRegistros(d.registros),
    combinados: sanearCombinados(d.combinados),
  }
  const s = sanearSinc(d.sinc)
  if (s) e.sinc = s
  return e
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
  let bruto = ler(espaco.chave)
  if (bruto === null && espaco.migrarDe) {
    const migrado = migrarV1(json(ler(espaco.migrarDe)))
    if (migrado) {
      bruto = JSON.stringify(migrado)
      gravarBruto(espaco.chave, bruto)
    }
  }
  if (bruto === cacheBruto) return cacheEstado
  cacheBruto = bruto
  const dado = json(bruto)
  cacheEstado = dado ? sanearV2(dado) : vazio()
  return cacheEstado
}

const ouvintes = new Set<() => void>()
const ouvintesDeMudancaLocal = new Set<() => void>()

function avisarOuvintes() {
  ouvintes.forEach((o) => o())
}

function gravar(estado: Estado, origemLocal = true) {
  gravarBruto(espaco.chave, JSON.stringify(estado))
  avisarOuvintes()
  if (origemLocal && espaco.sincroniza) ouvintesDeMudancaLocal.forEach((o) => o())
}

export function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  const aoMudarEmOutraAba = (e: StorageEvent) => {
    if (e.key === espaco.chave) ouvinte()
  }
  window.addEventListener('storage', aoMudarEmOutraAba)
  return () => {
    ouvintes.delete(ouvinte)
    window.removeEventListener('storage', aoMudarEmOutraAba)
  }
}

/** Avisado a cada mudança feita NESTE aparelho num espaço de conta (para agendar a sincronização). */
export function aoMudarLocalmente(ouvinte: () => void) {
  ouvintesDeMudancaLocal.add(ouvinte)
  return () => {
    ouvintesDeMudancaLocal.delete(ouvinte)
  }
}

function comFila(e: Estado, op: Parameters<typeof enfileirar>[1]): Estado {
  if (!espaco.sincroniza) return e
  return { ...e, sinc: enfileirar(e.sinc ?? sincVazio(), op) }
}

function novoId(prefixo: string) {
  try {
    return `${prefixo}-${crypto.randomUUID()}`
  } catch {
    return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
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
  let novo = comFila({ ...e, favoritos }, { tipo: 'favorito', situacaoId, caminhoId, salvo: !ja, alteradoEm: agora.toISOString() })
  if (novo.sinc) novo = { ...novo, sinc: { ...novo.sinc, favoritosEm: { ...novo.sinc.favoritosEm, [chaveFavorito(situacaoId, caminhoId)]: agora.toISOString() } } }
  gravar(novo)
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
    origem: 'acalma',
    legado: null,
  }
  const e = lerEstado()
  gravar(comFila({ ...e, registros: [registro, ...e.registros] }, { tipo: 'registro', id: registro.id, dados: registro }))
  return registro
}

/** Registros do app anterior: entram identificados e com id estável (reimportar não duplica). */
export function importarRegistrosAnteriores(lista: Registro[]): number {
  const e = lerEstado()
  const existentes = new Set(e.registros.map((r) => r.id))
  const novos = lista.filter((r) => r.origem === 'app-anterior' && !existentes.has(r.id))
  if (novos.length === 0) return 0
  let novo: Estado = { ...e, registros: [...e.registros, ...novos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)) }
  for (const r of novos) novo = comFila(novo, { tipo: 'registro', id: r.id, dados: r })
  gravar(novo)
  return novos.length
}

export function excluirRegistro(id: string) {
  const e = lerEstado()
  gravar(comFila({ ...e, registros: e.registros.filter((r) => r.id !== id) }, { tipo: 'registro', id, excluido: true }))
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
  const versaoBase = e.sinc?.versoes[combinado.id] ?? null
  gravar(comFila({ ...e, combinados }, {
    tipo: 'combinado', id: combinado.id, versaoBase,
    dados: { nome: combinado.nome, modeloId: combinado.modeloId, passos: combinado.passos, criadoEm: combinado.criadoEm },
  }))
  return combinado
}

export function excluirCombinado(id: string) {
  const e = lerEstado()
  const versaoBase = e.sinc?.versoes[id] ?? null
  gravar(comFila({ ...e, combinados: e.combinados.filter((c) => c.id !== id) }, { tipo: 'combinado', id, versaoBase, excluido: true }))
}

/* ── Sincronização (espaço de conta) ───────────────────── */

export function filaPendente(): Operacao[] {
  return lerEstado().sinc?.fila ?? []
}

export function cursorDeSincronizacao(): string | null {
  return lerEstado().sinc?.cursor ?? null
}

export function ultimaSincronizacao(): string | null {
  return lerEstado().sinc?.ultimaEm ?? null
}

/** Aplica a resposta do servidor e devolve avisos para a pessoa (conflitos resolvidos). */
export function aplicarSincronizacao(enviadas: Operacao[], resposta: RespostaSinc): string[] {
  const e = lerEstado()
  const { local, sinc, avisos } = aplicarResposta(
    { combinados: e.combinados, favoritos: e.favoritos, registros: e.registros },
    e.sinc ?? sincVazio(),
    enviadas,
    resposta,
    novoIdCombinado,
  )
  gravar(
    {
      ...e,
      combinados: sanearCombinados(local.combinados),
      favoritos: sanearFavoritos(local.favoritos),
      registros: sanearRegistros(local.registros),
      sinc,
    },
    false,
  )
  return avisos
}

/** Apaga só os dados deste protótipo (v2 e a v1 de origem). */
export function apagarDadosDoPrototipo() {
  gravarBruto(CHAVE, null)
  gravarBruto(CHAVE_V1, null)
  cacheBruto = undefined
  avisarOuvintes()
}

/** Apaga a cópia local de uma conta neste aparelho (sair em aparelho compartilhado). */
export function apagarCopiaLocalDaConta(userId: string) {
  gravarBruto(prefixoConta + userId, null)
  cacheBruto = undefined
  avisarOuvintes()
}
