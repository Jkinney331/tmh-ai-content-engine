import { NextRequest, NextResponse } from 'next/server'
import { getOpenRouterConfig, TMH_COPY_MODELS } from '@/lib/openrouter'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

// Available functions for the chat agent
const CHAT_FUNCTIONS = [
  {
    name: 'get_city_info',
    description: 'Get detailed information about a city from the knowledge base including slang, landmarks, culture, and streetwear scene',
    parameters: {
      type: 'object',
      properties: {
        city_name: { type: 'string', description: 'The name of the city' }
      },
      required: ['city_name']
    }
  },
  {
    name: 'get_sneakers',
    description: 'Get approved sneakers from the knowledge base, optionally filtered by tier',
    parameters: {
      type: 'object',
      properties: {
        tier: { type: 'string', enum: ['grail', 'heat', 'banned'], description: 'Filter by sneaker tier' },
        city: { type: 'string', description: 'Filter by city relevance' }
      }
    }
  },
  {
    name: 'get_style_slots',
    description: 'Get configured style/outfit slots for content generation',
    parameters: {
      type: 'object',
      properties: {
        gender: { type: 'string', enum: ['male', 'female'], description: 'Filter by gender' }
      }
    }
  },
  {
    name: 'get_learnings',
    description: 'Get insights and learnings from the knowledge base',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['sneakers', 'models', 'styles', 'cities', 'prompts', 'general'], description: 'Filter by category' }
      }
    }
  },
  {
    name: 'get_competitors',
    description: 'Get competitor intelligence from the knowledge base',
    parameters: {
      type: 'object',
      properties: {
        tier: { type: 'string', enum: ['direct', 'aspirational', 'adjacent'], description: 'Filter by competitor tier' }
      }
    }
  },
  {
    name: 'trigger_research',
    description: 'Trigger city cultural research using Perplexity AI',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City to research' },
        research_type: { type: 'string', enum: ['slang', 'landmarks', 'culture', 'sports', 'comprehensive'], description: 'Type of research' }
      },
      required: ['city']
    }
  },
  {
    name: 'suggest_content',
    description: 'Get AI-powered content suggestions for a city or theme',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'Target city' },
        content_type: { type: 'string', enum: ['product_shot', 'lifestyle_shot', 'video_ad', 'social_post'], description: 'Type of content' },
        context: { type: 'string', description: 'Additional context or requirements' }
      }
    }
  },
  {
    name: 'queue_generation',
    description: 'Queue a content generation job',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'Target city' },
        content_type: { type: 'string', enum: ['product_shot', 'lifestyle_shot', 'video'], description: 'Type of content to generate' },
        prompt: { type: 'string', description: 'Generation prompt or description' }
      },
      required: ['content_type', 'prompt']
    }
  }
]

