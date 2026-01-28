'use client'

import { FileText, Sparkles } from 'lucide-react'
import { LTRFLTemplate, LTRFL_BRAND_COLORS } from '@/types/ltrfl'

interface TemplateCardProps {
  template: LTRFLTemplate
  viewMode: 'grid' | 'list'
  onClick: () => void
}

export function TemplateCard({ template, viewMode, onClick }: TemplateCardProps) {
  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 p-3 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] hover:border-[color:var(--surface-border-hover)] transition-colors text-left"
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
        <Sparkles className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] hover:border-[color:var(--surface-border-hover)] transition-colors text-left group"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
        >
          <FileText className="w-5 h-5" style={{ color: LTRFL_BRAND_COLORS.sage }} />
        </div>
        <Sparkles
          className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <h3 className="font-medium text-foreground mb-1 line-clamp-1">{template.name}</h3>

      {template.subcategory && (
        <p className="text-xs text-muted-foreground mb-2">{template.subcategory}</p>
      )}

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {template.prompt.slice(0, 100)}...
      </p>

      {template.variables && Object.keys(template.variables).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.keys(template.variables).slice(0, 3).map((variable) => (
            <span
              key={variable}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[color:var(--surface-muted)] text-muted-foreground"
            >
              {variable}
            </span>
          ))}
          {Object.keys(template.variables).length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[color:var(--surface-muted)] text-muted-foreground">
              +{Object.keys(template.variables).length - 3} more
            </span>
          )}
        </div>
      )}
    </button>
  )
}
