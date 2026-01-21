import OpenAI from 'openai';

// Type definitions
export type VideoModel = 'sora_2' | 'gemini_video';

export interface VideoOptions {
  duration?: number; // in seconds
  resolution?: '720p' | '1080p' | '4k';
  fps?: 24 | 30 | 60;
  style?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface VideoResponse {
  url: string;
  model: VideoModel;
  duration: number;
  metadata: {
    resolution?: string;
    fps?: number;
    style?: string;
    aspectRatio?: string;
    generatedAt: string;
    processingTime?: number;
  };
}

interface VideoAsset {
  url: string;
  type: 'image' | 'video' | 'audio';
  duration?: number;
  timestamp?: number;
}

// Sora 2 API Client
async function generateWithSora(
  script: string,
  assets: VideoAsset[],
  options: VideoOptions
): Promise<VideoResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // For client-side usage
  });

  try {
    // Prepare the request payload for Sora 2
    const requestBody = {
      model: 'sora-2.0',
      prompt: script,
      duration: options.duration || 10,
      resolution: options.resolution || '1080p',
      fps: options.fps || 30,
      aspect_ratio: options.aspectRatio || '16:9',
      style: options.style,
      assets: assets.map(asset => ({
        url: asset.url,
        type: asset.type,
        duration: asset.duration,
        timestamp: asset.timestamp
      }))
    };

    const startTime = Date.now();

    // Make API call to Sora 2
    // Note: This is a hypothetical API endpoint as Sora 2 API details are not public yet
    // The actual implementation would follow OpenAI's video generation API structure
    const response = await fetch('https://api.openai.com/v1/video/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Sora API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;

    return {
      url: data.data?.[0]?.url || data.url,
      model: 'sora_2',
      duration: options.duration || 10,
      metadata: {
        resolution: options.resolution || '1080p',
        fps: options.fps || 30,
        style: options.style,
        aspectRatio: options.aspectRatio || '16:9',
        generatedAt: new Date().toISOString(),
        processingTime
      }
    };
  } catch (error) {
    console.error('Sora video generation error:', error);
    throw new Error(`Failed to generate video with Sora: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Gemini Video API Client
async function generateWithGemini(
  script: string,
  assets: VideoAsset[],
  options: VideoOptions
): Promise<VideoResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
  }

  try {
    // Prepare the request for Gemini Video API
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: script
            },
            ...assets.map(asset => ({
              inline_data: {
                mime_type: asset.type === 'image' ? 'image/jpeg' :
                          asset.type === 'video' ? 'video/mp4' : 'audio/mp3',
                data: asset.url // In production, this would be base64 encoded
              }
            }))
          ]
        }
      ],
      generationConfig: {
        videoDuration: options.duration || 10,
        videoResolution: options.resolution || '1080p',
        videoFps: options.fps || 30,
        videoAspectRatio: options.aspectRatio?.replace(':', 'x') || '16x9',
        videoStyle: options.style
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'
        }
      ]
    };

    const startTime = Date.now();

    // Make API call to Gemini Video
    // Note: This endpoint is hypothetical as Gemini Video API details may vary
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-video:generateVideo?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;

    // Extract video URL from Gemini response
    const videoUrl = data.candidates?.[0]?.content?.parts?.[0]?.videoUri ||
                    data.videoUrl ||
                    data.url;

    if (!videoUrl) {
      throw new Error('No video URL returned from Gemini API');
    }

    return {
      url: videoUrl,
      model: 'gemini_video',
      duration: options.duration || 10,
      metadata: {
        resolution: options.resolution || '1080p',
        fps: options.fps || 30,
        style: options.style,
        aspectRatio: options.aspectRatio || '16:9',
        generatedAt: new Date().toISOString(),
        processingTime
      }
    };
  } catch (error) {
    console.error('Gemini video generation error:', error);
    throw new Error(`Failed to generate video with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Main video generation function
export async function generateVideo(
  script: string,
  assets: VideoAsset[] = [],
  model: VideoModel,
  options: VideoOptions = {}
): Promise<VideoResponse> {
  // Validate input parameters
  if (!script || script.trim().length === 0) {
    throw new Error('Script is required for video generation');
  }

  if (!model) {
    throw new Error('Model selection is required');
  }

  // Route to the appropriate API based on model selection
  switch (model) {
    case 'sora_2':
      return generateWithSora(script, assets, options);

    case 'gemini_video':
      return generateWithGemini(script, assets, options);

    default:
      throw new Error(`Unsupported video model: ${model}`);
  }
}

// Helper function to validate video assets
export function validateVideoAssets(assets: VideoAsset[]): boolean {
  return assets.every(asset => {
    // Check if URL is valid
    try {
      new URL(asset.url);
    } catch {
      return false;
    }

    // Check if type is valid
    if (!['image', 'video', 'audio'].includes(asset.type)) {
      return false;
    }

    // Check if duration is positive when provided
    if (asset.duration !== undefined && asset.duration <= 0) {
      return false;
    }

    // Check if timestamp is non-negative when provided
    if (asset.timestamp !== undefined && asset.timestamp < 0) {
      return false;
    }

    return true;
  });
}

// Helper function to estimate video generation time
export function estimateGenerationTime(duration: number, model: VideoModel): number {
  // Rough estimates in seconds
  const baseTime = model === 'sora_2' ? 30 : 20;
  const perSecondTime = model === 'sora_2' ? 5 : 3;
  return baseTime + (duration * perSecondTime);
}

// Export types for external use
export type { VideoAsset };