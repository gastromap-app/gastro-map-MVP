/**
 * Vercel Serverless: /api/stripe/create-checkout
 * Creates Stripe Checkout Session for donations (MVP) or subscriptions (V1.1 stub).
 */
import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const { type, amount, price_id, user_id, success_url, cancel_url } = req.body

  try {
    let sessionConfig = {
      mode: type === 'subscription' ? 'subscription' : 'payment',
      success_url,
      cancel_url,
      metadata: { type, user_id: user_id || '' },
    }

    if (type === 'donation') {
      // MVP: one-time donation
      sessionConfig.line_items = [{
        price_data: {
          currency: process.env.VITE_DONATION_CURRENCY || 'eur',
          product_data: { name: 'GastroMap Support', description: 'Thank you for supporting GastroMap! 💙' },
          unit_amount: amount,
        },
        quantity: 1,
      }]
    } else if (type === 'subscription') {
      // SUBSCRIPTION_GATE: stub — uncomment when plans are active
      // sessionConfig.line_items = [{ price: price_id, quantity: 1 }]
      return res.status(503).json({ error: 'Subscriptions not yet active. See GASTROMAP_MVP_PLAN.md §16.7' })
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)
    res.status(200).json({ url: session.url, session_id: session.id })

  } catch (err) {
    console.error('[Stripe]', err.message)
    res.status(500).json({ error: err.message })
  }
}
