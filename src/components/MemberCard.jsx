const DEFAULT_AVATAR =
  'https://api.dicebear.com/9.x/initials/svg?seed=?&backgroundColor=bdddfc&textColor=384959'

export default function MemberCard({ member }) {
  const { name, domain, position, bio, photo_url, branch, semester, linkedin_url, github_url } = member

  return (
    <article className="w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="h-24 bg-soft" />

      <div className="-mt-12 px-6 pb-6">
        <img
          src={photo_url || DEFAULT_AVATAR}
          alt="Profile"
          className="h-24 w-24 rounded-full border-4 border-card bg-paper object-cover"
        />

        <h3 className="mt-3 truncate text-xl font-bold">{name || 'Your Name'}</h3>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-ink">
            {position || 'Position'}
          </span>
          <span className="rounded-md bg-soft px-2.5 py-1 text-xs font-semibold text-ink">
            {domain || 'Domain'}
          </span>
        </div>

        <p className="mt-3 text-xs text-muted">
          {branch || 'Branch'} · Semester {semester || '?'}
        </p>

        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">
          {bio || 'Your bio shows up here as you type it.'}
        </p>

        {(linkedin_url || github_url) && (
          <div className="mt-4 flex gap-2 border-t border-line pt-4 text-xs font-medium">
            {linkedin_url && (
              <a href={linkedin_url} target="_blank" rel="noreferrer" className="rounded-lg border border-line px-3 py-1.5 transition hover:bg-soft">
                LinkedIn
              </a>
            )}
            {github_url && (
              <a href={github_url} target="_blank" rel="noreferrer" className="rounded-lg border border-line px-3 py-1.5 transition hover:bg-soft">
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}