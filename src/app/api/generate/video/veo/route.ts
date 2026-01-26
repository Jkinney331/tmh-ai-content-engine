import { NextRequest, NextResponse } from 'next/server';
import { generateVeoVideo, isVideoGenerationConfigured } from '@/lib/video-generation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      model = 'veo-3',
      duration = 8,
      aspectRatio = '16:9',
      resolution = '1080p',
      generateAudio = true,
      assetType,
      cityId,
      cityName,
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check configuration
    const config = isVideoGenerationConfigured();
    if (!config.veo) {
      return NextResponse.json({
        error: 'VEO not configured',
        note: 'WAVESPEED_API_KEY is required for VEO video generation',
      }, { status: 503 });
    }

    // Validate model
    if (!['veo-3', 'veo-3-fast'].includes(model)) {
      return NextResponse.json({
        error: 'Invalid model',
        validModels: ['veo-3', 'veo-3-fast'],
      }, { status: 400 });
    }

    // Validate aspect ratio
    const validAspectRatios = ['16:9', '9:16', '1:1'];
    if (!validAspectRatios.includes(aspectRatio)) {
      return NextResponse.json({
        error: 'Invalid aspect ratio',
        validAspectRatios,
      }, { status: 400 });
    }

    console.log('[VEO API] Generating video:', {
      model,
      duration,
      aspectRatio,
      resolution,
      generateAudio,
      promptLength: prompt.length,
    });

    // Generate video
    const result = await generateVeoVideo({
      prompt,
      model,
      duration,
      aspectRatio,
      resolution,
      generateAudio,
    });

    // Save to database with jobId for later polling
    const supabase = getSupabaseClient();
    let contentId: string | null = null;

    if (supabase) {
      try {
        const { data: savedContent } = await supabase
          .from('generated_content')
          .insert({
            city_id: cityId || null,
            content_type: 'video',
            title: `VEO Video - ${cityName || 'TMH'}`,
            prompt,
            model: result.model,
            status: 'processing',
            generation_cost_cents: Math.round(result.estimatedCost * 100),
            duration_seconds: duration,
            output_metadata: {
              job_id: result.jobId,
              provider: result.provider,
              asset_type: assetType,
              started_at: new Date().toISOString(),
            },
          })
          .select()
          .single();

        contentId = savedContent?.id || null;
      } catch (dbError) {
        console.warn('[VEO API] Failed to save to database:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      jobId: result.jobId,
      contentId,
      status: result.status,
      provider: result.provider,
      model: result.model,
      estimatedCost: result.estimatedCost,
      duration,
      aspectRatio,
      message: 'Video generation started. Poll /api/generate/video/veo/status for completion.',
    });

  } catch (error) {
    console.error('[VEO API] Generation error:', error);
    return NextResponse.json({
      error: 'Failed to start video generation',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Get available options
export async function GET() {
  const config = isVideoGenerationConfigured();

  return NextResponse.json({
    configured: config.veo,
    models: [
      {
        id: 'veo-3',
        name: 'VEO 3',
        durations: [4, 6, 8, 10, 12],
        aspectRatios: ['16:9', '9:16', '1:1'],
        resolutions: ['720p', '1080p'],
        costPerSecond: 0.75,
        supportsAudio: true,
        description: 'High quality Google video model with audio',
      },
      {
        id: 'veo-3-fast',
        name: 'VEO 3 Fast',
        durations: [4, 6, 8],
        aspectRatios: ['16:9', '9:16', '1:1'],
        resolutions: ['720p', '1080p'],
        costPerSecond: 0.50,
        supportsAudio: true,
        description: 'Faster generation, slightly lower quality',
      },
    ],
  });
}
