import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/auth.store'
import { createSubmission } from '@/shared/api/submissions.api'
import { enrichLocation } from '@/shared/api/ai'
import Button from '@/shared/components/ui/Button'
import { MapPin, Sparkles, CheckCircle, Lock } from 'lucide-react'

const STEPS = ['Basic Info', 'AI Details', 'Photo & Submit']
const CATEGORIES = ['restaurant', 'cafe', 'bar', 'bakery', 'other']

export default function AddPlacePage() {
  const { user } = useAuthStore()
  const navigate  = useNavigate()
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAILoading] = useState(false)
  const [done, setDone]       = useState(false)

  const [form, setForm] = useState({
    name: '', address: '', city: '', category: 'restaurant', website_url: '',
    description: '', cuisine_types: [], tags: [], dietary_options: [], amenities: [],
    best_for: [], price_range: '', outdoor_seating: false, pet_friendly: false,
    must_try: '', insider_tip: '', photos: [],
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function fillWithAI() {
    if (!form.name || !form.city) return
    setAILoading(true)
    try {
      const data = await enrichLocation({ name: form.name, address: form.address, city: form.city, category: form.category })
      setForm((f) => ({ ...f, ...data }))
    } catch (err) { console.error(err) }
    finally { setAILoading(false) }
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      await createSubmission({ ...form, user_id: user.id, submitter_confirmed: true })
      setDone(true)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  if (done) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <CheckCircle size={64} className="text-emerald-400 mx-auto" />
        <h2 className="text-2xl font-black text-white">Thank you!</h2>
        <p className="text-white/60">Your submission is under review. Usually takes up to 48 hours.</p>
        <p className="text-white/40 text-sm">You'll get +100 points when it's approved!</p>
        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={() => { setDone(false); setForm({ name:'',address:'',city:'',category:'restaurant',website_url:'',description:'',cuisine_types:[],tags:[],dietary_options:[],amenities:[],best_for:[],price_range:'',outdoor_seating:false,pet_friendly:false,must_try:'',insider_tip:'',photos:[] }); setStep(0) }} variant="secondary">Add Another</Button>
          <Button onClick={() => navigate('/dashboard')}>Home</Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-safe">
      {/* Progress */}
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/5 z-10 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => step > 0 ? setStep(s => s-1) : navigate(-1)} className="text-white/50 hover:text-white text-sm">←</button>
          <div className="flex-1">
            <p className="text-xs text-white/40 font-medium">Step {step+1} of {STEPS.length} — {STEPS[step]}</p>
            <div className="flex gap-1 mt-1">{STEPS.map((_,i) => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-blue-500' : 'bg-white/10'}`} />)}</div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Step 1 */}
        {step === 0 && <>
          <h1 className="text-xl font-black">Basic Information</h1>
          {['name','address','city'].map((f) => (
            <input key={f} placeholder={f.charAt(0).toUpperCase()+f.slice(1)+(f==='name'?' *':f==='address'?' *':'')}
              value={form[f]} onChange={set(f)} required={f!=='city'}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500" />
          ))}
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setForm((f) => ({ ...f, category: c }))}
                className={`py-2 px-3 rounded-xl text-sm font-semibold capitalize transition-colors border ${form.category===c ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}>
                {c}
              </button>
            ))}
          </div>
          <input placeholder="Website or Instagram (optional)" value={form.website_url} onChange={set('website_url')}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500" />
          <Button onClick={() => setStep(1)} disabled={!form.name || !form.address} className="w-full">Continue →</Button>
        </>}

        {/* Step 2 */}
        {step === 1 && <>
          <h1 className="text-xl font-black">Details</h1>

          {/* AI Panel */}
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-blue-300 flex items-center gap-2"><Sparkles size={16}/> AI can fill most fields for you</p>
            <Button onClick={fillWithAI} loading={aiLoading} variant="secondary" className="w-full border-blue-500/30 text-blue-300">
              <Sparkles size={16}/> Fill with AI — ~5 seconds
            </Button>
            <p className="text-xs text-blue-300/60">Based on: {form.name} in {form.city}</p>
          </div>

          <textarea placeholder="Description (AI will fill this)" value={form.description} onChange={set('description')} rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 resize-none" />

          <div className="grid grid-cols-4 gap-2">
            {['$','$$','$$$','$$$$'].map((p) => (
              <button key={p} onClick={() => setForm((f) => ({ ...f, price_range: p }))}
                className={`py-2 rounded-xl text-sm font-bold transition-colors border ${form.price_range===p ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}>
                {p}
              </button>
            ))}
          </div>

          {/* Must Try & Insider Tip — user only */}
          <div className="space-y-3 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Lock size={14}/> Only you know these — AI won't fill them
            </div>
            <input placeholder="Must Try (your recommendation)" value={form.must_try} onChange={set('must_try')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 text-sm" />
            <input placeholder="Insider Tip (secret worth sharing)" value={form.insider_tip} onChange={set('insider_tip')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 text-sm" />
          </div>

          <Button onClick={() => setStep(2)} className="w-full">Continue →</Button>
        </>}

        {/* Step 3 */}
        {step === 2 && <>
          <h1 className="text-xl font-black">Almost done!</h1>

          {/* Preview card */}
          <div className="bg-slate-800 rounded-2xl overflow-hidden border border-white/5">
            <div className="h-32 bg-gradient-to-br from-blue-900 to-slate-800 flex items-center justify-center">
              <MapPin size={40} className="text-blue-400 opacity-50" />
            </div>
            <div className="p-4 space-y-1">
              <p className="font-black text-white">{form.name || 'Your Place'}</p>
              <p className="text-white/50 text-sm">{form.address}</p>
              {form.price_range && <span className="text-xs font-bold text-blue-400">{form.price_range}</span>}
              {form.description && <p className="text-white/60 text-xs line-clamp-2 mt-2">{form.description}</p>}
            </div>
          </div>

          <p className="text-white/40 text-sm text-center">📸 Photo upload coming soon — you can add a photo after approval</p>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" required className="mt-0.5 accent-blue-500" />
            <span className="text-sm text-white/70">I confirm this is a real place and the information is accurate</span>
          </label>

          <Button onClick={handleSubmit} loading={loading} className="w-full text-base py-3.5">
            <CheckCircle size={18}/> Submit for Review
          </Button>
          <p className="text-white/30 text-xs text-center">+100 points when approved • Usually within 48 hours</p>
        </>}
      </div>
    </div>
  )
}
