import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    console.log('Testing Seedream API with sample code...')
    
    const apiKey = process.env.ARK_API_KEY
    const endpoint = process.env.SEEDREAM_API_ENDPOINT
    
    if (!apiKey || !endpoint) {
      return NextResponse.json({
        error: 'Missing API credentials',
        hasApiKey: !!apiKey,
        hasEndpoint: !!endpoint
      }, { status: 500 })
    }

    const requestBody = {
      model: "seedream-4-0-250828",
      prompt: "Interstellar travel, a black hole, from which a nearly shattered vintage train bursts forth, visually striking, cinematic blockbuster, apocalyptic vibe, dynamic, contrasting colors, OC render, ray tracing, motion blur, depth of field, surrealism, deep blue. The image uses delicate and rich color layers to shape the subject and scene, with realistic textures. The dark style background's light and shadow effects create an atmospheric mood, blending artistic fantasy with an exaggerated wide-angle perspective, lens flare, reflections, extreme light and shadow, intense gravitational pull, devouring.",
      sequential_image_generation: "disabled",
      response_format: "url",
      size: "2K",
      stream: false,
      watermark: true
    }

    console.log('Making request to Seedream API...')
    console.log('Endpoint:', endpoint)
    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log('Seedream response status:', response.status)
    console.log('Seedream response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Seedream API error:', response.status, errorText)
      return NextResponse.json({
        error: 'Seedream API request failed',
        status: response.status,
        statusText: response.statusText,
        errorDetails: errorText
      }, { status: 500 })
    }

    const data = await response.json()
    console.log('Seedream success response:', data)

    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test Seedream error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send POST request to test Seedream API with sample code',
    endpoint: process.env.SEEDREAM_API_ENDPOINT,
    hasApiKey: !!process.env.ARK_API_KEY
  })
}
