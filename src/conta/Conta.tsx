import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CONFIG } from '../config'
import { useAviso } from '../components/Aviso'
import {
  aoMudarLocalmente,
  aplicarSincronizacao,
  apagarCopiaLocalDaConta,
  cursorDeSincronizacao,
  filaPendente,
  lerEstado,
  ultimaSincronizacao,
  usarEspacoDaConta,
  usarEspacoDemonstracao,
} from '../armazenamento/armazenamento'
import { montarMudancas, semAcesso } from '../armazenamento/sincronizacao'
import { baixarJson, montarMeusDados, nomeArquivo } from './exportacao'
import { decidirAcesso, esquecerAcesso, guardarAcesso, lerAcessoGuardado, type Decisao, type ResultadoServidor } from './acesso'
import { ErroDeRede, servicoSupabase, type ServicoConta, type Sessao } from './servico'

export type Situacao = { fase: 'carregando' } | { fase: 'sem_sessao' } | { fase: 'decidido'; decisao: Decisao }

interface ValorConta {
  modo: 'demonstracao' | 'integrado'
  situacao: Situacao
  sessao: Sessao | null
  enviarCodigo(email: string): Promise<void>
  /** O aceite dos termos já foi dado na tela (ação explícita); marketing é opcional. */
  confirmarCodigo(email: string, codigo: string, opcoes?: { marketing?: boolean }): Promise<Decisao>
  verificar(): Promise<Decisao | null>
  sincronizarAgora(): Promise<void>
  sair(apagarCopiaLocal: boolean): Promise<void>
  excluirMeusDados(): Promise<void>
  /** Baixa a cópia dos dados (conta, se houver rede, + este aparelho + não enviados). Sem compra. */
  exportarMeusDados(): Promise<{ incluiuConta: boolean; baixou: boolean }>
  definirMarketing(aceita: boolean): Promise<void>
  marketingAtual(): Promise<boolean | null>
  sinc: { emAndamento: boolean; ultimaEm: string | null; pendentes: number; falhou: boolean }
}

const Contexto = createContext<ValorConta | null>(null)

const DEMONSTRACAO: ValorConta = {
  modo: 'demonstracao',
  situacao: { fase: 'decidido', decisao: { tipo: 'liberado', origem: 'servidor' } },
  sessao: null,
  enviarCodigo: async () => {},
  confirmarCodigo: async () => ({ tipo: 'liberado', origem: 'servidor' }),
  verificar: async () => null,
  sincronizarAgora: async () => {},
  sair: async () => {},
  excluirMeusDados: async () => {},
  exportarMeusDados: async () => {
    const e = lerEstado()
    const agora = new Date()
    const baixou = baixarJson(nomeArquivo('acalma-demonstracao', agora), montarMeusDados({
      email: null, agora, conta: null, local: { combinados: e.combinados, favoritos: e.favoritos, registros: e.registros }, naoEnviadas: [],
    }))
    return { incluiuConta: false, baixou }
  },
  definirMarketing: async () => {},
  marketingAtual: async () => null,
  sinc: { emAndamento: false, ultimaEm: null, pendentes: 0, falhou: false },
}

/* Aceite dado na tela que ainda não chegou ao servidor (queda de rede logo após o código). */
const chaveAceitePendente = (uid: string) => `acalma.aceite-pendente.v1.${uid}`
function marcarAceitePendente(uid: string, pendente: boolean) {
  try {
    if (pendente) localStorage.setItem(chaveAceitePendente(uid), '1')
    else localStorage.removeItem(chaveAceitePendente(uid))
  } catch {
    /* sem armazenamento */
  }
}
const aceitePendente = (uid: string) => {
  try {
    return localStorage.getItem(chaveAceitePendente(uid)) === '1'
  } catch {
    return false
  }
}

