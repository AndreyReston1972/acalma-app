import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAviso } from '../components/Aviso'
import { Confirmacao } from '../components/Confirmacao'
import { Faixa, Miniatura } from '../components/Miniatura'
import { botaoDestrutivo, botaoTexto, linhaLista, margem } from '../components/ui'
import { IconeAbaixo, IconeAvancar, IconeLixeira } from '../ilustracoes/icones'
import { Cena, type CenaId } from '../ilustracoes/Cena'
import { buscarCaminho, buscarSituacao } from '../content/situacoes'
import { buscarAcao } from '../content/combinados'
import type { SituacaoId } from '../content/tipos'
import { useEstado } from '../armazenamento/useEstado'
import { excluirRegistro, respostas, type Registro } from '../armazenamento/armazenamento'
import { dataHoraCurta } from '../util/datas'
import { nomeDoCombinado } from '../util/combinados'

type Aba = 'combinados' | 'orientacoes' | 'registros'
const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'combinados', rotulo: 'Combinados' },
  { id: 'orientacoes', rotulo: 'Orientações' },
  { id: 'registros', rotulo: 'Registros' },
]

const rotaOrientacao = (s: SituacaoId, c: string | null) => `/agora/${s}${c ? `/${c}` : ''}`

export function Salvos() {
  const estado = useEstado()
  const [busca, setBusca] = useSearchParams()
  const pedida = busca.get('aba') as Aba | null
  const aba: Aba = ABAS.some((a) => a.id === pedida) ? pedida! : 'combinados'
  const totais: Record<Aba, number> = {
    combinados: estado.combinados.length,
    orientacoes: estado.favoritos.length,
    registros: estado.registros.length,
  }
  const refs = useRef<Partial<Record<Aba, HTMLButtonElement | null>>>({})

  function escolher(a: Aba, focar = false) {
    setBusca(a === 'combinados' ? {} : { aba: a }, { replace: true })
    if (focar) refs.current[a]?.focus()
  }
  function teclas(e: KeyboardEvent) {
    const i = ABAS.findIndex((a) => a.id === aba)
    if (e.key === 'ArrowRight') escolher(ABAS[(i + 1) % ABAS.length].id, true)
    if (e.key === 'ArrowLeft') escolher(ABAS[(i + ABAS.length - 1) % ABAS.length].id, true)
  }

  return (
    <div className="entrada">
      <main className={`${margem} pt-[calc(env(safe-area-inset-top)+1.75rem)]`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.12] tracking-[-0.015em] text-verde-profundo">
          Salvos
        </h1>

        <div role="tablist" aria-label="O que você guardou" className="mt-5 grid grid-cols-3 border-b border-linha" onKeyDown={teclas}>
          {ABAS.map((a) => {
            const ativa = a.id === aba
            return (
              <button
                key={a.id}
                ref={(el) => {
                  refs.current[a.id] = el
                }}
                type="button"
                role="tab"
                id={`aba-${a.id}`}
                aria-selected={ativa}
                aria-controls={`painel-${a.id}`}
                tabIndex={ativa ? 0 : -1}
                onClick={() => escolher(a.id)}
                className={`tocavel relative -mb-px flex min-h-12 flex-col items-center justify-center border-b-[3px] px-1 text-[0.9375rem] leading-tight ${
                  ativa ? 'border-verde font-bold text-verde-profundo' : 'border-transparent font-medium text-texto-2'
                }`}
              >
                {a.rotulo}
                <span className="text-[0.75rem] font-medium text-texto-2">{totais[a.id] > 0 ? totais[a.id] : '—'}</span>
              </button>
            )
          })}
        </div>

        <section role="tabpanel" id={`painel-${aba}`} aria-labelledby={`aba-${aba}`} className="pt-3">
          {aba === 'combinados' && <ListaCombinados />}
          {aba === 'orientacoes' && <ListaOrientacoes />}
          {aba === 'registros' && <ListaRegistros registros={estado.registros} />}
        </section>
      </main>
    </div>
  )
}

function Vazio({ cena, texto, acao }: { cena: CenaId; texto: string; acao?: { para: string; rotulo: string } }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <span className="block w-44 overflow-hidden rounded-[24px] bg-bege">
        <Cena id={cena} className="block aspect-[4/3] w-full" />
      </span>
      <p className="mt-5 max-w-[28ch] text-texto-2">{texto}</p>
      {acao && (
        <Link to={acao.para} className={`${botaoTexto} mt-1`}>
          {acao.rotulo}
        </Link>
      )}
    </div>
  )
}

function ListaCombinados() {
  const { combinados } = useEstado()
  if (combinados.length === 0) {
    return (
      <Vazio
        cena="vazio-combinados"
        texto="Os combinados que você montar ficam aqui, prontos para mostrar de novo."
        acao={{ para: '/preparar', rotulo: 'Montar um combinado' }}
      />
    )
  }
  return (
    <ul className="divide-y divide-linha">
      {combinados.map((c) => (
        <li key={c.id} className="flex items-center gap-1">
          <Link to={`/preparar/${c.id}`} className={`${linhaLista} min-w-0 flex-1`}>
            <Faixa cenas={c.passos.slice(0, 3).map((p) => buscarAcao(p)!.cena)} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-texto">{nomeDoCombinado(c)}</span>
              <span className="block text-[0.875rem] text-texto-2">{c.passos.length} passos</span>
            </span>
          </Link>
          <Link
            to={`/preparar/${c.id}/mostrar`}
            aria-label={`Mostrar ${nomeDoCombinado(c)}`}
            className="tocavel inline-flex min-h-12 shrink-0 items-center rounded-[var(--radius-controle)] px-3 font-semibold text-verde-profundo hover:bg-bege active:bg-bege-forte"
          >
            Mostrar
          </Link>
        </li>
      ))}
    </ul>
  )
}

