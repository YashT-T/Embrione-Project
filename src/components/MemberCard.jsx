// Dark card used on /team and /admin.
// Anything placed between <MemberCard> ... </MemberCard> (like the admin buttons) shows at the bottom.

// Adds https:// if the user typed a link like "linkedin.com/in/..."
const full = (url) => (url.startsWith('http') ? url : `https://${url}`)

export default function MemberCard({ member, children }) {
  const { name, domain, position, bio, photo_url, branch, semester, linkedin_url, github_url } = member
  const isLead = position === 'Head' // the Head gets the lime chip

  return (
    <article className="card group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 ease-out hover:-translate-y-1.5 hover:border-lime/60 hover:shadow-[0_20px_40px_-20px_rgba(216,240,110,0.22)]">
      <div className="p-3.5">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
            isLead ? 'bg-lime text-lime-ink' : 'border border-line bg-bg text-ink transition-colors duration-300 group-hover:border-lime/60 group-hover:text-lime'
          }`}
        >
          {domain}
        </span>
      </div>

      {/* Photo */}
      <div className="overflow-hidden">
        <img src={photo_url} alt={name} className="card-photo aspect-[4/3] w-full object-cover" />
      </div>    
        {/* Text */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-[22px] font-medium leading-tight transition-colors duration-300 group-hover:text-lime">{name}</h3>
          <span className="shrink-0 text-sm text-muted">{position}</span>
        </div>

        <p className="mt-2 line-clamp-3 text-[15px] leading-snug text-muted">{bio}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            <span>
              {branch} · Sem {semester}
            </span>
            <span className="flex gap-3">
              {linkedin_url && (
                <a href={full(linkedin_url)} target="_blank" rel="noreferrer" className="transition-colors hover:text-lime">
                  LinkedIn
                </a>
              )}
              {github_url && (
                <a href={full(github_url)} target="_blank" rel="noreferrer" className="transition-colors hover:text-lime">
                  GitHub
                </a>
              )}
            </span>
          </div>

          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </article>
  )
}
