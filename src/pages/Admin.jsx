import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import MemberCard from '../components/MemberCard'
import { supabase } from '../lib/supabase'

// Fixed credentials required by the challenge (client-side check only)
const ADMIN_EMAIL = 'admin@embrione.pes.edu'
const ADMIN_PASSWORD = 'EmbrioneAdmin@2026'

// ---------- Login ----------
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false) // show / hide the password

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
    <>
      <header>
        <p className="label">Embrione / Member operations</p>
        <h1 className="hero-title">A little care. A stronger collective.</h1>
        <p className="hero-sub">A considered space to review new members and welcome the next wave of curious minds.</p>
      </header>

      <form onSubmit={handleSubmit} className="mt-14 max-w-xl rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <h2 className="font-display text-[28px] font-medium tracking-tight">Welcome back.</h2>

        <label className="mt-6 block">
          <span className="label mb-2 block">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@embrione.pes.edu"
            className="input"
          />
        </label>

        <label className="mt-5 block">
          <span className="label mb-2 block">Password</span>
          <div className="flex gap-2">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="rounded-xl border border-line px-4 text-sm transition-colors hover:border-ink/50"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-lime py-3.5 text-[15px] font-medium text-lime-ink transition hover:brightness-95"
        >
          Enter review desk
        </button>
      </form>
    </>
  )
}

// ---------- One stat card ----------
function Stat({ label, value, highlight }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="label">{label}</p>
      <p className={`mt-2 font-display text-6xl font-medium leading-none tabular-nums ${highlight ? 'text-lime' : ''}`}>
        {value}
      </p>
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
    <>
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="label">Embrione / Admin</p>
          <h1 className="hero-title">Review desk.</h1>
        </div>
        <button
          onClick={onLogout}
          className="rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
        >
          Log out
        </button>
      </header>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <Stat label="Total" value={members.length} />
        <Stat label="Pending" value={pending.length} highlight={pending.length > 0} />
        <Stat label="Approved" value={approvedCount} />
      </div>

      <div className="mt-10 flex items-baseline gap-3 border-y border-line py-4">
        <span className="label">Pending approval</span>
        <span className="text-[15px] font-semibold">{pending.length}</span>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : pending.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line py-14 text-center text-muted">
            Nothing waiting. All caught up.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((m) => (
              <MemberCard key={m.id} member={m}>
                <p className="mb-3 truncate text-xs text-muted">
                  {m.srn} · {m.email}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(m.id, 'approved')}
                    className="flex-1 rounded-xl bg-lime py-2.5 text-sm font-medium text-lime-ink transition hover:brightness-95"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(m.id, 'rejected')}
                    className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium transition-colors hover:border-ink/50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => deleteMember(m.id)}
                    className="rounded-xl px-3 text-sm text-muted transition-colors hover:text-ink"
                  >
                    Delete
                  </button>
                </div>
              </MemberCard>
            ))}
          </div>
        )}
      </div>
    </>
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
