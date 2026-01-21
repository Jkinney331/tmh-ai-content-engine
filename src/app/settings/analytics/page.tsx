'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  TrendingUp,
  Image,
  Video,
  MessageSquare,
  Search,
  MapPin,
  RefreshCw,
  Calendar
} from 'lucide-react'

interface Analytics {
  costs: {
    total: number
    byCategory: { category: string; amount: number; count: number }[]
    trend: { date: string; amount: number }[]
  }
  generation: {
    total: number
    byType: { type: string; count: number; successRate: number }[]
    byCity: { city: string; count: number }[]
  }
  knowledgeBase: {
    sneakers: number
    modelSpecs: number
    styleSlots: number
    competitors: number
    learnings: number
    cities: number
  }
  period: string
  mock?: boolean
}

const categoryIcons: Record<string, typeof DollarSign> = {
  image_generation: Image,
  video_generation: Video,
  chat: MessageSquare,
  research: Search,
}

const categoryColors: Record<string, string> = {
  image_generation: 'bg-blue-500',
  video_generation: 'bg-purple-500',
  chat: 'bg-green-500',
  research: 'bg-orange-500',
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = async () => {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/analytics?period=${period}`)
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${Math.round(value * 100)}%`
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    )
  }

  const maxTrendValue = Math.max(...(analytics.costs?.trend || []).map(t => t.amount), 1)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/settings"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Track usage, costs, and generation metrics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {['7d', '30d', 'all'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p === 'all' ? 'All Time' : p === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {analytics.mock && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
          Showing demo data. Connect Supabase for real analytics.
        </div>
      )}

      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Spend</span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(analytics.costs?.total || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last {period === 'all' ? 'year' : period === '7d' ? '7 days' : '30 days'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Generations</span>
            <Image className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {analytics.generation?.total || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total content pieces</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Avg Success Rate</span>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatPercent(
              (analytics.generation?.byType || []).reduce((sum, t) => sum + t.successRate, 0) /
              Math.max((analytics.generation?.byType || []).length, 1)
            )}
          </p>
          <p className="text-sm text-gray-500 mt-1">Across all content</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Cost per Gen</span>
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(
              (analytics.costs?.total || 0) / Math.max(analytics.generation?.total || 1, 1)
            )}
          </p>
          <p className="text-sm text-gray-500 mt-1">Average per piece</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h2>
          <div className="space-y-4">
            {(analytics.costs?.byCategory || []).map(cat => {
              const Icon = categoryIcons[cat.category] || DollarSign
              const color = categoryColors[cat.category] || 'bg-gray-500'
              const percentage = ((cat.amount / (analytics.costs?.total || 1)) * 100).toFixed(1)

              return (
                <div key={cat.category} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg ${color} bg-opacity-20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {cat.category.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12">{percentage}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{cat.count} operations</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Spending Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h2>
          <div className="h-48 flex items-end gap-1">
            {(analytics.costs?.trend || []).slice(-14).map((day, i) => {
              const height = (day.amount / maxTrendValue) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.date}: ${formatCurrency(day.amount)}`}
                  />
                  <span className="text-[10px] text-gray-400 rotate-45 origin-left">
                    {day.date.slice(5)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation by Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generation by Type</h2>
          <div className="space-y-3">
            {(analytics.generation?.byType || []).map(type => (
              <div key={type.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {type.type.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-500">{type.count} generated</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    type.successRate >= 0.9 ? 'text-green-600' :
                    type.successRate >= 0.7 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {formatPercent(type.successRate)}
                  </p>
                  <p className="text-xs text-gray-500">success rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Cities</h2>
          <div className="space-y-3">
            {(analytics.generation?.byCity || []).slice(0, 7).map((city, i) => {
              const maxCount = (analytics.generation?.byCity[0]?.count || 1)
              const width = (city.count / maxCount) * 100

              return (
                <div key={city.city} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-6">{i + 1}.</span>
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{city.city}</span>
                      <span className="text-sm text-gray-500">{city.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Knowledge Base Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Object.entries(analytics.knowledgeBase || {}).map(([key, count]) => (
            <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
