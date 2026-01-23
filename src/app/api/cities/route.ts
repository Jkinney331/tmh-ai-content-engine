import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasRealCredentials } from '@/lib/supabase'
import { callOpenRouter } from '@/lib/openrouter'

interface ResearchCategories {
  slang: boolean
  landmarks: boolean
  sports: boolean
  culture: boolean
  visualIdentity: boolean
  areaCodes: boolean
}

interface CreateCityRequest {
  name: string
  researchCategories: ResearchCategories
  customPrompt?: string
}

interface City {
  id: string
  name: string
  status: 'draft' | 'active' | 'archived' | 'researching' | 'ready' | 'error'
  researchCategories: ResearchCategories
  customPrompt?: string
  createdAt: string
}

// Mock database for testing
const mockCities: City[] = []

/**
 * Helper to update city with error status
 */
async function updateCityError(cityId: string, errorMessage: string) {
  if (!hasRealCredentials) return

  try {
    await (supabase as any).from('cities').update({
      status: 'error',
      error_message: errorMessage,
      updated_at: new Date().toISOString()
    }).eq('id', cityId)
  } catch (e) {
    // If error_message column doesn't exist, try without it
    console.warn('[City Research] error_message column may not exist, updating status only')
    await (supabase as any).from('cities').update({
      status: 'draft',
      updated_at: new Date().toISOString()
    }).eq('id', cityId)
  }
}

/**
 * Perform Perplexity research for a city and update its data
 * This runs asynchronously after the city is created
 */
