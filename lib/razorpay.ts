import Razorpay from 'razorpay'

const keyId = process.env.RAZORPAY_KEY_ID
const keySecret = process.env.RAZORPAY_KEY_SECRET

if (!keyId || !keySecret) {
  // In production, these must be set via environment variables.
  // We do not throw here to avoid breaking build; runtime routes will validate.
}

export const razorpay = keyId && keySecret
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null

export function assertRazorpayConfigured() {
  if (!razorpay) {
    throw new Error('Razorpay is not configured')
  }
}
