import { Link } from 'react-router-dom'
import { Marca } from '../components/Marca'
import { Miniatura } from '../components/Miniatura'
import { botaoIcone, margem } from '../components/ui'
import { IconeAvancar, IconeConta, IconeSeta } from '../ilustracoes/icones'
import { Cena } from '../ilustracoes/Cena'
import { useEstado } from '../armazenamento/useEstado'
import { buscarCaminho, buscarSituacao } from '../content/situacoes'
import { buscarAcao, buscarModelo } from '../content/combinados'
import { nomeDoCombinado } from '../util/combinados'

/*
 * Hierarquia da Home:
 * 1. ajuda imediata (ação dominante, verde);
 * 2. montar um combinado (segunda utilidade, visível na primeira tela);
 * 3. atalho para o que a pessoa já salvou (só se existir).
 */
export function Inicio() {
  const { combinados, favoritos } = useEstado()
  const ultimo = [...combinados].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))[0]
  const fav = favoritos[0]
  const favSituacao = fav ? buscarSituacao(fav.situacaoId) : undefined
  const favCaminho = buscarCaminho(favSituacao, fav?.caminhoId)
  const modeloSair = buscarModelo('sair-de-casa')!

  return (
    <div className="entrada">
      <header className={`flex items-center justify-between pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-1 ${margem}`}>
        <Marca />
        <Link to="/conta" className={`${botaoIcone} -mr-3`} aria-label="Conta e configurações">
          <IconeConta />
        </Link>
      </header>

      <main className={`${margem} pb-6 pt-6`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.12] tracking-[-0.015em] text-verde-profundo">
          Do que você precisa agora?
        </h1>

        {/* 1. Ajuda imediata */}
        <Link
          to="/agora"
          className="tocavel relative mt-6 flex min-h-[11.5rem] overflow-hidden rounded-[24px] bg-verde text-white shadow-[var(--shadow-acao)] hover:bg-verde-profundo active:bg-verde-profundo"
        >
          <span className="relative z-10 flex flex-1 flex-col justify-between py-5 pl-5 pr-2">
            <span>
              <span className="block text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.01em]">Ajuda na hora da birra</span>
              <span className="mt-2 block text-[0.9375rem] leading-snug text-white/90">Uma orientação, uma frase e um próximo passo.</span>
            </span>
            <span aria-hidden="true" className="mt-4 grid size-11 place-items-center rounded-full bg-white text-verde-profundo">
              <IconeSeta />
            </span>
          </span>
          <span aria-hidden="true" className="relative w-[42%] max-w-[10.5rem] shrink-0">
            <span className="absolute inset-y-4 right-0 left-1 rounded-l-[999px] bg-[#477764]" />
            <Cena id="ajuda" className="absolute bottom-3 right-1 h-auto w-[118%] max-w-none" />
          </span>
        </Link>

        {/* 2. Montar um combinado */}
        <Link
          to="/preparar"
          className="tocavel mt-3 block rounded-[24px] border border-linha bg-bege px-5 pb-4 pt-4 hover:border-verde/50 active:bg-bege-forte"
        >
          <span className="flex items-start justify-between gap-3">
            <span>
              <span className="block text-[1.1875rem] font-semibold leading-tight text-verde-profundo">Montar nosso combinado</span>
              <span className="mt-1 block text-[0.9375rem] text-texto-2">Mostre à criança o que vem depois.</span>
            </span>
            <span className="mt-0.5 text-texto-2"><IconeAvancar /></span>
          </span>
          <span aria-hidden="true" className="mt-3.5 flex items-center gap-2">
            {modeloSair.passos.map((p, i) => (
              <span key={p} className="flex items-center gap-2">
                {i > 0 && <span className="h-0.5 w-3 rounded-full bg-texto-2/40" />}
                <Miniatura id={buscarAcao(p)!.cena} className="border border-linha bg-creme" />
              </span>
            ))}
          </span>
        </Link>

        {/* 3. O que já está salvo (só se houver) */}
        {(ultimo || favSituacao) && (
          <section aria-labelledby="home-salvos" className="mt-7">
            <h2 id="home-salvos" className="rotulo">Já salvo por você</h2>
            {ultimo ? (
              <div className="mt-2 flex items-center gap-3 border-y border-linha py-2">
                <Miniatura id={buscarAcao(ultimo.passos[0])!.cena} tamanho="p" />
                <Link to={`/preparar/${ultimo.id}`} className="tocavel min-h-12 min-w-0 flex-1 rounded-[var(--radius-controle)] py-1.5">
                  <span className="block truncate font-semibold text-texto">{nomeDoCombinado(ultimo)}</span>
                  <span className="block text-[0.8125rem] text-texto-2">{ultimo.passos.length} passos</span>
                </Link>
                <Link
                  to={`/preparar/${ultimo.id}/mostrar`}
                  aria-label={`Mostrar ${nomeDoCombinado(ultimo)}`}
                  className="tocavel inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-full bg-verde px-4 font-semibold text-white hover:bg-verde-profundo"
                >
                  Mostrar
                </Link>
              </div>
            ) : (
              favSituacao && (
                <Link
                  to={`/agora/${favSituacao.id}${favCaminho ? `/${favCaminho.id}` : ''}`}
                  className="tocavel mt-2 flex min-h-14 items-center gap-3 border-y border-linha py-2 hover:bg-bege"
                >
                  <Miniatura id={favSituacao.cena} tamanho="p" />
                  <span className="min-w-0 flex-1 truncate font-semibold text-texto">
                    {favSituacao.titulo}
                    {favCaminho && <span className="font-medium text-texto-2"> · {favCaminho.rotulo}</span>}
                  </span>
                  <span className="text-texto-2"><IconeAvancar /></span>
                </Link>
              )
            )}
          </section>
        )}
      </main>
    </div>
  )
}
