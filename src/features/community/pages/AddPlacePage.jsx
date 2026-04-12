import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Sparkles, CheckCircle, Lock, ChevronLeft,
  Utensils, Globe, AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/shared/store/auth.store'
import { createSubmission } from '@/shared/api/submissions.api'
import { enrichLocation } from '@/shared/api/ai'
import Button from '@/shared/components/ui/Button'

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'basic',   label: 'Basic Info',   icon: MapPin },
  { id: 'details', label: 'AI Details',   icon: Sparkles },
  { id: 'review',  label: 'Review',       icon: CheckCircle },
]

const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'cafe',       label: 'Café',       emoji: '☕' },
  { id: 'bar',        label: 'Bar',        emoji: '🍺' },
  { id: 'bakery',     label: 'Bakery',     emoji: '🥐' },
  { id: 'other',      label: 'Other',      emoji: '📍' },
]

const PRICE_LEVELS = [
  { id: '$',    label: '€',    sub: 'Budget' },
  { id: '$$',   label: '€€',   sub: 'Mid' },
  { id: '$$$',  label: '€€€',  sub: 'Premium' },
  { id: '$$$$', label: '€€€€', sub: 'Fine Dining' },
]

const EMPTY_FORM = {
  name: '', address: '', city: '', category: 'restaurant', website_url: '',
  description: '', cuisine_types: [], tags: [], dietary_options: [],
  amenities: [], best_for: [], price_range: '', outdoor_seating: false,
  pet_friendly: false, must_try: '', insider_tip: '',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className={`
            w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
            ${i < step  ? 'bg-blue-600 text-white'
            : i === step ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
                         : 'bg-white/10 text-white/30'}
          `}>
            {i < step ? <CheckCircle size={14} /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 sm:w-12 h-0.5 transition-all duration-500 ${i < step ? 'bg-blue-600' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function TextInput({ label, value, onChange, required, placeholder, type = 'text' }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
          placeholder:text-white/25 focus:outline-none focus:border-blue-500 focus:bg-white/8
          transition-all text-sm"
      />
    </div>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <span className="text-sm text-white/70">{label}</span>
      <div
        onClick={onChange}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 cursor-pointer
          ${value ? 'bg-blue-600' : 'bg-white/15'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200
          ${value ? 'translate-x-4.5' : 'translate-x-0'}`} />
      </div>
    </label>
  )
}

// ── Success screen ────────────────────────────────────────────────────────────

function SuccessScreen({ onAddAnother, onHome }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="text-center space-y-5 max-w-sm"
      >
        <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={44} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Submitted!</h2>
          <p className="text-white/60 mt-2">
            Our team will review your submission. Usually takes up to 48 hours.
          </p>
        </div>
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
          <p className="text-blue-300 text-sm font-semibold">🏆 +100 points</p>
          <p className="text-blue-300/60 text-xs">Credited to your account when approved</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onAddAnother} variant="secondary" className="flex-1">Add Another</Button>
          <Button onClick={onHome} className="flex-1">Back to Home</Button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AddPlacePage() {
  const { user }   = useAuthStore()
  const navigate   = useNavigate()

  const [step, setStep]           = useState(0)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [aiLoading, setAILoading] = useState(false)
  const [aiDone, setAIDone]       = useState(false)
  const [aiError, setAIError]     = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const setCheck = (field) => () =>
    setForm((f) => ({ ...f, [field]: !f[field] }))

  // ── AI enrichment ──
  async function fillWithAI() {
    if (!form.name) return
    setAIError('')
    setAILoading(true)
    try {
      const data = await enrichLocation({
        name:     form.name,
        address:  form.address,
        city:     form.city,
        category: form.category,
      })
      // Never overwrite must_try or insider_tip — those are user-only fields
      const { must_try: _mt, insider_tip: _it, ...safe } = data
      setForm((f) => ({ ...f, ...safe }))
      setAIDone(true)
    } catch (err) {
      console.error(err)
      setAIError('AI fill failed. Please fill the fields manually.')
    } finally {
      setAILoading(false)
    }
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!confirmed) return
    setError('')
    setLoading(true)
    try {
      await createSubmission({
        ...form,
        user_id:              user.id,
        submitter_confirmed:  true,
        status:               'pending',
      })
      setDone(true)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setForm(EMPTY_FORM)
    setStep(0)
    setAIDone(false)
    setAIError('')
    setConfirmed(false)
    setError('')
    setDone(false)
  }

  // ── Step validation ──
  const canGoNext = [
    form.name.trim().length > 0 && form.address.trim().length > 0,
    true,
    confirmed,
  ]

  if (done) {
    return (
      <SuccessScreen
        onAddAnother={reset}
        onHome={() => navigate('/dashboard')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-10">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => (step > 0 ? setStep((s) => s - 1) : navigate(-1))}
            className="text-white/50 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-white/40 font-medium mb-2">
              {STEPS[step].label}
            </p>
            <ProgressBar step={step} />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* ═══════════════════════════════ STEP 1: Basic ═══════════════ */}
          {step === 0 && (
            <motion.div key="basic"
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <h1 className="text-2xl font-black text-white">Add a Place</h1>
                <p className="text-white/50 text-sm mt-1">
                  Tell us about the spot — AI will help with the details.
                </p>
              </div>

              <TextInput label="Place name" value={form.name} onChange={setField('name')} required />
              <TextInput label="Street address" value={form.address} onChange={setField('address')} required />
              <TextInput label="City" value={form.city} onChange={setField('city')} required />

              {/* Category chips */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all
                        ${form.category === c.id
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'}
                      `}
                    >
                      <span>{c.emoji}</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe size={12} /> Website or Instagram
                  <span className="font-normal normal-case text-white/30">(optional)</span>
                </label>
                <input
                  type="url"
                  value={form.website_url}
                  onChange={setField('website_url')}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                    placeholder:text-white/25 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>

              <Button
                onClick={() => setStep(1)}
                disabled={!canGoNext[0]}
                className="w-full py-3.5"
              >
                Continue →
              </Button>
            </motion.div>
          )}

          {/* ══════════════════════════════ STEP 2: Details ═══════════════ */}
          {step === 1 && (
            <motion.div key="details"
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <h1 className="text-2xl font-black text-white">Details</h1>
                <p className="text-white/50 text-sm mt-1">
                  Let AI do the heavy lifting — then add your personal touch.
                </p>
              </div>

              {/* AI enrichment panel */}
              <div className={`border rounded-2xl p-4 space-y-3 transition-all ${
                aiDone
                  ? 'bg-emerald-600/10 border-emerald-500/30'
                  : 'bg-blue-600/10 border-blue-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold flex items-center gap-2 ${aiDone ? 'text-emerald-300' : 'text-blue-300'}`}>
                    {aiDone ? <CheckCircle size={16} /> : <Sparkles size={16} />}
                    {aiDone ? 'Fields filled by AI' : 'AI can fill most fields for you'}
                  </p>
                </div>
                {!aiDone && (
                  <Button
                    onClick={fillWithAI}
                    loading={aiLoading}
                    variant="secondary"
                    className="w-full border-blue-500/30 text-blue-300 text-sm"
                    disabled={!form.name}
                  >
                    <Sparkles size={14} /> Fill with AI
                  </Button>
                )}
                {aiDone && (
                  <button
                    onClick={() => { setAIDone(false) }}
                    className="text-xs text-emerald-400/60 hover:text-emerald-400 transition-colors"
                  >
                    Fill again
                  </button>
                )}
                {aiError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} /> {aiError}
                  </p>
                )}
                <p className="text-xs text-blue-300/50">
                  Based on: <span className="text-blue-300/70">{form.name}{form.city ? `, ${form.city}` : ''}</span>
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={setField('description')}
                  placeholder="What makes this place special? AI will suggest something…"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                    placeholder:text-white/25 focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
                />
              </div>

              {/* Price range */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Price range</p>
                <div className="grid grid-cols-4 gap-2">
                  {PRICE_LEVELS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, price_range: p.id }))}
                      className={`
                        flex flex-col items-center py-2.5 rounded-xl text-sm border transition-all
                        ${form.price_range === p.id
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'}
                      `}
                    >
                      <span className="font-bold">{p.label}</span>
                      <span className="text-[10px] opacity-60">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-white/3 border border-white/8 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Features</p>
                <Toggle label="🌿 Outdoor seating" value={form.outdoor_seating} onChange={setCheck('outdoor_seating')} />
                <Toggle label="🐾 Pet friendly" value={form.pet_friendly}     onChange={setCheck('pet_friendly')} />
              </div>

              {/* Must Try & Insider Tip — user exclusive */}
              <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400/80 text-xs font-semibold">
                  <Lock size={12} />
                  Your personal insights — AI can't guess these
                </div>
                <input
                  value={form.must_try}
                  onChange={setField('must_try')}
                  placeholder="Must try dish or drink…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white
                    placeholder:text-white/25 focus:outline-none focus:border-amber-500 transition-all text-sm"
                />
                <input
                  value={form.insider_tip}
                  onChange={setField('insider_tip')}
                  placeholder="Insider tip (e.g. ask for the secret menu)…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white
                    placeholder:text-white/25 focus:outline-none focus:border-amber-500 transition-all text-sm"
                />
              </div>

              <Button onClick={() => setStep(2)} className="w-full py-3.5">
                Continue →
              </Button>
            </motion.div>
          )}

          {/* ══════════════════════════════ STEP 3: Review ════════════════ */}
          {step === 2 && (
            <motion.div key="review"
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <h1 className="text-2xl font-black text-white">Review & Submit</h1>
                <p className="text-white/50 text-sm mt-1">
                  Check the details and confirm — our team will review within 48 hours.
                </p>
              </div>

              {/* Preview card */}
              <div className="bg-slate-800 rounded-2xl overflow-hidden border border-white/8">
                {/* Placeholder image */}
                <div className="h-36 bg-gradient-to-br from-blue-900/60 to-slate-800 flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <Utensils size={32} className="text-white/20 mx-auto" />
                    <p className="text-white/20 text-xs">Photo coming after approval</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-black text-white text-lg leading-tight">{form.name || '—'}</p>
                    {form.price_range && (
                      <span className="text-xs font-bold text-blue-400 shrink-0 mt-0.5">{form.price_range}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50 text-sm">
                    <MapPin size={13} />
                    <span>{[form.address, form.city].filter(Boolean).join(', ') || '—'}</span>
                  </div>
                  {form.category && (
                    <span className="inline-block text-xs bg-white/10 text-white/70 rounded-lg px-2 py-0.5 capitalize">
                      {form.category}
                    </span>
                  )}
                  {form.description && (
                    <p className="text-white/50 text-xs line-clamp-3 pt-1">{form.description}</p>
                  )}
                  <div className="flex gap-3 text-xs text-white/40 pt-1">
                    {form.outdoor_seating && <span>🌿 Outdoor</span>}
                    {form.pet_friendly    && <span>🐾 Pet friendly</span>}
                  </div>
                  {form.must_try && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mt-2">
                      <p className="text-amber-400 text-xs font-semibold">Must try</p>
                      <p className="text-white/70 text-xs">{form.must_try}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/3 transition-colors">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                    ${confirmed ? 'bg-blue-600 border-blue-600' : 'border-white/30 bg-white/5'}`}>
                    {confirmed && <CheckCircle size={12} className="text-white" />}
                  </div>
                </div>
                <span className="text-sm text-white/70 leading-relaxed">
                  I confirm this is a real place and all the information I've provided is accurate to the best of my knowledge.
                </span>
              </label>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!confirmed}
                className="w-full py-3.5 text-base"
              >
                <CheckCircle size={18} /> Submit for Review
              </Button>

              <p className="text-white/25 text-xs text-center">
                🏆 +100 points credited on approval · Typically reviewed within 48 hours
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
