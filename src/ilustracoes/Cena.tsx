import type { ReactNode } from 'react'

/*
 * Sistema B: ilustrações de conteúdo ("cenas").
 *
 * Cenas de objetos que representam ações, desenhadas para esta grade
 * (160 x 120), e não ícones ampliados. Gramática comum:
 * - chão: uma sombra elíptica bege, sempre na mesma linha;
 * - volume: face clara + face lateral um tom abaixo;
 * - traço verde-profundo de 3, pontas arredondadas;
 * - um único detalhe coral por cena;
 * - sem pessoas, sem crianças, sem texto.
 * O Sistema A (ícones de interface, 24 px) fica em icones.tsx.
 */
export type CenaId =
  | 'guardar-brinquedos'
  | 'calcar'
  | 'sair'
  | 'guardar-aparelho'
  | 'brincar'
  | 'separar-roupa'
  | 'tomar-banho'
  | 'vestir'
  | 'lavar-maos'
  | 'ler-historia'
  | 'tela'
  | 'nao'
  | 'parque'
  | 'toalha'
  | 'cantinho'
  | 'frase'
  | 'ajuda'
  | 'vazio-combinados'
  | 'vazio-favoritos'
  | 'vazio-registros'

const T = '#2F5446' // traço
const BR = '#FFFFFF' // face clara
const BG = '#F5EDE0'
const BGF = '#EBDFCC' // face média
const BGS = '#D9C8AE' // face de sombra
const VD = '#3B6857'
const VC = '#CFE0D6' // verde claro
const VS = '#A9C6B6' // verde sombra
const CO = '#E8622A' // acento
const CC = '#F5B99C' // coral claro

