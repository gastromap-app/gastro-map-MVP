import { supabase, unwrap } from './client'

export async function getFavorites(userId) {
  return unwrap(await supabase.from('user_favorites').select('location_id').eq('user_id', userId))
}
export async function addFavorite(userId, locationId) {
  return unwrap(await supabase.from('user_favorites').insert({ user_id: userId, location_id: locationId }))
}
export async function removeFavorite(userId, locationId) {
  return unwrap(await supabase.from('user_favorites').delete().eq('user_id', userId).eq('location_id', locationId))
}
