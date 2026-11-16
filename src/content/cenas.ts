import type { SituacaoId } from './tipos'

/*
 * Cenas ilustradas (geradas com IA em 16/11/2026, as mesmas do guia em PDF) que abrem cada
 * situação. Os desenhos do app (Cena) continuam sendo a identidade nas listas e nos combinados.
 * Ficam em public/cenas e entram no cache offline (globPatterns inclui webp).
 */
export const fotoDaSituacao: Record<SituacaoId, string> = {
  'desligar-tela': '/cenas/desligar-tela.webp',
  'ouvir-nao': '/cenas/ouvir-nao.webp',
  'ir-embora': '/cenas/ir-embora.webp',
  'banho-roupa': '/cenas/banho-roupa.webp',
  'guardar-brinquedos': '/cenas/guardar-brinquedos.webp',
  'outra-situacao': '/cenas/outra-situacao.webp',
}

export const FOTO_INICIO = '/cenas/inicio.webp'

/* Guia completo em PDF (o mesmo entregue pela Hotmart). Fora do cache offline: é baixado sob demanda. */
export const GUIA_PDF = '/guia/acalma-guia-completo-516ee759.pdf'
