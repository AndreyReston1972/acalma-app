import type { CenaId } from '../ilustracoes/Cena'

/**
 * Estado editorial de cada texto. Tudo nesta versão é "rascunho": candidato
 * à revisão editorial e profissional, ainda não validado.
 */
export type EstadoEditorial = 'rascunho' | 'revisado'

/** Identificadores estáveis: usados em favoritos, registros e combinados salvos. */
export type SituacaoId =
  | 'desligar-tela'
  | 'ouvir-nao'
  | 'ir-embora'
  | 'banho-roupa'
  | 'guardar-brinquedos'
  | 'outra-situacao'

export type AcaoId =
  | 'guardar-brinquedos'
  | 'calcar'
  | 'sair'
  | 'guardar-aparelho'
  | 'brincar'
  | 'separar-roupa'
  | 'tomar-banho'
  | 'vestir'
  | 'lavar-maos'
  | 'ler-historia'

export type ModeloId = 'sair-de-casa' | 'encerrar-tela' | 'hora-do-banho'

/**
 * Caminho opcional depois da primeira ajuda ("Ainda está difícil" etc.).
 * Um nível só: não abre novas perguntas.
 */
export interface Caminho {
  id: string
  rotulo: string
  orientacao: string
  frase: string
  /** Rótulo da frase quando ela depende do que veio antes (ex.: só na pausa). */
  rotuloFrase?: string
  /** "Se precisarem seguir": o que fazer quando não dá para ficar parado. */
  seguir?: string
  /** "Cuidado": aviso de segurança, sempre visível (nunca escondido em outro toque). */
  cuidado?: string
}

export interface Situacao {
  id: SituacaoId
  titulo: string
  cena: CenaId
  /** 1. O que fazer agora: uma ação curta. */
  agora: string
  /** 2. Frase sugerida para dizer à criança. */
  frase: string
  /** 3. Próximo passo, quando houver uma brecha. */
  depois: string
  /** Dois ou três caminhos específicos desta situação. */
  caminhos: Caminho[]
  /** 4. Preparação simples para a próxima vez (fora da crise). */
  proximaVez: string
  /** Modelo de combinado que combina com o contexto, se houver. */
  modeloParaProximaVez?: ModeloId
  estado: EstadoEditorial
}

export interface Acao {
  id: AcaoId
  /** Rótulo concreto, como aparece para a criança. */
  rotulo: string
  cena: CenaId
}

export interface Modelo {
  id: ModeloId
  titulo: string
  passos: AcaoId[]
  estado: EstadoEditorial
}
