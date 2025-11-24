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

  const body = {
    prompt,
    // TODO: map these fields exactly to Seedream 4.0 API once spec is finalized
    resolution: config.resolution,
    ratio: config.ratio,
    count: config.count,
    mode: config.mode,
  }

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Seedream request failed: ${response.status} ${text}`)
  }

  const data = await response.json()

  // This extraction depends on Seedream's response format; adapt as needed.
  const images: SeedreamImage[] = (data.images || []).map((img: any) => ({
    url: typeof img === 'string' ? img : img.url,
    width: img.width,
    height: img.height,
    format: img.format,
  }))

  return { images }
}
