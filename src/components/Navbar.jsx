import { NavLink } from 'react-router-dom'

const links = [
  { to: '/team', label: 'The team' },
  { to: '/register', label: 'Join us' },
  { to: '/admin', label: 'Admin' },
]

// Six-armed asterisk logo
function Asterisk() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="text-lime">
      <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
    </svg>
  )
}

export default function Navbar() {
  return (
    <header className="mx-auto w-full max-w-[1120px] px-6">
      <div className="flex items-center justify-between border-b border-line py-5">
        <NavLink to="/" className="flex items-center gap-3">
          <Asterisk />
          <span className="font-display text-2xl font-bold tracking-tight">embrione</span>
        </NavLink>

        <nav className="flex items-center gap-5 text-sm sm:gap-7">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `transition-colors ${isActive ? 'text-lime' : 'text-muted hover:text-ink'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
