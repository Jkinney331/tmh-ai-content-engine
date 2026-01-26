import { NextRequest, NextResponse } from 'next/server'
import { getCityById, hasRealCredentials } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { runCityResearch } from '@/lib/research'
import { callOpenRouter } from '@/lib/openrouter'
import { Database } from '@/types/database.types'

type CityRow = Database['public']['Tables']['cities']['Row']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

/**
 * Fallback research using OpenRouter when service key is not available
 * Returns research data without saving to database
 */
async function runFallbackResearch(cityName: string, categories: string[]) {
  // Build category-specific prompts
  const categoryPrompts: Record<string, string> = {
    slang: `List 8-10 local slang terms and expressions used in ${cityName}, especially in streetwear/fashion contexts.`,
    landmark: `List 8-10 iconic landmarks and neighborhoods in ${cityName} that resonate with streetwear culture.`,
    sport: `List the major sports teams in ${cityName} with their colors and fan traditions.`,
    cultural: `Describe the streetwear and cultural scene in ${cityName} including events, styles, and influences.`,
    visualIdentity: `Describe visual identity elements of ${cityName}: signature colors, architectural influences, iconic imagery.`,
    areaCodes: `List the area codes for ${cityName} and their cultural significance.`,
    palettes: `Suggest 3-4 color palettes inspired by ${cityName}'s culture, landmarks, and teams.`,
    typography: `Describe typography and lettering styles associated with ${cityName}.`,
    music: `Describe the music scene in ${cityName}: genres, notable artists, venues.`,
    creators: `List notable local creators, influencers, and fashion figures from ${cityName}.`,
    avoid: `List topics, imagery, or references to avoid when creating content for ${cityName}.`,
  }

  const elements: Array<{
    element_type: string
    element_key: string
    element_value: any
    status: string
  }> = []

  // Run research for each requested category
  for (const category of categories) {
    const prompt = categoryPrompts[category]
    if (!prompt) continue

    try {
      const response = await callOpenRouter({
        model: 'perplexity/sonar-pro',
        messages: [
          {
            role: 'system',
            content: `You are a cultural research assistant. Return a JSON array of objects with "name" and "description" fields. Example: [{"name": "term1", "description": "explanation"}]. Return ONLY valid JSON, no other text.`
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      })

      const content = response.choices[0]?.message?.content || ''

      // Try to extract JSON array from response
      let items: Array<{ name: string; description: string }> = []
      try {
        // Look for JSON array
        const arrayMatch = content.match(/\[[\s\S]*\]/)
        if (arrayMatch) {
          items = JSON.parse(arrayMatch[0])
        }
      } catch {
        // If JSON parsing fails, extract items from text using patterns
        const lines = content.split('\n').filter(line => line.trim())
        for (const line of lines) {
          // Match patterns like "- **Term**: description" or "1. Term - description"
          const match = line.match(/[-*\d.]+\s*\*?\*?([^:*]+)\*?\*?[:\-–]\s*(.+)/i)
          if (match) {
            items.push({
              name: match[1].trim().replace(/\*+/g, ''),
              description: match[2].trim()
            })
          }
        }
      }

      // Map category to element_type
      const typeMapping: Record<string, string> = {
        slang: 'slang',
        landmark: 'landmark',
        sport: 'sport',
        cultural: 'cultural',
        visualIdentity: 'visual_identity',
        areaCodes: 'area_codes',
        palettes: 'palettes',
        typography: 'typography',
        music: 'music',
        creators: 'creators',
        avoid: 'avoid',
      }
      const elementType = typeMapping[category] || 'cultural'

      // Convert items to elements
      for (const item of items.slice(0, 10)) {
        if (!item.name) continue
        const key = item.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, 50)

        if (key) {
          elements.push({
            element_type: elementType,
            element_key: key,
            element_value: {
              name: item.name,
              description: item.description || '',
              source: 'perplexity-fallback'
            },
            status: 'pending'
          })
        }
      }

      // If no items were parsed, create a summary element
      if (items.length === 0 && content.length > 50) {
        elements.push({
          element_type: elementType,
          element_key: `${category}_summary`,
          element_value: {
            name: `${cityName} ${category.replace(/([A-Z])/g, ' $1').trim()}`,
            description: content.slice(0, 500),
            source: 'perplexity-fallback'
          },
          status: 'pending'
        })
      }
    } catch (err) {
      console.warn(`[Fallback Research] Failed to research ${category}:`, err)
    }
  }

  return {
    elements,
    synthesis: `Research completed for ${cityName}. Found ${elements.length} cultural elements across ${categories.length} categories.`,
  }
}

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

    const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_KEY)
    let result: any
    let savedToDatabase = false
    let warning: string | undefined

    if (hasServiceKey) {
      // Full research with database persistence
      const runId = `run-${Date.now()}`
      const startedAt = new Date().toISOString()

      try {
        await db.from('city_elements').insert({
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

      result = await runCityResearch(city.id, city.name, categories, body?.customPrompt)
      savedToDatabase = true

      try {
        await db
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
    } else {
      // Fallback: Run research without saving to database
      console.warn('[City Research] SUPABASE_SERVICE_KEY not set, running fallback research without persistence')
      result = await runFallbackResearch(city.name, categories)
      warning = 'Research completed but not saved to database. Add SUPABASE_SERVICE_KEY to persist results.'
    }

    return NextResponse.json({
      cityId: city.id,
      cityName: city.name,
      summary: result.synthesis,
      elementCount: result.elements?.length || 0,
      elements: result.elements || [],
      timestamp: new Date().toISOString(),
      savedToDatabase,
      warning
    })
  } catch (error) {
    console.error('[City Research] Failed to run research:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run city research' },
      { status: 500 }
    )
  }
}
