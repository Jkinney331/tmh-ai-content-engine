import { createClient } from '@supabase/supabase-js';
import { perplexitySearch, isPerplexityError } from './perplexity';
import { claudeGenerateJSON } from './claude';
import { callOpenRouter } from './openrouter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-key';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface ResearchCategory {
  name: string;
  keywords: string[];
}

interface CityElement {
  element_type: 'slang' | 'landmark' | 'sport' | 'cultural';
  element_key: string;
  element_value: Record<string, any>;
  status: 'approved' | 'rejected' | 'pending';
  notes?: string;
}

interface ResearchResult {
  cityId: string;
  cityName: string;
  elements: CityElement[];
  raw_research: string;
  synthesis: string;
  timestamp: string;
}

interface PerplexityResearchData {
  query: string;
  response: string;
  category: string;
}

interface ClaudeSynthesisResult {
  elements: CityElement[];
  summary: string;
  confidence_scores: Record<string, number>;
}

/**
 * Validate element counts meet minimum requirements
 */
function validateElementCounts(elements: CityElement[]) {
  const counts = {
    slang: 0,
    landmark: 0,
    sport: 0,
    cultural: 0
  };

  elements.forEach(element => {
    if (element.element_type in counts) {
      counts[element.element_type as keyof typeof counts]++;
    }
  });

  return {
    slang: counts.slang,
    landmark: counts.landmark,
    sport: counts.sport,
    cultural: counts.cultural,
    isValid: counts.slang >= 5 && counts.landmark >= 5 && counts.sport >= 3
  };
}

/**
 * Run comprehensive city research using Perplexity and Claude
 * @param cityId - The UUID of the city
 * @param name - The name of the city
 * @param categories - Array of research categories (e.g., ['slang', 'landmarks', 'sports'])
 * @param customPrompt - Optional custom research prompt
 * @returns Structured research results matching city_elements schema
 */
