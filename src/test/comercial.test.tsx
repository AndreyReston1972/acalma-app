import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ProvedorAviso } from '../components/Aviso'
import { ProvedorConta } from '../conta/Conta'
import { guardarAcesso, lerAcessoGuardado } from '../conta/acesso'
import { montarMeusDados } from '../conta/exportacao'
import { ErroLimiteDeEnvio, type ServicoConta } from '../conta/servico'
import { Rotas } from '../App'
import { filaPendente, prefixoConta, salvarCombinado } from '../armazenamento/armazenamento'
import { situacoes } from '../content/situacoes'
import { aparelho, ServidorFalso } from './servidorFalso'

function abrir(servico: ServicoConta | undefined, rota = '/') {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <ProvedorAviso>
        <ProvedorConta servico={servico}>
          <Rotas />
        </ProvedorConta>
      </ProvedorAviso>
    </MemoryRouter>,
  )
}
const home = () => screen.findByRole('heading', { name: /do que você precisa agora/i })

async function pedirCodigo(u: ReturnType<typeof userEvent.setup>, email: string, { aceitar = true, marketing = false } = {}) {
  await u.type(await screen.findByRole('textbox', { name: 'E-mail' }), email)
  if (aceitar) await u.click(screen.getByRole('checkbox', { name: /li e aceito os termos/i }))
  if (marketing) await u.click(screen.getByRole('checkbox', { name: /novidades da nexoedu/i }))
}
async function digitarCodigo(u: ReturnType<typeof userEvent.setup>, codigo = '123456') {
  await u.click(screen.getByRole('button', { name: 'Receber código' }))
  await u.type(await screen.findByRole('textbox', { name: /código recebido por e-mail/i }), codigo)
  await u.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('aceite explícito e marketing separado', () => {
  it('sem marcar o aceite, o código não é pedido; o aceite é registrado ao entrar', async () => {
    const srv = new ServidorFalso()
    srv.conta('a@t.dev')
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico)
    await pedirCodigo(u, 'a@t.dev', { aceitar: false })
    expect(screen.getByRole('button', { name: 'Receber código' })).toBeDisabled()
    expect(screen.getByText(/uma conexão a cada 30 dias confirma o seu acesso/i)).toBeInTheDocument()
    await u.click(screen.getByRole('checkbox', { name: /li e aceito os termos/i }))
    await digitarCodigo(u)
    await home()
    expect(ap.estado.aceites).toBe(1)
    expect(ap.estado.marketing).toEqual([]) // não marcou: nada registrado (não é condição)
  })

  it('marketing só quando a pessoa marca, e pode ser retirado em Conta', async () => {
    const srv = new ServidorFalso()
    srv.conta('m@t.dev')
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico)
    await pedirCodigo(u, 'm@t.dev', { marketing: true })
    await digitarCodigo(u)
    await home()
    expect(ap.estado.marketing).toEqual([true])
    await u.click(screen.getByRole('link', { name: /conta e configurações/i }))
    const caixa = await screen.findByRole('checkbox', { name: /quero receber novidades/i })
    await waitFor(() => expect(caixa).toBeChecked())
    await u.click(caixa)
    await waitFor(() => expect(ap.estado.marketing).toEqual([true, false]))
  })
})

describe('código e envio', () => {
  it('aceita o código de 8 dígitos da configuração real; com menos de 6 o botão fica desligado', async () => {
    const srv = new ServidorFalso()
    srv.conta('oito@t.dev')
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico)
    await pedirCodigo(u, 'oito@t.dev')
    await u.click(screen.getByRole('button', { name: 'Receber código' }))
    const campo = await screen.findByRole('textbox', { name: /código recebido por e-mail/i })
    await u.type(campo, '12345')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()
    await u.type(campo, '678')
    await u.click(screen.getByRole('button', { name: 'Entrar' }))
    await home()
  })

  it('código errado, vencido ou já usado: mesma orientação, sem entrar', async () => {
    const srv = new ServidorFalso()
    srv.conta('c@t.dev')
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico)
    await pedirCodigo(u, 'c@t.dev')
    await digitarCodigo(u, '999999')
    expect(await screen.findByRole('alert')).toHaveTextContent(/incorreto, vencido ou já usado/i)
    expect(ap.estado.aceites).toBe(0)
  })

  it('limite de envio do servidor vira orientação clara', async () => {
    const srv = new ServidorFalso()
    const ap = aparelho(srv)
    ap.servico.enviarCodigo = vi.fn().mockRejectedValue(new ErroLimiteDeEnvio('email rate limit exceeded'))
    const u = userEvent.setup()
    abrir(ap.servico)
    await pedirCodigo(u, 'l@t.dev')
    await u.click(screen.getByRole('button', { name: 'Receber código' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/aguarde um minuto/i)
  })
})

