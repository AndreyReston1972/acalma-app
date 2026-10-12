import { Link } from 'react-router-dom'
import { Faixa } from '../components/Miniatura'
import { linhaLista, margem } from '../components/ui'
import { IconeAvancar, IconeMais } from '../ilustracoes/icones'
import { Cena } from '../ilustracoes/Cena'
import { buscarAcao, modelos } from '../content/combinados'
import { useEstado } from '../armazenamento/useEstado'
import { nomeDoCombinado } from '../util/combinados'

const cenasDe = (passos: string[]) => passos.map((p) => buscarAcao(p)!.cena)

export function Preparar() {
  const { combinados } = useEstado()
  const meus = [...combinados].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))

  return (
    <div className="entrada">
      <main className={`${margem} pt-[calc(env(safe-area-inset-top)+1.75rem)]`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.12] tracking-[-0.015em] text-verde-profundo">
          Mostre o que vem depois.
        </h1>
        <p className="mt-2 max-w-[34ch] text-texto-2">Monte um combinado com os passos de vocês e mostre um de cada vez.</p>

        {meus.length > 0 && (
          <section aria-labelledby="meus" className="mt-7">
            <h2 id="meus" className="font-display text-[1.25rem] font-semibold text-verde-profundo">
              Seus combinados
            </h2>
            <ul className="mt-2 divide-y divide-linha border-y border-linha">
              {meus.map((c) => (
                <li key={c.id} className="flex items-center gap-1">
                  <Link to={`/preparar/${c.id}`} className={`${linhaLista} min-w-0 flex-1`}>
                    <Faixa cenas={cenasDe(c.passos).slice(0, 3)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-texto">{nomeDoCombinado(c)}</span>
                      <span className="block text-[0.875rem] text-texto-2">{c.passos.length} passos</span>
                    </span>
                  </Link>
                  <Link
                    to={`/preparar/${c.id}/mostrar`}
                    className="tocavel inline-flex min-h-12 shrink-0 items-center rounded-[var(--radius-controle)] px-3 font-semibold text-verde-profundo hover:bg-bege active:bg-bege-forte"
                    aria-label={`Mostrar ${nomeDoCombinado(c)}`}
                  >
                    Mostrar
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="modelos" className="mt-7">
          <h2 id="modelos" className="font-display text-[1.25rem] font-semibold text-verde-profundo">
            {meus.length > 0 ? 'Montar outro' : 'Comece de um modelo'}
          </h2>
          <p className="mt-1 text-[0.9375rem] text-texto-2">Você escolhe os passos, a ordem e o nome.</p>
          <ul className="mt-4 grid grid-cols-1 gap-3">
            {modelos.map((m) => (
              <li key={m.id}>
                <Link
                  to={`/preparar/novo?modelo=${m.id}`}
                  className="tocavel flex items-stretch overflow-hidden rounded-[var(--radius-cartao)] border border-linha bg-white hover:border-verde active:bg-bege"
                >
                  <span aria-hidden="true" className="grid w-[7.5rem] shrink-0 place-items-center bg-bege">
                    <Cena id={buscarAcao(m.passos[0])!.cena} className="h-[5.25rem] w-28" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-4 py-3">
                    <span className="text-[1.125rem] font-semibold leading-tight text-texto">{m.titulo}</span>
                    <span className="text-[0.875rem] leading-snug text-texto-2">
                      {m.passos.map((p) => buscarAcao(p)!.rotulo).join(' → ')}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/preparar/novo" className={`${linhaLista} mt-2 min-h-14 text-[1.0625rem] font-semibold text-verde-profundo`}>
            <span className="grid size-10 place-items-center rounded-full bg-verde-claro"><IconeMais /></span>
            <span className="flex-1">Montar do zero</span>
            <span className="text-texto-2"><IconeAvancar /></span>
          </Link>
        </section>
      </main>
    </div>
  )
}
