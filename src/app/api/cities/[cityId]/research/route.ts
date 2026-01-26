import { NextRequest, NextResponse } from 'next/server'
import { getCityById, hasRealCredentials } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
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

    if (!process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_KEY is required to write city research. Add it to the Vercel environment.' },
        { status: 400 }
      )
    }

    const city = (await getCityById(cityId)) as CityRow | null
    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 })
    }

    const runId = `run-${Date.now()}`
    const startedAt = new Date().toISOString()
    try {
      await supabaseAdmin
        .from('city_elements')
        .insert({
          city_id: city.id,
          element_type: 'research_run',
          element_key: runId,
          element_value: {
            status: 'running',
            categories,
            started_at: startedAt,
          },
          status: 'reviewed',
        })
    } catch (err) {
      console.warn('[City Research] Failed to log research run start:', err)
    }

    const result = await runCityResearch(city.id, city.name, categories, body?.customPrompt)

    try {
      await supabaseAdmin
        .from('city_elements')
        .update({
          element_value: {
            status: 'completed',
            categories,
            started_at: startedAt,
            completed_at: new Date().toISOString(),
            summary: result.synthesis,
          },
          status: 'reviewed',
        })
        .eq('city_id', city.id)
        .eq('element_type', 'research_run')
        .eq('element_key', runId)
    } catch (err) {
      console.warn('[City Research] Failed to log research run completion:', err)
    }

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
