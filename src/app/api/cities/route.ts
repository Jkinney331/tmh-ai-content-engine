import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasRealCredentials } from '@/lib/supabase'

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
          status: (newCity as any)?.status || 'draft',
          researchCategories: body.researchCategories,
          customPrompt: body.customPrompt,
          createdAt: (newCity as any)?.created_at || new Date().toISOString()
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