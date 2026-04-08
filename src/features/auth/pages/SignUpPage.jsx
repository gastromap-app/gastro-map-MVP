import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Mail, Lock, User } from 'lucide-react'
import { useAuthStore } from '@/shared/store/auth.store'
import Button from '@/shared/components/ui/Button'

export default function SignUpPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuthStore()
  const navigate   = useNavigate()

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signUp(form.email, form.password, form.name)
      navigate('/dashboard')
      // OnboardingFlow will show automatically on first login
    } catch (err) {
      setError(err.message || 'Sign up failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin size={28} className="text-blue-500" />
            <span className="text-2xl font-black text-white">GastroMap</span>
          </div>
          <p className="text-white/50 text-sm">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['name','Name',User,'text'],['email','Email',Mail,'email'],['password','Password',Lock,'password']].map(([field, ph, Icon, type]) => (
            <div key={field} className="relative">
              <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input type={type} placeholder={ph} required value={form[field]} onChange={set(field)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          ))}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>Create Account</Button>
        </form>
        <p className="text-center text-sm text-white/50">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
