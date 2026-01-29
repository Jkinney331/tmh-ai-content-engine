import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hasServiceKey, supabaseAdmin } from '@/lib/supabaseAdmin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(req: NextRequest) {
  const supabase = hasServiceKey ? supabaseAdmin : getSupabaseClient()
  const { searchParams } = new URL(req.url)

  const status = searchParams.get('status')
  const format = searchParams.get('format')
  const search = (searchParams.get('search') || '').trim().toLowerCase()

  if (!supabase) {
    return NextResponse.json([])
  }

  try {
    let query = supabase
      .from('ltrfl_cad_specs')
      .select(
        `
          id,
          concept_id,
          urn_type,
          material,
          status,
          cad_file_url,
          cad_format,
          created_at,
          updated_at,
          concept:ltrfl_concepts (
            id,
            name,
            category,
            subcategory,
            status
          )
        `
      )
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (format) {
      query = query.eq('cad_format', format)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const filtered = (data || []).filter((item: any) => {
      if (!search) return true
      const conceptName = (item.concept?.name || '').toLowerCase()
      const urnType = (item.urn_type || '').toLowerCase()
      const material = (item.material || '').toLowerCase()
      const formatValue = (item.cad_format || '').toLowerCase()
      return (
        conceptName.includes(search) ||
        urnType.includes(search) ||
        material.includes(search) ||
        formatValue.includes(search)
      )
    })

    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CAD files' }, { status: 500 })
  }
}