describe('revogação com alterações ainda no aparelho', () => {
  it('nada é descartado: a fila fica, a tela explica, dá para baixar e, com nova compra, tudo sobe', async () => {
    const srv = new ServidorFalso()
    const uid = srv.conta('r@t.dev', 'ativo')
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico)
    await pedirCodigo(u, 'r@t.dev')
    await digitarCodigo(u)
    await home()

    srv.contas.get('r@t.dev')!.acesso = 'revogado' // reembolso confirmado no servidor
    await act(async () => {
      salvarCombinado({ id: 'c-depois-do-reembolso', nome: 'Feito depois', modeloId: null, passos: ['calcar', 'sair'] })
    })
    expect(await screen.findByRole('heading', { name: /acesso foi encerrado/i }, { timeout: 5000 })).toBeInTheDocument()
    expect(ap.estado.recusadasSemAcesso).toBeGreaterThan(0)
    expect(srv.combinados.size).toBe(0)
    expect(filaPendente()).toHaveLength(1)
    expect(JSON.parse(localStorage.getItem(prefixoConta + uid)!).combinados).toHaveLength(1)
    expect(screen.getByText(/uma alteração feita neste aparelho não foi enviada/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /alguém pode se machucar/i })).toBeInTheDocument()

    const blobs: Blob[] = []
    const criar = vi.spyOn(URL, 'createObjectURL').mockImplementation((b) => (blobs.push(b as Blob), 'blob:teste'))
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await u.click(screen.getByRole('button', { name: 'Baixar uma cópia dos meus dados' }))
    expect(await screen.findByText('Cópia gerada.')).toBeInTheDocument()
    expect(criar).toHaveBeenCalledTimes(1)
    const arquivo = JSON.parse(await blobs[0].text())
    expect(arquivo.alteracoes_nao_enviadas.map((o: { id: string }) => o.id)).toEqual(['c-depois-do-reembolso'])
    expect(arquivo.neste_aparelho.combinados.map((c: { nome: string }) => c.nome)).toEqual(['Feito depois'])
    vi.restoreAllMocks()

    srv.contas.get('r@t.dev')!.acesso = 'ativo' // nova compra
    await u.click(screen.getByRole('button', { name: 'Entrar com outro e-mail' }))
    await pedirCodigo(u, 'r@t.dev')
    await digitarCodigo(u)
    await home()
    await waitFor(() => expect([...srv.combinados.values()].map((c) => c.nome)).toEqual(['Feito depois']), { timeout: 4000 })
  })

  it('a cópia inclui conta, aparelho e o que não foi enviado', () => {
    const d = montarMeusDados({
      email: 'x@t.dev', agora: new Date('2026-10-13T10:00:00Z'), conta: { combinados: ['A'] },
      local: { combinados: [], favoritos: [], registros: [] },
      naoEnviadas: [{ seq: 1, tipo: 'combinado', id: 'c1', versaoBase: null, excluido: true }],
    })
    expect(d).toMatchObject({ conta: 'x@t.dev', na_conta: { combinados: ['A'] }, alteracoes_nao_enviadas: [{ id: 'c1' }] })
  })

  it('revogado pode excluir os próprios dados sem comprar', async () => {
    const srv = new ServidorFalso()
    const uid = srv.conta('e@t.dev', 'revogado')
    const ap = aparelho(srv)
    const excluir = vi.spyOn(ap.servico, 'excluirMeusDados')
    ap.entrarComo(srv.contas.get('e@t.dev')!.sessao)
    localStorage.setItem(prefixoConta + uid, JSON.stringify({ versao: 2, favoritos: [], registros: [], combinados: [] }))
    const u = userEvent.setup()
    abrir(ap.servico)
    await u.click(await screen.findByRole('button', { name: 'Excluir meus dados do Acalma' }))
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir dados' }))
    await waitFor(() => expect(excluir).toHaveBeenCalled())
    expect(await screen.findByText('Dados do Acalma excluídos.')).toBeInTheDocument()
  })
})

describe('janela offline', () => {
  it('tentativa sem rede não renova o prazo', async () => {
    const srv = new ServidorFalso()
    const uid = srv.conta('o@t.dev', 'ativo')
    const ap = aparelho(srv)
    ap.entrarComo(srv.contas.get('o@t.dev')!.sessao)
    ap.estado.online = false
    const ha29dias = new Date(Date.now() - 29 * 86_400_000)
    guardarAcesso(uid, 'ativo', ha29dias)
    abrir(ap.servico)
    await home()
    expect(lerAcessoGuardado(uid)!.verificadoEm).toBe(ha29dias.toISOString())
  })
})

