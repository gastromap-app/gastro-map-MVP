/**
 * Donations API — MVP Phase 1 (Stripe one-time payments).
 * Subscriptions are in subscriptions.api.js (stub, disabled by feature flag).
 */

/**
 * Create a Stripe Checkout Session for a donation.
 * @param {number} amount - in cents (e.g. 300 = €3.00)
 * @param {string} userId - authenticated user id (or null for anonymous)
 */
export async function createDonationCheckout(amount, userId) {
  const res = await fetch('/api/stripe/create-checkout', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      type:        'donation',
      amount,
      user_id:     userId,
      success_url: `${window.location.origin}/donate/success?session={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${window.location.origin}/donate`,
    }),
  })
  if (!res.ok) throw new Error('Failed to create checkout session')
  const { url } = await res.json()
  window.location.href = url
}
