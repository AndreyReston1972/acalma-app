/*
 * Sincronização: regras puras (sem rede, sem localStorage), testadas isoladamente.
 *
 * O aparelho é a fonte do que a pessoa vê. Cada mudança vira uma OPERAÇÃO numa fila;
 * a fila vai para o servidor (RPC acalma_sincronizar) e a resposta volta com:
 *   • o que mudou no servidor desde a última vez (inclusive de outros aparelhos);
 *   • conflitos: combinado editado aqui sobre uma versão que já mudou em outro lugar.
 *
 * Regras de conflito (nada some em silêncio):
 *   • conteúdo igual ao do servidor (ex.: reenvio depois de resposta perdida) → aceita;
 *   • edição aqui x edição lá → a versão do servidor fica no lugar e a daqui vira uma
 *     CÓPIA ("… (cópia)"), enviada como combinado novo;
 *   • exclusão aqui x edição lá → o combinado volta (o mais recente não é apagado);
 *   • edição aqui x exclusão lá → a edição daqui volta como cópia.
 * Orientações salvas: vence a marcação mais recente (alterado_em).
 * Registros: imutáveis; só a exclusão viaja.
 */
import type { AcaoId, ModeloId, SituacaoId } from '../content/tipos'

export interface DadosCombinado {
  nome: string
  modeloId: ModeloId | null
  passos: AcaoId[]
  criadoEm: string
}

export type Operacao =
  | { seq: number; tipo: 'combinado'; id: string; versaoBase: number | null; excluido?: boolean; dados?: DadosCombinado }
  | { seq: number; tipo: 'favorito'; situacaoId: SituacaoId; caminhoId: string | null; salvo: boolean; alteradoEm: string }
  | { seq: number; tipo: 'registro'; id: string; excluido?: boolean; dados?: RegistroSinc }

/** Operação ainda sem número de sequência (Omit distributivo sobre a união). */
export type NovaOperacao = Operacao extends infer T ? (T extends unknown ? Omit<T, 'seq'> : never) : never

export interface RegistroSinc {
  situacaoId: SituacaoId | null
  caminhoId: string | null
  resposta: string | null
  anotacao: string
  criadoEm: string
  origem: 'acalma' | 'app-anterior'
  legado: Record<string, unknown> | null
}

export interface Sinc {
  fila: Operacao[]
  seq: number
  /** versão do servidor de cada combinado já sincronizado */
  versoes: Record<string, number>
  /** alterado_em mais recente conhecido de cada orientação salva (chave situacao/caminho) */
  favoritosEm: Record<string, string>
  /** servidor_em da última sincronização bem-sucedida */
  cursor: string | null
  ultimaEm: string | null
}

export const sincVazio = (): Sinc => ({ fila: [], seq: 0, versoes: {}, favoritosEm: {}, cursor: null, ultimaEm: null })

export const chaveFavorito = (s: string, c: string | null) => `${s}/${c ?? ''}`

const mesmoAlvo = (a: Operacao, b: Operacao) =>
  a.tipo === b.tipo &&
  (a.tipo === 'favorito'
    ? chaveFavorito(a.situacaoId, a.caminhoId) === chaveFavorito((b as typeof a).situacaoId, (b as typeof a).caminhoId)
    : a.id === (b as typeof a).id)

/**
 * Enfileira juntando operações do mesmo alvo: várias edições seguidas de um combinado
 * viram uma só (com a versão-base da primeira), e salvar/desmarcar repetido vira o último.
 */
export function enfileirar(s: Sinc, op: NovaOperacao): Sinc {
  const seq = s.seq + 1
  const nova = { ...op, seq } as Operacao
  const anterior = s.fila.find((o) => mesmoAlvo(o, nova))
  let fila = s.fila.filter((o) => !mesmoAlvo(o, nova))
  if (anterior && nova.tipo === 'combinado' && anterior.tipo === 'combinado') {
    // combinado criado e excluído antes de sincronizar: não precisa viajar
    if (nova.excluido && anterior.versaoBase === null) return { ...s, seq, fila }
    nova.versaoBase = anterior.versaoBase
  }
  if (anterior && nova.tipo === 'registro' && anterior.tipo === 'registro' && nova.excluido && !anterior.excluido) {
    return { ...s, seq, fila } // criado e excluído antes de sincronizar
  }
  fila = [...fila, nova]
  return { ...s, seq, fila }
}

