import type { Combinado } from '../armazenamento/armazenamento'
import { buscarModelo } from '../content/combinados'

/** Nome exibido: o que a pessoa escreveu, ou o do modelo, ou um nome neutro. */
export function nomeDoCombinado(c: Pick<Combinado, 'nome' | 'modeloId'>): string {
  return c.nome.trim() || buscarModelo(c.modeloId)?.titulo || 'Nosso combinado'
}
