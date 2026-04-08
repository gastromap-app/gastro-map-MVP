/**
 * Vercel Serverless: /api/stripe/webhook
 * Handles all Stripe events for donations (active) and subscriptions (stub).
 */
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe   = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end',  () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig  = req.headers['stripe-signature']
  const body = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` })
  }

  // Log event for debugging
  await supabase.from('stripe_webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event.data.object,
  }).throwOnError().catch(console.error)

  // Handle events
  switch (event.type) {
    // ── ACTIVE (MVP — Donations) ──────────────────────────────────────
    case 'checkout.session.completed': {
      const session  = event.data.object
      const { type, user_id } = session.metadata || {}

      if (type === 'donation') {
        await supabase.from('donations').insert({
          user_id:                   user_id || null,
          stripe_payment_intent_id:  session.payment_intent,
          amount:                    session.amount_total,
          currency:                  session.currency,
          status:                    'succeeded',
        }).throwOnError().catch(console.error)

        if (user_id) {
          await supabase.from('user_badges').upsert({
            user_id, badge_type: 'supporter',
            badge_metadata: { amount: session.amount_total, currency: session.currency, date: new Date().toISOString() }
          }).throwOnError().catch(console.error)
        }
      }
      break
    }

    // ── STUB (V1.1 — Subscriptions) — remove return to activate ──────
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // SUBSCRIPTION_GATE: remove the break below and implement
      break

    case 'customer.subscription.deleted':
      // SUBSCRIPTION_GATE: remove the break below and implement
      break

    case 'invoice.payment_succeeded':
      // SUBSCRIPTION_GATE: remove the break below and implement
      break

    default:
      console.log(`[Webhook] Unhandled event: ${event.type}`)
  }

  res.status(200).json({ received: true })
}
