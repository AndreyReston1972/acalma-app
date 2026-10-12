/*
 * Servidor falso para os testes do frontend integrado. Reproduz, em memória, as
 * regras da RPC acalma_sincronizar (migration 20261012120000) e o estado de acesso.
 * As regras do banco em si são testadas no repositório da Nina (PGlite).
 */
import type { EstadoServidor, ServicoConta, Sessao } from '../conta/servico'
import { ErroDeRede } from '../conta/servico'
import type { LinhaCombinado, LinhaFavorito, LinhaRegistro, RespostaSinc } from '../armazenamento/sincronizacao'

interface Conta {
  sessao: Sessao
  acesso: EstadoServidor
}

export class ServidorFalso {
  contas = new Map<string, Conta>()
  combinados = new Map<string, LinhaCombinado & { user_id: string }>()
  favoritos = new Map<string, LinhaFavorito & { user_id: string; atualizado_em: string }>()
  registros = new Map<string, LinhaRegistro & { user_id: string; atualizado_em: string }>()
  relogio = Date.parse('2026-10-12T12:00:00Z')
  agora() {
    this.relogio += 1000
    return new Date(this.relogio).toISOString()
  }

  conta(email: string, acesso: EstadoServidor = 'ativo') {
    const id = `u-${email}`
    this.contas.set(email, { sessao: { userId: id, email }, acesso })
    return id
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- payload livre, como o JSON que chega à RPC
  sincronizar(uid: string, m: any, desde: string | null): RespostaSinc {
    const agora = this.agora()
    const conflitos: RespostaSinc['conflitos'] = []
    const rejeitados: RespostaSinc['rejeitados'] = []
    for (const c of m.combinados ?? []) {
      const atual = this.combinados.get(c.id)
      if (!atual) {
        if (c.excluido) continue
        this.combinados.set(c.id, { id: c.id, user_id: uid, nome: c.nome, modelo_id: c.modelo_id, passos: c.passos, versao: 1, criado_em: c.criado_em, atualizado_em: agora, excluido_em: null })
      } else if (atual.user_id !== uid) rejeitados.push({ tipo: 'combinado', id: c.id, motivo: 'id_em_uso' })
      else if (c.versao_base == null || c.versao_base !== atual.versao) {
        const { user_id: _u, ...servidor } = atual
        void _u
        conflitos.push({ tipo: 'combinado', id: c.id, servidor })
      } else if (c.excluido) this.combinados.set(c.id, { ...atual, excluido_em: agora, versao: atual.versao + 1, atualizado_em: agora })
      else this.combinados.set(c.id, { ...atual, nome: c.nome, modelo_id: c.modelo_id, passos: c.passos, versao: atual.versao + 1, atualizado_em: agora, excluido_em: null })
    }
    for (const f of m.favoritos ?? []) {
      const k = `${uid}/${f.situacao_id}/${f.caminho_id}`
      const atual = this.favoritos.get(k)
      if (!atual || atual.alterado_em < f.alterado_em) this.favoritos.set(k, { ...f, user_id: uid, atualizado_em: agora })
    }
    for (const r of m.registros ?? []) {
      const atual = this.registros.get(r.id)
      if (!atual) {
        if (r.excluido) continue
        this.registros.set(r.id, { ...r, user_id: uid, excluido_em: null, atualizado_em: agora })
      } else if (atual.user_id !== uid) rejeitados.push({ tipo: 'registro', id: r.id, motivo: 'id_em_uso' })
      else if (r.excluido && !atual.excluido_em) this.registros.set(r.id, { ...atual, excluido_em: agora, anotacao: '', legado: null, atualizado_em: agora })
    }
    const corte = desde ? new Date(Date.parse(desde) - 5 * 60_000).toISOString() : null
    const novo = <T extends { user_id: string; atualizado_em: string }>(x: T) => x.user_id === uid && (!corte || x.atualizado_em > corte)
    const semDono = <T extends { user_id: string }>({ user_id: _u, ...resto }: T) => {
      void _u
      return resto
    }
    return {
      servidor_em: agora,
      combinados: [...this.combinados.values()].filter(novo).map(semDono) as LinhaCombinado[],
      favoritos: [...this.favoritos.values()].filter(novo).map(semDono) as LinhaFavorito[],
      registros: [...this.registros.values()].filter(novo).map(semDono) as LinhaRegistro[],
      conflitos,
      rejeitados,
    }
  }
}

/** Um "aparelho": serviço de conta falando com o servidor falso. */
export function aparelho(srv: ServidorFalso) {
  let sessao: Sessao | null = null
  const estado = { online: true, codigosEnviados: [] as string[], aceites: 0, sincronizacoes: 0 }
  const exigirRede = () => {
    if (!estado.online) throw new ErroDeRede('offline')
  }
  const servico: ServicoConta = {
    sessaoLocal: async () => sessao,
    async enviarCodigo(email) {
      exigirRede()
      estado.codigosEnviados.push(email)
      if (!srv.contas.has(email)) srv.conta(email, 'nenhum')
    },
    async confirmarCodigo(email, codigo) {
      exigirRede()
      if (codigo !== '123456') throw new Error('Código inválido')
      sessao = srv.contas.get(email)!.sessao
      return sessao
    },
    async sair() {
      sessao = null
    },
    async vincularCompras() {
      exigirRede()
    },
    async meuAcesso() {
      exigirRede()
      return [...srv.contas.values()].find((c) => c.sessao.userId === sessao?.userId)?.acesso ?? 'sem_sessao'
    },
    async sincronizar(m, desde) {
      exigirRede()
      estado.sincronizacoes++
      return srv.sincronizar(sessao!.userId, JSON.parse(JSON.stringify(m)), desde)
    },
    async registrarAceites() {
      estado.aceites++
    },
    async excluirMeusDados() {
      exigirRede()
      for (const [k, v] of srv.combinados) if (v.user_id === sessao!.userId) srv.combinados.delete(k)
    },
  }
  return { servico, estado, entrarComo: (s: Sessao | null) => (sessao = s) }
}
