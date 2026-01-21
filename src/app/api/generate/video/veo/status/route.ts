import { NextRequest, NextResponse } from 'next/server';
import { checkVeoStatus } from '@/lib/video-generation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const contentId = searchParams.get('contentId');

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    // Check video status
    const result = await checkVeoStatus(jobId);

    // Update database if status changed
    const supabase = getSupabaseClient();
    if (supabase && contentId) {
      if (result.status === 'completed' && result.videoUrl) {
        await supabase
          .from('generated_content')
          .update({
            status: 'completed',
            output_url: result.videoUrl,
          })
          .eq('id', contentId);
      } else if (result.status === 'failed') {
        await supabase
          .from('generated_content')
          .update({
            status: 'failed',
            error_message: result.error,
          })
          .eq('id', contentId);
      }
    }

    return NextResponse.json({
      success: true,
      jobId,
      contentId,
      status: result.status,
      progress: result.progress,
      videoUrl: result.videoUrl,
      error: result.error,
    });

  } catch (error) {
    console.error('[VEO Status] Check error:', error);
    return NextResponse.json({
      error: 'Failed to check video status',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