export async function runCityResearch(
  cityId: string,
  name: string,
  categories: string[] = ['slang', 'landmark', 'sport', 'cultural'],
  customPrompt?: string
): Promise<ResearchResult> {
  console.log(`Starting research for ${name} (${cityId})`);

  try {
    // Step 1: Update city status to indicate research is in progress
    await updateCityStatus(cityId, 'active');

    // Step 2: Prepare category-specific queries
    const categoryMap: Record<string, ResearchCategory> = {
      slang: {
        name: 'Local Slang & Expressions',
        keywords: ['local slang', 'colloquialisms', 'street language', 'common phrases', 'nicknames']
      },
      landmark: {
        name: 'Landmarks & Notable Places',
        keywords: ['famous landmarks', 'iconic buildings', 'historic sites', 'tourist attractions', 'monuments']
      },
      sport: {
        name: 'Sports Teams & Culture',
        keywords: ['professional sports teams', 'local teams', 'sports venues', 'fan culture', 'sports history']
      },
      cultural: {
        name: 'Cultural Elements',
        keywords: ['music scene', 'art movements', 'food culture', 'festivals', 'traditions', 'local cuisine']
      }
    };

    // Step 3: Execute Perplexity searches for each category
    const perplexityResults: PerplexityResearchData[] = [];
    const hasPerplexityKey = Boolean(process.env.PERPLEXITY_API_KEY);
    const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);
    const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY);

    for (const category of categories) {
      const categoryInfo = categoryMap[category];
      if (!categoryInfo) {
        console.warn(`Unknown category: ${category}, skipping...`);
        continue;
      }

      const query = customPrompt
        ? `${customPrompt} Focus on ${categoryInfo.name} in ${name}.`
        : `Research ${categoryInfo.name} in ${name}. Include specific examples of ${categoryInfo.keywords.join(', ')}. Provide detailed information with context and significance.`;

      console.log(`Researching ${category} for ${name}...`);

      let content: string | undefined;
      if (hasPerplexityKey) {
        const perplexityResponse = await perplexitySearch(query, {
          model: 'sonar-small-online',
          temperature: 0.3,
          max_tokens: 2000
        });

        if (isPerplexityError(perplexityResponse)) {
          console.error(`Perplexity error for ${category}:`, perplexityResponse.error);
        } else {
          content = perplexityResponse.choices[0]?.message?.content;
        }
      }

      if (!content && hasOpenRouterKey) {
        const openRouterResponse = await callOpenRouter({
          model: 'perplexity/sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a cultural research assistant specializing in urban fashion and city-specific elements.'
            },
            { role: 'user', content: query }
          ],
          max_tokens: 2000,
          temperature: 0.3
        });
        content = openRouterResponse.choices[0]?.message?.content;
      }
      if (content) {
        perplexityResults.push({
          query,
          response: content,
          category
        });
      }
    }

    // Step 4: Synthesize results with Claude
    const synthesisPrompt = `
You are analyzing research data about ${name} to extract structured city elements.

Research Data:
${perplexityResults.map(r => `
Category: ${r.category}
Research: ${r.response}
`).join('\n---\n')}

Please analyze this research and extract specific city elements.

MINIMUM REQUIREMENTS:
- At least 5 slang terms
- At least 5 landmarks
- At least 3 sports teams
- Additional cultural elements as found

For each element, determine:
1. The element type (slang, landmark, sport, or cultural)
2. A unique key identifier (lowercase, underscore-separated)
3. Detailed JSON value with relevant properties
4. A confidence-based status (approved for high confidence, pending for medium, rejected for low/unreliable)
5. Brief notes explaining the significance

Return a JSON object with the following structure:
{
  "elements": [
    {
      "element_type": "slang" | "landmark" | "sport" | "cultural",
      "element_key": "unique_key", // MUST be lowercase with underscores, e.g., "the_d", "hart_plaza", "red_wings"
      "element_value": {
        // Type-specific properties
        // For slang: term, meaning, usage, popularity
        // For landmark: name, type, significance, year_built (if applicable)
        // For sport: team, sport, league, venue, achievements
        // For cultural: name, type, significance, details
      },
      "status": "approved" | "pending" | "rejected", // Use "pending" unless very confident
      "notes": "Brief explanation"
    }
  ],
  "summary": "Overall synthesis of the research",
  "confidence_scores": {
    "slang": 0.0-1.0,
    "landmark": 0.0-1.0,
    "sport": 0.0-1.0,
    "cultural": 0.0-1.0
  }
}

IMPORTANT:
- element_key MUST be unique within each type for the city
- element_key MUST be lowercase with underscores (e.g., "joe_louis_arena", "whats_good", "pistons")
- Default to status="pending" unless you have very high confidence

Focus on accuracy and local authenticity. Only mark as "approved" if you have high confidence in the information.
`;

    console.log(`Synthesizing research with Claude for ${name}...`);

    let synthesisResult: ClaudeSynthesisResult;
    if (hasAnthropicKey) {
      synthesisResult = await claudeGenerateJSON<ClaudeSynthesisResult>(
        synthesisPrompt,
        {
          model: 'claude-3-haiku-20240307',
          temperature: 0.3,
          maxTokens: 4000,
          systemPrompt: 'You are an expert research analyst specializing in urban culture and city-specific elements. Ensure you extract AT LEAST 5 slang terms, 5 landmarks, and 3 sports teams from the research data.'
        }
      );
    } else if (hasOpenRouterKey) {
      const openRouterResponse = await callOpenRouter({
        model: 'anthropic/claude-3-5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are an expert research analyst specializing in urban culture and city-specific elements. Ensure you extract AT LEAST 5 slang terms, 5 landmarks, and 3 sports teams from the research data.'
          },
          { role: 'user', content: synthesisPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.3
      });

      const raw = openRouterResponse.choices[0]?.message?.content || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('OpenRouter synthesis did not return JSON');
      }
      synthesisResult = JSON.parse(jsonMatch[0]) as ClaudeSynthesisResult;
    } else {
      throw new Error('Research requires PERPLEXITY_API_KEY or OPENROUTER_API_KEY for research, and ANTHROPIC_API_KEY or OPENROUTER_API_KEY for synthesis.');
    }

    // Validate minimum requirements
    const elementCounts = validateElementCounts(synthesisResult.elements);
    if (!elementCounts.isValid) {
      console.warn(`Insufficient elements found for ${name}:`, elementCounts);
      // Enhance the synthesis with additional prompting if needed
      if (elementCounts.slang < 5 || elementCounts.landmark < 5 || elementCounts.sport < 3) {
        console.log('Attempting to extract additional elements...');
        // The existing synthesis will be used but with a warning
      }
    }

    // Step 5: Store elements in database
    console.log(`Storing ${synthesisResult.elements.length} elements for ${name}...`);

    // Track successful inserts
    let successfulInserts = 0;
    const failedInserts: string[] = [];

    for (const element of synthesisResult.elements) {
      try {
        // Ensure status defaults to 'pending' unless explicitly set to 'approved'
        const elementStatus = element.status === 'approved' && element.element_value ? 'approved' : 'pending';

        const { error } = await supabaseAdmin
          .from('city_elements')
          .upsert({
            city_id: cityId,
            element_type: element.element_type,
            element_key: element.element_key,
            element_value: element.element_value,
            status: elementStatus, // Use validated status
            notes: element.notes || `Auto-generated from ${name} research`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any, {
            onConflict: 'city_id,element_type,element_key'
          });

        if (error) {
          console.error(`Error storing element ${element.element_key}:`, error);
          failedInserts.push(element.element_key);
        } else {
          successfulInserts++;
        }
      } catch (err) {
        console.error(`Failed to store element ${element.element_key}:`, err);
        failedInserts.push(element.element_key);
      }
    }

    console.log(`Successfully stored ${successfulInserts}/${synthesisResult.elements.length} elements for ${name}`);
    if (failedInserts.length > 0) {
      console.warn(`Failed to store elements: ${failedInserts.join(', ')}`);
    }

    // Step 6: Verify stored elements meet minimum requirements
    const storedElements = await getCityResearch(cityId);
    const storedCounts = validateElementCounts(storedElements);

    if (!storedCounts.isValid) {
      console.warn(`Warning: Stored elements do not meet minimum requirements for ${name}:`, {
        slang: `${storedCounts.slang}/5`,
        landmarks: `${storedCounts.landmark}/5`,
        sports: `${storedCounts.sport}/3`
      });
    } else {
      console.log(`✓ Minimum requirements met for ${name}:`, {
        slang: storedCounts.slang,
        landmarks: storedCounts.landmark,
        sports: storedCounts.sport,
        cultural: storedCounts.cultural
      });
    }

    // Step 7: Update city status to review
    await updateCityStatus(cityId, 'active');

    // Step 8: Log analytics
    await logResearchAnalytics(cityId, name, successfulInserts, categories);

    // Step 9: Return structured results
    const result: ResearchResult = {
      cityId,
      cityName: name,
      elements: synthesisResult.elements,
      raw_research: perplexityResults.map(r => r.response).join('\n\n---\n\n'),
      synthesis: synthesisResult.summary,
      timestamp: new Date().toISOString()
    };

    console.log(`Research completed for ${name}: ${result.elements.length} elements generated, ${successfulInserts} stored successfully`);

    return result;

  } catch (error) {
    console.error(`Research failed for ${name}:`, error);

    // Update city status to indicate error
    await updateCityStatus(cityId, 'draft');

    throw error;
  }
}

