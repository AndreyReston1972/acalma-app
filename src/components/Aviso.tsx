import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

const TELAS_COM_NAVEGACAO = ['/', '/preparar', '/salvos']

/* Aviso discreto (toast): uma linha, some sozinho, anunciado a leitores de tela. */
const Contexto = createContext<(texto: string) => void>(() => {})

export function ProvedorAviso({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<{ texto: string; chave: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const { pathname } = useLocation()
  const acimaDaNavegacao = TELAS_COM_NAVEGACAO.includes(pathname)

  const avisar = useCallback((texto: string) => {
    window.clearTimeout(timer.current)
    setAviso({ texto, chave: Date.now() })
    timer.current = window.setTimeout(() => setAviso(null), 2600)
  }, [])

  return (
    <Contexto.Provider value={avisar}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-6"
        style={{ bottom: `calc(env(safe-area-inset-bottom) + ${acimaDaNavegacao ? '5.5rem' : '1.25rem'})` }}
      >
        {aviso && (
          <p
            key={aviso.chave}
            className="entrada rounded-[var(--radius-controle)] bg-verde-profundo px-5 py-3 text-[0.9375rem] font-medium text-white shadow-[var(--shadow-acao)]"
          >
            {aviso.texto}
          </p>
        )}
      </div>
    </Contexto.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAviso = () => useContext(Contexto)
