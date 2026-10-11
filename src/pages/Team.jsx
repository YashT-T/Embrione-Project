import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import MemberCard from '../components/MemberCard'
import { supabase } from '../lib/supabase'

const DOMAINS = ['Web Development', 'Design', 'Logistics', 'Operations', 'Sponsorship', 'Hospitality', 'Social Media', 'Event Management']
const POSITIONS = ['Head', 'Vice-Head', 'Core Member', 'Member']

export default function Team() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [domain, setDomain] = useState('')
  const [position, setPosition] = useState('')

  // Runs once: fetch ONLY approved members from Supabase
  useEffect(() => {
    async function loadMembers() {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      if (error) toast.error(error.message)
      else setMembers(data)
      setLoading(false)
    }
    loadMembers()
  }, [])

  // Filtering happens in the browser: an empty filter means "show all"
  const shown = members.filter(
    (m) => (!domain || m.domain === domain) && (!position || m.position === position)
  )
  const filtering = domain || position

  return (
    <>
      <header>
        <p className="label">The Embrione Collective / PES University</p>
        <h1 className="hero-title">Different minds. Shared momentum.</h1>
        <p className="hero-sub">
          Meet the builders, thinkers, and makers turning a little curiosity into something that matters.
        </p>
      </header>

      {/* Directory bar: count on the left, filters on the right */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
        <p className="flex items-baseline gap-3">
          <span className="label">The directory</span>
          <span className="text-[15px] font-semibold">
            {shown.length} {shown.length === 1 ? 'member' : 'members'}
          </span>
        </p>

        <div className="flex flex-wrap gap-3">
          <div className="w-48">
            <select value={domain} onChange={(e) => setDomain(e.target.value)} className="input input-sm">
              <option value="">Domain: All</option>
              {DOMAINS.map((d) => (
                <option key={d} value={d}>Domain: {d}</option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <select value={position} onChange={(e) => setPosition(e.target.value)} className="input input-sm">
              <option value="">Position: All</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>Position: {p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line py-14 text-center text-muted">
            No members match these filters.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}

            {/* Invitation tile (hidden while filtering) */}
            {!filtering && (
              <Link
                to="/register"
                className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-line text-center transition-colors hover:border-lime/60"
              >
                <span className="text-[22px] font-medium">Your name could be here.</span>
                <span className="mt-1 text-muted">Join the collective</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
