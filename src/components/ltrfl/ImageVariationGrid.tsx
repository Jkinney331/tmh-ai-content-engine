'use client'

import { useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'

export interface LTRFLVariationImage {
  url: string
  index: number
  error?: string
}

interface ImageVariationGridProps {
  images: LTRFLVariationImage[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  onRegenerate?: (index: number) => void
}

export function ImageVariationGrid({
  images,
  selectedIndex,
  onSelect,
  onRegenerate
}: ImageVariationGridProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const gridCols =
    images.length <= 1 ? 'grid-cols-1' :
    images.length === 2 ? 'grid-cols-2' :
    images.length === 3 ? 'grid-cols-3' : 'grid-cols-4'

  return (
    <>
      <div className={cn('grid gap-2', gridCols)}>
        {images.map((img, index) => (
          <div
            key={index}
            className={cn(
              'relative aspect-square rounded-lg overflow-hidden border-2 transition-colors',
              selectedIndex === index
                ? 'border-[var(--ltrfl-sage)]'
                : 'border-[color:var(--surface-border)] hover:border-[color:var(--surface-border-hover)]'
            )}
            style={selectedIndex === index ? { borderColor: LTRFL_BRAND_COLORS.sage } : undefined}
          >
            <button
              className="absolute inset-0"
              onClick={() => setPreviewIndex(index)}
              aria-label={`Preview variation ${index + 1}`}
            />
            <img
              src={img.url}
              alt={`Variation ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
              <Button
                size="sm"
                variant={selectedIndex === index ? 'default' : 'secondary'}
                onClick={() => onSelect(index)}
              >
                {selectedIndex === index ? 'Selected' : 'Select'}
              </Button>
              {onRegenerate && (
                <Button size="sm" variant="ghost" onClick={() => onRegenerate(index)}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
            {img.error && (
              <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                <span className="text-white text-xs">Error</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {previewIndex !== null && images[previewIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewIndex(null)} />
          <div className="relative max-w-4xl w-full mx-4 rounded-lg overflow-hidden bg-[color:var(--surface)]">
            <button
              onClick={() => setPreviewIndex(null)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={images[previewIndex].url}
              alt={`Variation ${previewIndex + 1}`}
              className="w-full h-auto object-contain max-h-[80vh] bg-black"
            />
          </div>
        </div>
      )}
    </>
  )
}
