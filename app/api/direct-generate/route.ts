import { NextRequest, NextResponse } from 'next/server'
import { generateWithSeedream } from '@/lib/seedream'

export const dynamic = 'force-dynamic'

interface GenerateConfig {
  mode: string
  resolution: string
  ratio: string
  count: number
}

function validateBody(body: unknown): { prompt: string; config: GenerateConfig } {
  if (!body || typeof body !== 'object') {
    throw new Error('Body must be an object')
  }

  const { prompt, config } = body as Partial<{ prompt: string; config: GenerateConfig }>

  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt is required and must be a string')
  }

  if (!config || typeof config !== 'object') {
    throw new Error('Config is required and must be an object')
  }

  const { mode, resolution, ratio, count } = config

  if (!mode || typeof mode !== 'string') {
    throw new Error('Config.mode is required and must be a string')
  }

  if (!resolution || typeof resolution !== 'string') {
    throw new Error('Config.resolution is required and must be a string')
  }

  if (!ratio || typeof ratio !== 'string') {
    throw new Error('Config.ratio is required and must be a string')
  }

  if (!count || typeof count !== 'number' || count < 1 || count > 15) {
    throw new Error('Config.count is required and must be between 1 and 15')
  }

  return { prompt, config }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== DIRECT GENERATE START (NO AUTH) ===')
    
    const raw = await request.json()
    const { prompt, config } = validateBody(raw)
    
    console.log('Generate request received:', { prompt, config })
    console.log('Environment check:', {
      hasApiKey: !!process.env.ARK_API_KEY,
      hasEndpoint: !!process.env.SEEDREAM_API_ENDPOINT,
      hasDatabase: !!process.env.DATABASE_URL,
    })
    
    if (process.env.ARK_API_KEY && process.env.SEEDREAM_API_ENDPOINT) {
      try {
        console.log('Attempting real AI generation...')
        console.log('Prompt:', prompt)
        console.log('Config:', config)
        
        const seedreamResult = await generateWithSeedream(prompt, config)
        console.log('AI generation successful:', seedreamResult)
        console.log('Number of images generated:', seedreamResult.images.length)
        
        return NextResponse.json({
          success: true,
          images: seedreamResult.images,
          id: `ai-${Date.now()}`,
        })
        
      } catch (aiError) {
        console.error('AI generation failed:', aiError)
        return NextResponse.json({ 
          error: 'AI generation failed', 
          details: aiError instanceof Error ? aiError.message : String(aiError)
        }, { status: 500 })
      }
    } else {
      console.log('API keys not configured')
      return NextResponse.json({ 
        error: 'Seedream API not configured',
        details: 'ARK_API_KEY or SEEDREAM_API_ENDPOINT missing'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Direct generate error:', error)
    return NextResponse.json({ 
      error: 'Request failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
