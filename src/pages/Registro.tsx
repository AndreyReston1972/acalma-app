import { useId, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { useAviso } from '../components/Aviso'
import { Miniatura } from '../components/Miniatura'
import { botaoPrimario, botaoTexto, margem } from '../components/ui'
import { IconeAbaixo } from '../ilustracoes/icones'
import { buscarCaminho, buscarSituacao } from '../content/situacoes'
import { ANOTACAO_MAX, adicionarRegistro, respostas, type Resposta } from '../armazenamento/armazenamento'
import { dataHoraCurta } from '../util/datas'

/*
 * Registro opcional. A anotação fica recolhida até a pessoa pedir; o texto
 * digitado continua no estado ao recolher e reabrir o campo.
 */
export function Registro() {
  const { situacaoId } = useParams()
  const [busca] = useSearchParams()
  const situacao = buscarSituacao(situacaoId)
  const caminho = buscarCaminho(situacao, busca.get('caminho'))
  const navegar = useNavigate()
  const avisar = useAviso()
  const [resposta, setResposta] = useState<Resposta | null>(null)
  const [anotacao, setAnotacao] = useState('')
  const [comAnotacao, setComAnotacao] = useState(false)
  const [agora] = useState(() => new Date())
  const salvando = useRef(false)
  const idAnotacao = useId()

  if (!situacao) return <Navigate to="/agora" replace />
  const voltar = `/agora/${situacao.id}${caminho ? `/${caminho.id}` : ''}`

  function salvar() {
    if (!situacao || !resposta || salvando.current) return
    salvando.current = true
    adicionarRegistro({ situacaoId: situacao.id, caminhoId: caminho?.id ?? null, resposta, anotacao }, agora)
    avisar('Registro guardado', '/salvos')
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
      <BarraTopo voltarPara={voltar} rotuloVoltar="Voltar à orientação sem salvar" fecharPara="/" rotuloFechar="Fechar sem salvar e ir para o início" />

      <main className={`${margem} flex-1 pb-6`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.15] tracking-[-0.01em] text-verde-profundo">
          Quer guardar como foi?
        </h1>
        <p className="mt-3 flex items-center gap-3 text-texto-2">
          <Miniatura id={situacao.cena} tamanho="p" />
          <span className="leading-snug">
            <span className="font-semibold text-texto">{situacao.titulo}</span>
            {caminho && <span className="text-texto"> · {caminho.rotulo}</span>}
            <span className="block text-[0.9375rem]">{dataHoraCurta(agora)}</span>
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
                    marcado ? 'border-verde bg-verde-claro font-semibold text-verde-profundo' : 'border-linha bg-white text-texto'
                  }`}
                >
                  <input type="radio" name="resposta" value={r.id} checked={marcado} onChange={() => setResposta(r.id)} className="sr-only" />
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

        <div className="mt-5">
          <button
            type="button"
            aria-expanded={comAnotacao}
            aria-controls={idAnotacao}
            onClick={() => setComAnotacao((v) => !v)}
            className={`${botaoTexto} -ml-4`}
          >
            {comAnotacao ? 'Recolher a anotação' : anotacao ? 'Ver a anotação' : 'Adicionar uma anotação'}
            <span className={`transition-transform duration-200 ${comAnotacao ? 'rotate-180' : ''}`}><IconeAbaixo /></span>
          </button>
          <div id={idAnotacao} hidden={!comAnotacao}>
            <label htmlFor="anotacao" className="sr-only">
              Anotação
            </label>
            <textarea
              id="anotacao"
              rows={3}
              maxLength={ANOTACAO_MAX}
              value={anotacao}
              onChange={(e) => setAnotacao(e.target.value)}
              aria-describedby="anotacao-ajuda"
              placeholder="O que você quer lembrar?"
              className="mt-1 block w-full resize-none rounded-[var(--radius-controle)] border border-linha bg-white px-4 py-3 text-[1.0625rem] leading-relaxed text-texto placeholder:text-texto-2 focus:border-verde focus:outline-none focus-visible:outline-3 focus-visible:outline-coral"
            />
            <p id="anotacao-ajuda" className="mt-1.5 text-right text-[0.8125rem] text-texto-2">
              {anotacao.length}/{ANOTACAO_MAX}
            </p>
          </div>
        </div>

        <p className="mt-5 text-[0.875rem] leading-relaxed text-texto-2">
          Nesta versão de avaliação, o registro fica só neste navegador e não é sincronizado.
        </p>
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
        <button type="button" className={`${botaoTexto} mt-1 w-full text-texto-2`} onClick={() => navegar(voltar)}>
          Sair sem salvar
        </button>
      </div>
    </form>
  )
}
