/**
 * OpenRouter API Client for TMH AI Content Engine
 * Handles multi-model AI generation for images, videos, and copy
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface OpenRouterConfig {
  apiKey: string;
  baseURL: string;
  headers: Record<string, string>;
}

export function getOpenRouterConfig(): OpenRouterConfig {
  const apiKey = process.env.OPENROUTER_API_KEY || '';

  return {
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://tmh-ai-content-engine.vercel.app',
      'X-Title': 'TMH AI Content Engine',
      'Content-Type': 'application/json',
    },
  };
}

// =============================================================================
// TMH Model Configuration
// =============================================================================

// Image generation models
export const TMH_IMAGE_MODELS = {
  'nano-banana': {
    id: 'nexa/nano-banana',
    name: 'Nano Banana',
    description: 'Primary image model - fast and cost-effective',
    avgCostCents: 2,
    avgLatencyMs: 3000,
  },
  'gpt-image': {
    id: 'openai/gpt-image-1',
    name: 'GPT Image',
    description: 'OpenAI image generation - high quality',
    avgCostCents: 4,
    avgLatencyMs: 5000,
  },
} as const;

// Video generation models
export const TMH_VIDEO_MODELS = {
  'nano-banana-video': {
    id: 'nexa/nano-banana',
    name: 'Nano Banana Video',
    description: 'For GIFs/short clips from its own images',
    avgCostCents: 5,
    avgLatencyMs: 8000,
  },
  'veo3': {
    id: 'google/veo-3',
    name: 'VEO 3',
    description: 'Google video model - longer clips, high quality',
    avgCostCents: 15,
    avgLatencyMs: 15000,
  },
  'sora2': {
    id: 'openai/sora-2',
    name: 'Sora 2',
    description: 'OpenAI video - dynamic motion, lifestyle',
    avgCostCents: 20,
    avgLatencyMs: 20000,
  },
} as const;

// Copy/text generation models
export const TMH_COPY_MODELS = {
  'claude': {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet',
    description: 'Best for brand voice consistency',
    avgCostCents: 1,
    avgLatencyMs: 2000,
  },
  'gpt': {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Strong alternative for copy',
    avgCostCents: 2,
    avgLatencyMs: 2500,
  },
  'deepseek': {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek',
    description: 'Cost-effective option for volume',
    avgCostCents: 0.5,
    avgLatencyMs: 1500,
  },
} as const;

// =============================================================================
// Video Pipeline Combinations
// =============================================================================

export interface VideoPipeline {
  id: string;
  imageModel: keyof typeof TMH_IMAGE_MODELS;
  videoModel: keyof typeof TMH_VIDEO_MODELS | null;
  name: string;
  bestFor: string;
  estimatedCostCents: number;
  estimatedLatencyMs: number;
}

export const TMH_VIDEO_PIPELINES: VideoPipeline[] = [
  {
    id: 'nb-nb',
    imageModel: 'nano-banana',
    videoModel: 'nano-banana-video',
    name: 'Nano Banana Full Stack',
    bestFor: 'GIFs, short loops, product animations',
    estimatedCostCents: 7,
    estimatedLatencyMs: 11000,
  },
  {
    id: 'nb-veo3',
    imageModel: 'nano-banana',
    videoModel: 'veo3',
    name: 'Nano Banana + VEO 3',
    bestFor: 'Longer clips, cinematic quality',
    estimatedCostCents: 17,
    estimatedLatencyMs: 18000,
  },
  {
    id: 'nb-sora2',
    imageModel: 'nano-banana',
    videoModel: 'sora2',
    name: 'Nano Banana + Sora 2',
    bestFor: 'Dynamic motion, lifestyle content',
    estimatedCostCents: 22,
    estimatedLatencyMs: 23000,
  },
  {
    id: 'gpt-nb',
    imageModel: 'gpt-image',
    videoModel: 'nano-banana-video',
    name: 'GPT Image + Nano Video',
    bestFor: 'GIFs from high-quality GPT images',
    estimatedCostCents: 9,
    estimatedLatencyMs: 13000,
  },
  {
    id: 'gpt-veo3',
    imageModel: 'gpt-image',
    videoModel: 'veo3',
    name: 'GPT Image + VEO 3',
    bestFor: 'Premium video from GPT images',
    estimatedCostCents: 19,
    estimatedLatencyMs: 20000,
  },
  {
    id: 'gpt-sora2',
    imageModel: 'gpt-image',
    videoModel: 'sora2',
    name: 'OpenAI Full Stack',
    bestFor: 'Highest quality, full OpenAI pipeline',
    estimatedCostCents: 24,
    estimatedLatencyMs: 25000,
  },
];

// Static image-only pipelines
export const TMH_IMAGE_PIPELINES: VideoPipeline[] = [
  {
    id: 'nano-banana-only',
    imageModel: 'nano-banana',
    videoModel: null,
    name: 'Nano Banana (Static)',
    bestFor: 'Product shots, design concepts',
    estimatedCostCents: 2,
    estimatedLatencyMs: 3000,
  },
  {
    id: 'gpt-image-only',
    imageModel: 'gpt-image',
    videoModel: null,
    name: 'GPT Image (Static)',
    bestFor: 'High-quality product shots',
    estimatedCostCents: 4,
    estimatedLatencyMs: 5000,
  },
];

// =============================================================================
// Content Type to Pipeline Mapping
// =============================================================================

export type ContentType =
  | 'product_gif'
  | 'lifestyle_clip'
  | 'ad_video'
  | 'social_short'
  | 'product_shot'
  | 'design_concept';

export const CONTENT_PIPELINE_MAP: Record<ContentType, string[]> = {
  product_gif: ['nb-nb', 'gpt-nb'],
  lifestyle_clip: ['nb-veo3', 'gpt-veo3', 'nb-sora2'],
  ad_video: ['nb-sora2', 'gpt-sora2', 'nb-veo3'],
  social_short: ['nb-nb', 'nb-sora2'],
  product_shot: ['nano-banana-only', 'gpt-image-only'],
  design_concept: ['nano-banana-only', 'gpt-image-only'],
};

// =============================================================================
// Helper Functions
// =============================================================================

export function getPipelineById(id: string): VideoPipeline | undefined {
  return [...TMH_VIDEO_PIPELINES, ...TMH_IMAGE_PIPELINES].find(p => p.id === id);
}

export function getPipelinesForContentType(contentType: ContentType): VideoPipeline[] {
  const pipelineIds = CONTENT_PIPELINE_MAP[contentType] || [];
  return pipelineIds
    .map(id => getPipelineById(id))
    .filter((p): p is VideoPipeline => p !== undefined);
}

export function isVideoContentType(contentType: ContentType): boolean {
  return ['product_gif', 'lifestyle_clip', 'ad_video', 'social_short'].includes(contentType);
}

// =============================================================================
// API Functions
// =============================================================================

export interface GenerationResult {
  url: string;
  model: string;
  costCents: number;
  latencyMs: number;
  metadata?: Record<string, any>;
}

/**
 * Generate an image using OpenRouter
 */
