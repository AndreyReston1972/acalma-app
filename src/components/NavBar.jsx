import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/emocoes', label: 'Emoções', icon: '💚' },
  { to: '/limites', label: 'Limites', icon: '🎯' },
  { to: '/diario', label: 'Diário', icon: '📔' },
]

export default function NavBar() {
  return (
    <nav
      className="navbar-glass fixed left-1/2 -translate-x-1/2 z-50"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom) + 14px)',
        width: 'calc(100% - 28px)',
        maxWidth: 402,
      }}
    >
      <div
        className="flex justify-around items-center px-2"
        style={{ paddingTop: 10, paddingBottom: 10 }}
      >
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex flex-col items-center transition-colors"
            style={({ isActive }) => ({
              gap: 3,
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 4,
              paddingBottom: 4,
              color: isActive ? '#4A7C65' : '#999999',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#4A7C65' : '#999999',
                }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
