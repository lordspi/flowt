import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check environment variables (without exposing sensitive data)
    const envStatus = {
      hasArkApiKey: !!process.env.ARK_API_KEY,
      arkApiKeyLength: process.env.ARK_API_KEY?.length || 0,
      hasSeedreamEndpoint: !!process.env.SEEDREAM_API_ENDPOINT,
      seedreamEndpoint: process.env.SEEDREAM_API_ENDPOINT,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      databaseUrlStart: process.env.DATABASE_URL?.substring(0, 50) + '...',
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    }

    console.log('Environment debug:', envStatus)

    // Test database connection if DATABASE_URL exists
    let dbTest = { connected: false, error: null }
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import('@/lib/db')
        const userCount = await prisma.user.count()
        dbTest = { connected: true, userCount }
      } catch (error) {
        dbTest = { 
          connected: false, 
          error: error instanceof Error ? error.message : String(error) 
        }
      }
    }

    return NextResponse.json({
      environment: envStatus,
      database: dbTest,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
