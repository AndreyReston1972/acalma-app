import { useEffect } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { botaoPrimario, botaoSecundario, margem } from '../components/ui'
import { Ilustracao } from '../ilustracoes/Ilustracao'
import { buscarSequencia } from '../content/sequencias'

/*
 * Modo visual: um passo por vez, para mostrar à criança.
 * O passo fica na URL (?passo=2), então voltar e recarregar não perdem a sequência.
 * O passo atual é indicado por texto ("Passo 2 de 3") e por forma, não só por cor.
 */
export function Sequencia() {
  const { sequenciaId } = useParams()
  const sequencia = buscarSequencia(sequenciaId)
  const [busca, setBusca] = useSearchParams()
  const navegar = useNavigate()

  const total = sequencia?.passos.length ?? 0
  const bruto = Number(busca.get('passo') ?? '1')
  const indice = Number.isInteger(bruto) && bruto >= 1 && bruto <= total ? bruto - 1 : 0

  const irPara = (i: number) => setBusca({ passo: String(i + 1) }, { replace: true })

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && indice < total - 1) setBusca({ passo: String(indice + 2) }, { replace: true })
      if (e.key === 'ArrowLeft' && indice > 0) setBusca({ passo: String(indice) }, { replace: true })
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [indice, total, setBusca])

  if (!sequencia) return <Navigate to="/preparar" replace />

  const passo = sequencia.passos[indice]
  const ultimo = indice === total - 1

  return (
    <div className="flex min-h-dvh flex-col bg-creme">
      <BarraTopo fecharPara="/preparar" rotuloFechar="Fechar e voltar às sequências" titulo={sequencia.titulo} />

      <main className={`${margem} flex flex-1 flex-col`}>
        <ol className="flex gap-2" aria-label="Passos da sequência">
          {sequencia.passos.map((p, i) => {
            const atual = i === indice
            return (
              <li key={p.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => irPara(i)}
                  aria-current={atual ? 'step' : undefined}
                  aria-label={`Passo ${i + 1}: ${p.rotulo}`}
                  className={`tocavel flex min-h-12 w-full flex-col items-start justify-end gap-1.5 rounded-lg pb-1 text-left text-[0.8125rem] ${
                    atual ? 'font-bold text-verde-profundo' : 'font-medium text-texto-2'
                  }`}
                >
                  <span>{i + 1}</span>
                  <span
                    aria-hidden="true"
                    className={`block w-full rounded-full ${atual ? 'h-1.5 bg-verde' : i < indice ? 'h-1 bg-verde/45' : 'h-1 bg-linha'}`}
                  />
                </button>
              </li>
            )
          })}
        </ol>

        <div key={passo.id} className="entrada flex flex-1 flex-col items-center justify-center py-6 text-center">
          <p className="rotulo" aria-live="polite">
            Passo {indice + 1} de {total}
          </p>
          <div className="mt-5 grid aspect-square w-[min(68vw,17rem)] place-items-center rounded-full bg-bege">
            <Ilustracao id={passo.ilustracao} tamanho={180} className="h-[72%] w-[72%]" />
          </div>
          <h1 className="mt-7 font-display text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.015em] text-verde-profundo">
            {passo.rotulo}
          </h1>
          <p className="mt-2 text-texto-2">
            {ultimo ? (
              'Último passo'
            ) : (
              <>
                Depois: <span className="font-semibold text-texto">{sequencia.passos[indice + 1].rotulo}</span>
              </>
            )}
          </p>
        </div>
      </main>

      <div className={`grid grid-cols-[1fr_1.4fr] gap-3 ${margem} pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2`}>
        <button
          type="button"
          className={botaoSecundario}
          onClick={() => (indice > 0 ? irPara(indice - 1) : navegar('/preparar'))}
        >
          {indice > 0 ? 'Voltar' : 'Sequências'}
        </button>
        <button
          type="button"
          className={botaoPrimario}
          onClick={() => (ultimo ? navegar('/preparar') : irPara(indice + 1))}
        >
          {ultimo ? 'Terminar' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}
