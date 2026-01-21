interface ImageGenerationOptions {
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
  revisedPrompt?: boolean;
}

interface ImageGenerationResponse {
  url: string;
  model: string;
  prompt: string;
  metadata?: {
    size?: string;
    quality?: string;
    style?: string;
    revisedPrompt?: string;
    generationTime?: number;
    [key: string]: any;
  };
}

interface ImageGenerationError {
  error: string;
  code?: string;
  status?: number;
  details?: any;
}

type ImageModel = 'nano_banana' | 'openai';

/**
 * Generate an image using the specified model
 * @param prompt - The text prompt describing the image to generate
 * @param model - The model to use for generation ('nano_banana' or 'openai')
 * @param options - Additional options for image generation
 * @returns Standardized response with image URL and metadata
 */
export async function generateImage(
  prompt: string,
  model: ImageModel,
  options: ImageGenerationOptions = {}
): Promise<ImageGenerationResponse> {
  const startTime = Date.now();

  try {
    let response: ImageGenerationResponse;

    switch (model) {
      case 'nano_banana':
        response = await generateWithNanoBanana(prompt, options);
        break;
      case 'openai':
        response = await generateWithOpenAI(prompt, options);
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    // Add generation time to metadata
    if (!response.metadata) {
      response.metadata = {};
    }
    response.metadata.generationTime = Date.now() - startTime;

    return response;
  } catch (error) {
    throw formatError(error, model);
  }
}

/**
 * Generate image using Nano Banana model via OpenRouter
 */
async function generateWithNanoBanana(
  prompt: string,
  options: ImageGenerationOptions
): Promise<ImageGenerationResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const requestBody = {
    model: 'nano-bananax/nano-bananax',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          }
        ]
      }
    ],
    max_tokens: 1,
    temperature: 0.7,
    provider: {
      order: ['DeepInfra']
    }
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'TMH Image Generation'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Extract image URL from the response
    // Nano Banana typically returns the image URL in the message content
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No image URL returned from Nano Banana model');
    }

    // Parse the image URL from the content
    let imageUrl = content;

    // If content is JSON, parse it
    if (content.startsWith('{')) {
      try {
        const parsed = JSON.parse(content);
        imageUrl = parsed.url || parsed.image_url || parsed.image || content;
      } catch {
        // If not valid JSON, use content as is
      }
    }

    // Extract URL from markdown or HTML if present
    const urlMatch = imageUrl.match(/https?:\/\/[^\s\)\"\']+/);
    if (urlMatch) {
      imageUrl = urlMatch[0];
    }

    return {
      url: imageUrl,
      model: 'nano_banana',
      prompt: prompt,
      metadata: {
        size: options.size || '1024x1024',
        provider: 'DeepInfra',
        via: 'OpenRouter'
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate image with Nano Banana');
  }
}

/**
 * Generate image using OpenAI's DALL-E model
 */
async function generateWithOpenAI(
  prompt: string,
  options: ImageGenerationOptions
): Promise<ImageGenerationResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const requestBody = {
    model: 'dall-e-3',
    prompt: prompt,
    n: options.n || 1,
    size: options.size || '1024x1024',
    quality: options.quality || 'standard',
    style: options.style || 'vivid',
    response_format: 'url'
  };

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('No images returned from OpenAI');
    }

    const image = data.data[0];

    return {
      url: image.url,
      model: 'openai',
      prompt: prompt,
      metadata: {
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        style: options.style || 'vivid',
        revisedPrompt: image.revised_prompt,
        modelVersion: 'dall-e-3'
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate image with OpenAI');
  }
}

/**
 * Format error with typed response
 */
function formatError(error: unknown, model: string): ImageGenerationError {
  if (error instanceof Error) {
    const formattedError: ImageGenerationError = {
      error: error.message,
      code: `${model.toUpperCase()}_ERROR`
    };

    // Try to extract status code from error message
    const statusMatch = error.message.match(/(\d{3})/);
    if (statusMatch) {
      formattedError.status = parseInt(statusMatch[1], 10);
    }

    return formattedError;
  }

  return {
    error: 'An unexpected error occurred during image generation',
    code: 'UNKNOWN_ERROR',
    details: error
  };
}

/**
 * Batch generate images with multiple models
 */
export async function batchGenerateImages(
  prompt: string,
  models: ImageModel[],
  options: ImageGenerationOptions = {}
): Promise<ImageGenerationResponse[]> {
  const promises = models.map(model =>
    generateImage(prompt, model, options).catch(error => ({
      url: '',
      model,
      prompt,
      metadata: {
        error: formatError(error, model)
      }
    }))
  );

  return Promise.all(promises);
}

/**
 * Validate if a URL points to a valid image
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && !!contentType && contentType.startsWith('image/');
  } catch {
    return false;
  }
}

export type { ImageGenerationOptions, ImageGenerationResponse, ImageGenerationError, ImageModel };