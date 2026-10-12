import { useNavigate } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { botaoTexto, margem } from '../components/ui'
import { seguranca, type Contato } from '../content/seguranca'

function LinhaContato({ c, destaque }: { c: Contato; destaque: boolean }) {
  return (
    <a
      href={`tel:${c.numero}`}
      aria-label={`Ligar ${c.numero}, ${c.servico}: ${c.quando}`}
      className={`tocavel flex min-h-[5.5rem] items-center gap-4 rounded-[var(--radius-cartao)] border px-4 py-3 ${
        destaque ? 'border-coral-texto/30 bg-white hover:border-coral-texto' : 'border-linha bg-white hover:border-verde'
      } active:bg-bege`}
    >
      <span className="w-[4.25rem] shrink-0 text-center">
        <span className={`block font-display text-[2rem] font-semibold leading-none ${destaque ? 'text-coral-texto' : 'text-verde-profundo'}`}>
          {c.numero}
        </span>
        <span className="mt-1 block text-[0.75rem] font-semibold text-texto-2">{c.servico}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug text-texto">{c.quando}</span>
        <span className="mt-0.5 block text-[0.875rem] leading-snug text-texto-2">{c.detalhe}</span>
      </span>
    </a>
  )
}

export function Seguranca() {
  const navegar = useNavigate()
  return (
    <div className="entrada min-h-dvh">
      <BarraTopo fecharPara="/" rotuloFechar="Fechar e ir para o início" />
      <main className={`${margem} pb-[calc(env(safe-area-inset-bottom)+2rem)]`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.15] text-verde-profundo">{seguranca.titulo}</h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-texto">{seguranca.introducao}</p>

        <section aria-labelledby="sg-emergencia" className="mt-6">
          <h2 id="sg-emergencia" className="rotulo">Emergência</h2>
          <ul className="mt-2 space-y-2.5">
            {seguranca.emergencia.map((c) => (
              <li key={c.numero}>
                <LinhaContato c={c} destaque />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sg-apoio" className="mt-6">
          <h2 id="sg-apoio" className="rotulo">Para conversar</h2>
          <div className="mt-2">
            <LinhaContato c={seguranca.apoio} destaque={false} />
          </div>
          <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-texto-2">{seguranca.avisoApoio}</p>
        </section>

        <p className="mt-6 leading-relaxed text-texto-2">{seguranca.fechamento}</p>
        <button type="button" className={`${botaoTexto} -ml-4 mt-1`} onClick={() => navegar(-1)}>
          Voltar para onde eu estava
        </button>
      </main>
    </div>
  )
}
