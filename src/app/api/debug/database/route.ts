import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Test database connectivity and check tables
// Visit: /api/debug/database
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: false,
      error: 'Supabase credentials not configured',
      fix: 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to environment'
    }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const results: Record<string, any> = {
    connection: false,
    tables: {},
    criticalIssues: [],
    sampleData: {}
  }

  // Tables to check
  const tablesToCheck = [
    'cities',
    'city_elements',
    'generated_content',
    'content_types',
    'sneakers',
    'model_specs',
    'style_slots',
    'competitors',
    'learnings',
    'prompt_templates',
    'feedback'
  ]

  try {
    // Check each table
    for (const table of tablesToCheck) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: false })
          .limit(1)

        if (error) {
          results.tables[table] = {
            exists: false,
            error: error.message
          }
          if (['cities', 'generated_content', 'content_types'].includes(table)) {
            results.criticalIssues.push(`Table '${table}' is missing or inaccessible: ${error.message}`)
          }
        } else {
          results.tables[table] = {
            exists: true,
            rowCount: count || 0,
            hasData: (count || 0) > 0
          }

          // Get sample for important tables
          if (data && data.length > 0 && ['cities', 'generated_content'].includes(table)) {
            results.sampleData[table] = {
              id: data[0].id,
              ...(table === 'cities' ? { name: data[0].name, status: data[0].status } : {}),
              ...(table === 'generated_content' ? {
                content_type: data[0].content_type,
                status: data[0].status,
                output_url: data[0].output_url?.slice(0, 50) + '...'
              } : {})
            }
          }
        }
      } catch (err: any) {
        results.tables[table] = {
          exists: false,
          error: err.message
        }
      }
    }

    results.connection = true

    // Check city statuses
    const { data: cityData } = await supabase
      .from('cities')
      .select('status')

    if (cityData) {
      const statusCounts: Record<string, number> = {}
      cityData.forEach((c: any) => {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1
      })
      results.cityStatusBreakdown = statusCounts
    }

    // Check generated_content URLs
    const { data: contentData } = await supabase
      .from('generated_content')
      .select('output_url')
      .limit(10)

    if (contentData) {
      const placeholderCount = contentData.filter(
        (c: any) => c.output_url?.includes('placehold.co')
      ).length
      results.generatedContent = {
        sampleSize: contentData.length,
        placeholderUrls: placeholderCount,
        realUrls: contentData.length - placeholderCount,
        note: placeholderCount > 0
          ? 'Some content has placeholder URLs - these are test data, not real generations'
          : 'All content has real URLs'
      }
    }

  } catch (error: any) {
    results.connection = false
    results.error = error.message
    results.criticalIssues.push(`Database connection failed: ${error.message}`)
  }

  return NextResponse.json(results, {
    status: results.criticalIssues.length > 0 ? 500 : 200
  })
}
