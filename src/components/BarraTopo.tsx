import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconeFechar, IconeVoltar } from '../ilustracoes/icones'
import { botaoIcone } from './ui'

/*
 * Cabeçalho compacto das telas internas: voltar à esquerda, ações à direita.
 * "fecharPara" mostra um X que sai do fluxo a qualquer momento.
 */
export function BarraTopo({
  voltarPara,
  rotuloVoltar = 'Voltar',
  fecharPara,
  rotuloFechar = 'Fechar e ir para o início',
  titulo,
  acoes,
}: {
  voltarPara?: string
  rotuloVoltar?: string
  fecharPara?: string
  rotuloFechar?: string
  titulo?: string
  acoes?: ReactNode
}) {
  const navegar = useNavigate()
  return (
    <header className="sticky top-0 z-20 bg-creme/95 pt-[env(safe-area-inset-top)] supports-[backdrop-filter]:bg-creme/90">
      <div className="flex h-16 items-center gap-1 px-3">
        {voltarPara ? (
          <button type="button" className={botaoIcone} aria-label={rotuloVoltar} onClick={() => navegar(voltarPara)}>
            <IconeVoltar />
          </button>
        ) : (
          <span className="size-12" aria-hidden="true" />
        )}
        <p className="min-w-0 flex-1 truncate px-1 text-[0.9375rem] font-semibold text-texto-2">{titulo}</p>
        {acoes}
        {fecharPara && (
          <button type="button" className={botaoIcone} aria-label={rotuloFechar} onClick={() => navegar(fecharPara)}>
            <IconeFechar />
          </button>
        )}
      </div>
    </header>
  )
}
