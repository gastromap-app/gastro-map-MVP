import { useEffect } from 'react'
import AppProviders from './providers/AppProviders'
import AppRouter from './router/AppRouter'
import { useAuthStore } from '@/shared/store/auth.store'
import { useFeatureFlagsStore } from '@/shared/store/feature-flags.store'

export default function App() {
  const initAuth = useAuthStore((s) => s.init)
  const loadFlags = useFeatureFlagsStore((s) => s.load)

  useEffect(() => {
    initAuth()
    loadFlags()
  }, [initAuth, loadFlags])

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
