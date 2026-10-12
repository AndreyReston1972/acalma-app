import type { Acao, AcaoId, Modelo, ModeloId } from './tipos'

/*
 * Catálogo pequeno de ações concretas para montar combinados.
 * Rótulos no infinitivo + objeto, para a criança entender o que fazer.
 * Candidatos à revisão editorial.
 */
export const acoes: Acao[] = [
  { id: 'guardar-brinquedos', rotulo: 'Guardar os brinquedos', cena: 'guardar-brinquedos' },
  { id: 'calcar', rotulo: 'Calçar os sapatos', cena: 'calcar' },
  { id: 'sair', rotulo: 'Sair de casa', cena: 'sair' },
  { id: 'guardar-aparelho', rotulo: 'Guardar o aparelho', cena: 'guardar-aparelho' },
  { id: 'brincar', rotulo: 'Brincar', cena: 'brincar' },
  { id: 'separar-roupa', rotulo: 'Separar a roupa', cena: 'separar-roupa' },
  { id: 'tomar-banho', rotulo: 'Tomar banho', cena: 'tomar-banho' },
  { id: 'vestir', rotulo: 'Vestir a roupa', cena: 'vestir' },
  { id: 'lavar-maos', rotulo: 'Lavar as mãos', cena: 'lavar-maos' },
  { id: 'ler-historia', rotulo: 'Ler uma história', cena: 'ler-historia' },
]

/* Modelos: pontos de partida editáveis, não regras universais. */
export const modelos: Modelo[] = [
  { id: 'sair-de-casa', titulo: 'Sair de casa', passos: ['guardar-brinquedos', 'calcar', 'sair'], estado: 'rascunho' },
  { id: 'encerrar-tela', titulo: 'Encerrar a tela', passos: ['guardar-aparelho', 'lavar-maos', 'brincar'], estado: 'rascunho' },
  { id: 'hora-do-banho', titulo: 'Hora do banho', passos: ['separar-roupa', 'tomar-banho', 'vestir', 'ler-historia'], estado: 'rascunho' },
]

export const PASSOS_MIN = 2
export const PASSOS_MAX = 5
export const NOME_MAX = 30

export function buscarAcao(id: string): Acao | undefined {
  return acoes.find((a) => a.id === id)
}

export function ehAcaoId(id: string): id is AcaoId {
  return acoes.some((a) => a.id === id)
}

export function buscarModelo(id: string | null | undefined): Modelo | undefined {
  return modelos.find((m) => m.id === id)
}

export function ehModeloId(id: string): id is ModeloId {
  return modelos.some((m) => m.id === id)
}
