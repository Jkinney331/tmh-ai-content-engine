import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('id')
  const type = searchParams.get('type') // 'video' | 'stitch' | 'all'

  const supabase = getSupabaseClient()

  if (!supabase) {
    // Return mock status for demo
    return NextResponse.json({
      jobs: [
        {
          id: 'demo_1',
          type: 'video_generation',
          status: 'completed',
          progress: 100,
          outputUrl: '/demo/video-output.mp4',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date().toISOString()
        },
        {
          id: 'demo_2',
          type: 'video_stitch',
          status: 'processing',
          progress: 65,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        }
      ],
      message: 'Demo mode - Supabase not configured'
    })
  }

  try {
    let query = supabase
      .from('generation_queue')
      .select('*, cities(name)')
      .in('content_type', type === 'all' ? ['video', 'video_stitch'] :
        type === 'stitch' ? ['video_stitch'] : ['video'])
      .order('created_at', { ascending: false })
      .limit(20)

    if (jobId) {
      query = query.eq('id', jobId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format response
    const jobs = (data || []).map(job => ({
      id: job.id,
      type: job.content_type,
      city: job.cities?.name || null,
      status: job.status,
      progress: job.status === 'completed' ? 100 :
        job.status === 'processing' ? Math.floor(Math.random() * 50 + 25) : 0,
      pipeline: job.model_pipeline,
      resultId: job.result_id,
      error: job.error_message,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at
    }))

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Video status error:', error)
    return NextResponse.json({ error: 'Failed to fetch video status' }, { status: 500 })
  }
}

// Cancel a video job
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('id')

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const { data, error } = await supabase
      .from('generation_queue')
      .update({
        status: 'failed',
        error_message: 'Cancelled by user'
      })
      .eq('id', jobId)
      .in('status', ['pending', 'waiting']) // Can only cancel pending jobs
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({
        error: 'Job not found or already processing'
      }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Job cancelled',
      job: data
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 })
  }
}
