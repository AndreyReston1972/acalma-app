import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAviso } from '../components/Aviso'
import { Confirmacao } from '../components/Confirmacao'
import { botaoTexto, margem } from '../components/ui'
import { IconeAbaixo, IconeAvancar, IconeLixeira } from '../ilustracoes/icones'
import { Ilustracao, type IlustracaoId } from '../ilustracoes/Ilustracao'
import { buscarSituacao } from '../content/situacoes'
import { useEstado } from '../armazenamento/useEstado'
import { excluirRegistro, respostas, type Registro } from '../armazenamento/armazenamento'
import { dataHoraCurta } from '../util/datas'

type Aba = 'orientacoes' | 'registros'

export function Salvos() {
  const { favoritos, registros } = useEstado()
  const [busca, setBusca] = useSearchParams()
  const aba: Aba = busca.get('aba') === 'registros' ? 'registros' : 'orientacoes'
  const abas: { id: Aba; rotulo: string; total: number }[] = [
    { id: 'orientacoes', rotulo: 'Orientações', total: favoritos.length },
    { id: 'registros', rotulo: 'Registros', total: registros.length },
  ]
  const refs = useRef<Record<Aba, HTMLButtonElement | null>>({ orientacoes: null, registros: null })

  function escolher(a: Aba, focar = false) {
    setBusca(a === 'registros' ? { aba: 'registros' } : {}, { replace: true })
    if (focar) refs.current[a]?.focus()
  }

  function teclas(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      escolher(aba === 'orientacoes' ? 'registros' : 'orientacoes', true)
    }
  }

  return (
    <div className="entrada">
      <main className={`${margem} pt-[calc(env(safe-area-inset-top)+2rem)]`}>
        <h1 className="font-display text-[2rem] font-semibold leading-[1.12] tracking-[-0.015em] text-verde-profundo">
          Salvos
        </h1>

        <div role="tablist" aria-label="Tipo de conteúdo salvo" className="mt-6 flex border-b border-linha" onKeyDown={teclas}>
          {abas.map((a) => {
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
                className={`tocavel relative -mb-px min-h-12 flex-1 border-b-[3px] text-[1rem] ${
                  ativa ? 'border-verde font-bold text-verde-profundo' : 'border-transparent font-medium text-texto-2'
                }`}
              >
                {a.rotulo}
                {a.total > 0 && <span className="ml-1.5 font-medium text-texto-2">{a.total}</span>}
              </button>
            )
          })}
        </div>

        <section role="tabpanel" id={`painel-${aba}`} aria-labelledby={`aba-${aba}`} className="pt-2">
          {aba === 'orientacoes' ? <ListaFavoritos /> : <ListaRegistros registros={registros} />}
        </section>
      </main>
    </div>
  )
}

function Vazio({ ilustracao, texto }: { ilustracao: IlustracaoId; texto: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      <span className="grid size-24 place-items-center rounded-full bg-bege">
        <Ilustracao id={ilustracao} tamanho={56} />
      </span>
      <p className="mt-5 max-w-[26ch] text-texto-2">{texto}</p>
    </div>
  )
}

function ListaFavoritos() {
  const { favoritos } = useEstado()
  if (favoritos.length === 0) {
    return <Vazio ilustracao="marcador" texto="As orientações que você salvar aparecem aqui." />
  }
  return (
    <ul className="divide-y divide-linha">
      {favoritos.map((f) => {
        const s = buscarSituacao(f.situacaoId)
        if (!s) return null
        return (
          <li key={f.situacaoId}>
            <Link
              to={`/agora/${s.id}`}
              className="tocavel -mx-2 flex min-h-[4.5rem] items-center gap-4 rounded-[var(--radius-controle)] px-2 py-3 hover:bg-bege active:bg-bege"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-bege">
                <Ilustracao id={s.ilustracao} tamanho={36} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-texto">{s.titulo}</span>
                <span className="block truncate text-[0.9375rem] text-texto-2">{s.frase}</span>
              </span>
              <span className="text-texto-2"><IconeAvancar /></span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function ListaRegistros({ registros }: { registros: Registro[] }) {
  const avisar = useAviso()
  const [excluindo, setExcluindo] = useState<Registro | null>(null)

  if (registros.length === 0) {
    return <Vazio ilustracao="caderno" texto="Depois de uma orientação, você pode guardar como foi. Só se quiser." />
  }

  return (
    <>
      <ul className="divide-y divide-linha">
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
  const resposta = respostas.find((x) => x.id === registro.resposta)?.rotulo
  if (!s) return null
  return (
    <li>
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => setAberto((a) => !a)}
        className="tocavel -mx-2 flex min-h-[4.5rem] w-[calc(100%+1rem)] items-center gap-4 rounded-[var(--radius-controle)] px-2 py-3 text-left hover:bg-bege"
      >
        <Ilustracao id={s.ilustracao} tamanho={36} />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-texto">{s.titulo}</span>
          <span className="block text-[0.9375rem] text-texto-2">
            {dataHoraCurta(new Date(registro.criadoEm))} · {resposta}
          </span>
        </span>
        <span className={`text-texto-2 transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}>
          <IconeAbaixo />
        </span>
      </button>
      <div id={id} hidden={!aberto} className="pb-4 pl-[3.25rem]">
        {registro.anotacao ? (
          <p className="whitespace-pre-wrap leading-relaxed text-texto">{registro.anotacao}</p>
        ) : (
          <p className="text-texto-2">Sem anotação.</p>
        )}
        <div className="mt-2 flex flex-wrap gap-x-2">
          <Link to={`/agora/${s.id}`} className={`${botaoTexto} -ml-4`}>
            Abrir orientação
          </Link>
          <button type="button" onClick={onExcluir} className={`${botaoTexto} text-coral-texto`}>
            <IconeLixeira />
            Excluir
          </button>
        </div>
      </div>
    </li>
  )
}
