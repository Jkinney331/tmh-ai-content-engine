import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const body = await req.json()
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (body.category !== undefined) updateData.category = body.category
    if (body.city_id !== undefined) updateData.city_id = body.city_id
    if (body.insight !== undefined) updateData.insight = body.insight
    if (body.source !== undefined) updateData.source = body.source
    if (body.confidence !== undefined) updateData.confidence = body.confidence
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.applied_count !== undefined) updateData.applied_count = body.applied_count

    const { data, error } = await supabase
      .from('learnings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update learning' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const { error } = await supabase.from('learnings').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete learning' }, { status: 500 })
  }
}

// Increment applied count
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    // First get current count
    const { data: current, error: fetchError } = await supabase
      .from('learnings')
      .select('applied_count')
      .eq('id', id)
      .single()

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

    const { data, error } = await supabase
      .from('learnings')
      .update({
        applied_count: (current?.applied_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to increment applied count' }, { status: 500 })
  }
}
