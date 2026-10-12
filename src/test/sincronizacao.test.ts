import { describe, expect, it } from 'vitest'
import { aplicarResposta, enfileirar, montarMudancas, sincVazio, type Local, type Sinc } from '../armazenamento/sincronizacao'
import { ServidorFalso } from './servidorFalso'

const dados = (nome: string, passos = ['calcar', 'sair']) => ({ nome, modeloId: null, passos: passos as never, criadoEm: '2026-10-12T10:00:00Z' })
const local = (): Local => ({ combinados: [], favoritos: [], registros: [] })

/** Um aparelho mínimo: estado local + fila + uma rodada de sincronização. */
function aparelho(srv: ServidorFalso, uid: string) {
  let l = local()
  let s: Sinc = sincVazio()
  let n = 0
  const avisos: string[] = []
  return {
    get local() { return l },
    get sinc() { return s },
    avisos,
    salvar(id: string, nome: string, passos?: string[]) {
      const d = dados(nome, passos)
      l = { ...l, combinados: [...l.combinados.filter((c) => c.id !== id), { id, ...d, atualizadoEm: '' }] }
      s = enfileirar(s, { tipo: 'combinado', id, versaoBase: s.versoes[id] ?? null, dados: d })
    },
    excluir(id: string) {
      l = { ...l, combinados: l.combinados.filter((c) => c.id !== id) }
      s = enfileirar(s, { tipo: 'combinado', id, versaoBase: s.versoes[id] ?? null, excluido: true })
    },
    sincronizar() {
      const enviadas = s.fila
      const r = srv.sincronizar(uid, JSON.parse(JSON.stringify(montarMudancas(enviadas))), s.cursor)
      const res = aplicarResposta(l, s, enviadas, r, () => `c-copia-${++n}`)
      l = res.local
      s = res.sinc
      avisos.push(...res.avisos)
    },
  }
}

describe('fila', () => {
  it('junta edições do mesmo combinado mantendo a versão-base da primeira', () => {
    let s = sincVazio()
    s = { ...s, versoes: { a: 3 } }
    s = enfileirar(s, { tipo: 'combinado', id: 'a', versaoBase: 3, dados: dados('1') })
    s = enfileirar(s, { tipo: 'combinado', id: 'a', versaoBase: 3, dados: dados('2') })
    expect(s.fila).toHaveLength(1)
    expect(s.fila[0]).toMatchObject({ versaoBase: 3, dados: { nome: '2' } })
  })

  it('criado e excluído antes de sincronizar não viaja', () => {
    let s = enfileirar(sincVazio(), { tipo: 'combinado', id: 'a', versaoBase: null, dados: dados('x') })
    s = enfileirar(s, { tipo: 'combinado', id: 'a', versaoBase: null, excluido: true })
    expect(s.fila).toEqual([])
  })

  it('salvar e desmarcar a mesma orientação várias vezes vira só o último estado', () => {
    let s = sincVazio()
    for (const [salvo, t] of [[true, '1'], [false, '2'], [true, '3']] as const)
      s = enfileirar(s, { tipo: 'favorito', situacaoId: 'ir-embora', caminhoId: null, salvo, alteradoEm: `2026-10-12T10:00:0${t}Z` })
    expect(s.fila).toHaveLength(1)
    expect(montarMudancas(s.fila).favoritos).toEqual([{ situacao_id: 'ir-embora', caminho_id: '', salvo: true, alterado_em: '2026-10-12T10:00:03Z' }])
  })
})

