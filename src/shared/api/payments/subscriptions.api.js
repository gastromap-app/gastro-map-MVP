/**
 * SUBSCRIPTION_GATE — Subscriptions API (STUB)
 *
 * This file contains the full implementation of subscription management.
 * Everything is stubbed until feature_flags.subscription_plans = true.
 *
 * To activate:
 *  1. Complete checklist in GASTROMAP_MVP_PLAN.md §16.7
 *  2. Set feature_flags.subscription_plans = true in /admin/feature-flags
 *  3. Remove stub returns below
 */

export async function createSubscriptionCheckout(_priceId, _userId) {
  // SUBSCRIPTION_GATE: remove stub below
  console.warn('[Subscriptions] Not yet active. See GASTROMAP_MVP_PLAN.md §16.7')
  return null

  // TODO: activate below
  // const res = await fetch('/api/stripe/create-checkout', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ type: 'subscription', price_id: _priceId, user_id: _userId, ... }),
  // })
  // const { url } = await res.json()
  // window.location.href = url
}

export async function getSubscriptionStatus(_userId) {
  // SUBSCRIPTION_GATE: stub
  return { status: 'inactive', plan: null }
}

export async function cancelSubscription(_subscriptionId) {
  // SUBSCRIPTION_GATE: stub
  return null
}
