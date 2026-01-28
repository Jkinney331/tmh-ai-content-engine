import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateCADSpecs } from '@/services/cadSpecDefaults'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)

  const conceptId = searchParams.get('concept_id')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!supabase) {
    return NextResponse.json([])
  }

  try {
    let query = supabase
      .from('ltrfl_cad_specs')
      .select('*, ltrfl_concepts(name, category, generated_image_url)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (conceptId) {
      query = query.eq('concept_id', conceptId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CAD specs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const body = await req.json()

    // Validate required fields
    if (!body.concept_id) {
      return NextResponse.json({ error: 'concept_id is required' }, { status: 400 })
    }

    if (!body.urn_type) {
      return NextResponse.json({ error: 'urn_type is required' }, { status: 400 })
    }

    if (!body.material) {
      return NextResponse.json({ error: 'material is required' }, { status: 400 })
    }

    // Validate CAD specs
    const validation = validateCADSpecs({
      volume_cu_in: body.volume_cu_in,
      height_mm: body.height_mm,
      diameter_mm: body.diameter_mm,
      wall_thickness_mm: body.wall_thickness_mm,
      access_method: body.access_method,
      base_plate_specs: body.base_plate_specs
    })

    if (!validation.valid) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }

    // Check if CAD spec already exists for this concept
    const { data: existing } = await supabase
      .from('ltrfl_cad_specs')
      .select('id')
      .eq('concept_id', body.concept_id)
      .single()

    if (existing) {
      // Update existing CAD spec
      const { data, error } = await supabase
        .from('ltrfl_cad_specs')
        .update({
          urn_type: body.urn_type,
          material: body.material,
          volume_cu_in: body.volume_cu_in,
          height_mm: body.height_mm,
          diameter_mm: body.diameter_mm,
          wall_thickness_mm: body.wall_thickness_mm,
          access_method: body.access_method,
          lid_type: body.lid_type || null,
          base_plate_specs: body.base_plate_specs || null,
          engraving_area: body.engraving_area || null,
          status: 'pending'
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Update concept status to cad_pending
      await supabase
        .from('ltrfl_concepts')
        .update({ status: 'cad_pending' })
        .eq('id', body.concept_id)

      return NextResponse.json(data)
    }

    // Create new CAD spec
    const { data, error } = await supabase
      .from('ltrfl_cad_specs')
      .insert({
        concept_id: body.concept_id,
        urn_type: body.urn_type,
        material: body.material,
        volume_cu_in: body.volume_cu_in,
        height_mm: body.height_mm,
        diameter_mm: body.diameter_mm,
        wall_thickness_mm: body.wall_thickness_mm,
        access_method: body.access_method,
        lid_type: body.lid_type || null,
        base_plate_specs: body.base_plate_specs || null,
        engraving_area: body.engraving_area || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update concept status to cad_pending
    await supabase
      .from('ltrfl_concepts')
      .update({ status: 'cad_pending' })
      .eq('id', body.concept_id)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create CAD spec' }, { status: 500 })
  }
}
