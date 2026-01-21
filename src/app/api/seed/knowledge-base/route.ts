import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
  try {
    const results = {
      sneakers: 0,
      modelSpecs: 0,
      styleSlots: 0,
      competitors: 0,
      errors: [] as string[]
    };

    // Seed sneakers
    const sneakers = [
      { name: 'Air Jordan 1 Chicago', tier: 'grails', brand: 'Nike', notes: 'Classic red/white/black colorway, iconic silhouette' },
      { name: 'Air Jordan 1 Bred', tier: 'grails', brand: 'Nike', notes: 'Black/red banned colorway' },
      { name: 'Nike Cortez', tier: 'heat', brand: 'Nike', notes: 'LA/Chicano essential, vintage vibes' },
      { name: 'Adidas Superstar', tier: 'heat', brand: 'Adidas', notes: 'NYC hip-hop classic, shell toe' },
      { name: 'New Balance 550', tier: 'heat', brand: 'New Balance', notes: 'Versatile, trending, clean lines' },
      { name: 'Air Force 1 White', tier: 'heat', brand: 'Nike', notes: 'Universal streetwear staple' },
      { name: 'Nike Dunk Low', tier: 'heat', brand: 'Nike', notes: 'Skate heritage, colorway variety' },
      { name: 'Adidas Samba', tier: 'heat', brand: 'Adidas', notes: 'Soccer heritage, clean aesthetic' },
      { name: 'Converse Chuck 70', tier: 'staples', brand: 'Converse', notes: 'Timeless classic, versatile' },
      { name: 'Vans Old Skool', tier: 'staples', brand: 'Vans', notes: 'Skate culture icon' },
    ];

    for (const sneaker of sneakers) {
      const { error } = await supabase
        .from('sneakers')
        .upsert(sneaker, { onConflict: 'name' });

      if (error) {
        results.errors.push(`Sneaker ${sneaker.name}: ${error.message}`);
      } else {
        results.sneakers++;
      }
    }

    // Seed model specs
    const modelSpecs = [
      { name: 'Urban Male Athletic', gender: 'male', age_range: '22-28', build: 'athletic', ethnicity: 'Black', notes: 'Confident stance, street style' },
      { name: 'Urban Male Slim', gender: 'male', age_range: '25-32', build: 'slim', ethnicity: 'Latino', notes: 'Modern streetwear look' },
      { name: 'Urban Male Classic', gender: 'male', age_range: '28-35', build: 'average', ethnicity: 'White', notes: 'Clean cut, versatile' },
      { name: 'Urban Female Athletic', gender: 'female', age_range: '20-26', build: 'athletic', ethnicity: 'Black', notes: 'Strong presence, sporty' },
      { name: 'Urban Female Slim', gender: 'female', age_range: '22-28', build: 'slim', ethnicity: 'Asian', notes: 'Fashion-forward, editorial' },
      { name: 'Urban Female Curvy', gender: 'female', age_range: '24-30', build: 'curvy', ethnicity: 'Latina', notes: 'Confident, street style' },
    ];

    for (const model of modelSpecs) {
      const { error } = await supabase
        .from('model_specs')
        .upsert(model, { onConflict: 'name' });

      if (error) {
        results.errors.push(`Model ${model.name}: ${error.message}`);
      } else {
        results.modelSpecs++;
      }
    }

    // Seed style slots
    const styleSlots = [
      { name: 'Street Classic', description: 'Hoodie + jeans + clean sneakers', gender: 'unisex', vibe: 'casual', occasion: 'everyday' },
      { name: 'Athleisure', description: 'Hoodie + joggers + runners', gender: 'unisex', vibe: 'sporty', occasion: 'casual' },
      { name: 'Layered Street', description: 'Hoodie under jacket + cargo pants', gender: 'unisex', vibe: 'edgy', occasion: 'going out' },
      { name: 'Minimal Clean', description: 'Hoodie + tailored pants + low-tops', gender: 'unisex', vibe: 'minimal', occasion: 'smart casual' },
      { name: 'Full Street', description: 'Oversized hoodie + baggy jeans + high-tops', gender: 'unisex', vibe: 'bold', occasion: 'street' },
    ];

    for (const style of styleSlots) {
      const { error } = await supabase
        .from('style_slots')
        .upsert(style, { onConflict: 'name' });

      if (error) {
        results.errors.push(`Style ${style.name}: ${error.message}`);
      } else {
        results.styleSlots++;
      }
    }

    // Seed competitors
    const competitors = [
      { name: 'Eric Emanuel', category: 'shorts', price_range: '$90-150', target_demo: 'Sports/streetwear crossover', notes: 'Known for mesh shorts, NBA collaborations' },
      { name: 'Fear of God Essentials', category: 'basics', price_range: '$60-120', target_demo: 'Luxury streetwear seekers', notes: 'Minimal branding, neutral colors' },
      { name: 'Kith', category: 'full-line', price_range: '$80-300', target_demo: 'Sneakerheads, fashion-forward', notes: 'NYC-based, lots of collabs' },
      { name: 'Stüssy', category: 'full-line', price_range: '$50-150', target_demo: 'Skate/surf culture', notes: 'OG streetwear, global presence' },
      { name: 'Palace', category: 'full-line', price_range: '$60-200', target_demo: 'Skate culture, UK influence', notes: 'Tri-ferg logo, irreverent branding' },
    ];

    for (const competitor of competitors) {
      const { error } = await supabase
        .from('competitors')
        .upsert(competitor, { onConflict: 'name' });

      if (error) {
        results.errors.push(`Competitor ${competitor.name}: ${error.message}`);
      } else {
        results.competitors++;
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Knowledge base seeded: ${results.sneakers} sneakers, ${results.modelSpecs} models, ${results.styleSlots} styles, ${results.competitors} competitors`
    });

  } catch (error: any) {
    console.error('[Seed Knowledge Base] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check current knowledge base counts
export async function GET() {
  try {
    const [sneakers, modelSpecs, styleSlots, competitors, learnings] = await Promise.all([
      supabase.from('sneakers').select('id', { count: 'exact' }),
      supabase.from('model_specs').select('id', { count: 'exact' }),
      supabase.from('style_slots').select('id', { count: 'exact' }),
      supabase.from('competitors').select('id', { count: 'exact' }),
      supabase.from('learnings').select('id', { count: 'exact' })
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        sneakers: sneakers.count || 0,
        modelSpecs: modelSpecs.count || 0,
        styleSlots: styleSlots.count || 0,
        competitors: competitors.count || 0,
        learnings: learnings.count || 0
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
