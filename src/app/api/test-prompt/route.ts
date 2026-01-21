import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client (will use ANTHROPIC_API_KEY from environment)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, temperature = 0.7, max_tokens = 1024 } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return a simulated response if no API key
      return NextResponse.json({
        response: `[Simulated Claude Response]

This is a simulated response for testing purposes.
To get actual Claude responses, please configure your ANTHROPIC_API_KEY in the environment variables.

Your prompt was:
"${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}"

Temperature: ${temperature}
Max Tokens: ${max_tokens}

In production, this would generate a real response using Claude's AI capabilities.`
      });
    }

    try {
      // Make actual API call to Claude
      const completion = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: max_tokens,
        temperature: temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text content from the response
      const responseText = completion.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as any).text)
        .join('\n');

      return NextResponse.json({
        response: responseText || 'No response generated',
      });
    } catch (apiError: any) {
      console.error('Claude API error:', apiError);

      // If API call fails, return simulated response
      return NextResponse.json({
        response: `[Simulated Response - API Error]

Unable to connect to Claude API. This is a simulated response.

Your prompt: "${prompt.substring(0, 100)}..."

Error: ${apiError.message || 'Unknown API error'}

Please check your API key configuration and try again.`
      });
    }
  } catch (error) {
    console.error('Test prompt error:', error);
    return NextResponse.json(
      { error: 'Failed to process test prompt' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}