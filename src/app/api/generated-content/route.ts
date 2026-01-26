import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

interface GeneratedContentRequest {
  city_id?: string
  content_type: string
  title?: string
  prompt?: string
  model?: string
  output_url: string
  status?: string
  feedback?: {
    thumbsUp?: boolean
    thumbsDown?: boolean
    tags?: string[]
    text?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratedContentRequest = await request.json()

    if (!body.output_url) {
      return NextResponse.json(
        { error: 'output_url is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      console.warn('[Generated Content] Supabase not configured')
      return NextResponse.json({
        success: true,
        message: 'Database not configured - image approval simulated',
        data: { id: `mock-${Date.now()}`, ...body }
      })
    }

    const { data, error } = await supabase
      .from('generated_content')
      .insert({
        city_id: body.city_id || null,
        content_type: body.content_type,
        title: body.title,
        prompt: body.prompt,
        model: body.model,
        output_url: body.output_url,
        status: body.status || 'approved',
        output_metadata: body.feedback ? { feedback: body.feedback } : {}
      })
      .select()
      .single()

    if (error) {
      console.error('[Generated Content] Insert error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('[Generated Content] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const contentType = searchParams.get('content_type')
    const cityId = searchParams.get('city_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json({
        data: [],
        count: 0,
        message: 'Database not configured'
      })
    }

    let query = supabase
      .from('generated_content')
      .select('*, cities(id, name, state)', { count: 'exact' })

    if (status) {
      query = query.eq('status', status)
    }

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    if (cityId) {
      query = query.eq('city_id', cityId)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[Generated Content] Query error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      count
    })

  } catch (error) {
    console.error('[Generated Content] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json({
        success: true,
        message: 'Database not configured - update simulated',
        data: { id, ...updates }
      })
    }

    const { data, error } = await supabase
      .from('generated_content')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Generated Content] Update error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('[Generated Content] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
