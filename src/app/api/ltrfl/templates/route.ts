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

  const countOnly = searchParams.get('count_only') === 'true'
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  const search = searchParams.get('search')

  if (!supabase) {
    // Return mock data for development
    if (countOnly) {
      return NextResponse.json({ count: 60 })
    }
    return NextResponse.json([])
  }

  try {
    if (countOnly) {
      const { count, error } = await supabase
        .from('ltrfl_templates')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ count: count || 0 })
    }

    let query = supabase
      .from('ltrfl_templates')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('subcategory')
      .order('name')

    if (category) {
      query = query.eq('category', category)
    }

    if (subcategory) {
      query = query.eq('subcategory', subcategory)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,prompt.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const body = await req.json()
    const { data, error } = await supabase
      .from('ltrfl_templates')
      .insert({
        category: body.category,
        subcategory: body.subcategory,
        name: body.name,
        prompt: body.prompt,
        variables: body.variables || {},
        brand_colors: body.brand_colors || { primary: '#9CAF88', secondary: '#F5F1EB' },
        is_active: true
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
