'use client'

import { useBudgetStore } from '@/stores/budgetStore'
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface BudgetDisplayProps {
  variant?: 'compact' | 'full'
  showLeaderboard?: boolean
}

export default function BudgetDisplay({
  variant = 'compact',
  showLeaderboard = false,
}: BudgetDisplayProps) {
  const { getBudgetStatus, getPipelineLeaderboard, generationHistory } = useBudgetStore()
  const status = getBudgetStatus()
  const leaderboard = getPipelineLeaderboard()

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const getStatusColor = () => {
    if (status.percentUsed >= 90) return 'text-red-600'
    if (status.percentUsed >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = () => {
    if (status.percentUsed >= 90) return 'bg-red-500'
    if (status.percentUsed >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
        <DollarSign className={`w-4 h-4 ${getStatusColor()}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Budget</span>
            <span className={`font-medium ${getStatusColor()}`}>
              {formatCurrency(status.remainingCents)} left
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
            <div
              className={`h-full rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${Math.min(100, status.percentUsed)}%` }}
            />
          </div>
        </div>
        {status.percentUsed >= 90 && (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        Monthly Budget
      </h3>

      {/* Budget Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">Spent</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(status.spentCents)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className={`text-xl font-bold ${getStatusColor()}`}>
            {formatCurrency(status.remainingCents)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Budget</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(status.totalBudgetCents)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">{status.percentUsed.toFixed(1)}% used</span>
          <span className="text-gray-500">
            {generationHistory.length} generations
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${Math.min(100, status.percentUsed)}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className={`p-3 rounded-lg ${
        status.percentUsed >= 90
          ? 'bg-red-50 text-red-700'
          : status.percentUsed >= 70
            ? 'bg-yellow-50 text-yellow-700'
            : 'bg-green-50 text-green-700'
      }`}>
        <div className="flex items-center gap-2">
          {status.percentUsed >= 90 ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {status.percentUsed >= 90
              ? 'Budget nearly exhausted. Consider upgrading or waiting for next month.'
              : status.percentUsed >= 70
                ? 'Budget usage is high. Use resources wisely.'
                : 'Budget is healthy. Generate away!'}
          </span>
        </div>
      </div>

      {/* Pipeline Leaderboard */}
      {showLeaderboard && leaderboard.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Pipeline Leaderboard</h4>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((pipeline, idx) => (
              <div
                key={pipeline.pipelineId}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-200 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'}
                  `}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {pipeline.pipelineName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pipeline.totalGenerations} runs • {formatCurrency(pipeline.avgCostCents)}/gen
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    pipeline.winRate >= 50 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {pipeline.winRate.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500">win rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
