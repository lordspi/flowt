import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PLANS } from '@/lib/plans'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, currency = 'INR' } = await request.json()
    
    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = PLANS[planId as keyof typeof PLANS]
    
    if (!plan.priceCents || plan.priceCents === 0) {
      return NextResponse.json({ error: 'Free plan - no payment required' }, { status: 400 })
    }

    // Use exact INR amount from plans (already converted)
    const amountInPaise = plan.priceCents

    // Create Razorpay order
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${session.user.id}_${Date.now()}`,
        notes: {
          userId: session.user.id,
          planId: plan.id,
          planName: plan.name,
          originalCurrency: currency,
          originalAmount: plan.priceCents,
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
        priceCents: plan.priceCents,
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
