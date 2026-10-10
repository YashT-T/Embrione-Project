import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/register', label: 'Register' },
  { to: '/team', label: 'Team' },
  { to: '/admin', label: 'Admin' },
]

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.theme = next ? 'dark' : 'light'
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink transition hover:bg-soft"
    >
      {dark ? '☀ Light' : '☾ Dark'}
    </button>
  )
}

export default function Navbar() {
  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-accent" />
          <span className="text-lg font-extrabold tracking-tight">Embrione</span>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? 'bg-soft text-ink' : 'text-muted hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}