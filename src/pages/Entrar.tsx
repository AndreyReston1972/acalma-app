import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Marca } from '../components/Marca'
import { useAviso } from '../components/Aviso'
import { botaoPrimario, botaoTexto, margem } from '../components/ui'
import { Cena } from '../ilustracoes/Cena'
import { useConta } from '../conta/Conta'
import { ErroDeRede, ErroLimiteDeEnvio } from '../conta/servico'
import { temDadosAnteriores } from '../armazenamento/legado'
import { JANELA_OFFLINE_DIAS } from '../config'

/** Tamanho do código do Supabase Auth (MAILER_OTP_LENGTH): hoje 8; o padrão antigo era 6. */
const CODIGO_MIN = 6
const CODIGO_MAX = 8

/*
 * Entrada: e-mail → código numérico (6 a 8 dígitos, conforme a configuração do Supabase Auth). Sem senha, sem cadastro extenso, sem dados da
 * criança. Mesma conta da Nina, se a pessoa já tiver.
 *   • Aceite dos termos e da privacidade: AÇÃO EXPLÍCITA (caixa), registrado com versão e data.
 *   • Novidades por e-mail: caixa separada e opcional; não é condição para nada.
 *   • Quem tem dados do app anterior neste navegador vê o aviso de transição e pode
 *     baixá-los sem comprar (/registros-anteriores).
 */
