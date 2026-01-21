import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CompetitorTier } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

const mockCompetitors = [
  { id: '1', name: 'Supreme', tier: 'direct' as CompetitorTier, price_range: '$150-400', target_demo: 'Hypebeasts, 18-35', strengths: ['Brand recognition', 'Hype machine'], weaknesses: ['Expensive resale', 'NYC-centric'], key_products: ['Box logo hoodie', 'Tees'], social_presence: { instagram: '@supremenewyork' }, notes: 'The benchmark.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Kith', tier: 'aspirational' as CompetitorTier, price_range: '$150-500', target_demo: 'Fashion-conscious, 25-40', strengths: ['Quality materials', 'Retail experience'], weaknesses: ['Very expensive'], key_products: ['Hoodies', 'Collabs'], social_presence: { instagram: '@kith' }, notes: 'Elevated streetwear.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'Stussy', tier: 'adjacent' as CompetitorTier, price_range: '$80-200', target_demo: 'Skaters, OG fans', strengths: ['Heritage brand'], weaknesses: ['Less hype now'], key_products: ['Logo tees', 'Hoodies'], social_presence: { instagram: '@stussy' }, notes: 'OG streetwear.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export async function GET() {
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json(mockCompetitors)

  try {
    const { data, error } = await supabase.from('competitors').select('*').order('tier').order('name')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch competitors' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const body = await req.json()
    const { data, error } = await supabase.from('competitors').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create competitor' }, { status: 500 })
  }
}
