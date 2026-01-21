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

// Image generation models - Updated to verified 2026 model IDs
export const TMH_IMAGE_MODELS = {
  'gpt-5-image': {
    id: 'openai/gpt-5-image',
    name: 'GPT-5 Image',
    description: 'Best quality - recommended for final assets',
    avgCostCents: 4,
    avgLatencyMs: 5000,
  },
  'gpt-5-image-mini': {
    id: 'openai/gpt-5-image-mini',
    name: 'GPT-5 Image Mini',
    description: 'Fast iteration, lower cost',
    avgCostCents: 2,
    avgLatencyMs: 3000,
  },
  'gemini-flash': {
    id: 'google/gemini-2.5-flash-image',
    name: 'Gemini Flash',
    description: 'Google model - good for variations',
    avgCostCents: 3,
    avgLatencyMs: 4000,
  },
  'gemini-pro': {
    id: 'google/gemini-3-pro-image-preview',
    name: 'Gemini Pro',
    description: 'Google pro model - highest quality',
    avgCostCents: 5,
    avgLatencyMs: 6000,
  },
} as const;

// Video generation models - Updated to verified 2026 model IDs
export const TMH_VIDEO_MODELS = {
  'sora-2': {
    id: 'openai/sora-2',
    name: 'Sora 2',
    description: 'Fast, cost-effective video generation',
    avgCostCents: 20,
    avgLatencyMs: 15000,
  },
  'sora-2-pro': {
    id: 'openai/sora-2-pro',
    name: 'Sora 2 Pro',
    description: 'Higher quality, better motion',
    avgCostCents: 40,
    avgLatencyMs: 20000,
  },
  'veo-3': {
    id: 'google/veo-3',
    name: 'VEO 3',
    description: 'Google video model via WaveSpeed',
    avgCostCents: 30,
    avgLatencyMs: 18000,
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
    id: 'gpt5mini-sora2',
    imageModel: 'gpt-5-image-mini',
    videoModel: 'sora-2',
    name: 'Fast Pipeline',
    bestFor: 'Quick iterations, social content',
    estimatedCostCents: 22,
    estimatedLatencyMs: 18000,
  },
  {
    id: 'gpt5-sora2',
    imageModel: 'gpt-5-image',
    videoModel: 'sora-2',
    name: 'Standard Pipeline',
    bestFor: 'Quality video from GPT-5 images',
    estimatedCostCents: 24,
    estimatedLatencyMs: 20000,
  },
  {
    id: 'gpt5-sora2pro',
    imageModel: 'gpt-5-image',
    videoModel: 'sora-2-pro',
    name: 'Premium Pipeline',
    bestFor: 'Highest quality, cinematic content',
    estimatedCostCents: 44,
    estimatedLatencyMs: 25000,
  },
  {
    id: 'gemini-veo3',
    imageModel: 'gemini-flash',
    videoModel: 'veo-3',
    name: 'Google Pipeline',
    bestFor: 'Alternative provider, good for variety',
    estimatedCostCents: 33,
    estimatedLatencyMs: 22000,
  },
  {
    id: 'geminipro-veo3',
    imageModel: 'gemini-pro',
    videoModel: 'veo-3',
    name: 'Google Premium',
    bestFor: 'Highest quality Google stack',
    estimatedCostCents: 35,
    estimatedLatencyMs: 24000,
  },
];

// Static image-only pipelines
export const TMH_IMAGE_PIPELINES: VideoPipeline[] = [
  {
    id: 'gpt5-mini-only',
    imageModel: 'gpt-5-image-mini',
    videoModel: null,
    name: 'GPT-5 Mini (Static)',
    bestFor: 'Fast iteration, drafts',
    estimatedCostCents: 2,
    estimatedLatencyMs: 3000,
  },
  {
    id: 'gpt5-only',
    imageModel: 'gpt-5-image',
    videoModel: null,
    name: 'GPT-5 Image (Static)',
    bestFor: 'High-quality product shots',
    estimatedCostCents: 4,
    estimatedLatencyMs: 5000,
  },
  {
    id: 'gemini-flash-only',
    imageModel: 'gemini-flash',
    videoModel: null,
    name: 'Gemini Flash (Static)',
    bestFor: 'Fast variations',
    estimatedCostCents: 3,
    estimatedLatencyMs: 4000,
  },
  {
    id: 'gemini-pro-only',
    imageModel: 'gemini-pro',
    videoModel: null,
    name: 'Gemini Pro (Static)',
    bestFor: 'Premium quality images',
    estimatedCostCents: 5,
    estimatedLatencyMs: 6000,
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
  product_gif: ['gpt5mini-sora2', 'gpt5-sora2'],
  lifestyle_clip: ['gemini-veo3', 'gpt5-sora2', 'gpt5-sora2pro'],
  ad_video: ['gpt5-sora2pro', 'gpt5-sora2', 'geminipro-veo3'],
  social_short: ['gpt5mini-sora2', 'gemini-veo3'],
  product_shot: ['gpt5-mini-only', 'gpt5-only', 'gemini-flash-only'],
  design_concept: ['gpt5-mini-only', 'gpt5-only', 'gemini-pro-only'],
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
  modelKey: keyof typeof TMH_IMAGE_MODELS = 'gpt-5-image'
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
