import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE TEST START ===')
    
    // Check environment variables
    const apiKey = process.env.ARK_API_KEY
    const endpoint = process.env.SEEDREAM_API_ENDPOINT
    
    console.log('Environment check:', {
      hasApiKey: !!apiKey,
      hasEndpoint: !!endpoint,
      apiKeyLength: apiKey?.length,
      endpoint: endpoint
    })

    if (!apiKey || !endpoint) {
      console.error('Missing environment variables')
      return NextResponse.json({ error: 'API configuration missing' }, { status: 500 })
    }

    // Simple API call exactly like their documentation
    const body = {
      model: "seedream-4-0-250828",
      prompt: "A beautiful sunset over mountains",
      response_format: "url",
      size: "2K",
      stream: false,
      watermark: false,
      sequential_image_generation: "disabled"
    }

    console.log('Calling Seedream API with:', body)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    console.log('API Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', response.status, errorText)
      return NextResponse.json({ 
        error: 'API call failed', 
        status: response.status,
        details: errorText 
      }, { status: 500 })
    }

    const data = await response.json()
    console.log('API Response:', data)

    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url
      console.log('SUCCESS! Image URL:', imageUrl)
      return NextResponse.json({
        success: true,
        imageUrl: imageUrl,
        message: 'Real AI image generated!'
      })
    } else {
      console.error('No image in response')
      return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    }

  } catch (error) {
    console.error('Complete error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
