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

const mockSuggestions: Suggestion[] = [
  {
    id: '1',
    type: 'trend',
    title: 'Jordan 4 Bred Reimagined dropping soon',
    description: 'High search volume detected. Create content featuring Chicago & NYC styling.',
    city: 'Chicago',
    action: 'Generate Content',
    actionUrl: '/generate?preset=sneaker-drop',
    priority: 'high'
  },
  {
    id: '2',
    type: 'seasonal',
    title: 'Summer collection push needed',
    description: 'Switch to lighter colorways and outdoor backgrounds for warm-weather cities.',
    action: 'Review Styles',
    actionUrl: '/settings/knowledge-base/styles',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'opportunity',
    title: 'Detroit underserved in content',
    description: 'No Detroit-specific content in 30 days. High engagement market.',
    city: 'Detroit',
    action: 'Create for Detroit',
    actionUrl: '/generate?city=detroit',
    priority: 'high'
  },
  {
    id: '4',
    type: 'feedback',
    title: 'Model diversity improving engagement',
    description: 'Posts with diverse models showing 30% higher engagement.',
    action: 'View Learnings',
    actionUrl: '/settings/knowledge-base/learnings',
    priority: 'low'
  },
]

const mockRecentTests: RecentTest[] = [
  { id: '1', type: 'Lifestyle Shot', city: 'Atlanta', status: 'success', timestamp: '2 hours ago', preview: '/api/placeholder/100/100' },
  { id: '2', type: 'Product Shot', city: 'Chicago', status: 'success', timestamp: '4 hours ago', preview: '/api/placeholder/100/100' },
  { id: '3', type: 'Video Ad', city: 'Los Angeles', status: 'pending', timestamp: '5 hours ago' },
  { id: '4', type: 'Lifestyle Shot', city: 'Miami', status: 'failed', timestamp: '6 hours ago' },
]

const mockBudget: BudgetData = {
  used: 847,
  limit: 2000,
  breakdown: [
    { category: 'Image Gen', amount: 420, color: 'bg-blue-500' },
    { category: 'Video Gen', amount: 280, color: 'bg-purple-500' },
    { category: 'Chat/Research', amount: 147, color: 'bg-green-500' },
  ]
}

const quickActions = [
  { name: 'Product Shot', icon: Image, href: '/generate?type=product', color: 'bg-blue-100 text-blue-600' },
  { name: 'Lifestyle Shot', icon: Target, href: '/generate?type=lifestyle', color: 'bg-purple-100 text-purple-600' },
  { name: '24s Video Ad', icon: Video, href: '/generate?type=video', color: 'bg-red-100 text-red-600' },
  { name: 'City Research', icon: MapPin, href: '/cities', color: 'bg-green-100 text-green-600' },
]

export default function Dashboard() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions)
  const [recentTests, setRecentTests] = useState<RecentTest[]>(mockRecentTests)
  const [budget, setBudget] = useState<BudgetData>(mockBudget)
  const [refreshing, setRefreshing] = useState(false)

  const refreshSuggestions = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'trend': return { bg: 'bg-purple-100', text: 'text-purple-700', icon: TrendingUp }
      case 'opportunity': return { bg: 'bg-green-100', text: 'text-green-700', icon: Target }
      case 'seasonal': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock }
      case 'feedback': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: MessageSquare }
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Sparkles }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const budgetPercentage = Math.round((budget.used / budget.limit) * 100)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">TMH AI Content Engine</p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <MessageSquare className="w-4 h-4" />
          Open Chat
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.name}
              href={action.href}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className={`p-3 rounded-full ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-medium text-gray-900">{action.name}</span>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Suggestions - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">AI Suggestions</h2>
            </div>
            <button
              onClick={refreshSuggestions}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              const typeStyle = getTypeBadge(suggestion.type)
              const TypeIcon = typeStyle.icon
              return (
                <div
                  key={suggestion.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${typeStyle.bg}`}>
                    <TypeIcon className={`w-4 h-4 ${typeStyle.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{suggestion.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(suggestion.priority)}`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    {suggestion.city && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {suggestion.city}
                      </span>
                    )}
                  </div>
                  <Link
                    href={suggestion.actionUrl}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-100 rounded-lg whitespace-nowrap"
                  >
                    {suggestion.action}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Suggestions powered by market trends, engagement data, and your knowledge base
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Budget Tracker */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Budget</h2>
              </div>
              <Link href="/settings/budget" className="text-sm text-gray-500 hover:text-indigo-600">
                Manage
              </Link>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">${budget.used.toFixed(2)} used</span>
                <span className="text-gray-900 font-medium">${budget.limit.toFixed(2)} limit</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetPercentage > 90 ? 'bg-red-500' : budgetPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{budgetPercentage}% of monthly budget used</p>
            </div>

            <div className="space-y-2">
              {budget.breakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-gray-600">{item.category}</span>
                  </div>
                  <span className="text-gray-900">${item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tests */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Tests</h2>
              </div>
              <Link href="/history" className="text-sm text-gray-500 hover:text-indigo-600">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentTests.map((test) => (
                <div key={test.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  {test.preview ? (
                    <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {test.type.includes('Video') ? (
                        <Video className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Image className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{test.type}</p>
                    <p className="text-xs text-gray-500">{test.city} · {test.timestamp}</p>
                  </div>
                  {getStatusIcon(test.status)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Base Stats */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Knowledge Base</h2>
          <Link
            href="/settings/knowledge-base"
            className="flex items-center gap-1 text-sm text-white/80 hover:text-white"
          >
            Configure <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-3xl font-bold">20+</p>
            <p className="text-sm text-white/70">Sneakers</p>
          </div>
          <div>
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-white/70">Style Slots</p>
          </div>
          <div>
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-white/70">Model Specs</p>
          </div>
          <div>
            <p className="text-3xl font-bold">6</p>
            <p className="text-sm text-white/70">Competitors</p>
          </div>
          <div>
            <p className="text-3xl font-bold">5+</p>
            <p className="text-sm text-white/70">Learnings</p>
          </div>
        </div>
      </div>
    </div>
  )
}
