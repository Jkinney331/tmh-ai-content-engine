import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Default test configuration
const DEFAULT_CONFIG = {
  cities: ['London', 'Detroit', 'Chicago'],
  imagesPerCity: 2,
  videosPerCity: 1,
  autoApprove: true
};

// Image prompts per city
const getImagePrompts = (cityName: string, cityData: any) => [
  {
    type: 'product-shot',
    prompt: `Premium black hoodie with embroidered "${cityName}" text, floating against clean studio background, professional product photography, 4K quality`
  },
  {
    type: 'lifestyle',
    prompt: `Confident ${cityData?.demographics || 'diverse'} model wearing premium black hoodie with "${cityName}" embroidery, walking through iconic ${cityName} street scene, ${cityData?.landmarks?.[0] || 'urban landmark'} visible in background, golden hour lighting, streetwear photography style`
  }
];

// Video prompts per city
const getVideoPrompts = (cityName: string, cityData: any) => [
  {
    type: 'brand-video',
    prompt: `Cinematic slow-motion shot of model in premium black hoodie walking through ${cityName} streets, camera follows from behind then circles around to reveal "${cityName}" embroidered logo, urban streetwear aesthetic, professional cinematography`,
    duration: 8,
    resolution: '720p'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const config = { ...DEFAULT_CONFIG, ...body };

    const results = {
      citiesCreated: 0,
      citiesExisting: 0,
      researchCompleted: 0,
      imagesGenerated: 0,
      videosGenerated: 0,
      assetsApproved: 0,
      errors: [] as string[]
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Process each city
    for (const cityName of config.cities) {
      console.log(`[Seed] Processing city: ${cityName}`);

      // 1. Check if city exists
      const { data: existingCity } = await supabase
        .from('cities')
        .select('*')
        .eq('name', cityName)
        .single();

      let city = existingCity;

      // 2. Create city if doesn't exist
      if (!city) {
        const { data: newCity, error: cityError } = await supabase
          .from('cities')
          .insert({
            name: cityName,
            status: 'draft',
            nicknames: [],
            area_codes: [],
            visual_identity: {
              research_categories: {
                slang: true,
                landmarks: true,
                sports: true,
                culture: true,
                visualIdentity: true,
                areaCodes: true
              }
            },
            avoid: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (cityError) {
          results.errors.push(`Failed to create ${cityName}: ${cityError.message}`);
          continue;
        }

        city = newCity;
        results.citiesCreated++;

        // 3. Trigger research
        try {
          const researchResponse = await fetch(`${appUrl}/api/decision/research`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cityId: city.id, cityName })
          });

          if (researchResponse.ok) {
            results.researchCompleted++;
            // Update city status
            await supabase
              .from('cities')
              .update({ status: 'ready' })
              .eq('id', city.id);
          }
        } catch (e) {
          console.log(`[Seed] Research call failed for ${cityName}, continuing...`);
        }
      } else {
        results.citiesExisting++;
      }

      // 4. Generate images
      const imagePrompts = getImagePrompts(cityName, city);
      for (let i = 0; i < Math.min(config.imagesPerCity, imagePrompts.length); i++) {
        const promptData = imagePrompts[i];

        try {
          // Save to generated_content directly with mock/placeholder data
          const { data: imageRecord, error: imageError } = await supabase
            .from('generated_content')
            .insert({
              city_id: city.id,
              type: 'image',
              content_type: promptData.type,
              prompt: promptData.prompt,
              status: config.autoApprove ? 'approved' : 'pending',
              model_used: 'gpt-5-image',
              output_url: `https://placehold.co/1024x1024/1a1a2e/eee?text=${encodeURIComponent(cityName)}+${encodeURIComponent(promptData.type)}`,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (imageError) {
            results.errors.push(`Image insert failed for ${cityName}: ${imageError.message}`);
          } else {
            results.imagesGenerated++;
            if (config.autoApprove) {
              results.assetsApproved++;
            }
          }
        } catch (e: any) {
          results.errors.push(`Image generation failed for ${cityName}: ${e.message}`);
        }
      }

      // 5. Generate videos
      if (config.videosPerCity > 0) {
        const videoPrompts = getVideoPrompts(cityName, city);
        for (let i = 0; i < Math.min(config.videosPerCity, videoPrompts.length); i++) {
          const promptData = videoPrompts[i];

          try {
            // Save to generated_content directly with placeholder
            const { data: videoRecord, error: videoError } = await supabase
              .from('generated_content')
              .insert({
                city_id: city.id,
                type: 'video',
                content_type: promptData.type,
                prompt: promptData.prompt,
                status: config.autoApprove ? 'approved' : 'pending',
                model_used: 'sora-2',
                output_url: `https://placehold.co/1920x1080/1a1a2e/eee?text=${encodeURIComponent(cityName)}+Video`,
                created_at: new Date().toISOString()
              })
              .select()
              .single();

            if (videoError) {
              results.errors.push(`Video insert failed for ${cityName}: ${videoError.message}`);
            } else {
              results.videosGenerated++;
              if (config.autoApprove) {
                results.assetsApproved++;
              }
            }
          } catch (e: any) {
            results.errors.push(`Video generation failed for ${cityName}: ${e.message}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Test run complete. Created ${results.citiesCreated} cities (${results.citiesExisting} existing), generated ${results.imagesGenerated} images and ${results.videosGenerated} videos.`
    });

  } catch (error: any) {
    console.error('[Seed] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check current content counts
export async function GET() {
  try {
    const [cities, images, videos, approved] = await Promise.all([
      supabase.from('cities').select('id', { count: 'exact' }),
      supabase.from('generated_content').select('id', { count: 'exact' }).eq('type', 'image'),
      supabase.from('generated_content').select('id', { count: 'exact' }).eq('type', 'video'),
      supabase.from('generated_content').select('id', { count: 'exact' }).eq('status', 'approved')
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        cities: cities.count || 0,
        images: images.count || 0,
        videos: videos.count || 0,
        approved: approved.count || 0
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
