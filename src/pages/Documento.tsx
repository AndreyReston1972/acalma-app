import { useNavigate } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { margem } from '../components/ui'
import type { Documento as Doc } from '../content/documentos'

export function Documento({ doc }: { doc: Doc }) {
  const navegar = useNavigate()
  return (
    <div className="entrada min-h-dvh">
      <BarraTopo fecharPara="/" rotuloFechar="Fechar" acoes={null} />
      <main className={`${margem} pb-[calc(env(safe-area-inset-bottom)+2rem)]`}>
        <p className="rounded-[var(--radius-controle)] bg-bege px-4 py-2.5 text-[0.875rem] font-semibold text-texto">
          Rascunho em revisão jurídica. Trechos entre colchetes ainda serão definidos.
        </p>
        <h1 className="mt-5 font-display text-[1.75rem] font-semibold leading-tight text-verde-profundo">{doc.titulo}</h1>
        <p className="mt-1 text-[0.875rem] text-texto-2">Versão {doc.versao}</p>
        {doc.secoes.map((s) => (
          <section key={s.titulo} className="mt-6">
            <h2 className="text-[1.125rem] font-semibold text-texto">{s.titulo}</h2>
            {s.paragrafos.map((p) => (
              <p key={p} className="mt-2 leading-relaxed text-texto">
                {p}
              </p>
            ))}
          </section>
        ))}
        <button type="button" onClick={() => navegar(-1)} className="tocavel mt-8 min-h-12 font-semibold text-verde-profundo underline">
          Voltar
        </button>
      </main>
    </div>
  )
}
