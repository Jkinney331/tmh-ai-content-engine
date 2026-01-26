import { NextResponse } from 'next/server';
import { checkVeoStatus, checkSoraStatus } from '@/lib/video-generation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Get all processing videos
    const { data: processingVideos, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'video')
      .eq('status', 'processing');

    if (error) {
      throw error;
    }

    if (!processingVideos || processingVideos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stuck videos found',
        processed: 0,
      });
    }

    const results: Array<{
      id: string;
      jobId: string | null;
      newStatus: string;
      error?: string;
    }> = [];

    for (const video of processingVideos) {
      const metadata = video.output_metadata || {};
      const jobId = metadata.job_id;
      const provider = metadata.provider || 'wavespeed';

      if (!jobId) {
        // Mark as failed if no jobId - can't recover
        await supabase
          .from('generated_content')
          .update({
            status: 'failed',
            error_message: 'No job ID found - unable to poll status',
          })
          .eq('id', video.id);

        results.push({
          id: video.id,
          jobId: null,
          newStatus: 'failed',
          error: 'No job ID found',
        });
        continue;
      }

      try {
        // Check status based on provider/model
        let statusResult;
        if (video.model?.startsWith('sora') || provider === 'openai') {
          statusResult = await checkSoraStatus(jobId);
        } else {
          statusResult = await checkVeoStatus(jobId);
        }

        if (statusResult.status === 'completed' && statusResult.videoUrl) {
          await supabase
            .from('generated_content')
            .update({
              status: 'completed',
              output_url: statusResult.videoUrl,
              output_metadata: {
                ...metadata,
                completed_at: new Date().toISOString(),
              },
            })
            .eq('id', video.id);

          results.push({
            id: video.id,
            jobId,
            newStatus: 'completed',
          });
        } else if (statusResult.status === 'failed') {
          await supabase
            .from('generated_content')
            .update({
              status: 'failed',
              error_message: statusResult.error || 'Video generation failed',
            })
            .eq('id', video.id);

          results.push({
            id: video.id,
            jobId,
            newStatus: 'failed',
            error: statusResult.error,
          });
        } else {
          // Still processing - update metadata with last check time
          await supabase
            .from('generated_content')
            .update({
              output_metadata: {
                ...metadata,
                last_poll: new Date().toISOString(),
                progress: statusResult.progress,
              },
            })
            .eq('id', video.id);

          results.push({
            id: video.id,
            jobId,
            newStatus: 'processing',
          });
        }
      } catch (pollError) {
        console.error(`[Retry Stuck] Failed to poll video ${video.id}:`, pollError);
        results.push({
          id: video.id,
          jobId,
          newStatus: 'processing',
          error: pollError instanceof Error ? pollError.message : 'Poll failed',
        });
      }
    }

    const completed = results.filter((r) => r.newStatus === 'completed').length;
    const failed = results.filter((r) => r.newStatus === 'failed').length;
    const stillProcessing = results.filter((r) => r.newStatus === 'processing').length;

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} stuck videos`,
      processed: results.length,
      completed,
      failed,
      stillProcessing,
      results,
    });
  } catch (error) {
    console.error('[Retry Stuck] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retry stuck videos' },
      { status: 500 }
    );
  }
}

// Allow GET to see status of stuck videos without retrying
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { data: processingVideos, error } = await supabase
      .from('generated_content')
      .select('id, title, model, created_at, output_metadata')
      .eq('content_type', 'video')
      .eq('status', 'processing');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      count: processingVideos?.length || 0,
      videos: processingVideos?.map((v) => ({
        id: v.id,
        title: v.title,
        model: v.model,
        createdAt: v.created_at,
        hasJobId: !!v.output_metadata?.job_id,
        provider: v.output_metadata?.provider,
        lastPoll: v.output_metadata?.last_poll,
      })),
    });
  } catch (error) {
    console.error('[Retry Stuck] GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get stuck videos' },
      { status: 500 }
    );
  }
}
