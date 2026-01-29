import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateImage, isImageGenerationConfigured } from '@/lib/image-generation'
import { isImageDataUrl, uploadImageDataUrl, uploadImageFromUrl } from '@/lib/storageAdmin'
import { generateImages as generateWavespeedImages } from '@/services/wavespeed'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

interface GenerateRequest {
  prompt: string
  templateId?: string
  category: string
  subcategory?: string
  name?: string
  model?: 'gpt-5-image' | 'gpt-5-image-mini' | 'gemini-flash' | 'gemini-pro'
  numVariations?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const {
      prompt,
      templateId,
      category,
      subcategory,
      name,
      model = 'gemini-pro',
      numVariations = 4
    } = body
    const conceptName = name?.trim() || `${category || 'Concept'} Concept`

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Build LTRFL-specific prompt
    const ltrflPrompt = buildLTRFLPrompt(prompt)


    // Check if API is configured
    if (!isImageGenerationConfigured()) {
      const placeholderImages = Array(numVariations).fill(null).map((_, i) => ({
        url: `https://placehold.co/800x800/9CAF88/ffffff?text=${encodeURIComponent(`Urn Concept ${i + 1}`)}`,
        index: i,
        generated_at: new Date().toISOString(),
        model: 'placeholder'
      }))

      return NextResponse.json({
        images: placeholderImages,
        prompt: ltrflPrompt,
        note: 'Using placeholder - configure OPENROUTER_API_KEY for real generation'
      })
    }

    // Generate images (WaveSpeed primary, OpenRouter fallback)
    let images: Array<{ url: string; index: number; generated_at: string; model: string; error?: string }> = []
    try {
      if (!process.env.WAVESPEED_API_KEY) {
        throw new Error('WAVESPEED_API_KEY not configured')
      }

      const urls = await generateWavespeedImages(ltrflPrompt, numVariations)
      images = await Promise.all(
        urls.map(async (url, index) => {
          let finalUrl = url

          if (isImageDataUrl(url)) {
            const stored = await uploadImageDataUrl({
              dataUrl: url,
              bucket: 'ltrfl-concepts',
              prefix: 'ltrfl-concept',
              cityId: null
            })
            if (stored) finalUrl = stored.publicUrl
          } else {
            const stored = await uploadImageFromUrl({
              url,
              bucket: 'ltrfl-concepts',
              prefix: 'ltrfl-concept',
              cityId: null
            })
            if (stored) finalUrl = stored.publicUrl
          }

          return {
            url: finalUrl,
            index,
            generated_at: new Date().toISOString(),
            model: 'wavespeed'
          }
        })
      )
    } catch (wavespeedError) {
      const generationPromises = Array(numVariations).fill(null).map(async (_, index) => {
        try {
          const variedPrompt = `${ltrflPrompt} Variation ${index + 1} of ${numVariations}, unique interpretation.`

          const result = await generateImage({
            prompt: variedPrompt,
            model,
            aspectRatio: '1:1'
          })

          let finalUrl = result.imageUrl
          if (isImageDataUrl(result.imageUrl)) {
            const stored = await uploadImageDataUrl({
              dataUrl: result.imageUrl,
              bucket: 'ltrfl-concepts',
              cityId: null,
              prefix: 'ltrfl-concept'
            })
            if (stored) {
              finalUrl = stored.publicUrl
            }
          }

          return {
            url: finalUrl,
            index,
            generated_at: result.generatedAt,
            model: result.model
          }
        } catch (error) {
          return {
            url: `https://placehold.co/800x800/9CAF88/ffffff?text=${encodeURIComponent('Generation Failed')}`,
            index,
            generated_at: new Date().toISOString(),
            model: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })

      images = await Promise.all(generationPromises)
    }

    // Optionally save as a draft concept
    const supabase = getSupabaseClient()
    let conceptId = null

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('ltrfl_concepts')
          .insert({
            template_id: templateId || null,
            name: conceptName,
            prompt_used: ltrflPrompt,
            category,
            subcategory: subcategory || null,
            images,
            selected_image_index: images.length > 0 ? 0 : null,
            status: 'reviewing'
          })
          .select('id')
          .single()

        if (!error && data) {
          conceptId = data.id
        }
      } catch (dbError) {
      }
    }

    return NextResponse.json({
      conceptId,
      images,
      prompt: ltrflPrompt,
      category,
      subcategory
    })

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate urn concepts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Build LTRFL-specific prompt with brand guidelines
 */
function buildLTRFLPrompt(basePrompt: string): string {
  const brandGuidelines = `
Professional product photography of a memorial cremation urn.
Style: Premium home decor aesthetic, warm and comforting, NOT clinical or morbid.
Lighting: Warm natural lighting, golden hour feel, soft shadows.
Setting: Elegant display setting with subtle living elements (small plant, fabric texture).
Colors: Sage green (#9CAF88) accents, cream (#F5F1EB) tones, terracotta warmth.
Quality: High-end catalog photography, 8K detail, shallow depth of field.
Mood: Peaceful, celebratory of life, dignified, modern.
  `.trim()

  // Combine brand guidelines with user prompt
  return `${brandGuidelines}

Urn Design: ${basePrompt}

Photorealistic rendering, product photography, centered composition, clean background.`
}

// GET endpoint to check configuration
export async function GET() {
  return NextResponse.json({
    configured: isImageGenerationConfigured(),
    models: [
      { id: 'gpt-5-image', name: 'GPT-5 Image', description: 'Best quality, recommended for finals' },
      { id: 'gpt-5-image-mini', name: 'GPT-5 Image Mini', description: 'Fast iteration, lower cost' },
      { id: 'gemini-flash', name: 'Gemini Flash', description: 'Google model, supports aspect ratios' },
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google pro model, highest quality' }
    ],
    defaultVariations: 4
  })
}
