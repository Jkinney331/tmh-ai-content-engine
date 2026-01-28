'use client'

import { X, Sparkles, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LTRFLTemplate, LTRFL_BRAND_COLORS } from '@/types/ltrfl'

interface TemplateDetailModalProps {
  template: LTRFLTemplate
  onClose: () => void
  onUseTemplate: (template: LTRFLTemplate) => void
}

export function TemplateDetailModal({
  template,
  onClose,
  onUseTemplate
}: TemplateDetailModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(template.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[color:var(--surface)] rounded-lg shadow-xl overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--surface-border)]">
          <div>
            <h2 className="font-semibold text-foreground">{template.name}</h2>
            <p className="text-sm text-muted-foreground">
              {template.category} {template.subcategory && `• ${template.subcategory}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[color:var(--surface-muted)] transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[calc(90vh-140px)]">
          {/* Prompt */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Prompt Template</label>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="p-3 rounded-lg bg-[color:var(--surface-muted)] text-sm text-foreground whitespace-pre-wrap font-mono">
              {template.prompt}
            </div>
          </div>

          {/* Variables */}
          {template.variables && Object.keys(template.variables).length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Customizable Variables
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(template.variables).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-2 rounded-lg bg-[color:var(--surface-muted)]"
                  >
                    <div className="text-xs text-muted-foreground">{key}</div>
                    <div className="text-sm text-foreground">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand Colors */}
          {template.brand_colors && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Brand Colors
              </label>
              <div className="flex gap-2">
                {Object.entries(template.brand_colors).map(([name, color]) => (
                  <div key={name} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md border border-[color:var(--surface-border)]"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-muted-foreground">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[color:var(--surface-border)]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onUseTemplate(template)}
            className="text-white"
            style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Use This Template
          </Button>
        </div>
      </div>
    </div>
  )
}
