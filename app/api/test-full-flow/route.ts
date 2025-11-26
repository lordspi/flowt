import { NextRequest, NextResponse } from 'next/server'
import { generateWithSeedream } from '@/lib/seedream'

export async function POST(request: NextRequest) {
  try {
    const { prompt, config } = await request.json()
    
    console.log('=== FULL FLOW TEST ===')
    console.log('Prompt:', prompt)
    console.log('Config:', config)
    
    // Test the exact same flow as the main API
    const seedreamConfig = {
      mode: config.mode || 'text-to-image',
      resolution: config.resolution || '2K',
      ratio: config.ratio || '1:1',
      count: config.count || 1,
      sequentialImageGeneration: config.sequentialGeneration ? 'auto' : 'disabled',
      formats: config.formats || ['jpg'],
      stream: false,
      image: config.image
    }
    
    console.log('Seedream config:', seedreamConfig)
    
    const result = await generateWithSeedream(prompt, seedreamConfig)
    
    console.log('Seedream result:', result)
    
    return NextResponse.json({
      success: true,
      images: result.images,
      count: result.images.length
    })
    
  } catch (error) {
    console.error('Full flow test error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 })
  }
}
