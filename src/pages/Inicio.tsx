import { Link } from 'react-router-dom'
import { Marca } from '../components/Marca'
import { botaoIcone, margem } from '../components/ui'
import { IconeAvancar, IconeConta, IconeSeta } from '../ilustracoes/icones'
import { Ilustracao } from '../ilustracoes/Ilustracao'
import { useEstado } from '../armazenamento/useEstado'
import { buscarSituacao } from '../content/situacoes'

export function Inicio() {
  const { favoritos } = useEstado()
  const favorito = favoritos.length > 0 ? buscarSituacao(favoritos[0].situacaoId) : undefined

  return (
    <div className="entrada">
      <header className={`flex items-center justify-between pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-2 ${margem}`}>
        <Marca />
        <Link to="/conta" className={`${botaoIcone} -mr-3`} aria-label="Conta e configurações">
          <IconeConta />
        </Link>
      </header>

      <main className={`${margem} pt-7`}>
        <h1 className="font-display text-[2rem] font-semibold leading-[1.12] tracking-[-0.015em] text-verde-profundo">
          Do que você precisa agora?
        </h1>

        <Link
          to="/agora"
          className="tocavel group relative mt-7 flex min-h-48 flex-col justify-between overflow-hidden rounded-[22px] bg-verde p-6 text-white shadow-[var(--shadow-acao)] hover:bg-verde-profundo active:bg-verde-profundo"
        >
          <Ilustracao id="fala" tom="escuro" tamanho={64} className="absolute right-5 top-5" />
          <span className="block pr-20 text-[1.625rem] font-semibold leading-[1.15] tracking-[-0.01em]">
            Ajuda na hora da birra
          </span>
          <span className="mt-6 flex items-end justify-between gap-4">
            <span className="text-[1rem] leading-snug text-white/90">Uma orientação, uma frase e um próximo passo.</span>
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-verde-profundo">
              <IconeSeta />
            </span>
          </span>
        </Link>

        <Link
          to="/preparar"
          className="tocavel mt-3 flex min-h-[4.5rem] items-center gap-3 rounded-[var(--radius-cartao)] bg-bege py-3 pl-3 pr-4 hover:bg-bege-forte active:bg-bege-forte"
        >
          <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-creme">
            <Ilustracao id="tenis" tamanho={36} />
          </span>
          <span className="flex-1">
            <span className="block text-[1.0625rem] font-semibold text-verde-profundo">Preparar uma transição</span>
            <span className="block text-[0.875rem] text-texto-2">Mostre o que vem depois</span>
          </span>
          <span className="text-texto-2"><IconeAvancar /></span>
        </Link>

        {favorito && (
          <section className="mt-9" aria-labelledby="atalho-salvo">
            <h2 id="atalho-salvo" className="rotulo">Salva por você</h2>
            <Link
              to={`/agora/${favorito.id}`}
              className="tocavel mt-2 -mx-2 flex min-h-14 items-center gap-3 rounded-[var(--radius-controle)] px-2 hover:bg-bege active:bg-bege"
            >
              <Ilustracao id={favorito.ilustracao} tamanho={36} />
              <span className="flex-1 font-semibold text-texto">{favorito.titulo}</span>
              <span className="text-texto-2"><IconeAvancar /></span>
            </Link>
          </section>
        )}
      </main>
    </div>
  )
}
