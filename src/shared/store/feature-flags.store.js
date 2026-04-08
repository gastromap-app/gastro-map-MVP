import { create } from 'zustand'
import { supabase } from '@/shared/api/client'

const DEFAULTS = {
  community_submissions: true,
  donations:             true,
  subscription_plans:    false, // SUBSCRIPTION_GATE: set true when plans are ready
  bio_sync:              false,
  voice_search:          false,
  dine_with_me:          false,
  maintenance_mode:      false,
}

export const useFeatureFlagsStore = create((set, get) => ({
  flags:     DEFAULTS,
  loaded:    false,
  loading:   false,

  load: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const { data, error } = await supabase.from('feature_flags').select('key, enabled')
      if (error || !data) return
      const flags = { ...DEFAULTS }
      data.forEach(({ key, enabled }) => { if (key in flags) flags[key] = enabled })
      set({ flags, loaded: true })
    } catch {
      // Supabase not configured — use defaults
    } finally {
      set({ loading: false })
    }
  },

  isEnabled: (key) => get().flags[key] ?? false,
}))

/** Convenience hook */
export function useFeatureFlags() {
  const { flags, isEnabled } = useFeatureFlagsStore()
  return { flags, isEnabled }
}
