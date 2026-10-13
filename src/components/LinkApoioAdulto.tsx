import { Link, useLocation } from 'react-router-dom'
import { apoioAdulto } from '../content/adulto'

/*
 * Entrada secundária e discreta para o apoio ao adulto, no mesmo formato do LinkSeguranca.
 * Leva junto de onde a pessoa veio, para o "Voltar" devolver à mesma orientação.
 */
export function LinkApoioAdulto({ className = '' }: { className?: string }) {
  const { pathname } = useLocation()
  return (
    <Link
      to="/apoio-adulto"
      state={{ de: pathname }}
      className={`tocavel inline-flex min-h-12 items-center rounded-[var(--radius-controle)] px-3 text-[0.9375rem] font-semibold text-texto-2 hover:bg-bege ${className}`}
    >
      {apoioAdulto.titulo}
    </Link>
  )
}
