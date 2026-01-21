import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ModelGender } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    return null
  }
  return createClient(supabaseUrl, supabaseKey)
}

const mockModels = [
  { id: '1', name: 'Urban Male Default', gender: 'male' as ModelGender, age_range: '22-30', ethnicity: 'Diverse/Mixed', build: 'Athletic', style_notes: 'Confident stance, streetwear native.', city_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Urban Female Default', gender: 'female' as ModelGender, age_range: '21-28', ethnicity: 'Diverse/Mixed', build: 'Athletic/Slim', style_notes: 'Bold, independent energy.', city_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'LA Male', gender: 'male' as ModelGender, age_range: '25-35', ethnicity: 'Latino/Mixed', build: 'Athletic', style_notes: 'West coast relaxed vibe.', city_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: 'NYC Male', gender: 'male' as ModelGender, age_range: '24-32', ethnicity: 'Black/Latino', build: 'Slim/Athletic', style_notes: 'Fast-paced, confident.', city_id: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const gender = searchParams.get('gender') as ModelGender | null
  const cityId = searchParams.get('city_id')

  const supabase = getSupabaseClient()

  if (!supabase) {
    let data = mockModels
    if (gender) data = data.filter(m => m.gender === gender)
    return NextResponse.json(data)
  }

  try {
    let query = supabase.from('model_specs').select('*').order('name')
    if (gender) query = query.eq('gender', gender)
    if (cityId) query = query.eq('city_id', cityId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const body = await req.json()
    const { data, error } = await supabase.from('model_specs').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 })
  }
}
