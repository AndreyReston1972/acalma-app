import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { useAviso } from '../components/Aviso'
import { Confirmacao } from '../components/Confirmacao'
import { Miniatura } from '../components/Miniatura'
import { botaoDestrutivo, botaoPrimario, botaoSecundario, margem } from '../components/ui'
import { IconeLapis, IconeLixeira, IconeSeta } from '../ilustracoes/icones'
import { buscarAcao } from '../content/combinados'
import { excluirCombinado } from '../armazenamento/armazenamento'
import { useEstado } from '../armazenamento/useEstado'
import { nomeDoCombinado } from '../util/combinados'

export function DetalheCombinado() {
  const { combinadoId } = useParams()
  const { combinados } = useEstado()
  const combinado = combinados.find((c) => c.id === combinadoId)
  const [excluindo, setExcluindo] = useState(false)
  const navegar = useNavigate()
  const avisar = useAviso()

  if (!combinado) return <Navigate to="/preparar" replace />

  return (
    <div className="entrada flex min-h-dvh flex-col">
      <BarraTopo voltarPara="/preparar" rotuloVoltar="Voltar aos combinados" />
      <main className={`${margem} flex-1 pb-6`}>
        <p className="rotulo">Combinado</p>
        <h1 className="mt-1 font-display text-[1.875rem] font-semibold leading-[1.15] tracking-[-0.01em] text-verde-profundo">
          {nomeDoCombinado(combinado)}
        </h1>

        <ol className="mt-6 space-y-0">
          {combinado.passos.map((p, i) => {
            const a = buscarAcao(p)!
            const ultimo = i === combinado.passos.length - 1
            return (
              <li key={p} className="relative flex items-center gap-4 pb-3">
                {!ultimo && <span aria-hidden="true" className="absolute left-12 top-[4.5rem] h-3 w-0.5 bg-linha" />}
                <Miniatura id={a.cena} tamanho="g" />
                <span>
                  <span className="block text-[0.8125rem] font-semibold text-texto-2">Passo {i + 1}</span>
                  <span className="block text-[1.125rem] font-semibold leading-tight text-texto">{a.rotulo}</span>
                </span>
              </li>
            )
          })}
        </ol>

        <div className="mt-4 flex gap-2">
          <Link to={`/preparar/${combinado.id}/editar`} className={`${botaoSecundario} flex-1`}>
            <IconeLapis />
            Editar
          </Link>
        </div>
        <button type="button" className={`${botaoDestrutivo} -ml-4 mt-3`} onClick={() => setExcluindo(true)}>
          <IconeLixeira />
          Excluir combinado
        </button>
      </main>

      <div className={`sticky bottom-0 border-t border-linha bg-creme ${margem} pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3`}>
        <Link to={`/preparar/${combinado.id}/mostrar`} className={botaoPrimario}>
          Mostrar para a criança
          <IconeSeta />
        </Link>
      </div>

      <Confirmacao
        aberto={excluindo}
        titulo="Excluir este combinado?"
        texto="Ele sai deste aparelho e não dá para desfazer."
        confirmar="Excluir combinado"
        onCancelar={() => setExcluindo(false)}
        onConfirmar={() => {
          excluirCombinado(combinado.id)
          setExcluindo(false)
          avisar('Combinado excluído')
          navegar('/preparar', { replace: true })
        }}
      />
    </div>
  )
}