const tr = { stroke: T, strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const fino = { ...tr, strokeWidth: 2 }

const Chao = ({ rx = 58 }: { rx?: number }) => <ellipse cx="80" cy="106" rx={rx} ry="6.5" fill={BGF} />

function Tenis({ x = 0, y = 0, face = BR, escala = 1 }: { x?: number; y?: number; face?: string; escala?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <path d="M8 26V13a6 6 0 0 1 6-6h13l8 8c6 4 14 5.5 22 7 6 1.2 10 4 10 8v4H8Z" fill={face} {...tr} />
      <path d="M6 34h64v2.5a4.5 4.5 0 0 1-4.5 4.5h-55A4.5 4.5 0 0 1 6 36.5Z" fill={BGF} {...tr} />
      <path d="m30 15-5 4M35.5 18.5l-5 4M41 21l-5 4" {...fino} />
    </g>
  )
}

function cena(id: CenaId): ReactNode {
  switch (id) {
    case 'guardar-brinquedos':
      return (
        <>
          <Chao />
          <rect x="16" y="86" width="18" height="18" rx="3" fill={VC} {...tr} />
          <rect x="56" y="48" width="18" height="16" rx="3" fill={VC} {...tr} />
          <rect x="80" y="50" width="16" height="14" rx="3" fill={CO} {...tr} />
          <path d="M46 70h72l-8 31a5 5 0 0 1-4.8 3.8H58.8A5 5 0 0 1 54 101Z" fill={BGF} {...tr} />
          <path d="M112 70h6l-8 31a5 5 0 0 1-4.8 3.8H100Z" fill={BGS} />
          <path d="M64 76l3 24M82 76v24M100 76l-3 24" {...fino} />
          <rect x="40" y="62" width="84" height="11" rx="5" fill={BG} {...tr} />
          <g transform="rotate(14 112 26)">
            <rect x="102" y="16" width="20" height="20" rx="3.5" fill={BR} {...tr} />
            <circle cx="112" cy="26" r="3" fill={T} />
          </g>
          <path d="M130 12c6 8 5 18-1 25" fill="none" {...fino} strokeDasharray="2 6" />
        </>
      )
    case 'calcar':
      return (
        <>
          <Chao rx={62} />
          <rect x="114" y="10" width="34" height="96" rx="2" fill={BGF} {...tr} />
          <path d="M140 12v92" stroke={BGS} strokeWidth={6} />
          <circle cx="122" cy="62" r="3.5" fill={CO} />
          <rect x="24" y="98" width="86" height="7" rx="3.5" fill={VC} {...tr} />
          <Tenis x={4} y={46} face={VC} />
          <Tenis x={36} y={60} />
        </>
      )
    case 'sair':
      return (
        <>
          <Chao rx={60} />
          <rect x="54" y="10" width="56" height="94" rx="2" fill={VC} {...tr} />
          <circle cx="92" cy="34" r="9" fill={CC} />
          <path d="M56 78c14-6 30-6 52 2v22H56Z" fill={VS} />
          <path d="M74 104c4-10 10-20 18-26" fill="none" stroke={BR} strokeWidth={5} strokeLinecap="round" />
          <path d="M54 10 34 18v92l20-6Z" fill={BGF} {...tr} />
          <circle cx="40" cy="62" r="3.5" fill={CO} />
          <rect x="60" y="102" width="44" height="6" rx="3" fill={BGF} {...tr} />
          <path d="M126 104v-14h16v14Z" fill={BG} {...tr} />
          <path d="M134 90c-2-8-8-10-12-10 2 6 6 9 12 10Zm0 0c2-9 8-12 12-12-1 7-6 11-12 12Z" fill={VC} {...fino} />
        </>
      )
    case 'guardar-aparelho':
      return (
        <>
          <Chao rx={56} />
          <path d="M32 64 44 52h96l-12 12Z" fill={BGS} {...tr} />
          <g transform="rotate(-6 82 40)">
            <rect x="62" y="12" width="40" height="56" rx="6" fill={BR} {...tr} />
            <rect x="68" y="19" width="28" height="38" rx="2.5" fill={VC} />
          </g>
          <rect x="32" y="64" width="96" height="40" rx="4" fill={BGF} {...tr} />
          <path d="M128 64 140 52v40l-12 12Z" fill={BGS} {...tr} />
          <path d="M68 82h24" {...tr} />
          <path d="M24 14v20m-7-7 7 7 7-7" fill="none" stroke={CO} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )
    case 'brincar':
      return (
        <>
          <Chao rx={56} />
          <rect x="30" y="76" width="30" height="28" rx="3.5" fill={VD} {...tr} />
          <path d="M33 79h24" stroke={VS} strokeWidth={3} strokeLinecap="round" />
          <rect x="34" y="50" width="26" height="26" rx="3.5" fill={BR} {...tr} />
          <path d="M32 50 47 28l15 22Z" fill={CO} {...tr} />
          <rect x="66" y="84" width="22" height="20" rx="3" fill={BGF} {...tr} />
          <circle cx="114" cy="86" r="18" fill={BR} {...tr} />
          <path d="M97 80c10-5 24-4 34 4" fill="none" stroke={VC} strokeWidth={6} />
          <path d="M98 94c10 4 22 4 32-2" fill="none" stroke={CC} strokeWidth={6} />
          <circle cx="114" cy="86" r="18" fill="none" {...tr} />
        </>
      )
    case 'separar-roupa':
      return (
        <>
          <Chao rx={54} />
          <path d="M44 92v14M116 92v14" {...tr} />
          <rect x="34" y="84" width="92" height="10" rx="4" fill={BGF} {...tr} />
          <rect x="44" y="66" width="72" height="18" rx="5" fill={VC} {...tr} />
          <path d="M80 66v18" {...fino} />
          <rect x="50" y="48" width="60" height="18" rx="5" fill={BR} {...tr} />
          <path d="M60 57h40" stroke={CO} strokeWidth={3} strokeLinecap="round" />
          <rect x="58" y="34" width="44" height="14" rx="5" fill={BG} {...tr} />
        </>
      )
    case 'tomar-banho':
      return (
        <>
          <Chao rx={56} />
          <path d="M30 60V36a9 9 0 0 1 18 0v4" fill="none" {...tr} />
          <path d="M48 46v6" stroke={VS} strokeWidth={3} strokeLinecap="round" />
          <circle cx="62" cy="54" r="9" fill={VC} {...fino} />
          <circle cx="78" cy="50" r="7" fill={VC} {...fino} />
          <circle cx="72" cy="38" r="4.5" fill={VC} {...fino} />
          <ellipse cx="108" cy="54" rx="14" ry="9" fill={CO} {...tr} />
          <circle cx="114" cy="40" r="7.5" fill={CO} {...tr} />
          <path d="M121 40h6l-5 4" fill={BGF} {...fino} />
          <path d="M28 64h104v8a28 28 0 0 1-28 28H56a28 28 0 0 1-28-28Z" fill={BR} {...tr} />
          <path d="M120 64h12v8a28 28 0 0 1-20 26.8V64Z" fill={BG} />
          <rect x="22" y="58" width="116" height="9" rx="4.5" fill={BGF} {...tr} />
          <path d="M50 100l-5 6M110 100l5 6" {...tr} />
        </>
      )
    case 'vestir':
      return (
        <>
          <Chao rx={50} />
          <path d="M80 22v-5a5 5 0 1 1 5 5" fill="none" {...fino} />
          <path d="M48 36 80 22l32 14" fill="none" {...tr} />
          <path d="M64 34 44 44l-9 18 13 6 5-9v41h54V59l5 9 13-6-9-18-20-10c-3 7-9 10-16 10s-13-3-16-10Z" fill={VC} {...tr} />
          <path d="M104 52v57h3V59Z" fill={VS} />
          <path d="M64 34c3 7 9 10 16 10s13-3 16-10" fill="none" stroke={CO} strokeWidth={3} strokeLinecap="round" />
          <rect x="88" y="62" width="12" height="12" rx="2" fill={BR} {...fino} />
        </>
      )
    case 'lavar-maos':
      return (
        <>
          <Chao rx={58} />
          <path d="M40 74h80v4a24 24 0 0 1-24 24H64a24 24 0 0 1-24-24Z" fill={BR} {...tr} />
          <rect x="18" y="66" width="124" height="10" rx="4" fill={BGF} {...tr} />
          <path d="M66 66V46a10 10 0 0 1 10-10h12a6 6 0 0 1 6 6v6" fill="none" stroke={T} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M94 54v8" stroke={VS} strokeWidth={4} strokeLinecap="round" strokeDasharray="3 4" />
          <rect x="112" y="54" width="20" height="12" rx="5" fill={CC} {...tr} />
          <circle cx="118" cy="46" r="4" fill={VC} {...fino} />
          <circle cx="128" cy="42" r="2.8" fill={VC} {...fino} />
          <path d="M66 36h-8" stroke={CO} strokeWidth={4} strokeLinecap="round" />
        </>
      )
    case 'ler-historia':
      return (
        <>
          <Chao rx={58} />
          <path d="M80 96c-14-8-34-10-52-6V48c18-4 38-2 52 6 14-8 34-10 52-6v42c-18-4-38-2-52 6Z" fill={VD} {...tr} />
          <path d="M80 50c-14-8-32-9-48-5v42c16-4 34-3 48 5Z" fill={BR} {...tr} />
          <path d="M80 50c14-8 32-9 48-5v42c-16-4-34-3-48 5Z" fill={BG} {...tr} />
          <path d="M40 56c10-2 20-1 30 2M40 66c10-2 20-1 30 2M90 58c10-3 20-4 30-2M90 68c10-3 20-4 30-2" {...fino} stroke={VS} />
          <path d="M136 14a12 12 0 1 0 8 20 10 10 0 0 1-8-20Z" fill={CC} />
          <circle cx="116" cy="20" r="2" fill={CO} />
        </>
      )
    case 'tela':
      return (
        <>
          <Chao rx={56} />
          <path d="M66 98 92 98 98 106H60Z" fill={BGF} {...tr} />
          <rect x="44" y="14" width="72" height="86" rx="9" fill={BR} {...tr} />
          <rect x="52" y="22" width="56" height="64" rx="3" fill={VC} />
          <path d="M52 70c12-10 24-8 34 0s16 6 22 2v14H52Z" fill={VS} />
          <path d="M74 40 92 51 74 62Z" fill={CO} stroke={CO} strokeWidth={3} strokeLinejoin="round" />
          <path d="M74 93h12" {...tr} />
          <path d="M128 30a10 10 0 1 1-12 2" fill="none" {...tr} />
          <path d="M122 24v10" {...tr} />
        </>
      )
    case 'nao':
      return (
        <>
          <Chao rx={56} />
          <path d="M84 104h40V70a4 4 0 0 0-4-4H88a4 4 0 0 0-4 4Z" fill={BR} {...tr} />
          <path d="M116 68v36h8V70a4 4 0 0 0-4-4Z" fill={BG} />
          <rect x="82" y="56" width="44" height="12" rx="4" fill={CO} {...tr} />
          <circle cx="96" cy="86" r="5" fill={BGF} {...fino} />
          <circle cx="110" cy="80" r="5" fill={BGF} {...fino} />
          <path d="M22 18h50a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H48l-12 11V56H22a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8Z" fill={VC} {...tr} />
          <path d="M34 37h26" stroke={T} strokeWidth={5} strokeLinecap="round" />
        </>
      )
    case 'parque':
      return (
        <>
          <Chao rx={62} />
          <path d="M40 104V30M58 104V30" {...tr} />
          <path d="M40 46h18M40 62h18M40 78h18M40 94h18" {...fino} />
          <path d="M58 30h8c10 0 14 6 20 20l18 40c4 9 10 14 22 14" fill="none" stroke={VD} strokeWidth={12} strokeLinecap="round" />
          <path d="M58 30h8c10 0 14 6 20 20l18 40c4 9 10 14 22 14" fill="none" stroke={VS} strokeWidth={4} strokeLinecap="round" />
          <path d="M36 30h26" {...tr} />
          <path d="M20 104V84a8 8 0 0 1 8-8h0a8 8 0 0 1 8 8v20Z" fill={CO} {...tr} />
          <path d="M22 86h12" stroke={BR} strokeWidth={2} strokeLinecap="round" />
          <circle cx="136" cy="22" r="9" fill={CC} />
        </>
      )
    case 'toalha':
      return (
        <>
          <Chao rx={56} />
          <rect x="28" y="70" width="64" height="34" rx="6" fill={VC} {...tr} />
          <path d="M28 82h64" {...fino} />
          <path d="M28 94h64" stroke={CO} strokeWidth={3} />
          <rect x="34" y="46" width="52" height="24" rx="6" fill={BR} {...tr} />
          <path d="M34 56h52" {...fino} />
          <ellipse cx="118" cy="92" rx="16" ry="11" fill={CO} {...tr} />
          <circle cx="124" cy="76" r="8.5" fill={CO} {...tr} />
          <path d="M132 76h7l-6 4" fill={BGF} {...fino} />
          <rect x="104" y="34" width="16" height="26" rx="5" fill={BG} {...tr} />
          <path d="M108 34v-6h8v6" fill={BGF} {...fino} />
        </>
      )
    case 'cantinho':
      return (
        <>
          <Chao rx={60} />
          <path d="M24 104c-4-20 6-40 44-40s48 20 44 40Z" fill={VC} {...tr} />
          <path d="M40 80c10-6 26-6 36 0" fill="none" {...fino} />
          <path d="M120 104l-4-34h22l-4 34Z" fill={BR} {...tr} />
          <path d="M119 82h16l-1 10h-14Z" fill={VC} />
          <path d="M116 66c-3-4-4-9-2-14M134 66c3-4 4-9 2-14" fill="none" stroke={VS} strokeWidth={3} strokeLinecap="round" />
          <circle cx="40" cy="30" r="6" fill={CC} />
        </>
      )
    case 'frase':
      return (
        <>
          <path d="M18 22h80a10 10 0 0 1 10 10v30a10 10 0 0 1-10 10H58L40 88V72H18A10 10 0 0 1 8 62V32a10 10 0 0 1 10-10Z" fill={BR} {...tr} />
          <path d="M24 40h56M24 54h38" stroke={VS} strokeWidth={5} strokeLinecap="round" />
          <path d="M110 52h30a8 8 0 0 1 8 8v20a8 8 0 0 1-8 8h-6v10l-12-10h-12a8 8 0 0 1-8-8V60a8 8 0 0 1 8-8Z" fill={VC} {...tr} />
          <circle cx="116" cy="70" r="3" fill={T} />
          <circle cx="126" cy="70" r="3" fill={CO} />
          <circle cx="136" cy="70" r="3" fill={T} />
        </>
      )
    case 'ajuda':
      // Home: objetos das situações do dia a dia (tela, sair, banho), sem conversa
      return (
        <>
          <Chao rx={62} />
          <g transform="rotate(-8 52 58)">
            <rect x="26" y="20" width="50" height="68" rx="8" fill={BR} {...tr} />
            <rect x="33" y="28" width="36" height="46" rx="3" fill={VC} />
            <path d="M33 62c8-6 16-5 22 0s10 4 14 1v11H33Z" fill={VS} />
            <path d="M46 40 58 47.5 46 55Z" fill={CO} stroke={CO} strokeWidth={3} strokeLinejoin="round" />
          </g>
          <rect x="94" y="74" width="50" height="30" rx="6" fill={VC} {...tr} />
          <path d="M94 86h50" {...fino} />
          <rect x="99" y="56" width="40" height="18" rx="6" fill={BR} {...tr} />
          <path d="M106 65h26" stroke={VS} strokeWidth={3} strokeLinecap="round" />
          <Tenis x={38} y={70} escala={0.8} />
        </>
      )
    case 'vazio-combinados':
      return (
        <>
          <Chao rx={58} />
          <rect x="22" y="40" width="34" height="46" rx="6" fill={BR} {...tr} />
          <rect x="63" y="34" width="34" height="52" rx="6" fill={VC} {...tr} />
          <rect x="104" y="40" width="34" height="46" rx="6" fill={BR} {...tr} />
          <path d="M30 76h18M71 76h18M112 76h18" {...fino} />
          <circle cx="80" cy="56" r="7" fill={CO} />
        </>
      )
    case 'vazio-favoritos':
      return (
        <>
          <Chao rx={50} />
          <path d="M80 98c-14-8-30-9-44-5V45c14-4 30-3 44 5 14-8 30-9 44-5v48c-14-4-30-3-44 5Z" fill={BR} {...tr} />
          <path d="M80 50v48" {...fino} />
          <path d="M98 44v30l7-6 7 6V42" fill={CO} {...tr} />
        </>
      )
    case 'vazio-registros':
      return (
        <>
          <Chao rx={50} />
          <rect x="44" y="20" width="62" height="82" rx="6" fill={BR} {...tr} />
          <path d="M56 20v82" stroke={CO} strokeWidth={3} />
          <path d="M66 42h28M66 56h28M66 70h18" {...fino} />
          <g transform="rotate(30 118 66)">
            <rect x="113" y="34" width="10" height="52" rx="3" fill={VC} {...tr} />
            <path d="M113 86h10l-5 10Z" fill={BGF} {...fino} />
          </g>
        </>
      )
  }
}

export function Cena({ id, className, titulo }: { id: CenaId; className?: string; titulo?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={className}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      {cena(id)}
    </svg>
  )
}
