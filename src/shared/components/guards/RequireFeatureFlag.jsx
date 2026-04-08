import { Navigate, Outlet } from 'react-router-dom'
import { useFeatureFlags } from '@/shared/store/feature-flags.store'

/**
 * Route guard controlled by a feature flag.
 * If flag is disabled → redirect to /dashboard.
 * Admin can toggle via /admin/feature-flags without deploy.
 */
export default function RequireFeatureFlag({ flag, redirectTo = '/dashboard' }) {
  const { isEnabled } = useFeatureFlags()
  return isEnabled(flag) ? <Outlet /> : <Navigate to={redirectTo} replace />
}
