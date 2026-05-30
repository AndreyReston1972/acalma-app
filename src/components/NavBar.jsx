import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/emocoes', label: 'Emoções', icon: '💚' },
  { to: '/limites', label: 'Limites', icon: '🎯' },
  { to: '/diario', label: 'Diário', icon: '📔' },
  { to: '/nina', label: 'Nina', icon: '✨' },
]

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2 px-1">
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-verde' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
