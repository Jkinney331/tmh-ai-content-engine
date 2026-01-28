'use client'

import Link from 'next/link'
import { Lightbulb, Clock, CheckCircle, XCircle, FileText } from 'lucide-react'
import { LTRFL_BRAND_COLORS, LTRFL_STATUS_COLORS, LTRFLConceptStatus } from '@/types/ltrfl'
import { cn } from '@/lib/utils'

interface ConceptCardProps {
  concept: {
    id: string
    category: string
    subcategory: string | null
    images: Array<{ url: string; index: number }>
    selected_image_index: number | null
    notes?: string | null
    status: LTRFLConceptStatus
    created_at: string
    ltrfl_templates?: {
      name: string
      category: string
    } | null
  }
  viewMode: 'grid' | 'list'
}

const STATUS_ICONS: Record<LTRFLConceptStatus, React.ElementType> = {
  draft: FileText,
  reviewing: Clock,
  approved: CheckCircle,
  cad_pending: Clock,
  cad_complete: CheckCircle,
  rejected: XCircle
}

const STATUS_LABELS: Record<LTRFLConceptStatus, string> = {
  draft: 'Draft',
  reviewing: 'In Review',
  approved: 'Approved',
  cad_pending: 'CAD Pending',
  cad_complete: 'CAD Complete',
  rejected: 'Rejected'
}

export function ConceptCard({ concept, viewMode }: ConceptCardProps) {
  const StatusIcon = STATUS_ICONS[concept.status]
  const statusColors = LTRFL_STATUS_COLORS[concept.status]
  const formattedDate = new Date(concept.created_at).toLocaleDateString()
  const imageUrl = concept.selected_image_index !== null
    ? concept.images?.[concept.selected_image_index]?.url
    : concept.images?.[0]?.url
  const displayName = concept.notes?.startsWith('Concept name:')
    ? concept.notes.replace('Concept name:', '').trim()
    : concept.subcategory
      ? `${concept.subcategory} Concept`
      : `${concept.category} Concept`

  if (viewMode === 'list') {
    return (
      <Link
        href={`/ltrfl/concepts/${concept.id}`}
        className="flex items-center gap-4 p-3 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] hover:border-[color:var(--surface-border-hover)] transition-colors"
      >
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[color:var(--surface-muted)]">
          {concept.generated_image_url ? (
            <img
              src={concept.generated_image_url}
              alt={concept.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{displayName}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {concept.category} {concept.subcategory && `• ${concept.subcategory}`}
          </p>
        </div>

        {/* Status */}
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-xs",
          statusColors.bg, statusColors.text
        )}>
          <StatusIcon className="w-3 h-3" />
          {STATUS_LABELS[concept.status]}
        </div>

        {/* Date */}
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {formattedDate}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={`/ltrfl/concepts/${concept.id}`}
      className="group rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] hover:border-[color:var(--surface-border-hover)] transition-colors overflow-hidden"
    >
      {/* Image */}
      <div className="aspect-square bg-[color:var(--surface-muted)] relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Lightbulb className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>
        )}

        {/* Status Badge */}
        <div className={cn(
          "absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-xs",
          statusColors.bg, statusColors.text
        )}>
          <StatusIcon className="w-3 h-3" />
          {STATUS_LABELS[concept.status]}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-foreground truncate mb-1">{displayName}</h3>
        <p className="text-xs text-muted-foreground">
          {concept.category} {concept.subcategory && `• ${concept.subcategory}`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formattedDate}
        </p>
      </div>
    </Link>
  )
}
