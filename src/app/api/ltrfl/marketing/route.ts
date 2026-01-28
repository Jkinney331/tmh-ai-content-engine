import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)

  const stats = searchParams.get('stats') === 'true'
  const contentType = searchParams.get('content_type')
  const status = searchParams.get('status')
  const conceptId = searchParams.get('concept_id')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!supabase) {
    // Return mock data for development
    if (stats) {
      return NextResponse.json({
        video_ad: 0,
        image_ad: 0,
        social_post: 0,
        product_photo: 0,
        total: 0
      })
    }
    return NextResponse.json([])
  }

  try {
    if (stats) {
      // Get counts by content type
      const { data: allContent, error } = await supabase
        .from('ltrfl_marketing_content')
        .select('content_type')

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      const typeCounts = (allContent || []).reduce((acc, item) => {
        acc[item.content_type] = (acc[item.content_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return NextResponse.json({
        video_ad: typeCounts['video_ad'] || 0,
        image_ad: typeCounts['image_ad'] || 0,
        social_post: typeCounts['social_post'] || 0,
        product_photo: typeCounts['product_photo'] || 0,
        total: allContent?.length || 0
      })
    }

    let query = supabase
      .from('ltrfl_marketing_content')
      .select('*, ltrfl_concepts(name, generated_image_url)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (conceptId) {
      query = query.eq('concept_id', conceptId)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch marketing content' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const body = await req.json()

    // Validate content type
    const validTypes = ['video_ad', 'image_ad', 'social_post', 'product_photo']
    if (!body.content_type || !validTypes.includes(body.content_type)) {
      return NextResponse.json({
        error: 'Invalid content_type. Must be: video_ad, image_ad, social_post, or product_photo'
      }, { status: 400 })
    }

    if (!body.prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ltrfl_marketing_content')
      .insert({
        content_type: body.content_type,
        concept_id: body.concept_id || null,
        title: body.title || null,
        prompt: body.prompt,
        generated_content: body.generated_content || {},
        platform: body.platform || null,
        dimensions: body.dimensions || null,
        duration_seconds: body.duration_seconds || null,
        copy_text: body.copy_text || null,
        cta_text: body.cta_text || null,
        status: 'draft'
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create marketing content' }, { status: 500 })
  }
}
