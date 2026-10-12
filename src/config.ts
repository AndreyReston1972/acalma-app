import { privacidade, termos } from './content/documentos'

/*
 * Dois modos, decididos no build:
 *
 * - demonstracao: o preview público. Sem login, sem rede, sem acesso comercial;
 *   dados só no navegador. É o padrão sempre que a configuração do modo integrado
 *   não estiver completa.
 * - integrado: conta NexoEdu (Supabase da Nina), acesso do Acalma por compra,
 *   sincronização. Só liga com as TRÊS variáveis abaixo definidas no build.
 *
 * As variáveis antigas VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (ainda definidas
 * no Netlify) apontam para o Supabase ANTIGO do Acalma e são ignoradas de propósito.
 * A chave anon do Supabase é pública por natureza (a proteção é a RLS); nenhum segredo
 * vai para o frontend.
 */
const env = import.meta.env

export const CONFIG = {
  modo:
    env.VITE_ACALMA_MODO === 'integrado' && env.VITE_NEXO_SUPABASE_URL && env.VITE_NEXO_SUPABASE_ANON_KEY
      ? ('integrado' as const)
      : ('demonstracao' as const),
  supabaseUrl: (env.VITE_NEXO_SUPABASE_URL as string | undefined) ?? '',
  supabaseAnonKey: (env.VITE_NEXO_SUPABASE_ANON_KEY as string | undefined) ?? '',
  /** URL do checkout Hotmart do Acalma. Pendente: sem ela, a tela não oferece compra. */
  checkoutUrl: (env.VITE_ACALMA_CHECKOUT_URL as string | undefined) ?? '',
  /** Contato de suporte (e-mail). Pendente. */
  suporteEmail: (env.VITE_ACALMA_SUPORTE_EMAIL as string | undefined) ?? '',
}

export const emDemonstracao = () => CONFIG.modo === 'demonstracao'

/*
 * Janela de uso sem conexão: 30 dias (decidido em 13/10/2026 para a primeira versão),
 * contados da última confirmação de acesso BEM-SUCEDIDA com o servidor. Falha de rede
 * não renova o prazo. Revogação confirmada online encerra o acesso na hora.
 */
export const JANELA_OFFLINE_DIAS = 30

/** Versões dos documentos que a pessoa aceita, com ação explícita, ao entrar. */
export const VERSAO_TERMOS = termos.versao
export const VERSAO_PRIVACIDADE = privacidade.versao
/** Versão do texto do consentimento opcional de marketing por e-mail. */
export const VERSAO_MARKETING = '2026-10-13'

/** Nina (opcional). Sem ela, o convite "Conhecer a Nina" não aparece no modo integrado. */
export const NINA_URL = (env.VITE_NINA_URL as string | undefined) ?? ''
