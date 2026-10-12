import { Cena, type CenaId } from '../ilustracoes/Cena'

/* Moldura padrão das cenas em tamanho pequeno (listas, faixas, editor). */
export function Miniatura({ id, tamanho = 'm', className = '' }: { id: CenaId; tamanho?: 'p' | 'm' | 'g'; className?: string }) {
  const medidas = { p: 'h-9 w-12 rounded-[10px]', m: 'h-12 w-16 rounded-xl', g: 'h-[4.5rem] w-24 rounded-2xl' }[tamanho]
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center overflow-hidden bg-bege ${medidas} ${className}`}>
      <Cena id={id} className="h-full w-full" />
    </span>
  )
}

/* Faixa de passos: as cenas em sequência, levemente sobrepostas, como cartões. */
export function Faixa({ cenas, compacta = false, className = '' }: { cenas: CenaId[]; compacta?: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={`flex items-center ${className}`}>
      {cenas.map((c, i) => (
        <span
          key={`${c}-${i}`}
          className={`grid shrink-0 place-items-center overflow-hidden rounded-[10px] border-2 border-creme bg-bege first:ml-0 ${compacta ? '-ml-5 h-9 w-12' : '-ml-2.5 h-10 w-[3.25rem]'}`}
          style={{ zIndex: cenas.length - i }}
        >
          <Cena id={c} className="h-full w-full" />
        </span>
      ))}
    </span>
  )
}
