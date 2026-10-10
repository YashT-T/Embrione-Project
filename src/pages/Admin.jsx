import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import MemberCard from '../components/MemberCard'
import { supabase } from '../lib/supabase'

// Fixed credentials required by the challenge (client-side check only)
const ADMIN_EMAIL = 'admin@embrione.pes.edu'
const ADMIN_PASSWORD = 'EmbrioneAdmin@2026'

const inputClass =
  'w-full rounded-lg border border-line bg-field px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/30'

// ---------- Login screen ----------
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('isAdmin', 'true') // remembered until the tab closes
      onLogin()
    } else {
      toast.error('Wrong email or password')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8"
      >
        <h1 className="text-2xl font-extrabold tracking-tight">Admin login</h1>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@embrione.pes.edu"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-accent-ink transition hover:brightness-95 active:scale-[0.99]"
        >
          Log in
        </button>
      </form>
    </div>
  )
}

// ---------- Small counter card ----------
function Counter({ label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
    </div>
  )
}

// ---------- Dashboard (shown after login) ----------
function Dashboard({ onLogout }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // Get every member from Supabase, newest first
  async function loadMembers() {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    else setMembers(data)
    setLoading(false)
  }

  // Runs once when the dashboard opens
  useEffect(() => {
    loadMembers()
  }, [])

  // Approve or reject = change the status column, then reload the list
  async function updateStatus(id, status) {
    const { error } = await supabase.from('members').update({ status }).eq('id', id)
    if (error) return toast.error(error.message)
    toast.success(status === 'approved' ? 'Member approved' : 'Member rejected')
    loadMembers()
  }

  // Optional bonus: delete the row
  async function deleteMember(id) {
    if (!window.confirm('Delete this profile permanently?')) return
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) return toast.error(error.message)
    toast.success('Member deleted')
    loadMembers()
  }

  // Numbers for the counters are worked out from the list
  const pending = members.filter((m) => m.status === 'pending')
  const approvedCount = members.filter((m) => m.status === 'approved').length

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Admin dashboard</h1>
        <button
          onClick={onLogout}
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium transition hover:bg-soft"
        >
          Log out
        </button>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Counter label="Total submissions" value={members.length} />
        <Counter label="Pending" value={pending.length} />
        <Counter label="Approved" value={approvedCount} />
      </div>

      <h2 className="mb-4 text-xl font-bold">Pending approval</h2>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : pending.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card p-8 text-center text-muted">
          No pending profiles right now.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map((m) => (
            <div key={m.id} className="flex flex-col gap-3">
              <MemberCard member={m} />
              <p className="truncate text-xs text-muted">
                {m.srn} · {m.email}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(m.id, 'approved')}
                  className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-accent-ink transition hover:brightness-95"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(m.id, 'rejected')}
                  className="flex-1 rounded-lg border border-line py-2 text-sm font-semibold transition hover:bg-soft"
                >
                  Reject
                </button>
                <button
                  onClick={() => deleteMember(m.id)}
                  className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-muted transition hover:bg-soft hover:text-ink"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- The page: shows Login or Dashboard ----------
export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(sessionStorage.getItem('isAdmin') === 'true')

  function logout() {
    sessionStorage.removeItem('isAdmin')
    setLoggedIn(false)
  }

  return loggedIn ? <Dashboard onLogout={logout} /> : <Login onLogin={() => setLoggedIn(true)} />
}