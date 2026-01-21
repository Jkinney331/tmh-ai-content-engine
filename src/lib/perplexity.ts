interface PerplexitySearchOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface PerplexityError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export async function perplexitySearch(
  query: string,
  options: PerplexitySearchOptions = {}
): Promise<PerplexityResponse | PerplexityError> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return {
      error: {
        message: 'PERPLEXITY_API_KEY environment variable is not set',
        type: 'configuration_error',
        code: 'missing_api_key'
      }
    };
  }

  const {
    model = 'sonar-small-online',
    temperature = 0.2,
    max_tokens = 1024
  } = options;

  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant that provides accurate and detailed information about cities, neighborhoods, and local trends.'
    },
    {
      role: 'user',
      content: query
    }
  ];

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: {
          message: errorData.error?.message || `API request failed with status ${response.status}`,
          type: errorData.error?.type || 'api_error',
          code: errorData.error?.code || response.status.toString()
        }
      };
    }

    const data: PerplexityResponse = await response.json();
    return data;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      error: {
        message: `Failed to fetch from Perplexity API: ${errorMessage}`,
        type: 'network_error',
        code: 'fetch_failed'
      }
    };
  }
}

export function isPerplexityError(
  response: PerplexityResponse | PerplexityError
): response is PerplexityError {
  return 'error' in response;
}

export async function searchCityInfo(city: string, topic: string): Promise<string | null> {
  const query = `Provide detailed information about ${topic} in ${city}. Include current trends, statistics, and notable details.`;

  const response = await perplexitySearch(query);

  if (isPerplexityError(response)) {
    console.error('Perplexity API error:', response.error);
    return null;
  }

  return response.choices[0]?.message?.content || null;
}

export async function searchNeighborhoodTrends(
  city: string,
  neighborhood: string
): Promise<string | null> {
  const query = `What are the current trends, demographics, and notable characteristics of the ${neighborhood} neighborhood in ${city}? Include information about local businesses, culture, and recent developments.`;

  const response = await perplexitySearch(query, {
    temperature: 0.3,
    max_tokens: 1500
  });

  if (isPerplexityError(response)) {
    console.error('Perplexity API error:', response.error);
    return null;
  }

  return response.choices[0]?.message?.content || null;
}

export async function searchLocalEvents(
  city: string,
  timeframe: string = 'upcoming'
): Promise<string | null> {
  const query = `What are the ${timeframe} events, festivals, and activities happening in ${city}? Include dates, locations, and brief descriptions.`;

  const response = await perplexitySearch(query, {
    temperature: 0.2,
    max_tokens: 2000
  });

  if (isPerplexityError(response)) {
    console.error('Perplexity API error:', response.error);
    return null;
  }

  return response.choices[0]?.message?.content || null;
}