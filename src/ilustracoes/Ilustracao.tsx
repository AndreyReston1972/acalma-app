import type { ReactNode } from 'react'

/*
 * Sistema de ilustração do Acalma.
 *
 * Uma só gramática para todos os objetos: grade de 64, traço contínuo de
 * 2,4 com pontas arredondadas, duas superfícies (clara e média) e no máximo
 * um detalhe em coral. Objetos reconhecíveis, nunca pessoas ou crianças.
 */
export type IlustracaoId =
  | 'tela'
  | 'nao'
  | 'porta'
  | 'toalha'
  | 'cesta'
  | 'blocos'
  | 'gaveta'
  | 'tenis'
  | 'roupa'
  | 'camiseta'
  | 'banheira'
  | 'outra'
  | 'fala'
  | 'marcador'
  | 'caderno'

type Tom = 'claro' | 'escuro'

interface Paleta {
  traco: string
  clara: string
  media: string
  acento: string
}

const paletas: Record<Tom, Paleta> = {
  claro: {
    traco: 'var(--color-verde-profundo)',
    clara: '#FFFFFF',
    media: 'var(--color-bege-forte)',
    acento: 'var(--color-coral)',
  },
  escuro: {
    traco: 'var(--color-creme)',
    clara: 'rgb(255 255 255 / 0.16)',
    media: 'rgb(255 255 255 / 0.08)',
    acento: '#F08A5D',
  },
}

