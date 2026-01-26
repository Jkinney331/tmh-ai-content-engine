'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Zap,
  Target,
  MapPin,
  Video,
  Image,
  MessageSquare,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface Suggestion {
  id: string
  type: 'trend' | 'opportunity' | 'seasonal' | 'feedback'
  title: string
  description: string
  city?: string
  action: string
  actionUrl: string
  priority: 'high' | 'medium' | 'low'
}

interface RecentTest {
  id: string
  type: string
  city: string
  status: 'success' | 'failed' | 'pending'
  timestamp: string
  preview?: string
}

interface BudgetData {
  used: number
  limit: number
  breakdown: { category: string; amount: number; color: string }[]
}

interface AnalyticsResponse {
  costs?: {
    total?: number
    byCategory?: { category: string; amount: number }[]
  }
  recentActivity?: { type: string; description: string; timestamp: string }[]
  knowledgeBase?: {
    sneakers?: number
    styleSlots?: number
    modelSpecs?: number
    competitors?: number
    learnings?: number
    cities?: number
  }
  mock?: boolean
}

export default function Dashboard() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [recentTests, setRecentTests] = useState<RecentTest[]>([])
  const [budget, setBudget] = useState<BudgetData>({
    used: 0,
    limit: 2000,
    breakdown: []
  })
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [analyticsResponse, recentResponse] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/generated-content?limit=6')
      ])

      if (analyticsResponse.ok) {
        const analyticsData: AnalyticsResponse = await analyticsResponse.json()
        setAnalytics(analyticsData)

        const costs = analyticsData.costs
        const breakdown = (costs?.byCategory || []).map(item => ({
          category: item.category.replace(/_/g, ' '),
          amount: item.amount,
          color: item.category.includes('video') ? 'bg-purple-500' :
            item.category.includes('image') ? 'bg-blue-500' :
            item.category.includes('research') ? 'bg-emerald-500' : 'bg-teal-500'
        }))

        setBudget({
          used: costs?.total || 0,
          limit: 2000,
          breakdown
        })

        const activitySuggestions: Suggestion[] = (analyticsData.recentActivity || []).map((item, index) => ({
          id: `activity-${index}`,
          type: 'feedback',
          title: item.description,
          description: `Recent ${item.type.replace('_', ' ')}`,
          action: 'View Activity',
          actionUrl: '/settings/analytics',
          priority: 'medium'
        }))
        setSuggestions(activitySuggestions)
      }

      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        const mapped: RecentTest[] = (recentData.data || []).map((entry: any) => ({
          id: entry.id,
          type: entry.content_type || 'Generation',
          city: entry.cities?.name || 'Unknown',
          status: entry.status === 'approved' ? 'success' : entry.status === 'rejected' ? 'failed' : 'pending',
          timestamp: entry.created_at ? new Date(entry.created_at).toLocaleString() : 'Recently',
          preview: entry.output_url
        }))
        setRecentTests(mapped)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const refreshSuggestions = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/15 text-destructive'
      case 'medium': return 'bg-warning/15 text-warning'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'trend': return { bg: 'bg-purple-500/15', text: 'text-purple-200', icon: TrendingUp }
      case 'opportunity': return { bg: 'bg-emerald-500/15', text: 'text-emerald-200', icon: Target }
      case 'seasonal': return { bg: 'bg-amber-500/15', text: 'text-amber-200', icon: Clock }
      case 'feedback': return { bg: 'bg-blue-500/15', text: 'text-blue-200', icon: MessageSquare }
      default: return { bg: 'bg-muted', text: 'text-muted-foreground', icon: Sparkles }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const budgetPercentage = budget.limit > 0 ? Math.round((budget.used / budget.limit) * 100) : 0
  const knowledgeBase = analytics?.knowledgeBase || {}

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">TMH AI Content Engine</p>
        </div>
        <div className="text-xs text-muted-foreground">Select a city to generate content.</div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Recent Created</h2>
            </div>
            <button
              onClick={refreshSuggestions}
              disabled={refreshing}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {recentTests.length === 0 && !loading && (
            <div className="surface-muted rounded-lg p-4 text-sm text-muted-foreground">
              No recent assets yet. Generate content inside a city to populate this gallery.
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {recentTests.map((item) => {
              const isVideo = item.preview?.endsWith('.mp4')
              return (
                <div key={item.id} className="surface-muted rounded-lg p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.city}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <div className="mt-3 h-36 w-full overflow-hidden rounded-lg bg-[color:var(--surface-strong)]">
                    {item.preview ? (
                      isVideo ? (
                        <video src={item.preview} className="h-full w-full object-cover" muted playsInline />
                      ) : (
                        <img src={item.preview} alt={item.type} className="h-full w-full object-cover" />
                      )
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{item.type.replace(/_/g, ' ')}</span>
                    {getStatusIcon(item.status)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Suggested Ideas</h2>
            </div>
            <button
              onClick={refreshSuggestions}
              disabled={refreshing}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-3">
            {!loading && suggestions.length === 0 && (
              <div className="surface-muted rounded-lg p-4 text-sm text-muted-foreground">
                Suggested ideas will appear after research and asset generation runs.
              </div>
            )}
            {suggestions.map((suggestion) => {
              const typeStyle = getTypeBadge(suggestion.type)
              const TypeIcon = typeStyle.icon
              return (
                <div key={suggestion.id} className="surface-muted flex items-start gap-4 rounded-lg p-4">
                  <div className={`p-2 rounded-lg ${typeStyle.bg}`}>
                    <TypeIcon className={`w-4 h-4 ${typeStyle.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">{suggestion.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(suggestion.priority)}`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">{suggestion.description}</p>
                    {suggestion.city && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {suggestion.city}
                      </span>
                    )}
                  </div>
                  <Link
                    href={suggestion.actionUrl}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-primary hover:bg-primary/10 whitespace-nowrap"
                  >
                    {suggestion.action}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="surface rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-foreground">Budget</h2>
          </div>
          <Link href="/settings/budget" className="text-sm text-muted-foreground hover:text-primary">
            Manage
          </Link>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">${budget.used.toFixed(2)} used</span>
            <span className="font-medium text-foreground">${budget.limit.toFixed(2)} limit</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                budgetPercentage > 90 ? 'bg-destructive' : budgetPercentage > 70 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{budgetPercentage}% of monthly budget used</p>
        </div>

        <div className="space-y-2">
          {!loading && budget.breakdown.length === 0 && (
            <p className="text-xs text-muted-foreground">No costs logged yet.</p>
          )}
          {budget.breakdown.map((item) => (
            <div key={item.category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-muted-foreground">{item.category}</span>
              </div>
              <span className="text-foreground">${item.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Base Stats */}
      <div className="surface-strong rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Knowledge Base</h2>
          <Link
            href="/settings/knowledge-base"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            Configure <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div>
            <p className="text-3xl font-bold text-foreground">{knowledgeBase.sneakers ?? 0}</p>
            <p className="text-sm text-muted-foreground">Sneakers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{knowledgeBase.styleSlots ?? 0}</p>
            <p className="text-sm text-muted-foreground">Style Slots</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{knowledgeBase.modelSpecs ?? 0}</p>
            <p className="text-sm text-muted-foreground">Model Specs</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{knowledgeBase.competitors ?? 0}</p>
            <p className="text-sm text-muted-foreground">Competitors</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{knowledgeBase.learnings ?? 0}</p>
            <p className="text-sm text-muted-foreground">Learnings</p>
          </div>
        </div>
      </div>
    </div>
  )
}
