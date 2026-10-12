import { useEffect, useRef } from 'react'
import { Cena } from '../ilustracoes/Cena'
import { IconeCheck, IconeFechar, IconeMais } from '../ilustracoes/icones'
import { acoes } from '../content/combinados'
import type { AcaoId } from '../content/tipos'
import { botaoIcone } from './ui'

/*
 * Catálogo de passos em folha inferior (<dialog> nativo): foco preso, Esc e
 * o X fecham sem alterar nada no editor. Escolher uma ação devolve para a
 * sequência. Passos que já estão no combinado aparecem marcados e não
 * podem ser escolhidos de novo.
 */
export function CatalogoPassos({
  aberto,
  escolhidos,
  onEscolher,
  onFechar,
}: {
  aberto: boolean
  escolhidos: AcaoId[]
  onEscolher: (acao: AcaoId) => void
  onFechar: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const fechar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aberto && !d.open) {
      d.showModal?.()
      fechar.current?.focus()
    }
    if (!aberto && d.open) d.close?.()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      aria-labelledby="catalogo-titulo"
      onCancel={(e) => {
        e.preventDefault()
        onFechar()
      }}
      onClick={(e) => {
        // toque no fundo escurecido fecha
        if (e.target === ref.current) onFechar()
      }}
      className="folha mx-auto mb-0 mt-auto max-h-[88dvh] w-full max-w-[30rem] overflow-y-auto rounded-t-[28px] bg-creme p-0 text-texto shadow-[var(--shadow-acao)] backdrop:bg-texto/45"
    >
      {aberto && (
        <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
          <div className="sticky top-0 z-10 -mx-5 flex items-center justify-between bg-creme px-5 pb-2 pt-3">
            <span aria-hidden="true" className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-linha" />
            <h2 id="catalogo-titulo" className="mt-3 font-display text-[1.375rem] font-semibold text-verde-profundo">
              Escolha um passo
            </h2>
            <button ref={fechar} type="button" className={`${botaoIcone} -mr-2 mt-2`} aria-label="Fechar sem escolher" onClick={onFechar}>
              <IconeFechar />
            </button>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-2.5">
            {acoes.map((a) => {
              const ja = escolhidos.includes(a.id)
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    disabled={ja}
                    onClick={() => onEscolher(a.id)}
                    aria-label={ja ? `${a.rotulo} (já está no combinado)` : `Adicionar ${a.rotulo}`}
                    className={`tocavel flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-cartao)] border text-left ${
                      ja ? 'border-linha bg-bege/60' : 'border-linha bg-white hover:border-verde active:bg-bege'
                    }`}
                  >
                    <span aria-hidden="true" className={`block bg-bege ${ja ? 'opacity-50' : ''}`}>
                      <Cena id={a.cena} className="mx-auto block aspect-[4/3] w-full max-w-36" />
                    </span>
                    <span className="flex min-h-12 flex-1 items-center gap-2 px-3 py-2 text-[0.9375rem] font-semibold leading-tight">
                      <span className={`flex-1 ${ja ? 'text-texto-2' : 'text-texto'}`}>{a.rotulo}</span>
                      <span
                        aria-hidden="true"
                        className={`grid size-7 shrink-0 place-items-center rounded-full ${ja ? 'bg-verde-claro text-verde-profundo' : 'border-2 border-texto-2 text-texto-2'}`}
                      >
                        {ja ? <IconeCheck /> : <IconeMais />}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </dialog>
  )
}
