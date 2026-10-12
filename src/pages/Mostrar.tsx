import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { Miniatura } from '../components/Miniatura'
import { botaoPrimario, botaoSecundario, botaoTexto, margem } from '../components/ui'
import { Cena } from '../ilustracoes/Cena'
import { buscarAcao, buscarModelo } from '../content/combinados'
import type { AcaoId } from '../content/tipos'
import { useEstado } from '../armazenamento/useEstado'
import { nomeDoCombinado } from '../util/combinados'

/*
 * Modo de mostrar à criança: uma ação por vez, cena protagonista, rótulo
 * concreto, "Depois: ..." e botões grandes. O passo fica na URL (?passo=n,
 * ou ?passo=fim). Nada é registrado: avançar não é evidência de nada.
 */
export function Mostrar() {
  const { combinadoId, modeloId } = useParams()
  const { combinados } = useEstado()
  const [busca, setBusca] = useSearchParams()
  const navegar = useNavigate()

  const combinado = combinados.find((c) => c.id === combinadoId)
  const modelo = modeloId ? buscarModelo(modeloId) : undefined
  const passos: AcaoId[] = combinado?.passos ?? modelo?.passos ?? []
  const titulo = combinado ? nomeDoCombinado(combinado) : (modelo?.titulo ?? '')
  const volta = combinado ? `/preparar/${combinado.id}` : '/preparar'

  const total = passos.length
  const bruto = busca.get('passo')
  const fim = bruto === 'fim'
  const n = Number(bruto ?? '1')
  const indice = !fim && Number.isInteger(n) && n >= 1 && n <= total ? n - 1 : 0

  const ir = (valor: number | 'fim') => setBusca({ passo: String(valor === 'fim' ? 'fim' : valor + 1) }, { replace: true })

  useEffect(() => {
    if (fim) return
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setBusca({ passo: indice < total - 1 ? String(indice + 2) : 'fim' }, { replace: true })
      if (e.key === 'ArrowLeft' && indice > 0) setBusca({ passo: String(indice) }, { replace: true })
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [fim, indice, total, setBusca])

  if (total === 0) return <Navigate to="/preparar" replace />

  if (fim) {
    return (
      <div className="flex min-h-dvh flex-col bg-creme">
        <BarraTopo fecharPara={volta} rotuloFechar="Fechar" titulo={titulo} />
        <main className={`${margem} entrada flex flex-1 flex-col items-center justify-center text-center`}>
          <div aria-hidden="true" className="flex flex-wrap justify-center gap-2">
            {passos.map((p) => (
              <Miniatura key={p} id={buscarAcao(p)!.cena} />
            ))}
          </div>
          <h1 className="mt-8 font-display text-[2.25rem] font-semibold leading-tight text-verde-profundo" aria-live="polite">
            Fim do combinado
          </h1>
          <p className="mt-2 max-w-[28ch] text-texto-2">Estes eram os {total} passos. Dá para mostrar de novo quando precisar.</p>
        </main>
        <div className={`grid gap-2 ${margem} pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2`}>
          <button type="button" className={botaoPrimario} onClick={() => ir(0)}>
            Mostrar de novo
          </button>
          <Link to={volta} className={botaoSecundario}>
            {combinado ? 'Voltar ao combinado' : 'Voltar aos combinados'}
          </Link>
        </div>
      </div>
    )
  }

  const acao = buscarAcao(passos[indice])!
  const proxima = indice < total - 1 ? buscarAcao(passos[indice + 1]) : undefined

  return (
    <div className="flex min-h-dvh flex-col bg-creme">
      <BarraTopo fecharPara={volta} rotuloFechar="Fechar combinado" titulo={titulo} />

      <main className={`${margem} flex flex-1 flex-col`}>
        {/* Progresso: uma barra discreta (decorativa) + um único texto "Passo n de N" */}
        <div aria-hidden="true" className="flex gap-1.5 pt-1">
          {passos.map((p, i) => (
            <span
              key={p}
              className={`h-1.5 flex-1 rounded-full ${i < indice ? 'bg-verde/45' : i === indice ? 'bg-verde' : 'bg-linha'}`}
            />
          ))}
        </div>

        <div key={acao.id} className="entrada flex flex-1 flex-col justify-center py-4">
          <p className="rotulo text-center" aria-live="polite">
            Passo {indice + 1} de {total}
          </p>
          <div className="mx-auto mt-4 w-full max-w-[22rem] overflow-hidden rounded-[28px] bg-bege">
            <Cena id={acao.cena} titulo={acao.rotulo} className="block aspect-[4/3] w-full" />
          </div>
          <h1 className="mt-6 text-center font-display text-[2.125rem] font-semibold leading-[1.1] tracking-[-0.015em] text-verde-profundo">
            {acao.rotulo}
          </h1>
          <p className="mt-2 text-center text-texto-2">
            {proxima ? (
              <>
                Depois: <span className="font-semibold text-texto">{proxima.rotulo}</span>
              </>
            ) : (
              'Último passo'
            )}
          </p>
        </div>
      </main>

      {/* Voltar e Próximo sempre no mesmo lugar; fechar fica separado, em texto */}
      <div className={`${margem} pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2`}>
        <div className="grid grid-cols-[1fr_1.5fr] gap-3">
          <button type="button" className={`${botaoSecundario} disabled:opacity-40`} disabled={indice === 0} onClick={() => ir(indice - 1)}>
            Voltar
          </button>
          <button type="button" className={botaoPrimario} onClick={() => ir(proxima ? indice + 1 : 'fim')}>
            {proxima ? 'Próximo' : 'Terminar'}
          </button>
        </div>
        <button type="button" className={`${botaoTexto} mt-1 w-full text-texto-2`} onClick={() => navegar(volta)}>
          Fechar combinado
        </button>
      </div>
    </div>
  )
}
