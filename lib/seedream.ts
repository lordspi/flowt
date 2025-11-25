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
  const apiEndpoint = process.env.SEEDREAM_API_ENDPOINT

  if (!apiKey || !apiEndpoint) {
    throw new Error('Seedream API is not configured')
  }

  // Map resolution to size
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
    watermark: false,
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

  // Handle the response format based on the actual API response
  let images: SeedreamImage[] = []

  if (data.images && Array.isArray(data.images)) {
    // If API returns images array
    images = data.images.map((img: any) => ({
      url: typeof img === 'string' ? img : img.url,
      width: img.width,
      height: img.height,
      format: img.format,
    }))
  } else if (data.image) {
    // If API returns single image
    images = [{
      url: typeof data.image === 'string' ? data.image : data.image.url,
      width: data.image.width,
      height: data.image.height,
      format: data.image.format,
    }]
  } else if (data.url) {
    // If API returns direct URL
    images = [{ url: data.url }]
  } else {
    console.error('Unexpected Seedream response format:', data)
    throw new Error('Invalid response format from Seedream API')
  }

  return { images }
}
