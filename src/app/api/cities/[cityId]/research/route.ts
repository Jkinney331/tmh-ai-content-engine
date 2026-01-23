import { NextRequest, NextResponse } from 'next/server'
import { getCityById, hasRealCredentials } from '@/lib/supabase'
import { Database } from '@/types/database'

type CityRow = Database['public']['Tables']['cities']['Row']
import { runCityResearch } from '@/lib/research'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params
    const body = await request.json().catch(() => ({}))
    const categories = Array.isArray(body?.categories) && body.categories.length > 0
      ? body.categories
      : ['slang', 'landmark', 'sport', 'cultural']

    if (!hasRealCredentials) {
      return NextResponse.json(
        { error: 'Supabase not configured. Cannot run research.' },
        { status: 400 }
      )
    }

    const city = (await getCityById(cityId)) as CityRow | null
    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 })
    }

    const result = await runCityResearch(city.id, city.name, categories, body?.customPrompt)

    return NextResponse.json({
      cityId: city.id,
      cityName: city.name,
      summary: result.synthesis,
      elementCount: result.elements.length,
      timestamp: result.timestamp
    })
  } catch (error) {
    console.error('[City Research] Failed to run research:', error)
    return NextResponse.json(
      { error: 'Failed to run city research' },
      { status: 500 }
    )
  }
}
