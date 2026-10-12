import { useMemo, useState } from 'react'
import { BarraTopo } from '../components/BarraTopo'
import { botaoPrimario, margem } from '../components/ui'
import { lerChavesAnteriores, lerRegistrosAnteriores } from '../armazenamento/legado'
import { baixarJson, montarRegistrosAnteriores, nomeArquivo } from '../conta/exportacao'
import { dataCurta } from '../util/datas'

/*
 * Transição da versão gratuita. Aberta sem login e sem compra (rota livre no Portão).
 * Só lê as chaves "acalma_*": nada é alterado nem enviado. Esses dados NÃO comprovam
 * compra e não liberam acesso.
 */
export function RegistrosAnteriores() {
  const registros = useMemo(() => lerRegistrosAnteriores().sort((a, b) => a.criadoEm.localeCompare(b.criadoEm)), [])
  const chaves = useMemo(() => lerChavesAnteriores(), [])
  const [status, setStatus] = useState('')
  const temAlgo = Object.keys(chaves).length > 0

  const baixar = () => {
    const ok = baixarJson(nomeArquivo('acalma-registros-anteriores', new Date()), montarRegistrosAnteriores(registros, chaves, new Date()))
    setStatus(ok ? 'Arquivo gerado. Guarde-o onde preferir.' : 'Este navegador não permitiu gerar o arquivo.')
  }

  return (
    <div className="entrada min-h-dvh">
      <BarraTopo voltarPara="/conta" rotuloVoltar="Voltar" />
      <main className={`${margem} pb-12`}>
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.15] text-verde-profundo">Registros do Acalma anterior</h1>
        {temAlgo ? (
          <>
            <p className="mt-3 leading-relaxed text-texto-2">
              {registros.length === 0
                ? 'Encontramos dados da versão anterior neste navegador, mas nenhum registro do diário.'
                : registros.length === 1
                  ? `Encontramos 1 registro, de ${dataCurta(new Date(registros[0].criadoEm))}.`
                  : `Encontramos ${registros.length} registros, de ${dataCurta(new Date(registros[0].criadoEm))} a ${dataCurta(new Date(registros[registros.length - 1].criadoEm))}.`}{' '}
              Eles continuam aqui, sem alteração.
            </p>
            <button type="button" className={`${botaoPrimario} mt-6`} onClick={baixar}>
              Baixar meus registros antigos
            </button>
            <p role="status" aria-live="polite" className="mt-3 font-semibold text-verde-profundo">{status}</p>
          </>
        ) : (
          <p className="mt-3 leading-relaxed text-texto-2">Não há dados da versão anterior neste navegador.</p>
        )}

        <section className="mt-8 rounded-[var(--radius-cartao)] bg-bege p-5 text-[0.9375rem] leading-relaxed text-texto-2" aria-labelledby="ra-limites">
          <h2 id="ra-limites" className="font-semibold text-texto">O que vale saber</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>A versão anterior guardava tudo só no navegador em que foi usada. Em outro aparelho ou navegador, estes registros não aparecem.</li>
            <li>Limpar os dados do navegador apaga estes registros. Não temos cópia deles.</li>
            <li>Baixar ou ver estes registros não precisa de compra. Eles também não liberam o Acalma novo.</li>
            <li>Com acesso ativo, você pode trazê-los para Salvos pela tela Conta.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
