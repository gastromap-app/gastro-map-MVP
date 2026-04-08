import { createClient } from '@supabase/supabase-js'
import { env } from '@/shared/config/env'

if (!env.supabase.url || !env.supabase.anonKey) {
  console.warn('[Supabase] Missing env vars — running in mock mode')
}

export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})

/** Typed API error */
export class ApiError extends Error {
  constructor(message, code, details) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
  }
}

/** Unwrap Supabase response or throw ApiError */
export function unwrap({ data, error }) {
  if (error) throw new ApiError(error.message, error.code, error.details)
  return data
}
