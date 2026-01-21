'use client'

import { useState } from 'react'
import {
  TMH_VIDEO_PIPELINES,
  TMH_IMAGE_PIPELINES,
  VideoPipeline,
  getPipelinesForContentType,
  ContentType
} from '@/lib/openrouter'
import { Zap, Clock, DollarSign, Video, Image, Sparkles } from 'lucide-react'

interface PipelineSelectorProps {
  contentType?: ContentType
  onSelectPipelines: (pipelineA: VideoPipeline, pipelineB: VideoPipeline) => void
  selectedPipelineA?: VideoPipeline | null
  selectedPipelineB?: VideoPipeline | null
}

export default function PipelineSelector({
  contentType,
  onSelectPipelines,
  selectedPipelineA,
  selectedPipelineB,
}: PipelineSelectorProps) {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')

  // Get relevant pipelines based on content type or show all
  const availablePipelines = contentType
    ? getPipelinesForContentType(contentType)
    : [...TMH_IMAGE_PIPELINES, ...TMH_VIDEO_PIPELINES]

  // Auto-select recommended pipeline pairs for comparison
  const getRecommendedPairs = (): [VideoPipeline, VideoPipeline][] => {
    const pairs: [VideoPipeline, VideoPipeline][] = []

    if (contentType === 'product_shot' || contentType === 'design_concept') {
      // For static images, compare Nano Banana vs GPT Image
      const nb = TMH_IMAGE_PIPELINES.find(p => p.id === 'nano-banana-only')
      const gpt = TMH_IMAGE_PIPELINES.find(p => p.id === 'gpt-image-only')
      if (nb && gpt) pairs.push([nb, gpt])
    } else if (contentType === 'product_gif') {
      // For GIFs, compare NB-NB vs GPT-NB
      const nbNb = TMH_VIDEO_PIPELINES.find(p => p.id === 'nb-nb')
      const gptNb = TMH_VIDEO_PIPELINES.find(p => p.id === 'gpt-nb')
      if (nbNb && gptNb) pairs.push([nbNb, gptNb])
    } else if (contentType === 'lifestyle_clip' || contentType === 'ad_video') {
      // For videos, compare VEO 3 vs Sora 2
      const nbVeo = TMH_VIDEO_PIPELINES.find(p => p.id === 'nb-veo3')
      const nbSora = TMH_VIDEO_PIPELINES.find(p => p.id === 'nb-sora2')
      if (nbVeo && nbSora) pairs.push([nbVeo, nbSora])
    }

    // Default: compare cheapest vs premium
    if (pairs.length === 0 && availablePipelines.length >= 2) {
      const sorted = [...availablePipelines].sort((a, b) => a.estimatedCostCents - b.estimatedCostCents)
      pairs.push([sorted[0], sorted[sorted.length - 1]])
    }

    return pairs
  }

  const recommendedPairs = getRecommendedPairs()

  const handleAutoSelect = (pair: [VideoPipeline, VideoPipeline]) => {
    onSelectPipelines(pair[0], pair[1])
  }

  const formatCost = (cents: number) => {
    if (cents < 100) return `${cents}¢`
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const PipelineCard = ({
    pipeline,
    isSelected,
    position,
    onSelect
  }: {
    pipeline: VideoPipeline
    isSelected: boolean
    position: 'A' | 'B'
    onSelect: () => void
  }) => (
    <div
      onClick={onSelect}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${isSelected
          ? position === 'A'
            ? 'border-blue-500 bg-blue-50'
            : 'border-purple-500 bg-purple-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
    >
      {isSelected && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
          position === 'A' ? 'bg-blue-500' : 'bg-purple-500'
        }`}>
          {position}
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {pipeline.videoModel ? (
            <Video className="w-5 h-5 text-indigo-600" />
          ) : (
            <Image className="w-5 h-5 text-green-600" />
          )}
          <h4 className="font-medium text-gray-900">{pipeline.name}</h4>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{pipeline.bestFor}</p>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          <span>{formatCost(pipeline.estimatedCostCents)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>~{formatLatency(pipeline.estimatedLatencyMs)}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMode('auto')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'auto'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Auto Compare
          </div>
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'manual'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Manual Select
        </button>
      </div>

      {mode === 'auto' ? (
        /* Auto Mode - Show recommended pairs */
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose a comparison pair based on your content type:
          </p>

          {recommendedPairs.map((pair, idx) => (
            <div
              key={idx}
              onClick={() => handleAutoSelect(pair)}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${selectedPipelineA?.id === pair[0].id && selectedPipelineB?.id === pair[1].id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 bg-white'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Pipeline A */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      A
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{pair[0].name}</p>
                      <p className="text-xs text-gray-500">{formatCost(pair[0].estimatedCostCents)} • {formatLatency(pair[0].estimatedLatencyMs)}</p>
                    </div>
                  </div>

                  <div className="text-gray-400 font-bold">vs</div>

                  {/* Pipeline B */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                      B
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{pair[1].name}</p>
                      <p className="text-xs text-gray-500">{formatCost(pair[1].estimatedCostCents)} • {formatLatency(pair[1].estimatedLatencyMs)}</p>
                    </div>
                  </div>
                </div>

                <Zap className={`w-5 h-5 ${
                  selectedPipelineA?.id === pair[0].id && selectedPipelineB?.id === pair[1].id
                    ? 'text-indigo-600'
                    : 'text-gray-300'
                }`} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Manual Mode - Show all pipelines */
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select two pipelines to compare (click once for A, again for B):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availablePipelines.map((pipeline) => {
              const isA = selectedPipelineA?.id === pipeline.id
              const isB = selectedPipelineB?.id === pipeline.id

              return (
                <PipelineCard
                  key={pipeline.id}
                  pipeline={pipeline}
                  isSelected={isA || isB}
                  position={isA ? 'A' : 'B'}
                  onSelect={() => {
                    if (isA) {
                      // Clicking A again clears it
                      onSelectPipelines(null as any, selectedPipelineB!)
                    } else if (isB) {
                      // Clicking B again clears it
                      onSelectPipelines(selectedPipelineA!, null as any)
                    } else if (!selectedPipelineA) {
                      // No A selected, set as A
                      onSelectPipelines(pipeline, selectedPipelineB!)
                    } else if (!selectedPipelineB) {
                      // A selected but no B, set as B
                      onSelectPipelines(selectedPipelineA, pipeline)
                    } else {
                      // Both selected, replace B
                      onSelectPipelines(selectedPipelineA, pipeline)
                    }
                  }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Summary */}
      {selectedPipelineA && selectedPipelineB && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Ready to compare:</p>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-blue-600 font-medium">{selectedPipelineA.name}</span>
                {' vs '}
                <span className="text-purple-600 font-medium">{selectedPipelineB.name}</span>
              </p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>Combined cost: {formatCost(selectedPipelineA.estimatedCostCents + selectedPipelineB.estimatedCostCents)}</p>
              <p>Max time: ~{formatLatency(Math.max(selectedPipelineA.estimatedLatencyMs, selectedPipelineB.estimatedLatencyMs))}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
