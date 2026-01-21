import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'

// Perplexity research for city cultural intelligence
export async function POST(req: NextRequest) {
  try {
    const { city, researchType } = await req.json()

    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }

    // Build research prompt based on type
    let prompt = ''
    switch (researchType) {
      case 'slang':
        prompt = `Research current slang, local expressions, and linguistic patterns used in ${city}. Focus on terms used by young adults (18-35) in streetwear/fashion contexts. Include phrases, greetings, and regional vocabulary. Provide 10-15 examples with brief explanations.`
        break
      case 'landmarks':
        prompt = `Identify the most iconic and recognizable landmarks, locations, and neighborhoods in ${city} that would resonate with streetwear culture and urban fashion. Include both famous spots and local favorites. Provide 8-12 locations with brief descriptions of their cultural significance.`
        break
      case 'culture':
        prompt = `Research the streetwear and sneaker culture in ${city}. Include: popular sneaker styles, local streetwear brands, influential fashion figures, typical outfit styles, and cultural events/gatherings. Focus on authentic local preferences, not national trends.`
        break
      case 'sports':
        prompt = `Research the major sports teams and sports culture in ${city}. Include team colors, rivalries, fan traditions, and how sports influence local fashion/streetwear. Include both professional and college teams if relevant.`
        break
      case 'comprehensive':
      default:
        prompt = `Provide comprehensive cultural intelligence about ${city} for a streetwear brand targeting young adults (18-35). Include:
1. Local slang and expressions (5-8 examples)
2. Iconic landmarks and neighborhoods (5-8 locations)
3. Sports teams and fan culture
4. Streetwear scene and local preferences
5. Cultural events and gatherings
6. Things to avoid (sensitive topics, rival cities, etc.)
7. Local influencers or style icons

Format the response as structured JSON with these categories.`
    }

    // Use Perplexity through OpenRouter for real-time web research
    const response = await callOpenRouter({
      model: 'perplexity/sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a cultural research assistant specializing in urban fashion and streetwear culture. Provide accurate, current information based on real data. Be specific and authentic to each city\'s unique culture.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3, // Lower for more factual responses
    })

    // Parse the response
    const content = response.choices[0]?.message?.content || ''

    // Try to extract structured data if comprehensive
    let structuredData = null
    if (researchType === 'comprehensive' || !researchType) {
      try {
        // Try to find JSON in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          structuredData = JSON.parse(jsonMatch[0])
        }
      } catch {
        // If parsing fails, return raw content
      }
    }

    return NextResponse.json({
      city,
      researchType: researchType || 'comprehensive',
      content,
      structuredData,
      model: 'perplexity/sonar-pro',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Research API error:', error)
    return NextResponse.json({ error: 'Failed to perform research' }, { status: 500 })
  }
}
