import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
)

// Content type templates for different platforms
const contentTemplates = {
  'Twitter Post': {
    template: 'Write a Twitter post about {topic}. Keep it under 280 characters, engaging, and include relevant hashtags.',
    hashtagCount: 3
  },
  'Instagram Caption': {
    template: 'Write an Instagram caption about {topic}. Make it engaging, personal, and include a call to action. Add relevant hashtags at the end.',
    hashtagCount: 10
  },
  'Reddit Post': {
    template: 'Write a Reddit post title and description about {topic}. Make the title catchy and the description informative and discussion-worthy.',
    hashtagCount: 0
  },
  'Blog Post Intro': {
    template: 'Write a compelling blog post introduction about {topic}. Hook the reader and preview what they will learn.',
    hashtagCount: 5
  },
  'TikTok Script': {
    template: 'Write a short, engaging TikTok video script about {topic}. Include a hook, main content, and call to action.',
    hashtagCount: 5
  },
  'LinkedIn Update': {
    template: 'Write a professional LinkedIn update about {topic}. Focus on insights, value, and professional tone.',
    hashtagCount: 3
  },
  'Facebook Post': {
    template: 'Write a Facebook post about {topic}. Make it conversational, shareable, and encourage engagement.',
    hashtagCount: 5
  }
}

async function generateWithClaude(prompt: string) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${error}`)
  }

  const data = await response.json()
  return data.content[0].text
}

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g
  const matches = text.match(hashtagRegex) || []
  return matches.map(tag => tag.substring(1)) // Remove the # symbol
}

function separateCaptionAndHashtags(text: string) {
  // Find where hashtags start (usually at the end)
  const parts = text.split(/(?=#[\w]+(?:\s+#[\w]+)*\s*$)/)
  const caption = parts[0].trim()
  const hashtagText = parts[1] || ''
  const hashtags = extractHashtags(hashtagText)

  return { caption, hashtags }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      contentTypeId,
      contentTypeName,
      topic,
      assetUrl,
      assetType,
      additionalContext
    } = body

    if (!contentTypeId || !contentTypeName || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: contentTypeId, contentTypeName, and topic' },
        { status: 400 }
      )
    }

    // Get content type details from database if needed
    const { data: contentType, error: fetchError } = await supabase
      .from('content_types')
      .select('*')
      .eq('id', contentTypeId)
      .single()

    if (fetchError || !contentType) {
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      )
    }

    // Get the template for this content type
    const template = contentTemplates[contentTypeName as keyof typeof contentTemplates] || {
      template: 'Write a social media post about {topic}. Make it engaging and relevant.',
      hashtagCount: 5
    }

    // Build the prompt
    let prompt = template.template.replace('{topic}', topic)

    // Add context about the asset if provided
    if (assetUrl && assetType) {
      prompt += `\n\nContext: This post will accompany a ${assetType} that shows ${additionalContext || topic}.`
    }

    // Add hashtag instructions
    if (template.hashtagCount > 0) {
      prompt += `\n\nInclude exactly ${template.hashtagCount} relevant hashtags at the end.`
    }

    // Add platform-specific requirements from content type
    if (contentType.platform_specs) {
      const specs = contentType.platform_specs as any
      if (specs.max_length) {
        prompt += `\n\nMaximum length: ${specs.max_length} characters.`
      }
      if (specs.tone) {
        prompt += `\n\nTone: ${specs.tone}.`
      }
    }

    // Generate caption using Claude
    const generatedText = await generateWithClaude(prompt)

    // Separate caption and hashtags
    const { caption, hashtags } = separateCaptionAndHashtags(generatedText)

    // Store generation in database
    const { data: generation, error: insertError } = await supabase
      .from('generations')
      .insert({
        prompt_template: contentType.prompt_template,
        prompt_variables: { topic, assetUrl, assetType, additionalContext },
        model: 'claude-3-haiku',
        status: 'completed',
        output: generatedText,
        metadata: {
          content_type_id: contentTypeId,
          content_type_name: contentTypeName,
          caption,
          hashtags,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error storing generation:', insertError)
      // Continue even if storage fails
    }

    return NextResponse.json({
      success: true,
      caption,
      hashtags,
      fullText: generatedText,
      generationId: generation?.id
    })

  } catch (error) {
    console.error('Caption generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate caption' },
      { status: 500 }
    )
  }
}