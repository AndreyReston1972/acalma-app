import { useState } from 'react'
import { BarraTopo } from '../components/BarraTopo'
import { Confirmacao } from '../components/Confirmacao'
import { useAviso } from '../components/Aviso'
import { botaoSecundario, margem } from '../components/ui'
import { apagarDadosDoPrototipo } from '../armazenamento/armazenamento'

/* Conta: indicação honesta de que login e acesso ainda não existem neste protótipo. */
export function Conta() {
  const [confirmando, setConfirmando] = useState(false)
  const avisar = useAviso()
  return (
    <div className="entrada min-h-dvh">
      <BarraTopo voltarPara="/" rotuloVoltar="Voltar ao início" />
      <main className={`${margem} pb-12`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.15] text-verde-profundo">Conta</h1>

        <section className="mt-6 rounded-[var(--radius-cartao)] bg-bege p-5">
          <h2 className="font-semibold text-texto">Acesso de demonstração</h2>
          <p className="mt-1.5 leading-relaxed text-texto-2">
            Esta é uma versão de avaliação. Ainda não há login nem pagamento: o acesso aparece como já ativado.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="font-semibold text-texto">Conta NexoEdu</h2>
          <p className="mt-1.5 leading-relaxed text-texto-2">
            Em uma próxima etapa, você vai entrar com a mesma conta da Nina. O acesso ao Acalma será separado e não depende de
            assinar a Nina.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="font-semibold text-texto">Seus dados</h2>
          <p className="mt-1.5 leading-relaxed text-texto-2">
            Favoritos e registros ficam só neste aparelho e neste navegador.
          </p>
          <button type="button" className={`${botaoSecundario} mt-4 text-coral-texto`} onClick={() => setConfirmando(true)}>
            Apagar dados deste protótipo
          </button>
        </section>
      </main>
      <Confirmacao
        aberto={confirmando}
        titulo="Apagar favoritos e registros?"
        texto="Apaga o que foi salvo nesta versão de avaliação, neste aparelho. Não dá para desfazer."
        confirmar="Apagar"
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => {
          apagarDadosDoPrototipo()
          setConfirmando(false)
          avisar('Dados do protótipo apagados')
        }}
      />
    </div>
  )
}