/** Formato que a RPC acalma_sincronizar espera. */
export function montarMudancas(fila: Operacao[]) {
  return {
    combinados: fila.filter((o) => o.tipo === 'combinado').map((o) => {
      const c = o as Extract<Operacao, { tipo: 'combinado' }>
      return c.excluido
        ? { id: c.id, versao_base: c.versaoBase, excluido: true }
        : { id: c.id, versao_base: c.versaoBase, nome: c.dados!.nome, modelo_id: c.dados!.modeloId, passos: c.dados!.passos, criado_em: c.dados!.criadoEm }
    }),
    favoritos: fila.filter((o) => o.tipo === 'favorito').map((o) => {
      const f = o as Extract<Operacao, { tipo: 'favorito' }>
      return { situacao_id: f.situacaoId, caminho_id: f.caminhoId ?? '', salvo: f.salvo, alterado_em: f.alteradoEm }
    }),
    registros: fila.filter((o) => o.tipo === 'registro').map((o) => {
      const r = o as Extract<Operacao, { tipo: 'registro' }>
      return r.excluido
        ? { id: r.id, excluido: true }
        : {
            id: r.id, situacao_id: r.dados!.situacaoId, caminho_id: r.dados!.caminhoId, resposta: r.dados!.resposta,
            anotacao: r.dados!.anotacao, criado_em: r.dados!.criadoEm, origem: r.dados!.origem, legado: r.dados!.legado,
          }
    }),
  }
}

/* ── Resposta do servidor ─────────────────────────────────────────────── */

export interface LinhaCombinado {
  id: string; nome: string; modelo_id: string | null; passos: string[]; versao: number
  criado_em: string; atualizado_em: string; excluido_em: string | null
}
export interface LinhaFavorito { situacao_id: string; caminho_id: string; salvo: boolean; alterado_em: string }
export interface LinhaRegistro {
  id: string; situacao_id: string | null; caminho_id: string | null; resposta: string | null; anotacao: string
  criado_em: string; origem: 'acalma' | 'app-anterior'; legado: Record<string, unknown> | null; excluido_em: string | null
}
export interface RespostaSinc {
  servidor_em: string
  combinados: LinhaCombinado[]
  favoritos: LinhaFavorito[]
  registros: LinhaRegistro[]
  conflitos: { tipo: 'combinado'; id: string; servidor: LinhaCombinado }[]
  rejeitados: { tipo: string; id: string; motivo: string }[]
}

/**
 * O servidor só grava com direito de acesso (migration 20261012120000_acalma_dados_sincronizados.sql). Sem ele, responde
 * sem_acesso e não aplica NADA: o aparelho mantém a fila intacta, sem descartar anotações
 * ou combinados, e confere o acesso de novo.
 */
export type RespostaServidorSinc = RespostaSinc | { sem_acesso: true; servidor_em: string }
export const semAcesso = (r: RespostaServidorSinc): r is { sem_acesso: true; servidor_em: string } =>
  (r as { sem_acesso?: boolean }).sem_acesso === true

/** Visão mínima do estado local que a mesclagem precisa ler e escrever. */
export interface Local {
  combinados: { id: string; nome: string; modeloId: ModeloId | null; passos: AcaoId[]; criadoEm: string; atualizadoEm: string }[]
  favoritos: { situacaoId: SituacaoId; caminhoId: string | null; salvoEm: string }[]
  registros: (RegistroSinc & { id: string })[]
}

const mesmoConteudo = (d: DadosCombinado, l: LinhaCombinado) =>
  d.nome === l.nome && (d.modeloId ?? null) === (l.modelo_id ?? null) && d.passos.join() === l.passos.join()

const daLinha = (l: LinhaCombinado) => ({
  id: l.id, nome: l.nome, modeloId: (l.modelo_id ?? null) as ModeloId | null, passos: l.passos as AcaoId[],
  criadoEm: l.criado_em, atualizadoEm: l.atualizado_em,
})

/**
 * Aplica a resposta: retira da fila só o que foi ENVIADO (operações novas, feitas
 * durante a chamada, continuam), resolve conflitos e mescla o que veio do servidor.
 */
