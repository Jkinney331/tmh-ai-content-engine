import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, hasServiceKey } from '@/lib/supabaseAdmin'
import { hasRealCredentials } from '@/lib/supabase'
import { cityThreadSeeds } from '@/data/cityThreads'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

export async function POST(_request: NextRequest) {
  try {
    if (!hasRealCredentials || !hasServiceKey) {
      return NextResponse.json(
        { error: 'Supabase service key not configured' },
        { status: 400 }
      )
    }

    const { data: existing, error } = await db
      .from('cities')
      .select('id, name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const existingNames = new Set((existing || []).map((city: any) => city.name?.toLowerCase()))
    const missingSeeds = cityThreadSeeds.filter(
      (seed) => !existingNames.has(seed.name.toLowerCase())
    )

    if (missingSeeds.length === 0) {
      return NextResponse.json({ created: 0, message: 'All cities already exist' })
    }

    const now = new Date().toISOString()
    const rows = missingSeeds.map((seed) => ({
      name: seed.name,
      state: seed.state || null,
      country: seed.country || null,
      status: 'draft',
      nicknames: [],
      area_codes: [],
      visual_identity: {
        tier: seed.metadata?.tier,
        last_activity: seed.metadata?.lastActivity,
      },
      avoid: [],
      user_notes: null,
      created_at: now,
      updated_at: now,
    }))

    const { data: created, error: insertError } = await db
      .from('cities')
      .insert(rows)
      .select('id, name')

    if (insertError) {
      // Fallback insert without state/country/visual_identity if schema differs
      const fallbackRows = missingSeeds.map((seed) => ({
        name: seed.name,
        status: 'draft',
        nicknames: [],
        area_codes: [],
        visual_identity: {},
        avoid: [],
        user_notes: null,
        created_at: now,
        updated_at: now,
      }))
      const { data: fallbackCreated, error: fallbackError } = await db
        .from('cities')
        .insert(fallbackRows)
        .select('id, name')
      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 })
      }
      return NextResponse.json({
        created: fallbackCreated?.length || 0,
        cities: fallbackCreated || [],
      })
    }

    return NextResponse.json({
      created: created?.length || 0,
      cities: created || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed cities' },
      { status: 500 }
    )
  }
}
