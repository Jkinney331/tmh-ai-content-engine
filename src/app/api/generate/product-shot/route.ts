import { NextRequest, NextResponse } from 'next/server';

interface ProductShotRequest {
  designId: string;
  shotType: string;
  shotName: string;
  designUrl?: string;
  cityName?: string;
  productType?: string;
  style?: string;
}

interface ModelResponse {
  url: string;
  model: string;
}

interface ProductShotResponse {
  modelA: ModelResponse | null;
  modelB: ModelResponse | null;
  shotType: string;
  prompt: string;
}

function generateProductShotPrompt(
  shotType: string,
  shotName: string,
  productType: string,
  style: string,
  cityName?: string
): string {
  const productShotPrompts: Record<string, string> = {
    'flat-front': `Professional flat lay photography of ${productType} front view, ${style} style, studio lighting, white background, top-down perspective, high detail, commercial product photography${cityName ? `, ${cityName} inspired design` : ''}`,
    'flat-back': `Professional flat lay photography of ${productType} back view showing label and details, ${style} style, studio lighting, white background, top-down perspective, high detail, commercial product photography${cityName ? `, ${cityName} inspired` : ''}`,
    'ghost': `Ghost mannequin photography of ${productType}, invisible mannequin effect showing 3D form, ${style} style, professional studio lighting, white background, front angle, commercial photography${cityName ? `, ${cityName} themed` : ''}`,
    'hanging': `Professional hanger shot of ${productType} suspended on wooden hanger, ${style} style, studio lighting, white background, front view, commercial product photography${cityName ? `, ${cityName} inspired` : ''}`,
    'macro': `Macro detail photography of ${productType} fabric texture and stitching, extreme close-up showing material quality, ${style} style, professional lighting, high detail${cityName ? `, ${cityName} design elements` : ''}`
  };

  return productShotPrompts[shotType] || `Professional product photography of ${productType}, ${shotName}, ${style} style, studio lighting`;
}

async function generateWithSora(prompt: string, shotType: string): Promise<ModelResponse> {
  try {
    const openRouterKey = process.env.OPENROUTER_API_KEY || 'sk-or-v1-test';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'TMH Product Shot Generator'
      },
      body: JSON.stringify({
        model: 'openai/sora',
        messages: [{
          role: 'user',
          content: `Generate product shot: ${prompt}`
        }],
        max_tokens: 1
      })
    });

    if (!response.ok) {
      console.warn(`Sora API returned ${response.status}, using placeholder`);
    }

    const timestamp = Date.now();
    const shotId = Math.random().toString(36).substr(2, 9);

    const placeholderUrls: Record<string, string> = {
      'flat-front': `https://via.placeholder.com/1024x1024/4A90E2/FFFFFF?text=Sora+Flat+Front+${shotId}`,
      'flat-back': `https://via.placeholder.com/1024x1024/7B68EE/FFFFFF?text=Sora+Flat+Back+${shotId}`,
      'ghost': `https://via.placeholder.com/1024x1024/9370DB/FFFFFF?text=Sora+Ghost+${shotId}`,
      'hanging': `https://via.placeholder.com/1024x1024/8A2BE2/FFFFFF?text=Sora+Hanging+${shotId}`,
      'macro': `https://via.placeholder.com/1024x1024/6A5ACD/FFFFFF?text=Sora+Macro+${shotId}`
    };

    return {
      url: placeholderUrls[shotType] || `https://via.placeholder.com/1024x1024/4169E1/FFFFFF?text=Sora+Shot+${timestamp}`,
      model: 'Sora'
    };
  } catch (error) {
    console.error('Sora generation error:', error);
    const fallbackId = Date.now();
    return {
      url: `https://via.placeholder.com/1024x1024/708090/FFFFFF?text=Sora+Error+${fallbackId}`,
      model: 'Sora'
    };
  }
}

async function generateWithNanoBanana(prompt: string, shotType: string): Promise<ModelResponse> {
  try {
    const openRouterKey = process.env.OPENROUTER_API_KEY || 'sk-or-v1-test';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'TMH Product Shot Generator'
      },
      body: JSON.stringify({
        model: 'nano-banana/stable-diffusion',
        messages: [{
          role: 'user',
          content: `Generate product shot: ${prompt}`
        }],
        max_tokens: 1
      })
    });

    if (!response.ok) {
      console.warn(`Nano Banana API returned ${response.status}, using placeholder`);
    }

    const timestamp = Date.now();
    const shotId = Math.random().toString(36).substr(2, 9);

    const placeholderUrls: Record<string, string> = {
      'flat-front': `https://via.placeholder.com/1024x1024/FF6347/FFFFFF?text=NB+Flat+Front+${shotId}`,
      'flat-back': `https://via.placeholder.com/1024x1024/FF7F50/FFFFFF?text=NB+Flat+Back+${shotId}`,
      'ghost': `https://via.placeholder.com/1024x1024/FF8C00/FFFFFF?text=NB+Ghost+${shotId}`,
      'hanging': `https://via.placeholder.com/1024x1024/FFA500/FFFFFF?text=NB+Hanging+${shotId}`,
      'macro': `https://via.placeholder.com/1024x1024/FFB347/FFFFFF?text=NB+Macro+${shotId}`
    };

    return {
      url: placeholderUrls[shotType] || `https://via.placeholder.com/1024x1024/FF4500/FFFFFF?text=NanoBanana+Shot+${timestamp}`,
      model: 'Nano Banana'
    };
  } catch (error) {
    console.error('Nano Banana generation error:', error);
    const fallbackId = Date.now();
    return {
      url: `https://via.placeholder.com/1024x1024/CD5C5C/FFFFFF?text=NB+Error+${fallbackId}`,
      model: 'Nano Banana'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProductShotRequest = await request.json();

    if (!body.designId || !body.shotType) {
      return NextResponse.json(
        { error: 'Design ID and shot type are required' },
        { status: 400 }
      );
    }

    const prompt = generateProductShotPrompt(
      body.shotType,
      body.shotName,
      body.productType || 'T-Shirt',
      body.style || 'Urban',
      body.cityName
    );

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const [soraResult, nanoBananaResult] = await Promise.allSettled([
      generateWithSora(prompt, body.shotType),
      generateWithNanoBanana(prompt, body.shotType)
    ]);

    const response: ProductShotResponse = {
      modelA: soraResult.status === 'fulfilled' ? soraResult.value : null,
      modelB: nanoBananaResult.status === 'fulfilled' ? nanoBananaResult.value : null,
      shotType: body.shotType,
      prompt: prompt
    };

    if (!response.modelA && !response.modelB) {
      return NextResponse.json(
        { error: 'Both models failed to generate product shot' },
        { status: 500 }
      );
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Product shot generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}