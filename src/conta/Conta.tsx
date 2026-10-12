import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CONFIG } from '../config'
import { useAviso } from '../components/Aviso'
import {
  aoMudarLocalmente,
  aplicarSincronizacao,
  apagarCopiaLocalDaConta,
  cursorDeSincronizacao,
  filaPendente,
  ultimaSincronizacao,
  usarEspacoDaConta,
  usarEspacoDemonstracao,
} from '../armazenamento/armazenamento'
import { montarMudancas } from '../armazenamento/sincronizacao'
import { decidirAcesso, esquecerAcesso, guardarAcesso, lerAcessoGuardado, type Decisao, type ResultadoServidor } from './acesso'
import { ErroDeRede, servicoSupabase, type ServicoConta, type Sessao } from './servico'

export type Situacao = { fase: 'carregando' } | { fase: 'sem_sessao' } | { fase: 'decidido'; decisao: Decisao }

interface ValorConta {
  modo: 'demonstracao' | 'integrado'
  situacao: Situacao
  sessao: Sessao | null
  enviarCodigo(email: string): Promise<void>
  confirmarCodigo(email: string, codigo: string): Promise<Decisao>
  verificar(): Promise<Decisao | null>
  sincronizarAgora(): Promise<void>
  sair(apagarCopiaLocal: boolean): Promise<void>
  excluirMeusDados(): Promise<void>
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
  sinc: { emAndamento: false, ultimaEm: null, pendentes: 0, falhou: false },
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
          guardarAcesso(s.userId, estado)
          resultado = { ok: true, estado }
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
      async confirmarCodigo(email, codigo) {
        const s = await servico.confirmarCodigo(email.trim().toLowerCase(), codigo.trim())
        sessaoRef.current = s
        setSessao(s)
        await servico.registrarAceites().catch(() => {})
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