export function ProvedorConta({ children, servico }: { children: ReactNode; servico?: ServicoConta }) {
  if (CONFIG.modo === 'demonstracao' && !servico) return <Contexto.Provider value={DEMONSTRACAO}>{children}</Contexto.Provider>
  return <ProvedorIntegrado servico={servico ?? servicoSupabase}>{children}</ProvedorIntegrado>
}

const online = () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false)

function ProvedorIntegrado({ children, servico }: { children: ReactNode; servico: ServicoConta }) {
  const avisar = useAviso()
  const [situacao, setSituacao] = useState<Situacao>({ fase: 'carregando' })
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [sinc, setSinc] = useState({ emAndamento: false, ultimaEm: null as string | null, pendentes: 0, falhou: false })
  const sincronizando = useRef(false)
  const sessaoRef = useRef<Sessao | null>(null)
  const liberado = useRef(false)
  const verificarRef = useRef<(() => Promise<Decisao | null>) | null>(null)

  const atualizarResumo = useCallback((extra: Partial<typeof sinc> = {}) => {
    setSinc((s) => ({ ...s, ultimaEm: ultimaSincronizacao(), pendentes: filaPendente().length, ...extra }))
  }, [])

  const sincronizarAgora = useCallback(async () => {
    if (!sessaoRef.current || !liberado.current || sincronizando.current || !online()) return
    sincronizando.current = true
    setSinc((s) => ({ ...s, emAndamento: true }))
    try {
      for (let rodada = 0; rodada < 3; rodada++) {
        const enviadas = filaPendente()
        const r = await servico.sincronizar(montarMudancas(enviadas), cursorDeSincronizacao())
        if (semAcesso(r)) {
          // O servidor não gravou nada. A fila fica intacta neste aparelho (entra na cópia
          // que a pessoa pode baixar) e o acesso é conferido de novo, o que mostra a tela certa.
          liberado.current = false
          atualizarResumo({ emAndamento: false, falhou: false })
          sincronizando.current = false
          void verificarRef.current?.()
          return
        }
        const avisos = aplicarSincronizacao(enviadas, r)
        if (avisos.length) avisar(avisos[0])
        if (filaPendente().length === 0) break
      }
      atualizarResumo({ emAndamento: false, falhou: false })
    } catch {
      // Sem rede ou erro: a fila continua no aparelho e vai na próxima tentativa.
      atualizarResumo({ emAndamento: false, falhou: true })
    } finally {
      sincronizando.current = false
    }
  }, [servico, avisar, atualizarResumo])

  const verificarSessao = useCallback(
    async (s: Sessao): Promise<Decisao> => {
      usarEspacoDaConta(s.userId)
      let resultado: ResultadoServidor
      if (!online()) resultado = { ok: false, motivo: 'offline' }
      else {
        try {
          await servico.vincularCompras().catch((e) => {
            if (e instanceof ErroDeRede) throw e
          })
          const estado = await servico.meuAcesso()
          // Só a resposta do servidor grava a confirmação (e a data). Falha de rede
          // nunca renova a janela offline.
          guardarAcesso(s.userId, estado)
          resultado = { ok: true, estado }
          if (aceitePendente(s.userId)) {
            await servico.registrarAceites().then(() => marcarAceitePendente(s.userId, false), () => {})
          }
        } catch (e) {
          resultado = { ok: false, motivo: e instanceof ErroDeRede ? 'offline' : 'erro' }
        }
      }
      const decisao = decidirAcesso({ resultado, guardado: lerAcessoGuardado(s.userId), agora: new Date() })
      liberado.current = decisao.tipo === 'liberado'
      setSituacao({ fase: 'decidido', decisao })
      atualizarResumo()
      if (liberado.current) void sincronizarAgora()
      return decisao
    },
    [servico, sincronizarAgora, atualizarResumo],
  )

  const verificar = useCallback(async () => {
    const s = sessaoRef.current
    return s ? verificarSessao(s) : null
  }, [verificarSessao])
  useEffect(() => {
    verificarRef.current = verificar
  }, [verificar])

  // Abertura do app: a sessão guardada no aparelho (funciona sem rede).
  useEffect(() => {
    let vivo = true
    servico
      .sessaoLocal()
      .then((s) => {
        if (!vivo) return
        sessaoRef.current = s
        setSessao(s)
        if (!s) {
          usarEspacoDemonstracao()
          setSituacao({ fase: 'sem_sessao' })
        } else void verificarSessao(s)
      })
      .catch(() => vivo && setSituacao({ fase: 'sem_sessao' }))
    return () => {
      vivo = false
    }
  }, [servico, verificarSessao])

  // Mudança local → sincroniza em seguida (junta várias mudanças rápidas).
  useEffect(() => {
    let t: number | undefined
    const desliga = aoMudarLocalmente(() => {
      atualizarResumo()
      window.clearTimeout(t)
      t = window.setTimeout(() => void sincronizarAgora(), 1500)
    })
    return () => {
      desliga()
      window.clearTimeout(t)
    }
  }, [sincronizarAgora, atualizarResumo])

  // Voltou a conexão ou voltou para o app → confirma o acesso (pega reembolso) e sincroniza.
  useEffect(() => {
    const rever = () => {
      if (sessaoRef.current && online()) void verificar()
    }
    const aoVoltar = () => document.visibilityState === 'visible' && rever()
    window.addEventListener('online', rever)
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      window.removeEventListener('online', rever)
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [verificar])

  const valor = useMemo<ValorConta>(
    () => ({
      modo: 'integrado',
      situacao,
      sessao,
      sinc,
      sincronizarAgora,
      verificar,
      enviarCodigo: (email) => servico.enviarCodigo(email.trim().toLowerCase()),
      async confirmarCodigo(email, codigo, opcoes) {
        const s = await servico.confirmarCodigo(email.trim().toLowerCase(), codigo.trim())
        sessaoRef.current = s
        setSessao(s)
        marcarAceitePendente(s.userId, true)
        await servico.registrarAceites().then(() => marcarAceitePendente(s.userId, false), () => {})
        // Só registra quando a pessoa marcou: não marcar não revoga um "sim" dado antes.
        if (opcoes?.marketing) await servico.definirMarketing(true).catch(() => {})
        return verificarSessao(s)
      },
      async sair(apagarCopiaLocal) {
        const s = sessaoRef.current
        await servico.sair().catch(() => {})
        if (s && apagarCopiaLocal) {
          apagarCopiaLocalDaConta(s.userId)
          esquecerAcesso(s.userId)
        }
        sessaoRef.current = null
        liberado.current = false
        setSessao(null)
        usarEspacoDemonstracao()
        setSituacao({ fase: 'sem_sessao' })
      },
      async exportarMeusDados() {
        const s = sessaoRef.current
        let naConta: unknown | null = null
        if (s && online()) naConta = await servico.exportarMeusDados().catch(() => null)
        const e = lerEstado()
        const agora = new Date()
        const baixou = baixarJson(
          nomeArquivo('acalma-meus-dados', agora),
          montarMeusDados({
            email: s?.email ?? null,
            agora,
            conta: naConta,
            local: { combinados: e.combinados, favoritos: e.favoritos, registros: e.registros },
            naoEnviadas: filaPendente(),
          }),
        )
        return { incluiuConta: naConta !== null, baixou }
      },
      definirMarketing: (aceita) => servico.definirMarketing(aceita),
      marketingAtual: () => servico.marketingAtual(),
      async excluirMeusDados() {
        const s = sessaoRef.current
        if (!s) return
        await servico.excluirMeusDados()
        apagarCopiaLocalDaConta(s.userId)
        usarEspacoDaConta(s.userId)
        atualizarResumo()
      },
    }),
    [situacao, sessao, sinc, sincronizarAgora, verificar, verificarSessao, servico, atualizarResumo],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConta(): ValorConta {
  return useContext(Contexto) ?? DEMONSTRACAO
}
