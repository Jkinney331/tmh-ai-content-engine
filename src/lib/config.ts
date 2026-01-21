/**
 * Environment configuration and validation
 */

export interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
    isConfigured: boolean;
  };
  openRouter: {
    apiKey: string;
    isConfigured: boolean;
  };
  app: {
    url: string;
    name: string;
  };
}

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const placeholders = [
    'your-project',
    'placeholder',
    'your-anon-key',
    'xxx',
    'your_',
    'add-your',
  ];
  return placeholders.some(p => value.toLowerCase().includes(p));
}

export function getEnvConfig(): EnvConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const openRouterKey = process.env.OPENROUTER_API_KEY || '';

  return {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      isConfigured: !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey),
    },
    openRouter: {
      apiKey: openRouterKey,
      isConfigured: !isPlaceholder(openRouterKey) && openRouterKey.startsWith('sk-'),
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      name: process.env.NEXT_PUBLIC_APP_NAME || 'TMH AI Content Engine',
    },
  };
}

export function isSupabaseConfigured(): boolean {
  return getEnvConfig().supabase.isConfigured;
}

export function isOpenRouterConfigured(): boolean {
  return getEnvConfig().openRouter.isConfigured;
}

/**
 * Get missing configuration items for display
 */
export function getMissingConfig(): string[] {
  const config = getEnvConfig();
  const missing: string[] = [];

  if (!config.supabase.isConfigured) {
    missing.push('Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }

  if (!config.openRouter.isConfigured) {
    missing.push('OpenRouter (OPENROUTER_API_KEY)');
  }

  return missing;
}
