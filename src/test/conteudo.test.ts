import { describe, expect, it } from 'vitest'
import { situacoes } from '../content/situacoes'
import { acoes, modelos, buscarAcao, PASSOS_MAX, PASSOS_MIN } from '../content/combinados'
import { seguranca } from '../content/seguranca'

const textosSituacoes = situacoes.flatMap((s) => [
  s.titulo,
  s.agora,
  s.frase,
  s.depois,
  ...s.caminhos.flatMap((c) => [c.rotulo, c.orientacao, c.frase]),
])
const todosOsTextos = [
  ...textosSituacoes,
  ...acoes.map((a) => a.rotulo),
  ...modelos.map((m) => m.titulo),
  seguranca.titulo,
  seguranca.introducao,
  seguranca.avisoApoio,
  seguranca.fechamento,
  ...[...seguranca.emergencia, seguranca.apoio].flatMap((c) => [c.quando, c.detalhe]),
]

describe('situações', () => {
  it('são as seis do briefing, com ids estáveis', () => {
    expect(situacoes.map((s) => s.id)).toEqual([
      'desligar-tela',
      'ouvir-nao',
      'ir-embora',
      'banho-roupa',
      'guardar-brinquedos',
      'outra-situacao',
    ])
  })

  it('cada uma tem de 2 a 3 caminhos, com ids únicos dentro da situação', () => {
    for (const s of situacoes) {
      expect(s.caminhos.length).toBeGreaterThanOrEqual(2)
      expect(s.caminhos.length).toBeLessThanOrEqual(3)
      expect(new Set(s.caminhos.map((c) => c.id)).size).toBe(s.caminhos.length)
    }
  })

  it('textos não se repetem entre situações nem entre caminhos', () => {
    const orientacoes = [...situacoes.map((s) => s.agora), ...situacoes.flatMap((s) => s.caminhos.map((c) => c.orientacao))]
    const frases = [...situacoes.map((s) => s.frase), ...situacoes.flatMap((s) => s.caminhos.map((c) => c.frase))]
    expect(new Set(orientacoes).size).toBe(orientacoes.length)
    expect(new Set(frases).size).toBe(frases.length)
  })

  it('a mesma lista de botões não se repete em todas as situações', () => {
    const conjuntos = situacoes.map((s) => s.caminhos.map((c) => c.rotulo).join('|'))
    expect(new Set(conjuntos).size).toBe(situacoes.length)
  })

  it('"Desligar a tela" e "Ir embora" são as referências com três caminhos', () => {
    for (const id of ['desligar-tela', 'ir-embora']) expect(situacoes.find((s) => s.id === id)!.caminhos).toHaveLength(3)
  })

  it('aplica as correções editoriais obrigatórias', () => {
    const tudo = textosSituacoes.join('\n')
    expect(tudo).not.toMatch(/firmeza|segure a mão|segurar a mão|conten[çc][ãa]o/i)
    expect(tudo).not.toMatch(/foi difícil sair/i)
    expect(tudo).not.toMatch(/mantenha o “?não”?\./i)
    const irEmbora = situacoes.find((s) => s.id === 'ir-embora')!
    expect(irEmbora.modeloParaProximaVez).toBeUndefined()
    expect(irEmbora.frase).toMatch(/está difícil ir embora/i)
    expect(situacoes.find((s) => s.id === 'ouvir-nao')!.caminhos.some((c) => c.id === 'quero-rever')).toBe(true)
  })
})

describe('combinados', () => {
  it('catálogo pequeno: 10 ações concretas, cada uma com cena própria', () => {
    expect(acoes).toHaveLength(10)
    expect(new Set(acoes.map((a) => a.cena)).size).toBe(10)
    for (const a of acoes) expect(a.rotulo.split(' ').length).toBeGreaterThanOrEqual(1)
  })

  it('modelos: sair de casa, encerrar a tela e hora do banho, com passos válidos', () => {
    expect(modelos.map((m) => m.id)).toEqual(['sair-de-casa', 'encerrar-tela', 'hora-do-banho'])
    for (const m of modelos) {
      expect(m.passos.length).toBeGreaterThanOrEqual(PASSOS_MIN)
      expect(m.passos.length).toBeLessThanOrEqual(PASSOS_MAX)
      for (const p of m.passos) expect(buscarAcao(p)).toBeDefined()
    }
  })

  it('situações só apontam para modelos coerentes com o contexto', () => {
    const ligacoes = Object.fromEntries(situacoes.map((s) => [s.id, s.modeloParaProximaVez ?? null]))
    expect(ligacoes).toEqual({
      'desligar-tela': 'encerrar-tela',
      'ouvir-nao': null,
      'ir-embora': null,
      'banho-roupa': 'hora-do-banho',
      'guardar-brinquedos': null,
      'outra-situacao': null,
    })
  })
})

describe('tom e limites', () => {
  it('evita o que a direção de produto proíbe', () => {
    const proibidos = [
      /mam[ãa]e/i,
      /neuroci[êe]ncia/i,
      /\d+\s?%/,
      /você conseguiu/i,
      /para sempre|vital[íi]cio/i,
      /diagn[óo]stic|\btea\b|tdah|rem[ée]dio|medica/i,
      /quintal/i,
      /só se acalma se/i,
      /todas as crianças|toda criança/i,
      /garant/i,
    ]
    for (const texto of todosOsTextos) for (const p of proibidos) expect(texto, texto).not.toMatch(p)
  })

  it('tudo continua marcado como rascunho editorial', () => {
    expect([...situacoes, ...modelos].every((x) => x.estado === 'rascunho')).toBe(true)
  })
})

describe('segurança', () => {
  it('diferencia 192, 190 e 188, com o CVV fora da emergência', () => {
    expect(seguranca.emergencia.map((c) => c.numero)).toEqual(['192', '190'])
    expect(seguranca.apoio.numero).toBe('188')
    expect(seguranca.avisoApoio).toMatch(/não é atendimento de emergência/i)
    expect(seguranca.introducao).not.toMatch(/mais do que uma birra/i)
  })
})
