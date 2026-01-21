import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SneakerTier } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    return null
  }
  return createClient(supabaseUrl, supabaseKey)
}

// Mock data for when Supabase isn't configured
const mockSneakers: Array<{
  id: string
  name: string
  tier: SneakerTier
  brand: string | null
  colorway: string | null
  city_relevance: string[]
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}> = [
  { id: '1', name: 'Air Jordan 1 Chicago', tier: 'ultra_grail', brand: 'Jordan', colorway: 'Chicago Red/White/Black', city_relevance: ['Chicago', 'New York'], notes: 'The OG', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Air Jordan 11 Concord', tier: 'ultra_grail', brand: 'Jordan', colorway: 'White/Black/Concord', city_relevance: ['Atlanta', 'Detroit'], notes: 'Premium feel', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'Nike Cortez', tier: 'certified_heat', brand: 'Nike', colorway: 'White/Red/Blue', city_relevance: ['Los Angeles', 'Oakland'], notes: 'West Coast essential', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: 'Air Force 1 White', tier: 'heavy_heat', brand: 'Nike', colorway: 'Triple White', city_relevance: ['New York', 'Baltimore'], notes: 'NYC staple', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', name: 'Travis Scott Air Jordan 1', tier: 'heavy_heat', brand: 'Jordan', colorway: 'Mocha', city_relevance: ['Houston', 'Atlanta'], notes: 'Hype piece', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', name: 'New Balance 550', tier: 'new_heat', brand: 'New Balance', colorway: 'White/Green', city_relevance: ['Boston', 'New York'], notes: 'Clean retro style', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', name: 'Astros Jordan 1', tier: 'city_specific', brand: 'Jordan', colorway: 'Orange/Navy', city_relevance: ['Houston'], notes: 'Houston exclusive colorway', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', name: 'Balenciaga Triple S', tier: 'banned', brand: 'Balenciaga', colorway: 'Various', city_relevance: [], notes: 'Too luxury, not streetwear authentic', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tier = searchParams.get('tier') as SneakerTier | null

  const supabase = getSupabaseClient()

  if (!supabase) {
    // Return mock data
    let data = mockSneakers
    if (tier) {
      data = data.filter(s => s.tier === tier)
    }
    return NextResponse.json(data)
  }

  try {
    let query = supabase
      .from('sneakers')
      .select('*')
      .order('name')

    if (tier) {
      query = query.eq('tier', tier)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching sneakers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in sneakers GET:', error)
    return NextResponse.json({ error: 'Failed to fetch sneakers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, tier, brand, colorway, city_relevance, notes, is_active } = body

    if (!name || !tier) {
      return NextResponse.json(
        { error: 'Name and tier are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      // Mock mode - add to in-memory array
      const newSneaker = {
        id: `mock-${Date.now()}`,
        name,
        tier,
        brand: brand || null,
        colorway: colorway || null,
        city_relevance: city_relevance || [],
        notes: notes || null,
        is_active: is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockSneakers.push(newSneaker)
      return NextResponse.json(newSneaker)
    }

    const { data, error } = await supabase
      .from('sneakers')
      .insert({
        name,
        tier,
        brand: brand || null,
        colorway: colorway || null,
        city_relevance: city_relevance || [],
        notes: notes || null,
        is_active: is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating sneaker:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in sneakers POST:', error)
    return NextResponse.json({ error: 'Failed to create sneaker' }, { status: 500 })
  }
}
