import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ProvedorAviso } from '../components/Aviso'
import { ProvedorConta } from '../conta/Conta'
import { guardarAcesso } from '../conta/acesso'
import { Rotas } from '../App'
import { CHAVE, prefixoConta, usarEspacoDemonstracao } from '../armazenamento/armazenamento'
import { lerRegistrosAnteriores } from '../armazenamento/legado'
import { aparelho, ServidorFalso } from './servidorFalso'
import type { ServicoConta } from '../conta/servico'

function abrir(servico: ServicoConta, rota = '/') {
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

async function entrarPorCodigo(u: ReturnType<typeof userEvent.setup>, email: string) {
  await u.type(await screen.findByRole('textbox', { name: 'E-mail' }), email)
  await u.click(screen.getByRole('checkbox', { name: /li e aceito os termos/i }))
  await u.click(screen.getByRole('button', { name: 'Receber código' }))
  await u.type(await screen.findByRole('textbox', { name: /código de 6 dígitos/i }), '123456')
  await u.click(screen.getByRole('button', { name: 'Entrar' }))
}

const home = () => screen.findByRole('heading', { name: /do que você precisa agora/i })

describe('entrar e acesso', () => {
  it('sem sessão vai para Entrar; código liberado leva direto à ajuda, com aceite registrado', async () => {
    const srv = new ServidorFalso()
    srv.conta('mae@teste.dev', 'ativo')
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico)
    expect(await screen.findByRole('heading', { name: 'Entrar no Acalma' })).toBeInTheDocument()
    expect(screen.getByText(/não inicia teste nem assinatura da Nina/i)).toBeInTheDocument()
    await entrarPorCodigo(u, 'Mae@Teste.dev')
    expect(await home()).toBeInTheDocument()
    expect(ap.estado.codigosEnviados).toEqual(['mae@teste.dev'])
    expect(ap.estado.aceites).toBe(1)
  })

  it('código errado mostra erro e não entra', async () => {
    const srv = new ServidorFalso()
    srv.conta('a@teste.dev')
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico)
    await u.type(await screen.findByRole('textbox', { name: 'E-mail' }), 'a@teste.dev')
    await u.click(screen.getByRole('checkbox', { name: /li e aceito os termos/i }))
    await u.click(screen.getByRole('button', { name: 'Receber código' }))
    await u.type(await screen.findByRole('textbox', { name: /código/i }), '000000')
    await u.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/código incorreto/i)
  })

  it('compra não localizada: explica e permite entrar com outro e-mail; segurança continua aberta', async () => {
    const srv = new ServidorFalso()
    const ap = aparelho(srv)
    const u = userEvent.setup()
    const { unmount } = abrir(ap.servico)
    await entrarPorCodigo(u, 'sem@compra.dev')
    expect(await screen.findByRole('heading', { name: /não encontramos uma compra/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /alguém pode se machucar/i })).toHaveAttribute('href', '/seguranca')
    await u.click(screen.getByRole('button', { name: 'Entrar com outro e-mail' }))
    expect(await screen.findByRole('heading', { name: 'Entrar no Acalma' })).toBeInTheDocument()
    unmount()
    abrir(ap.servico, '/seguranca')
    expect(await screen.findByRole('heading', { name: /ajuda além do acalma/i })).toBeInTheDocument()
  })

  it('compra em processamento: verificar de novo libera quando a compra é confirmada', async () => {
    const srv = new ServidorFalso()
    srv.conta('pix@teste.dev', 'pendente')
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico)
    await entrarPorCodigo(u, 'pix@teste.dev')
    expect(await screen.findByRole('heading', { name: /em processamento/i })).toBeInTheDocument()
    srv.contas.get('pix@teste.dev')!.acesso = 'ativo'
    await u.click(screen.getByRole('button', { name: 'Verificar de novo' }))
    expect(await home()).toBeInTheDocument()
  })

  it('reembolso: ao reabrir com rede, o acesso é encerrado mesmo com confirmação guardada', async () => {
    const srv = new ServidorFalso()
    const uid = srv.conta('re@teste.dev', 'revogado')
    const ap = aparelho(srv)
    ap.entrarComo(srv.contas.get('re@teste.dev')!.sessao)
    guardarAcesso(uid, 'ativo')
    abrir(ap.servico)
    expect(await screen.findByRole('heading', { name: /acesso foi encerrado/i })).toBeInTheDocument()
  })

  it('sem rede: abre pela confirmação recente; fora da janela, pede conexão', async () => {
    const srv = new ServidorFalso()
    const uid = srv.conta('off@teste.dev', 'ativo')
    const ap = aparelho(srv)
    ap.entrarComo(srv.contas.get('off@teste.dev')!.sessao)
    ap.estado.online = false
    guardarAcesso(uid, 'ativo', new Date())
    const um = abrir(ap.servico)
    expect(await home()).toBeInTheDocument()
    um.unmount()
    guardarAcesso(uid, 'ativo', new Date(Date.now() - 40 * 86_400_000))
    abrir(ap.servico)
    expect(await screen.findByRole('heading', { name: /conecte-se uma vez/i })).toBeInTheDocument()
  })
})

