import { Link, Navigate, useParams } from 'react-router-dom'
import { BarraTopo } from '../components/BarraTopo'
import { useAviso } from '../components/Aviso'
import { Faixa, Miniatura } from '../components/Miniatura'
import { LinkSeguranca } from '../components/LinkSeguranca'
import { botaoIcone, botaoSecundario, margem } from '../components/ui'
import { IconeAvancar, IconeMarcador, IconeVoltar } from '../ilustracoes/icones'
import { buscarCaminho, buscarSituacao } from '../content/situacoes'
import { buscarAcao, buscarModelo } from '../content/combinados'
import { alternarFavorito } from '../armazenamento/armazenamento'
import { useEstado } from '../armazenamento/useEstado'

/*
 * Orientação. Sem :caminhoId, mostra a primeira ajuda (ação, frase, próximo
 * passo) e os caminhos opcionais. Com :caminhoId, mostra a orientação
 * adicional daquele caminho e um único retorno, sem abrir novas perguntas.
 */
export function Orientacao() {
  const { situacaoId, caminhoId } = useParams()
  const situacao = buscarSituacao(situacaoId)
  const caminho = buscarCaminho(situacao, caminhoId)
  const { favoritos } = useEstado()
  const avisar = useAviso()

  if (!situacao) return <Navigate to="/agora" replace />
  if (caminhoId && !caminho) return <Navigate to={`/agora/${situacao.id}`} replace />

  const chaveCaminho = caminho?.id ?? null
  const salvo = favoritos.some((f) => f.situacaoId === situacao.id && f.caminhoId === chaveCaminho)
  const modelo = buscarModelo(situacao.modeloParaProximaVez)
  const registrar = `/registrar/${situacao.id}${caminho ? `?caminho=${caminho.id}` : ''}`

  const botaoSalvar = (
    <button
      type="button"
      className={`${botaoIcone} ${salvo ? 'text-coral' : ''}`}
      aria-pressed={salvo}
      aria-label={salvo ? 'Remover dos salvos' : caminho ? 'Salvar esta variação' : 'Salvar orientação'}
      onClick={() => avisar(alternarFavorito(situacao.id, chaveCaminho) ? 'Salva em Salvos' : 'Removida dos salvos')}
    >
      <IconeMarcador preenchido={salvo} />
    </button>
  )

  return (
    <div key={caminho?.id ?? 'base'} className="entrada flex min-h-dvh flex-col">
      <BarraTopo
        voltarPara={caminho ? `/agora/${situacao.id}` : '/agora'}
        rotuloVoltar={caminho ? 'Voltar à primeira orientação' : 'Trocar a situação'}
        fecharPara="/"
        rotuloFechar="Sair da orientação"
        acoes={botaoSalvar}
      />

      <main className={`${margem} flex-1 pb-[calc(env(safe-area-inset-bottom)+2rem)]`}>
        <div className="flex items-center gap-3.5">
          <Miniatura id={situacao.cena} />
          <div className="min-w-0">
            {caminho && <p className="text-[0.875rem] font-semibold text-texto-2">{situacao.titulo}</p>}
            <h1 className="font-display text-[1.625rem] font-semibold leading-[1.15] tracking-[-0.01em] text-verde-profundo">
              {caminho ? caminho.rotulo : situacao.titulo}
            </h1>
          </div>
        </div>

        <section aria-labelledby="o-agora" className="mt-6">
          <h2 id="o-agora" className="rotulo">{caminho ? 'Tente assim' : 'Agora'}</h2>
          <p className="mt-1.5 text-[1.1875rem] font-medium leading-snug text-texto">
            {caminho ? caminho.orientacao : situacao.agora}
          </p>
        </section>

        <section aria-labelledby="o-frase" className="relative mt-5 overflow-hidden rounded-[var(--radius-cartao)] bg-bege px-5 pb-5 pt-4">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-coral" />
          <h2 id="o-frase" className="rotulo">Você pode dizer</h2>
          <p className="mt-2 text-[1.375rem] font-medium leading-[1.35] tracking-[-0.005em] text-verde-profundo">
            {caminho ? caminho.frase : situacao.frase}
          </p>
        </section>

        {!caminho && (
          <section aria-labelledby="o-depois" className="mt-5">
            <h2 id="o-depois" className="rotulo">Depois</h2>
            <p className="mt-1.5 text-[1.0625rem] leading-relaxed text-texto">{situacao.depois}</p>
          </section>
        )}

        {!caminho ? (
          <section aria-labelledby="o-mais" className="mt-7">
            <h2 id="o-mais" className="font-display text-[1.25rem] font-semibold text-verde-profundo">
              Se precisar de mais
            </h2>
            <ul className="mt-2 divide-y divide-linha border-y border-linha">
              {situacao.caminhos.map((c) => {
                const favorito = favoritos.some((f) => f.situacaoId === situacao.id && f.caminhoId === c.id)
                return (
                  <li key={c.id}>
                    <Link
                      to={`/agora/${situacao.id}/${c.id}`}
                      className="tocavel -mx-2 flex min-h-14 items-center gap-3 rounded-[var(--radius-controle)] px-2 text-[1.0625rem] font-semibold text-texto hover:bg-bege active:bg-bege-forte"
                    >
                      <span className="flex-1">{c.rotulo}</span>
                      {favorito && (
                        <span className="text-coral" title="Salva">
                          <IconeMarcador preenchido />
                          <span className="sr-only">(salva)</span>
                        </span>
                      )}
                      <span className="text-texto-2"><IconeAvancar /></span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : (
          <Link to={`/agora/${situacao.id}`} className={`${botaoSecundario} mt-7`}>
            <IconeVoltar />
            Voltar à primeira orientação
          </Link>
        )}

        {!caminho && modelo && (
          <Link
            to={`/preparar/novo?modelo=${modelo.id}`}
            className="tocavel mt-5 block rounded-[var(--radius-cartao)] bg-verde-claro px-4 pb-4 pt-3.5 hover:bg-bege active:bg-bege-forte"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="rotulo">Para a próxima vez</span>
              <span className="text-texto-2"><IconeAvancar /></span>
            </span>
            <span className="mt-2 flex items-center gap-3">
              <Faixa compacta cenas={modelo.passos.slice(0, 3).map((p) => buscarAcao(p)!.cena)} />
              <span className="min-w-0 flex-1 font-semibold leading-snug text-verde-profundo">Montar o combinado “{modelo.titulo}”</span>
            </span>
          </Link>
        )}

        <div className="mt-6 flex flex-col items-center gap-1">
          <Link to={registrar} className={botaoSecundario}>
            Depois, quero registrar
          </Link>
          <LinkSeguranca />
        </div>
      </main>
    </div>
  )
}
