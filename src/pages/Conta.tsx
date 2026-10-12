import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { Confirmacao } from '../components/Confirmacao'
import { useAviso } from '../components/Aviso'
import { botaoSecundario, botaoTexto, linhaLista, margem } from '../components/ui'
import { IconeAvancar } from '../ilustracoes/icones'
import { apagarDadosDoPrototipo, importarRegistrosAnteriores } from '../armazenamento/armazenamento'
import { lerRegistrosAnteriores } from '../armazenamento/legado'
import { useEstado } from '../armazenamento/useEstado'
import { useConta } from '../conta/Conta'
import { dataHoraCurta } from '../util/datas'

type Confirmar = null | 'apagar-demo' | 'excluir-dados' | 'sair'

export function Conta() {
  const conta = useConta()
  const avisar = useAviso()
  const estado = useEstado()
  const [confirmando, setConfirmando] = useState<Confirmar>(null)
  const [apagarCopia, setApagarCopia] = useState(true)
  const integrado = conta.modo === 'integrado'

  // Registros do app anterior presentes neste navegador (só leitura) e ainda não importados.
  const anteriores = useMemo(() => {
    if (!integrado) return []
    const ja = new Set(estado.registros.map((r) => r.id))
    return lerRegistrosAnteriores().filter((r) => !ja.has(r.id))
  }, [integrado, estado.registros])

  return (
    <div className="entrada min-h-dvh">
      <BarraTopo voltarPara="/" rotuloVoltar="Voltar ao início" />
      <main className={`${margem} pb-12`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.15] text-verde-profundo">Conta</h1>

        {!integrado ? (
          <>
            <section className="mt-6 rounded-[var(--radius-cartao)] bg-bege p-5">
              <h2 className="font-semibold text-texto">Versão de demonstração</h2>
              <p className="mt-1.5 leading-relaxed text-texto-2">
                Sem login e sem pagamento: o acesso aparece como já ativado e os dados ficam só neste navegador. Nada daqui
                é levado para uma conta real.
              </p>
            </section>
            <Link to="/demonstracao/acesso" className={`${linhaLista} mt-4`}>
              <span className="flex-1 font-semibold text-verde-profundo">Ver telas de acesso (simulação)</span>
              <span className="text-texto-2"><IconeAvancar /></span>
            </Link>
          </>
        ) : (
          <>
            <section className="mt-6 rounded-[var(--radius-cartao)] bg-bege p-5">
              <p className="text-[0.875rem] text-texto-2">Conta NexoEdu</p>
              <p className="mt-0.5 break-all font-semibold text-texto">{conta.sessao?.email}</p>
              <p className="mt-3 text-[0.9375rem] text-texto">
                Acesso ao Acalma: <strong>ativo</strong> · pagamento único, sem mensalidade.
              </p>
              <p className="mt-1 text-[0.875rem] text-texto-2">A Nina é separada e opcional; nada aqui muda a sua assinatura dela.</p>
            </section>

            <section className="mt-6" aria-labelledby="ct-sinc">
              <h2 id="ct-sinc" className="font-semibold text-texto">Seus dados</h2>
              <p className="mt-1.5 leading-relaxed text-texto-2">
                Ficam neste aparelho (para funcionar sem internet) e na sua conta (para não se perderem).{' '}
                {conta.sinc.pendentes > 0
                  ? `${conta.sinc.pendentes} alteração(ões) aguardando conexão.`
                  : conta.sinc.ultimaEm
                    ? `Sincronizado ${dataHoraCurta(new Date(conta.sinc.ultimaEm))}.`
                    : 'Ainda não sincronizado.'}
              </p>
              <button type="button" className={`${botaoTexto} -ml-4`} disabled={conta.sinc.emAndamento} onClick={() => void conta.sincronizarAgora()}>
                {conta.sinc.emAndamento ? 'Sincronizando…' : 'Sincronizar agora'}
              </button>
            </section>

            {anteriores.length > 0 && (
              <section className="mt-6 rounded-[var(--radius-cartao)] border border-linha p-5" aria-labelledby="ct-ant">
                <h2 id="ct-ant" className="font-semibold text-texto">Registros do Acalma anterior</h2>
                <p className="mt-1.5 leading-relaxed text-texto-2">
                  Encontramos {anteriores.length} registro(s) da versão anterior neste aparelho. Você pode trazê-los para
                  Salvos, como estão, identificados como do app anterior.
                </p>
                <button
                  type="button"
                  className={`${botaoSecundario} mt-3`}
                  onClick={() => avisar(`${importarRegistrosAnteriores(anteriores)} registro(s) importado(s)`)}
                >
                  Importar registros anteriores
                </button>
              </section>
            )}
          </>
        )}

        <section className="mt-6">
          <h2 className="font-semibold text-texto">Termos</h2>
          <div className="mt-1 flex flex-wrap gap-x-2">
            <Link to="/termos" className={`${botaoTexto} -ml-4`}>Termos de uso</Link>
            <Link to="/privacidade" className={botaoTexto}>Privacidade</Link>
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-2">
          {!integrado ? (
            <button type="button" className={`${botaoSecundario} text-coral-texto`} onClick={() => setConfirmando('apagar-demo')}>
              Apagar dados deste protótipo
            </button>
          ) : (
            <>
              <button type="button" className={botaoSecundario} onClick={() => setConfirmando('sair')}>
                Sair deste aparelho
              </button>
              <button type="button" className={`${botaoTexto} text-coral-texto`} onClick={() => setConfirmando('excluir-dados')}>
                Excluir meus dados do Acalma
              </button>
            </>
          )}
        </section>
      </main>

      <Confirmacao
        aberto={confirmando === 'apagar-demo'}
        titulo="Apagar os dados do protótipo?"
        texto="Apaga combinados, orientações salvas e registros desta versão de avaliação, neste navegador. Não dá para desfazer."
        confirmar="Apagar"
        onCancelar={() => setConfirmando(null)}
        onConfirmar={() => {
          apagarDadosDoPrototipo()
          setConfirmando(null)
          avisar('Dados do protótipo apagados')
        }}
      />
      <Confirmacao
        aberto={confirmando === 'excluir-dados'}
        titulo="Excluir seus dados do Acalma?"
        texto="Apaga combinados, orientações salvas e registros da sua conta e deste aparelho. Sua compra e a Nina não são afetadas. Não dá para desfazer."
        confirmar="Excluir dados"
        onCancelar={() => setConfirmando(null)}
        onConfirmar={() => {
          setConfirmando(null)
          conta.excluirMeusDados().then(
            () => avisar('Dados do Acalma excluídos'),
            () => avisar('Sem conexão: tente excluir de novo com internet'),
          )
        }}
      />
      <Confirmacao
        aberto={confirmando === 'sair'}
        titulo="Sair deste aparelho?"
        texto={
          conta.sinc.pendentes > 0
            ? `Há ${conta.sinc.pendentes} alteração(ões) que ainda não chegaram à sua conta. Se apagar a cópia deste aparelho agora, elas se perdem.`
            : 'Você pode entrar de novo com um código enviado ao seu e-mail.'
        }
        confirmar={apagarCopia ? 'Sair e apagar deste aparelho' : 'Sair'}
        onCancelar={() => setConfirmando(null)}
        onConfirmar={() => {
          setConfirmando(null)
          void conta.sair(apagarCopia)
        }}
        extra={
          <label className="mt-4 flex min-h-12 items-center gap-3 text-[0.9375rem] text-texto">
            <input type="checkbox" checked={apagarCopia} onChange={(e) => setApagarCopia(e.target.checked)} className="size-5 accent-verde" />
            Apagar a cópia deste aparelho (aparelho compartilhado)
          </label>
        }
      />
    </div>
  )
}
