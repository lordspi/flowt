import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Database test API called')
    
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import('@/lib/db')
        console.log('Prisma imported successfully')
        
        // Test database connection
        const userCount = await prisma.user.count()
        console.log('Total users in database:', userCount)
        
        const generationCount = await prisma.imageGeneration.count({
          where: { userId: session.user.id }
        })
        console.log('User generations count:', generationCount)
        
        const recentGenerations = await prisma.imageGeneration.findMany({
          where: { userId: session.user.id },
          include: { images: true },
          orderBy: { createdAt: 'desc' },
          take: 3
        })
        
        console.log('Recent generations:', recentGenerations.length)
        
        return NextResponse.json({
          success: true,
          databaseConnected: true,
          userCount,
          generationCount,
          recentGenerations: recentGenerations.map(gen => ({
            id: gen.id,
            prompt: gen.prompt,
            imageCount: gen.images.length,
            firstImageUrl: gen.images[0]?.url,
            createdAt: gen.createdAt
          }))
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json({
          success: false,
          error: 'Database connection failed',
          details: dbError instanceof Error ? dbError.message : String(dbError)
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'DATABASE_URL not configured'
    }, { status: 500 })
    
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
