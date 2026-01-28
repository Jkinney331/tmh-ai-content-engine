const DEFAULT_WAVESPEED_IMAGE_ENDPOINT =
  'https://api.wavespeed.ai/api/v3/openai/gpt-image-1.5-text-to-image'

interface WavespeedImageResponse {
  data?: {
    outputs?: string[]
    output?: string
    images?: Array<{ url?: string }>
  }
  outputs?: string[]
  output?: string
  images?: Array<{ url?: string }>
}

function extractImageUrl(payload: WavespeedImageResponse): string | null {
  return (
    payload?.data?.outputs?.[0] ||
    payload?.data?.output ||
    payload?.data?.images?.[0]?.url ||
    payload?.outputs?.[0] ||
    payload?.output ||
    payload?.images?.[0]?.url ||
    null
  )
}

async function generateSingleImage(prompt: string): Promise<string> {
  const apiKey = process.env.WAVESPEED_API_KEY
  if (!apiKey) {
    throw new Error('WAVESPEED_API_KEY not configured')
  }

  const endpoint = process.env.WAVESPEED_IMAGE_ENDPOINT || DEFAULT_WAVESPEED_IMAGE_ENDPOINT
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      prompt,
      size: '1024*1024'
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`WaveSpeed image error: ${response.status} ${errorText}`)
  }

  const payload = (await response.json()) as WavespeedImageResponse
  const url = extractImageUrl(payload)
  if (!url) {
    throw new Error('WaveSpeed image response missing URL')
  }

  return url
}

export async function generateImages(prompt: string, count: number): Promise<string[]> {
  const maxRetries = 2
  const results: string[] = []

  for (let i = 0; i < count; i += 1) {
    let attempt = 0
    while (attempt <= maxRetries) {
      try {
        const url = await generateSingleImage(prompt)
        results.push(url)
        break
      } catch (error) {
        attempt += 1
        if (attempt > maxRetries) {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
      }
    }
  }

  return results
}
