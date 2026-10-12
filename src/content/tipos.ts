import type { IlustracaoId } from '../ilustracoes/Ilustracao'

/**
 * Estado editorial de cada texto. Nesta rodada tudo é "rascunho": candidato
 * à revisão editorial e profissional, ainda não validado.
 */
export type EstadoEditorial = 'rascunho' | 'revisado'

/** Identificadores estáveis: usados em favoritos e registros salvos no aparelho. */
export type SituacaoId =
  | 'desligar-tela'
  | 'ouvir-nao'
  | 'ir-embora'
  | 'banho-roupa'
  | 'guardar-brinquedos'
  | 'outra-situacao'

export type SequenciaId = 'sair' | 'encerrar-tela' | 'banho'

export interface Situacao {
  id: SituacaoId
  titulo: string
  ilustracao: IlustracaoId
  /** 1. O que fazer agora: uma ação curta. */
  agora: string
  /** 2. Frase sugerida para dizer à criança. */
  frase: string
  /** 3. Próximo passo, quando houver uma brecha. */
  depois: string
  /** Expansão opcional "Se continuar difícil". */
  seContinuarDificil: string[]
  /** Sequência do Preparar que ajuda da próxima vez, se houver. */
  prepararDaProximaVez?: SequenciaId
  estado: EstadoEditorial
}

export interface PassoSequencia {
  id: string
  rotulo: string
  ilustracao: IlustracaoId
}

export interface Sequencia {
  id: SequenciaId
  titulo: string
  passos: PassoSequencia[]
  estado: EstadoEditorial
}
