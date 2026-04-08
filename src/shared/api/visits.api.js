import { supabase, unwrap } from './client'

export async function getVisits(userId) {
  return unwrap(await supabase.from('user_visits').select('*, locations(id,title,image,category,city)').eq('user_id', userId).order('visited_at', { ascending: false }))
}
export async function markVisited(userId, locationId, { rating, review_text } = {}) {
  return unwrap(await supabase.from('user_visits').upsert({ user_id: userId, location_id: locationId, visited_at: new Date().toISOString(), rating, review_text }))
}
