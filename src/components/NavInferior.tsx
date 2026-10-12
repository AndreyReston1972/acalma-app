import { NavLink } from 'react-router-dom'
import { IconeAgora, IconePreparar, IconeSalvos } from '../ilustracoes/icones'

const itens = [
  { para: '/', rotulo: 'Agora', Icone: IconeAgora, fim: true },
  { para: '/preparar', rotulo: 'Preparar', Icone: IconePreparar, fim: false },
  { para: '/salvos', rotulo: 'Salvos', Icone: IconeSalvos, fim: false },
]

/*
 * Navegação principal. O item atual é indicado por ícone preenchido,
 * texto em negrito e um traço acima, não só por cor.
 */
export function NavInferior() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-linha bg-creme pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="coluna grid grid-cols-3">
        {itens.map(({ para, rotulo, Icone, fim }) => (
          <li key={para}>
            <NavLink
              to={para}
              end={fim}
              className={({ isActive }) =>
                `tocavel relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-[0.8125rem] ${
                  isActive ? 'font-bold text-verde-profundo' : 'font-medium text-texto-2'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`absolute top-0 h-[3px] w-8 rounded-b-full bg-verde ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <Icone ativo={isActive} />
                  {rotulo}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
