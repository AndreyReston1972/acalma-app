import type { SupabaseClient } from '@supabase/supabase-js'
import { CONFIG, VERSAO_MARKETING, VERSAO_PRIVACIDADE, VERSAO_TERMOS } from '../config'
import type { RespostaServidorSinc } from '../armazenamento/sincronizacao'

/*
 * Tudo o que o Acalma pede à conta NexoEdu (Supabase da Nina).
 *
 * Autenticação: código de 6 dígitos por e-mail (signInWithOtp + verifyOtp).
 *   • Mesma infraestrutura da Nina: nenhuma senha nova, nenhum outro sistema de login.
 *   • Funciona no navegador interno do Instagram e entre aparelhos (o link mágico
 *     abre em outro navegador e perde a sessão).
 *   • Prova que a pessoa controla o e-mail (amr "otp"): é isso que permite vincular
 *     uma compra com segurança, já que a confirmação de e-mail da Nina está desligada.
 *   • O cadastro novo leva produto_entrada = "acalma": não inicia trial, e-mails ou
 *     métricas da Nina (migration 20261012100000).
 * Sessão própria do Acalma (storageKey separado): não presumimos sessão compartilhada
 * entre subdomínios.
 */
export type EstadoServidor = 'ativo' | 'pendente' | 'nao_vinculada' | 'confirme_o_email' | 'revogado' | 'nenhum' | 'sem_sessao'

export interface Sessao {
  userId: string
  email: string
}

export interface ServicoConta {
  sessaoLocal(): Promise<Sessao | null>
  enviarCodigo(email: string): Promise<void>
  confirmarCodigo(email: string, codigo: string): Promise<Sessao>
  sair(): Promise<void>
  vincularCompras(): Promise<void>
  meuAcesso(): Promise<EstadoServidor>
  sincronizar(mudancas: unknown, desde: string | null): Promise<RespostaServidorSinc>
  /** Aceite explícito de termos e privacidade (versão + data no servidor). */
  registrarAceites(): Promise<void>
  /** Consentimento opcional de marketing por e-mail; false revoga. */
  definirMarketing(aceita: boolean): Promise<void>
  /** Última decisão de marketing registrada (null = nunca decidiu). */
  marketingAtual(): Promise<boolean | null>
  /** Cópia dos próprios dados na conta. Não exige compra. */
  exportarMeusDados(): Promise<unknown>
  excluirMeusDados(): Promise<void>
}

export class ErroDeRede extends Error {}
/** O Supabase Auth limita pedidos de código por e-mail/tempo. */
export class ErroLimiteDeEnvio extends Error {}

let clientePromessa: Promise<SupabaseClient> | null = null
function cliente(): Promise<SupabaseClient> {
  clientePromessa ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'acalma.auth' },
    }),
  )
  return clientePromessa
}

const ehErroDeRede = (e: unknown) =>
  e instanceof TypeError || /fetch|network|Failed to fetch|NetworkError/i.test(String((e as Error)?.message ?? e))

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const c = await cliente()
  try {
    const { data, error } = await c.rpc(fn, args)
    if (error) {
      if (ehErroDeRede(error)) throw new ErroDeRede(error.message)
      throw new Error(error.message)
    }
    return data as T
  } catch (e) {
    if (e instanceof ErroDeRede || ehErroDeRede(e)) throw new ErroDeRede(String((e as Error).message))
    throw e
  }
}

export const servicoSupabase: ServicoConta = {
  async sessaoLocal() {
    // getSession lê a sessão guardada no aparelho; funciona sem rede.
    const { data } = await (await cliente()).auth.getSession()
    const u = data.session?.user
    return u ? { userId: u.id, email: u.email ?? '' } : null
  },
  async enviarCodigo(email) {
    const { error } = await (await cliente()).auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, data: { produto_entrada: 'acalma' } },
    })
    if (error) {
      if (ehErroDeRede(error)) throw new ErroDeRede(error.message)
      if ((error as { status?: number }).status === 429 || /rate limit|security purposes|seconds/i.test(error.message)) throw new ErroLimiteDeEnvio(error.message)
      throw error
    }
  },
  async confirmarCodigo(email, codigo) {
    // Código errado, vencido ou já usado: o GoTrue responde o mesmo erro ("Token has
    // expired or is invalid"); a tela pede o e-mail mais recente.
    const { data, error } = await (await cliente()).auth.verifyOtp({ email, token: codigo, type: 'email' })
    if (error && ehErroDeRede(error)) throw new ErroDeRede(error.message)
    if (error || !data.user) throw error ?? new Error('Código inválido')
    return { userId: data.user.id, email: data.user.email ?? email }
  },
  async sair() {
    await (await cliente()).auth.signOut({ scope: 'local' })
  },
  async vincularCompras() {
    await rpc('acalma_vincular_compras')
  },
  async meuAcesso() {
    const r = await rpc<{ estado: EstadoServidor }>('acalma_meu_acesso')
    return r.estado
  },
  async sincronizar(mudancas, desde) {
    return rpc<RespostaServidorSinc>('acalma_sincronizar', { p_mudancas: mudancas, p_desde: desde })
  },
  async registrarAceites() {
    await rpc('acalma_registrar_aceite', { p_documento: 'termos', p_versao: VERSAO_TERMOS })
    await rpc('acalma_registrar_aceite', { p_documento: 'privacidade', p_versao: VERSAO_PRIVACIDADE })
  },
  async definirMarketing(aceita) {
    await rpc('acalma_definir_marketing', { p_aceita: aceita, p_versao: VERSAO_MARKETING })
  },
  async marketingAtual() {
    const { data, error } = await (await cliente())
      .from('acalma_aceites')
      .select('aceito')
      .eq('documento', 'marketing_email')
      .order('aceito_em', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
    if (error) throw ehErroDeRede(error) ? new ErroDeRede(error.message) : new Error(error.message)
    return data && data.length ? Boolean(data[0].aceito) : null
  },
  async exportarMeusDados() {
    return rpc('acalma_exportar_meus_dados')
  },
  async excluirMeusDados() {
    await rpc('acalma_excluir_meus_dados')
  },
}
