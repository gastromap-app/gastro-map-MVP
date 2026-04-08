import { useState } from 'react'
import { Heart, Coffee, Pizza, Wine } from 'lucide-react'
import { useAuthStore } from '@/shared/store/auth.store'
import { createDonationCheckout } from '@/shared/api/payments/donations.api'
import { env } from '@/shared/config/env'
import Button from '@/shared/components/ui/Button'

const AMOUNT_OPTIONS = [
  { cents: 100, label: '€1', emoji: '☕', icon: Coffee },
  { cents: 300, label: '€3', emoji: '🍕', icon: Pizza },
  { cents: 500, label: '€5', emoji: '🥂', icon: Wine },
]

export default function DonatePage() {
  const [selected, setSelected] = useState(300)
  const [custom,   setCustom]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const { user } = useAuthStore()

  const amount = custom ? Math.round(parseFloat(custom) * 100) : selected

  async function handleDonate() {
    if (!amount || amount < 50) return
    setLoading(true)
    try {
      await createDonationCheckout(amount, user?.id)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 flex items-center justify-center mx-auto">
            <Heart size={32} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-black">Support GastroMap</h1>
          <p className="text-white/60 leading-relaxed">
            GastroMap is independent and ad-free. Every donation helps cover hosting, AI, and new features.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {AMOUNT_OPTIONS.map(({ cents, label, emoji }) => (
            <button key={cents} onClick={() => { setSelected(cents); setCustom('') }}
              className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all font-bold ${
                selected === cents && !custom ? 'border-blue-500 bg-blue-600/20 text-blue-300' : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30'
              }`}>
              <span className="text-2xl">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">€</span>
          <input type="number" min="0.50" step="0.50" placeholder="Custom amount"
            value={custom} onChange={(e) => { setCustom(e.target.value); setSelected(0) }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors" />
        </div>

        <Button onClick={handleDonate} loading={loading} disabled={!amount || amount < 50} className="w-full text-lg py-4">
          <Heart size={20} />
          Support GastroMap →
        </Button>

        <p className="text-center text-white/40 text-xs">
          Secure payment via Stripe. You'll get a 💙 Supporter badge in your profile.
        </p>
      </div>
    </div>
  )
}
