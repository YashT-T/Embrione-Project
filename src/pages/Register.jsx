import { useState } from 'react'
import toast from 'react-hot-toast'
import MemberCard from '../components/MemberCard'
import { supabase } from '../lib/supabase'
import { convertToWebp } from '../lib/convertToWebp'

const DOMAINS = ['Web Development', 'Design', 'Logistics', 'Operations', 'Sponsorship', 'Hospitality', 'Social Media', 'Event Management']
const POSITIONS = ['Head', 'Vice-Head', 'Core Member', 'Member']
const BRANCHES = ['CSE', 'AIML', 'ECE', 'EEE', 'ME', 'Biotech', 'Other']
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

const emptyForm = {
  name: '', domain: '', position: '', srn: '', email: '',
  linkedin_url: '', github_url: '', branch: '', semester: '', bio: '',
}

// bg-form-field = input color (dark mode: same as the card body; light mode: unchanged)
const inputClass =
  'w-full rounded-lg border border-line bg-form-field px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/30'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function Select({ name, value, onChange, options, placeholder }) {
  return (
    <select name={name} value={value} onChange={onChange} className={inputClass}>
      <option value="">{placeholder}</option>
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFile(e) {
    const picked = e.target.files[0]
    if (!picked) return
    if (!['image/png', 'image/jpeg'].includes(picked.type)) {
      toast.error('Please choose a .png, .jpg or .jpeg image')
      return
    }
    setFile(picked)
    setPreviewUrl(URL.createObjectURL(picked))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const formEl = e.target

    const required = ['name', 'domain', 'position', 'srn', 'email', 'branch', 'semester']
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

      const webpBlob = await convertToWebp(file)
      const fileName = `${srn}-${Date.now()}.webp`
      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(fileName, webpBlob, { contentType: 'image/webp' })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('member-photos').getPublicUrl(fileName)

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
      formEl.reset()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold text-muted">Recruitment 2026</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
         <span className="font-script mr-2 text-5xl font-bold sm:mr-3 sm:text-6xl">Join</span> the Embrione team
        </h1>
        <p className="mt-3 text-muted">
          Fill in your details on the left. The card on the right is what the admins will review.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* LEFT: form (bg-form = card banner color in dark mode, white in light mode) */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-line bg-form p-6 shadow-sm sm:p-8"
        >
          <Field label="Full name">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className={inputClass} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Domain">
              <Select name="domain" value={form.domain} onChange={handleChange} options={DOMAINS} placeholder="Select domain" />
            </Field>
            <Field label="Position">
              <Select name="position" value={form.position} onChange={handleChange} options={POSITIONS} placeholder="Select position" />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="SRN">
              <input name="srn" value={form.srn} onChange={handleChange} placeholder="PES1UG25CS001" className={inputClass} />
            </Field>
            <Field label="Email">
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@pes.edu" className={inputClass} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="LinkedIn URL">
              <input name="linkedin_url" value={form.linkedin_url} onChange={handleChange} placeholder="linkedin.com/in/..." className={inputClass} />
            </Field>
            <Field label="GitHub URL">
              <input name="github_url" value={form.github_url} onChange={handleChange} placeholder="github.com/..." className={inputClass} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Branch">
              <Select name="branch" value={form.branch} onChange={handleChange} options={BRANCHES} placeholder="Select branch" />
            </Field>
            <Field label="Semester">
              <Select name="semester" value={form.semester} onChange={handleChange} options={SEMESTERS} placeholder="Select semester" />
            </Field>
          </div>

          <Field label="Short bio">
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              maxLength={200}
              rows={4}
              placeholder="Tell us about yourself (150-200 characters)"
              className={inputClass}
            />
            <p className={`mt-1 text-right text-xs ${form.bio.length >= 150 ? 'font-semibold text-ink' : 'text-muted'}`}>
              {form.bio.length}/200
            </p>
          </Field>

          <Field label="Profile picture">
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFile}
              className="w-full rounded-lg border border-dashed border-line bg-form-field p-3 text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-soft file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:brightness-95"
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-accent-ink transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit profile'}
          </button>
        </form>

        {/* RIGHT: live preview */}
        <div className="flex flex-col items-center lg:sticky lg:top-8 lg:self-start">
          <p className="mb-4 flex items-center gap-2 self-start text-sm font-medium text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Live preview
          </p>
          <MemberCard member={{ ...form, photo_url: previewUrl }} />
        </div>
      </div>
    </div>
  )
}
