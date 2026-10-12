import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { useAviso } from '../components/Aviso'
import { Miniatura } from '../components/Miniatura'
import { botaoIcone, botaoPrimario, margem } from '../components/ui'
import { IconeAbaixo, IconeAcima, IconeCheck, IconeFechar, IconeMais } from '../ilustracoes/icones'
import { Cena } from '../ilustracoes/Cena'
import { acoes, buscarAcao, buscarModelo, NOME_MAX, PASSOS_MAX, PASSOS_MIN } from '../content/combinados'
import type { AcaoId } from '../content/tipos'
import { buscarCombinado, novoIdCombinado, salvarCombinado } from '../armazenamento/armazenamento'

/*
 * Editor de combinado: partir de um modelo (ou do zero), escolher de 2 a 5
 * passos, reordenar com botões, dar um nome opcional e salvar.
 * O id é fixado ao abrir o editor: salvar é um upsert, então toques
 * repetidos em "Salvar" nunca duplicam o combinado.
 */
export function EditorCombinado() {
  const { combinadoId } = useParams()
  const [busca] = useSearchParams()
  const existente = combinadoId ? buscarCombinado(combinadoId) : undefined
  const modelo = existente ? buscarModelo(existente.modeloId) : buscarModelo(busca.get('modelo'))

  const [id] = useState(() => existente?.id ?? novoIdCombinado())
  const [passos, setPassos] = useState<AcaoId[]>(() => existente?.passos ?? modelo?.passos ?? [])
  const [nome, setNome] = useState(() => existente?.nome ?? '')
  const salvando = useRef(false)
  const navegar = useNavigate()
  const avisar = useAviso()

  if (combinadoId && !existente) return <Navigate to="/preparar" replace />

  const cheio = passos.length >= PASSOS_MAX
  const falta = Math.max(0, PASSOS_MIN - passos.length)
  const pronto = falta === 0
  const sair = existente ? `/preparar/${existente.id}` : '/preparar'

  function alternar(acao: AcaoId) {
    setPassos((p) => (p.includes(acao) ? p.filter((x) => x !== acao) : p.length >= PASSOS_MAX ? p : [...p, acao]))
  }
  function mover(i: number, delta: -1 | 1) {
    setPassos((p) => {
      const j = i + delta
      if (j < 0 || j >= p.length) return p
      const novo = [...p]
      ;[novo[i], novo[j]] = [novo[j], novo[i]]
      return novo
    })
  }
  function salvar() {
    if (!pronto || salvando.current) return
    salvando.current = true
    salvarCombinado({ id, nome, modeloId: modelo?.id ?? null, passos })
    avisar(existente ? 'Combinado atualizado' : 'Combinado salvo')
    navegar(`/preparar/${id}`, { replace: true })
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
        fecharPara={sair}
        rotuloFechar="Fechar sem salvar"
        titulo={existente ? 'Editar combinado' : modelo ? `Modelo: ${modelo.titulo}` : 'Novo combinado'}
      />

      <main className={`${margem} flex-1 pb-6`}>
        <h1 className="font-display text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.01em] text-verde-profundo">
          {existente ? 'Ajuste o combinado' : 'Monte o combinado'}
        </h1>

        <section aria-labelledby="ed-passos" className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="ed-passos" className="text-[1.125rem] font-semibold text-texto">
              Passos, na ordem
            </h2>
            <p className="text-[0.875rem] text-texto-2" aria-live="polite">
              {passos.length} de {PASSOS_MAX}
            </p>
          </div>

          {passos.length === 0 ? (
            <p className="mt-3 rounded-[var(--radius-cartao)] border border-dashed border-texto-2/50 px-4 py-5 text-center text-texto-2">
              Escolha os passos logo abaixo.
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {passos.map((p, i) => {
                const acao = buscarAcao(p)!
                return (
                  <li key={p} className="flex items-start gap-3 rounded-[var(--radius-cartao)] border border-linha bg-white py-2.5 pl-2.5 pr-1">
                    <span className="relative">
                      <Miniatura id={acao.cena} />
                      <span className="absolute -left-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-verde-profundo text-[0.8125rem] font-bold text-white">
                        {i + 1}
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                    <span className="pt-1 font-semibold leading-tight text-texto">{acao.rotulo}</span>
                    <span className="-ml-3 mt-0.5 flex">
                      <button
                        type="button"
                        className={`${botaoIcone} disabled:opacity-30`}
                        disabled={i === 0}
                        aria-label={`Mover ${acao.rotulo} para cima`}
                        onClick={() => mover(i, -1)}
                      >
                        <IconeAcima />
                      </button>
                      <button
                        type="button"
                        className={`${botaoIcone} disabled:opacity-30`}
                        disabled={i === passos.length - 1}
                        aria-label={`Mover ${acao.rotulo} para baixo`}
                        onClick={() => mover(i, 1)}
                      >
                        <IconeAbaixo />
                      </button>
                      <button type="button" className={botaoIcone} aria-label={`Tirar ${acao.rotulo}`} onClick={() => alternar(p)}>
                        <IconeFechar />
                      </button>
                    </span>
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <section aria-labelledby="ed-catalogo" className="mt-7">
          <h2 id="ed-catalogo" className="text-[1.125rem] font-semibold text-texto">
            Escolha os passos
          </h2>
          {cheio && <p className="mt-1 text-[0.9375rem] text-texto-2">Já tem {PASSOS_MAX} passos. Tire um para trocar.</p>}
          <ul className="mt-3 grid grid-cols-2 gap-2.5">
            {acoes.map((a) => {
              const escolhido = passos.includes(a.id)
              const bloqueado = !escolhido && cheio
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    aria-pressed={escolhido}
                    disabled={bloqueado}
                    onClick={() => alternar(a.id)}
                    className={`tocavel relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-cartao)] border-2 text-left disabled:opacity-45 ${
                      escolhido ? 'border-verde bg-verde-claro' : 'border-linha bg-white hover:border-verde/60'
                    }`}
                  >
                    <span aria-hidden="true" className={`block ${escolhido ? 'bg-verde-claro' : 'bg-bege'}`}>
                      <Cena id={a.cena} className="mx-auto block aspect-[4/3] w-full max-w-36" />
                    </span>
                    <span className="flex min-h-12 flex-1 items-center gap-2 px-3 py-2 text-[0.9375rem] font-semibold leading-tight text-texto">
                      <span className="flex-1">{a.rotulo}</span>
                      <span
                        aria-hidden="true"
                        className={`grid size-7 shrink-0 place-items-center rounded-full ${escolhido ? 'bg-verde text-white' : 'border-2 border-texto-2 text-texto-2'}`}
                      >
                        {escolhido ? <IconeCheck /> : <IconeMais />}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <div className="mt-7">
          <label htmlFor="nome-combinado" className="text-[1.0625rem] font-semibold text-texto">
            Nome <span className="font-normal text-texto-2">(opcional)</span>
          </label>
          <input
            id="nome-combinado"
            type="text"
            maxLength={NOME_MAX}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={modelo?.titulo ?? 'Nosso combinado'}
            autoComplete="off"
            className="mt-2 block min-h-12 w-full rounded-[var(--radius-controle)] border border-linha bg-white px-4 text-[1.0625rem] text-texto placeholder:text-texto-2 focus:border-verde focus:outline-none focus-visible:outline-3 focus-visible:outline-coral"
          />
        </div>
      </main>

      <div className={`sticky bottom-0 z-10 border-t border-linha bg-creme ${margem} pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3`}>
        <p id="ed-status" className={`mb-2 text-center text-[0.9375rem] ${pronto ? 'text-texto-2' : 'font-semibold text-coral-texto'}`} aria-live="polite">
          {pronto
            ? `Pronto para salvar · ${passos.length} passos`
            : falta === PASSOS_MIN
              ? `Escolha pelo menos ${PASSOS_MIN} passos para salvar.`
              : 'Falta escolher mais 1 passo para salvar.'}
        </p>
        <button type="submit" className={botaoPrimario} disabled={!pronto} aria-describedby="ed-status">
          {existente ? 'Salvar alterações' : 'Salvar combinado'}
        </button>
      </div>
    </form>
  )
}
