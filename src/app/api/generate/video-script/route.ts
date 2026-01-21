import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface VideoScriptRequest {
  format: {
    id: string;
    name: string;
    duration: string;
    description: string;
    aspectRatio: string;
    platform: string;
  };
  city: {
    id: string;
    name: string;
    nickname?: string;
    landmarks?: string[];
  };
  assets: Array<{
    id: string;
    type: 'product' | 'lifestyle';
    name: string;
    description?: string;
  }>;
}

export interface VideoScriptResponse {
  mainScript: {
    hook: string;
    body: string;
    cta: string;
    fullScript: string;
    duration: string;
    notes: string;
  };
  hookVariations: Array<{
    id: string;
    hook: string;
    style: string;
    emotion: string;
    targetAudience: string;
    effectiveness: string;
  }>;
  metadata: {
    cityName: string;
    format: string;
    assetCount: number;
    generatedAt: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: VideoScriptRequest = await request.json();

    if (!body.format || !body.city || !body.assets || body.assets.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: format, city, and assets' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      // Return mock data if no API key is configured
      return NextResponse.json({
        mainScript: {
          hook: `Rep ${body.city.name} with authentic style!`,
          body: `Show your ${body.city.name} pride with our exclusive merchandise collection. From premium streetwear to unique accessories, every piece tells your city's story.`,
          cta: `Shop the ${body.city.name} collection now - limited drops available!`,
          fullScript: `[OPENING SHOT: Dynamic city view]\n"Rep ${body.city.name} with authentic style!"\n\n[PRODUCT SHOWCASE]\n"Show your ${body.city.name} pride with our exclusive merchandise collection."\n\n[LIFESTYLE MONTAGE]\n"From premium streetwear to unique accessories, every piece tells your city's story."\n\n[CTA WITH LOGO]\n"Shop the ${body.city.name} collection now - limited drops available!"`,
          duration: body.format.duration,
          notes: `Open with iconic ${body.city.name} visuals. Quick product cuts synced to beat. End with strong CTA and website URL. Use energetic music that matches ${body.city.name}'s vibe.`
        },
        hookVariations: [
          {
            id: 'hook1',
            hook: `"You don't just live in ${body.city.name}, you ARE ${body.city.name}!"`,
            style: 'Bold Statement',
            emotion: 'Pride',
            targetAudience: 'Local Residents',
            effectiveness: 'Creates instant connection with locals who strongly identify with their city identity'
          },
          {
            id: 'hook2',
            hook: `"What makes ${body.city.name} legendary? The people who rep it every day."`,
            style: 'Rhetorical Question',
            emotion: 'Community',
            targetAudience: 'Community-minded locals',
            effectiveness: 'Builds intrigue while celebrating the community aspect of city pride'
          },
          {
            id: 'hook3',
            hook: `"From ${body.city.name}, with love. Wear your story."`,
            style: 'Emotional Story',
            emotion: 'Nostalgia',
            targetAudience: 'Diaspora and Alumni',
            effectiveness: 'Resonates with those who have moved away but maintain strong city connections'
          }
        ],
        metadata: {
          cityName: body.city.name,
          format: body.format.name,
          assetCount: body.assets.length,
          generatedAt: new Date().toISOString()
        }
      });
    }

    // Build asset descriptions
    const assetDescriptions = body.assets.map(a =>
      `${a.type === 'product' ? 'Product' : 'Lifestyle'}: ${a.name}`
    ).join(', ');

    // Create the prompt for Claude
    const prompt = `You are a creative video script writer specializing in local merchandise and city pride content.

Create a video script for ${body.city.name} merchandise with the following specifications:

FORMAT: ${body.format.name}
DURATION: ${body.format.duration}
PLATFORM: ${body.format.platform}
ASPECT RATIO: ${body.format.aspectRatio}
DESCRIPTION: ${body.format.description}

AVAILABLE ASSETS:
${assetDescriptions}

CITY DETAILS:
- Name: ${body.city.name}
${body.city.nickname ? `- Nickname: ${body.city.nickname}` : ''}
${body.city.landmarks ? `- Key Landmarks: ${body.city.landmarks.join(', ')}` : ''}

Please provide:

1. MAIN SCRIPT with:
   - Hook (first 2-3 seconds to grab attention)
   - Body (main message and product showcase)
   - CTA (clear call to action)
   - Full integrated script
   - Timing notes
   - Director's notes

2. THREE HOOK VARIATIONS, each with different approaches:
   - Different emotional appeals (pride, humor, nostalgia, excitement, etc.)
   - Different target audiences (locals, tourists, alumni, sports fans, etc.)
   - Different styles (question, statement, challenge, story, etc.)

Format your response as a JSON object with this structure:
{
  "mainScript": {
    "hook": "Opening line/visual that grabs attention",
    "body": "Main content showcasing products and city connection",
    "cta": "Clear call to action",
    "fullScript": "Complete script with all sections integrated",
    "duration": "Specific timing breakdown",
    "notes": "Director's notes and visual suggestions"
  },
  "hookVariations": [
    {
      "id": "hook1",
      "hook": "Alternative hook text",
      "style": "Question/Statement/Story/etc",
      "emotion": "Pride/Humor/Nostalgia/etc",
      "targetAudience": "Locals/Tourists/etc",
      "effectiveness": "Why this hook works"
    }
  ]
}

Make the script authentic to ${body.city.name}'s culture and identity. Use local slang, references, and inside jokes where appropriate.`;

    // Call Claude API
    const completion = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse the response
    let scriptData;
    try {
      const responseText = completion.content[0].type === 'text'
        ? completion.content[0].text
        : '';

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scriptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: Generate a structured response if parsing fails
      scriptData = {
        mainScript: {
          hook: `Rep ${body.city.name} with style!`,
          body: `Show your city pride with our exclusive ${body.city.name} merchandise collection. From streetwear to accessories, we've got everything you need to represent your city.`,
          cta: `Shop the collection now and show your ${body.city.name} pride!`,
          fullScript: `[OPENING SHOT: City skyline]\n"Rep ${body.city.name} with style!"\n\n[PRODUCT MONTAGE]\n"Show your city pride with our exclusive ${body.city.name} merchandise collection."\n\n[LIFESTYLE SHOTS]\n"From streetwear to accessories, we've got everything you need to represent your city."\n\n[CTA WITH LOGO]\n"Shop the collection now and show your ${body.city.name} pride!"`,
          duration: body.format.duration,
          notes: `Open with dynamic city shots, transition to product showcase, end with strong CTA. Use upbeat music that matches ${body.city.name}'s vibe.`
        },
        hookVariations: [
          {
            id: 'hook1',
            hook: `"You're not just from ${body.city.name}, you ARE ${body.city.name}!"`,
            style: 'Bold Statement',
            emotion: 'Pride',
            targetAudience: 'Local Residents',
            effectiveness: 'Creates strong emotional connection with locals who identify deeply with their city'
          },
          {
            id: 'hook2',
            hook: `"What makes ${body.city.name} legendary? It's not the skyline, it's the people."`,
            style: 'Rhetorical Question',
            emotion: 'Community',
            targetAudience: 'Community-minded locals',
            effectiveness: 'Builds intrigue and celebrates the human element of city pride'
          },
          {
            id: 'hook3',
            hook: `"From ${body.city.name}, with love. Wear your story."`,
            style: 'Emotional Story',
            emotion: 'Nostalgia',
            targetAudience: 'Diaspora and Alumni',
            effectiveness: 'Appeals to those who have moved away but still feel connected to the city'
          }
        ]
      };
    }

    // Prepare the response
    const response: VideoScriptResponse = {
      mainScript: scriptData.mainScript,
      hookVariations: scriptData.hookVariations || [],
      metadata: {
        cityName: body.city.name,
        format: body.format.name,
        assetCount: body.assets.length,
        generatedAt: new Date().toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating video script:', error);

    // Check if it's an Anthropic API error
    if (error instanceof Error && error.message.includes('API')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate video script' },
      { status: 500 }
    );
  }
}