/**
 * Update city status in database
 */
async function updateCityStatus(cityId: string, status: 'draft' | 'active' | 'archived') {
  try {
    const { error } = await (supabaseAdmin as any)
      .from('cities')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', cityId);

    if (error) {
      console.error(`Failed to update city status:`, error);
    }
  } catch (err) {
    console.error(`Error updating city status:`, err);
  }
}

/**
 * Log research analytics
 */
async function logResearchAnalytics(
  cityId: string,
  cityName: string,
  elementCount: number,
  categories: string[]
) {
  try {
    const { error } = await supabaseAdmin
      .from('analytics')
      .insert({
        date: new Date().toISOString().split('T')[0],
        metric_type: 'research_completed',
        metric_value: elementCount,
        city_id: cityId,
        metadata: {
          city_name: cityName,
          categories,
          timestamp: new Date().toISOString()
        }
      } as any);

    if (error) {
      console.error(`Failed to log analytics:`, error);
    }
  } catch (err) {
    console.error(`Error logging analytics:`, err);
  }
}

/**
 * Get research results for a city
 */
export async function getCityResearch(cityId: string): Promise<CityElement[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('city_elements')
      .select('*')
      .eq('city_id', cityId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data as any).map((item: any) => ({
      element_type: item.element_type,
      element_key: item.element_key,
      element_value: item.element_value,
      status: item.status,
      notes: item.notes
    }));
  } catch (error) {
    console.error(`Failed to get city research:`, error);
    return [];
  }
}

/**
 * Get counts of elements by type for a city
 */
export async function getCityElementCounts(cityId: string): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('city_elements')
      .select('element_type')
      .eq('city_id', cityId);

    if (error) {
      throw error;
    }

    const counts: Record<string, number> = {
      slang: 0,
      landmark: 0,
      sport: 0,
      cultural: 0
    };

    (data as any).forEach((item: any) => {
      if (item.element_type in counts) {
        counts[item.element_type]++;
      }
    });

    return counts;
  } catch (error) {
    console.error(`Failed to get element counts:`, error);
    return { slang: 0, landmark: 0, sport: 0, cultural: 0 };
  }
}

/**
 * Approve or reject specific city elements
 */
export async function updateElementStatus(
  cityId: string,
  elementKey: string,
  elementType: string,
  status: 'approved' | 'rejected' | 'pending',
  notes?: string
) {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.notes = notes;
    }

    const { error } = await (supabaseAdmin as any)
      .from('city_elements')
      .update(updateData)
      .eq('city_id', cityId)
      .eq('element_key', elementKey)
      .eq('element_type', elementType);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Failed to update element status:`, error);
    return false;
  }
}