async function performCityResearch(cityId: string, cityName: string, categories: ResearchCategories, customPrompt?: string) {
  try {
    console.log(`[City Research] Starting research for ${cityName}...`)

    // Check if OpenRouter API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.error(`[City Research] OPENROUTER_API_KEY is not set!`)
      await updateCityError(cityId, 'API key not configured. Please set OPENROUTER_API_KEY in environment variables.')
      return null
    }

    if (!apiKey.startsWith('sk-')) {
      console.error(`[City Research] OPENROUTER_API_KEY has invalid format`)
      await updateCityError(cityId, 'API key has invalid format. Should start with sk-')
      return null
    }

    // Update status to researching
    if (hasRealCredentials) {
      await (supabase as any).from('cities').update({
        status: 'researching',
        error_message: null // Clear any previous error
      }).eq('id', cityId)
    }

    // Build comprehensive research prompt based on selected categories
    const categoryPrompts: string[] = []
    if (categories.slang) categoryPrompts.push('Local slang, expressions, and linguistic patterns (10-15 examples)')
    if (categories.landmarks) categoryPrompts.push('Iconic landmarks, neighborhoods, and locations for streetwear photography (8-12 locations)')
    if (categories.sports) categoryPrompts.push('Major sports teams, colors, rivalries, and how they influence local fashion')
    if (categories.culture) categoryPrompts.push('Streetwear and sneaker culture, local brands, influential figures, and typical styles')
    if (categories.visualIdentity) categoryPrompts.push('Visual identity elements: colors, symbols, architecture, murals, and aesthetic')
    if (categories.areaCodes) categoryPrompts.push('Area codes and their cultural significance')

    const researchPrompt = `Provide comprehensive cultural intelligence about ${cityName} for a streetwear brand targeting young adults (18-35). Research the following:

${categoryPrompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}
${customPrompt ? `\nAdditional research focus: ${customPrompt}` : ''}

Important: Also include things to AVOID (sensitive topics, rival cities, cultural missteps).

Format your response as valid JSON with these fields:
{
  "slang": [{"term": "...", "meaning": "...", "usage": "..."}],
  "landmarks": [{"name": "...", "description": "...", "significance": "..."}],
  "sports": {"teams": [...], "colors": [...], "rivalries": [...], "fashionInfluence": "..."},
  "culture": {"localBrands": [...], "influencers": [...], "styles": [...], "events": [...]},
  "visualIdentity": {"colors": [...], "symbols": [...], "aesthetic": "..."},
  "areaCodes": [{"code": "...", "area": "...", "significance": "..."}],
  "avoid": [{"topic": "...", "reason": "..."}]
}`

    console.log(`[City Research] Calling OpenRouter for ${cityName}...`)

    // Call Perplexity via OpenRouter for real-time web research
    let response
    try {
      response = await callOpenRouter({
        model: 'perplexity/sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a cultural research assistant specializing in urban fashion and streetwear culture. Provide accurate, current information based on real data. Be specific and authentic to each city\'s unique culture. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: researchPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      })
    } catch (apiError: any) {
      console.error(`[City Research] OpenRouter API call failed for ${cityName}:`, apiError.message)
      await updateCityError(cityId, `Research API call failed: ${apiError.message}`)
      return null
    }

    const content = response.choices[0]?.message?.content || ''
    console.log(`[City Research] Got response for ${cityName}, length: ${content.length}`)

    // Parse the research results
    let researchData = null
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        researchData = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.warn(`[City Research] Failed to parse JSON for ${cityName}:`, parseError)
      researchData = { rawContent: content }
    }

    // Update the city with research results and insert city_elements
    if (hasRealCredentials) {
      const updateData: Record<string, unknown> = {
        status: 'active', // Use 'active' which is guaranteed to be valid
        updated_at: new Date().toISOString()
      }

      const slugify = (value: string) =>
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, 64);

      const elementsToInsert: Array<{
        city_id: string;
        element_type: 'slang' | 'landmark' | 'sport' | 'cultural';
        element_key: string;
        element_value: Record<string, unknown>;
        status: 'pending';
        notes?: string;
        created_at: string;
        updated_at: string;
      }> = [];

      // Map research results to city fields
      if (researchData) {
        if (researchData.slang) updateData.slang = researchData.slang
        if (researchData.landmarks) updateData.landmarks = researchData.landmarks
        if (researchData.sports) updateData.sports_teams = researchData.sports
        if (researchData.culture) updateData.culture = researchData.culture
        if (researchData.visualIdentity) {
          updateData.visual_identity = researchData.visualIdentity
        }
        if (researchData.areaCodes) {
          updateData.area_codes = researchData.areaCodes.map((ac: { code: string }) => ac.code)
        }
        if (researchData.avoid) updateData.avoid = researchData.avoid
        updateData.research_raw = content
        updateData.research_completed_at = new Date().toISOString()

        const now = new Date().toISOString();

        if (Array.isArray(researchData.slang)) {
          researchData.slang.forEach((item: { term?: string; meaning?: string; usage?: string }) => {
            const key = slugify(item.term || 'slang');
            if (!key) return;
            elementsToInsert.push({
              city_id: cityId,
              element_type: 'slang',
              element_key: key,
              element_value: item,
              status: 'pending',
              notes: 'Auto-generated from research',
              created_at: now,
              updated_at: now
            });
          });
        }

        if (Array.isArray(researchData.landmarks)) {
          researchData.landmarks.forEach((item: { name?: string; description?: string; significance?: string }) => {
            const key = slugify(item.name || 'landmark');
            if (!key) return;
            elementsToInsert.push({
              city_id: cityId,
              element_type: 'landmark',
              element_key: key,
              element_value: item,
              status: 'pending',
              notes: 'Auto-generated from research',
              created_at: now,
              updated_at: now
            });
          });
        }

        if (researchData.sports?.teams && Array.isArray(researchData.sports.teams)) {
          researchData.sports.teams.forEach((team: { name?: string; team?: string } | string) => {
            const teamName = typeof team === 'string' ? team : (team.name || team.team || 'team');
            const key = slugify(teamName);
            if (!key) return;
            elementsToInsert.push({
              city_id: cityId,
              element_type: 'sport',
              element_key: key,
              element_value: typeof team === 'string' ? { team: teamName } : team,
              status: 'pending',
              notes: 'Auto-generated from research',
              created_at: now,
              updated_at: now
            });
          });
        }

        if (researchData.culture) {
          const culturalSources: Array<{ type: string; values: string[] }> = [];
          if (Array.isArray(researchData.culture.localBrands)) {
            culturalSources.push({ type: 'brand', values: researchData.culture.localBrands });
          }
          if (Array.isArray(researchData.culture.influencers)) {
            culturalSources.push({ type: 'influencer', values: researchData.culture.influencers });
          }
          if (Array.isArray(researchData.culture.styles)) {
            culturalSources.push({ type: 'style', values: researchData.culture.styles });
          }
          if (Array.isArray(researchData.culture.events)) {
            culturalSources.push({ type: 'event', values: researchData.culture.events });
          }
          culturalSources.forEach(({ type, values }) => {
            values.forEach((value) => {
              const key = slugify(`${type}_${value}`);
              if (!key) return;
              elementsToInsert.push({
                city_id: cityId,
                element_type: 'cultural',
                element_key: key,
                element_value: { type, name: value },
                status: 'pending',
                notes: 'Auto-generated from research',
                created_at: now,
                updated_at: now
              });
            });
          });
        }

        if (Array.isArray(researchData.areaCodes)) {
          researchData.areaCodes.forEach((item: { code?: string; area?: string; significance?: string }) => {
            const key = slugify(item.code || 'area_code');
            if (!key) return;
            elementsToInsert.push({
              city_id: cityId,
              element_type: 'cultural',
              element_key: key,
              element_value: { type: 'area_code', ...item },
              status: 'pending',
              notes: 'Auto-generated from research',
              created_at: now,
              updated_at: now
            });
          });
        }
      }

      if (elementsToInsert.length > 0) {
        const { error: insertError } = await (supabase as any)
          .from('city_elements')
          .upsert(elementsToInsert as any, {
            onConflict: 'city_id,element_type,element_key'
          });

        if (insertError) {
          console.error(`[City Research] Failed to upsert city elements for ${cityName}:`, insertError)
        }
      }

      const { error: updateError } = await (supabase as any)
        .from('cities')
        .update(updateData)
        .eq('id', cityId)

      if (updateError) {
        console.error(`[City Research] Failed to update ${cityName}:`, updateError)
        await (supabase as any).from('cities').update({
          status: 'draft',
          user_notes: `Research completed but failed to save: ${updateError.message}. Raw: ${content.slice(0, 500)}`
        }).eq('id', cityId)
      } else {
        console.log(`[City Research] Successfully updated ${cityName} with research data`)
      }
    }

    return researchData
  } catch (error: any) {
    console.error(`[City Research] Error researching ${cityName}:`, error)
    await updateCityError(cityId, `Research failed: ${error.message || 'Unknown error'}`)
    // Don't throw - let the city be created with error status
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCityRequest = await request.json()

    // Validation: City name is required
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'City name is required' },
        { status: 400 }
      )
    }

    // Validation: City name must be at least 2 characters
    if (body.name.trim().length < 2) {
      return NextResponse.json(
        { error: 'City name must be at least 2 characters' },
        { status: 400 }
      )
    }

    const cityName = body.name.trim()

    // Check if city already exists
    const existingCity = mockCities.find(c => c.name.toLowerCase() === cityName.toLowerCase())
    if (existingCity) {
      return NextResponse.json(
        { error: 'City already exists' },
        { status: 409 }
      )
    }

    // If we have real Supabase credentials, use Supabase
    if (hasRealCredentials) {
      try {

        // Check for existing city in Supabase
        const { data: existingCity } = await supabase
          .from('cities')
          .select('id')
          .eq('name', cityName)
          .single()

        if (existingCity) {
          return NextResponse.json(
            { error: 'City already exists' },
            { status: 409 }
          )
        }

        // Insert into Supabase
        const cityData = {
          name: cityName,
          status: 'draft' as const,
          nicknames: [],
          area_codes: [],
          visual_identity: {
            research_categories: body.researchCategories,
            custom_prompt: body.customPrompt
          },
          avoid: [],
          user_notes: body.customPrompt || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: newCity, error: insertError } = await supabase
          .from('cities')
          .insert(cityData as any)
          .select()
          .single()

        if (insertError) {
          console.error('Supabase insert error:', insertError)
          return NextResponse.json(
            { error: insertError.message },
            { status: 500 }
          )
        }

        const responseCity = {
          id: (newCity as any)?.id || '',
          name: (newCity as any)?.name || cityName,
          status: 'researching', // Will be researching while Perplexity runs
          researchCategories: body.researchCategories,
          customPrompt: body.customPrompt,
          createdAt: (newCity as any)?.created_at || new Date().toISOString()
        }

        // Trigger research in the background (don't await)
        const cityId = (newCity as any)?.id
        if (cityId) {
          performCityResearch(cityId, cityName, body.researchCategories, body.customPrompt)
            .then(() => console.log(`[City Research] Completed for ${cityName}`))
            .catch(err => console.error(`[City Research] Failed for ${cityName}:`, err))
        }

        return NextResponse.json(responseCity, { status: 201 })

      } catch (error) {
        console.error('Supabase error:', error)
        // Fall back to mock implementation
      }
    }

    // Mock implementation for testing without Supabase
    const newCity: City = {
      id: `city-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: cityName,
      status: 'researching',
      researchCategories: body.researchCategories || {
        slang: false,
        landmarks: false,
        sports: false,
        culture: false,
        visualIdentity: false,
        areaCodes: false
      },
      customPrompt: body.customPrompt,
      createdAt: new Date().toISOString()
    }

    mockCities.push(newCity)

    // Return city object with id
    return NextResponse.json(newCity, { status: 201 })

  } catch (error) {
    console.error('Error creating city:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create city'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // If we have real Supabase credentials, use Supabase
    if (hasRealCredentials) {
      try {
        const { data: cities, error } = await supabase
          .from('cities')
          .select('*')
          .order('name')

        if (error) {
          console.error('Supabase query error:', error)
          return NextResponse.json(
            { error: error.message },
            { status: 500 }
          )
        }

        return NextResponse.json(cities || [])
      } catch (error) {
        // Fall back to mock implementation
      }
    }

    // Mock implementation
    return NextResponse.json(mockCities)

  } catch (error) {
    console.error('Error fetching cities:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cities'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}