import { NextRequest, NextResponse } from 'next/server';
import { generateProductShot, isImageGenerationConfigured } from '@/lib/image-generation';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin, hasServiceKey } from '@/lib/supabaseAdmin';
import { isImageDataUrl, uploadImageDataUrl } from '@/lib/storageAdmin';

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
  cityId?: string;
  assetType?: string;
  productType?: string;
  style?: string;
  model?: 'gpt-5-image' | 'gpt-5-image-mini' | 'gemini-flash' | 'gemini-pro';
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

    const productType = body.productType || 'premium streetwear hoodie';
    const style = body.style || 'urban luxury streetwear';
    const cityName = body.cityName;
    const cityId = body.cityId;

    // Generate with primary model (gpt-5-image-mini by default)
    const primaryModel = body.model || 'gemini-pro';

    console.log('[Product Shot] Generating with:', { shotType: body.shotType, productType, style, cityName, model: primaryModel });

    let result;
    try {
      result = await generateProductShot({
        productType,
        style,
        shotType: body.shotType,
        cityName,
        model: primaryModel
      });
    } catch (error) {
      if (!isImageGenerationConfigured()) {
        console.warn('[Product Shot] OpenRouter not configured, returning placeholder');
        return NextResponse.json({
          modelA: {
            url: `https://placehold.co/1024x1024/1a1a2e/ffffff?text=${encodeURIComponent(body.shotType)}`,
            model: 'placeholder',
            provider: 'placeholder',
            prompt: 'Development mode - no API key',
            generatedAt: new Date().toISOString()
          },
          shotType: body.shotType,
          note: 'Using placeholder - configure OPENROUTER_API_KEY for real generation'
        });
      }
      throw error;
    }

    const normalizeImageUrl = async (url: string) => {
      if (!url) return { url };
      if (isImageDataUrl(url)) {
        const stored = await uploadImageDataUrl({
          dataUrl: url,
          cityId: cityId || null,
          prefix: 'product-shot',
        });
        if (stored) {
          return { url: stored.publicUrl, storagePath: stored.path };
        }
      }
      return { url };
    };

    const normalizedPrimary = await normalizeImageUrl(result.imageUrl);

    const response: Record<string, unknown> = {
      modelA: {
        url: normalizedPrimary.url,
        model: result.model,
        provider: result.provider,
        prompt: result.prompt,
        generatedAt: result.generatedAt
      },
      shotType: body.shotType
    };

    // Generate with secondary model if requested
    let normalizedSecondary: { url: string; storagePath?: string } | null = null;
    if (body.generateBothModels) {
      try {
        const secondaryModel = primaryModel === 'gpt-5-image-mini' ? 'gemini-flash' : 'gpt-5-image-mini';
        const resultB = await generateProductShot({
          productType,
          style,
          shotType: body.shotType,
          cityName,
          model: secondaryModel
        });

        normalizedSecondary = await normalizeImageUrl(resultB.imageUrl);
        response.modelB = {
          url: normalizedSecondary.url,
          model: resultB.model,
          provider: resultB.provider,
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
    const supabase = hasServiceKey ? supabaseAdmin : getSupabaseClient();
    if (supabase && normalizedPrimary.url) {
      try {
        await supabase.from('generated_content').insert({
          city_id: cityId || null,
          content_type: 'image',
          title: `Product Shot - ${body.shotType}`,
          prompt: result.prompt,
          model: result.model,
          output_url: normalizedPrimary.url,
          output_metadata: {
            ...(body.assetType ? { asset_type: body.assetType } : {}),
            ...(normalizedPrimary.storagePath ? { storage_path: normalizedPrimary.storagePath } : {}),
          },
          status: 'completed'
        });
        if (normalizedSecondary && body.generateBothModels) {
          await supabase.from('generated_content').insert({
            city_id: cityId || null,
            content_type: 'image',
            title: `Product Shot - ${body.shotType} (Alt)`,
            prompt: response.modelB && typeof response.modelB === 'object' ? (response.modelB as any).prompt : result.prompt,
            model: response.modelB && typeof response.modelB === 'object' ? (response.modelB as any).model : result.model,
            output_url: normalizedSecondary.url,
            output_metadata: {
              ...(body.assetType ? { asset_type: body.assetType } : {}),
              ...(normalizedSecondary.storagePath ? { storage_path: normalizedSecondary.storagePath } : {}),
              model_variant: 'B',
            },
            status: 'completed'
          });
        }
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
      { id: 'gpt-5-image', name: 'GPT-5 Image', description: 'Best quality, recommended for finals' },
      { id: 'gpt-5-image-mini', name: 'GPT-5 Image Mini', description: 'Fast iteration, lower cost' },
      { id: 'gemini-flash', name: 'Gemini Flash', description: 'Google model, good for variations' },
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google pro model, highest quality' }
    ],
    configured: isImageGenerationConfigured()
  });
}
