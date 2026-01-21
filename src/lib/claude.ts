import Anthropic from '@anthropic-ai/sdk';

interface ClaudeOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

interface ClaudeResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Generate content using Claude API
 * @param prompt - The user prompt to send to Claude
 * @param options - Optional configuration for the request
 * @returns Parsed response content from Claude
 */
export async function claudeGenerate(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<ClaudeResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const {
    model = 'claude-3-haiku-20240307',
    temperature = 0.7,
    maxTokens = 1024,
    systemPrompt = 'You are a helpful AI assistant specializing in creating content for "The Milkman\'s Hustle" project.'
  } = options;

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract the text content from the response
    const content = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return {
      content,
      usage: message.usage ? {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens
      } : undefined
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error: ${error.message} (Status: ${error.status})`);
    } else if (error instanceof Error) {
      throw new Error(`Failed to generate content: ${error.message}`);
    } else {
      throw new Error('An unexpected error occurred while generating content');
    }
  }
}

/**
 * Generate structured JSON content using Claude
 * @param prompt - The user prompt requesting JSON output
 * @param options - Optional configuration for the request
 * @returns Parsed JSON response from Claude
 */
export async function claudeGenerateJSON<T = any>(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<T> {
  const jsonSystemPrompt = `${options.systemPrompt || 'You are a helpful AI assistant.'} Always respond with valid JSON only, no additional text or markdown formatting.`;

  const response = await claudeGenerate(prompt, {
    ...options,
    systemPrompt: jsonSystemPrompt
  });

  try {
    return JSON.parse(response.content) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${response.content}`);
  }
}

/**
 * Generate content with streaming support
 * @param prompt - The user prompt to send to Claude
 * @param options - Optional configuration for the request
 * @param onChunk - Callback function called for each streamed chunk
 */
export async function claudeGenerateStream(
  prompt: string,
  options: ClaudeOptions = {},
  onChunk: (chunk: string) => void
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const {
    model = 'claude-3-haiku-20240307',
    temperature = 0.7,
    maxTokens = 1024,
    systemPrompt = 'You are a helpful AI assistant specializing in creating content for "The Milkman\'s Hustle" project.'
  } = options;

  let fullContent = '';

  try {
    const stream = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: true
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text;
        fullContent += text;
        onChunk(text);
      }
    }

    return fullContent;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error: ${error.message} (Status: ${error.status})`);
    } else if (error instanceof Error) {
      throw new Error(`Failed to generate content: ${error.message}`);
    } else {
      throw new Error('An unexpected error occurred while generating content');
    }
  }
}