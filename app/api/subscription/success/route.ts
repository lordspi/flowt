import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await request.json()

    // Verify Razorpay signature
    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
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

    // Update user credits and plan in database
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
          amount: planId === 'BASIC' ? 20 : planId === 'ENHANCED' ? 49 : 99,
          currency: 'USD',
          status: 'COMPLETED',
          paymentMethod: 'RAZORPAY',
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          type: 'SUBSCRIPTION',
          metadata: {
            planId,
            creditsAdded: creditsToAdd,
          },
        },
      })
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
