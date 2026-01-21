import { NextRequest, NextResponse } from 'next/server'
import {
  getOpenRouterConfig,
  TMH_IMAGE_MODELS,
  TMH_VIDEO_MODELS,
  getPipelineById,
  isOpenRouterConfigured,
} from '@/lib/openrouter'

export async function POST(req: NextRequest) {
  try {
    // Check if OpenRouter is configured
    if (!isOpenRouterConfigured()) {
      return NextResponse.json(
        {
          error: 'OpenRouter API key not configured',
          hint: 'Add OPENROUTER_API_KEY to your environment variables',
        },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { prompt, pipelineId, cityContext, productType, designStyle } = body

    if (!prompt || !pipelineId) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, pipelineId' },
        { status: 400 }
      )
    }

    const pipeline = getPipelineById(pipelineId)
    if (!pipeline) {
      return NextResponse.json(
        { error: `Pipeline not found: ${pipelineId}` },
        { status: 400 }
      )
    }

    const config = getOpenRouterConfig()
    const imageModel = TMH_IMAGE_MODELS[pipeline.imageModel]
    const startTime = Date.now()

    // Build the TMH-specific prompt
    const tmhPrompt = buildTMHPrompt({
      basePrompt: prompt,
      cityContext,
      productType,
      designStyle,
    })

    // Step 1: Generate image
    const imageResponse = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        model: imageModel.id,
        messages: [
          {
            role: 'user',
            content: tmhPrompt,
          },
        ],
        max_tokens: 1,
        temperature: 0.7,
      }),
    })

    if (!imageResponse.ok) {
      const errorData = await imageResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: 'Image generation failed',
          details: errorData.error?.message || `HTTP ${imageResponse.status}`,
          pipeline: pipelineId,
        },
        { status: 500 }
      )
    }

    const imageData = await imageResponse.json()
    const imageContent = imageData.choices?.[0]?.message?.content || ''

    // Extract image URL from response
    const urlMatch = imageContent.match(/https?:\/\/[^\s\)\"\']+/)
    const imageUrl = urlMatch ? urlMatch[0] : null

    const imageLatencyMs = Date.now() - startTime
    let totalCostCents = imageModel.avgCostCents

    // Step 2: Generate video if pipeline includes video model
    let videoUrl = null
    let videoLatencyMs = 0

    if (pipeline.videoModel) {
      const videoModel = TMH_VIDEO_MODELS[pipeline.videoModel]
      const videoStartTime = Date.now()

      const videoPrompt = `Animate this image with subtle motion effects suitable for ${productType || 'apparel'} marketing. Style: ${designStyle || 'modern'}. Keep the product as the focal point. Create a 3-5 second loop.`

      const videoResponse = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({
          model: videoModel.id,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: videoPrompt },
                ...(imageUrl ? [{ type: 'image_url', image_url: { url: imageUrl } }] : []),
              ],
            },
          ],
          max_tokens: 1,
          temperature: 0.7,
        }),
      })

      if (videoResponse.ok) {
        const videoData = await videoResponse.json()
        const videoContent = videoData.choices?.[0]?.message?.content || ''
        const videoUrlMatch = videoContent.match(/https?:\/\/[^\s\)\"\']+/)
        videoUrl = videoUrlMatch ? videoUrlMatch[0] : null
        videoLatencyMs = Date.now() - videoStartTime
        totalCostCents += videoModel.avgCostCents
      }
    }

    const totalLatencyMs = Date.now() - startTime

    return NextResponse.json({
      success: true,
      pipeline: {
        id: pipeline.id,
        name: pipeline.name,
        imageModel: pipeline.imageModel,
        videoModel: pipeline.videoModel,
      },
      result: {
        imageUrl,
        videoUrl,
        prompt: tmhPrompt,
      },
      metrics: {
        totalCostCents,
        totalLatencyMs,
        imageLatencyMs,
        videoLatencyMs,
        estimatedCostCents: pipeline.estimatedCostCents,
        estimatedLatencyMs: pipeline.estimatedLatencyMs,
      },
    })
  } catch (error) {
    console.error('Pipeline generation error:', error)
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function buildTMHPrompt({
  basePrompt,
  cityContext,
  productType,
  designStyle,
}: {
  basePrompt: string
  cityContext?: { name: string; state?: string; slang?: string }
  productType?: string
  designStyle?: string
}): string {
  const parts: string[] = []

  // TMH brand context
  parts.push('Create a premium streetwear product image for TMH (The Money Hood) brand.')

  // Product type
  if (productType) {
    parts.push(`Product: ${productType}`)
  }

  // Design style
  if (designStyle) {
    parts.push(`Style: ${designStyle} aesthetic`)
  }

  // City context
  if (cityContext) {
    parts.push(`City: ${cityContext.name}${cityContext.state ? `, ${cityContext.state}` : ''}`)
    if (cityContext.slang) {
      parts.push(`Incorporate local slang/text: "${cityContext.slang}"`)
    }
  }

  // Base prompt from user
  parts.push(`\nDesign concept: ${basePrompt}`)

  // Quality requirements
  parts.push('\nRequirements:')
  parts.push('- High-end fashion photography quality')
  parts.push('- Clean, professional product presentation')
  parts.push('- Suitable for $150+ premium streetwear positioning')
  parts.push('- No watermarks or text overlays')

  return parts.join('\n')
}
