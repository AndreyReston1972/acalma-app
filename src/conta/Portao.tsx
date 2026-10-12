import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useConta } from './Conta'
import { TelaAcesso } from '../pages/TelaAcesso'
import { Marca } from '../components/Marca'

/* Rotas que nunca dependem de acesso. A segurança fica sempre aberta. */
const LIVRES = ['/entrar', '/seguranca', '/termos', '/privacidade']

export function Portao({ children }: { children: ReactNode }) {
  const conta = useConta()
  const { pathname } = useLocation()
  if (conta.modo === 'demonstracao' || LIVRES.includes(pathname)) return <>{children}</>

  const s = conta.situacao
  if (s.fase === 'carregando') {
    return (
      <div className="flex min-h-dvh items-center justify-center" role="status" aria-live="polite">
        <span className="opacity-80">
          <Marca />
        </span>
        <span className="sr-only">Abrindo o Acalma</span>
      </div>
    )
  }
  if (s.fase === 'sem_sessao') return <Navigate to="/entrar" replace />
  if (s.decisao.tipo === 'liberado') return <>{children}</>
  if (s.decisao.tela === 'entrar') return <Navigate to="/entrar" replace />
  return (
    <TelaAcesso
      tela={s.decisao.tela}
      email={conta.sessao?.email}
      onTentar={() => conta.verificar()}
      onTrocarEmail={() => conta.sair(false)}
    />
  )
}
