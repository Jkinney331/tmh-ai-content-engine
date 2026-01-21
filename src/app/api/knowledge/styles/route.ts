import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { StyleGender } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

const mockStyles = [
  { id: '1', slot_number: 1, gender: 'male' as StyleGender, name: 'Casual Street', top: 'TMH Hoodie', bottom: 'Black Dickies', sneaker_tier: 'heat' as const, accessories: ['Watch', 'Chain'], mood: 'Relaxed, confident', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', slot_number: 2, gender: 'male' as StyleGender, name: 'Premium Flex', top: 'TMH Hoodie', bottom: 'Dark Denim', sneaker_tier: 'grail' as const, accessories: ['Gold Chain', 'Watch', 'Cap'], mood: 'Elevated, statement', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', slot_number: 1, gender: 'female' as StyleGender, name: 'Oversized Comfy', top: 'TMH Hoodie (oversized)', bottom: 'Bike Shorts', sneaker_tier: 'heat' as const, accessories: ['Hoop earrings'], mood: 'Cozy, cute', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', slot_number: 2, gender: 'female' as StyleGender, name: 'Crop Flex', top: 'TMH Cropped Hoodie', bottom: 'High-waist Jeans', sneaker_tier: 'grail' as const, accessories: ['Layered necklaces'], mood: 'Fashion-forward', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json(mockStyles)

  try {
    const { data, error } = await supabase.from('style_slots').select('*').order('gender').order('slot_number')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch styles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const body = await req.json()
    const { data, error } = await supabase.from('style_slots').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create style' }, { status: 500 })
  }
}
