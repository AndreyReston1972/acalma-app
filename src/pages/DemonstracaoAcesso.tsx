import { Link, Navigate, useParams } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { linhaLista, margem } from '../components/ui'
import { IconeAvancar } from '../ilustracoes/icones'
import { TelaAcesso } from './TelaAcesso'
import { useConta } from '../conta/Conta'
import type { Tela } from '../conta/acesso'

/*
 * Só na demonstração (preview): mostra as telas de acesso com o selo de simulação.
 * Nada aqui consulta compra, conta ou rede.
 */
const TELAS: { id: Exclude<Tela, 'entrar'>; rotulo: string }[] = [
  { id: 'processando', rotulo: 'Compra em processamento' },
  { id: 'nao_localizado', rotulo: 'Acesso não localizado' },
  { id: 'revogado', rotulo: 'Acesso encerrado (reembolso)' },
  { id: 'confirmar_online', rotulo: 'Pedir conexão (fora da janela offline)' },
  { id: 'erro_rede', rotulo: 'Erro de rede' },
]

export function DemonstracaoAcesso() {
  const { tela } = useParams()
  const conta = useConta()
  if (conta.modo !== 'demonstracao') return <Navigate to="/" replace />
  const escolhida = TELAS.find((t) => t.id === tela)
  if (escolhida) {
    return (
      <TelaAcesso
        tela={escolhida.id}
        email="exemplo@demonstracao.invalid"
        simulacao
        onTentar={() => new Promise((r) => setTimeout(r, 600))}
        onTrocarEmail={() => {}}
      />
    )
  }
  return (
    <div className="entrada min-h-dvh">
      <BarraTopo voltarPara="/conta" rotuloVoltar="Voltar à conta" />
      <main className={`${margem} pb-10`}>
        <h1 className="font-display text-[1.75rem] font-semibold text-verde-profundo">Telas de acesso</h1>
        <p className="mt-2 text-texto-2">
          Simulações para avaliação. Na versão integrada, estas telas aparecem conforme a situação real da compra.
        </p>
        <ul className="mt-5 divide-y divide-linha border-y border-linha">
          <li>
            <Link to="/demonstracao/entrar" className={linhaLista}>
              <span className="flex-1 font-semibold text-texto">Entrar (e-mail e código)</span>
              <span className="text-texto-2"><IconeAvancar /></span>
            </Link>
          </li>
          {TELAS.map((t) => (
            <li key={t.id}>
              <Link to={`/demonstracao/acesso/${t.id}`} className={linhaLista}>
                <span className="flex-1 font-semibold text-texto">{t.rotulo}</span>
                <span className="text-texto-2"><IconeAvancar /></span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
