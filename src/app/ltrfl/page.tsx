'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Lightbulb,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { toast } from 'sonner'

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>

interface DashboardStats {
  totalTemplates: number
  totalConcepts: number
  conceptsInReview: number
  approvedConcepts: number
}

export default function LTRFLDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTemplates: 0,
    totalConcepts: 0,
    conceptsInReview: 0,
    approvedConcepts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch stats from API
        const [templatesRes, conceptsRes] = await Promise.all([
          fetch('/api/ltrfl/templates?count_only=true'),
          fetch('/api/ltrfl/concepts?stats=true')
        ])

        if (templatesRes.ok && conceptsRes.ok) {
          const templatesData = await templatesRes.json()
          const conceptsData = await conceptsRes.json()

          setStats({
            totalTemplates: templatesData.count || 0,
            totalConcepts: conceptsData.total || 0,
            conceptsInReview: conceptsData.reviewing || 0,
            approvedConcepts: conceptsData.approved || 0
          })
        }
      } catch (error) {
        toast.error('Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const statCards = [
    {
      label: 'Templates',
      value: stats.totalTemplates,
      icon: FileText,
      href: '/ltrfl/templates',
      color: LTRFL_BRAND_COLORS.sage
    },
    {
      label: 'Total Concepts',
      value: stats.totalConcepts,
      icon: Lightbulb,
      href: '/ltrfl/concepts',
      color: LTRFL_BRAND_COLORS.skyBlue
    },
    {
      label: 'In Review',
      value: stats.conceptsInReview,
      icon: Clock,
      href: '/ltrfl/concepts?status=reviewing',
      color: LTRFL_BRAND_COLORS.brass
    },
    {
      label: 'Approved',
      value: stats.approvedConcepts,
      icon: CheckCircle,
      href: '/ltrfl/concepts?status=approved',
      color: LTRFL_BRAND_COLORS.sage
    }
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">LTRFL Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Design and manage memorial urn concepts
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon as IconComponent
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] hover:border-[color:var(--surface-border-hover)] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {loading ? '...' : stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* New Concept Card */}
        <div
          className="p-6 rounded-lg border-2 border-dashed"
          style={{ borderColor: LTRFL_BRAND_COLORS.sage }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Generate New Concept
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create AI-generated urn design concepts from templates or custom prompts.
              </p>
              <Link href="/ltrfl/concepts/new">
                <Button
                  className="text-white"
                  style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
                >
                  Start Generating
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Browse Templates Card */}
        <div className="p-6 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${LTRFL_BRAND_COLORS.skyBlue}20` }}
            >
              <FileText className="w-6 h-6" style={{ color: LTRFL_BRAND_COLORS.skyBlue }} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Browse Templates
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore 60+ categorized prompt templates for memorial urn designs.
              </p>
              <Link href="/ltrfl/templates">
                <Button variant="secondary">
                  View Library
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
        <div className="p-4 border-b border-[color:var(--surface-border)]">
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No recent activity yet.</p>
          <p className="text-xs mt-1">Start generating concepts to see your activity here.</p>
        </div>
      </div>
    </div>
  )
}
