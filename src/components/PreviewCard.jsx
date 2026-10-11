// The light "live preview" card on /register. It updates as the person types.
export default function PreviewCard({ member }) {
  const { name, domain, position, bio, photo_url } = member

  // "Yashwanth Reddy" -> "YR". Shows "YN" (Your Name) while the name is empty.
  const initials =
    (name || 'Your Name')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'YN'

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-cream text-bg">
      {/* Photo, or initials until a photo is chosen */}
      <div className="flex h-56 items-center justify-center bg-olive">
        {photo_url ? (
          <img src={photo_url} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-6xl tracking-[0.12em] text-[#d6d7cc]">{initials}</span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-2xl font-medium leading-tight">{name || 'Your name'}</h3>
        <p className="mt-1 font-medium">{position || 'Position'}</p>

        <span className="mt-3 inline-block rounded-full border border-bg/30 px-3 py-1 text-xs">{domain || 'Domain'}</span>

        <p className="mt-4 text-[15px] leading-snug">
          {bio || 'Tell us what drives you. Share your story, your craft, and where you want to grow next.'}
        </p>

        <p className="mt-4 border-t border-bg/15 pt-3 text-sm text-bg/60">Your next chapter starts here.</p>
      </div>
    </article>
  )
}
