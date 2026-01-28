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
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!supabase) {
    // Return mock data for development
    if (stats) {
      return NextResponse.json({
        total: 0,
        draft: 0,
        reviewing: 0,
        approved: 0,
        rejected: 0
      })
    }
    return NextResponse.json([])
  }

  try {
    if (stats) {
      // Get counts by status
      const { data: allConcepts, error } = await supabase
        .from('ltrfl_concepts')
        .select('status')

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      const statusCounts = (allConcepts || []).reduce((acc, concept) => {
        acc[concept.status] = (acc[concept.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return NextResponse.json({
        total: allConcepts?.length || 0,
        draft: statusCounts['draft'] || 0,
        reviewing: statusCounts['reviewing'] || 0,
        approved: statusCounts['approved'] || 0,
        rejected: statusCounts['rejected'] || 0
      })
    }

    let query = supabase
      .from('ltrfl_concepts')
      .select('*, ltrfl_templates(name, category)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch concepts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const body = await req.json()
    const { data, error } = await supabase
      .from('ltrfl_concepts')
      .insert({
        template_id: body.template_id || null,
        prompt_used: body.prompt_used,
        category: body.category,
        subcategory: body.subcategory || null,
        images: body.images || [],
        selected_image_index: body.selected_image_index ?? null,
        status: body.status || 'reviewing',
        version: body.version || 1,
        parent_version_id: body.parent_version_id || null,
        notes: body.notes || null
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create concept' }, { status: 500 })
  }
}
