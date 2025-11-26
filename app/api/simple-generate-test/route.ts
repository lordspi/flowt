import { NextRequest, NextResponse } from 'next/server'
import { generateWithSeedream } from '@/lib/seedream'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE GENERATE API CALLED ===')
    
    const { prompt, config } = await request.json()
    
    console.log('Prompt:', prompt)
    console.log('Config:', config)
    
    // Create seedream config
    const seedreamConfig = {
      mode: config.mode || 'text-to-image',
      resolution: config.resolution || '2K',
      ratio: config.ratio || '1:1',
      count: config.count || 1,
      sequentialImageGeneration: 'disabled' as const,
      formats: ['jpg'],
      stream: false
    }
    
    console.log('Calling Seedream with config:', seedreamConfig)
    
    const seedreamResult = await generateWithSeedream(prompt, seedreamConfig)
    
    console.log('Seedream success! Images:', seedreamResult.images.length)
    
    return NextResponse.json({
      success: true,
      images: seedreamResult.images,
      actualImagesGenerated: seedreamResult.images.length
    })

  } catch (error) {
    console.error('Simple Generate API error:', error)
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Image generation failed' 
    }, { status: 500 })
  }
}
