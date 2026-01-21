import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY not configured',
      }, { status: 500 });
    }

    // Check available models
    const modelsResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!modelsResponse.ok) {
      const error = await modelsResponse.json();
      return NextResponse.json({
        success: false,
        error: error.error?.message || `API error: ${modelsResponse.status}`,
      }, { status: modelsResponse.status });
    }

    const models = await modelsResponse.json();

    // Filter for relevant models (sora, gpt-image, dall-e, gpt-4)
    const relevantModels = models.data?.filter((m: { id: string }) =>
      m.id.includes('sora') ||
      m.id.includes('gpt-image') ||
      m.id.includes('dall-e') ||
      m.id.includes('gpt-4') ||
      m.id.includes('o1') ||
      m.id.includes('o3')
    ) || [];

    const soraModels = relevantModels.filter((m: { id: string }) => m.id.includes('sora'));
    const imageModels = relevantModels.filter((m: { id: string }) =>
      m.id.includes('gpt-image') || m.id.includes('dall-e')
    );

    return NextResponse.json({
      success: true,
      totalModels: models.data?.length || 0,
      relevantModels: relevantModels.map((m: { id: string }) => m.id).sort(),
      soraModels: soraModels.map((m: { id: string }) => m.id),
      imageModels: imageModels.map((m: { id: string }) => m.id),
      hasSoraAccess: soraModels.length > 0,
      hasImageAccess: imageModels.length > 0,
      allModels: models.data?.map((m: { id: string }) => m.id).sort(),
    });
  } catch (error) {
    console.error('OpenAI test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
