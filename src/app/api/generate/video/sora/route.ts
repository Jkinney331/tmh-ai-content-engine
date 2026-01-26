import { NextRequest, NextResponse } from 'next/server';
import { generateSoraVideo, isVideoGenerationConfigured } from '@/lib/video-generation';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin, hasServiceKey } from '@/lib/supabaseAdmin';

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
      model = 'sora-2',
      duration = 8,
      resolution = '720p',
      aspectRatio = '16:9',
      assetType,
      cityId,
      cityName,
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check configuration
    const config = isVideoGenerationConfigured();
    if (!config.sora) {
      return NextResponse.json({
        error: 'Sora not configured',
        note: 'OPENAI_API_KEY is required for Sora video generation',
      }, { status: 503 });
    }

    // Validate model
    if (!['sora-2', 'sora-2-pro'].includes(model)) {
      return NextResponse.json({
        error: 'Invalid model',
        validModels: ['sora-2', 'sora-2-pro'],
      }, { status: 400 });
    }

    // Validate duration (Sora supports 4, 8, 12 for standard; 10, 15, 25 for pro)
    const validDurations = model === 'sora-2-pro' ? [10, 15, 25] : [4, 8, 12];
    const actualDuration = validDurations.includes(duration) ? duration : validDurations[1];

    console.log('[Sora API] Generating video:', {
      model,
      duration: actualDuration,
      resolution,
      promptLength: prompt.length,
    });

    // Generate video
    const result = await generateSoraVideo({
      prompt,
      model,
      duration: actualDuration,
      resolution,
      aspectRatio,
    });

    // Save to database with jobId for later polling
    const supabase = hasServiceKey ? supabaseAdmin : getSupabaseClient();
    let contentId: string | null = null;

    if (supabase) {
      try {
        const { data: savedContent } = await supabase
          .from('generated_content')
          .insert({
            city_id: cityId || null,
            content_type: 'video',
            title: `Sora Video - ${cityName || 'TMH'}`,
            prompt,
            model: result.model,
            status: 'processing',
            generation_cost_cents: Math.round(result.estimatedCost * 100),
            duration_seconds: actualDuration,
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
        console.warn('[Sora API] Failed to save to database:', dbError);
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
      duration: actualDuration,
      message: 'Video generation started. Poll /api/generate/video/sora/status for completion.',
    });

  } catch (error) {
    console.error('[Sora API] Generation error:', error);
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
    configured: config.sora,
    models: [
      {
        id: 'sora-2',
        name: 'Sora 2 Standard',
        durations: [4, 8, 12],
        resolutions: ['480p', '720p'],
        costPerSecond: 0.10,
        description: 'Fast generation, good for iteration',
      },
      {
        id: 'sora-2-pro',
        name: 'Sora 2 Pro',
        durations: [10, 15, 25],
        resolutions: ['480p', '720p', '1080p'],
        costPerSecond: 0.30,
        description: 'Higher quality, longer videos',
      },
    ],
  });
}
