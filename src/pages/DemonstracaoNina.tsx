import { Navigate } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { margem } from '../components/ui'
import { useConta } from '../conta/Conta'

/*
 * Só na demonstração: como a passagem para a Nina funciona na versão integrada.
 * Nada aqui abre a Nina, cria conta ou inicia teste.
 */
const PASSOS = [
  'Em Conta, "Conhecer a Nina" abre a Nina em outra aba. É o único lugar do Acalma com esse convite: ele não aparece na ajuda da hora da birra, no modo de mostrar à criança nem na tela de segurança.',
  'Na Nina, você entra com o mesmo e-mail, pelo link enviado a ele. Não precisa criar senha. A sessão do Acalma não é levada para lá.',
  'A Nina mostra a proposta. Visitar não inicia nada.',
  'Só ao tocar em "Iniciar meus 7 dias na Nina", e depois de aceitar os termos da Nina, o teste começa. Quem já usou o teste vê os planos; quem já assina entra direto.',
  'Combinados, registros e anotações do Acalma não vão para a Nina.',
]

export function DemonstracaoNina() {
  const conta = useConta()
  if (conta.modo !== 'demonstracao') return <Navigate to="/conta" replace />
  return (
    <div className="entrada min-h-dvh">
      <p className="bg-verde-profundo px-6 py-2 text-center text-[0.8125rem] font-semibold text-white">Simulação: nada é aberto nem iniciado</p>
      <BarraTopo voltarPara="/conta" rotuloVoltar="Voltar à conta" />
      <main className={`${margem} pb-12`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.15] text-verde-profundo">Conhecer a Nina</h1>
        <ol className="mt-5 list-decimal space-y-3 pl-5 leading-relaxed text-texto-2">
          {PASSOS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </main>
    </div>
  )
}
