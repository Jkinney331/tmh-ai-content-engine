'use client'

import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { LTRFLTemplate, LTRFLTemplateInsert, LTRFLTemplateUpdate, LTRFL_CATEGORIES } from '@/types/ltrfl'

interface TemplateEditorProps {
  template?: LTRFLTemplate | null
  onClose: () => void
  onSave: (payload: LTRFLTemplateInsert | LTRFLTemplateUpdate) => Promise<void> | void
}

export function TemplateEditor({ template, onClose, onSave }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name ?? '')
  const [category, setCategory] = useState(template?.category ?? LTRFL_CATEGORIES[0]?.name ?? '')
  const [subcategory, setSubcategory] = useState(template?.subcategory ?? '')
  const [prompt, setPrompt] = useState(template?.prompt ?? '')
  const [variablesText, setVariablesText] = useState(
    JSON.stringify(
      template?.variables ?? { color: 'sage', size: 'adult', personalization: 'name + dates' },
      null,
      2
    )
  )
  const [isActive, setIsActive] = useState(template?.is_active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const subcategoryOptions = useMemo(() => {
    const entry = LTRFL_CATEGORIES.find((cat) => cat.name === category)
    return entry?.subcategories ?? []
  }, [category])

  const handleSave = async () => {
    if (!name.trim() || !category.trim() || !prompt.trim()) {
      setError('Name, category, and prompt are required.')
      return
    }

    let variables: Record<string, string> = {}
    try {
      variables = variablesText ? JSON.parse(variablesText) : {}
    } catch (err) {
      setError('Variables must be valid JSON.')
      return
    }

    setError(null)
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        category,
        subcategory: subcategory || null,
        prompt: prompt.trim(),
        variables,
        is_active: isActive
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[color:var(--surface)] rounded-lg shadow-xl overflow-hidden mx-4">
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--surface-border)]">
          <div>
            <h2 className="font-semibold text-foreground">
              {template ? 'Edit Template' : 'Create Template'}
            </h2>
            <p className="text-sm text-muted-foreground">Define prompts and variables for urn concept generation.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[color:var(--surface-muted)] transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(90vh-140px)] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setSubcategory('')
                }}
                className="w-full rounded-md border border-[color:var(--surface-border)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              >
                {LTRFL_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Subcategory</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full rounded-md border border-[color:var(--surface-border)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              >
                <option value="">Select a subcategory</option>
                {subcategoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <span className="text-sm text-muted-foreground">
                {isActive ? 'Active template' : 'Inactive template'}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the urn concept prompt..."
              rows={5}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Variables (JSON)</label>
            <Textarea
              value={variablesText}
              onChange={(e) => setVariablesText(e.target.value)}
              placeholder='{"color":"sage","size":"adult","personalization":"name + dates"}'
              rows={4}
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-[color:var(--surface-border)]">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>
    </div>
  )
}
