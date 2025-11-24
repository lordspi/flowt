import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { razorpay, assertRazorpayConfigured } from '@/lib/razorpay'

type PlanTier = 'FREE' | 'BASIC' | 'ENHANCED' | 'PREMIUM' | 'DEDICATED'

const PLAN_ENV_KEYS: Record<PlanTier, string | null> = {
  FREE: null,
  BASIC: 'RAZORPAY_PLAN_BASIC_USD',
  ENHANCED: 'RAZORPAY_PLAN_ENHANCED_USD',
  PREMIUM: 'RAZORPAY_PLAN_PREMIUM_USD',
  DEDICATED: null,
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  assertRazorpayConfigured()

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const planId = (body.planId as PlanTier | undefined) ?? undefined
  const currency = (body.currency as string | undefined)?.toUpperCase() || 'USD'

  if (!planId || !['BASIC', 'ENHANCED', 'PREMIUM'].includes(planId)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  if (currency !== 'USD') {
    return NextResponse.json({ error: 'Only USD subscriptions are currently supported from this endpoint.' }, { status: 400 })
  }

  const envKey = PLAN_ENV_KEYS[planId]
  if (!envKey) {
    return NextResponse.json({ error: 'Plan not configured for Razorpay' }, { status: 500 })
  }

  const planRef = process.env[envKey]
  if (!planRef) {
    return NextResponse.json({ error: `Missing Razorpay plan config: ${envKey}` }, { status: 500 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const subscription = await razorpay!.subscriptions.create({
      plan_id: planRef,
      customer_notify: 1,
      total_count: 0, // until cancelled
      notes: {
        flowt_user_id: user.id,
        flowt_plan: planId,
      },
    })

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: planId as any,
        provider: 'RAZORPAY' as any,
        providerCustomerId: subscription.customer_notify?.toString() ?? '',
        providerSubscriptionId: subscription.id,
        status: 'INCOMPLETE' as any,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      },
    })

    return NextResponse.json(
      {
        subscriptionId: subscription.id,
        razorpay: {
          subscription,
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          user: {
            name: user.name,
            email: user.email,
          },
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error creating Razorpay subscription', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
