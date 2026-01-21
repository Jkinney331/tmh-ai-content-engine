import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

// AI-powered content suggestion engine
export async function POST(req: NextRequest) {
  try {
    const { city, contentType, context } = await req.json()

    // Fetch relevant knowledge base data
    const supabase = getSupabaseClient()
    let knowledgeContext = ''

    if (supabase) {
      // Fetch city data
      if (city) {
        const { data: cityData } = await supabase
          .from('cities')
          .select('*')
          .eq('name', city)
          .single()

        if (cityData) {
          knowledgeContext += `\nCity Profile for ${city}:\n`
          knowledgeContext += `- Slang: ${JSON.stringify(cityData.slang || [])}\n`
          knowledgeContext += `- Landmarks: ${JSON.stringify(cityData.landmarks || [])}\n`
          knowledgeContext += `- Streetwear Scene: ${cityData.streetwear_scene || 'Unknown'}\n`
          knowledgeContext += `- Cultural Notes: ${cityData.cultural_notes || 'None'}\n`
        }
      }

      // Fetch sneakers
      const { data: sneakers } = await supabase
        .from('sneakers')
        .select('name, tier, brand, city_relevance')
        .eq('is_active', true)
        .limit(20)

      if (sneakers?.length) {
        knowledgeContext += `\nApproved Sneakers:\n`
        sneakers.forEach(s => {
          knowledgeContext += `- ${s.name} (${s.tier}) ${s.city_relevance?.includes(city) ? '[RELEVANT]' : ''}\n`
        })
      }

      // Fetch style slots
      const { data: styles } = await supabase
        .from('style_slots')
        .select('*')
        .eq('is_active', true)

      if (styles?.length) {
        knowledgeContext += `\nStyle Slots:\n`
        styles.forEach(s => {
          knowledgeContext += `- Slot ${s.slot_number} (${s.gender}): ${s.name} - ${s.top}, ${s.bottom}, ${s.sneaker_tier} sneakers\n`
        })
      }

      // Fetch relevant learnings
      const { data: learnings } = await supabase
        .from('learnings')
        .select('insight, category, confidence')
        .gte('confidence', 0.7)
        .limit(10)

      if (learnings?.length) {
        knowledgeContext += `\nRelevant Learnings:\n`
        learnings.forEach(l => {
          knowledgeContext += `- [${l.category}] ${l.insight} (${Math.round(l.confidence * 100)}% confidence)\n`
        })
      }
    }

    // Build the suggestion prompt
    const systemPrompt = `You are the TMH (The Marathon Hustle) AI content strategist. Your job is to suggest compelling, culturally-authentic content ideas for a streetwear brand.

Knowledge Base:
${knowledgeContext || 'No knowledge base connected - using general streetwear expertise.'}

Guidelines:
- Always prioritize cultural authenticity over generic trends
- Match sneaker choices to city preferences when possible
- Consider model demographics that reflect the city's population
- Avoid generic or potentially appropriative content
- Focus on aspirational but achievable streetwear looks`

    const userPrompt = `Generate content suggestions for:
${city ? `City: ${city}` : 'General (no specific city)'}
${contentType ? `Content Type: ${contentType}` : 'Any content type'}
${context ? `Additional Context: ${context}` : ''}

Provide 3-5 specific content ideas with:
1. Brief description
2. Recommended sneaker(s)
3. Style slot recommendation
4. Model demographic suggestion
5. Key visual elements
6. Caption angle

Format as JSON array.`

    const response = await callOpenRouter({
      model: 'anthropic/claude-sonnet-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content || ''

    // Try to parse JSON from response
    let suggestions = []
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0])
      }
    } catch {
      // Return raw content if parsing fails
    }

    return NextResponse.json({
      city,
      contentType,
      suggestions,
      rawContent: content,
      knowledgeBaseUsed: !!supabase,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Suggestion API error:', error)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
