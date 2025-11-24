import { NextResponse } from 'next/server'
import { PLANS } from '@/lib/plans'

const PLAN_PRICING = {
  BASIC: { INR: 2000, USD: 2000, EUR: 2000 },
  ENHANCED: { INR: 4900, USD: 4900, EUR: 4900 },
  PREMIUM: { INR: 9900, USD: 9900, EUR: 9900 },
} as const

export async function GET() {
  const plans = Object.entries(PLANS)
    .filter(([id]) => id !== 'FREE')
    .map(([id, plan]) => ({
      id,
      name: plan.name,
      description: plan.description,
      credits: plan.credits,
      pricing: PLAN_PRICING[id as keyof typeof PLAN_PRICING] ?? null,
    }))

  return NextResponse.json({ plans }, { status: 200 })
}
