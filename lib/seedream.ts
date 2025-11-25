export interface SeedreamConfig {
  mode: string
  resolution: string
  ratio: string
  count: number
}

export interface SeedreamImage {
  url: string
  width?: number
  height?: number
  format?: string
}

export interface SeedreamResult {
  images: SeedreamImage[]
}

export async function generateWithSeedream(prompt: string, config: SeedreamConfig): Promise<SeedreamResult> {
  const apiKey = process.env.SEEDREAM_API_KEY
  const apiEndpoint = process.env.SEEDREAM_API_ENDPOINT || 'https://ark.ap-southeast.bytepluses.com/api/v3/images/generations'

  if (!apiKey) {
    throw new Error('Seedream API key is not configured')
  }

  // Map resolution to size (based on Seedream documentation examples)
  const sizeMap: { [key: string]: string } = {
    '2K': '2K',
    '4K': '4K',
    '512x512': '512x512',
    '1024x1024': '1024x1024',
  }

  const body = {
    model: 'seedream-4-0-250828',
    prompt,
    sequential_image_generation: 'disabled',
    response_format: 'url',
    size: sizeMap[config.resolution] || '2K',
    stream: false,
    watermark: false, // Set to false for cleaner images
  }

  console.log('Calling Seedream API:', { apiEndpoint, body })

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error('Seedream API error:', response.status, text)
    throw new Error(`Seedream request failed: ${response.status} ${text}`)
  }

  const data = await response.json()
  console.log('Seedream API response:', data)

  // Handle the exact Seedream response format from their example
  let images: SeedreamImage[] = []

  if (data.data && Array.isArray(data.data) && data.data.length > 0) {
    // Exact format from Seedream documentation
    images = data.data.map((item: any) => ({
      url: item.url,
      width: item.size ? parseInt(item.size.split('x')[0]) : undefined,
      height: item.size ? parseInt(item.size.split('x')[1]) : undefined,
      format: 'jpg',
    }))
  } else if (data.error) {
    // Handle API error
    console.error('Seedream API returned error:', data.error)
    throw new Error(`Seedream API error: ${data.error.message || 'Unknown error'}`)
  } else {
    // Log the actual response for debugging
    console.error('Unexpected Seedream response format. Full response:', JSON.stringify(data, null, 2))
    throw new Error(`Invalid response format from Seedream API. Response keys: ${Object.keys(data).join(', ')}`)
  }

  if (images.length === 0) {
    throw new Error('No images returned from Seedream API')
  }

  console.log('Successfully parsed images:', images.length)
  return { images }
}
