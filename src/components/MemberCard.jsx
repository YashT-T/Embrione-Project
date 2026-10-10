const DEFAULT_AVATAR = 'https://api.dicebear.com/9.x/initials/svg?seed=?&backgroundColor=27272a'

export default function MemberCard({ member }) {
  const { name, domain, position, bio, photo_url, branch, semester } = member

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center shadow-lg transition hover:-translate-y-1 hover:border-indigo-500">
      <img
        src={photo_url || DEFAULT_AVATAR}
        alt="Profile"
        className="mx-auto h-28 w-28 rounded-full border-2 border-indigo-500 object-cover"
      />
      <h3 className="mt-4 truncate text-xl font-semibold text-white">
        {name || 'Your Name'}
      </h3>
      <p className="text-sm text-indigo-400">
        {position || 'Position'} · {domain || 'Domain'}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {branch || 'Branch'} · Sem {semester || '?'}
      </p>
      <p className="mt-3 line-clamp-4 text-sm text-zinc-400">
        {bio || 'Your short bio will appear here...'}
      </p>
    </div>
  )
}
