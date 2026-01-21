import { NextRequest, NextResponse } from 'next/server';
import { generateLifestyleShot, isImageGenerationConfigured } from '@/lib/image-generation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null;
  return createClient(supabaseUrl, supabaseKey);
}

interface LifestyleVariation {
  id: string;
  name: string;
  model?: string;
  location?: string;
  description: string;
  prompt?: string;
}

interface GenerationRequest {
  cityId?: string;
  cityName: string;
  variation?: LifestyleVariation;
  description?: string;
  modelDescription?: string;
  sneaker?: string;
  location?: string;
  model?: 'gpt-5-image' | 'gpt-5-image-mini' | 'gemini-flash' | 'gemini-pro';
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  generateBothModels?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const { cityId, cityName, variation, generateBothModels } = body;

    if (!cityName) {
      return NextResponse.json(
        { error: 'City name is required' },
        { status: 400 }
      );
    }

    // Check if image generation is configured
    if (!isImageGenerationConfigured()) {
      console.warn('[Lifestyle Shot] OpenRouter not configured, returning placeholder');
      return NextResponse.json({
        modelA: {
          imageUrl: `https://placehold.co/800x600/4F46E5/ffffff?text=${encodeURIComponent(cityName + ' Lifestyle')}`,
          model: 'placeholder',
          prompt: 'Development mode - no API key',
          generatedAt: new Date().toISOString()
        },
        metadata: {
          cityId,
          cityName,
          variation: variation?.id,
          variationName: variation?.name,
          generatedAt: new Date().toISOString()
        },
        note: 'Using placeholder - configure OPENROUTER_API_KEY for real generation'
      });
    }

    // Build description from variation or direct input
    const description = variation?.description || body.description || `Urban lifestyle scene in ${cityName}`;
    const modelDescription = variation?.model || body.modelDescription;
    const sneaker = body.sneaker;
    const location = variation?.location || body.location;
    const primaryModel = body.model || 'gpt-5-image-mini';
    const aspectRatio = body.aspectRatio || '4:3';

    console.log('[Lifestyle Shot] Generating with:', {
      cityName,
      description: description.slice(0, 50),
      model: primaryModel,
      aspectRatio
    });

    // Generate with primary model
    const result = await generateLifestyleShot({
      description,
      cityName,
      modelDescription,
      sneaker,
      location,
      model: primaryModel,
      aspectRatio
    });

    const responseData: Record<string, unknown> = {
      modelA: {
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        model: result.model,
        generatedAt: result.generatedAt
      }
    };

    // Generate with secondary model if requested
    if (generateBothModels) {
      try {
        const secondaryModel = primaryModel === 'gpt-5-image-mini' ? 'gemini-flash' : 'gpt-5-image-mini';
        const resultB = await generateLifestyleShot({
          description,
          cityName,
          modelDescription,
          sneaker,
          location,
          model: secondaryModel,
          aspectRatio
        });

        responseData.modelB = {
          imageUrl: resultB.imageUrl,
          prompt: resultB.prompt,
          model: resultB.model,
          generatedAt: resultB.generatedAt
        };
      } catch (error) {
        console.error('[Lifestyle Shot] Secondary model failed:', error);
        responseData.modelB = {
          error: 'Failed to generate with secondary model',
          prompt: description
        };
      }
    }

    // Add metadata
    responseData.metadata = {
      cityId,
      cityName,
      variation: variation?.id,
      variationName: variation?.name,
      generatedAt: new Date().toISOString()
    };

    // Save to database if available
    const supabase = getSupabaseClient();
    if (supabase && result.imageUrl) {
      try {
        await supabase.from('generated_content').insert({
          city_id: cityId || null,
          content_type: 'image',
          title: `Lifestyle Shot - ${cityName}${variation?.name ? ` - ${variation.name}` : ''}`,
          prompt: result.prompt,
          model: result.model,
          output_url: result.imageUrl,
          status: 'completed'
        });
      } catch (dbError) {
        console.warn('[Lifestyle Shot] Failed to save to database:', dbError);
      }
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('[Lifestyle Shot] Generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate lifestyle shots',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get available options
export async function GET() {
  return NextResponse.json({
    models: [
      { id: 'gpt-5-image', name: 'GPT-5 Image', description: 'Best quality, recommended for finals' },
      { id: 'gpt-5-image-mini', name: 'GPT-5 Image Mini', description: 'Fast iteration, lower cost' },
      { id: 'gemini-flash', name: 'Gemini Flash', description: 'Google model, supports aspect ratios' },
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google pro model, highest quality' }
    ],
    aspectRatios: [
      { id: '1:1', name: 'Square', description: 'Instagram feed' },
      { id: '4:3', name: 'Landscape', description: 'Standard photo' },
      { id: '3:4', name: 'Portrait', description: 'Vertical photo' },
      { id: '16:9', name: 'Wide', description: 'YouTube thumbnail' },
      { id: '9:16', name: 'Vertical', description: 'Instagram Stories, TikTok' }
    ],
    presetVariations: [
      { id: 'street-casual', name: 'Street Casual', description: 'Model walking through urban neighborhood' },
      { id: 'rooftop-golden', name: 'Rooftop Golden Hour', description: 'Model on rooftop with city skyline at sunset' },
      { id: 'sneaker-focus', name: 'Sneaker Focus', description: 'Close-up lifestyle shot highlighting sneakers' },
      { id: 'coffee-shop', name: 'Coffee Shop', description: 'Model in trendy local coffee shop' },
      { id: 'mural-backdrop', name: 'Mural Backdrop', description: 'Model in front of iconic street art' }
    ],
    configured: isImageGenerationConfigured()
  });
}
