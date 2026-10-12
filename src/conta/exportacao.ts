import type { Estado, Registro } from '../armazenamento/armazenamento'
import type { Operacao } from '../armazenamento/sincronizacao'

/*
 * Cópias que a pessoa baixa, sem precisar de compra ativa:
 *   • "Meus dados": o que está na conta (se houver conexão) + a cópia deste aparelho,
 *     incluindo alterações que ainda não foram enviadas (por exemplo, feitas depois de um
 *     reembolso). Nada da fila é descartado ao revogar o acesso: ela fica no aparelho e
 *     vai neste arquivo.
 *   • "Registros do app anterior": lidos das chaves acalma_diario_* sem alterá-las.
 * Arquivos JSON legíveis, gerados no próprio aparelho. Nada é enviado a terceiros.
 */
export function montarMeusDados(p: {
  email: string | null
  agora: Date
  conta: unknown | null
  local: Pick<Estado, 'combinados' | 'favoritos' | 'registros'>
  naoEnviadas: Operacao[]
}) {
  return {
    app: 'Acalma',
    tipo: 'meus-dados',
    gerado_em: p.agora.toISOString(),
    conta: p.email,
    na_conta: p.conta ?? 'Sem conexão no momento: a cópia da conta não foi incluída. Tente de novo com internet.',
    neste_aparelho: p.local,
    alteracoes_nao_enviadas: p.naoEnviadas,
  }
}

export function montarRegistrosAnteriores(registros: Registro[], chavesOriginais: Record<string, string>, agora: Date) {
  return {
    app: 'Acalma (versão anterior)',
    tipo: 'registros-anteriores',
    gerado_em: agora.toISOString(),
    aviso: 'Registros guardados neste navegador pela versão anterior do Acalma. Não comprovam compra.',
    registros: registros.map((r) => ({ data: r.criadoEm, anotacao: r.anotacao, original: r.legado })),
    chaves_originais: chavesOriginais,
  }
}

/** Entrega o arquivo ao navegador. Devolve false onde não há suporte (ex.: testes). */
export function baixarJson(nome: string, dado: unknown): boolean {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return false
  const url = URL.createObjectURL(new Blob([JSON.stringify(dado, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}

export const nomeArquivo = (base: string, agora: Date) => `${base}-${agora.toISOString().slice(0, 10)}.json`
