import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react'
import { useAuthStore } from '@/shared/store/auth.store'
import { getMySubmissions } from '@/shared/api/submissions.api'
import Button from '@/shared/components/ui/Button'

const STATUS_CONFIG = {
  pending:  { label: 'Under Review', icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10   border-amber-500/20'   },
  approved: { label: 'Approved',     icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  rejected: { label: 'Rejected',     icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/10     border-red-500/20'     },
}

function StatusBadge({ status }) {
  const cfg  = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.color}`}>
      <Icon size={11} />{cfg.label}
    </span>
  )
}

function SubmissionCard({ item, index }) {
  const date = new Date(item.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0,  opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white/5 border border-white/8 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{item.name}</p>
          <div className="flex items-center gap-1.5 text-white/40 text-xs mt-0.5">
            <MapPin size={11} />
            <span className="truncate">{[item.address, item.city].filter(Boolean).join(', ')}</span>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30 capitalize bg-white/5 px-2 py-0.5 rounded-md">{item.category}</span>
        <span className="text-xs text-white/30">{date}</span>
      </div>

      {item.status === 'pending' && (
        <div className="flex items-center gap-1.5 text-amber-400/70 text-xs bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-2">
          <AlertCircle size={12} /> Usually reviewed within 48 hours
        </div>
      )}
      {item.status === 'approved' && (
        <div className="flex items-center gap-1.5 text-emerald-400/70 text-xs bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-3 py-2">
          <CheckCircle size={12} /> +100 points credited to your account
        </div>
      )}
      {item.status === 'rejected' && item.rejection_reason && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2 space-y-0.5">
          <p className="text-xs font-semibold text-red-400">Rejection reason</p>
          <p className="text-xs text-red-400/70">{item.rejection_reason}</p>
        </div>
      )}
    </motion.div>
  )
}

export default function MySubmissionsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    if (!user?.id) return
    getMySubmissions(user.id)
      .then(setSubmissions)
      .catch((err) => setError(err.message || 'Failed to load submissions'))
      .finally(() => setLoading(false))
  }, [user?.id])

  const counts = {
    pending:  submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-10">
      <div className="px-4 pt-8 pb-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">My Submissions</h1>
            <p className="text-white/50 text-sm mt-1">Places you have suggested to GastroMap</p>
          </div>
          <Button onClick={() => navigate('/add-place')}><Plus size={16} /> Add</Button>
        </div>

        {!loading && submissions.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Pending',  count: counts.pending,  color: 'text-amber-400'   },
              { label: 'Approved', count: counts.approved, color: 'text-emerald-400' },
              { label: 'Rejected', count: counts.rejected, color: 'text-red-400'     },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl p-3 text-center">
                <p className={`text-xl font-black ${s.color}`}>{s.count}</p>
                <p className="text-white/40 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && submissions.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="text-5xl">📍</div>
            <div>
              <p className="text-white font-bold text-lg">No submissions yet</p>
              <p className="text-white/50 text-sm mt-1">Know a great place that is not on GastroMap? Add it!</p>
            </div>
            <Button onClick={() => navigate('/add-place')}><Plus size={16} /> Add First Place</Button>
          </div>
        )}
        {!loading && submissions.map((item, i) => (
          <SubmissionCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  )
}
