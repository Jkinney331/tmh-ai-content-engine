import { NextResponse } from 'next/server'

// Diagnostic endpoint to check environment configuration
// Visit: /api/debug/env
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),

    // Supabase
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...',
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) + '...',
      serviceKey: !!process.env.SUPABASE_SERVICE_KEY,
    },

    // OpenRouter (main AI gateway)
    openRouter: {
      apiKey: !!process.env.OPENROUTER_API_KEY,
      keyFormat: process.env.OPENROUTER_API_KEY?.startsWith('sk-or-') ? 'valid format (sk-or-...)' : 'invalid or missing',
      keyLength: process.env.OPENROUTER_API_KEY?.length || 0,
    },

    // OpenAI (for Sora video)
    openai: {
      apiKey: !!process.env.OPENAI_API_KEY,
      keyFormat: process.env.OPENAI_API_KEY?.startsWith('sk-') ? 'valid format (sk-...)' : 'invalid or missing',
    },

    // WaveSpeed (for VEO 3 video)
    wavespeed: {
      apiKey: !!process.env.WAVESPEED_API_KEY,
    },

    // Anthropic (for captions)
    anthropic: {
      apiKey: !!process.env.ANTHROPIC_API_KEY,
      keyFormat: process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-') ? 'valid format (sk-ant-...)' : 'invalid or missing',
    },

    // App config
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || 'not set (will use localhost)',
      name: process.env.NEXT_PUBLIC_APP_NAME || 'not set',
    },

    // Summary
    criticalIssues: [] as string[],
    warnings: [] as string[],
  }

  // Check for critical issues
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    checks.criticalIssues.push('NEXT_PUBLIC_SUPABASE_URL is missing - database will not work')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    checks.criticalIssues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing - database will not work')
  }
  if (!process.env.OPENROUTER_API_KEY) {
    checks.criticalIssues.push('OPENROUTER_API_KEY is missing - AI generation and research will not work')
  } else if (!process.env.OPENROUTER_API_KEY.startsWith('sk-or-')) {
    checks.criticalIssues.push('OPENROUTER_API_KEY has wrong format - should start with sk-or-')
  }

  // Check for warnings
  if (!process.env.SUPABASE_SERVICE_KEY) {
    checks.warnings.push('SUPABASE_SERVICE_KEY not set - some backend operations may fail')
  }
  if (!process.env.OPENAI_API_KEY) {
    checks.warnings.push('OPENAI_API_KEY not set - Sora video generation will not work')
  }
  if (!process.env.WAVESPEED_API_KEY) {
    checks.warnings.push('WAVESPEED_API_KEY not set - VEO 3 video generation will not work')
  }

  return NextResponse.json(checks, {
    status: checks.criticalIssues.length > 0 ? 500 : 200
  })
}
