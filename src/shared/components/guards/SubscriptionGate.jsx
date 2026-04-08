import { useFeatureFlags } from '@/shared/store/feature-flags.store'

/**
 * SUBSCRIPTION_GATE
 *
 * Currently passes through all children (subscription_plans flag = false).
 *
 * To activate subscriptions:
 *   1. Create Stripe Products → copy Price IDs to DB and .env
 *   2. Set feature_flags.subscription_plans = true in /admin/feature-flags
 *   3. Remove the early-return below
 *   4. Run the activation checklist in GASTROMAP_MVP_PLAN.md §16.7
 */
export default function SubscriptionGate({ feature, children, fallback = null }) {
  const { isEnabled } = useFeatureFlags()

  // SUBSCRIPTION_GATE: remove this line to enable gating
  if (!isEnabled('subscription_plans')) return children

  // TODO: check user subscription status from auth store
  // const { user } = useAuthStore()
  // const hasAccess = user?.subscription_status === 'active'
  // if (!hasAccess) return fallback || <UpgradePrompt feature={feature} />

  return children
}
