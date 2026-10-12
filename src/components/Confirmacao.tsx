import { useEffect, useRef } from 'react'
import { botaoSecundario } from './ui'

/*
 * Confirmação com <dialog> nativo: foco preso no diálogo, Esc cancela,
 * o foco volta ao botão de origem ao fechar.
 */
export function Confirmacao({
  aberto,
  titulo,
  texto,
  confirmar,
  onConfirmar,
  onCancelar,
}: {
  aberto: boolean
  titulo: string
  texto: string
  confirmar: string
  onConfirmar: () => void
  onCancelar: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const cancelar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aberto && !d.open) {
      d.showModal?.()
      // A opção segura recebe o foco, não a destrutiva
      cancelar.current?.focus()
    }
    if (!aberto && d.open) d.close?.()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirmacao-titulo"
      aria-describedby="confirmacao-texto"
      onCancel={(e) => {
        e.preventDefault()
        onCancelar()
      }}
      className="m-auto w-[calc(100%-3rem)] max-w-sm rounded-[var(--radius-cartao)] bg-creme p-6 text-texto shadow-[var(--shadow-acao)] backdrop:bg-texto/40"
    >
      {aberto && (
        <>
          <h2 id="confirmacao-titulo" className="font-display text-[1.375rem] font-semibold leading-tight">
            {titulo}
          </h2>
          <p id="confirmacao-texto" className="mt-2 text-texto-2">
            {texto}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={onConfirmar}
              className="tocavel inline-flex min-h-14 w-full items-center justify-center rounded-[var(--radius-controle)] bg-coral-texto px-6 font-semibold text-white"
            >
              {confirmar}
            </button>
            <button ref={cancelar} type="button" onClick={onCancelar} className={botaoSecundario}>
              Cancelar
            </button>
          </div>
        </>
      )}
    </dialog>
  )
}
