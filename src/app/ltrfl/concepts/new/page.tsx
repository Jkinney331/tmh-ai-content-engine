'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Sparkles,
  FileText,
  Edit3,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ImageVariationGrid } from '@/components/ltrfl/ImageVariationGrid'
import { useLTRFLTemplates } from '@/hooks/useLTRFLTemplates'
import { LTRFLTemplate, LTRFL_CATEGORIES, LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

interface GeneratedImage {
  url: string
  index: number
  generated_at: string
  model: string
  error?: string
}

function ConceptGeneratorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const templateId = searchParams.get('template')
  const promptParam = searchParams.get('prompt')
  const categoryParam = searchParams.get('category')
  const subcategoryParam = searchParams.get('subcategory')
  const parentVersionId = searchParams.get('parent_id')
  const versionParam = Number(searchParams.get('version') || '1')

  const [mode, setMode] = useState<'template' | 'custom'>('template')
  const [template, setTemplate] = useState<LTRFLTemplate | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const customPromptRef = useRef<HTMLTextAreaElement | null>(null)
  const [conceptName, setConceptName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(LTRFL_CATEGORIES[0].name)
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [selectedModel, setSelectedModel] = useState<string>('gemini-pro')
  const [numVariations, setNumVariations] = useState(4)
  const [version, setVersion] = useState(Number.isNaN(versionParam) ? 1 : versionParam)

  const [generating, setGenerating] = useState(false)
  const [showLongGenHint, setShowLongGenHint] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedConceptId, setGeneratedConceptId] = useState<string | null>(null)

  const { templates: templateOptions } = useLTRFLTemplates({
    pageSize: 200,
    page: 1
  })

  // Load template if ID provided
  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId)
      setMode('template')
    }
  }, [templateId])

  useEffect(() => {
    if (!generating) {
      setShowLongGenHint(false)
      return
    }
    const timer = setTimeout(() => setShowLongGenHint(true), 15000)
    return () => clearTimeout(timer)
  }, [generating])

  useEffect(() => {
    if (promptParam) {
      setMode('custom')
      setCustomPrompt(promptParam)
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
    if (subcategoryParam) {
      setSelectedSubcategory(subcategoryParam)
    }
  }, [promptParam, categoryParam, subcategoryParam])

  const loadTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/ltrfl/templates/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTemplate(data)
        setSelectedCategory(data.category)
        setSelectedSubcategory(data.subcategory || '')
        setConceptName(`${data.name} Concept`)
      }
    } catch (error) {
      toast.error('Failed to load template')
    }
  }

  const currentCategory = LTRFL_CATEGORIES.find(c => c.name === selectedCategory)
  const subcategories = currentCategory?.subcategories || []

  const getCustomPromptValue = () => customPromptRef.current?.value ?? customPrompt

  const getPromptToUse = () => {
    if (mode === 'template' && template) {
      return template.prompt
    }
    return getCustomPromptValue()
  }

  const handleGenerate = async () => {
    const prompt = getPromptToUse()
    if (!prompt.trim()) {
      setError('Please enter a prompt or select a template')
      return
    }

    setGenerating(true)
    setError(null)
    setGeneratedImages([])
    setSelectedImageIndex(null)
    setGeneratedConceptId(null)

    try {
      const res = await fetch('/api/ltrfl/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          templateId: mode === 'template' ? template?.id : undefined,
          category: selectedCategory,
          subcategory: selectedSubcategory || undefined,
          name: conceptName.trim() || `${selectedCategory} Concept`,
          model: selectedModel,
          numVariations
        })
      })

      if (!res.ok) {
        // Try to parse as JSON, but handle plain text errors gracefully
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json()
          throw new Error(data.error || 'Generation failed')
        } else {
          const text = await res.text()
          throw new Error(text || `Generation failed (HTTP ${res.status})`)
        }
      }

      const data = await res.json()
      setGeneratedImages(data.images || [])
      setGeneratedConceptId(data.conceptId || null)

      if (data.images && data.images.length > 0) {
        setSelectedImageIndex(0)
      }
      toast.success('Concept images generated')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed'
      setError(message)
      toast.error(message)
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveConcept = async () => {
    if (selectedImageIndex === null || !generatedImages[selectedImageIndex]) {
      setError('Please select an image to save')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // If we already have a concept ID from generation, just update it
      if (generatedConceptId) {
        const res = await fetch(`/api/ltrfl/concepts/${generatedConceptId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: conceptName.trim() || undefined,
            selected_image_index: selectedImageIndex,
            review_notes: conceptName ? `Concept name: ${conceptName}` : null
          })
        })

        if (!res.ok) {
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json()
            throw new Error(data.error || 'Failed to save concept')
          } else {
            const text = await res.text()
            throw new Error(text || `Failed to save concept (HTTP ${res.status})`)
          }
        }

        router.push(`/ltrfl/concepts/${generatedConceptId}`)
        toast.success('Concept saved for review')
        return
      }

      // Fallback: Create new concept with just URLs (no full image data)
      const res = await fetch('/api/ltrfl/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: mode === 'template' ? template?.id : null,
          name: conceptName.trim() || `${selectedCategory} Concept`,
          category: selectedCategory,
          subcategory: selectedSubcategory || null,
          prompt_used: getPromptToUse(),
          // Only send minimal image data (URL and index)
          images: generatedImages.map(img => ({ url: img.url, index: img.index })),
          selected_image_index: selectedImageIndex,
          status: 'reviewing',
          review_notes: conceptName ? `Concept name: ${conceptName}` : null,
          version,
          parent_version_id: parentVersionId || null
        })
      })

      if (!res.ok) {
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to save concept')
        } else {
          const text = await res.text()
          throw new Error(text || `Failed to save concept (HTTP ${res.status})`)
        }
      }

      const data = await res.json()
      router.push(`/ltrfl/concepts/${data.id}`)
      toast.success('Concept saved for review')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save concept'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerateSlot = async (index: number) => {
    const prompt = getPromptToUse()
    if (!prompt.trim()) {
      setError('Please enter a prompt or select a template')
      return
    }

    setRegeneratingIndex(index)
    setError(null)

    try {
      const res = await fetch('/api/ltrfl/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          templateId: mode === 'template' ? template?.id : undefined,
          category: selectedCategory,
          subcategory: selectedSubcategory || undefined,
          name: conceptName || `${selectedCategory} Concept`,
          model: selectedModel,
          numVariations: 1
        })
      })

      if (!res.ok) {
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json()
          throw new Error(data.error || 'Regeneration failed')
        } else {
          const text = await res.text()
          throw new Error(text || `Regeneration failed (HTTP ${res.status})`)
        }
      }

      const data = await res.json()
      const newImage = data.images?.[0]
      if (newImage) {
        setGeneratedImages((prev) => {
          const next = [...prev]
          next[index] = newImage
          return next
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regeneration failed')
    } finally {
      setRegeneratingIndex(null)
    }
  }

  const handleRejectSlot = (index: number) => {
    setGeneratedImages((prev) => prev.filter((_, idx) => idx !== index).map((img, idx) => ({
      ...img,
      index: idx
    })))

    setSelectedImageIndex((prev) => {
      if (prev === null) return null
      if (prev === index) return null
      return prev > index ? prev - 1 : prev
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/ltrfl/concepts"
          className="p-2 rounded-lg hover:bg-[color:var(--surface)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Generate New Concept</h1>
          <p className="text-sm text-muted-foreground">
            Create AI-generated urn design concepts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Configuration */}
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 rounded-lg bg-[color:var(--surface-muted)]">
            <button
              onClick={() => setMode('template')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                mode === 'template'
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={mode === 'template' ? { backgroundColor: LTRFL_BRAND_COLORS.sage } : undefined}
            >
              <FileText className="w-4 h-4" />
              From Template
            </button>
            <button
              onClick={() => setMode('custom')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                mode === 'custom'
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={mode === 'custom' ? { backgroundColor: LTRFL_BRAND_COLORS.sage } : undefined}
            >
              <Edit3 className="w-4 h-4" />
              Custom Prompt
            </button>
          </div>

          {/* Template Mode */}
          {mode === 'template' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Template
                </label>
                <select
                  value={template?.id || ''}
                  onChange={(e) => {
                    const selected = templateOptions.find((option) => option.id === e.target.value) || null
                    setTemplate(selected)
                    if (selected) {
                      setSelectedCategory(selected.category)
                      setSelectedSubcategory(selected.subcategory || '')
                      setConceptName(`${selected.name} Concept`)
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] text-foreground text-sm"
                >
                  <option value="">Select a template</option>
                  {templateOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              {template ? (
                <div className="p-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">{template.name}</h3>
                    <Link
                      href="/ltrfl/templates"
                      className="text-xs hover:underline"
                      style={{ color: LTRFL_BRAND_COLORS.sage }}
                    >
                      Change
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {template.category} {template.subcategory && `• ${template.subcategory}`}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.prompt}
                  </p>
                </div>
              ) : (
                <Link
                  href="/ltrfl/templates"
                  className="block p-6 rounded-lg border-2 border-dashed border-[color:var(--surface-border)] hover:border-[color:var(--surface-border-hover)] transition-colors text-center"
                >
                  <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Select a Template</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Browse the template library to get started
                  </p>
                </Link>
              )}
            </div>
          )}

          {/* Custom Mode */}
          {mode === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Custom Prompt
                </label>
                <Textarea
                  ref={customPromptRef}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe your urn design concept in detail... e.g., 'A sleek baseball-themed urn with stitching details and a wooden base'"
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Category Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      setSelectedSubcategory('')
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] text-foreground text-sm"
                  >
                    {LTRFL_CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Subcategory
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] text-foreground text-sm"
                  >
                    <option value="">Select...</option>
                    {subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Concept Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Concept Name
            </label>
            <Input
              value={conceptName}
              onChange={(e) => setConceptName(e.target.value)}
              placeholder="e.g., Baseball Heritage Urn"
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] text-foreground text-sm"
            >
              <option value="gemini-pro">Gemini Pro (Recommended)</option>
              <option value="gemini-flash">Gemini Flash (Faster)</option>
              <option value="gpt-5-image">GPT-5 Image (Best Quality)</option>
              <option value="gpt-5-image-mini">GPT-5 Image Mini (Budget)</option>
            </select>
          </div>

          {/* Variation Count */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Variations
            </label>
            <select
              value={numVariations}
              onChange={(e) => setNumVariations(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] text-foreground text-sm"
            >
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>
                  {count} variation{count > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

              {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
              {showLongGenHint && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  Generation is taking longer than expected. We are still working—please keep this tab open.
                </div>
              )}

          {/* Generate Button */}
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={
              generating ||
              (mode === 'template' && !template) ||
              (mode === 'custom' && !getCustomPromptValue().trim())
            }
            className="w-full text-white"
            style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Concepts...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate {numVariations} Variation{numVariations > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>

        {/* Right Column: Generated Images */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Generated Concepts</h2>
            {generatedImages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={generating}
              >
                <RefreshCw className={cn("w-4 h-4 mr-1", generating && "animate-spin")} />
                Regenerate
              </Button>
            )}
          </div>

          {generatedImages.length === 0 ? (
            generating ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="aspect-square rounded-lg border-2 border-dashed border-[color:var(--surface-border)] flex items-center justify-center">
                <div className="text-center p-6">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Configure your prompt and click Generate
                  </p>
                </div>
              </div>
            )
          ) : (
            <>
              {/* Main Selected Image */}
              {selectedImageIndex !== null && generatedImages[selectedImageIndex] && (
                <div className="aspect-square rounded-lg overflow-hidden border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
                  <img
                    src={generatedImages[selectedImageIndex].url}
                    alt={`Concept variation ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <ImageVariationGrid
                images={generatedImages}
                selectedIndex={selectedImageIndex}
                onSelect={(index) => setSelectedImageIndex(index)}
                onReject={handleRejectSlot}
                onRegenerate={(index) => {
                  if (regeneratingIndex === null) {
                    handleRegenerateSlot(index)
                  }
                }}
              />

              {/* Save Button */}
              <Button
                onClick={handleSaveConcept}
                disabled={saving || selectedImageIndex === null}
                className="w-full text-white"
                style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Concept...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Selected Concept
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NewConceptPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
      </div>
    }>
      <ConceptGeneratorContent />
    </Suspense>
  )
}
