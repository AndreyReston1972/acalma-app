import { JANELA_OFFLINE_DIAS } from '../config'
import type { EstadoServidor } from './servico'

/*
 * Decide o que mostrar, a partir da resposta do servidor (ou da falta dela) e da
 * última confirmação guardada no aparelho. Função pura, testada.
 *
 *   • Online: vale o servidor. Reembolso aparece na próxima abertura com rede.
 *   • Sem rede, com confirmação "ativo" dentro da janela (proposta: 30 dias): libera.
 *   • Sem rede e fora da janela, ou sem confirmação: pede conexão uma vez.
 *   • O que o navegador guarda NÃO é garantia de acesso permanente: limpar os dados
 *     do site apaga a confirmação e a cópia local; basta entrar de novo (com rede).
 */
export type Tela = 'entrar' | 'processando' | 'nao_localizado' | 'revogado' | 'confirmar_online' | 'erro_rede'

export type Decisao = { tipo: 'liberado'; origem: 'servidor' | 'cache' } | { tipo: 'tela'; tela: Tela }

export interface AcessoGuardado {
  estado: EstadoServidor
  verificadoEm: string
}

export type ResultadoServidor = { ok: true; estado: EstadoServidor } | { ok: false; motivo: 'offline' | 'erro' }

const DIA = 86_400_000

export function telaDoEstado(estado: EstadoServidor): Decisao {
  switch (estado) {
    case 'ativo':
      return { tipo: 'liberado', origem: 'servidor' }
    case 'pendente':
      return { tipo: 'tela', tela: 'processando' }
    case 'revogado':
      return { tipo: 'tela', tela: 'revogado' }
    case 'sem_sessao':
      return { tipo: 'tela', tela: 'entrar' }
    default:
      // nenhum, nao_vinculada (vínculo falhou), confirme_o_email
      return { tipo: 'tela', tela: 'nao_localizado' }
  }
}

export function decidirAcesso(p: {
  resultado: ResultadoServidor
  guardado: AcessoGuardado | null
  agora: Date
  janelaDias?: number
}): Decisao {
  const janela = (p.janelaDias ?? JANELA_OFFLINE_DIAS) * DIA
  if (p.resultado.ok) return telaDoEstado(p.resultado.estado)

  const g = p.guardado
  if (g && g.estado === 'ativo') {
    const idade = p.agora.getTime() - Date.parse(g.verificadoEm)
    if (idade >= 0 && idade <= janela) return { tipo: 'liberado', origem: 'cache' }
    return { tipo: 'tela', tela: p.resultado.motivo === 'offline' ? 'confirmar_online' : 'erro_rede' }
  }
  if (g && g.estado !== 'ativo') {
    const t = telaDoEstado(g.estado)
    if (t.tipo === 'tela') return t
  }
  return { tipo: 'tela', tela: p.resultado.motivo === 'offline' ? 'confirmar_online' : 'erro_rede' }
}

/* Confirmação guardada por conta, neste aparelho. */
const chave = (userId: string) => `acalma.acesso.v1.${userId}`

export function lerAcessoGuardado(userId: string): AcessoGuardado | null {
  try {
    const v = JSON.parse(localStorage.getItem(chave(userId)) ?? 'null')
    return v && typeof v.estado === 'string' && typeof v.verificadoEm === 'string' ? v : null
  } catch {
    return null
  }
}

export function guardarAcesso(userId: string, estado: EstadoServidor, agora = new Date()) {
  try {
    localStorage.setItem(chave(userId), JSON.stringify({ estado, verificadoEm: agora.toISOString() }))
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
}

export function esquecerAcesso(userId: string) {
  try {
    localStorage.removeItem(chave(userId))
  } catch {
    /* nada a fazer */
  }
}
