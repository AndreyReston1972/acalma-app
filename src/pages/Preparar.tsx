import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { margem } from '../components/ui'
import { IconeAvancar } from '../ilustracoes/icones'
import { Ilustracao } from '../ilustracoes/Ilustracao'
import { sequencias } from '../content/sequencias'

export function Preparar() {
  return (
    <div className="entrada">
      <main className={`${margem} pt-[calc(env(safe-area-inset-top)+2rem)]`}>
        <h1 className="font-display text-[2rem] font-semibold leading-[1.12] tracking-[-0.015em] text-verde-profundo">
          Mostre o que vem depois.
        </h1>
        <p className="mt-3 max-w-[34ch] text-texto-2">
          Escolha uma sequência e mostre um passo por vez para sua criança. São exemplos: adapte à rotina da sua casa.
        </p>

        <ul className="mt-7 space-y-3">
          {sequencias.map((s) => (
            <li key={s.id}>
              <Link
                to={`/preparar/${s.id}`}
                className="tocavel block rounded-[var(--radius-cartao)] border border-linha bg-white px-5 pb-4 pt-5 shadow-[var(--shadow-suave)] hover:border-verde active:bg-bege"
              >
                <span aria-hidden="true" className="flex items-center gap-1.5">
                  {s.passos.map((p, i) => (
                    <Fragment key={p.id}>
                      {i > 0 && <span className="h-0.5 w-3 rounded-full bg-linha" />}
                      <span className="grid size-14 place-items-center rounded-[14px] bg-bege">
                        <Ilustracao id={p.ilustracao} tamanho={40} />
                      </span>
                    </Fragment>
                  ))}
                </span>
                <span className="mt-3 flex items-center justify-between gap-3">
                  <span>
                    <span className="block text-[1.125rem] font-semibold text-texto">{s.titulo}</span>
                    <span className="block text-[0.9375rem] text-texto-2">
                      {s.passos.map((p) => p.rotulo).join(' → ')}
                    </span>
                  </span>
                  <span className="text-texto-2"><IconeAvancar /></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
