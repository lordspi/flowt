import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Gallery API called')
    const session = await auth()
    console.log('Session:', session?.user?.id ? 'Authenticated' : 'Not authenticated')

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try database lookup if available
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import('@/lib/db')
        console.log('Prisma imported successfully')
        
        const generations = await prisma.imageGeneration.findMany({
          where: { userId: session.user.id },
          include: {
            images: true,
          },
          orderBy: { createdAt: 'desc' },
        })
        
        console.log('Found generations:', generations.length)
        console.log('Sample generation data:', generations[0] ? {
          id: generations[0].id,
          prompt: generations[0].prompt,
          imageCount: generations[0].images.length,
          firstImageUrl: generations[0].images[0]?.url
        } : 'No generations')

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

        console.log('Transformed generations:', transformedGenerations.length)
        return NextResponse.json(transformedGenerations, { status: 200 })
      } catch (dbError) {
        console.warn('Database lookup failed, returning empty gallery:', dbError)
      }
    }

    // Fallback to empty array for demo mode
    console.log('Returning empty array (demo mode)')
    return NextResponse.json([], { status: 200 })

  } catch (error) {
    console.error('Error fetching generations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
