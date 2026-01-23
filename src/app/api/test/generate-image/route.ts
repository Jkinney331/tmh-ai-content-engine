import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint to verify image generation works
 * Tests both OpenRouter (DALL-E 3) and direct OpenAI API
 *
 * GET: Returns configuration status
 * POST: Generates a test image
 */

export async function GET() {
  const openRouterKey = process.env.OPENROUTER_API_KEY || ''
  const openAiKey = process.env.OPENAI_API_KEY || ''

  return NextResponse.json({
    status: 'ready',
    config: {
      openRouterConfigured: openRouterKey.startsWith('sk-or-') && openRouterKey.length > 20,
      openAiConfigured: openAiKey.startsWith('sk-') && openAiKey.length > 20,
    },
    instructions: {
      method: 'POST',
      body: {
        prompt: 'A red sneaker on white background (optional, has default)',
        provider: 'openai | openrouter (optional, defaults to openai)'
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json().catch(() => ({}))
    const prompt = body.prompt || 'Professional product photo of a red high-top sneaker on pure white background, studio lighting, 8K quality'
    const provider = body.provider || 'openai'

    console.log(`[Test Image] Starting generation with ${provider}...`)
    console.log(`[Test Image] Prompt: ${prompt.slice(0, 100)}...`)

    let imageUrl: string
    let rawResponse: unknown

    if (provider === 'openrouter') {
      // Try OpenRouter with DALL-E 3
      const result = await generateWithOpenRouter(prompt)
      imageUrl = result.imageUrl
      rawResponse = result.rawResponse
    } else {
      // Try direct OpenAI DALL-E 3
      const result = await generateWithOpenAI(prompt)
      imageUrl = result.imageUrl
      rawResponse = result.rawResponse
    }

    const duration = Date.now() - startTime

    console.log(`[Test Image] Success! Generated in ${duration}ms`)
    console.log(`[Test Image] URL: ${imageUrl.slice(0, 100)}...`)

    return NextResponse.json({
      success: true,
      imageUrl,
      provider,
      prompt,
      duration: `${duration}ms`,
      rawResponse
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Test Image] Error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

async function generateWithOpenAI(prompt: string): Promise<{ imageUrl: string; rawResponse: unknown }> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('OPENAI_API_KEY not configured or invalid format')
  }

  console.log('[Test Image] Calling OpenAI DALL-E 3...')

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('[Test Image] OpenAI error response:', data)
    throw new Error(data.error?.message || `OpenAI API error: ${response.status}`)
  }

  const imageUrl = data.data?.[0]?.url

  if (!imageUrl) {
    console.error('[Test Image] No image URL in response:', data)
    throw new Error('No image URL in OpenAI response')
  }

  return { imageUrl, rawResponse: data }
}

async function generateWithOpenRouter(prompt: string): Promise<{ imageUrl: string; rawResponse: unknown }> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey || !apiKey.startsWith('sk-or-')) {
    throw new Error('OPENROUTER_API_KEY not configured or invalid format')
  }

  console.log('[Test Image] Calling OpenRouter DALL-E 3...')

  // OpenRouter uses the chat completions endpoint with specific model
  const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'TMH AI Content Engine'
    },
    body: JSON.stringify({
      model: 'openai/dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    })
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('[Test Image] OpenRouter error response:', data)
    throw new Error(data.error?.message || `OpenRouter API error: ${response.status}`)
  }

  // OpenRouter may return in different formats
  const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json

  if (!imageUrl) {
    console.error('[Test Image] No image URL in response:', data)
    throw new Error('No image URL in OpenRouter response')
  }

  // If base64, convert to data URL
  if (data.data?.[0]?.b64_json) {
    return {
      imageUrl: `data:image/png;base64,${data.data[0].b64_json}`,
      rawResponse: { ...data, b64_truncated: true }
    }
  }

  return { imageUrl, rawResponse: data }
}
