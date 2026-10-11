import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import PreviewCard from '../components/PreviewCard'
import { supabase } from '../lib/supabase'
import { convertToWebp } from '../lib/convertToWebp'

// The first option of each list is the default selection
const DOMAINS = ['Web Development', 'Design', 'Logistics', 'Operations', 'Sponsorship', 'Hospitality', 'Social Media', 'Event Management']
const POSITIONS = ['Member', 'Core Member', 'Vice-Head', 'Head']
const BRANCHES = ['CSE', 'AIML', 'ECE', 'EEE', 'ME', 'Biotech', 'Other']
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

const emptyForm = {
  name: '', email: '', srn: '',
  branch: BRANCHES[0], semester: String(SEMESTERS[0]),
  domain: DOMAINS[0], position: POSITIONS[0],
  bio: '', linkedin_url: '', github_url: '',
}

// Small label above a field
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label mb-2 block">{label}</span>
      {children}
    </label>
  )
}

function Select({ name, value, onChange, options }) {
  return (
    <select name={name} value={value} onChange={onChange} className="input">
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

export default function Register() {
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null) // lets us clear the file input after submitting

  // Copy the old form, change only the field that was typed in
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Used for both "click to choose" and "drag and drop"
  function pickFile(picked) {
    if (!picked) return
    if (!['image/png', 'image/jpeg'].includes(picked.type)) {
      toast.error('Please choose a .png, .jpg or .jpeg image')
      return
    }
    setFile(picked)
    setPreviewUrl(URL.createObjectURL(picked)) // local preview only, nothing uploaded yet
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const required = ['name', 'email', 'srn', 'branch', 'semester', 'domain', 'position']
    if (required.some((field) => !form[field].trim())) {
      return toast.error('Please fill in all required fields')
    }
    if (form.bio.length < 150 || form.bio.length > 200) {
      return toast.error('Bio must be 150-200 characters')
    }
    if (!file) return toast.error('Please upload a profile picture')

    setLoading(true)
    try {
      const srn = form.srn.trim().toUpperCase()

      // 1. Duplicate SRN check
      const { data: existing, error: checkError } = await supabase
        .from('members')
        .select('id')
        .eq('srn', srn)
        .limit(1)
      if (checkError) throw checkError
      if (existing.length > 0) {
        toast.error('This SRN has already been submitted')
        return
      }

      // 2. Convert to WebP and upload
      const webpBlob = await convertToWebp(file)
      const fileName = `${srn}-${Date.now()}.webp`
      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(fileName, webpBlob, { contentType: 'image/webp' })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('member-photos').getPublicUrl(fileName)

      // 3. Save the row as pending
      const { error: insertError } = await supabase.from('members').insert({
        ...form,
        srn,
        semester: Number(form.semester),
        photo_url: urlData.publicUrl,
        status: 'pending',
      })
      if (insertError) throw insertError

      toast.success('Submitted! Your profile is awaiting admin approval.')
      setForm(emptyForm)
      setFile(null)
      setPreviewUrl('')
      fileRef.current.value = ''
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header>
        <p className="label">Embrione / Membership 2026</p>
        <h1 className="hero-title">Make yourself part of it.</h1>
        <p className="hero-sub">
          Good things begin with curious people. Tell us who you are, and what you want to build.
        </p>
      </header>

      <div className="mt-14 grid gap-8 lg:grid-cols-[368px_1fr]">
        {/* LEFT: live preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="label mb-3 flex items-center gap-2">
            Live preview <span className="h-2 w-2 rounded-full bg-live" />
          </p>
          <PreviewCard member={{ ...form, photo_url: previewUrl }} />
          <ol className="mt-5 space-y-1 text-sm text-muted">
            <li>01 Tell your story</li>
            <li>02 We review it</li>
            <li>03 Meet your people</li>
          </ol>
        </div>

        {/* RIGHT: form */}
        <form onSubmit={handleSubmit} className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="font-display text-[28px] font-medium tracking-tight">A few things about you</h2>
          <p className="mt-1 text-[15px] text-muted">Make it personal. Make it yours.</p>

          <div className="mt-7 grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <Field label="Full name">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" className="input" />
            </Field>
            <Field label="Email">
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@pes.edu" className="input" />
            </Field>

            <Field label="SRN">
              <input name="srn" value={form.srn} onChange={handleChange} placeholder="PES1UG25CS001" className="input" />
            </Field>
            <Field label="Branch">
              <Select name="branch" value={form.branch} onChange={handleChange} options={BRANCHES} />
            </Field>

            <Field label="Semester">
              <Select name="semester" value={form.semester} onChange={handleChange} options={SEMESTERS} />
            </Field>
            <Field label="Domain">
              <Select name="domain" value={form.domain} onChange={handleChange} options={DOMAINS} />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Position">
                <Select name="position" value={form.position} onChange={handleChange} options={POSITIONS} />
              </Field>
            </div>

            {/* Photo dropzone: click to choose, or drag a file onto it */}
            <div className="sm:col-span-2">
              <span className="label mb-2 block">Photo upload</span>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  pickFile(e.dataTransfer.files[0])
                }}
                className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed border-line px-4 py-7 text-center transition-colors hover:border-lime/60"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                  <path d="M12 16V4m0 0L7 9m5-5 5 5" />
                  <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                </svg>
                <span className="mt-1 max-w-full truncate text-[15px] font-medium">
                  {file ? file.name : 'Drop in your portrait'}
                </span>
                <span className="text-xs text-muted">
                  {file ? 'Click to change' : 'JPG/PNG · converted to WebP'}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => pickFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <Field label="Bio">
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  maxLength={200}
                  rows={4}
                  placeholder="150-200 characters"
                  className="input resize-none"
                />
              </Field>
              <p className={`mt-2 text-right text-xs tabular-nums ${form.bio.length >= 150 ? 'text-lime' : 'text-danger'}`}>
                {form.bio.length}/200
              </p>
            </div>

            {/* Optional links */}
            <details className="sm:col-span-2">
              <summary className="cursor-pointer text-[15px] font-medium">Add your links (optional)</summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="LinkedIn URL">
                  <input name="linkedin_url" value={form.linkedin_url} onChange={handleChange} placeholder="linkedin.com/in/..." className="input" />
                </Field>
                <Field label="GitHub URL">
                  <input name="github_url" value={form.github_url} onChange={handleChange} placeholder="github.com/..." className="input" />
                </Field>
              </div>
            </details>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-[15px] font-medium text-lime-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send for review'} <span aria-hidden>→</span>
          </button>
          <p className="mt-3 text-sm text-muted">Your profile appears publicly after approval.</p>
        </form>
      </div>
    </>
  )
}
