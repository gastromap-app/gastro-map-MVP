import { supabase, unwrap } from './client'

export async function getLeaderboard(limit = 50) {
  return unwrap(await supabase.rpc('get_leaderboard', { p_limit: limit }))
}
