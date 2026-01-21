import { NextResponse } from 'next/server'

// Test OpenRouter connectivity
// Visit: /api/debug/test-openrouter
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'OPENROUTER_API_KEY is not set',
      fix: 'Add OPENROUTER_API_KEY to your Vercel environment variables'
    }, { status: 500 })
  }

  try {
    // Make a minimal API call to verify the key works
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({
        success: false,
        error: `OpenRouter API returned ${response.status}`,
        details: error,
        fix: 'Check that your OPENROUTER_API_KEY is valid and has credits'
      }, { status: 500 })
    }

    const data = await response.json()

    // Check if key models are available
    const modelIds = data.data?.map((m: any) => m.id) || []
    const requiredModels = [
      'perplexity/sonar-pro',
      'anthropic/claude-sonnet-4',
    ]

    const availableModels = requiredModels.filter(m => modelIds.includes(m))
    const missingModels = requiredModels.filter(m => !modelIds.includes(m))

    return NextResponse.json({
      success: true,
      message: 'OpenRouter API key is valid',
      totalModels: modelIds.length,
      requiredModelsAvailable: availableModels,
      requiredModelsMissing: missingModels,
      note: missingModels.length > 0
        ? 'Some models may not be available. Check OpenRouter dashboard.'
        : 'All required models are available'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      fix: 'Check network connectivity and API key validity'
    }, { status: 500 })
  }
}
