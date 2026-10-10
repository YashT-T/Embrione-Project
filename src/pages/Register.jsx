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

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none'

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

  // runs on every keystroke: copies the old form and changes just one field
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
    setPreviewUrl(URL.createObjectURL(picked)) // local preview only, nothing uploaded yet
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // 1. validation
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

      // 2. duplicate SRN check
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

      // 3. convert to WebP and upload
      const webpBlob = await convertToWebp(file)
      const fileName = `${srn}-${Date.now()}.webp`
      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(fileName, webpBlob, { contentType: 'image/webp' })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('member-photos')
        .getPublicUrl(fileName)

      // 4. save the row as pending
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
      e.target.reset() // clears the file input
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2">
      {/* LEFT: form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Join the Team</h1>

        <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className={inputClass} />

        <div className="grid grid-cols-2 gap-4">
          <Select name="domain" value={form.domain} onChange={handleChange} options={DOMAINS} placeholder="Domain" />
          <Select name="position" value={form.position} onChange={handleChange} options={POSITIONS} placeholder="Position" />
        </div>

        <input name="srn" value={form.srn} onChange={handleChange} placeholder="SRN (e.g. PES1UG23CS001)" className={inputClass} />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className={inputClass} />
        <input name="linkedin_url" value={form.linkedin_url} onChange={handleChange} placeholder="LinkedIn URL" className={inputClass} />
        <input name="github_url" value={form.github_url} onChange={handleChange} placeholder="GitHub URL" className={inputClass} />

        <div className="grid grid-cols-2 gap-4">
          <Select name="branch" value={form.branch} onChange={handleChange} options={BRANCHES} placeholder="Branch" />
          <Select name="semester" value={form.semester} onChange={handleChange} options={SEMESTERS} placeholder="Semester" />
        </div>

        <div>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            maxLength={200}
            rows={4}
            placeholder="Short bio (150-200 characters)"
            className={inputClass}
          />
          <p className={`text-right text-xs ${form.bio.length >= 150 ? 'text-green-400' : 'text-zinc-500'}`}>
            {form.bio.length}/200
          </p>
        </div>

        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={handleFile}
          className="w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {/* RIGHT: live preview */}
      <div className="flex flex-col items-center lg:sticky lg:top-10 lg:self-start">
        <p className="mb-4 text-sm uppercase tracking-widest text-zinc-500">Live Preview</p>
        <MemberCard member={{ ...form, photo_url: previewUrl }} />
      </div>
    </div>
  )
}