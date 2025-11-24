import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db'
import { getPlan, type PlanId } from '@/lib/plans'

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET

function verifySignature(body: string, signature: string | null): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET || !signature) return false

  const expected = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex')
  return expected === signature
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = headers().get('x-razorpay-signature')

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const payload = event.payload || {}
  let subscriptionId: string | null = null
  let planId: PlanId | null = null

  if (payload.subscription?.entity) {
    const sub = payload.subscription.entity
    subscriptionId = sub.id ?? null
    planId = (sub.notes?.flowt_plan as PlanId) ?? null
  } else if (payload.payment?.entity) {
    const pay = payload.payment.entity
    subscriptionId = (pay.subscription_id as string) ?? null
    planId = (pay.notes?.flowt_plan as PlanId) ?? null
  } else if (payload.invoice?.entity) {
    const inv = payload.invoice.entity
    subscriptionId = (inv.subscription_id as string) ?? null
    planId = (inv.notes?.flowt_plan as PlanId) ?? null
  }

  if (!subscriptionId) {
    return NextResponse.json({ received: true, ignored: 'no subscription id' }, { status: 200 })
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      providerSubscriptionId: subscriptionId,
      provider: 'RAZORPAY',
    },
  })

  if (!subscription) {
    // Unknown subscription, but signature was valid; acknowledge to avoid retries
    return NextResponse.json({ received: true, ignored: 'no matching subscription' }, { status: 200 })
  }

  const effectivePlanId: PlanId = (planId || (subscription.plan as PlanId)) as PlanId
  const plan = getPlan(effectivePlanId)
  const creditsToAdd = plan.credits

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
        },
      })

      if (creditsToAdd > 0) {
        if (subscription.userId) {
          await tx.user.update({
            where: { id: subscription.userId },
            data: {
              creditsBalance: { increment: creditsToAdd },
              currentPlan: effectivePlanId,
            },
          })
        }

        if (subscription.organizationId) {
          await tx.organization.update({
            where: { id: subscription.organizationId },
            data: {
              creditsBalance: { increment: creditsToAdd },
              plan: effectivePlanId,
            },
          })
        }

        await tx.transaction.create({
          data: {
            userId: subscription.userId,
            organizationId: subscription.organizationId,
            type: 'subscription_renewal',
            plan: effectivePlanId as any,
            credits: creditsToAdd,
            amount: 0,
            currency: 'usd',
            provider: 'RAZORPAY' as any,
            metadata: {
              razorpayEvent: event.event,
              razorpaySubscriptionId: subscriptionId,
            },
          },
        })
      }
    })
  } catch (error) {
    console.error('Error handling Razorpay webhook:', error)
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
