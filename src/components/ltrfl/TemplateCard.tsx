'use client'

import { FileText, MoreHorizontal, Sparkles } from 'lucide-react'
import { LTRFLTemplate, LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { Button } from '@/components/ui/button'

interface TemplateCardProps {
  template: LTRFLTemplate
  viewMode: 'grid' | 'list'
  onSelect: () => void
  onUseTemplate: () => void
  onEdit?: () => void
  onDelete?: () => void
  showAdminActions?: boolean
}

export function TemplateCard({
  template,
  viewMode,
  onSelect,
  onUseTemplate,
  onEdit,
  onDelete,
  showAdminActions = false
}: TemplateCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="w-full flex items-center gap-4 p-3 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] hover:border-[color:var(--surface-border-hover)] transition-colors">
        <button
          onClick={onSelect}
          className="flex items-center gap-4 flex-1 min-w-0 text-left"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
          >
            <FileText className="w-5 h-5" style={{ color: LTRFL_BRAND_COLORS.sage }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{template.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {template.category} {template.subcategory && `• ${template.subcategory}`}
            </p>
          </div>
        </button>
        <Button variant="secondary" size="sm" onClick={onUseTemplate}>
          Use Template
        </Button>
        {showAdminActions && (onEdit || onDelete) && (
          <details className="relative">
            <summary className="list-none cursor-pointer text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </summary>
            <div className="absolute right-0 mt-2 w-32 rounded-md border border-[color:var(--surface-border)] bg-[color:var(--surface)] shadow-lg z-10">
              {onEdit && (
                <button
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-[color:var(--surface-muted)]"
                  onClick={onEdit}
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-[color:var(--surface-muted)]"
                  onClick={onDelete}
                >
                  Delete
                </button>
              )}
            </div>
          </details>
        )}
      </div>
    )
  }

  return (
    <div className="w-full p-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] hover:border-[color:var(--surface-border-hover)] transition-colors text-left group">
      <div className="flex items-start justify-between mb-3">
        <button onClick={onSelect} className="flex items-start gap-3 text-left">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
          >
            <FileText className="w-5 h-5" style={{ color: LTRFL_BRAND_COLORS.sage }} />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1 line-clamp-1">{template.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full px-2 py-0.5 bg-[color:var(--surface-muted)]">
                {template.category}
              </span>
              {template.subcategory && <span>{template.subcategory}</span>}
            </div>
          </div>
        </button>
        <Sparkles
          className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {template.prompt.slice(0, 120)}...
      </p>

      <div className="flex items-center justify-between gap-2">
        <Button variant="secondary" size="sm" onClick={onUseTemplate}>
          Use Template
        </Button>
        {showAdminActions && (onEdit || onDelete) && (
          <details className="relative">
            <summary className="list-none cursor-pointer text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </summary>
            <div className="absolute right-0 mt-2 w-32 rounded-md border border-[color:var(--surface-border)] bg-[color:var(--surface)] shadow-lg z-10">
              {onEdit && (
                <button
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-[color:var(--surface-muted)]"
                  onClick={onEdit}
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-[color:var(--surface-muted)]"
                  onClick={onDelete}
                >
                  Delete
                </button>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
