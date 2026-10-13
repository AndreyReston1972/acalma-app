import { Link } from 'react-router-dom'
import { IconeEscudo } from '../ilustracoes/icones'

/* Acesso discreto e sempre no mesmo formato ao apoio de segurança. */
export function LinkSeguranca({ className = '', texto = 'Alguém pode se machucar?' }: { className?: string; texto?: string }) {
  return (
    <Link
      to="/seguranca"
      className={`tocavel inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-controle)] pr-3 text-[0.9375rem] font-semibold text-coral-texto hover:bg-bege ${className}`}
    >
      <IconeEscudo />
      {texto}
    </Link>
  )
}
