import { NextResponse } from 'next/server'
import { generateWithSeedream } from '@/lib/seedream'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const prompt = "Generate a series of 4 coherent illustrations focusing on the same corner of a courtyard across the four seasons, presented in a unified style that captures the unique colors, elements, and atmosphere of each season."

    const config = {
      mode: 'text-to-image',
      resolution: '2K',
      ratio: '1:1',
      count: 4,
      model: 'seedream-4-0-250828',
      stream: true,
      watermark: true,
      sequentialImageGeneration: 'auto' as const,
      sequentialImageGenerationOptions: {
        max_images: 4
      }
    }

    console.log('Testing sequential generation:', { prompt, config })

    const result = await generateWithSeedream(prompt, config)

    return NextResponse.json({
      success: true,
      prompt,
      config,
      images: result.images,
      imageCount: result.images.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Sequential generation test error:', error)
    return NextResponse.json({
      error: 'Sequential generation failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
