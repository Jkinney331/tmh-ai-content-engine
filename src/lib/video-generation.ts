/**
 * Video Generation Library for TMH AI Content Engine
 *
 * Supports:
 * - Sora 2 / Sora 2 Pro via OpenAI Direct API
 * - VEO 3 / VEO 3 Fast via WaveSpeed API
 */

// ============================================================================
// Types
// ============================================================================

export type VideoModel = 'sora-2' | 'sora-2-pro' | 'veo-3' | 'veo-3-fast';
export type AspectRatio = '16:9' | '9:16' | '1:1';
export type Resolution = '480p' | '720p' | '1080p';

export interface VideoGenerationOptions {
  prompt: string;
  model?: VideoModel;
  duration?: number; // seconds
  aspectRatio?: AspectRatio;
  resolution?: Resolution;
  generateAudio?: boolean; // VEO only
}

export interface VideoGenerationResult {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  provider: 'openai' | 'wavespeed';
  model: string;
  estimatedCost: number;
}

export interface VideoStatusResult {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  error?: string;
}

// ============================================================================
// Cost Estimates
// ============================================================================

const COST_PER_SECOND: Record<VideoModel, number> = {
  'sora-2': 0.10,
  'sora-2-pro': 0.30,
  'veo-3': 0.75,
  'veo-3-fast': 0.50,
};

// ============================================================================
// Sora 2 (OpenAI)
// ============================================================================

export async function generateSoraVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
  const {
    prompt,
    model = 'sora-2',
    duration = 8,
    resolution = '720p',
    aspectRatio = '16:9',
  } = options;

  const openAiKey = process.env.OPENAI_API_KEY;
  const waveSpeedKey = process.env.WAVESPEED_API_KEY;

  // Map resolution to size (OpenAI)
  const sizeMap: Record<Resolution, string> = {
    '480p': '854x480',
    '720p': '1280x720',
    '1080p': '1920x1080',
  };

  const soraModel = model === 'sora-2-pro' ? 'sora-2-pro' : 'sora-2';

  if (openAiKey) {
    try {
      console.log('[Sora] Starting OpenAI video generation:', { model: soraModel, duration, resolution });

      const response = await fetch('https://api.openai.com/v1/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: soraModel,
          prompt,
          size: sizeMap[resolution],
          seconds: `${duration}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('[Sora] OpenAI API error:', error);
        throw new Error(error.error?.message || `Sora API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        jobId: data.id,
        status: 'processing',
        provider: 'openai',
        model: soraModel,
        estimatedCost: duration * COST_PER_SECOND[model as VideoModel],
      };
    } catch (error) {
      if (!waveSpeedKey) {
        throw error;
      }
      console.warn('[Sora] OpenAI failed, falling back to WaveSpeed:', error);
    }
  }

  if (!waveSpeedKey) {
    throw new Error('No Sora provider configured (OPENAI_API_KEY or WAVESPEED_API_KEY required)');
  }

  // WaveSpeed expects size as width*height and duration as integer
  const waveSpeedSize = aspectRatio === '9:16' ? '720*1280' : '1280*720';

  console.log('[Sora] Starting WaveSpeed video generation:', { model: 'sora-2', duration, size: waveSpeedSize });

  const waveSpeedResponse = await fetch('https://api.wavespeed.ai/api/v3/openai/sora-2/text-to-video', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${waveSpeedKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      size: waveSpeedSize,
      duration,
    }),
  });

  if (!waveSpeedResponse.ok) {
    const error = await waveSpeedResponse.json().catch(() => ({}));
    console.error('[Sora] WaveSpeed API error:', error);
    throw new Error(error.message || error.error || `WaveSpeed Sora API error: ${waveSpeedResponse.status}`);
  }

  const waveSpeedData = await waveSpeedResponse.json();
  const jobId =
    waveSpeedData?.data?.id ||
    waveSpeedData?.id ||
    waveSpeedData?.job_id ||
    waveSpeedData?.prediction_id;

  if (!jobId) {
    throw new Error('WaveSpeed Sora response missing job id');
  }

  return {
    jobId,
    status: 'processing',
    provider: 'wavespeed',
    model: 'sora-2',
    estimatedCost: duration * COST_PER_SECOND[model as VideoModel],
  };
}