function LinhaOrientacao({ situacaoId, caminhoId }: { situacaoId: SituacaoId; caminhoId: string | null }) {
  const s = buscarSituacao(situacaoId)
  const c = buscarCaminho(s, caminhoId)
  if (!s) return null
  return (
    <Link to={rotaOrientacao(s.id, c?.id ?? null)} className={linhaLista}>
      <Miniatura id={s.cena} />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-tight text-texto">{s.titulo}</span>
        <span className="block truncate text-[0.875rem] text-texto-2">{c ? c.rotulo : 'Primeira orientação'}</span>
      </span>
      <span className="text-texto-2"><IconeAvancar /></span>
    </Link>
  )
}

function ListaOrientacoes() {
  const { favoritos, registros } = useEstado()
  // "O que ajudou por aqui": só o que a própria pessoa marcou como "Ajudou"
  const vistos = new Set<string>()
  const ajudaram = registros
    .filter((r) => r.resposta === 'ajudou')
    .filter((r) => {
      const k = `${r.situacaoId}/${r.caminhoId ?? ''}`
      if (vistos.has(k)) return false
      vistos.add(k)
      return true
    })

  if (favoritos.length === 0 && ajudaram.length === 0) {
    return <Vazio cena="vazio-favoritos" texto="Toque no marcador de uma orientação para guardá-la aqui." />
  }

  return (
    <>
      <section aria-labelledby="sv-salvas">
        <h2 id="sv-salvas" className="rotulo mt-1">Salvas por você</h2>
        {favoritos.length === 0 ? (
          <p className="mt-2 text-[0.9375rem] text-texto-2">Nenhuma ainda. Use o marcador no topo de uma orientação.</p>
        ) : (
          <ul className="mt-1 divide-y divide-linha">
            {favoritos.map((f) => (
              <li key={`${f.situacaoId}/${f.caminhoId ?? ''}`}>
                <LinhaOrientacao situacaoId={f.situacaoId} caminhoId={f.caminhoId} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {ajudaram.length > 0 && (
        <section aria-labelledby="sv-ajudou" className="mt-7">
          <h2 id="sv-ajudou" className="rotulo">O que ajudou por aqui</h2>
          <p className="mt-1 text-[0.875rem] text-texto-2">Orientações que você marcou como “Ajudou” nos seus registros. Salvar e ajudar são coisas diferentes.</p>
          <ul className="mt-1 divide-y divide-linha">
            {ajudaram.map((r) => (
              <li key={r.id}>
                <LinhaOrientacao situacaoId={r.situacaoId} caminhoId={r.caminhoId} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function ListaRegistros({ registros }: { registros: Registro[] }) {
  const avisar = useAviso()
  const [excluindo, setExcluindo] = useState<Registro | null>(null)

  if (registros.length === 0) {
    return <Vazio cena="vazio-registros" texto="Depois de uma orientação, você pode guardar como foi. Só se quiser." />
  }

  return (
    <>
      <p className="text-[0.875rem] text-texto-2">Ficam só neste navegador.</p>
      <ul className="mt-1 divide-y divide-linha">
        {registros.map((r) => (
          <ItemRegistro key={r.id} registro={r} onExcluir={() => setExcluindo(r)} />
        ))}
      </ul>
      <Confirmacao
        aberto={!!excluindo}
        titulo="Excluir este registro?"
        texto="Ele sai deste aparelho e não dá para desfazer."
        confirmar="Excluir registro"
        onCancelar={() => setExcluindo(null)}
        onConfirmar={() => {
          if (excluindo) excluirRegistro(excluindo.id)
          setExcluindo(null)
          avisar('Registro excluído')
        }}
      />
    </>
  )
}

function ItemRegistro({ registro, onExcluir }: { registro: Registro; onExcluir: () => void }) {
  const [aberto, setAberto] = useState(false)
  const id = useId()
  const s = buscarSituacao(registro.situacaoId)
  const c = buscarCaminho(s, registro.caminhoId)
  const resposta = respostas.find((x) => x.id === registro.resposta)?.rotulo
  if (!s) return null
  return (
    <li>
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => setAberto((a) => !a)}
        className="tocavel -mx-2 flex min-h-[4.5rem] w-[calc(100%+1rem)] items-center gap-4 rounded-[var(--radius-controle)] px-2 py-2.5 text-left hover:bg-bege"
      >
        <Miniatura id={s.cena} />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-tight text-texto">
            {s.titulo}
            {c && <span className="font-medium text-texto-2"> · {c.rotulo}</span>}
          </span>
          <span className="block text-[0.875rem] text-texto-2">
            {dataHoraCurta(new Date(registro.criadoEm))} · {resposta}
          </span>
        </span>
        <span className={`text-texto-2 transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}>
          <IconeAbaixo />
        </span>
      </button>
      <div id={id} hidden={!aberto} className="pb-4 pl-20">
        {registro.anotacao ? (
          <p className="whitespace-pre-wrap leading-relaxed text-texto">{registro.anotacao}</p>
        ) : (
          <p className="text-texto-2">Sem anotação.</p>
        )}
        <div className="mt-2 flex flex-wrap gap-x-1">
          <Link to={rotaOrientacao(s.id, c?.id ?? null)} className={`${botaoTexto} -ml-4`}>
            Abrir orientação
          </Link>
          <button type="button" onClick={onExcluir} className={botaoDestrutivo}>
            <IconeLixeira />
            Excluir
          </button>
        </div>
      </div>
    </li>
  )
}
