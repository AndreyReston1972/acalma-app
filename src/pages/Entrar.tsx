import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Marca } from '../components/Marca'
import { useAviso } from '../components/Aviso'
import { botaoPrimario, botaoTexto, margem } from '../components/ui'
import { Cena } from '../ilustracoes/Cena'
import { useConta } from '../conta/Conta'
import { ErroDeRede } from '../conta/servico'

/*
 * Entrada: e-mail → código de 6 dígitos. Sem senha, sem cadastro extenso, sem
 * dados da criança, sem aceite de marketing. Mesma conta da Nina, se a pessoa já tiver.
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

  useEffect(() => {
    if (reenviarEm <= 0) return
    const t = window.setTimeout(() => setReenviarEm((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [reenviarEm])

  if (conta.modo === 'demonstracao' && !simulacao) return <Navigate to="/" replace />
  // Simulação (preview): nada é enviado; o código de exemplo é qualquer sequência de 6 dígitos.
  const espera = () => new Promise((r) => setTimeout(r, 500))

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

  async function enviar() {
    if (!emailValido || enviando) return
    setEnviando(true)
    setErro('')
    try {
      if (simulacao) await espera()
      else await conta.enviarCodigo(email)
      setEtapa('codigo')
      setReenviarEm(60)
    } catch (e) {
      setErro(e instanceof ErroDeRede ? 'Sem conexão. Confira a internet e tente de novo.' : 'Não foi possível enviar o código agora. Tente de novo em instantes.')
    } finally {
      setEnviando(false)
    }
  }

  async function confirmar() {
    if (codigo.length !== 6 || enviando) return
    setEnviando(true)
    setErro('')
    try {
      if (simulacao) {
        await espera()
        navegar('/demonstracao/acesso', { replace: true })
        return
      }
      const d = await conta.confirmarCodigo(email, codigo)
      if (d.tipo === 'liberado') avisar('Acesso liberado', '/')
      navegar('/', { replace: true })
    } catch (e) {
      setErro(e instanceof ErroDeRede ? 'Sem conexão. Confira a internet e tente de novo.' : 'Código incorreto ou vencido. Confira o e-mail mais recente.')
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
            <p className="mt-2 text-texto-2">Use o e-mail da sua compra. Enviamos um código de 6 dígitos, sem senha.</p>
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
            <button type="submit" disabled={!emailValido || enviando} className={`${botaoPrimario} mt-6`}>
              {enviando ? 'Enviando…' : 'Receber código'}
            </button>
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-texto-2">
              Ao continuar, você concorda com os <Link className="underline" to="/termos">termos de uso</Link> e a{' '}
              <Link className="underline" to="/privacidade">política de privacidade</Link> do Acalma.
            </p>
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
              Código de 6 dígitos
            </label>
            <input
              id="codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              enterKeyHint="go"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              aria-describedby={erro ? 'erro-codigo' : undefined}
              className="mt-2 block min-h-14 w-full rounded-[var(--radius-controle)] border border-linha bg-white px-4 text-center font-semibold tracking-[0.4em] text-[1.5rem] text-texto focus:border-verde focus:outline-none focus-visible:outline-3 focus-visible:outline-coral"
            />
            {erro && (
              <p id="erro-codigo" role="alert" className="mt-3 font-semibold text-coral-texto">
                {erro}
              </p>
            )}
            <button type="submit" disabled={codigo.length !== 6 || enviando} className={`${botaoPrimario} mt-6`}>
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
