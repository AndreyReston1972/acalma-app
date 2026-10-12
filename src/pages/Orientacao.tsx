import { useId, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { useAviso } from '../components/Aviso'
import { botaoIcone, botaoSecundario, margem } from '../components/ui'
import { IconeAbaixo, IconeAvancar, IconeEscudo, IconeMarcador } from '../ilustracoes/icones'
import { Ilustracao } from '../ilustracoes/Ilustracao'
import { buscarSituacao } from '../content/situacoes'
import { buscarSequencia } from '../content/sequencias'
import { alternarFavorito } from '../armazenamento/armazenamento'
import { useEstado } from '../armazenamento/useEstado'

export function Orientacao() {
  const { situacaoId } = useParams()
  const situacao = buscarSituacao(situacaoId)
  const { favoritos } = useEstado()
  const avisar = useAviso()
  const [aberto, setAberto] = useState(false)
  const idExtra = useId()

  if (!situacao) return <Navigate to="/agora" replace />

  const salvo = favoritos.some((f) => f.situacaoId === situacao.id)
  const sequencia = buscarSequencia(situacao.prepararDaProximaVez)

  return (
    <div className="entrada flex min-h-dvh flex-col">
      <BarraTopo
        voltarPara="/agora"
        rotuloVoltar="Trocar a situação"
        fecharPara="/"
        rotuloFechar="Sair da orientação"
        acoes={
          <button
            type="button"
            className={`${botaoIcone} ${salvo ? 'text-coral' : ''}`}
            aria-pressed={salvo}
            aria-label={salvo ? 'Remover dos salvos' : 'Salvar orientação'}
            onClick={() => avisar(alternarFavorito(situacao.id) ? 'Salva em Salvos' : 'Removida dos salvos')}
          >
            <IconeMarcador preenchido={salvo} />
          </button>
        }
      />

      <main className={`${margem} flex-1 pb-[calc(env(safe-area-inset-bottom)+2rem)]`}>
        <div className="flex items-center gap-3">
          <Ilustracao id={situacao.ilustracao} tamanho={40} />
          <h1 className="font-display text-[1.625rem] font-semibold leading-tight tracking-[-0.01em] text-verde-profundo">
            {situacao.titulo}
          </h1>
        </div>

        <section aria-labelledby="o-agora" className="mt-6">
          <h2 id="o-agora" className="rotulo">Agora</h2>
          <p className="mt-1.5 text-[1.1875rem] font-medium leading-snug text-texto">{situacao.agora}</p>
        </section>

        <section
          aria-labelledby="o-frase"
          className="relative mt-5 rounded-[var(--radius-cartao)] bg-bege px-5 pb-5 pt-4"
        >
          <h2 id="o-frase" className="rotulo">Você pode dizer</h2>
          <span aria-hidden="true" className="absolute right-4 top-1 font-display text-[3.5rem] leading-none text-coral">
            “
          </span>
          <p className="mt-2 text-[1.375rem] font-medium leading-[1.35] tracking-[-0.005em] text-verde-profundo">
            {situacao.frase}
          </p>
        </section>

        <section aria-labelledby="o-depois" className="mt-5">
          <h2 id="o-depois" className="rotulo">Depois</h2>
          <p className="mt-1.5 text-[1.0625rem] leading-relaxed text-texto">{situacao.depois}</p>
        </section>

        <div className="mt-6 border-y border-linha">
          <button
            type="button"
            aria-expanded={aberto}
            aria-controls={idExtra}
            onClick={() => setAberto((a) => !a)}
            className="tocavel flex min-h-14 w-full items-center justify-between gap-3 text-left text-[1.0625rem] font-semibold text-verde-profundo"
          >
            Se continuar difícil
            <span className={`transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}>
              <IconeAbaixo />
            </span>
          </button>
          <div id={idExtra} hidden={!aberto}>
            <ul className="space-y-3 pb-5">
              {situacao.seContinuarDificil.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-texto">
                  <span aria-hidden="true" className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-verde" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {sequencia && (
              <Link
                to={`/preparar/${sequencia.id}`}
                className="tocavel mb-5 flex min-h-14 items-center gap-3 rounded-[var(--radius-controle)] bg-verde-claro px-4 hover:bg-bege active:bg-bege"
              >
                <span className="flex-1 text-[0.9375rem] text-texto">
                  Para a próxima vez: <strong className="font-semibold text-verde-profundo">{sequencia.titulo}</strong>
                </span>
                <span className="text-texto-2"><IconeAvancar /></span>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Link to={`/agora/${situacao.id}/registrar`} className={botaoSecundario}>
            Depois, quero registrar
          </Link>
          <Link
            to="/seguranca"
            className="tocavel inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-controle)] text-[0.9375rem] font-semibold text-coral-texto"
          >
            <IconeEscudo />
            Alguém pode se machucar?
          </Link>
        </div>
      </main>
    </div>
  )
}
