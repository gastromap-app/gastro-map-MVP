import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react'
import { getPendingSubmissions, approveSubmission, rejectSubmission } from '@/shared/api/submissions.api'
import { keys } from '@/shared/config/queryClient'
import Skeleton from '@/shared/components/ui/Skeleton'
import Badge from '@/shared/components/ui/Badge'
import Button from '@/shared/components/ui/Button'

export default function AdminSubmissionsPage() {
  const qc = useQueryClient()
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: keys.submissions.all,
    queryFn:  getPendingSubmissions,
  })
  const reject = useMutation({
    mutationFn: ({ id, reason }) => rejectSubmission(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.submissions.all }),
  })

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-white">Community Submissions</h1>
        <Badge variant="amber">{submissions.length} pending</Badge>
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-16 text-white/40">
          <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
          <p>No pending submissions</p>
        </div>
      )}

      {submissions.map((s) => {
        const check = s.ai_check_result || {}
        return (
          <div key={s.id} className="bg-slate-800 rounded-2xl p-5 space-y-4 border border-white/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-white text-lg">{s.name}</h2>
                <p className="text-white/50 text-sm">{s.address} · {s.city}</p>
                <p className="text-white/40 text-xs mt-1">
                  By {s.profiles?.name || 'Unknown'} · {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={s.category === 'restaurant' ? 'blue' : 'default'}>{s.category}</Badge>
            </div>

            {/* AI check results */}
            <div className="flex flex-wrap gap-2 text-xs">
              {check.address_valid === false && <Badge variant="amber"><AlertTriangle size={10} /> Invalid address</Badge>}
              {check.duplicates?.length > 0 && <Badge variant="amber"><AlertTriangle size={10} /> Possible duplicate</Badge>}
              {check.quality_score && <Badge variant="default">Quality: {check.quality_score}/100</Badge>}
            </div>

            {s.description && <p className="text-white/70 text-sm line-clamp-2">{s.description}</p>}

            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="gap-1"><Eye size={14} /> Preview</Button>
              <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700"><CheckCircle size={14} /> Approve</Button>
              <Button size="sm" variant="danger" className="gap-1"
                onClick={() => reject.mutate({ id: s.id, reason: 'Insufficient information' })}>
                <XCircle size={14} /> Reject
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
