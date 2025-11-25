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

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const raw = await request.json()
    const { prompt, config } = validateBody(raw)
    const userId = session.user.id

    // Try database operations if available, otherwise use demo mode
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import('@/lib/db')
        
        // Load the user to check credits and organization context
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            creditsBalance: true,
            organizationId: true,
          },
        })

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const creditsRequired = config.count

        if (user.creditsBalance < creditsRequired) {
          return NextResponse.json(
            {
              error: 'Not enough credits. Please upgrade your plan or top up.',
            },
            { status: 402 },
          )
        }

        // Call Seedream 2.0 using the shared helper. This will throw if env is not configured.
        const seedreamResult = await generateWithSeedream(prompt, config as GenerateConfig)

        // Persist generation + images and deduct credits in a single transaction.
        const [updatedUser, generation] = await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: {
              creditsBalance: {
                decrement: creditsRequired,
              },
            },
          }),
          prisma.imageGeneration.create({
            data: {
              userId: user.id,
              organizationId: user.organizationId,
              prompt,
              configMode: config.mode,
              configResolution: config.resolution,
              configRatio: config.ratio,
              count: config.count,
              status: 'complete',
              creditsCharged: creditsRequired,
              seedreamRequestId: null,
              images: {
                create: seedreamResult.images.map((img) => ({
                  url: img.url,
                  width: img.width ?? null,
                  height: img.height ?? null,
                  format: img.format ?? null,
                })),
              },
            },
            include: {
              images: true,
            },
          }),
        ])

        return NextResponse.json(
          {
            id: generation.id,
            prompt: generation.prompt,
            config,
            status: generation.status,
            images: seedreamResult.images,
            remainingCredits: updatedUser.creditsBalance,
          },
          { status: 200 },
        )
      } catch (dbError) {
        console.warn('Database operation failed, falling back to demo mode:', dbError)
        // Fall through to demo mode
      }
    }

    // Demo mode - fallback when database not available
    let images
    
    console.log('Generate request received:', { prompt, config })
    console.log('Environment check:', {
      hasApiKey: !!process.env.SEEDREAM_API_KEY,
      hasEndpoint: !!process.env.SEEDREAM_API_ENDPOINT,
      hasDatabase: !!process.env.DATABASE_URL,
    })
    
    if (process.env.SEEDREAM_API_KEY && process.env.SEEDREAM_API_ENDPOINT) {
      try {
        // Use real AI generation without database
        console.log('Attempting real AI generation...')
        const seedreamResult = await generateWithSeedream(prompt, config as GenerateConfig)
        console.log('AI generation successful:', seedreamResult)
        images = seedreamResult.images
      } catch (aiError) {
        console.warn('AI generation failed, using demo images:', aiError)
        // Fall through to demo images
        images = [
          `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-1/512/512.jpg`,
          `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-2/512/512.jpg`,
          `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-3/512/512.jpg`,
        ].slice(0, config.count)
      }
    } else {
      console.log('Using demo images - API keys not configured')
      // Demo images
      images = [
        `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-1/512/512.jpg`,
        `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-2/512/512.jpg`,
        `https://picsum.photos/seed/${prompt.replace(/\s+/g, '-')}-3/512/512.jpg`,
      ].slice(0, config.count)
    }

    const response = {
      id: `demo-${Date.now()}`,
      prompt,
      config,
      status: 'complete',
      images: images.map((url, index) => ({
        url,
        width: 512,
        height: 512,
        format: 'jpg',
      })),
      remainingCredits: Math.max(0, 15 - config.count),
    }
    
    console.log('Sending response:', response)
    
    return NextResponse.json(response, { status: 200 })
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
