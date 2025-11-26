export interface SeedreamConfig {
  mode: string
  resolution: string
  ratio: string
  count: number
  // New features for enhanced generation
  model?: string
  image?: string | string[]
  sequentialImageGeneration?: 'disabled' | 'auto'
  sequentialImageGenerationOptions?: {
    max_images?: number
  }
  stream?: boolean
  seed?: number
  guidanceScale?: number
  // Multiple aspect ratios support
  aspectRatios?: string[]
  // Multiple image formats
  formats?: string[]
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
  const apiKey = process.env.ARK_API_KEY
  const apiEndpoint = process.env.SEEDREAM_API_ENDPOINT || 'https://ark.ap-southeast.bytepluses.com/api/v3/images/generations'

  if (!apiKey) {
    throw new Error('ARK_API_KEY is not configured. Please set your BytePlus API key.')
  }

  // Map resolution to size (based on Seedream documentation examples)
  const sizeMap: { [key: string]: string } = {
    '2K': '2K',
    '4K': '4K',
    '512x512': '512x512',
    '1024x1024': '1024x1024',
    'adaptive': 'adaptive',
  }

  // Build request body based on working sample format with enhanced features
  const body: any = {
    model: config.model || 'seedream-4-0-250828',
    prompt,
    response_format: 'url',
    size: sizeMap[config.resolution] || '2K',
    stream: config.stream || false,
    watermark: true, // Use watermark=true like the working sample
    sequential_image_generation: config.sequentialImageGeneration || 'disabled',
  }

  // Handle sequential image generation options
  if (config.sequentialImageGeneration === 'auto' && config.sequentialImageGenerationOptions) {
    body.sequential_image_generation_options = config.sequentialImageGenerationOptions
  }

  // Handle multiple aspect ratios
  if (config.aspectRatios && config.aspectRatios.length > 0) {
    body.aspect_ratios = config.aspectRatios
  }

  // Handle multiple formats
  if (config.formats && config.formats.length > 0) {
    body.formats = config.formats
  }

  // Add optional parameters if provided
  if (config.image) {
    body.image = config.image
  }

  if (config.seed !== undefined) {
    body.seed = config.seed
  }

  if (config.guidanceScale !== undefined) {
    body.guidance_scale = config.guidanceScale
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

  // Handle streaming response
  if (config.stream) {
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Streaming response not available')
    }

    const decoder = new TextDecoder()
    let images: SeedreamImage[] = []

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'image_generation.partial_succeeded' && parsed.url) {
                images.push({
                  url: parsed.url,
                  width: parsed.size ? parseInt(parsed.size.split('x')[0]) : undefined,
                  height: parsed.size ? parseInt(parsed.size.split('x')[1]) : undefined,
                  format: 'jpg',
                })
              }
            } catch (e) {
              // Ignore parsing errors for streaming data
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    if (images.length === 0) {
      throw new Error('No images received from streaming response')
    }

    return { images }
  }

  // Handle non-streaming response
  const data = await response.json()
  console.log('Seedream API response:', data)

  // Handle the exact Seedream response format from their examples
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
