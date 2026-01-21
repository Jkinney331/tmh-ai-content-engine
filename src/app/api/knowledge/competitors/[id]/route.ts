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

    if (body.name !== undefined) updateData.name = body.name
    if (body.tier !== undefined) updateData.tier = body.tier
    if (body.price_range !== undefined) updateData.price_range = body.price_range
    if (body.target_demo !== undefined) updateData.target_demo = body.target_demo
    if (body.strengths !== undefined) updateData.strengths = body.strengths
    if (body.weaknesses !== undefined) updateData.weaknesses = body.weaknesses
    if (body.key_products !== undefined) updateData.key_products = body.key_products
    if (body.social_presence !== undefined) updateData.social_presence = body.social_presence
    if (body.notes !== undefined) updateData.notes = body.notes

    const { data, error } = await supabase
      .from('competitors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update competitor' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const { error } = await supabase.from('competitors').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete competitor' }, { status: 500 })
  }
}