describe('transição da versão gratuita', () => {
  it('aviso na entrada; registros antigos abertos sem login e sem compra, sem alterar as chaves', async () => {
    const antigo = JSON.stringify([{ data: '2026-06-01T10:00:00.000Z', emocaoId: 'raiva', antes: 'fome' }])
    localStorage.setItem('acalma_diario_2026-06-01', antigo)
    const srv = new ServidorFalso()
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico)
    expect(await screen.findByText('O Acalma mudou')).toBeInTheDocument()
    await u.click(screen.getByRole('link', { name: /ver e baixar meus registros antigos/i }))
    expect(await screen.findByText(/encontramos 1 registro/i)).toBeInTheDocument()
    expect(screen.getByText(/também não liberam o acalma novo/i)).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Baixar meus registros antigos' }))
    expect(localStorage.getItem('acalma_diario_2026-06-01')).toBe(antigo)
    expect(ap.estado.sincronizacoes).toBe(0)
  })

  it('dados locais antigos não liberam acesso pago', async () => {
    localStorage.setItem('acalma_onboarding', 'done')
    localStorage.setItem('acalma_diario_2026-06-01', '[]')
    abrir(aparelho(new ServidorFalso()).servico)
    expect(await screen.findByRole('heading', { name: 'Entrar no Acalma' })).toBeInTheDocument()
  })
})

describe('convite da Nina fora da crise', () => {
  it.each(['/agora', '/agora/desligar-tela', '/agora/ir-embora/nao-quer-andar', '/preparar/modelo/encerrar-tela/mostrar', '/seguranca'])(
    'não aparece em %s',
    async (rota) => {
      abrir(undefined, rota)
      await screen.findAllByRole('heading')
      expect(screen.queryByText(/conhecer a nina/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/7 dias/i)).not.toBeInTheDocument()
    },
  )

  it('aparece só em Conta (na demonstração, como simulação)', async () => {
    abrir(undefined, '/conta')
    expect(await screen.findByRole('heading', { name: 'Conhecer a Nina' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver como funciona \(simulação\)/i })).toHaveAttribute('href', '/demonstracao/nina')
  })
})

describe('conteúdo', () => {
  it('"Ir embora" não oferece o modelo "Sair de casa" (rotina doméstica); a tela confirma', async () => {
    expect(situacoes.find((s) => s.id === 'ir-embora')!.modeloParaProximaVez).toBeUndefined()
    expect(situacoes.find((s) => s.id === 'desligar-tela')!.modeloParaProximaVez).toBe('encerrar-tela')
    abrir(undefined, '/agora/ir-embora')
    await screen.findByRole('heading', { name: 'Ir embora' })
    // A preparação para a próxima vez aparece em todas as situações; o atalho de combinado, não.
    expect(screen.getByRole('heading', { name: /para a próxima vez/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /montar o combinado/i })).not.toBeInTheDocument()
  })
})

describe('barreira de publicação', () => {
  it('build comercial: documentos finais passam; rascunho com pendência bloqueia; demonstração não é barrada', () => {
    const rodar = (env: Record<string, string>) => {
      try {
        execFileSync(process.execPath, ['scripts/verificar-publicacao.mjs'], { env: { ...process.env, ...env }, stdio: 'pipe' })
        return 0
      } catch (e) {
        return (e as { status: number }).status
      }
    }
    // documentos atuais (finais): passa
    expect(rodar({ VITE_ACALMA_MODO: 'integrado' })).toBe(0)
    // um rascunho com pendência: bloqueia
    const dir = mkdtempSync(join(tmpdir(), 'acalma-docs-'))
    const rascunho = join(dir, 'documentos.ts')
    writeFileSync(rascunho, `export const termos = { titulo: 'T', versao: '2026-10-rascunho', secoes: [{ titulo: 'Conta', paragrafos: ['Responsável: [pendente].'] }] }
export const privacidade = { titulo: 'P', versao: '2026-10-13', secoes: [{ titulo: 'Canal', paragrafos: ['Fale com [canal a definir].'] }] }
`)
    expect(rodar({ VITE_ACALMA_MODO: 'integrado', ACALMA_DOCUMENTOS_TESTE: rascunho })).toBe(1)
    expect(rodar({ VITE_ACALMA_MODO: '', ACALMA_DOCUMENTOS_TESTE: rascunho })).toBe(0)
  })
})

describe('checkout real fora das simulações', () => {
  it('a simulação de "compra não localizada" não leva ao checkout da Hotmart', async () => {
    abrir(undefined, '/demonstracao/acesso/nao_localizado')
    const comprar = await screen.findByRole('button', { name: 'Comprar o Acalma' })
    expect(comprar.tagName).toBe('BUTTON')
    expect(document.querySelector('a[href*="hotmart"]')).toBeNull()
  })
})
