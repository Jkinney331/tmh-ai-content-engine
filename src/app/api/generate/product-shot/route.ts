import { NextRequest, NextResponse } from 'next/server';
import { generateProductShot, isImageGenerationConfigured } from '@/lib/image-generation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null;
  return createClient(supabaseUrl, supabaseKey);
}

interface ProductShotRequest {
  designId?: string;
  shotType: 'flat-front' | 'flat-back' | 'ghost' | 'hanging' | 'macro';
  shotName?: string;
  designUrl?: string;
  cityName?: string;
  productType?: string;
  style?: string;
  model?: 'flux-pro' | 'flux-max' | 'flux-klein' | 'gemini-flash';
  generateBothModels?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProductShotRequest = await request.json();

    if (!body.shotType) {
      return NextResponse.json(
        { error: 'Shot type is required' },
        { status: 400 }
      );
    }

    // Check if image generation is configured
    if (!isImageGenerationConfigured()) {
      // Return placeholder for development
      console.warn('[Product Shot] OpenRouter not configured, returning placeholder');
      return NextResponse.json({
        modelA: {
          url: `https://placehold.co/1024x1024/1a1a2e/ffffff?text=${encodeURIComponent(body.shotType)}`,
          model: 'placeholder',
          prompt: 'Development mode - no API key',
          generatedAt: new Date().toISOString()
        },
        shotType: body.shotType,
        note: 'Using placeholder - configure OPENROUTER_API_KEY for real generation'
      });
    }

    const productType = body.productType || 'premium streetwear hoodie';
    const style = body.style || 'urban luxury streetwear';
    const cityName = body.cityName;

    // Generate with primary model (flux-pro by default)
    const primaryModel = body.model || 'flux-pro';

    console.log('[Product Shot] Generating with:', { shotType: body.shotType, productType, style, cityName, model: primaryModel });

    const result = await generateProductShot({
      productType,
      style,
      shotType: body.shotType,
      cityName,
      model: primaryModel
    });

    const response: Record<string, unknown> = {
      modelA: {
        url: result.imageUrl,
        model: result.model,
        prompt: result.prompt,
        generatedAt: result.generatedAt
      },
      shotType: body.shotType
    };

    // Generate with secondary model if requested
    if (body.generateBothModels) {
      try {
        const secondaryModel = primaryModel === 'flux-pro' ? 'gemini-flash' : 'flux-pro';
        const resultB = await generateProductShot({
          productType,
          style,
          shotType: body.shotType,
          cityName,
          model: secondaryModel
        });

        response.modelB = {
          url: resultB.imageUrl,
          model: resultB.model,
          prompt: resultB.prompt,
          generatedAt: resultB.generatedAt
        };
      } catch (error) {
        console.error('[Product Shot] Secondary model failed:', error);
        response.modelB = {
          error: 'Secondary model generation failed',
          model: 'flux-klein'
        };
      }
    }

    // Save to database if available
    const supabase = getSupabaseClient();
    if (supabase && result.imageUrl) {
      try {
        await supabase.from('generated_content').insert({
          content_type: 'image',
          title: `Product Shot - ${body.shotType}`,
          prompt: result.prompt,
          model: result.model,
          output_url: result.imageUrl,
          status: 'completed'
        });
      } catch (dbError) {
        console.warn('[Product Shot] Failed to save to database:', dbError);
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Product Shot] Generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate product shot',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get available shot types and models
export async function GET() {
  return NextResponse.json({
    shotTypes: [
      { id: 'flat-front', name: 'Flat Front', description: 'Top-down front view on white background' },
      { id: 'flat-back', name: 'Flat Back', description: 'Top-down back view showing details' },
      { id: 'ghost', name: 'Ghost Mannequin', description: '3D form with invisible mannequin' },
      { id: 'hanging', name: 'Hanger Shot', description: 'Suspended on hanger, front view' },
      { id: 'macro', name: 'Macro Detail', description: 'Close-up of fabric and stitching' }
    ],
    models: [
      { id: 'flux-pro', name: 'Flux Pro', description: 'Best quality, recommended for finals' },
      { id: 'flux-klein', name: 'Flux Schnell', description: 'Fast iteration, lower cost' },
      { id: 'gemini-flash', name: 'Gemini Flash', description: 'Google model, good for variations' }
    ],
    configured: isImageGenerationConfigured()
  });
}
