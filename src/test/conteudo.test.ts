import { describe, expect, it } from 'vitest'
import { situacoes } from '../content/situacoes'
import { sequencias, buscarSequencia } from '../content/sequencias'
import { seguranca } from '../content/seguranca'

const todosOsTextos = [
  ...situacoes.flatMap((s) => [s.titulo, s.agora, s.frase, s.depois, ...s.seContinuarDificil]),
  ...sequencias.flatMap((s) => [s.titulo, ...s.passos.map((p) => p.rotulo)]),
  seguranca.titulo,
  seguranca.introducao,
  seguranca.fechamento,
]

describe('conteúdo do protótipo', () => {
  it('tem as seis situações do briefing, com ids estáveis e únicos', () => {
    expect(situacoes.map((s) => s.id)).toEqual([
      'desligar-tela',
      'ouvir-nao',
      'ir-embora',
      'banho-roupa',
      'guardar-brinquedos',
      'outra-situacao',
    ])
  })

  it('cada situação tem texto próprio, não o mesmo parágrafo com palavras trocadas', () => {
    for (const campo of ['agora', 'frase', 'depois'] as const) {
      const textos = situacoes.map((s) => s[campo])
      expect(new Set(textos).size).toBe(textos.length)
    }
    for (const s of situacoes) expect(s.seContinuarDificil.length).toBeGreaterThanOrEqual(3)
  })

  it('a orientação de referência (desligar a tela) é a mais completa', () => {
    const tela = situacoes.find((s) => s.id === 'desligar-tela')!
    expect(tela.seContinuarDificil.length).toBe(Math.max(...situacoes.map((s) => s.seContinuarDificil.length)))
    expect(tela.prepararDaProximaVez).toBe('encerrar-tela')
  })

  it('links para o Preparar apontam para sequências existentes', () => {
    for (const s of situacoes) if (s.prepararDaProximaVez) expect(buscarSequencia(s.prepararDaProximaVez)).toBeDefined()
    expect(sequencias.map((s) => s.id)).toEqual(['sair', 'encerrar-tela', 'banho'])
  })

  it('evita o que a direção de produto proíbe', () => {
    const proibidos = [
      /mam[ãa]e/i,
      /neuroci[êe]ncia/i,
      /\d+\s?%/,
      /você conseguiu/i,
      /para sempre|vital[íi]cio/i,
      /diagn[óo]stic|tea\b|tdah|rem[ée]dio|medica/i,
      /quintal/i,
      /só se acalma se/i,
    ]
    for (const texto of todosOsTextos) for (const p of proibidos) expect(texto).not.toMatch(p)
  })

  it('tudo continua marcado como rascunho editorial', () => {
    expect([...situacoes, ...sequencias].every((x) => x.estado === 'rascunho')).toBe(true)
  })

  it('o apoio de segurança usa só os contatos já presentes no projeto Nina', () => {
    expect(seguranca.contatos.map((c) => c.numero)).toEqual(['190', '192', '188'])
  })
})
