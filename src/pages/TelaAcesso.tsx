import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Marca } from '../components/Marca'
import { LinkSeguranca } from '../components/LinkSeguranca'
import { botaoPrimario, botaoSecundario, botaoTexto, margem } from '../components/ui'
import { Cena, type CenaId } from '../ilustracoes/Cena'
import { Confirmacao } from '../components/Confirmacao'
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
    texto: 'A compra deste e-mail foi reembolsada ou estornada. Seus dados continuam seus: você pode baixar uma cópia ou excluí-los. Se acha que é um engano, fale com o suporte.',
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
  onExportar,
  onExcluir,
  pendentes = 0,
  simulacao = false,
}: {
  tela: Exclude<Tela, 'entrar'>
  email?: string | null
  onTentar?: () => Promise<unknown> | void
  onTrocarEmail?: () => Promise<unknown> | void
  /** Cópia dos dados: não exige compra. */
  onExportar?: () => Promise<unknown> | void
  /** Exclusão dos dados do Acalma: não exige compra. */
  onExcluir?: () => Promise<unknown> | void
  /** Alterações deste aparelho que o servidor não aceitou (sem acesso). Ficam guardadas. */
  pendentes?: number
  simulacao?: boolean
}) {
  const t = TEXTOS[tela]
  const [tentando, setTentando] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [estadoDados, setEstadoDados] = useState('')
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
        {tela === 'revogado' && pendentes > 0 && (
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-texto-2">
            {pendentes === 1
              ? 'Uma alteração feita neste aparelho não foi enviada. Ela continua guardada aqui e entra na cópia que você baixar.'
              : `${pendentes} alterações feitas neste aparelho não foram enviadas. Elas continuam guardadas aqui e entram na cópia que você baixar.`}
          </p>
        )}
        <p role="status" aria-live="polite" className="mt-2 text-[0.9375rem] font-semibold text-verde-profundo">
          {estadoDados}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-8">
          {(tela === 'processando' || tela === 'confirmar_online' || tela === 'erro_rede') && (
            <button type="button" className={botaoPrimario} onClick={() => void tentar()} disabled={tentando}>
              {tentando ? 'Conferindo…' : tela === 'processando' ? 'Verificar de novo' : 'Tentar de novo'}
            </button>
          )}
          {tela === 'nao_localizado' && simulacao && (
            <button type="button" className={botaoPrimario} onClick={() => setEstadoDados('Simulação: na versão integrada, abre o checkout da Hotmart.')}>
              Comprar o Acalma
            </button>
          )}
          {tela === 'nao_localizado' && !simulacao && CONFIG.checkoutUrl && (
            <a className={botaoPrimario} href={CONFIG.checkoutUrl} rel="noopener">
              Comprar o Acalma
            </a>
          )}
          {tela === 'revogado' && onExportar && (
            <button
              type="button"
              className={botaoSecundario}
              onClick={() =>
                void Promise.resolve(onExportar()).then(
                  (r) =>
                    setEstadoDados(
                      simulacao
                        ? 'Simulação: nenhum arquivo foi gerado.'
                        : (r as { baixou?: boolean } | undefined)?.baixou === false
                          ? 'Este navegador não permitiu gerar o arquivo.'
                          : 'Cópia gerada.',
                    ),
                  () => setEstadoDados('Não foi possível gerar a cópia agora.'),
                )
              }
            >
              Baixar uma cópia dos meus dados
            </button>
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
          {tela === 'revogado' && onExcluir && (
            <button type="button" className={`${botaoTexto} text-coral-texto`} onClick={() => setConfirmandoExclusao(true)}>
              Excluir meus dados do Acalma
            </button>
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
      <Confirmacao
        aberto={confirmandoExclusao}
        titulo="Excluir seus dados do Acalma?"
        texto="Apaga combinados, orientações salvas e registros da sua conta e deste aparelho, inclusive o que não foi enviado. Baixe uma cópia antes, se quiser guardar. Não dá para desfazer."
        confirmar="Excluir dados"
        onCancelar={() => setConfirmandoExclusao(false)}
        onConfirmar={() => {
          setConfirmandoExclusao(false)
          void Promise.resolve(onExcluir?.()).then(
            () => setEstadoDados(simulacao ? 'Simulação: nada foi excluído.' : 'Dados do Acalma excluídos.'),
            () => setEstadoDados('Sem conexão: tente excluir de novo com internet.'),
          )
        }}
      />
    </div>
  )
}