// Execute function calls
async function executeFunction(name: string, args: Record<string, unknown>): Promise<unknown> {
  const supabase = getSupabaseClient()

  switch (name) {
    case 'get_city_info': {
      if (!supabase) return { error: 'Database not configured', mock: true }
      const { data } = await supabase
        .from('cities')
        .select('*')
        .ilike('name', args.city_name as string)
        .single()
      return data || { error: 'City not found' }
    }

    case 'get_sneakers': {
      if (!supabase) return { error: 'Database not configured', mock: true }
      let query = supabase.from('sneakers').select('*').eq('is_active', true)
      if (args.tier) query = query.eq('tier', args.tier)
      if (args.city) query = query.contains('city_relevance', [args.city])
      const { data } = await query.limit(20)
      return data || []
    }

    case 'get_style_slots': {
      if (!supabase) return { error: 'Database not configured', mock: true }
      let query = supabase.from('style_slots').select('*').eq('is_active', true)
      if (args.gender) query = query.eq('gender', args.gender)
      const { data } = await query.order('slot_number')
      return data || []
    }

    case 'get_learnings': {
      if (!supabase) return { error: 'Database not configured', mock: true }
      let query = supabase.from('learnings').select('*')
      if (args.category) query = query.eq('category', args.category)
      const { data } = await query.order('confidence', { ascending: false }).limit(10)
      return data || []
    }

    case 'get_competitors': {
      if (!supabase) return { error: 'Database not configured', mock: true }
      let query = supabase.from('competitors').select('*')
      if (args.tier) query = query.eq('tier', args.tier)
      const { data } = await query.order('name')
      return data || []
    }

    case 'trigger_research': {
      // Call the research API
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/decision/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: args.city,
          researchType: args.research_type || 'comprehensive'
        })
      })
      return await response.json()
    }

    case 'suggest_content': {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/decision/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: args.city,
          contentType: args.content_type,
          context: args.context
        })
      })
      return await response.json()
    }

    case 'queue_generation': {
      if (!supabase) return { error: 'Database not configured', mock: true }

      const { data: cityData } = args.city ?
        await supabase.from('cities').select('id').ilike('name', args.city as string).single() :
        { data: null }

      const { data, error } = await supabase
        .from('generation_queue')
        .insert({
          city_id: cityData?.id || null,
          content_type: args.content_type,
          status: 'pending',
          priority: 1,
          model_pipeline: {
            prompt: args.prompt,
            source: 'chat_agent',
            queued_at: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (error) return { error: error.message }
      return { queued: true, job: data }
    }

    default:
      return { error: `Unknown function: ${name}` }
  }
}

const TMH_SYSTEM_PROMPT = `You are the AI assistant for TMH (That's My Hoodie), a premium streetwear brand that creates city-specific hoodies.

**Brand Context:**
- TMH sells premium hoodies ($150+) featuring embroidered designs specific to each city
- Aesthetic: Premium casual, sporty luxury (think Moncler meets Stüssy)
- Brand voice: Confident, authentic, slightly exclusive - "if you know, you know" energy
- Tagline plays on "Wear where you're from / Where you're from"

**Your Role:**
You help with:
1. Content generation - product shots, lifestyle images, social media copy, video scripts
2. City research - local slang, landmarks, sports teams, cultural elements
3. Design feedback - reviewing and improving designs
4. Strategy - content calendar, platform optimization, campaign ideas

**You have access to these functions to help users:**
- get_city_info: Look up city data from the knowledge base
- get_sneakers: Get approved sneakers (grail, heat, banned)
- get_style_slots: Get outfit configurations
- get_learnings: Get insights from feedback
- get_competitors: Get competitor intelligence
- trigger_research: Research city culture via Perplexity
- suggest_content: Get AI content suggestions
- queue_generation: Queue content for generation

**Guidelines:**
- Be concise but helpful
- When suggesting copy, maintain the TMH brand voice
- For city-specific content, incorporate local flavor authentically
- Use functions to fetch real data rather than making assumptions
- Suggest specific models/pipelines when asked about generation (Nano Banana for images, VEO 3 or Sora 2 for video)
- If you don't know something about a specific city, use trigger_research to find out

**Current Context:**
{context}

Respond helpfully to the user's message. Use available functions when relevant.`

interface ChatRequest {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
  context?: {
    page?: string
    cityId?: string
    cityName?: string
    contentType?: string
  }
  model?: 'claude' | 'gpt' | 'deepseek'
  enableFunctions?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, context, model = 'claude', enableFunctions = true } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    const config = getOpenRouterConfig()

    if (!config.apiKey || !config.apiKey.startsWith('sk-')) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    // Build context string
    const contextParts: string[] = []
    if (context?.page) {
      contextParts.push(`Current page: ${context.page}`)
    }
    if (context?.cityName) {
      contextParts.push(`Selected city: ${context.cityName}`)
    }
    if (context?.contentType) {
      contextParts.push(`Content type: ${context.contentType}`)
    }

    const contextString = contextParts.length > 0
      ? contextParts.join('\n')
      : 'No specific context'

    const systemPrompt = TMH_SYSTEM_PROMPT.replace('{context}', contextString)

    // Build messages array for API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    const modelConfig = TMH_COPY_MODELS[model]

    // Build request body
    const requestBody: Record<string, unknown> = {
      model: modelConfig.id,
      messages: apiMessages,
      max_tokens: 2000,
      temperature: 0.7,
      stream: false,
    }

    // Add function calling if enabled and using a supporting model
    if (enableFunctions && (model === 'claude' || model === 'gpt')) {
      requestBody.tools = CHAT_FUNCTIONS.map(f => ({
        type: 'function',
        function: f
      }))
      requestBody.tool_choice = 'auto'
    }

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenRouter API error:', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || `API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const choice = data.choices?.[0]

    // Handle function calls
    if (choice?.message?.tool_calls?.length > 0) {
      const functionResults: { name: string; result: unknown }[] = []

      for (const toolCall of choice.message.tool_calls) {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments || '{}')

        const result = await executeFunction(functionName, functionArgs)
        functionResults.push({ name: functionName, result })
      }

      // Continue conversation with function results
      const followUpMessages = [
        ...apiMessages,
        choice.message,
        {
          role: 'tool',
          content: JSON.stringify(functionResults),
          tool_call_id: choice.message.tool_calls[0].id
        }
      ]

      const followUpResponse = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({
          model: modelConfig.id,
          messages: followUpMessages,
          max_tokens: 2000,
          temperature: 0.7,
        }),
      })

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json()
        const finalMessage = followUpData.choices?.[0]?.message?.content || ''

        return NextResponse.json({
          message: finalMessage,
          model: model,
          usage: data.usage,
          functionsUsed: functionResults.map(f => f.name)
        })
      }
    }

    // Standard response without function calls
    const assistantMessage = choice?.message?.content || ''

    return NextResponse.json({
      message: assistantMessage,
      model: model,
      usage: data.usage,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
