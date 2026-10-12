import type { ReactNode, SVGProps } from 'react'

/* Ícones de interface: grade 24, traço 2, herdando a cor do texto. */
function Base({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconeVoltar = () => <Base><path d="M15 5l-7 7 7 7" /></Base>
export const IconeFechar = () => <Base><path d="M6 6l12 12M18 6 6 18" /></Base>
export const IconeSeta = () => <Base><path d="M5 12h14M13 6l6 6-6 6" /></Base>
export const IconeAvancar = () => <Base><path d="m9 5 7 7-7 7" /></Base>
export const IconeAbaixo = () => <Base><path d="m6 9 6 6 6-6" /></Base>
export const IconeConta = () => (
  <Base><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1.2-3.5 3.8-5 7-5s5.8 1.5 7 5" /></Base>
)
export const IconeTelefone = () => (
  <Base><path d="M5 4h3.5l1.5 4.5-2 1.5a11 11 0 0 0 6 6l1.5-2 4.5 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></Base>
)
export const IconeLixeira = () => (
  <Base><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Base>
)
export const IconeEscudo = () => (
  <Base><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z" /><path d="M12 8v5M12 16.5v.01" /></Base>
)

export function IconeMarcador({ preenchido = false }: { preenchido?: boolean }) {
  return (
    <Base>
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" fill={preenchido ? 'currentColor' : 'none'} />
    </Base>
  )
}

/* Navegação: Agora (horizonte), Preparar (sequência), Salvos (marcador) */
export function IconeAgora({ ativo }: { ativo: boolean }) {
  return (
    <Base>
      <path d="M5 16a7 7 0 0 1 14 0" fill={ativo ? 'currentColor' : 'none'} />
      <path d="M3 19.5h18" />
    </Base>
  )
}
export function IconePreparar({ ativo }: { ativo: boolean }) {
  return (
    <Base>
      <circle cx="5" cy="12" r="2.2" fill={ativo ? 'currentColor' : 'none'} />
      <circle cx="12" cy="12" r="2.2" fill={ativo ? 'currentColor' : 'none'} />
      <circle cx="19" cy="12" r="2.2" fill={ativo ? 'currentColor' : 'none'} />
      <path d="M7.2 12h2.6M14.2 12h2.6" />
    </Base>
  )
}
export function IconeSalvos({ ativo }: { ativo: boolean }) {
  return <IconeMarcador preenchido={ativo} />
}
export const IconeMais = () => <Base><path d="M12 5v14M5 12h14" /></Base>
export const IconeAcima = () => <Base><path d="m6 15 6-6 6 6" /></Base>
export const IconeCheck = () => <Base><path d="m5 12.5 4.5 4.5L19 7.5" /></Base>
export const IconeLapis = () => (
  <Base><path d="M4 20h4L19 9l-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></Base>
)
