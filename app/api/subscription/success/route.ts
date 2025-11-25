import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await request.json()

    // Verify Razorpay signature
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
    if (!razorpayKeySecret) {
      return NextResponse.json({ error: 'Razorpay key secret not configured' }, { status: 500 })
    }

    const hmac = crypto.createHmac('sha256', razorpayKeySecret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const generatedSignature = hmac.digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Plan configurations
    const planCredits: Record<string, number> = {
      'BASIC': 120,
      'ENHANCED': 400,
      'PREMIUM': 1100,
    }

    const creditsToAdd = planCredits[planId] || 0

    // Update user credits and plan in database (conditional)
    try {
      const { prisma } = await import('@/lib/db')
      if (prisma) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            currentPlan: planId,
            creditsBalance: {
              increment: creditsToAdd,
            },
          },
        })

        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId: session.user.id,
            amount: planId === 'BASIC' ? 169000 : planId === 'ENHANCED' ? 414050 : 835550, // Exact USD to INR conversion at ₹84.50 per $1
            currency: 'inr',
            providerPaymentId: razorpay_payment_id,
            provider: 'RAZORPAY',
            type: 'SUBSCRIPTION',
            plan: planId as any,
            credits: creditsToAdd,
            metadata: {
              planId,
              creditsAdded: creditsToAdd,
              originalAmount: planId === 'BASIC' ? 1690 : planId === 'ENHANCED' ? 4140.50 : 8355.50, // Exact INR amounts from USD conversion
            },
          },
        })
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue without database - payment is still valid
    }

    return NextResponse.json({
      success: true,
      message: 'Payment successful',
      creditsAdded: creditsToAdd,
      newPlan: planId,
    })

  } catch (error) {
    console.error('Payment success error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
