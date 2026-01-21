import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    return null
  }
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const { data, error } = await supabase
      .from('sneakers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Sneaker not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching sneaker:', error)
    return NextResponse.json({ error: 'Failed to fetch sneaker' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { name, tier, brand, colorway, city_relevance, notes, is_active } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (tier !== undefined) updateData.tier = tier
    if (brand !== undefined) updateData.brand = brand
    if (colorway !== undefined) updateData.colorway = colorway
    if (city_relevance !== undefined) updateData.city_relevance = city_relevance
    if (notes !== undefined) updateData.notes = notes
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabase
      .from('sneakers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating sneaker:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in sneaker PUT:', error)
    return NextResponse.json({ error: 'Failed to update sneaker' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const { error } = await supabase
      .from('sneakers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting sneaker:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in sneaker DELETE:', error)
    return NextResponse.json({ error: 'Failed to delete sneaker' }, { status: 500 })
  }
}
