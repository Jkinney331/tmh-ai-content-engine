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

    let updatedData = data
    const isComplete = updateData.status === 'complete'
    const needsStubUpload =
      isComplete && (!updatedData.cad_file_url || String(updatedData.cad_file_url).startsWith('/stub/'))

    if (needsStubUpload && hasServiceKey) {
      const stubUpload = await uploadStubCadFile(supabase, updatedData)
      if (stubUpload?.cad_file_url) {
        const { data: refreshed, error: refreshError } = await supabase
          .from('ltrfl_cad_specs')
          .update({
            cad_file_url: stubUpload.cad_file_url,
            cad_format: stubUpload.cad_format
          })
          .eq('id', updatedData.id)
          .select()
          .single()

        if (!refreshError && refreshed) {
          updatedData = refreshed
        }
      }
    }

    if (isComplete) {
      await supabase
        .from('ltrfl_concepts')
        .update({ status: 'cad_complete' })
        .eq('id', updatedData.concept_id)
    }

    return NextResponse.json(updatedData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update CAD spec' }, { status: 500 })
  }
}

async function uploadStubCadFile(
  supabase: typeof supabaseAdmin,
  cadSpec: {
    id: string
    concept_id: string
    cad_format: string | null
  }
) {
  const bucket = 'ltrfl-cad'
  const format = (cadSpec.cad_format || 'STL').toLowerCase()
  const filename = `${cadSpec.id}.${format}`
  const path = `concepts/${cadSpec.concept_id}/${filename}`
  const stubContent = buildStubStl(`LTRFL CAD ${cadSpec.id}`)

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, new Blob([stubContent], { type: 'model/stl' }), { upsert: true })

  if (error) {
    console.warn('[LTRFL CAD] Stub upload failed:', error)
    return null
  }

  return {
    cad_file_url: path,
    cad_format: 'STL'
  }
}

function buildStubStl(name: string) {
  const safeName = name.replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 60) || 'LTRFL CAD'
  const vertices = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1]
  ]
  const faces = [
    [0, 1, 2], [0, 2, 3], // bottom
    [4, 5, 6], [4, 6, 7], // top
    [0, 1, 5], [0, 5, 4], // front
    [1, 2, 6], [1, 6, 5], // right
    [2, 3, 7], [2, 7, 6], // back
    [3, 0, 4], [3, 4, 7]  // left
  ]

  const lines = [`solid ${safeName}`]
  for (const [a, b, c] of faces) {
    lines.push('facet normal 0 0 0')
    lines.push('  outer loop')
    lines.push(`    vertex ${vertices[a].join(' ')}`)
    lines.push(`    vertex ${vertices[b].join(' ')}`)
    lines.push(`    vertex ${vertices[c].join(' ')}`)
    lines.push('  endloop')
    lines.push('endfacet')
  }
  lines.push('endsolid')
  return lines.join('\n')
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
