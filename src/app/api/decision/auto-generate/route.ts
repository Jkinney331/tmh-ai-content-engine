import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

// Auto-decision engine for content generation
export async function POST(req: NextRequest) {
  try {
    const { city, contentType, autoApprove = false } = await req.json()

    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Gather all relevant data for decision making
    let cityData = null
    let sneakers: any[] = []
    let styleSlots: any[] = []
    let learnings: any[] = []

    if (supabase) {
      // Fetch city
      const { data: cd } = await supabase
        .from('cities')
        .select('*')
        .eq('name', city)
        .single()
      cityData = cd

      // Fetch sneakers with city relevance
      const { data: s } = await supabase
        .from('sneakers')
        .select('*')
        .eq('is_active', true)
        .not('tier', 'eq', 'banned')
      sneakers = s || []

      // Prioritize city-relevant sneakers
      sneakers.sort((a, b) => {
        const aRelevant = a.city_relevance?.includes(city) ? 1 : 0
        const bRelevant = b.city_relevance?.includes(city) ? 1 : 0
        return bRelevant - aRelevant
      })

      // Fetch style slots
      const { data: ss } = await supabase
        .from('style_slots')
        .select('*')
        .eq('is_active', true)
      styleSlots = ss || []

      // Fetch learnings
      const { data: l } = await supabase
        .from('learnings')
        .select('*')
        .gte('confidence', 0.6)
      learnings = l || []
    }

    // Build decision context
    const decisionContext = {
      city: cityData || { name: city },
      availableSneakers: sneakers.slice(0, 10),
      styleSlots,
      relevantLearnings: learnings.filter(l =>
        l.category === 'cities' || l.category === 'sneakers' || l.category === 'styles'
      )
    }

    // AI decision making
    const decisionPrompt = `As the TMH AI Decision Engine, select the optimal content configuration for ${city}.

Available Data:
${JSON.stringify(decisionContext, null, 2)}

Content Type: ${contentType || 'lifestyle_shot'}

Make decisions on:
1. Primary sneaker (from available list, prefer city-relevant)
2. Style slot (consider gender balance)
3. Model demographics (age, ethnicity, style that reflects city)
4. Background/setting (city-specific location)
5. Mood/vibe (match city culture)
6. Color palette considerations
7. Any elements to avoid (based on city data)

Return a JSON object with your decisions and reasoning for each.`

    const response = await callOpenRouter({
      model: 'anthropic/claude-sonnet-4',
      messages: [
        {
          role: 'system',
          content: 'You are a streetwear content decision engine. Make culturally-informed choices based on available data. Always provide reasoning for decisions.'
        },
        {
          role: 'user',
          content: decisionPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.4, // Lower for more consistent decisions
    })

    const content = response.choices[0]?.message?.content || ''

    // Parse decision
    let decision = null
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        decision = JSON.parse(jsonMatch[0])
      }
    } catch {
      // Continue with raw content
    }

    // If auto-approve and we have a valid decision, queue for generation
    let queuedJob = null
    if (autoApprove && decision && supabase) {
      const { data: job, error } = await supabase
        .from('generation_queue')
        .insert({
          city_id: cityData?.id || null,
          content_type: contentType || 'lifestyle_shot',
          status: 'pending',
          priority: 1,
          model_pipeline: {
            decision,
            auto_approved: true,
            approved_at: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (!error) {
        queuedJob = job
      }
    }

    return NextResponse.json({
      city,
      contentType: contentType || 'lifestyle_shot',
      decision,
      rawContent: content,
      queuedJob,
      autoApproved: autoApprove && !!queuedJob,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Auto-generate decision error:', error)
    return NextResponse.json({ error: 'Failed to make generation decision' }, { status: 500 })
  }
}

// Get generation queue status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const supabase = getSupabaseClient()
  if (!supabase) {
    return NextResponse.json({
      queue: [],
      message: 'Supabase not configured'
    })
  }

  try {
    let query = supabase
      .from('generation_queue')
      .select('*, cities(name)')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(50)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ queue: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
  }
}
