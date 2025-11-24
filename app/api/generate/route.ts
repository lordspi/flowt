import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateWithSeedream, SeedreamConfig } from '@/lib/seedream'

interface GenerateConfig {
  mode: string
  resolution: string
  ratio: string
  count: number
}

interface GenerateRequestBody {
  prompt: string
  config: GenerateConfig
}

const MAX_IMAGES_PER_REQUEST = 15

function validateBody(body: unknown): GenerateRequestBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Body must be an object')
  }

  const { prompt, config } = body as Partial<GenerateRequestBody>

  const trimmedPrompt = typeof prompt === 'string' ? prompt.trim() : ''
  if (!trimmedPrompt) {
    throw new Error('Prompt is required')
  }

  if (!config || typeof config !== 'object') {
    throw new Error('Config is required')
  }

  const { mode, resolution, ratio, count } = config as Partial<GenerateConfig>

  if (!mode || !resolution || !ratio || typeof count !== 'number') {
    throw new Error('Invalid config: mode, resolution, ratio and count are required')
  }

  const safeCount = Math.max(1, Math.min(count, MAX_IMAGES_PER_REQUEST))

  return {
    prompt: trimmedPrompt,
    config: {
      mode,
      resolution,
      ratio,
      count: safeCount,
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Allow demo mode without authentication
    if (!session?.user?.id) {
      // Return demo response without database operations
      const raw = await request.json()
      const { prompt, config } = validateBody(raw)
      
      // Return demo images
      const demoImages = [
        `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-1/512/512.jpg`,
        `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-2/512/512.jpg`,
        `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-3/512/512.jpg`,
      ].slice(0, config.count)

      return NextResponse.json(
        {
          id: `demo-${Date.now()}`,
          prompt,
          config,
          status: 'complete',
          images: demoImages.map((url, index) => ({
            url,
            width: 512,
            height: 512,
            format: 'jpg',
          })),
          remainingCredits: Math.max(0, 15 - config.count),
        },
        { status: 200 },
      )
    }

    // For authenticated users, also return demo mode for now
    const raw = await request.json()
    const { prompt, config } = validateBody(raw)
    
    // Return demo images
    const demoImages = [
      `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-1/512/512.jpg`,
      `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-2/512/512.jpg`,
      `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-3/512/512.jpg`,
    ].slice(0, config.count)

    return NextResponse.json(
      {
        id: `demo-${Date.now()}`,
        prompt,
        config,
        status: 'complete',
        images: demoImages.map((url, index) => ({
          url,
          width: 512,
          height: 512,
          format: 'jpg',
        })),
        remainingCredits: Math.max(0, 15 - config.count),
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    // Basic classification: validation vs server error
    if (message.includes('required') || message.includes('Invalid config') || message.includes('Body must')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    console.error('Error in /api/generate:', message)
    return NextResponse.json({ error: 'Image generation failed. Please try again.' }, { status: 500 })
  }
}
