import { useLocation } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { LinkSeguranca } from '../components/LinkSeguranca'
import { margem } from '../components/ui'
import { apoioAdulto } from '../content/adulto'

/*
 * Apoio breve ao adulto. Mesma estrutura visual da orientação (Agora → Você pode dizer → Depois),
 * sem novas perguntas. Risco: leva à tela de segurança que já existe.
 */
export function ApoioAdulto() {
  const de = (useLocation().state as { de?: string } | null)?.de
  return (
    <div className="entrada flex min-h-dvh flex-col">
      <BarraTopo voltarPara={de ?? '/agora'} rotuloVoltar="Voltar" fecharPara="/" rotuloFechar="Sair e ir para o início" />
      <main className={`${margem} flex-1 pb-[calc(env(safe-area-inset-bottom)+2rem)]`}>
        <h1 className="font-display text-[1.625rem] font-semibold leading-[1.15] tracking-[-0.01em] text-verde-profundo">
          {apoioAdulto.titulo}
        </h1>

        <section aria-labelledby="a-agora" className="mt-6">
          <h2 id="a-agora" className="rotulo">Agora</h2>
          <p className="mt-1.5 text-[1.1875rem] font-medium leading-snug text-texto">{apoioAdulto.agora}</p>
          <p className="mt-2 text-[1.0625rem] leading-relaxed text-texto">{apoioAdulto.pausa}</p>
        </section>

        <section aria-labelledby="a-depois" className="mt-5">
          <h2 id="a-depois" className="rotulo">Depois</h2>
          <p className="mt-1.5 text-[1.0625rem] leading-relaxed text-texto">{apoioAdulto.depois}</p>
        </section>

        <section aria-labelledby="a-frase" className="relative mt-5 overflow-hidden rounded-[var(--radius-cartao)] bg-bege px-5 pb-5 pt-4">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-coral" />
          <h2 id="a-frase" className="rotulo">Você pode dizer</h2>
          <p className="mt-2 text-[1.375rem] font-medium leading-[1.35] tracking-[-0.005em] text-verde-profundo">{apoioAdulto.frase}</p>
          <p className="mt-2 text-[0.875rem] text-texto-2">Use as palavras que combinam com vocês.</p>
        </section>
        <p className="mt-3 text-[1rem] leading-relaxed text-texto">{apoioAdulto.semExigir}</p>

        <section aria-labelledby="a-risco" className="mt-6">
          <h2 id="a-risco" className="sr-only">Se houver risco</h2>
          <p className="text-[1rem] font-semibold leading-snug text-texto">{apoioAdulto.risco}</p>
          <LinkSeguranca className="mt-1" />
        </section>
      </main>
    </div>
  )
}
