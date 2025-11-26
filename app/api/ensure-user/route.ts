import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { prisma } = await import('@/lib/db')
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        creditsBalance: true,
        currentPlan: true,
      },
    })

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.name,
          image: session.user.image,
          creditsBalance: 15, // Give 15 credits to new users
          currentPlan: 'FREE',
        },
        select: {
          id: true,
          email: true,
          creditsBalance: true,
          currentPlan: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        creditsBalance: user.creditsBalance,
        currentPlan: user.currentPlan,
      }
    })

  } catch (error) {
    console.error('Ensure user error:', error)
    return NextResponse.json({
      error: 'Failed to ensure user',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        error: 'Database not configured',
        creditsBalance: 999 // Fallback for demo mode
      }, { status: 200 })
    }

    const { prisma } = await import('@/lib/db')
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        creditsBalance: true,
        currentPlan: true,
      },
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        creditsBalance: 0
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        creditsBalance: user.creditsBalance,
        currentPlan: user.currentPlan,
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({
      error: 'Failed to get user',
      creditsBalance: 0
    }, { status: 500 })
  }
}
