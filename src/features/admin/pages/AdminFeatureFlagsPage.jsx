import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFeatureFlags, updateFeatureFlag } from '@/shared/api/feature-flags.api'
import { useFeatureFlagsStore } from '@/shared/store/feature-flags.store'
import { keys } from '@/shared/config/queryClient'
import Skeleton from '@/shared/components/ui/Skeleton'

const FLAG_META = {
  community_submissions: { label: 'Community Submissions', desc: 'Let users suggest new locations via /add-place', safe: true },
  donations:             { label: 'Donations',              desc: 'Show /donate page and donation buttons',       safe: true },
  subscription_plans:    { label: 'Subscription Plans',     desc: '⚠️ Activates paywalls — run checklist first', safe: false },
  bio_sync:              { label: 'Bio-Sync (Health)',       desc: 'Apple Health / Google Fit integration stub',  safe: true },
  voice_search:          { label: 'Voice Search',           desc: 'Microphone input in search bar',              safe: true },
  dine_with_me:          { label: 'Dine With Me',           desc: 'Social dining radar feature stub',            safe: true },
  maintenance_mode:      { label: 'Maintenance Mode',       desc: '🚨 Blocks all app routes for users',         safe: false },
}

export default function AdminFeatureFlagsPage() {
  const qc = useQueryClient()
  const loadFlags = useFeatureFlagsStore((s) => s.load)
  const { data: flags = [], isLoading } = useQuery({ queryKey: keys.featureFlags.all, queryFn: getFeatureFlags })
  const toggle = useMutation({
    mutationFn: ({ key, enabled }) => updateFeatureFlag(key, enabled),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.featureFlags.all }); loadFlags() },
  })

  if (isLoading) return <div className="p-6 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}</div>

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-black text-white">Feature Flags</h1>
        <p className="text-white/50 text-sm mt-1">Toggle features without deploying. Changes take effect within 5 minutes.</p>
      </div>
      {flags.map((flag) => {
        const meta = FLAG_META[flag.key] || { label: flag.key, desc: flag.description, safe: true }
        return (
          <div key={flag.key} className={`flex items-center gap-4 p-4 rounded-2xl border ${!meta.safe ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 bg-slate-800'}`}>
            <button onClick={() => toggle.mutate({ key: flag.key, enabled: !flag.enabled })}
              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${flag.enabled ? 'bg-blue-600' : 'bg-white/20'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{meta.label}</p>
              <p className="text-white/40 text-xs">{meta.desc}</p>
            </div>
            <code className="text-white/30 text-xs font-mono hidden md:block">{flag.key}</code>
          </div>
        )
      })}
    </div>
  )
}
