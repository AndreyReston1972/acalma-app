import { Link } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { Miniatura } from '../components/Miniatura'
import { linhaLista, margem } from '../components/ui'
import { IconeAvancar } from '../ilustracoes/icones'
import { situacoes } from '../content/situacoes'
import { LinkSeguranca } from '../components/LinkSeguranca'
import { LinkApoioAdulto } from '../components/LinkApoioAdulto'

/* Tocar na situação já abre a orientação: sem "Continuar". */
export function Situacao() {
  return (
    <div className="entrada flex min-h-dvh flex-col">
      <BarraTopo voltarPara="/" rotuloVoltar="Voltar ao início" />
      <main className={`${margem} flex-1 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.15] tracking-[-0.01em] text-verde-profundo">
          O que está acontecendo?
        </h1>
        <ul className="mt-4 divide-y divide-linha border-y border-linha">
          {situacoes.map((s) => (
            <li key={s.id}>
              <Link to={`/agora/${s.id}`} className={linhaLista}>
                <Miniatura id={s.cena} />
                <span className="flex-1 text-[1.125rem] font-semibold leading-tight text-texto">{s.titulo}</span>
                <span className="text-texto-2"><IconeAvancar /></span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col items-start gap-1">
          <LinkSeguranca />
          <LinkApoioAdulto className="-ml-3" />
        </div>
      </main>
    </div>
  )
}