describe('dados por conta', () => {
  it('dados da demonstração não vão para a conta real', async () => {
    localStorage.setItem(CHAVE, JSON.stringify({ versao: 2, favoritos: [{ situacaoId: 'ouvir-nao', caminhoId: null, salvoEm: '2026-10-01T00:00:00Z' }], registros: [], combinados: [] }))
    const srv = new ServidorFalso()
    srv.conta('nova@teste.dev')
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico)
    await entrarPorCodigo(u, 'nova@teste.dev')
    await home()
    expect(screen.queryByText(/já salvo por você/i)).not.toBeInTheDocument()
    expect(localStorage.getItem(CHAVE)).not.toBeNull() // a demonstração fica como estava
  })

  it('combinado criado sincroniza; troca de conta não mistura; sair apagando limpa o aparelho', async () => {
    const srv = new ServidorFalso()
    const a = srv.conta('a@teste.dev')
    srv.conta('b@teste.dev')
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico, '/preparar/novo?modelo=sair-de-casa')
    await entrarPorCodigo(u, 'a@teste.dev')
    await home()
    // cria um combinado como A
    await act(async () => {
      const { salvarCombinado } = await import('../armazenamento/armazenamento')
      salvarCombinado({ id: 'c-da-conta-a', nome: 'Escola', modeloId: 'sair-de-casa', passos: ['calcar', 'sair'] })
    })
    await waitFor(() => expect([...srv.combinados.values()].map((c) => c.nome)).toEqual(['Escola']), { timeout: 4000 })
    expect(JSON.parse(localStorage.getItem(prefixoConta + a)!).combinados).toHaveLength(1)

    // sai sem apagar e entra como B: não vê o combinado de A
    await u.click(screen.getByRole('link', { name: /conta e configurações/i }))
    await u.click(screen.getByRole('button', { name: 'Sair deste aparelho' }))
    await u.click(within(screen.getByRole('dialog')).getByRole('checkbox'))
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sair' }))
    await entrarPorCodigo(u, 'b@teste.dev')
    await home()
    expect(screen.queryByText('Escola')).not.toBeInTheDocument()

    // B sai apagando; A entra de novo e vê o seu combinado (aparelho + servidor)
    await u.click(screen.getByRole('link', { name: /conta e configurações/i }))
    await u.click(screen.getByRole('button', { name: 'Sair deste aparelho' }))
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sair e apagar deste aparelho' }))
    expect(localStorage.getItem(prefixoConta + 'u-b@teste.dev')).toBeNull()
    await entrarPorCodigo(u, 'a@teste.dev')
    expect(await screen.findByText('Escola')).toBeInTheDocument()
  })

  it('importa registros do app anterior só quando a pessoa pede, sem tocar nas chaves antigas', async () => {
    const antigo = JSON.stringify([{ data: '2026-06-01T10:00:00.000Z', emocaoId: 'raiva', acoes: ['nomear'], antes: 'fome', reacao: '', terminou: 'dormiu' }])
    localStorage.setItem('acalma_diario_2026-06-01', antigo)
    const srv = new ServidorFalso()
    srv.conta('leg@teste.dev')
    const ap = aparelho(srv)
    const u = userEvent.setup()
    abrir(ap.servico, '/conta')
    await entrarPorCodigo(u, 'leg@teste.dev')
    await home()
    await u.click(screen.getByRole('link', { name: /conta e configurações/i }))
    expect(await screen.findByText(/encontramos 1 registro/i)).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Importar registros anteriores' }))
    expect(screen.queryByText(/encontramos 1 registro/i)).not.toBeInTheDocument()
    expect(localStorage.getItem('acalma_diario_2026-06-01')).toBe(antigo)
    await waitFor(() => expect([...srv.registros.values()][0]).toMatchObject({ origem: 'app-anterior', situacao_id: null }), { timeout: 4000 })
  })
})

describe('legado', () => {
  it('lê sem alterar, com id estável e emoção preservada como veio', () => {
    localStorage.setItem('acalma_diario_2026-06-02', JSON.stringify([{ data: '2026-06-02T09:00:00.000Z', emocaoId: 'medo', antes: 'escuro' }]))
    localStorage.setItem('acalma_diario_lixo', '{não é json')
    const a = lerRegistrosAnteriores()
    const b = lerRegistrosAnteriores()
    expect(a).toHaveLength(1)
    expect(a[0].id).toBe(b[0].id)
    expect(a[0]).toMatchObject({ situacaoId: null, resposta: null, origem: 'app-anterior', anotacao: 'Antes: escuro', legado: { emocaoId: 'medo' } })
  })
})

describe('cliente Supabase', () => {
  it('pede código com cadastro marcado como Acalma e sessão própria do app', async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    const createClient = vi.fn(() => ({ auth: { signInWithOtp } }))
    vi.doMock('@supabase/supabase-js', () => ({ createClient }))
    vi.resetModules()
    const { servicoSupabase } = await import('../conta/servico')
    await servicoSupabase.enviarCodigo('mae@teste.dev')
    expect(signInWithOtp).toHaveBeenCalledWith({ email: 'mae@teste.dev', options: { shouldCreateUser: true, data: { produto_entrada: 'acalma' } } })
    const opcoes = (createClient.mock.calls[0] as unknown[])[2] as { auth: { storageKey: string; detectSessionInUrl: boolean } }
    expect(opcoes.auth).toMatchObject({ storageKey: 'acalma.auth', detectSessionInUrl: false })
    vi.doUnmock('@supabase/supabase-js')
    usarEspacoDemonstracao()
  })
})
