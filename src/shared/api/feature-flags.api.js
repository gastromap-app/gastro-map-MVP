import { supabase, unwrap } from './client'

export async function getFeatureFlags() {
  return unwrap(await supabase.from('feature_flags').select('key, enabled, description'))
}
export async function updateFeatureFlag(key, enabled) {
  return unwrap(await supabase.from('feature_flags').update({ enabled, updated_at: new Date().toISOString() }).eq('key', key))
}
