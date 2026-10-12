/* Marca: um horizonte com o sol nascendo. "Calma que orienta". */
export function Simbolo({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={tamanho} height={tamanho} aria-hidden="true" focusable="false">
      <path d="M6.5 22a9.5 9.5 0 0 1 19 0" fill="none" stroke="var(--color-verde)" strokeWidth={2.8} strokeLinecap="round" />
      <path d="M3 26h26" stroke="var(--color-verde)" strokeWidth={2.8} strokeLinecap="round" />
      <circle cx="16" cy="17.5" r="2.8" fill="var(--color-coral)" />
    </svg>
  )
}

export function Marca() {
  return (
    <div className="flex items-center gap-2.5">
      <Simbolo />
      <div className="leading-none">
        <p className="font-display text-[1.375rem] font-semibold tracking-[-0.01em] text-verde-profundo">Acalma</p>
        <p className="mt-1 text-[0.75rem] font-medium text-texto-2">por NexoEdu</p>
      </div>
    </div>
  )
}
