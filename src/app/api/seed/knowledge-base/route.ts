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

    // Seed sneakers - matching actual schema: name, tier, brand, colorway, city_relevance, notes, is_active
    const sneakers = [
      { name: 'Air Jordan 1 Chicago', tier: 'ultra_grail', brand: 'Jordan', colorway: 'Chicago Red/White/Black', city_relevance: ['Chicago', 'New York'], notes: 'The OG, classic silhouette', is_active: true },
      { name: 'Air Jordan 1 Bred', tier: 'ultra_grail', brand: 'Jordan', colorway: 'Black/Red', city_relevance: ['Atlanta', 'Detroit'], notes: 'Banned colorway', is_active: true },
      { name: 'Nike Cortez', tier: 'certified_heat', brand: 'Nike', colorway: 'White/Red/Blue', city_relevance: ['Los Angeles', 'Oakland'], notes: 'West Coast essential, LA staple', is_active: true },
      { name: 'Adidas Superstar', tier: 'certified_heat', brand: 'Adidas', colorway: 'White/Black', city_relevance: ['New York', 'Detroit'], notes: 'NYC hip-hop classic, shell toe', is_active: true },
      { name: 'New Balance 550', tier: 'new_heat', brand: 'New Balance', colorway: 'White/Green', city_relevance: ['Boston', 'New York'], notes: 'Versatile, trending, clean lines', is_active: true },
      { name: 'Air Force 1 White', tier: 'heavy_heat', brand: 'Nike', colorway: 'Triple White', city_relevance: ['New York', 'Baltimore', 'DC'], notes: 'Universal streetwear staple', is_active: true },
      { name: 'Nike Dunk Low', tier: 'certified_heat', brand: 'Nike', colorway: 'Various', city_relevance: ['New York', 'Chicago', 'LA'], notes: 'Skate heritage, colorway variety', is_active: true },
      { name: 'Adidas Samba', tier: 'new_heat', brand: 'Adidas', colorway: 'White/Black/Gum', city_relevance: ['London', 'Manchester'], notes: 'Soccer heritage, clean aesthetic', is_active: true },
      { name: 'Converse Chuck 70', tier: 'certified_heat', brand: 'Converse', colorway: 'Black/White', city_relevance: ['New York', 'London'], notes: 'Timeless classic, versatile', is_active: true },
      { name: 'Vans Old Skool', tier: 'certified_heat', brand: 'Vans', colorway: 'Black/White', city_relevance: ['Los Angeles', 'San Francisco'], notes: 'Skate culture icon', is_active: true },
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

    // Seed model specs - matching actual schema: name, gender, age_range, ethnicity, build, style_notes, city_id, is_active
    const modelSpecs = [
      { name: 'Urban Male Athletic', gender: 'male', age_range: '22-28', ethnicity: 'Black', build: 'Athletic', style_notes: 'Confident stance, street style native', is_active: true },
      { name: 'Urban Male Slim', gender: 'male', age_range: '25-32', ethnicity: 'Latino', build: 'Slim', style_notes: 'Modern streetwear look, relaxed', is_active: true },
      { name: 'Urban Male Classic', gender: 'male', age_range: '28-35', ethnicity: 'Mixed', build: 'Average', style_notes: 'Clean cut, versatile aesthetic', is_active: true },
      { name: 'Urban Female Athletic', gender: 'female', age_range: '20-26', ethnicity: 'Black', build: 'Athletic', style_notes: 'Strong presence, sporty vibes', is_active: true },
      { name: 'Urban Female Slim', gender: 'female', age_range: '22-28', ethnicity: 'Asian', build: 'Slim', style_notes: 'Fashion-forward, editorial ready', is_active: true },
      { name: 'Urban Female Curvy', gender: 'female', age_range: '24-30', ethnicity: 'Latina', build: 'Curvy', style_notes: 'Confident, street style energy', is_active: true },
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

    // Seed style slots - matching actual schema with slot_code, slot_number, gender, name, etc.
    const styleSlots = [
      { slot_code: 'M1', slot_number: 1, gender: 'male', name: 'Street Classic', top: 'TMH Hoodie', bottom: 'Black Dickies', sneaker_vibe: 'Classic white', pants_style: 'Relaxed fit', chain_style: 'Cuban link', accessories: ['Watch', 'Chain'], best_for: 'Everyday', mood: 'Relaxed, confident', is_active: true },
      { slot_code: 'M2', slot_number: 2, gender: 'male', name: 'Athleisure', top: 'TMH Hoodie', bottom: 'Joggers', sneaker_vibe: 'Running shoes', pants_style: 'Slim joggers', chain_style: null, accessories: ['Cap', 'Watch'], best_for: 'Casual', mood: 'Sporty, comfortable', is_active: true },
      { slot_code: 'M3', slot_number: 3, gender: 'male', name: 'Layered Street', top: 'TMH Hoodie under jacket', bottom: 'Cargo pants', sneaker_vibe: 'High-tops', pants_style: 'Relaxed cargo', chain_style: 'Pendant', accessories: ['Rings', 'Beanie'], best_for: 'Going out', mood: 'Edgy, layered', is_active: true },
      { slot_code: 'F1', slot_number: 1, gender: 'female', name: 'Oversized Comfy', top: 'TMH Hoodie (oversized)', bottom: 'Bike shorts', sneaker_vibe: 'Clean low-tops', pants_style: 'Fitted shorts', chain_style: null, accessories: ['Hoop earrings'], best_for: 'Casual', mood: 'Cozy, cute', is_active: true },
      { slot_code: 'F2', slot_number: 2, gender: 'female', name: 'Streetwear Chic', top: 'TMH Cropped Hoodie', bottom: 'High-waist jeans', sneaker_vibe: 'Trendy sneakers', pants_style: 'High-waist skinny', chain_style: 'Layered', accessories: ['Layered necklaces', 'Mini bag'], best_for: 'Going out', mood: 'Fashion-forward', is_active: true },
    ];

    for (const style of styleSlots) {
      const { error } = await supabase
        .from('style_slots')
        .upsert(style, { onConflict: 'slot_code' });

      if (error) {
        results.errors.push(`Style ${style.name}: ${error.message}`);
      } else {
        results.styleSlots++;
      }
    }

    // Seed competitors - matching actual schema: name, tier, price_range, target_demo, strengths, weaknesses, key_products, social_presence, notes
    const competitors = [
      { name: 'Supreme', tier: 'direct', price_range: '$150-400', target_demo: 'Hypebeasts, 18-35', strengths: ['Brand recognition', 'Hype machine', 'Limited drops'], weaknesses: ['Expensive resale', 'NYC-centric'], key_products: ['Box logo hoodie', 'Tees'], social_presence: { instagram: '@supremenewyork' }, notes: 'The benchmark for streetwear hype' },
      { name: 'Kith', tier: 'aspirational', price_range: '$150-500', target_demo: 'Fashion-conscious, 25-40', strengths: ['Quality materials', 'Retail experience', 'Collaborations'], weaknesses: ['Very expensive', 'NYC-focused'], key_products: ['Hoodies', 'Collaborations'], social_presence: { instagram: '@kith' }, notes: 'Elevated streetwear' },
      { name: 'Stüssy', tier: 'adjacent', price_range: '$80-200', target_demo: 'Skaters, OG streetwear fans', strengths: ['Heritage brand', 'Global presence'], weaknesses: ['Less hype than before'], key_products: ['Logo tees', 'Hoodies'], social_presence: { instagram: '@stussy' }, notes: 'OG streetwear, global reach' },
      { name: 'Eric Emanuel', tier: 'adjacent', price_range: '$90-150', target_demo: 'Sports/streetwear crossover', strengths: ['NBA collaborations', 'Unique product'], weaknesses: ['Limited range'], key_products: ['Mesh shorts'], social_presence: { instagram: '@ericemanuell' }, notes: 'Known for mesh shorts' },
      { name: 'Fear of God Essentials', tier: 'aspirational', price_range: '$60-120', target_demo: 'Luxury streetwear seekers', strengths: ['Minimal branding', 'Quality basics'], weaknesses: ['Limited variety'], key_products: ['Hoodies', 'Sweats'], social_presence: { instagram: '@fearofgod' }, notes: 'Elevated basics' },
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
