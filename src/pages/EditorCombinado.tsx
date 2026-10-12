import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { useAviso } from '../components/Aviso'
import { CatalogoPassos } from '../components/CatalogoPassos'
import { Miniatura } from '../components/Miniatura'
import { botaoIcone, botaoPrimario, margem } from '../components/ui'
import { IconeAbaixo, IconeAcima, IconeFechar, IconeMais } from '../ilustracoes/icones'
import { buscarAcao, buscarModelo, NOME_MAX, PASSOS_MAX, PASSOS_MIN } from '../content/combinados'
import type { AcaoId } from '../content/tipos'
import { buscarCombinado, novoIdCombinado, salvarCombinado } from '../armazenamento/armazenamento'
import { buscarSituacao } from '../content/situacoes'

/*
 * Editor de combinado. A tela principal tem só o nome, a sequência e o
 * salvar; o catálogo abre sob demanda (CatalogoPassos). Todo o trabalho fica
 * no estado do editor, então fechar o catálogo nunca perde nada.
 * O id é fixado ao abrir: salvar é um upsert e toques repetidos não duplicam.
 */
export function EditorCombinado() {
  const { combinadoId } = useParams()
  const [busca] = useSearchParams()
  const existente = combinadoId ? buscarCombinado(combinadoId) : undefined
  const modelo = existente ? buscarModelo(existente.modeloId) : buscarModelo(busca.get('modelo'))

  const [id] = useState(() => existente?.id ?? novoIdCombinado())
  const [passos, setPassos] = useState<AcaoId[]>(() => existente?.passos ?? modelo?.passos ?? [])
  const [nome, setNome] = useState(() => existente?.nome ?? '')
  const [catalogo, setCatalogo] = useState(false)
  const [recente, setRecente] = useState<AcaoId | null>(null)
  const salvando = useRef(false)
  const navegar = useNavigate()
  const avisar = useAviso()

  if (combinadoId && !existente) return <Navigate to="/preparar" replace />

  const cheio = passos.length >= PASSOS_MAX
  const falta = Math.max(0, PASSOS_MIN - passos.length)
  const pronto = falta === 0
  // Aberto a partir de uma orientação: fechar volta para ela.
  const origem = buscarSituacao(busca.get('de') ?? undefined)
  const sair = existente ? `/preparar/${existente.id}` : origem ? `/agora/${origem.id}` : '/preparar'

  function adicionar(acao: AcaoId) {
    setPassos((p) => (p.includes(acao) || p.length >= PASSOS_MAX ? p : [...p, acao]))
    setRecente(acao)
    setCatalogo(false)
  }
  function tirar(acao: AcaoId) {
    setPassos((p) => p.filter((x) => x !== acao))
    setRecente(null)
  }
  function mover(i: number, delta: -1 | 1) {
    setRecente(null)
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
    avisar(existente ? 'Combinado atualizado' : 'Combinado salvo', `/preparar/${id}`)
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
        rotuloFechar={origem ? `Fechar sem salvar e voltar a ${origem.titulo}` : 'Fechar sem salvar'}
        titulo={existente ? 'Editar combinado' : origem ? `Para: ${origem.titulo}` : modelo ? `Modelo: ${modelo.titulo}` : 'Novo combinado'}
      />

      <main className={`${margem} flex-1 pb-6`}>
        <h1 className="font-display text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.01em] text-verde-profundo">
          {existente ? 'Ajuste o combinado' : 'Monte o combinado'}
        </h1>

        <div className="mt-5">
          <label htmlFor="nome-combinado" className="text-[1rem] font-semibold text-texto">
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
            enterKeyHint="done"
            className="mt-2 block min-h-12 w-full rounded-[var(--radius-controle)] border border-linha bg-white px-4 text-[1.0625rem] text-texto placeholder:text-texto-2 focus:border-verde focus:outline-none focus-visible:outline-3 focus-visible:outline-coral"
          />
        </div>

        <section aria-labelledby="ed-passos" className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="ed-passos" className="text-[1rem] font-semibold text-texto">
              Passos, na ordem
            </h2>
            <p className="text-[0.875rem] text-texto-2">
              {passos.length} de {PASSOS_MAX}
            </p>
          </div>

          {passos.length > 0 && (
            <ol className="mt-2.5 space-y-2">
              {passos.map((p, i) => {
                const acao = buscarAcao(p)!
                const novo = p === recente
                return (
                  <li
                    key={p}
                    className={`flex items-start gap-3 rounded-[var(--radius-cartao)] border bg-white py-2.5 pl-2.5 pr-1 transition-colors ${
                      novo ? 'border-verde ring-2 ring-verde/25' : 'border-linha'
                    }`}
                  >
                    <span className="relative">
                      <Miniatura id={acao.cena} />
                      <span className="absolute -left-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-verde-profundo text-[0.8125rem] font-bold text-white">
                        {i + 1}
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-2 pt-1">
                        <span className="font-semibold leading-tight text-texto">{acao.rotulo}</span>
                        {novo && <span className="rounded-full bg-verde-claro px-2 py-0.5 text-[0.75rem] font-semibold text-verde-profundo">Adicionado</span>}
                      </span>
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
                        <button type="button" className={botaoIcone} aria-label={`Tirar ${acao.rotulo}`} onClick={() => tirar(p)}>
                          <IconeFechar />
                        </button>
                      </span>
                    </span>
                  </li>
                )
              })}
            </ol>
          )}

          <button
            type="button"
            disabled={cheio}
            onClick={() => setCatalogo(true)}
            aria-describedby={cheio ? 'ed-limite' : undefined}
            className="tocavel mt-2.5 flex min-h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-cartao)] border-2 border-dashed border-verde/50 font-semibold text-verde-profundo hover:bg-bege active:bg-bege-forte disabled:border-linha disabled:text-texto-2"
          >
            <IconeMais />
            Adicionar passo
          </button>
          {cheio && (
            <p id="ed-limite" className="mt-2 text-center text-[0.875rem] text-texto-2">
              Um combinado tem até {PASSOS_MAX} passos. Tire um para trocar.
            </p>
          )}
          <p className="sr-only" aria-live="polite">
            {recente ? `Adicionado: ${buscarAcao(recente)!.rotulo}. ${passos.length} de ${PASSOS_MAX} passos.` : ''}
          </p>
        </section>
      </main>

      <div className={`sticky bottom-0 z-10 border-t border-linha bg-creme ${margem} pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3`}>
        <p id="ed-status" className={`mb-2 text-center text-[0.9375rem] ${pronto ? 'text-texto-2' : 'font-semibold text-coral-texto'}`} aria-live="polite">
          {pronto
            ? `Pronto para salvar · ${passos.length} passos`
            : falta === PASSOS_MIN
              ? `Adicione pelo menos ${PASSOS_MIN} passos para salvar.`
              : 'Falta mais 1 passo para salvar.'}
        </p>
        <button type="submit" className={botaoPrimario} disabled={!pronto} aria-describedby="ed-status">
          {existente ? 'Salvar alterações' : 'Salvar combinado'}
        </button>
      </div>

      <CatalogoPassos aberto={catalogo} escolhidos={passos} onEscolher={adicionar} onFechar={() => setCatalogo(false)} />
    </form>
  )
}
