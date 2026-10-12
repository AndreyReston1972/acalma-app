import { Link } from 'react-router-dom'
import { Marca } from '../components/Marca'
import { Faixa, Miniatura } from '../components/Miniatura'
import { botaoIcone, margem } from '../components/ui'
import { IconeAvancar, IconeConta, IconeSeta } from '../ilustracoes/icones'
import { Cena } from '../ilustracoes/Cena'
import { useEstado } from '../armazenamento/useEstado'
import { buscarCaminho, buscarSituacao } from '../content/situacoes'
import { buscarAcao, buscarModelo } from '../content/combinados'
import { nomeDoCombinado } from '../util/combinados'

export function Inicio() {
  const { combinados, favoritos } = useEstado()
  const ultimo = [...combinados].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))[0]
  const fav = favoritos[0]
  const favSituacao = fav ? buscarSituacao(fav.situacaoId) : undefined
  const favCaminho = buscarCaminho(favSituacao, fav?.caminhoId)
  const modeloSair = buscarModelo('sair-de-casa')!

  return (
    <div className="entrada flex min-h-[calc(100dvh-env(safe-area-inset-bottom)-4.25rem)] flex-col">
      <header className={`flex items-center justify-between pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-1 ${margem}`}>
        <Marca />
        <Link to="/conta" className={`${botaoIcone} -mr-3`} aria-label="Conta e configurações">
          <IconeConta />
        </Link>
      </header>

      <main className={`${margem} flex flex-1 flex-col pb-5 pt-5`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.12] tracking-[-0.015em] text-verde-profundo">
          Do que você precisa agora?
        </h1>

        {/* Ação dominante: ocupa o espaço que sobra, com a cena como protagonista */}
        <Link
          to="/agora"
          className="tocavel relative mt-5 flex min-h-[17rem] flex-1 flex-col overflow-hidden rounded-[24px] bg-verde text-white shadow-[var(--shadow-acao)] hover:bg-verde-profundo active:bg-verde-profundo"
        >
          <span className="relative z-10 block px-6 pt-6">
            <span className="block max-w-[15rem] text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.015em]">
              Ajuda na hora da birra
            </span>
            <span className="mt-2.5 block max-w-[16rem] text-[1rem] leading-snug text-white/90">
              Uma orientação, uma frase e um próximo passo.
            </span>
          </span>
          <span aria-hidden="true" className="relative mt-4 block min-h-36 flex-1">
            <span className="absolute inset-x-5 bottom-0 top-0 rounded-t-[999px] bg-[#477764]" />
            <Cena id="frase" className="absolute bottom-2 left-1/2 h-auto w-[78%] max-w-[17rem] -translate-x-1/2" />
            <span className="absolute bottom-5 right-5 grid size-12 place-items-center rounded-full bg-white text-verde-profundo shadow-[var(--shadow-suave)]">
              <IconeSeta />
            </span>
          </span>
        </Link>

        <Link
          to="/preparar"
          className="tocavel mt-3 flex min-h-[4.75rem] items-center gap-3.5 rounded-[var(--radius-cartao)] bg-bege py-3 pl-3 pr-4 hover:bg-bege-forte active:bg-bege-forte"
        >
          <Faixa compacta cenas={modeloSair.passos.map((p) => buscarAcao(p)!.cena)} />
          <span className="min-w-0 flex-1">
            <span className="block text-[1.0625rem] font-semibold leading-tight text-verde-profundo">Montar um combinado</span>
          </span>
          <span className="text-texto-2"><IconeAvancar /></span>
        </Link>

        {ultimo ? (
          <Link
            to={`/preparar/${ultimo.id}/mostrar`}
            className="tocavel mt-2 flex min-h-14 items-center gap-3 rounded-[var(--radius-controle)] px-1 hover:bg-bege active:bg-bege-forte"
          >
            <Miniatura id={buscarAcao(ultimo.passos[0])!.cena} tamanho="p" />
            <span className="min-w-0 flex-1">
              <span className="block text-[0.8125rem] font-medium text-texto-2">Seu último combinado</span>
              <span className="block truncate font-semibold text-texto">{nomeDoCombinado(ultimo)}</span>
            </span>
            <span className="text-[0.9375rem] font-semibold text-verde-profundo">Mostrar</span>
          </Link>
        ) : (
          favSituacao && (
            <Link
              to={`/agora/${favSituacao.id}${favCaminho ? `/${favCaminho.id}` : ''}`}
              className="tocavel mt-2 flex min-h-14 items-center gap-3 rounded-[var(--radius-controle)] px-1 hover:bg-bege active:bg-bege-forte"
            >
              <Miniatura id={favSituacao.cena} tamanho="p" />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.8125rem] font-medium text-texto-2">Orientação salva</span>
                <span className="block truncate font-semibold text-texto">
                  {favSituacao.titulo}
                  {favCaminho && <span className="font-medium text-texto-2"> · {favCaminho.rotulo}</span>}
                </span>
              </span>
              <span className="text-texto-2"><IconeAvancar /></span>
            </Link>
          )
        )}
      </main>
    </div>
  )
}
