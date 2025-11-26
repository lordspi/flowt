import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, config } = await request.json()
    
    console.log('=== DEBUG API CALL ===')
    console.log('Prompt:', prompt)
    console.log('Config:', config)
    
    const apiKey = process.env.ARK_API_KEY
    const apiEndpoint = process.env.SEEDREAM_API_ENDPOINT || 'https://ark.ap-southeast.bytepluses.com/api/v3/images/generations'
    
    console.log('API Key exists:', !!apiKey)
    console.log('API Endpoint:', apiEndpoint)
    
    if (!apiKey) {
      return NextResponse.json({ error: 'ARK_API_KEY is not configured' }, { status: 500 })
    }

    // Simple test request
    const body = {
      model: 'seedream-4-0-250828',
      prompt: prompt || 'A beautiful landscape',
      response_format: 'url',
      size: '2K',
      stream: false,
      watermark: true,
      aspect_ratios: ['1:1']
    }
    
    console.log('Request body:', JSON.stringify(body, null, 2))

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('Response body:', responseText)

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'API call failed',
        status: response.status,
        statusText: response.statusText,
        body: responseText
      }, { status: 500 })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      return NextResponse.json({ 
        error: 'Invalid JSON response',
        rawResponse: responseText
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      data: data,
      rawResponse: responseText
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 })
  }
}
