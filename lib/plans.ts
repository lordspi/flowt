export type PlanId = 'FREE' | 'BASIC' | 'ENHANCED' | 'PREMIUM' | 'DEDICATED'

interface PlanConfig {
  id: PlanId
  name: string
  priceCents: number | null
  credits: number
  description: string
}

export const PLANS: Record<PlanId, PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    priceCents: 0,
    credits: 0,
    description: 'Explore the product with no subscription.',
  },
  BASIC: {
    id: 'BASIC',
    name: 'Basic',
    priceCents: 169000, // $20 USD × 84.50 = ₹1690 INR = 169000 paise
    credits: 120,
    description: '120 Ultra HD images per month.',
  },
  ENHANCED: {
    id: 'ENHANCED',
    name: 'Enhanced',
    priceCents: 414050, // $49 USD × 84.50 = ₹4140.50 INR = 414050 paise
    credits: 400,
    description: '400 Ultra HD images per month.',
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    priceCents: 835550, // $99 USD × 84.50 = ₹8355.50 INR = 835550 paise
    credits: 1100,
    description: '1100 Ultra HD images per month.',
  },
  DEDICATED: {
    id: 'DEDICATED',
    name: 'Dedicated',
    priceCents: null,
    credits: 0,
    description: 'Custom enterprise plan with team accounts and SLAs.',
  },
}

export function getPlan(id: PlanId): PlanConfig {
  return PLANS[id]
}