export async function generateImageWithOpenRouter(
  prompt: string,
  modelKey: keyof typeof TMH_IMAGE_MODELS = 'nano-banana'
): Promise<GenerationResult> {
  const config = getOpenRouterConfig();
  const model = TMH_IMAGE_MODELS[modelKey];

  if (!config.apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const startTime = Date.now();

  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify({
      model: model.id,
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }],
        },
      ],
      max_tokens: 1,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Extract image URL from response
  const urlMatch = content.match(/https?:\/\/[^\s\)\"\']+/);
  const imageUrl = urlMatch ? urlMatch[0] : content;

  return {
    url: imageUrl,
    model: modelKey,
    costCents: model.avgCostCents,
    latencyMs: Date.now() - startTime,
    metadata: {
      modelId: model.id,
      modelName: model.name,
    },
  };
}

/**
 * Generate text/copy using OpenRouter
 */
export async function generateCopyWithOpenRouter(
  prompt: string,
  systemPrompt?: string,
  modelKey: keyof typeof TMH_COPY_MODELS = 'claude'
): Promise<{ text: string; costCents: number; latencyMs: number }> {
  const config = getOpenRouterConfig();
  const model = TMH_COPY_MODELS[modelKey];

  if (!config.apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const startTime = Date.now();

  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify({
      model: model.id,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  return {
    text,
    costCents: model.avgCostCents,
    latencyMs: Date.now() - startTime,
  };
}

// =============================================================================
// Budget Tracking
// =============================================================================

export const MONTHLY_BUDGET_CENTS = 30000; // $300

export interface BudgetStatus {
  totalBudgetCents: number;
  spentCents: number;
  remainingCents: number;
  percentUsed: number;
  canGenerate: boolean;
}

/**
 * Check if API key is configured
 */
export function isOpenRouterConfigured(): boolean {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  return apiKey.startsWith('sk-') && apiKey.length > 10;
}

// =============================================================================
// Generic OpenRouter Call Function
// =============================================================================

export interface OpenRouterCallOptions {
  model: string;
  messages: { role: string; content: string }[];
  max_tokens?: number;
  temperature?: number;
  tools?: unknown[];
  tool_choice?: string;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      role: string;
      content: string;
      tool_calls?: {
        id: string;
        function: {
          name: string;
          arguments: string;
        };
      }[];
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generic OpenRouter API call function
 * Used by decision engine and other services
 */
export async function callOpenRouter(options: OpenRouterCallOptions): Promise<OpenRouterResponse> {
  const config = getOpenRouterConfig();

  if (!config.apiKey || !config.apiKey.startsWith('sk-')) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      max_tokens: options.max_tokens || 2000,
      temperature: options.temperature ?? 0.7,
      ...(options.tools && { tools: options.tools }),
      ...(options.tool_choice && { tool_choice: options.tool_choice }),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
  }

  return await response.json();
}
