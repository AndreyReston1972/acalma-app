import { Link } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { margem } from '../components/ui'
import { IconeAvancar, IconeEscudo } from '../ilustracoes/icones'
import { Ilustracao } from '../ilustracoes/Ilustracao'
import { situacoes } from '../content/situacoes'

/* Tocar na situação já abre a orientação: sem "Continuar". */
export function Situacao() {
  return (
    <div className="entrada flex min-h-dvh flex-col">
      <BarraTopo voltarPara="/" rotuloVoltar="Voltar ao início" />
      <main className={`${margem} flex-1 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.15] tracking-[-0.01em] text-verde-profundo">
          O que está acontecendo?
        </h1>
        <ul className="mt-5 divide-y divide-linha border-y border-linha">
          {situacoes.map((s) => (
            <li key={s.id}>
              <Link
                to={`/agora/${s.id}`}
                className="tocavel -mx-2 flex min-h-[4.5rem] items-center gap-4 rounded-[var(--radius-controle)] px-2 py-2 hover:bg-bege active:bg-bege"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-bege">
                  <Ilustracao id={s.ilustracao} tamanho={38} />
                </span>
                <span className="flex-1 text-[1.125rem] font-semibold text-texto">{s.titulo}</span>
                <span className="text-texto-2"><IconeAvancar /></span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/seguranca"
          className="tocavel mt-6 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-controle)] pr-3 text-[0.9375rem] font-semibold text-coral-texto"
        >
          <IconeEscudo />
          Alguém pode se machucar?
        </Link>
      </main>
    </div>
  )
}
