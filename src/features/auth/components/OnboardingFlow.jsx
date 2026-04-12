import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/shared/store/auth.store'
import { updateProfile } from '@/shared/api/auth.api'
import Button from '@/shared/components/ui/Button'

// ── Data ────────────────────────────────────────────────────────────────────

const CUISINES = [
  { id: 'italian',    label: 'Italian',    emoji: '🍝' },
  { id: 'japanese',   label: 'Japanese',   emoji: '🍣' },
  { id: 'polish',     label: 'Polish',     emoji: '🥟' },
  { id: 'mexican',    label: 'Mexican',    emoji: '🌮' },
  { id: 'indian',     label: 'Indian',     emoji: '🍛' },
  { id: 'french',     label: 'French',     emoji: '🥐' },
  { id: 'american',   label: 'American',   emoji: '🍔' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
  { id: 'thai',       label: 'Thai',       emoji: '🍜' },
  { id: 'chinese',    label: 'Chinese',    emoji: '🥡' },
  { id: 'greek',      label: 'Greek',      emoji: '🫙' },
  { id: 'middle_eastern', label: 'Middle Eastern', emoji: '🧆' },
]

const VIBES = [
  { id: 'cozy',       label: 'Cozy & Intimate',  emoji: '🕯️' },
  { id: 'trendy',     label: 'Trendy & Hip',      emoji: '✨' },
  { id: 'family',     label: 'Family Friendly',   emoji: '👨‍👩‍👧' },
  { id: 'romantic',   label: 'Romantic',          emoji: '🌹' },
  { id: 'outdoor',    label: 'Outdoor Terrace',   emoji: '☀️' },
  { id: 'lively',     label: 'Lively & Social',   emoji: '🎉' },
]

const BUDGETS = [
  { id: 'budget',     label: 'Budget',      emoji: '💚', sub: 'Under €15/person',  price: '€' },
  { id: 'mid',        label: 'Mid-range',   emoji: '💛', sub: '€15–40/person',      price: '€€' },
  { id: 'premium',    label: 'Premium',     emoji: '🧡', sub: '€40+/person',        price: '€€€' },
]

const DIETARY = [
  { id: 'vegetarian', label: 'Vegetarian',  emoji: '🥗' },
  { id: 'vegan',      label: 'Vegan',       emoji: '🌱' },
  { id: 'gluten_free',label: 'Gluten Free', emoji: '🌾' },
  { id: 'halal',      label: 'Halal',       emoji: '☪️' },
  { id: 'kosher',     label: 'Kosher',      emoji: '✡️' },
  { id: 'dairy_free', label: 'Dairy Free',  emoji: '🥛' },
]

const STEPS = [
  { id: 'cuisines', title: 'What cuisines do you love?',  subtitle: 'Pick your favourites — we\'ll find the best spots', min: 1 },
  { id: 'vibes',    title: 'What\'s your ideal vibe?',    subtitle: 'How do you like your dining experience?', min: 1 },
  { id: 'budget',   title: 'What\'s your usual budget?',  subtitle: 'We\'ll personalise recommendations to match', min: 1 },
  { id: 'dietary',  title: 'Any dietary needs?',           subtitle: 'Optional — skip if none apply to you', min: 0 },
]

// ── Chip component ───────────────────────────────────────────────────────────

function Chip({ emoji, label, selected, onClick, wide }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-medium
        transition-all duration-200 cursor-pointer select-none
        ${wide ? 'col-span-2 sm:col-span-1' : ''}
        ${selected
          ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.5)]'
          : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10'
        }
      `}
    >
      <span className="text-base leading-none">{emoji}</span>
      <span>{label}</span>
      {selected && (
        <span className="absolute top-1 right-1.5">
          <Check size={10} className="text-blue-400" />
        </span>
      )}
    </button>
  )
}

// ── Progress bar ─────────────────────────────────────────────────────────────

function Progress({ step, total }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-500' : 'bg-white/10'}`}
        />
      ))}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function OnboardingFlow({ onComplete }) {
  const { user, setProfile } = useAuthStore()
  const [step, setStep]       = useState(0)
  const [dir,  setDir]        = useState(1)   // +1 → forward, -1 → backward
  const [saving, setSaving]   = useState(false)

  const [selections, setSelections] = useState({
    cuisines: [],
    vibes:    [],
    budget:   '',
    dietary:  [],
  })

  // Toggle multi-select
  const toggle = (key, id) => setSelections((s) => {
    const arr = s[key]
    return { ...s, [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] }
  })

  // Single select (budget)
  const pick = (key, id) => setSelections((s) => ({ ...s, [key]: id }))

  const canProceed = () => {
    const s = STEPS[step]
    if (s.id === 'cuisines') return selections.cuisines.length >= s.min
    if (s.id === 'vibes')    return selections.vibes.length >= s.min
    if (s.id === 'budget')   return !!selections.budget
    return true // dietary is optional
  }

  const next = () => {
    if (step < STEPS.length - 1) {
      setDir(1)
      setStep((s) => s + 1)
    } else {
      handleFinish()
    }
  }

  const back = () => {
    if (step > 0) {
      setDir(-1)
      setStep((s) => s - 1)
    }
  }

  async function handleFinish() {
    if (!user?.id) return
    setSaving(true)
    try {
      const foodie_dna = {
        cuisines:    selections.cuisines,
        vibes:       selections.vibes,
        price_range: selections.budget,
        dietary:     selections.dietary,
      }
      const updated = await updateProfile(user.id, {
        foodie_dna,
        onboarding_completed: true,
      })
      setProfile?.(updated)
      onComplete?.()
    } catch (err) {
      console.error('Onboarding save error:', err)
      // Still complete — don't block user on save failure
      onComplete?.()
    } finally {
      setSaving(false)
    }
  }

  const current = STEPS[step]

  const variants = {
    enter:   (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center:  { x: 0, opacity: 1 },
    exit:    (d) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin size={24} className="text-blue-500" />
            <span className="text-xl font-black text-white">GastroMap</span>
          </div>
          <Progress step={step} total={STEPS.length} />
          <p className="text-white/40 text-xs mt-3 tabular-nums">Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <h2 className="text-xl font-bold text-white mb-1">{current.title}</h2>
              <p className="text-white/50 text-sm mb-6">{current.subtitle}</p>

              {/* ── Step: Cuisines ── */}
              {current.id === 'cuisines' && (
                <div className="grid grid-cols-2 gap-2">
                  {CUISINES.map((c) => (
                    <Chip
                      key={c.id}
                      emoji={c.emoji}
                      label={c.label}
                      selected={selections.cuisines.includes(c.id)}
                      onClick={() => toggle('cuisines', c.id)}
                    />
                  ))}
                </div>
              )}

              {/* ── Step: Vibes ── */}
              {current.id === 'vibes' && (
                <div className="grid grid-cols-1 gap-2">
                  {VIBES.map((v) => (
                    <Chip
                      key={v.id}
                      emoji={v.emoji}
                      label={v.label}
                      selected={selections.vibes.includes(v.id)}
                      onClick={() => toggle('vibes', v.id)}
                      wide
                    />
                  ))}
                </div>
              )}

              {/* ── Step: Budget ── */}
              {current.id === 'budget' && (
                <div className="space-y-3">
                  {BUDGETS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => pick('budget', b.id)}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200
                        ${selections.budget === b.id
                          ? 'bg-blue-600/20 border-blue-500'
                          : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                        }
                      `}
                    >
                      <span className="text-2xl leading-none">{b.emoji}</span>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">{b.label}</div>
                        <div className="text-white/50 text-xs">{b.sub}</div>
                      </div>
                      <span className="text-white/60 font-mono text-sm font-bold">{b.price}</span>
                      {selections.budget === b.id && (
                        <Check size={16} className="text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Step: Dietary ── */}
              {current.id === 'dietary' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {DIETARY.map((d) => (
                      <Chip
                        key={d.id}
                        emoji={d.emoji}
                        label={d.label}
                        selected={selections.dietary.includes(d.id)}
                        onClick={() => toggle('dietary', d.id)}
                      />
                    ))}
                  </div>
                  <p className="text-white/30 text-xs text-center mt-4">
                    None apply? Just tap "Finish" to continue
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-1 px-4 py-3 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all text-sm"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <Button
            onClick={next}
            disabled={!canProceed()}
            loading={saving}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {step === STEPS.length - 1 ? (
              <>
                <Sparkles size={16} />
                {saving ? 'Saving…' : 'Finish & Explore'}
              </>
            ) : (
              <>
                Continue <ChevronRight size={16} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