export function aplicarResposta<L extends Local>(
  local: L,
  sinc: Sinc,
  enviadas: Operacao[],
  r: RespostaSinc,
  novoId: () => string,
): { local: L; sinc: Sinc; avisos: string[] } {
  const avisos: string[] = []
  const seqEnviadas = new Set(enviadas.map((o) => o.seq))
  let s: Sinc = { ...sinc, fila: sinc.fila.filter((o) => !seqEnviadas.has(o.seq)), versoes: { ...sinc.versoes }, favoritosEm: { ...sinc.favoritosEm } }
  let combinados = [...local.combinados]
  let favoritos = [...local.favoritos]
  let registros = [...local.registros]

  const pendenteCombinado = (id: string) => s.fila.some((o) => o.tipo === 'combinado' && o.id === id)
  const pendenteFavorito = (k: string) => s.fila.some((o) => o.tipo === 'favorito' && chaveFavorito(o.situacaoId, o.caminhoId) === k)
  const pendenteRegistro = (id: string) => s.fila.some((o) => o.tipo === 'registro' && o.id === id)
  const porId = new Map(r.combinados.map((l) => [l.id, l]))

  // 1. Conflitos de combinados
  for (const c of r.conflitos) {
    const op = enviadas.find((o) => o.tipo === 'combinado' && o.id === c.id) as Extract<Operacao, { tipo: 'combinado' }> | undefined
    const srv = c.servidor
    if (!op) continue
    if (op.excluido) {
      if (!srv.excluido_em) {
        combinados = [...combinados.filter((x) => x.id !== srv.id), daLinha(srv)]
        s.versoes[srv.id] = srv.versao
        avisos.push(`“${srv.nome || 'Combinado'}” foi alterado em outro aparelho e não foi excluído.`)
      }
      continue
    }
    if (!srv.excluido_em && mesmoConteudo(op.dados!, srv)) {
      s.versoes[srv.id] = srv.versao
      continue
    }
    // A versão do servidor fica no id original; a edição daqui vira cópia.
    const idCopia = novoId()
    const nomeCopia = `${(op.dados!.nome || 'Combinado').slice(0, 22)} (cópia)`
    const copia = { id: idCopia, nome: nomeCopia, modeloId: op.dados!.modeloId, passos: op.dados!.passos, criadoEm: op.dados!.criadoEm, atualizadoEm: r.servidor_em }
    combinados = combinados.filter((x) => x.id !== srv.id)
    if (!srv.excluido_em) {
      combinados.push(daLinha(srv))
      s.versoes[srv.id] = srv.versao
    } else delete s.versoes[srv.id]
    combinados.push(copia)
    s = enfileirar(s, { tipo: 'combinado', id: idCopia, versaoBase: null, dados: { ...op.dados!, nome: nomeCopia } })
    avisos.push(`“${op.dados!.nome || 'Combinado'}” também mudou em outro aparelho. Guardamos as duas versões.`)
  }

  // 2. Confirmações: a versão nova do servidor passa a ser a base do que ainda está na fila
  for (const op of enviadas) {
    if (op.tipo !== 'combinado' || r.conflitos.some((c) => c.id === op.id)) continue
    const l = porId.get(op.id)
    if (!l) continue
    s.versoes[op.id] = l.versao
    s.fila = s.fila.map((o) => (o.tipo === 'combinado' && o.id === op.id ? { ...o, versaoBase: l.versao } : o))
    if (l.excluido_em) delete s.versoes[op.id]
  }

  // 3. Mudanças vindas do servidor
  for (const l of r.combinados) {
    if (pendenteCombinado(l.id) || r.conflitos.some((c) => c.id === l.id)) continue
    if (l.excluido_em) {
      combinados = combinados.filter((x) => x.id !== l.id)
      delete s.versoes[l.id]
      continue
    }
    if ((s.versoes[l.id] ?? 0) > l.versao) continue
    combinados = [...combinados.filter((x) => x.id !== l.id), daLinha(l)]
    s.versoes[l.id] = l.versao
  }

  for (const f of r.favoritos) {
    const k = chaveFavorito(f.situacao_id, f.caminho_id || null)
    if (pendenteFavorito(k)) continue
    if (s.favoritosEm[k] && s.favoritosEm[k] >= f.alterado_em) continue
    s.favoritosEm[k] = f.alterado_em
    favoritos = favoritos.filter((x) => chaveFavorito(x.situacaoId, x.caminhoId) !== k)
    if (f.salvo) favoritos.unshift({ situacaoId: f.situacao_id as SituacaoId, caminhoId: f.caminho_id || null, salvoEm: f.alterado_em })
  }

  for (const reg of r.registros) {
    if (reg.excluido_em) {
      registros = registros.filter((x) => x.id !== reg.id)
      continue
    }
    if (pendenteRegistro(reg.id) || registros.some((x) => x.id === reg.id)) continue
    registros.push({
      id: reg.id, situacaoId: reg.situacao_id as SituacaoId | null, caminhoId: reg.caminho_id, resposta: reg.resposta,
      anotacao: reg.anotacao, criadoEm: reg.criado_em, origem: reg.origem, legado: reg.legado,
    })
  }
  registros.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))

  // 4. Recusas: a operação sai da fila; o item continua no aparelho
  for (const rej of r.rejeitados) {
    if (rej.motivo === 'id_em_uso') avisos.push('Um item não pôde ser sincronizado. Ele continua neste aparelho.')
  }

  s.cursor = r.servidor_em
  s.ultimaEm = r.servidor_em
  return { local: { ...local, combinados, favoritos, registros }, sinc: s, avisos }
}
