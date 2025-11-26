import { NextRequest, NextResponse } from 'next/server'
import { generateWithSeedream } from '@/lib/seedream'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, config } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const testConfig = {
      mode: 'text-to-image',
      resolution: config?.resolution || '2K',
      ratio: config?.ratio || '1:1',
      count: config?.count || 1,
      model: 'seedream-4-0-250828',
      stream: false,
      watermark: true,
      sequentialImageGeneration: 'disabled'
    }

    console.log('Testing Seedream without auth:', { prompt, config: testConfig })

    const result = await generateWithSeedream(prompt, testConfig)

    return NextResponse.json({
      success: true,
      prompt,
      images: result.images,
      imageCount: result.images.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test generate error:', error)
    return NextResponse.json({
      error: 'Generation failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
