import { useNavigate } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { botaoTexto, margem } from '../components/ui'
import { IconeTelefone } from '../ilustracoes/icones'
import { seguranca } from '../content/seguranca'

export function Seguranca() {
  const navegar = useNavigate()
  return (
    <div className="entrada min-h-dvh">
      <BarraTopo fecharPara="/" rotuloFechar="Fechar e ir para o início" />
      <main className={`${margem} pb-[calc(env(safe-area-inset-bottom)+2rem)]`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.15] text-verde-profundo">{seguranca.titulo}</h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-texto">{seguranca.introducao}</p>

        <ul className="mt-6 space-y-3">
          {seguranca.contatos.map((c) => (
            <li key={c.numero}>
              <a
                href={`tel:${c.numero}`}
                className="tocavel flex min-h-16 items-center gap-4 rounded-[var(--radius-cartao)] border border-linha bg-white px-5 py-3 hover:border-verde active:bg-bege"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-verde-claro text-verde-profundo">
                  <IconeTelefone />
                </span>
                <span>
                  <span className="block text-[1.125rem] font-bold text-verde-profundo">{c.rotulo}</span>
                  <span className="block text-[0.9375rem] text-texto-2">{c.descricao}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-6 leading-relaxed text-texto-2">{seguranca.fechamento}</p>
        <button type="button" className={`${botaoTexto} -ml-4 mt-2`} onClick={() => navegar(-1)}>
          Voltar para onde eu estava
        </button>
      </main>
    </div>
  )
}
