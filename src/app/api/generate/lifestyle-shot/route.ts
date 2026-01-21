import { NextRequest, NextResponse } from 'next/server';

interface LifestyleVariation {
  id: string;
  name: string;
  model: string;
  location: string;
  description: string;
  prompt: string;
}

interface GenerationRequest {
  cityId: string;
  cityName: string;
  variation: LifestyleVariation;
  generateBothModels: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const { cityId, cityName, variation, generateBothModels } = body;

    if (!cityId || !cityName || !variation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare prompts for both models
    const modelAPrompt = `${variation.prompt}, Model A style, city: ${cityName}, professional photography, high quality`;
    const modelBPrompt = `${variation.prompt}, Model B style, city: ${cityName}, lifestyle photography, natural lighting`;

    // Initialize response data
    const responseData: any = {};

    // Generate with Model A
    try {
      // In production, this would call the actual AI generation API
      // For now, we'll simulate with placeholder data
      const modelAResponse = await generateImage(modelAPrompt, 'model-a');
      responseData.modelA = {
        imageUrl: modelAResponse.imageUrl || `https://via.placeholder.com/600x800/4F46E5/ffffff?text=Model+A+${encodeURIComponent(variation.name)}`,
        prompt: modelAPrompt,
        model: 'model-a',
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating Model A image:', error);
      responseData.modelA = {
        error: 'Failed to generate with Model A',
        prompt: modelAPrompt
      };
    }

    // Generate with Model B if requested
    if (generateBothModels) {
      try {
        const modelBResponse = await generateImage(modelBPrompt, 'model-b');
        responseData.modelB = {
          imageUrl: modelBResponse.imageUrl || `https://via.placeholder.com/600x800/10B981/ffffff?text=Model+B+${encodeURIComponent(variation.name)}`,
          prompt: modelBPrompt,
          model: 'model-b',
          generatedAt: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error generating Model B image:', error);
        responseData.modelB = {
          error: 'Failed to generate with Model B',
          prompt: modelBPrompt
        };
      }
    }

    // Add metadata
    responseData.metadata = {
      cityId,
      cityName,
      variation: variation.id,
      variationName: variation.name,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in lifestyle shot generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate lifestyle shots' },
      { status: 500 }
    );
  }
}

// Mock image generation function - replace with actual AI API call
async function generateImage(prompt: string, model: string): Promise<{ imageUrl: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In production, this would call the actual AI generation service
  // For example:
  // const response = await fetch('https://api.openrouter.ai/v1/images/generations', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     prompt,
  //     model: model === 'model-a' ? 'dalle-3' : 'stable-diffusion-xl',
  //     n: 1,
  //     size: '1024x1024'
  //   })
  // });
  // const data = await response.json();
  // return { imageUrl: data.data[0].url };

  // Return mock placeholder for now
  const colors = model === 'model-a' ? '4F46E5' : '10B981';
  return {
    imageUrl: `https://via.placeholder.com/600x800/${colors}/ffffff?text=${encodeURIComponent(prompt.slice(0, 30))}`
  };
}