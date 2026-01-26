import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin, hasServiceKey } from '@/lib/supabaseAdmin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) return null
  return createClient(supabaseUrl, supabaseKey)
}

// Mock data for when Supabase isn't configured
const mockAnalytics = {
  costs: {
    total: 847.23,
    byCategory: [
      { category: 'image_generation', amount: 420.50, count: 85 },
      { category: 'video_generation', amount: 280.00, count: 14 },
      { category: 'chat', amount: 96.73, count: 243 },
      { category: 'research', amount: 50.00, count: 25 },
    ],
    trend: [
      { date: '2024-01-15', amount: 45.20 },
      { date: '2024-01-16', amount: 62.80 },
      { date: '2024-01-17', amount: 38.50 },
      { date: '2024-01-18', amount: 71.00 },
      { date: '2024-01-19', amount: 55.30 },
      { date: '2024-01-20', amount: 89.20 },
      { date: '2024-01-21', amount: 42.10 },
    ]
  },
  generation: {
    total: 124,
    byType: [
      { type: 'product_shot', count: 45, successRate: 0.92 },
      { type: 'lifestyle_shot', count: 40, successRate: 0.88 },
      { type: 'video', count: 14, successRate: 0.79 },
      { type: 'social_post', count: 25, successRate: 0.96 },
    ],
    byCity: [
      { city: 'Chicago', count: 28 },
      { city: 'Atlanta', count: 24 },
      { city: 'New York', count: 22 },
      { city: 'Los Angeles', count: 18 },
      { city: 'Detroit', count: 12 },
      { city: 'Miami', count: 10 },
      { city: 'Houston', count: 10 },
    ]
  },
  knowledgeBase: {
    sneakers: 22,
    modelSpecs: 12,
    styleSlots: 12,
    competitors: 6,
    learnings: 8,
    cities: 15
  },
  recentActivity: [
    { type: 'generation', description: 'Lifestyle shot for Atlanta', timestamp: '2 hours ago' },
    { type: 'learning', description: 'New insight: Bold colors in ATL', timestamp: '4 hours ago' },
    { type: 'research', description: 'Detroit slang research completed', timestamp: '5 hours ago' },
    { type: 'generation', description: 'Product shot for Chicago', timestamp: '6 hours ago' },
  ]
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || '7d' // 7d, 30d, all
  const type = searchParams.get('type') // costs, generation, knowledge, all

  const supabase = hasServiceKey ? supabaseAdmin : getSupabaseClient()

  if (!supabase) {
    return NextResponse.json({
      ...mockAnalytics,
      period,
      mock: true
    })
  }

  try {
    const analytics: Record<string, unknown> = { period }

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    if (period === '7d') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === '30d') {
      startDate.setDate(now.getDate() - 30)
    } else {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    // Costs analytics
    if (!type || type === 'all' || type === 'costs') {
      const { data: costData } = await supabase
        .from('cost_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())

      const totalCost = (costData || []).reduce((sum, c) => sum + (c.cost_cents / 100), 0)

      // Group by category
      const byCategory: Record<string, { amount: number; count: number }> = {}
      for (const cost of costData || []) {
        if (!byCategory[cost.category]) {
          byCategory[cost.category] = { amount: 0, count: 0 }
        }
        byCategory[cost.category].amount += cost.cost_cents / 100
        byCategory[cost.category].count += 1
      }

      // Group by date for trend
      const byDate: Record<string, number> = {}
      for (const cost of costData || []) {
        const date = cost.created_at.split('T')[0]
        byDate[date] = (byDate[date] || 0) + cost.cost_cents / 100
      }

      analytics.costs = {
        total: totalCost,
        byCategory: Object.entries(byCategory).map(([category, data]) => ({
          category,
          ...data
        })),
        trend: Object.entries(byDate).map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date))
      }
    }

    // Generation analytics
    if (!type || type === 'all' || type === 'generation') {
      const { data: queueData } = await supabase
        .from('generation_queue')
        .select('*, cities(name)')
        .gte('created_at', startDate.toISOString())

      // Group by type
      const byType: Record<string, { count: number; success: number }> = {}
      for (const job of queueData || []) {
        if (!byType[job.content_type]) {
          byType[job.content_type] = { count: 0, success: 0 }
        }
        byType[job.content_type].count += 1
        if (job.status === 'completed') {
          byType[job.content_type].success += 1
        }
      }

      // Group by city
      const byCity: Record<string, number> = {}
      for (const job of queueData || []) {
        const cityName = job.cities?.name || 'Unknown'
        byCity[cityName] = (byCity[cityName] || 0) + 1
      }

      analytics.generation = {
        total: (queueData || []).length,
        byType: Object.entries(byType).map(([type, data]) => ({
          type,
          count: data.count,
          successRate: data.count > 0 ? data.success / data.count : 0
        })),
        byCity: Object.entries(byCity)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      }
    }

    // Knowledge base stats
    if (!type || type === 'all' || type === 'knowledge') {
      const [sneakers, models, styles, competitors, learnings, cities] = await Promise.all([
        supabase.from('sneakers').select('id', { count: 'exact', head: true }),
        supabase.from('model_specs').select('id', { count: 'exact', head: true }),
        supabase.from('style_slots').select('id', { count: 'exact', head: true }),
        supabase.from('competitors').select('id', { count: 'exact', head: true }),
        supabase.from('learnings').select('id', { count: 'exact', head: true }),
        supabase.from('cities').select('id', { count: 'exact', head: true }),
      ])

      analytics.knowledgeBase = {
        sneakers: sneakers.count || 0,
        modelSpecs: models.count || 0,
        styleSlots: styles.count || 0,
        competitors: competitors.count || 0,
        learnings: learnings.count || 0,
        cities: cities.count || 0
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

// Log a cost entry
export async function POST(req: NextRequest) {
  const supabase = hasServiceKey ? supabaseAdmin : getSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const { category, model, cost_cents, content_type, city_id, metadata } = await req.json()

    if (!category || cost_cents === undefined) {
      return NextResponse.json({ error: 'Category and cost_cents required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('cost_logs')
      .insert({
        category,
        model,
        cost_cents,
        content_type,
        city_id,
        metadata: metadata || {}
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log cost' }, { status: 500 })
  }
}
