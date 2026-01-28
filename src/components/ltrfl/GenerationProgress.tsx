'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'

interface GenerationProgressProps {
  status: 'pending' | 'generating' | 'complete' | 'failed'
  type: 'video' | 'image' | 'caption'
  progress?: number
  message?: string
  onRetry?: () => void
}

const typeConfig = {
  video: {
    title: 'Video Generation',
    steps: ['Analyzing prompt', 'Generating frames', 'Rendering video', 'Finalizing']
  },
  image: {
    title: 'Image Generation',
    steps: ['Processing prompt', 'Creating composition', 'Rendering details', 'Enhancing']
  },
  caption: {
    title: 'Caption Generation',
    steps: ['Analyzing content', 'Crafting message', 'Optimizing']
  }
}

export function GenerationProgress({
  status,
  type,
  progress = 0,
  message,
  onRetry
}: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const config = typeConfig[type]

  useEffect(() => {
    if (status === 'generating') {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % config.steps.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [status, config.steps.length])

  if (status === 'complete') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <div>
          <p className="font-medium text-green-500">{config.title} Complete</p>
          <p className="text-sm text-muted-foreground">Your content is ready</p>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500" />
          <div className="flex-1">
            <p className="font-medium text-red-500">{config.title} Failed</p>
            <p className="text-sm text-muted-foreground">{message || 'An error occurred'}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  // Pending or generating
  return (
    <div className="p-6 rounded-lg bg-[color:var(--surface)] border border-[color:var(--surface-border)]">
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
        >
          {status === 'generating' ? (
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: LTRFL_BRAND_COLORS.sage }}
            />
          ) : (
            <Sparkles
              className="w-6 h-6"
              style={{ color: LTRFL_BRAND_COLORS.sage }}
            />
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground">{config.title}</p>
          <p className="text-sm text-muted-foreground">
            {status === 'pending' ? 'Waiting to start...' : config.steps[currentStep]}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {status === 'generating' && (
        <div className="space-y-2">
          <div className="h-2 bg-[color:var(--surface-muted)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: LTRFL_BRAND_COLORS.sage,
                width: progress > 0 ? `${progress}%` : '30%',
                animation: progress === 0 ? 'pulse 2s ease-in-out infinite' : undefined
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Processing</span>
            {progress > 0 && <span>{progress}%</span>}
          </div>
        </div>
      )}

      {/* Steps indicator */}
      {status === 'generating' && (
        <div className="flex items-center gap-2 mt-4">
          {config.steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index <= currentStep
                    ? "bg-[#9CAF88]"
                    : "bg-[color:var(--surface-muted)]"
                )}
              />
              {index < config.steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 transition-colors",
                    index < currentStep
                      ? "bg-[#9CAF88]"
                      : "bg-[color:var(--surface-muted)]"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function GenerationOverlay({
  visible,
  type,
  message
}: {
  visible: boolean
  type: 'video' | 'image' | 'caption'
  message?: string
}) {
  if (!visible) return null

  const config = typeConfig[type]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-xl p-8 max-w-md mx-4 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
        >
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: LTRFL_BRAND_COLORS.sage }}
          />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {config.title} in Progress
        </h3>
        <p className="text-muted-foreground mb-4">
          {message || 'This may take a moment...'}
        </p>
        <div className="h-1.5 bg-[color:var(--surface-muted)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full animate-pulse"
            style={{
              backgroundColor: LTRFL_BRAND_COLORS.sage,
              width: '60%'
            }}
          />
        </div>
      </div>
    </div>
  )
}
