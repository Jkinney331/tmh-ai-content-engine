'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, DollarSign, RefreshCw } from 'lucide-react'
import { GlassCard } from '@/components/shared/GlassCard'
import { Button } from '@/components/ui/button'

interface BudgetSummary {
  used: number
  limit: number
  breakdown: { category: string; amount: number }[]
  mock?: boolean
}

export default function BudgetPage() {
  const [budget, setBudget] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchBudget = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/analytics')
      if (!response.ok) {
        throw new Error('Failed to load analytics')
      }
      const data = await response.json()
      const costs = data.costs || {}
      setBudget({
        used: costs.total || 0,
        limit: 2000,
        breakdown: (costs.byCategory || []).map((item: any) => ({
          category: item.category.replace(/_/g, ' '),
          amount: item.amount,
        })),
        mock: data.mock,
      })
    } catch (err) {
      console.error('Budget error:', err)
      setBudget(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBudget()
  }, [])

  const budgetPercentage = budget ? Math.round((budget.used / budget.limit) * 100) : 0

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/settings" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="rounded-lg bg-primary/15 p-2 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Budget</h1>
              <p className="text-sm text-muted-foreground">Track spend across research and generation.</p>
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchBudget} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && (
        <GlassCard className="p-6 text-sm text-muted-foreground">Loading budget summary...</GlassCard>
      )}

      {!loading && !budget && (
        <GlassCard className="p-6 text-sm text-muted-foreground">
          Budget data is unavailable. Connect Supabase to start tracking costs.
        </GlassCard>
      )}

      {budget && (
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Monthly Budget</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">${budget.limit.toFixed(2)}</p>
            <div className="mt-4 rounded-full bg-muted">
              <div
                className={`h-3 rounded-full ${
                  budgetPercentage > 90 ? 'bg-destructive' : budgetPercentage > 70 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              ${budget.used.toFixed(2)} used · {budgetPercentage}% of budget
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Spend by Category</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              {budget.breakdown.length === 0 && <p>No costs logged yet.</p>}
              {budget.breakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="capitalize">{item.category}</span>
                  <span className="text-foreground">${item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {budget.mock && (
              <p className="mt-4 text-xs text-muted-foreground">
                Demo data shown. Configure Supabase to track real costs.
              </p>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  )
}
