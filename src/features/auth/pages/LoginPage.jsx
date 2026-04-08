import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Mail, Lock, Chrome } from 'lucide-react'
import { useAuthStore } from '@/shared/store/auth.store'
import Button from '@/shared/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { signIn, signInWithGoogle } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
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
          <p className="text-white/50 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
        </form>

        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center"><span className="bg-slate-900 px-3 text-white/40 text-sm">or</span></div>
        </div>

        <Button variant="secondary" className="w-full" onClick={signInWithGoogle}>
          <Chrome size={18} /> Continue with Google
        </Button>

        <div className="text-center space-y-2 text-sm">
          <Link to="/auth/forgot-password" className="text-blue-400 hover:text-blue-300">Forgot password?</Link>
          <p className="text-white/50">No account? <Link to="/signup" className="text-blue-400 hover:text-blue-300">Sign up</Link></p>
        </div>
      </div>
    </div>
  )
}
