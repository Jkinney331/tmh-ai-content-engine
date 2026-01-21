/**
 * OpenRouter Image Generation Library
 *
 * Uses the correct chat/completions endpoint with modalities: ['image', 'text']
 * Reference: OpenRouter supports image generation through models with "image" in output_modalities
 */

export interface ImageGenerationOptions {
  prompt: string;
  model?: 'flux-pro' | 'flux-max' | 'flux-klein' | 'gemini-flash';
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '2:3' | '3:2';
  quality?: 'standard' | 'high';
}

export interface ImageGenerationResult {
  imageUrl: string;  // Base64 data URL or hosted URL
  model: string;
  prompt: string;
  generatedAt: string;
}

// Model mapping
const MODEL_IDS: Record<string, string> = {
  'flux-pro': 'black-forest-labs/flux-1.1-pro',
  'flux-max': 'black-forest-labs/flux-1.1-pro', // Use pro for now, max may not be available
  'flux-klein': 'black-forest-labs/flux-schnell', // Schnell is the fast model
  'gemini-flash': 'google/gemini-2.0-flash-exp:free', // Free tier for testing
};

/**
 * Generate an image using OpenRouter's chat/completions endpoint
 * The key is using modalities: ['image', 'text']
 */
export async function generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const {
    prompt,
    model = 'flux-pro',
    aspectRatio = '1:1',
  } = options;

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const modelId = MODEL_IDS[model] || MODEL_IDS['flux-pro'];

  // Build the request body
  const requestBody: Record<string, unknown> = {
    model: modelId,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    // THIS IS THE KEY - must include image in modalities
    modalities: ['image', 'text'],
  };

  // Add aspect ratio for Gemini models
  if (model === 'gemini-flash') {
    requestBody.image_config = {
      aspect_ratio: aspectRatio,
    };
  }

  console.log('[Image Generation] Calling OpenRouter:', {
    model: modelId,
    promptLength: prompt.length,
    aspectRatio
  });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://tmh-ai-content-engine.vercel.app',
      'X-Title': 'TMH AI Content Engine'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Image Generation] OpenRouter error:', errorData);
    throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();

  // Extract image from response
  // OpenRouter returns images in the message content
  const message = data.choices?.[0]?.message;

  // Check for images array (newer format)
  if (message?.images && message.images.length > 0) {
    const imageUrl = message.images[0].image_url?.url || message.images[0].url;
    if (imageUrl) {
      return {
        imageUrl,
        model: modelId,
        prompt,
        generatedAt: new Date().toISOString()
      };
    }
  }

  // Check for content array with image parts (Gemini format)
  if (Array.isArray(message?.content)) {
    for (const part of message.content) {
      if (part.type === 'image_url' && part.image_url?.url) {
        return {
          imageUrl: part.image_url.url,
          model: modelId,
          prompt,
          generatedAt: new Date().toISOString()
        };
      }
      if (part.type === 'image' && part.source?.data) {
        return {
          imageUrl: `data:${part.source.media_type || 'image/png'};base64,${part.source.data}`,
          model: modelId,
          prompt,
          generatedAt: new Date().toISOString()
        };
      }
    }
  }

  // Log what we got for debugging
  console.error('[Image Generation] Unexpected response format:', JSON.stringify(data, null, 2));
  throw new Error('No image found in OpenRouter response');
}

/**
 * Generate product shot with TMH-specific enhancements
 */
export async function generateProductShot(options: {
  productType: string;
  style: string;
  shotType: 'flat-front' | 'flat-back' | 'ghost' | 'hanging' | 'macro';
  cityName?: string;
  model?: ImageGenerationOptions['model'];
}): Promise<ImageGenerationResult> {
  const { productType, style, shotType, cityName, model } = options;

  const shotPrompts: Record<string, string> = {
    'flat-front': `Professional flat lay photography of ${productType} front view, ${style} style, studio lighting, pure white background, top-down perspective, high detail, commercial product photography, 8K quality${cityName ? `, ${cityName} inspired design elements` : ''}`,
    'flat-back': `Professional flat lay photography of ${productType} back view showing label and details, ${style} style, studio lighting, pure white background, top-down perspective, high detail, commercial product photography${cityName ? `, ${cityName} inspired` : ''}`,
    'ghost': `Ghost mannequin photography of ${productType}, invisible mannequin effect showing 3D form, ${style} style, professional studio lighting, pure white background, front angle, commercial photography, crisp details${cityName ? `, ${cityName} themed` : ''}`,
    'hanging': `Professional hanger shot of ${productType} suspended on minimal black hanger, ${style} style, studio lighting, pure white background, front view, commercial product photography, clean aesthetic${cityName ? `, ${cityName} inspired` : ''}`,
    'macro': `Macro detail photography of ${productType} fabric texture and stitching, extreme close-up showing premium material quality, ${style} style, professional lighting, shallow depth of field${cityName ? `, ${cityName} design elements visible` : ''}`
  };

  const prompt = shotPrompts[shotType] || shotPrompts['flat-front'];

  return generateImage({ prompt, model, aspectRatio: '1:1' });
}

/**
 * Generate lifestyle shot with TMH-specific enhancements
 */
export async function generateLifestyleShot(options: {
  description: string;
  cityName: string;
  modelDescription?: string;
  sneaker?: string;
  location?: string;
  model?: ImageGenerationOptions['model'];
  aspectRatio?: ImageGenerationOptions['aspectRatio'];
}): Promise<ImageGenerationResult> {
  const {
    description,
    cityName,
    modelDescription = 'stylish person, diverse representation',
    sneaker,
    location,
    model,
    aspectRatio = '4:3'
  } = options;

  // Build comprehensive lifestyle prompt
  let prompt = `Professional lifestyle photography for premium streetwear brand. ${description}. `;
  prompt += `${modelDescription} in ${cityName}. `;

  if (location) {
    prompt += `Location: ${location}. `;
  }

  if (sneaker) {
    prompt += `Wearing ${sneaker} sneakers prominently visible. `;
  }

  prompt += `Urban streetwear aesthetic, authentic and aspirational, golden hour lighting, shot on 85mm lens with shallow depth of field, cinematic color grading, high fashion editorial style.`;

  return generateImage({ prompt, model, aspectRatio });
}

/**
 * Check if OpenRouter image generation is available
 */
export function isImageGenerationConfigured(): boolean {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  return apiKey.startsWith('sk-') && apiKey.length > 20;
}
