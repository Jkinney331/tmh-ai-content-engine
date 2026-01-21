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

    // Seed sneakers - use only basic columns that exist
    const sneakers = [
      { name: 'Air Jordan 1 Chicago', tier: 'ultra_grail', brand: 'Jordan' },
      { name: 'Air Jordan 1 Bred', tier: 'ultra_grail', brand: 'Jordan' },
      { name: 'Nike Cortez', tier: 'certified_heat', brand: 'Nike' },
      { name: 'Adidas Superstar', tier: 'certified_heat', brand: 'Adidas' },
      { name: 'New Balance 550', tier: 'new_heat', brand: 'New Balance' },
      { name: 'Air Force 1 White', tier: 'heavy_heat', brand: 'Nike' },
      { name: 'Nike Dunk Low', tier: 'certified_heat', brand: 'Nike' },
      { name: 'Adidas Samba', tier: 'new_heat', brand: 'Adidas' },
      { name: 'Converse Chuck 70', tier: 'certified_heat', brand: 'Converse' },
      { name: 'Vans Old Skool', tier: 'certified_heat', brand: 'Vans' },
    ];

    // First check what sneakers already exist to avoid duplicates
    const { data: existingSneakers } = await supabase
      .from('sneakers')
      .select('name');
    const existingNames = new Set((existingSneakers || []).map((s: any) => s.name));

    for (const sneaker of sneakers) {
      if (existingNames.has(sneaker.name)) {
        continue; // Skip if already exists
      }
      const { error } = await supabase
        .from('sneakers')
        .insert(sneaker);

      if (error) {
        results.errors.push(`Sneaker ${sneaker.name}: ${error.message}`);
      } else {
        results.sneakers++;
      }
    }

    // Seed model specs - use only basic columns
    const modelSpecs = [
      { name: 'Urban Male Athletic', gender: 'male', age_range: '22-28', ethnicity: 'Black', build: 'Athletic' },
      { name: 'Urban Male Slim', gender: 'male', age_range: '25-32', ethnicity: 'Latino', build: 'Slim' },
      { name: 'Urban Male Classic', gender: 'male', age_range: '28-35', ethnicity: 'Mixed', build: 'Average' },
      { name: 'Urban Female Athletic', gender: 'female', age_range: '20-26', ethnicity: 'Black', build: 'Athletic' },
      { name: 'Urban Female Slim', gender: 'female', age_range: '22-28', ethnicity: 'Asian', build: 'Slim' },
      { name: 'Urban Female Curvy', gender: 'female', age_range: '24-30', ethnicity: 'Latina', build: 'Curvy' },
    ];

    const { data: existingModels } = await supabase
      .from('model_specs')
      .select('name');
    const existingModelNames = new Set((existingModels || []).map((m: any) => m.name));

    for (const model of modelSpecs) {
      if (existingModelNames.has(model.name)) {
        continue;
      }
      const { error } = await supabase
        .from('model_specs')
        .insert(model);

      if (error) {
        results.errors.push(`Model ${model.name}: ${error.message}`);
      } else {
        results.modelSpecs++;
      }
    }

    // Seed style slots - use only basic columns
    const styleSlots = [
      { slot_code: 'M1', slot_number: 1, gender: 'male', name: 'Street Classic', top: 'TMH Hoodie', bottom: 'Black Dickies' },
      { slot_code: 'M2', slot_number: 2, gender: 'male', name: 'Athleisure', top: 'TMH Hoodie', bottom: 'Joggers' },
      { slot_code: 'M3', slot_number: 3, gender: 'male', name: 'Layered Street', top: 'TMH Hoodie under jacket', bottom: 'Cargo pants' },
      { slot_code: 'F1', slot_number: 1, gender: 'female', name: 'Oversized Comfy', top: 'TMH Hoodie (oversized)', bottom: 'Bike shorts' },
      { slot_code: 'F2', slot_number: 2, gender: 'female', name: 'Streetwear Chic', top: 'TMH Cropped Hoodie', bottom: 'High-waist jeans' },
    ];

    const { data: existingStyles } = await supabase
      .from('style_slots')
      .select('slot_code');
    const existingSlotCodes = new Set((existingStyles || []).map((s: any) => s.slot_code));

    for (const style of styleSlots) {
      if (existingSlotCodes.has(style.slot_code)) {
        continue;
      }
      const { error } = await supabase
        .from('style_slots')
        .insert(style);

      if (error) {
        results.errors.push(`Style ${style.name}: ${error.message}`);
      } else {
        results.styleSlots++;
      }
    }

    // Seed competitors - use only basic columns
    const competitors = [
      { name: 'Supreme', tier: 'direct', price_range: '$150-400', target_demo: 'Hypebeasts, 18-35' },
      { name: 'Kith', tier: 'aspirational', price_range: '$150-500', target_demo: 'Fashion-conscious, 25-40' },
      { name: 'Stüssy', tier: 'adjacent', price_range: '$80-200', target_demo: 'Skaters, OG streetwear fans' },
      { name: 'Eric Emanuel', tier: 'adjacent', price_range: '$90-150', target_demo: 'Sports/streetwear crossover' },
      { name: 'Fear of God Essentials', tier: 'aspirational', price_range: '$60-120', target_demo: 'Luxury streetwear seekers' },
    ];

    const { data: existingCompetitors } = await supabase
      .from('competitors')
      .select('name');
    const existingCompNames = new Set((existingCompetitors || []).map((c: any) => c.name));

    for (const competitor of competitors) {
      if (existingCompNames.has(competitor.name)) {
        continue;
      }
      const { error } = await supabase
        .from('competitors')
        .insert(competitor);

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
