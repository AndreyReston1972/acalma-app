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
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <div
        className="flex justify-around items-center px-2"
        style={{
          paddingTop: 10,
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
        }}
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
