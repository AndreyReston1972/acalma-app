/*
 * Classes de componentes compartilhadas. Um lugar só para a forma dos
 * controles, para que todas as telas falem a mesma língua visual.
 * Alvo mínimo de toque: 48px.
 */
export const botaoPrimario =
  'tocavel inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-controle)] bg-verde px-6 text-[1.0625rem] font-semibold text-white shadow-[var(--shadow-acao)] hover:bg-verde-profundo active:bg-verde-profundo disabled:bg-bege-forte disabled:text-texto-2 disabled:shadow-none'

export const botaoSecundario =
  'tocavel inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-controle)] border border-linha bg-creme px-6 text-[1.0625rem] font-semibold text-verde-profundo hover:bg-bege active:bg-bege'

export const botaoTexto =
  'tocavel inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-controle)] px-4 text-base font-semibold text-verde-profundo underline-offset-4 hover:underline active:bg-bege'

export const botaoIcone =
  'tocavel inline-grid size-12 shrink-0 place-items-center rounded-full text-verde-profundo hover:bg-bege active:bg-bege-forte'

/** Margem lateral padrão das telas */
export const margem = 'px-6'

export const botaoDestrutivo =
  'tocavel inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-controle)] px-4 text-base font-semibold text-coral-texto hover:bg-bege active:bg-bege-forte'

/** Linha de lista tocável (situações, combinados, salvos) */
export const linhaLista =
  'tocavel -mx-2 flex min-h-[4.5rem] items-center gap-4 rounded-[var(--radius-controle)] px-2 py-2.5 hover:bg-bege active:bg-bege-forte'
