/**
 * Centralized environment configuration.
 * All env variables are accessed ONLY through this file.
 */
export const env = {
  supabase: {
    url:     import.meta.env.VITE_SUPABASE_URL     || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  stripe: {
    publicKey:       import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
    donationAmounts: (import.meta.env.VITE_DONATION_AMOUNTS || '100,300,500')
      .split(',').map(Number),
    currency:        import.meta.env.VITE_DONATION_CURRENCY || 'eur',
  },
  analytics: {
    posthogKey:  import.meta.env.VITE_POSTHOG_KEY  || '',
    sentryDsn:   import.meta.env.VITE_SENTRY_DSN   || '',
  },
  app: {
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    url:     import.meta.env.VITE_APP_URL     || 'http://localhost:5173',
    isDev:   import.meta.env.DEV,
  },
}