function desenho(id: IlustracaoId, p: Paleta): ReactNode {
  const t = { stroke: p.traco, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const fino = { ...t, strokeWidth: 1.8 }
  switch (id) {
    case 'tela':
      return (
        <>
          <rect x="15" y="9" width="34" height="46" rx="6" fill={p.clara} {...t} />
          <rect x="20" y="15" width="24" height="29" rx="2.5" fill={p.media} />
          <path d="M29 24.5 37 29.5 29 34.5Z" fill={p.acento} stroke={p.acento} strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M29 49.5h6" {...t} />
        </>
      )
    case 'nao':
      return (
        <>
          <path d="M14 13h36a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H32l-9 8v-8h-9a6 6 0 0 1-6-6V19a6 6 0 0 1 6-6Z" fill={p.clara} {...t} />
          <path d="M23 28h18" stroke={p.acento} strokeWidth={3.4} strokeLinecap="round" />
        </>
      )
    case 'porta':
      return (
        <>
          <rect x="19" y="8" width="26" height="48" rx="2.5" fill={p.media} {...t} />
          <rect x="24" y="14" width="16" height="13" rx="1.5" fill={p.clara} {...fino} />
          <circle cx="39" cy="35" r="2.4" fill={p.acento} />
          <path d="M9 56h46" {...t} />
        </>
      )
    case 'toalha':
      return (
        <>
          <path d="M9 13h46" {...t} />
          <path d="M18 13h28v36a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3Z" fill={p.media} {...t} />
          <path d="M18 13h28v10H18Z" fill={p.clara} {...t} />
          <path d="M18 43h28" stroke={p.acento} strokeWidth={2.4} />
        </>
      )
    case 'cesta':
      return (
        <>
          <rect x="18" y="14" width="14" height="14" rx="2.5" fill={p.clara} {...t} />
          <rect x="33" y="18" width="11" height="11" rx="2" fill={p.acento} {...t} />
          <path d="M10 30h44l-4.4 21.6a3 3 0 0 1-2.9 2.4H17.3a3 3 0 0 1-2.9-2.4Z" fill={p.media} {...t} />
          <path d="M24 31.5 25.5 52M32 31.5V52M40 31.5 38.5 52" {...fino} />
        </>
      )
    case 'blocos':
      return (
        <>
          <rect x="11" y="36" width="19" height="18" rx="2.5" fill={p.media} {...t} />
          <rect x="34" y="36" width="19" height="18" rx="2.5" fill={p.clara} {...t} />
          <path d="M23 33 32 17l9 16Z" fill={p.acento} {...t} />
        </>
      )
    case 'gaveta':
      return (
        <>
          <rect x="20" y="8" width="24" height="27" rx="3.5" fill={p.clara} {...t} />
          <rect x="10" y="30" width="44" height="24" rx="3" fill={p.media} {...t} />
          <path d="M26 42h12" {...t} />
          <path d="M51 10v11m-4-4 4 4 4-4" stroke={p.acento} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      )
    case 'tenis':
      return (
        <>
          <path d="M9 45V34a4 4 0 0 1 4-4h9l5 5c4 3 10 4 17 5.5 5 1 9 3 9 6.5V48H9Z" fill={p.clara} {...t} />
          <path d="M8 48h46v1.5a3.5 3.5 0 0 1-3.5 3.5h-39A3.5 3.5 0 0 1 8 49.5Z" fill={p.media} {...t} />
          <path d="m27.5 36.5-3.5 3M32 39l-3.5 3M36.5 40.5 33 43.5" {...fino} />
          <path d="M13 41h8" stroke={p.acento} strokeWidth={2.4} strokeLinecap="round" />
        </>
      )
    case 'roupa':
      return (
        <>
          <rect x="12" y="40" width="40" height="13" rx="3" fill={p.media} {...t} />
          <rect x="15" y="27" width="34" height="13" rx="3" fill={p.clara} {...t} />
          <rect x="19" y="14" width="26" height="13" rx="3" fill={p.media} {...t} />
          <path d="M23 33.5h18" stroke={p.acento} strokeWidth={2.4} strokeLinecap="round" />
        </>
      )
    case 'camiseta':
      return (
        <>
          <path d="M24 11 12 17l-5 11 8 4 3-5v27h28V27l3 5 8-4-5-11-12-6c-1.5 3.6-4.5 5.4-8 5.4S25.5 14.6 24 11Z" fill={p.clara} {...t} />
          <path d="M24 11c1.5 3.6 4.5 5.4 8 5.4s6.5-1.8 8-5.4" stroke={p.acento} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        </>
      )
    case 'banheira':
      return (
        <>
          <path d="M15 30V17a5 5 0 0 1 10 0" fill="none" {...t} />
          <path d="M25 21v3" stroke={p.acento} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx="34" cy="24" r="4" fill={p.media} {...fino} />
          <circle cx="42.5" cy="22.5" r="2.8" fill={p.media} {...fino} />
          <circle cx="39" cy="15" r="2" fill={p.media} {...fino} />
          <path d="M11 30h42v6a12 12 0 0 1-12 12H23a12 12 0 0 1-12-12Z" fill={p.clara} {...t} />
          <path d="M8 30h48M19 48l-2 5M45 48l2 5" {...t} />
        </>
      )
    case 'outra':
      return (
        <>
          <circle cx="32" cy="32" r="21" fill={p.media} {...t} />
          <circle cx="22" cy="32" r="2.8" fill={p.traco} />
          <circle cx="32" cy="32" r="2.8" fill={p.acento} />
          <circle cx="42" cy="32" r="2.8" fill={p.traco} />
        </>
      )
    case 'fala':
      return (
        <>
          <path d="M12 12h40a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H31l-10 9v-9h-9a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6Z" fill={p.clara} {...t} />
          <path d="M17 23h30M17 31h20" {...t} />
          <circle cx="44" cy="31" r="2.6" fill={p.acento} />
        </>
      )
    case 'marcador':
      return (
        <>
          <path d="M20 9h24a3 3 0 0 1 3 3v43L32 45 17 55V12a3 3 0 0 1 3-3Z" fill={p.media} {...t} />
          <path d="M25 19h14" stroke={p.acento} strokeWidth={2.4} strokeLinecap="round" />
        </>
      )
    case 'caderno':
      return (
        <>
          <rect x="14" y="9" width="36" height="46" rx="4" fill={p.clara} {...t} />
          <path d="M21 9v46" stroke={p.acento} strokeWidth={2.4} />
          <path d="M27 21h16M27 29h16M27 37h10" {...fino} />
        </>
      )
  }
}

export function Ilustracao({
  id,
  tamanho = 48,
  tom = 'claro',
  className,
}: {
  id: IlustracaoId
  tamanho?: number
  tom?: Tom
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={tamanho}
      height={tamanho}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {desenho(id, paletas[tom])}
    </svg>
  )
}
