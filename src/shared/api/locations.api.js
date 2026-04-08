import { supabase, unwrap } from './client'

const SELECT_FIELDS = `id, title, slug, description, address, city, country, lat, lng,
  category, cuisine_types, price_range, google_rating, google_reviews_count,
  image, photos, tags, dietary_options, amenities, best_for, noise_level,
  outdoor_seating, pet_friendly, child_friendly, michelin_stars, michelin_bib,
  insider_tip, what_to_try, ai_context, ai_keywords, opening_hours, status, created_at`

export async function getLocations({ city, filters = {}, limit = 50, offset = 0 } = {}) {
  let query = supabase.from('locations').select(SELECT_FIELDS)
    .eq('status', 'active').range(offset, offset + limit - 1)
  if (city) query = query.ilike('city', city)
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.min_rating) query = query.gte('google_rating', filters.min_rating)
  if (filters.price_range?.length) query = query.in('price_range', filters.price_range)
  if (filters.cuisine_types?.length) query = query.overlaps('cuisine_types', filters.cuisine_types)
  if (filters.dietary_options?.length) query = query.overlaps('dietary_options', filters.dietary_options)
  if (filters.tags?.length) query = query.overlaps('tags', filters.tags)
  return unwrap(await query.order('google_rating', { ascending: false }))
}

export async function getLocationById(id) {
  return unwrap(await supabase.from('locations').select(SELECT_FIELDS).eq('id', id).single())
}

export async function searchLocations(query, city) {
  let q = supabase.from('locations').select(SELECT_FIELDS).eq('status', 'active')
    .textSearch('fts', query, { type: 'websearch' })
  if (city) q = q.ilike('city', city)
  return unwrap(await q.limit(20))
}
