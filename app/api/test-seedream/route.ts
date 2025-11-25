import { NextRequest, NextResponse } from 'next/server'
import { generateWithSeedream } from '@/lib/seedream'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Testing Seedream API directly...')
    
    // Test basic configuration
    const testConfig = {
      mode: 'text-to-image',
      resolution: '2K',
      ratio: '1:1',
      count: 1,
    }

    console.log('Environment check:', {
      hasApiKey: !!process.env.ARK_API_KEY,
      hasEndpoint: !!process.env.SEEDREAM_API_ENDPOINT,
      apiKey: process.env.ARK_API_KEY?.substring(0, 10) + '...',
    })

    const result = await generateWithSeedream('A beautiful sunset over mountains', testConfig)
    
    console.log('Seedream test successful:', result)

    return NextResponse.json({
      success: true,
      message: 'Seedream API working',
      result: result,
    })

  } catch (error) {
    console.error('Seedream test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: String(error),
    }, { status: 500 })
  }
}
