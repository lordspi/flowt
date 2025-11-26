import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try database lookup if available
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import('@/lib/db')
        
        const generations = await prisma.imageGeneration.findMany({
          where: { userId: session.user.id },
          include: {
            images: true,
          },
          orderBy: { createdAt: 'desc' },
        })

        // Transform the data for the frontend
        const transformedGenerations = generations.map((gen) => ({
          id: gen.id,
          prompt: gen.prompt,
          timestamp: gen.createdAt.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          mode: gen.configMode || 'Auto mode',
          resolution: gen.configResolution,
          ratio: gen.configRatio,
          count: gen.count,
          status: gen.status,
          model: 'Flowt-2.0',
          images: gen.images.map((img) => ({
            url: img.url,
            width: img.width,
            height: img.height,
            format: img.format,
          })),
        }))

        return NextResponse.json(transformedGenerations, { status: 200 })
      } catch (dbError) {
        console.warn('Database lookup failed, returning empty gallery:', dbError)
      }
    }

    // Fallback to empty array for demo mode
    return NextResponse.json([], { status: 200 })

  } catch (error) {
    console.error('Error fetching generations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
