import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { LearningCategory, LearningSource } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

const mockLearnings = [
  { id: '1', category: 'sneakers' as LearningCategory, city_id: null, insight: 'Jordan 1s resonate most with Chicago and NYC audiences', source: 'feedback' as LearningSource, source_id: null, confidence: 0.85, tags: ['jordan', 'regional'], applied_count: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', category: 'styles' as LearningCategory, city_id: null, insight: 'Oversized hoodies perform better in colder cities', source: 'conversation' as LearningSource, source_id: null, confidence: 0.72, tags: ['seasonal', 'hoodies'], applied_count: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', category: 'cities' as LearningCategory, city_id: null, insight: 'Atlanta prefers bold colors and statement pieces', source: 'feedback' as LearningSource, source_id: null, confidence: 0.90, tags: ['atlanta', 'colors'], applied_count: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', category: 'prompts' as LearningCategory, city_id: null, insight: 'Adding specific color hex codes improves image consistency', source: 'manual' as LearningSource, source_id: null, confidence: 0.95, tags: ['prompts', 'colors', 'technical'], applied_count: 20, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', category: 'models' as LearningCategory, city_id: null, insight: 'Diverse model representation increases engagement by 30%', source: 'feedback' as LearningSource, source_id: null, confidence: 0.88, tags: ['diversity', 'engagement'], applied_count: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') as LearningCategory | null
  const source = searchParams.get('source') as LearningSource | null

  const supabase = getSupabaseClient()

  if (!supabase) {
    let data = mockLearnings
    if (category) data = data.filter(l => l.category === category)
    if (source) data = data.filter(l => l.source === source)
    return NextResponse.json(data)
  }

  try {
    let query = supabase
      .from('learnings')
      .select('*')
      .order('confidence', { ascending: false })
      .order('applied_count', { ascending: false })

    if (category) query = query.eq('category', category)
    if (source) query = query.eq('source', source)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch learnings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const body = await req.json()
    const { category, city_id, insight, source, source_id, confidence, tags } = body

    if (!category || !insight) {
      return NextResponse.json({ error: 'Category and insight are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('learnings')
      .insert({
        category,
        city_id: city_id || null,
        insight,
        source: source || 'manual',
        source_id: source_id || null,
        confidence: confidence ?? 0.5,
        tags: tags || [],
        applied_count: 0,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create learning' }, { status: 500 })
  }
}
