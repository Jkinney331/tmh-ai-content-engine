import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MONTHLY_BUDGET_CENTS, BudgetStatus } from '@/lib/openrouter'

export interface GenerationRecord {
  id: string
  timestamp: string
  pipelineId: string
  pipelineName: string
  costCents: number
  latencyMs: number
  contentType?: string
  cityId?: string
  wasWinner?: boolean
}

interface BudgetState {
  // Monthly tracking
  currentMonthStart: string
  totalSpentCents: number
  generationHistory: GenerationRecord[]

  // Pipeline leaderboard data
  pipelineStats: Record<string, {
    totalGenerations: number
    totalWins: number
    totalCostCents: number
    avgLatencyMs: number
  }>

  // Actions
  recordGeneration: (record: Omit<GenerationRecord, 'id' | 'timestamp'>) => void
  recordWinner: (generationId: string) => void
  getBudgetStatus: () => BudgetStatus
  resetMonth: () => void
  getPipelineLeaderboard: () => Array<{
    pipelineId: string
    pipelineName: string
    totalGenerations: number
    winRate: number
    avgCostCents: number
    avgLatencyMs: number
  }>
}

function getCurrentMonthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function isSameMonth(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      currentMonthStart: getCurrentMonthStart(),
      totalSpentCents: 0,
      generationHistory: [],
      pipelineStats: {},

      recordGeneration: (record) => {
        const id = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const timestamp = new Date().toISOString()

        const fullRecord: GenerationRecord = {
          ...record,
          id,
          timestamp,
        }

        set((state) => {
          // Check if we need to reset for new month
          const shouldReset = !isSameMonth(state.currentMonthStart)

          const newHistory = shouldReset ? [fullRecord] : [...state.generationHistory, fullRecord]
          const newTotalSpent = shouldReset ? record.costCents : state.totalSpentCents + record.costCents

          // Update pipeline stats
          const pipelineId = record.pipelineId
          const existingStats = state.pipelineStats[pipelineId] || {
            totalGenerations: 0,
            totalWins: 0,
            totalCostCents: 0,
            avgLatencyMs: 0,
          }

          const newStats = {
            ...state.pipelineStats,
            [pipelineId]: {
              totalGenerations: existingStats.totalGenerations + 1,
              totalWins: existingStats.totalWins,
              totalCostCents: existingStats.totalCostCents + record.costCents,
              avgLatencyMs: Math.round(
                (existingStats.avgLatencyMs * existingStats.totalGenerations + record.latencyMs) /
                (existingStats.totalGenerations + 1)
              ),
            },
          }

          return {
            currentMonthStart: shouldReset ? getCurrentMonthStart() : state.currentMonthStart,
            totalSpentCents: newTotalSpent,
            generationHistory: newHistory,
            pipelineStats: newStats,
          }
        })

        return id
      },

      recordWinner: (generationId) => {
        set((state) => {
          const updatedHistory = state.generationHistory.map((gen) =>
            gen.id === generationId ? { ...gen, wasWinner: true } : gen
          )

          const winnerRecord = state.generationHistory.find((g) => g.id === generationId)
          if (!winnerRecord) return state

          const pipelineId = winnerRecord.pipelineId
          const existingStats = state.pipelineStats[pipelineId]
          if (!existingStats) return { ...state, generationHistory: updatedHistory }

          return {
            ...state,
            generationHistory: updatedHistory,
            pipelineStats: {
              ...state.pipelineStats,
              [pipelineId]: {
                ...existingStats,
                totalWins: existingStats.totalWins + 1,
              },
            },
          }
        })
      },

      getBudgetStatus: () => {
        const state = get()

        // Check if we need to reset for new month
        if (!isSameMonth(state.currentMonthStart)) {
          return {
            totalBudgetCents: MONTHLY_BUDGET_CENTS,
            spentCents: 0,
            remainingCents: MONTHLY_BUDGET_CENTS,
            percentUsed: 0,
            canGenerate: true,
          }
        }

        const remainingCents = MONTHLY_BUDGET_CENTS - state.totalSpentCents
        const percentUsed = (state.totalSpentCents / MONTHLY_BUDGET_CENTS) * 100

        return {
          totalBudgetCents: MONTHLY_BUDGET_CENTS,
          spentCents: state.totalSpentCents,
          remainingCents: Math.max(0, remainingCents),
          percentUsed: Math.min(100, percentUsed),
          canGenerate: remainingCents > 0,
        }
      },

      resetMonth: () => {
        set({
          currentMonthStart: getCurrentMonthStart(),
          totalSpentCents: 0,
          generationHistory: [],
        })
      },

      getPipelineLeaderboard: () => {
        const state = get()
        const leaderboard = Object.entries(state.pipelineStats)
          .map(([pipelineId, stats]) => {
            const winRate = stats.totalGenerations > 0
              ? (stats.totalWins / stats.totalGenerations) * 100
              : 0

            const avgCostCents = stats.totalGenerations > 0
              ? stats.totalCostCents / stats.totalGenerations
              : 0

            // Find pipeline name from history
            const pipelineName = state.generationHistory.find(
              (g) => g.pipelineId === pipelineId
            )?.pipelineName || pipelineId

            return {
              pipelineId,
              pipelineName,
              totalGenerations: stats.totalGenerations,
              winRate,
              avgCostCents,
              avgLatencyMs: stats.avgLatencyMs,
            }
          })
          .sort((a, b) => b.winRate - a.winRate)

        return leaderboard
      },
    }),
    {
      name: 'tmh-budget-store',
    }
  )
)