describe('dois aparelhos da mesma conta', () => {
  it('o que um cria, o outro recebe; edição sequencial não gera conflito', () => {
    const srv = new ServidorFalso()
    const a = aparelho(srv, 'u1')
    const b = aparelho(srv, 'u1')
    a.salvar('c-1', 'Escola')
    a.sincronizar()
    b.sincronizar()
    expect(b.local.combinados.map((c) => c.nome)).toEqual(['Escola'])
    b.salvar('c-1', 'Escola cedo')
    b.sincronizar()
    a.sincronizar()
    expect(a.local.combinados.map((c) => c.nome)).toEqual(['Escola cedo'])
    expect(a.avisos).toEqual([])
  })

  it('edição simultânea: a versão do servidor fica e a daqui vira cópia, sem perda', () => {
    const srv = new ServidorFalso()
    const a = aparelho(srv, 'u1')
    const b = aparelho(srv, 'u1')
    a.salvar('c-1', 'Escola')
    a.sincronizar()
    b.sincronizar()
    a.salvar('c-1', 'Versão A')
    b.salvar('c-1', 'Versão B')
    a.sincronizar()
    b.sincronizar()
    expect(b.local.combinados.map((c) => c.nome).sort()).toEqual(['Versão A', 'Versão B (cópia)'])
    expect(b.avisos[0]).toMatch(/duas versões/)
    b.sincronizar() // a cópia sobe
    a.sincronizar()
    expect(a.local.combinados.map((c) => c.nome).sort()).toEqual(['Versão A', 'Versão B (cópia)'])
  })

  it('exclusão aqui x edição lá: o mais recente não é apagado', () => {
    const srv = new ServidorFalso()
    const a = aparelho(srv, 'u1')
    const b = aparelho(srv, 'u1')
    a.salvar('c-1', 'Escola')
    a.sincronizar()
    b.sincronizar()
    b.salvar('c-1', 'Escola editada')
    b.sincronizar()
    a.excluir('c-1')
    a.sincronizar()
    expect(a.local.combinados.map((c) => c.nome)).toEqual(['Escola editada'])
    expect(a.avisos[0]).toMatch(/não foi excluído/)
  })

  it('exclusão chega ao outro aparelho', () => {
    const srv = new ServidorFalso()
    const a = aparelho(srv, 'u1')
    const b = aparelho(srv, 'u1')
    a.salvar('c-1', 'Escola')
    a.sincronizar()
    b.sincronizar()
    a.excluir('c-1')
    a.sincronizar()
    b.sincronizar()
    expect(b.local.combinados).toEqual([])
  })

  it('resposta perdida: reenviar o mesmo combinado novo não duplica nem cria cópia', () => {
    const srv = new ServidorFalso()
    const a = aparelho(srv, 'u1')
    a.salvar('c-1', 'Escola')
    // o servidor aplica, mas a resposta "se perde": o aparelho reenvia a mesma fila
    srv.sincronizar('u1', JSON.parse(JSON.stringify(montarMudancas(a.sinc.fila))), null)
    a.sincronizar()
    expect(a.local.combinados.map((c) => c.nome)).toEqual(['Escola'])
    expect(a.avisos).toEqual([])
    expect([...srv.combinados.values()]).toHaveLength(1)
  })

  it('mudança feita durante a chamada continua na fila, rebaseada na versão nova', () => {
    const srv = new ServidorFalso()
    const l = local()
    let s = sincVazio()
    s = enfileirar(s, { tipo: 'combinado', id: 'c-1', versaoBase: null, dados: dados('v1') })
    const enviadas = s.fila
    const r = srv.sincronizar('u1', JSON.parse(JSON.stringify(montarMudancas(enviadas))), null)
    s = enfileirar(s, { tipo: 'combinado', id: 'c-1', versaoBase: null, dados: dados('v2') }) // durante a chamada
    const res = aplicarResposta(l, s, enviadas, r, () => 'x')
    s = res.sinc
    expect(s.fila).toHaveLength(1)
    expect(s.fila[0]).toMatchObject({ versaoBase: 1, dados: { nome: 'v2' } })
    const r2 = srv.sincronizar('u1', JSON.parse(JSON.stringify(montarMudancas(s.fila))), s.cursor)
    expect(r2.conflitos).toEqual([])
  })
})
