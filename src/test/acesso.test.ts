import { describe, expect, it } from 'vitest'
import { decidirAcesso } from '../conta/acesso'

const agora = new Date('2026-10-12T12:00:00Z')
const dias = (n: number) => new Date(agora.getTime() - n * 86_400_000).toISOString()

describe('decisão de acesso', () => {
  it('online, vale o servidor', () => {
    const casos = [
      ['ativo', { tipo: 'liberado', origem: 'servidor' }],
      ['pendente', { tipo: 'tela', tela: 'processando' }],
      ['revogado', { tipo: 'tela', tela: 'revogado' }],
      ['nenhum', { tipo: 'tela', tela: 'nao_localizado' }],
      ['nao_vinculada', { tipo: 'tela', tela: 'nao_localizado' }],
      ['confirme_o_email', { tipo: 'tela', tela: 'nao_localizado' }],
      ['sem_sessao', { tipo: 'tela', tela: 'entrar' }],
    ] as const
    for (const [estado, esperado] of casos)
      expect(decidirAcesso({ resultado: { ok: true, estado }, guardado: { estado: 'ativo', verificadoEm: dias(0) }, agora })).toEqual(esperado)
  })

  it('reembolso: online, o servidor vence a confirmação guardada', () => {
    expect(decidirAcesso({ resultado: { ok: true, estado: 'revogado' }, guardado: { estado: 'ativo', verificadoEm: dias(1) }, agora })).toEqual({ tipo: 'tela', tela: 'revogado' })
  })

  it('sem rede, dentro da janela, libera pela confirmação guardada', () => {
    expect(decidirAcesso({ resultado: { ok: false, motivo: 'offline' }, guardado: { estado: 'ativo', verificadoEm: dias(29) }, agora, janelaDias: 30 })).toEqual({ tipo: 'liberado', origem: 'cache' })
  })

  it('sem rede, fora da janela ou sem confirmação, pede conexão', () => {
    expect(decidirAcesso({ resultado: { ok: false, motivo: 'offline' }, guardado: { estado: 'ativo', verificadoEm: dias(31) }, agora, janelaDias: 30 })).toEqual({ tipo: 'tela', tela: 'confirmar_online' })
    expect(decidirAcesso({ resultado: { ok: false, motivo: 'offline' }, guardado: null, agora })).toEqual({ tipo: 'tela', tela: 'confirmar_online' })
  })

  it('erro do servidor (com rede): usa a janela; fora dela, erro com tentar de novo', () => {
    expect(decidirAcesso({ resultado: { ok: false, motivo: 'erro' }, guardado: { estado: 'ativo', verificadoEm: dias(2) }, agora })).toEqual({ tipo: 'liberado', origem: 'cache' })
    expect(decidirAcesso({ resultado: { ok: false, motivo: 'erro' }, guardado: null, agora })).toEqual({ tipo: 'tela', tela: 'erro_rede' })
  })

  it('sem rede, um acesso já revogado continua revogado', () => {
    expect(decidirAcesso({ resultado: { ok: false, motivo: 'offline' }, guardado: { estado: 'revogado', verificadoEm: dias(1) }, agora })).toEqual({ tipo: 'tela', tela: 'revogado' })
  })

  it('relógio do aparelho atrasado (confirmação "no futuro") não estende o acesso', () => {
    expect(decidirAcesso({ resultado: { ok: false, motivo: 'offline' }, guardado: { estado: 'ativo', verificadoEm: dias(-400) }, agora })).toEqual({ tipo: 'tela', tela: 'confirmar_online' })
  })
})