export async function checkSoraStatus(videoId: string): Promise<VideoStatusResult> {
  const openAiKey = process.env.OPENAI_API_KEY;
  const waveSpeedKey = process.env.WAVESPEED_API_KEY;

  if (openAiKey) {
    try {
      const response = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Failed to check status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'completed') {
        // Get the video content URL
        const contentResponse = await fetch(`https://api.openai.com/v1/videos/${videoId}/content`, {
          headers: {
            'Authorization': `Bearer ${openAiKey}`,
          },
        });

        if (contentResponse.ok) {
          const contentData = await contentResponse.json().catch(() => null);
          return {
            status: 'completed',
            videoUrl: contentData?.url || contentData,
          };
        }
      }

      return {
        status: data.status === 'succeeded' ? 'completed' : data.status,
        progress: data.progress,
        error: data.error?.message,
      };
    } catch (error) {
      if (!waveSpeedKey) {
        throw error;
      }
    }
  }

  if (!waveSpeedKey) {
    throw new Error('No Sora provider configured (OPENAI_API_KEY or WAVESPEED_API_KEY required)');
  }

  const response = await fetch(
    `https://api.wavespeed.ai/api/v3/predictions/${videoId}/result`,
    {
      headers: {
        'Authorization': `Bearer ${waveSpeedKey}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to check status: ${response.status}`);
  }

  const data = await response.json();
  const status = data?.data?.status || data?.status;
  const outputs = data?.data?.outputs || data?.outputs;

  return {
    status: status === 'completed' || status === 'succeeded' ? 'completed' : status,
    videoUrl: Array.isArray(outputs) ? outputs[0] : undefined,
    error: data?.data?.error || data?.error,
  };
}

// ============================================================================
// VEO 3 (WaveSpeed)
// ============================================================================

export async function generateVeoVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
  const {
    prompt,
    model = 'veo-3',
    duration = 8,
    aspectRatio = '16:9',
    resolution = '1080p',
    generateAudio = true,
  } = options;

  const apiKey = process.env.WAVESPEED_API_KEY;
  if (!apiKey) {
    throw new Error('WAVESPEED_API_KEY not configured');
  }

  const veoModel = model === 'veo-3-fast' ? 'veo-3.1-fast' : 'veo-3.1';

  console.log('[VEO] Starting video generation:', { model: veoModel, duration, aspectRatio });

  const response = await fetch('https://api.wavespeed.ai/api/v3/google/veo3.1/text-to-video', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      duration,
      aspect_ratio: aspectRatio,
      resolution,
      generate_audio: generateAudio,
      model: veoModel,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('[VEO] API error:', error);
    throw new Error(error.message || error.error || `WaveSpeed API error: ${response.status}`);
  }

  const data = await response.json();
  const jobId =
    data.id ||
    data.job_id ||
    data.prediction_id ||
    data.task_id ||
    data.predictionId ||
    data.prediction?.id ||
    data.data?.id ||
    data.result?.id;

  if (!jobId) {
    const topKeys = Object.keys(data || {});
    const nestedPredictionKeys = data?.prediction ? Object.keys(data.prediction) : [];
    throw new Error(`WaveSpeed response missing job id. keys=${JSON.stringify(topKeys)} predictionKeys=${JSON.stringify(nestedPredictionKeys)}`);
  }

  return {
    jobId,
    status: 'processing',
    provider: 'wavespeed',
    model: veoModel,
    estimatedCost: duration * COST_PER_SECOND[model as VideoModel],
  };
}

export async function checkVeoStatus(predictionId: string): Promise<VideoStatusResult> {
  const apiKey = process.env.WAVESPEED_API_KEY;
  if (!apiKey) {
    throw new Error('WAVESPEED_API_KEY not configured');
  }

  const response = await fetch(
    `https://api.wavespeed.ai/api/v3/predictions/${predictionId}/result`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to check status: ${response.status}`);
  }

  const data = await response.json();

  return {
    status: (() => {
      const status = (data?.data?.status || data?.status || 'processing') as string;
      if (status === 'completed' || status === 'succeeded') return 'completed';
      if (status === 'failed') return 'failed';
      if (status === 'created') return 'queued';
      return status as 'queued' | 'processing' | 'completed' | 'failed';
    })(),
    progress: data?.data?.progress ?? data?.progress,
    videoUrl: (() => {
      const outputs = data?.data?.outputs ?? data?.outputs ?? data?.output;
      if (Array.isArray(outputs)) return outputs[0];
      if (outputs?.video_url) return outputs.video_url;
      if (typeof outputs === 'string') return outputs;
      return undefined;
    })(),
    error: data?.data?.error || data?.error,
  };
}

// ============================================================================
// Unified Interface
// ============================================================================

export async function generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
  const model = options.model || 'sora-2';

  if (model.startsWith('sora')) {
    return generateSoraVideo(options);
  } else if (model.startsWith('veo')) {
    return generateVeoVideo(options);
  } else {
    throw new Error(`Unknown video model: ${model}`);
  }
}

export async function checkVideoStatus(
  jobId: string,
  provider: 'openai' | 'wavespeed'
): Promise<VideoStatusResult> {
  if (provider === 'openai') {
    return checkSoraStatus(jobId);
  } else if (provider === 'wavespeed') {
    return checkVeoStatus(jobId);
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }
}

// ============================================================================
// Configuration Check
// ============================================================================

export function isVideoGenerationConfigured(): {
  sora: boolean;
  veo: boolean;
} {
  return {
    sora: !!process.env.OPENAI_API_KEY || !!process.env.WAVESPEED_API_KEY,
    veo: !!process.env.WAVESPEED_API_KEY,
  };
}
