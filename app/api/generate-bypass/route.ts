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

    // Simulate user with credits for testing
    const seedreamConfig = {
      mode: config?.mode || 'text-to-image',
      resolution: config?.resolution || '2K',
      ratio: config?.ratio || '1:1',
      count: Math.min(config?.count || 1, 15),
      model: 'seedream-4-0-250828',
      stream: false,
      watermark: true,
      sequentialImageGeneration: 'auto' as const,
    }

    console.log('Bypass auth - generating with Seedream:', { prompt, config: seedreamConfig })

    const result = await generateWithSeedream(prompt, seedreamConfig)

    return NextResponse.json({
      id: 'test-' + Date.now(),
      prompt,
      config: seedreamConfig,
      status: 'complete',
      images: result.images,
      remainingCredits: 999, // Mock credits
    })

  } catch (error) {
    console.error('Bypass generate error:', error)
    return NextResponse.json({
      error: 'Generation failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
