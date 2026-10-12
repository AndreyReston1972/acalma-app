import { describe, expect, it } from 'vitest'
import {
  CHAVE,
  CHAVE_V1,
  adicionarRegistro,
  alternarFavorito,
  apagarDadosDoPrototipo,
  excluirCombinado,
  excluirRegistro,
  lerEstado,
  salvarCombinado,
} from '../armazenamento/armazenamento'

const LEGADO = {
  'acalma_diario_2026-06-01': '[{"data":"2026-06-01T10:00:00.000Z","emocaoId":"raiva"}]',
  acalma_perfil: '{"idade":"2-3"}',
  acalma_onboarding: 'done',
  acalma_checklist: '{"semana":"2026-06-01","marcados":[0]}',
}
const plantarLegado = () => Object.entries(LEGADO).forEach(([k, v]) => localStorage.setItem(k, v))
const legadoIntacto = () => Object.entries(LEGADO).every(([k, v]) => localStorage.getItem(k) === v)
const chavesLegadas = () => Object.keys(localStorage).filter((k) => k.startsWith('acalma_')).sort()

const V1 = {
  versao: 1,
  favoritos: [
    { situacaoId: 'desligar-tela', salvoEm: '2026-10-12T12:00:00.000Z' },
    { situacaoId: 'nao-existe', salvoEm: '2026-10-12T12:00:00.000Z' },
  ],
  registros: [
    { id: 'r1', situacaoId: 'ir-embora', criadoEm: '2026-10-12T12:05:00.000Z', resposta: 'um-pouco', anotacao: 'Despedida do escorregador.' },
  ],
}

describe('migração v1 → v2', () => {
  it('preserva favoritos e registros da v1 e começa sem combinados', () => {
    localStorage.setItem(CHAVE_V1, JSON.stringify(V1))
    const e = lerEstado()
    expect(e.versao).toBe(2)
    expect(e.favoritos).toEqual([{ situacaoId: 'desligar-tela', caminhoId: null, salvoEm: '2026-10-12T12:00:00.000Z' }])
    expect(e.registros).toEqual([
      { id: 'r1', situacaoId: 'ir-embora', caminhoId: null, criadoEm: '2026-10-12T12:05:00.000Z', resposta: 'um-pouco', anotacao: 'Despedida do escorregador.', origem: 'acalma', legado: null },
    ])
    expect(e.combinados).toEqual([])
    expect(JSON.parse(localStorage.getItem(CHAVE)!).versao).toBe(2)
    // a v1 continua lá (permite voltar à versão anterior)
    expect(JSON.parse(localStorage.getItem(CHAVE_V1)!)).toEqual(V1)
  })

  it('não migra de novo se a v2 já existe', () => {
    localStorage.setItem(CHAVE, JSON.stringify({ versao: 2, favoritos: [], registros: [], combinados: [] }))
    localStorage.setItem(CHAVE_V1, JSON.stringify(V1))
    expect(lerEstado().favoritos).toHaveLength(0)
  })

  it('v1 corrompida não quebra e não grava nada', () => {
    localStorage.setItem(CHAVE_V1, '{quebrado')
    expect(lerEstado()).toEqual({ versao: 2, favoritos: [], registros: [], combinados: [] })
    expect(localStorage.getItem(CHAVE)).toBeNull()
  })
})

describe('favoritos por variação', () => {
  it('a orientação base e cada caminho são favoritos independentes', () => {
    alternarFavorito('desligar-tela', 'pede-mais-um')
    expect(lerEstado().favoritos.map((f) => [f.situacaoId, f.caminhoId])).toEqual([['desligar-tela', 'pede-mais-um']])
    alternarFavorito('desligar-tela', null)
    expect(lerEstado().favoritos).toHaveLength(2)
    alternarFavorito('desligar-tela', 'pede-mais-um')
    expect(lerEstado().favoritos.map((f) => f.caminhoId)).toEqual([null])
  })

  it('caminho inexistente vira a orientação base ao ler', () => {
    localStorage.setItem(CHAVE, JSON.stringify({ versao: 2, favoritos: [{ situacaoId: 'ir-embora', caminhoId: 'inventado', salvoEm: 'x' }], registros: [], combinados: [] }))
    expect(lerEstado().favoritos[0].caminhoId).toBeNull()
  })
})

describe('combinados', () => {
  it('salvar é idempotente pelo id: repetir não duplica', () => {
    const dados = { id: 'c-1', nome: ' Escola ', modeloId: 'sair-de-casa' as const, passos: ['guardar-brinquedos', 'calcar', 'sair'] as const }
    salvarCombinado({ ...dados, passos: [...dados.passos] })
    salvarCombinado({ ...dados, passos: [...dados.passos] })
    salvarCombinado({ ...dados, passos: [...dados.passos] })
    expect(lerEstado().combinados).toHaveLength(1)
    expect(lerEstado().combinados[0].nome).toBe('Escola')
  })

  it('edita mantendo a data de criação e exclui', () => {
    const c = salvarCombinado({ id: 'c-2', nome: '', modeloId: null, passos: ['lavar-maos', 'ler-historia'] }, new Date('2026-10-12T10:00:00Z'))
    salvarCombinado({ id: 'c-2', nome: 'Noite', modeloId: null, passos: ['ler-historia', 'lavar-maos'] }, new Date('2026-10-12T11:00:00Z'))
    const editado = lerEstado().combinados[0]
    expect(editado.passos).toEqual(['ler-historia', 'lavar-maos'])
    expect(editado.criadoEm).toBe(c.criadoEm)
    expect(editado.atualizadoEm).toBe('2026-10-12T11:00:00.000Z')
    excluirCombinado('c-2')
    expect(lerEstado().combinados).toHaveLength(0)
  })

  it('recusa menos de 2 ou mais de 5 passos', () => {
    expect(() => salvarCombinado({ id: 'x', nome: '', modeloId: null, passos: ['sair'] })).toThrow()
    expect(() =>
      salvarCombinado({ id: 'y', nome: '', modeloId: null, passos: ['sair', 'calcar', 'vestir', 'brincar', 'lavar-maos', 'ler-historia'] }),
    ).toThrow()
    expect(lerEstado().combinados).toHaveLength(0)
  })
})

describe('isolamento do app publicado', () => {
  it('nenhuma operação lê, altera, cria ou apaga chaves acalma_*', () => {
    plantarLegado()
    const antes = chavesLegadas()
    expect(lerEstado().registros).toHaveLength(0)
    alternarFavorito('banho-roupa', 'algo-incomoda')
    const r = adicionarRegistro({ situacaoId: 'banho-roupa', caminhoId: 'algo-incomoda', resposta: 'ajudou', anotacao: 'água morna' })
    excluirRegistro(r.id)
    salvarCombinado({ id: 'c-3', nome: '', modeloId: 'hora-do-banho', passos: ['separar-roupa', 'tomar-banho'] })
    excluirCombinado('c-3')
    apagarDadosDoPrototipo()
    expect(legadoIntacto()).toBe(true)
    expect(chavesLegadas()).toEqual(antes)
    expect(localStorage.getItem(CHAVE)).toBeNull()
  })

  it('registro limita a anotação a 280 caracteres', () => {
    expect(adicionarRegistro({ situacaoId: 'ouvir-nao', resposta: 'ajudou', anotacao: 'a'.repeat(500) }).anotacao).toHaveLength(280)
  })
})
