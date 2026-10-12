import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { useAviso } from '../components/Aviso'
import { botaoPrimario, botaoTexto, margem } from '../components/ui'
import { Ilustracao } from '../ilustracoes/Ilustracao'
import { buscarSituacao } from '../content/situacoes'
import { ANOTACAO_MAX, adicionarRegistro, respostas, type Resposta } from '../armazenamento/armazenamento'
import { dataHoraCurta } from '../util/datas'

export function Registro() {
  const { situacaoId } = useParams()
  const situacao = buscarSituacao(situacaoId)
  const navegar = useNavigate()
  const avisar = useAviso()
  const [resposta, setResposta] = useState<Resposta | null>(null)
  const [anotacao, setAnotacao] = useState('')
  const [agora] = useState(() => new Date())

  if (!situacao) return <Navigate to="/agora" replace />

  function salvar() {
    if (!situacao || !resposta) return
    adicionarRegistro({ situacaoId: situacao.id, resposta, anotacao }, agora)
    avisar('Registro guardado')
    navegar('/salvos?aba=registros', { replace: true })
  }

  return (
    <form
      className="entrada flex min-h-dvh flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        salvar()
      }}
    >
      <BarraTopo
        voltarPara={`/agora/${situacao.id}`}
        rotuloVoltar="Voltar à orientação sem salvar"
        fecharPara="/"
        rotuloFechar="Fechar sem salvar e ir para o início"
      />

      <main className={`${margem} flex-1 pb-6`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.15] tracking-[-0.01em] text-verde-profundo">
          Quer guardar como foi?
        </h1>
        <p className="mt-3 flex items-center gap-2.5 text-texto-2">
          <Ilustracao id={situacao.ilustracao} tamanho={28} />
          <span>
            <span className="font-semibold text-texto">{situacao.titulo}</span> · {dataHoraCurta(agora)}
          </span>
        </p>

        <fieldset className="mt-7">
          <legend className="text-[1.125rem] font-semibold text-texto">Essa orientação ajudou?</legend>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {respostas.map((r) => {
              const marcado = resposta === r.id
              return (
                <label
                  key={r.id}
                  className={`tocavel relative flex min-h-14 cursor-pointer items-center gap-2.5 rounded-[var(--radius-controle)] border px-3.5 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-coral ${
                    marcado ? 'border-verde bg-verde-claro font-semibold text-verde-profundo' : 'border-linha bg-creme text-texto'
                  }`}
                >
                  <input
                    type="radio"
                    name="resposta"
                    value={r.id}
                    checked={marcado}
                    onChange={() => setResposta(r.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${marcado ? 'border-verde' : 'border-texto-2'}`}
                  >
                    {marcado && <span className="size-2.5 rounded-full bg-verde" />}
                  </span>
                  <span className="leading-tight">{r.rotulo}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-7">
          <label htmlFor="anotacao" className="text-[1.0625rem] font-semibold text-texto">
            Anotação <span className="font-normal text-texto-2">(opcional)</span>
          </label>
          <textarea
            id="anotacao"
            rows={3}
            maxLength={ANOTACAO_MAX}
            value={anotacao}
            onChange={(e) => setAnotacao(e.target.value)}
            aria-describedby="anotacao-ajuda"
            placeholder="O que você quer lembrar?"
            className="mt-2 block w-full resize-none rounded-[var(--radius-controle)] border border-linha bg-white px-4 py-3 text-[1.0625rem] leading-relaxed text-texto placeholder:text-texto-2/80 focus:border-verde focus:outline-none focus-visible:outline-3 focus-visible:outline-coral"
          />
          <p id="anotacao-ajuda" className="mt-1.5 text-right text-[0.8125rem] text-texto-2">
            {anotacao.length}/{ANOTACAO_MAX}
          </p>
        </div>
      </main>

      <div className={`sticky bottom-0 border-t border-linha bg-creme ${margem} pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3`}>
        <button type="submit" className={botaoPrimario} disabled={!resposta} aria-describedby={resposta ? undefined : 'dica-salvar'}>
          Salvar
        </button>
        {!resposta && (
          <p id="dica-salvar" className="sr-only">
            Escolha uma resposta para salvar.
          </p>
        )}
        <button type="button" className={`${botaoTexto} mt-1 w-full text-texto-2`} onClick={() => navegar(`/agora/${situacao.id}`)}>
          Sair sem salvar
        </button>
      </div>
    </form>
  )
}
