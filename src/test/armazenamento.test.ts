import { describe, expect, it } from 'vitest'
import {
  CHAVE,
  adicionarRegistro,
  alternarFavorito,
  apagarDadosDoPrototipo,
  excluirRegistro,
  lerEstado,
} from '../armazenamento/armazenamento'

const LEGADO = {
  'acalma_diario_2026-06-01': '[{"data":"2026-06-01T10:00:00.000Z","emocaoId":"raiva"}]',
  acalma_perfil: '{"idade":"2-3"}',
  acalma_onboarding: 'done',
  acalma_checklist: '{"semana":"2026-06-01","marcados":[0]}',
}

function plantarLegado() {
  for (const [k, v] of Object.entries(LEGADO)) localStorage.setItem(k, v)
}
function legadoIntacto() {
  return Object.entries(LEGADO).every(([k, v]) => localStorage.getItem(k) === v)
}

describe('persistência local do protótipo', () => {
  it('grava numa chave própria e versionada', () => {
    alternarFavorito('desligar-tela')
    adicionarRegistro({ situacaoId: 'ir-embora', resposta: 'ajudou', anotacao: '  ok  ' })
    const bruto = JSON.parse(localStorage.getItem(CHAVE)!)
    expect(CHAVE).toBe('acalma.prototipo.v1')
    expect(bruto.versao).toBe(1)
    expect(bruto.favoritos[0].situacaoId).toBe('desligar-tela')
    expect(bruto.registros[0]).toMatchObject({ situacaoId: 'ir-embora', resposta: 'ajudou', anotacao: 'ok' })
  })

  it('nunca lê, altera ou apaga as chaves do app publicado', () => {
    plantarLegado()
    expect(lerEstado().registros).toHaveLength(0) // o diário antigo não vira registro
    alternarFavorito('banho-roupa')
    const r = adicionarRegistro({ situacaoId: 'banho-roupa', resposta: 'um-pouco' })
    excluirRegistro(r.id)
    apagarDadosDoPrototipo()
    expect(legadoIntacto()).toBe(true)
    expect(localStorage.getItem(CHAVE)).toBeNull()
  })

  it('dado corrompido ou de versão desconhecida começa vazio sem quebrar', () => {
    localStorage.setItem(CHAVE, '{isto não é json')
    expect(lerEstado()).toEqual({ versao: 1, favoritos: [], registros: [] })
    localStorage.setItem(CHAVE, JSON.stringify({ versao: 99, favoritos: [{ situacaoId: 'desligar-tela' }] }))
    expect(lerEstado().favoritos).toHaveLength(0)
  })

  it('descarta itens inválidos e limita a anotação', () => {
    localStorage.setItem(
      CHAVE,
      JSON.stringify({
        versao: 1,
        favoritos: [{ situacaoId: 'nao-existe', salvoEm: 'x' }, { situacaoId: 'ouvir-nao', salvoEm: '2026-10-12T10:00:00Z' }],
        registros: [{ id: '1', situacaoId: 'ouvir-nao', criadoEm: 'x', resposta: 'nota-10', anotacao: '' }],
      }),
    )
    expect(lerEstado().favoritos.map((f) => f.situacaoId)).toEqual(['ouvir-nao'])
    expect(lerEstado().registros).toHaveLength(0)
    expect(adicionarRegistro({ situacaoId: 'ouvir-nao', resposta: 'ajudou', anotacao: 'a'.repeat(500) }).anotacao).toHaveLength(280)
  })
})
