import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/auth.store'
import { getProfile } from '@/shared/api/auth.api'
import OnboardingFlow from './OnboardingFlow'

/**
 * OnboardingGate — wraps all authenticated routes.
 *
 * On mount it loads the user's profile from Supabase.
 * If `onboarding_completed` is falsy, renders <OnboardingFlow>
 * as a fullscreen overlay until the user completes it.
 * Otherwise (or after completion) renders <Outlet /> normally.
 */
export default function OnboardingGate() {
  const { user, isAuthenticated, profile, setProfile } = useAuthStore()
  const [checking, setChecking]         = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setChecking(false)
      return
    }

    // If we already have profile in store, use it immediately
    if (profile !== undefined) {
      setNeedsOnboarding(!profile?.onboarding_completed)
      setChecking(false)
      return
    }

    // Otherwise fetch from Supabase
    getProfile(user.id)
      .then((p) => {
        setProfile(p)
        setNeedsOnboarding(!p?.onboarding_completed)
      })
      .catch(() => {
        // On error don't block the user — just skip onboarding check
        setNeedsOnboarding(false)
      })
      .finally(() => setChecking(false))
  }, [isAuthenticated, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Still checking — render nothing (Suspense in AppRouter shows spinner)
  if (checking) return null

  function handleOnboardingComplete() {
    setNeedsOnboarding(false)
  }

  return (
    <>
      <Outlet />
      {needsOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
    </>
  )
}
