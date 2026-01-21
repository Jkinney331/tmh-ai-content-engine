import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

// Video stitching configuration for 24-second ads
const AD_TEMPLATES = {
  standard24: {
    name: '24-Second Standard Ad',
    totalDuration: 24,
    segments: [
      { name: 'hook', duration: 4, description: 'Attention-grabbing opener' },
      { name: 'product_hero', duration: 6, description: 'Product showcase with model' },
      { name: 'lifestyle', duration: 8, description: 'Lifestyle/culture footage' },
      { name: 'cta', duration: 6, description: 'Call-to-action with branding' },
    ]
  },
  story15: {
    name: '15-Second Story Ad',
    totalDuration: 15,
    segments: [
      { name: 'hook', duration: 3, description: 'Quick hook' },
      { name: 'showcase', duration: 8, description: 'Product/lifestyle combo' },
      { name: 'cta', duration: 4, description: 'CTA with swipe up' },
    ]
  },
  reel30: {
    name: '30-Second Reel',
    totalDuration: 30,
    segments: [
      { name: 'hook', duration: 3, description: 'Pattern interrupt opener' },
      { name: 'intro', duration: 5, description: 'Brand/product intro' },
      { name: 'main', duration: 14, description: 'Main content showcase' },
      { name: 'social_proof', duration: 4, description: 'Reviews/engagement' },
      { name: 'cta', duration: 4, description: 'Call-to-action' },
    ]
  }
}

// FFmpeg command builder (for server-side processing)
function buildFFmpegCommand(clips: string[], outputPath: string, options: {
  transition?: string
  transitionDuration?: number
  audioTrack?: string
  resolution?: string
}) {
  const { transition = 'fade', transitionDuration = 0.5, audioTrack, resolution = '1080x1920' } = options

  // Build filter complex for transitions
  const filterParts: string[] = []
  const inputCount = clips.length

  // Scale all inputs to same resolution
  for (let i = 0; i < inputCount; i++) {
    filterParts.push(`[${i}:v]scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`)
  }

  // Apply transitions between clips
  if (transition === 'fade') {
    let lastOutput = 'v0'
    for (let i = 1; i < inputCount; i++) {
      const output = i === inputCount - 1 ? 'vout' : `vt${i}`
      filterParts.push(`[${lastOutput}][v${i}]xfade=transition=fade:duration=${transitionDuration}:offset=${i * 6 - transitionDuration}[${output}]`)
      lastOutput = output
    }
  } else {
    // Simple concatenation without transitions
    filterParts.push(`${Array.from({ length: inputCount }, (_, i) => `[v${i}]`).join('')}concat=n=${inputCount}:v=1:a=0[vout]`)
  }

  // Build the command
  const inputArgs = clips.map(clip => `-i "${clip}"`).join(' ')
  let command = `ffmpeg ${inputArgs}`

  if (audioTrack) {
    command += ` -i "${audioTrack}"`
  }

  command += ` -filter_complex "${filterParts.join(';')}" -map "[vout]"`

  if (audioTrack) {
    command += ` -map ${inputCount}:a -shortest`
  }

  command += ` -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "${outputPath}"`

  return command
}

export async function POST(req: NextRequest) {
  try {
    const {
      template = 'standard24',
      clips, // Array of clip URLs or IDs
      city,
      audioTrack,
      transitions = true,
      outputFormat = 'mp4',
      customSegments, // Optional override of template segments
    } = await req.json()

    const templateConfig = AD_TEMPLATES[template as keyof typeof AD_TEMPLATES]
    if (!templateConfig && !customSegments) {
      return NextResponse.json({
        error: 'Invalid template',
        availableTemplates: Object.keys(AD_TEMPLATES)
      }, { status: 400 })
    }

    const segments = customSegments || templateConfig.segments

    // Validate clips match segments
    if (clips && clips.length !== segments.length) {
      return NextResponse.json({
        error: `Expected ${segments.length} clips for ${template} template, got ${clips.length}`,
        segments: segments.map((s: any) => ({
          name: s.name,
          duration: s.duration,
          description: s.description
        }))
      }, { status: 400 })
    }

    // Build stitch job
    const stitchJob = {
      id: `stitch_${Date.now()}`,
      template: template,
      templateName: templateConfig?.name || 'Custom',
      totalDuration: segments.reduce((sum: number, s: any) => sum + s.duration, 0),
      segments: segments.map((s: any, i: number) => ({
        ...s,
        clipUrl: clips?.[i] || null,
        status: clips?.[i] ? 'ready' : 'pending'
      })),
      audioTrack,
      transitions,
      outputFormat,
      city,
      status: clips?.every((c: string) => c) ? 'ready_to_process' : 'awaiting_clips',
      createdAt: new Date().toISOString(),
    }

    // Generate FFmpeg command preview (for debugging/transparency)
    let ffmpegCommand = null
    if (clips?.every((c: string) => c)) {
      ffmpegCommand = buildFFmpegCommand(
        clips,
        `/output/${stitchJob.id}.${outputFormat}`,
        {
          transition: transitions ? 'fade' : 'none',
          transitionDuration: 0.5,
          audioTrack,
          resolution: '1080x1920' // Vertical for social
        }
      )
    }

    // Queue in Supabase if available
    const supabase = getSupabaseClient()
    if (supabase) {
      const { data: cityData } = city ?
        await supabase.from('cities').select('id').eq('name', city).single() :
        { data: null }

      await supabase.from('generation_queue').insert({
        city_id: cityData?.id || null,
        content_type: 'video_stitch',
        status: stitchJob.status === 'ready_to_process' ? 'pending' : 'waiting',
        priority: 1,
        model_pipeline: {
          type: 'video_stitch',
          template,
          segments: stitchJob.segments,
          ffmpegCommand,
        }
      })
    }

    return NextResponse.json({
      job: stitchJob,
      ffmpegCommand,
      message: stitchJob.status === 'ready_to_process'
        ? 'Video stitch job queued for processing'
        : 'Video stitch job created - waiting for all clips'
    })
  } catch (error) {
    console.error('Video stitch error:', error)
    return NextResponse.json({ error: 'Failed to create stitch job' }, { status: 500 })
  }
}

// Get available templates
export async function GET() {
  return NextResponse.json({
    templates: Object.entries(AD_TEMPLATES).map(([key, config]) => ({
      id: key,
      ...config
    })),
    supportedTransitions: ['fade', 'wipe', 'slide', 'none'],
    supportedFormats: ['mp4', 'webm', 'mov'],
    maxClips: 10,
    notes: {
      aspectRatio: '9:16 (vertical) recommended for social',
      audioFormats: ['mp3', 'aac', 'wav'],
      processing: 'Videos are processed server-side using FFmpeg'
    }
  })
}
