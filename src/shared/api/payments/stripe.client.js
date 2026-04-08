import { loadStripe } from '@stripe/stripe-js'
import { env } from '@/shared/config/env'

let stripePromise
export const getStripe = () => {
  if (!stripePromise) stripePromise = loadStripe(env.stripe.publicKey)
  return stripePromise
}
