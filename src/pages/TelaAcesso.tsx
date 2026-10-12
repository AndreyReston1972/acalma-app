import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Marca } from '../components/Marca'
import { LinkSeguranca } from '../components/LinkSeguranca'
import { botaoPrimario, botaoSecundario, botaoTexto, margem } from '../components/ui'
import { Cena, type CenaId } from '../ilustracoes/Cena'
import { CONFIG } from '../config'
import type { Tela } from '../conta/acesso'

/*
 * Estados de acesso, no mesmo desenho do app. O apoio de segurança continua
 * acessível em todos eles: ninguém fica sem ele por causa de pagamento.
 */
const TEXTOS: Record<Exclude<Tela, 'entrar'>, { cena: CenaId; titulo: string; texto: string }> = {
  processando: {
    cena: 'vazio-registros',
    titulo: 'Sua compra está em processamento',
    texto: 'Pagamentos por boleto ou Pix podem levar um tempo para serem confirmados. Assim que a Hotmart confirmar, o acesso abre aqui.',
  },
  nao_localizado: {
    cena: 'vazio-favoritos',
    titulo: 'Não encontramos uma compra para este e-mail',
    texto: 'O acesso fica no e-mail usado na compra. Se você comprou com outro e-mail, entre com ele.',
  },
  revogado: {
    cena: 'vazio-registros',
    titulo: 'Este acesso foi encerrado',
    texto: 'A compra deste e-mail foi reembolsada ou contestada. Se acha que é um engano, fale com o suporte.',
  },
  confirmar_online: {
    cena: 'cantinho',
    titulo: 'Conecte-se uma vez para continuar',
    texto: 'Faz tempo que este aparelho não confirma o acesso. Com internet, a confirmação leva poucos segundos.',
  },
  erro_rede: {
    cena: 'cantinho',
    titulo: 'Não foi possível confirmar agora',
    texto: 'Pode ser a conexão ou uma instabilidade nossa. Tente de novo em instantes.',
  },
}

export function TelaAcesso({
  tela,
  email,
  onTentar,
  onTrocarEmail,
  simulacao = false,
}: {
  tela: Exclude<Tela, 'entrar'>
  email?: string | null
  onTentar?: () => Promise<unknown> | void
  onTrocarEmail?: () => Promise<unknown> | void
  simulacao?: boolean
}) {
  const t = TEXTOS[tela]
  const [tentando, setTentando] = useState(false)
  const navegar = useNavigate()
  const tentar = async () => {
    if (!onTentar || tentando) return
    setTentando(true)
    try {
      await onTentar()
    } finally {
      setTentando(false)
    }
  }
  return (
    <div className="entrada flex min-h-dvh flex-col">
      {simulacao && (
        <p className="bg-verde-profundo px-6 py-2 text-center text-[0.8125rem] font-semibold text-white">
          Simulação: esta tela não consulta nenhuma compra
        </p>
      )}
      <header className={`pt-[calc(env(safe-area-inset-top)+1rem)] ${margem}`}>
        <Marca />
      </header>
      <main className={`${margem} flex flex-1 flex-col pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-8`}>
        <span aria-hidden="true" className="block w-40 overflow-hidden rounded-[24px] bg-bege">
          <Cena id={t.cena} className="block aspect-[4/3] w-full" />
        </span>
        <h1 className="mt-6 font-display text-[1.75rem] font-semibold leading-[1.15] text-verde-profundo">{t.titulo}</h1>
        <p className="mt-3 leading-relaxed text-texto-2">{t.texto}</p>
        {email && (
          <p className="mt-3 text-[0.9375rem] text-texto-2">
            Conta: <strong className="text-texto">{email}</strong>
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-8">
          {(tela === 'processando' || tela === 'confirmar_online' || tela === 'erro_rede') && (
            <button type="button" className={botaoPrimario} onClick={() => void tentar()} disabled={tentando}>
              {tentando ? 'Conferindo…' : tela === 'processando' ? 'Verificar de novo' : 'Tentar de novo'}
            </button>
          )}
          {tela === 'nao_localizado' && CONFIG.checkoutUrl && (
            <a className={botaoPrimario} href={CONFIG.checkoutUrl} rel="noopener">
              Comprar o Acalma
            </a>
          )}
          {(tela === 'nao_localizado' || tela === 'revogado') && onTrocarEmail && (
            <button type="button" className={botaoSecundario} onClick={() => void onTrocarEmail()}>
              Entrar com outro e-mail
            </button>
          )}
          {tela === 'nao_localizado' && onTentar && (
            <button type="button" className={botaoTexto} onClick={() => void tentar()} disabled={tentando}>
              Acabei de comprar: verificar de novo
            </button>
          )}
          {CONFIG.suporteEmail && (tela === 'nao_localizado' || tela === 'revogado' || tela === 'processando') && (
            <a className={botaoTexto} href={`mailto:${CONFIG.suporteEmail}`}>
              Falar com o suporte
            </a>
          )}
          {simulacao && (
            <button type="button" className={botaoTexto} onClick={() => navegar('/demonstracao/acesso')}>
              Voltar às simulações
            </button>
          )}
          <div className="flex justify-center">
            <LinkSeguranca />
          </div>
        </div>
      </main>
    </div>
  )
}