export function Entrar({ simulacao = false }: { simulacao?: boolean }) {
  const conta = useConta()
  const navegar = useNavigate()
  const avisar = useAviso()
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [reenviarEm, setReenviarEm] = useState(0)
  const [aceite, setAceite] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [anteriores] = useState(temDadosAnteriores)

  useEffect(() => {
    if (reenviarEm <= 0) return
    const t = window.setTimeout(() => setReenviarEm((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [reenviarEm])

  if (conta.modo === 'demonstracao' && !simulacao) return <Navigate to="/" replace />
  // Simulação (preview): nada é enviado; o código de exemplo é qualquer sequência de 6 a 8 dígitos.
  const codigoCompleto = codigo.length >= CODIGO_MIN && codigo.length <= CODIGO_MAX
  const espera = () => new Promise((r) => setTimeout(r, 500))

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

  async function enviar() {
    if (!emailValido || !aceite || enviando) return
    setEnviando(true)
    setErro('')
    try {
      if (simulacao) await espera()
      else await conta.enviarCodigo(email)
      setEtapa('codigo')
      setReenviarEm(60)
    } catch (e) {
      setErro(
        e instanceof ErroDeRede
          ? 'Sem conexão. Confira a internet e tente de novo.'
          : e instanceof ErroLimiteDeEnvio
            ? 'Muitos pedidos de código seguidos. Aguarde um minuto e tente de novo.'
            : 'Não foi possível enviar o código agora. Tente de novo em instantes.',
      )
    } finally {
      setEnviando(false)
    }
  }

  async function confirmar() {
    if (!codigoCompleto || enviando) return
    setEnviando(true)
    setErro('')
    try {
      if (simulacao) {
        await espera()
        navegar('/demonstracao/acesso', { replace: true })
        return
      }
      const d = await conta.confirmarCodigo(email, codigo, { marketing })
      if (d.tipo === 'liberado') avisar('Acesso liberado', '/')
      navegar('/', { replace: true })
    } catch (e) {
      // Errado, vencido ou já usado: o servidor não distingue; o caminho é o mesmo.
      setErro(
        e instanceof ErroDeRede
          ? 'Sem conexão. Confira a internet e tente de novo.'
          : 'Código incorreto, vencido ou já usado. Confira o e-mail mais recente ou peça um novo código.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="entrada flex min-h-dvh flex-col">
      {simulacao && (
        <p className="bg-verde-profundo px-6 py-2 text-center text-[0.8125rem] font-semibold text-white">
          Simulação: nenhum e-mail é enviado
        </p>
      )}
      <header className={`pt-[calc(env(safe-area-inset-top)+1rem)] ${margem}`}>
        <Marca />
      </header>
      <main className={`${margem} flex flex-1 flex-col pb-8 pt-8`}>
        <span aria-hidden="true" className="mb-6 block w-36 overflow-hidden rounded-[22px] bg-bege">
          <Cena id={etapa === 'email' ? 'frase' : 'vazio-registros'} className="block aspect-[4/3] w-full" />
        </span>
        {etapa === 'email' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void enviar()
            }}
          >
            <h1 className="font-display text-[1.875rem] font-semibold leading-[1.12] text-verde-profundo">Entrar no Acalma</h1>
            <p className="mt-2 text-texto-2">Use o e-mail da sua compra. Enviamos um código por e-mail, sem senha.</p>
            {anteriores && (
              <div className="mt-4 rounded-[var(--radius-cartao)] bg-bege p-4 text-[0.9375rem] leading-relaxed text-texto">
                <p className="font-semibold">O Acalma mudou</p>
                <p className="mt-1 text-texto-2">
                  Os registros da versão anterior continuam neste aparelho, sem alteração. Você pode baixá-los sem comprar.
                </p>
                <Link to="/registros-anteriores" className={`${botaoTexto} -ml-4`}>
                  Ver e baixar meus registros antigos
                </Link>
              </div>
            )}
            <label htmlFor="email" className="mt-6 block font-semibold text-texto">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              enterKeyHint="send"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={erro ? 'erro-entrar' : 'ajuda-entrar'}
              className="mt-2 block min-h-12 w-full rounded-[var(--radius-controle)] border border-linha bg-white px-4 text-[1.0625rem] text-texto focus:border-verde focus:outline-none focus-visible:outline-3 focus-visible:outline-coral"
            />
            <p id="ajuda-entrar" className="mt-2 text-[0.875rem] text-texto-2">
              Se você já usa a Nina, é a mesma conta. Entrar pelo Acalma não inicia teste nem assinatura da Nina.
            </p>
            {erro && (
              <p id="erro-entrar" role="alert" className="mt-3 font-semibold text-coral-texto">
                {erro}
              </p>
            )}
            <p className="mt-4 text-[0.875rem] leading-relaxed text-texto-2">
              Depois de entrar, funciona sem internet. Uma conexão a cada {JANELA_OFFLINE_DIAS} dias confirma o seu acesso.
            </p>
            <label className="mt-4 flex min-h-12 items-start gap-3 text-[0.9375rem] leading-snug text-texto">
              <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-verde" />
              <span>
                Li e aceito os <Link className="underline" to="/termos">termos de uso</Link> e a{' '}
                <Link className="underline" to="/privacidade">política de privacidade</Link> do Acalma.
              </span>
            </label>
            <label className="mt-2 flex min-h-12 items-start gap-3 text-[0.9375rem] leading-snug text-texto-2">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-verde" />
              <span>Quero receber novidades da NexoEdu por e-mail (opcional).</span>
            </label>
            <button type="submit" disabled={!emailValido || !aceite || enviando} className={`${botaoPrimario} mt-5`}>
              {enviando ? 'Enviando…' : 'Receber código'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void confirmar()
            }}
          >
            <h1 className="font-display text-[1.875rem] font-semibold leading-[1.12] text-verde-profundo">Confira seu e-mail</h1>
            <p className="mt-2 text-texto-2">
              Enviamos um código para <strong className="text-texto">{email.trim()}</strong>.
            </p>
            <label htmlFor="codigo" className="mt-6 block font-semibold text-texto">
              Código recebido por e-mail
            </label>
            <input
              id="codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={CODIGO_MAX}
              enterKeyHint="go"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, CODIGO_MAX))}
              aria-describedby={erro ? 'erro-codigo' : undefined}
              className="mt-2 block min-h-14 w-full rounded-[var(--radius-controle)] border border-linha bg-white px-4 text-center font-semibold tracking-[0.4em] text-[1.5rem] text-texto focus:border-verde focus:outline-none focus-visible:outline-3 focus-visible:outline-coral"
            />
            {erro && (
              <p id="erro-codigo" role="alert" className="mt-3 font-semibold text-coral-texto">
                {erro}
              </p>
            )}
            <button type="submit" disabled={!codigoCompleto || enviando} className={`${botaoPrimario} mt-6`}>
              {enviando ? 'Conferindo…' : 'Entrar'}
            </button>
            <div className="mt-3 flex flex-wrap justify-between">
              <button type="button" className={`${botaoTexto} -ml-4`} onClick={() => setEtapa('email')}>
                Trocar e-mail
              </button>
              <button type="button" className={botaoTexto} disabled={reenviarEm > 0} onClick={() => void enviar()}>
                {reenviarEm > 0 ? `Reenviar em ${reenviarEm}s` : 'Reenviar código'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
