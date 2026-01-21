import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

// Supported video models
const VIDEO_MODELS = {
  'sora-2': {
    id: 'openai/sora-2',
    name: 'Sora 2',
    maxDuration: 20, // seconds
    resolution: '1080p',
    costPer10s: 5.00, // estimated
  },
  'veo-3': {
    id: 'google/veo-3',
    name: 'VEO 3',
    maxDuration: 8, // seconds
    resolution: '1080p',
    costPer10s: 3.00, // estimated
  },
  'runway-gen3': {
    id: 'runway/gen-3-alpha',
    name: 'Runway Gen-3',
    maxDuration: 10, // seconds
    resolution: '1080p',
    costPer10s: 2.00, // estimated
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      model = 'sora-2',
      prompt,
      duration = 6,
      style,
      city,
      aspectRatio = '9:16', // Vertical for social
      imageUrl, // Optional: image-to-video
    } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const modelConfig = VIDEO_MODELS[model as keyof typeof VIDEO_MODELS]
    if (!modelConfig) {
      return NextResponse.json({
        error: 'Invalid model',
        availableModels: Object.keys(VIDEO_MODELS)
      }, { status: 400 })
    }

    // Build enhanced video prompt
    let enhancedPrompt = prompt

    // Add style guidance
    if (style) {
      enhancedPrompt = `Style: ${style}. ${enhancedPrompt}`
    }

    // Add city context if available
    const supabase = getSupabaseClient()
    if (city && supabase) {
      const { data: cityData } = await supabase
        .from('cities')
        .select('visual_identity, landmarks, cultural_notes')
        .eq('name', city)
        .single()

      if (cityData) {
        const landmarks = cityData.landmarks?.slice(0, 3).join(', ') || ''
        if (landmarks) {
          enhancedPrompt += ` Setting: ${city}, featuring recognizable elements like ${landmarks}.`
        }
        if (cityData.visual_identity?.colors) {
          enhancedPrompt += ` Color palette emphasizing ${cityData.visual_identity.colors.join(', ')}.`
        }
      }
    }

    // Add streetwear-specific guidance
    enhancedPrompt += ' Cinematic quality, professional lighting, urban streetwear aesthetic, authentic and aspirational, diverse representation.'

    // For now, simulate the API call since these models may not be fully available
    // In production, this would call the actual video generation API
    const videoJob = {
      id: `video_${Date.now()}`,
      model: modelConfig.name,
      modelId: modelConfig.id,
      prompt: enhancedPrompt,
      originalPrompt: prompt,
      duration,
      aspectRatio,
      resolution: modelConfig.resolution,
      status: 'queued',
      estimatedCost: (duration / 10) * modelConfig.costPer10s,
      city,
      imageUrl,
      createdAt: new Date().toISOString(),
    }

    // Queue the job in Supabase if available
    if (supabase) {
      const { data: cityData } = city ?
        await supabase.from('cities').select('id').eq('name', city).single() :
        { data: null }

      await supabase.from('generation_queue').insert({
        city_id: cityData?.id || null,
        content_type: 'video',
        status: 'pending',
        priority: 2,
        model_pipeline: {
          type: 'video_generation',
          model: modelConfig.id,
          prompt: enhancedPrompt,
          duration,
          aspectRatio,
          imageUrl,
        }
      })

      // Log cost
      await supabase.from('cost_logs').insert({
        category: 'video_generation',
        model: modelConfig.id,
        cost_cents: Math.round(videoJob.estimatedCost * 100),
        city_id: cityData?.id || null,
        content_type: 'video',
        metadata: { duration, aspectRatio }
      })
    }

    return NextResponse.json({
      job: videoJob,
      message: 'Video generation queued',
      note: 'Video generation is async - check /api/video/status for progress'
    })
  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json({ error: 'Failed to queue video generation' }, { status: 500 })
  }
}

// Get available video models
export async function GET() {
  return NextResponse.json({
    models: Object.entries(VIDEO_MODELS).map(([key, config]) => ({
      key,
      ...config
    })),
    recommended: {
      short: 'veo-3', // Best for 4-8s clips
      medium: 'sora-2', // Best for 10-20s
      imageToVideo: 'runway-gen3' // Best for img2vid
    }
  })
}
