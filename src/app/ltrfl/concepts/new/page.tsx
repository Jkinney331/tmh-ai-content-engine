'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Sparkles,
  FileText,
  Edit3,
  Loader2,
  Check,
  RefreshCw,
  ArrowLeft,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLTRFLTemplates } from '@/hooks/useLTRFLTemplates'
import { LTRFLTemplate, LTRFL_CATEGORIES, LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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

  const [mode, setMode] = useState<'template' | 'custom'>('template')
  const [template, setTemplate] = useState<LTRFLTemplate | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [conceptName, setConceptName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(LTRFL_CATEGORIES[0].name)
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [selectedModel, setSelectedModel] = useState<string>('gemini-pro')
  const [numVariations, setNumVariations] = useState(4)

  const [generating, setGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      console.error('Failed to load template:', error)
    }
  }

  const currentCategory = LTRFL_CATEGORIES.find(c => c.name === selectedCategory)
  const subcategories = currentCategory?.subcategories || []

  const getPromptToUse = () => {
    if (mode === 'template' && template) {
      return template.prompt
    }
    return customPrompt
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
          numVariations
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data = await res.json()
      setGeneratedImages(data.images || [])

      if (data.images && data.images.length > 0) {
        setSelectedImageIndex(0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
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
      const selectedImage = generatedImages[selectedImageIndex]
      const res = await fetch('/api/ltrfl/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: mode === 'template' ? template?.id : null,
          category: selectedCategory,
          subcategory: selectedSubcategory || null,
          prompt_used: getPromptToUse(),
          images: generatedImages,
          selected_image_index: selectedImageIndex,
          status: 'reviewing',
          notes: conceptName ? `Concept name: ${conceptName}` : null
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save concept')
      }

      const data = await res.json()
      router.push(`/ltrfl/concepts/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save concept')
    } finally {
      setSaving(false)
    }
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

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generating || (mode === 'template' && !template) || (mode === 'custom' && !customPrompt.trim())}
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
                Generate 4 Variations
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
            <div className="aspect-square rounded-lg border-2 border-dashed border-[color:var(--surface-border)] flex items-center justify-center">
              <div className="text-center p-6">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {generating
                    ? 'Generating your urn concepts...'
                    : 'Configure your prompt and click Generate'}
                </p>
              </div>
            </div>
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

              {/* Thumbnail Grid */}
              <div
                className={cn(
                  'grid gap-2',
                  numVariations === 1 && 'grid-cols-1',
                  numVariations === 2 && 'grid-cols-2',
                  numVariations === 3 && 'grid-cols-3',
                  numVariations >= 4 && 'grid-cols-4'
                )}
              >
                {generatedImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "aspect-square rounded-lg overflow-hidden border-2 transition-colors relative",
                      selectedImageIndex === index
                        ? "border-[var(--ltrfl-sage)]"
                        : "border-[color:var(--surface-border)] hover:border-[color:var(--surface-border-hover)]"
                    )}
                    style={selectedImageIndex === index ? { borderColor: LTRFL_BRAND_COLORS.sage } : undefined}
                  >
                    <img
                      src={img.url}
                      alt={`Variation ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedImageIndex === index && (
                      <div
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {img.error && (
                      <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                        <span className="text-white text-xs">Error</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

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
