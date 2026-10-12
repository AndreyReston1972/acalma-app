import type { Sequencia } from './tipos'

/* Exemplos adaptáveis, não regras universais. Candidatos à revisão editorial. */
export const sequencias: Sequencia[] = [
  {
    id: 'sair',
    titulo: 'Guardar, calçar, sair',
    passos: [
      { id: 'guardar', rotulo: 'Guardar', ilustracao: 'cesta' },
      { id: 'calcar', rotulo: 'Calçar', ilustracao: 'tenis' },
      { id: 'sair', rotulo: 'Sair', ilustracao: 'porta' },
    ],
    estado: 'rascunho',
  },
  {
    id: 'encerrar-tela',
    titulo: 'Encerrar a tela',
    passos: [
      { id: 'encerrar', rotulo: 'Encerrar a tela', ilustracao: 'tela' },
      { id: 'guardar-aparelho', rotulo: 'Guardar o aparelho', ilustracao: 'gaveta' },
      { id: 'proxima', rotulo: 'Próxima atividade', ilustracao: 'blocos' },
    ],
    estado: 'rascunho',
  },
  {
    id: 'banho',
    titulo: 'Hora do banho',
    passos: [
      { id: 'separar', rotulo: 'Separar a roupa', ilustracao: 'roupa' },
      { id: 'banho', rotulo: 'Banho', ilustracao: 'banheira' },
      { id: 'vestir', rotulo: 'Vestir', ilustracao: 'camiseta' },
    ],
    estado: 'rascunho',
  },
]

export function buscarSequencia(id: string | undefined): Sequencia | undefined {
  return sequencias.find((s) => s.id === id)
}
