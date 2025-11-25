import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type PlanTier = 'FREE' | 'BASIC' | 'ENHANCED' | 'PREMIUM' | 'DEDICATED'

interface Plan {
  id: PlanTier
  name: string
  price: number
  credits: number
}

const PLANS: Record<PlanTier, Plan> = {
  FREE: { id: 'FREE', name: 'Free', price: 0, credits: 15 },
  BASIC: { id: 'BASIC', name: 'Basic', price: 20, credits: 120 },
  ENHANCED: { id: 'ENHANCED', name: 'Enhanced', price: 49, credits: 400 },
  PREMIUM: { id: 'PREMIUM', name: 'Premium', price: 99, credits: 1100 },
  DEDICATED: { id: 'DEDICATED', name: 'Dedicated', price: 0, credits: 0 },
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, currency = 'USD' } = await request.json()
    
    if (!planId || !PLANS[planId as PlanTier]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = PLANS[planId as PlanTier]
    
    if (plan.price === 0) {
      return NextResponse.json({ error: 'Free plan - no payment required' }, { status: 400 })
    }

    // Convert USD to INR (Razorpay uses INR)
    const usdToInrRate = 83 // Approximate rate
    const amountInInr = Math.round(plan.price * usdToInrRate * 100) // Convert to paise

    // Create Razorpay order
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: amountInInr,
        currency: 'INR',
        receipt: `receipt_${session.user.id}_${Date.now()}`,
        notes: {
          userId: session.user.id,
          planId: plan.id,
          planName: plan.name,
          originalCurrency: currency,
          originalAmount: plan.price,
        },
      }),
    })

    if (!razorpayResponse.ok) {
      const error = await razorpayResponse.text()
      console.error('Razorpay error:', error)
      return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
    }

    const razorpayOrder = await razorpayResponse.json()

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: {
        id: plan.id,
        name: plan.name,
        credits: plan.credits,
        price: plan.price,
      },
      user: {
        name: session.user.name,
        email: session.user.email,
      },
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
