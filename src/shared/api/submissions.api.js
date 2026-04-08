import { supabase, unwrap } from './client'

export async function createSubmission(data) {
  return unwrap(await supabase.from('user_submissions').insert(data).select().single())
}
export async function getMySubmissions(userId) {
  return unwrap(await supabase.from('user_submissions').select('*').eq('user_id', userId).order('created_at', { ascending: false }))
}
export async function getPendingSubmissions() {
  return unwrap(await supabase.from('user_submissions').select('*, profiles(name, avatar_url)').eq('status', 'pending').order('created_at', { ascending: true }))
}
export async function approveSubmission(id, locationData) {
  const location = unwrap(await supabase.from('locations').insert(locationData).select().single())
  return unwrap(await supabase.from('user_submissions').update({ status: 'approved', location_id: location.id, reviewed_at: new Date().toISOString() }).eq('id', id))
}
export async function rejectSubmission(id, reason) {
  return unwrap(await supabase.from('user_submissions').update({ status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString() }).eq('id', id))
}
