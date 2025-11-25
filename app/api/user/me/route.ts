import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try database lookup if available, otherwise return demo data
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import('@/lib/db')
        
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            currentPlan: true,
            creditsBalance: true,
            organization: {
              select: {
                id: true,
                name: true,
                plan: true,
              },
            },
          },
        })

        if (user) {
          return NextResponse.json(user, { status: 200 })
        }
      } catch (dbError) {
        console.warn('Database lookup failed, using demo mode:', dbError)
      }
    }

    // Fallback to demo mode
    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: 'user',
      currentPlan: 'FREE',
      creditsBalance: 15,
      organization: null,
    }, { status: 200 })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
