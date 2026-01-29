import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hasServiceKey, supabaseAdmin } from '@/lib/supabaseAdmin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = hasServiceKey ? supabaseAdmin : getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { id } = await params

  try {
    const { data, error } = await supabase
      .from('ltrfl_cad_specs')
      .select('*, ltrfl_concepts(name, category, generated_image_url, status)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'CAD spec not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CAD spec' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = hasServiceKey ? supabaseAdmin : getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { id } = await params

  try {
    const body = await req.json()

    // Only allow updating specific fields
    const allowedFields = [
      'urn_type', 'material', 'volume_cu_in', 'height_mm', 'diameter_mm',
      'wall_thickness_mm', 'access_method', 'lid_type', 'base_plate_specs',
      'engraving_area', 'cad_file_url', 'cad_format', 'status', 'error_message'
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ltrfl_cad_specs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'CAD spec not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If status is complete, update concept status to cad_complete
    if (updateData.status === 'complete') {
      await supabase
        .from('ltrfl_concepts')
        .update({ status: 'cad_complete' })
        .eq('id', data.concept_id)
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update CAD spec' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = hasServiceKey ? supabaseAdmin : getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { id } = await params

  try {
    // Get the concept_id before deleting
    const { data: cadSpec } = await supabase
      .from('ltrfl_cad_specs')
      .select('concept_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('ltrfl_cad_specs')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Reset concept status back to approved if CAD spec is deleted
    if (cadSpec?.concept_id) {
      await supabase
        .from('ltrfl_concepts')
        .update({ status: 'approved' })
        .eq('id', cadSpec.concept_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete CAD spec' }, { status: 500 })
  }
}
