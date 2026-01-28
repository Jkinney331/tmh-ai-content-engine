'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Camera,
  Sparkles,
  Loader2,
  Sun,
  Aperture,
  Focus,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface UrnConcept {
  id: string
  name: string
  category: string
  generated_image_url: string | null
}

type PhotoStyle = 'studio' | 'lifestyle' | 'detail' | 'in_situ'
type Setting = 'indoor' | 'outdoor' | 'seasonal'
type Lighting = 'natural' | 'warm' | 'dramatic' | 'soft'
type OutputUse = 'website' | 'catalog' | 'social'

const photoStyles: { id: PhotoStyle; name: string; description: string; icon: React.ElementType }[] = [
  { id: 'studio', name: 'Studio', description: 'Clean background, professional lighting', icon: Aperture },
  { id: 'lifestyle', name: 'Lifestyle', description: 'In a real environment with context', icon: Sun },
  { id: 'detail', name: 'Detail/Close-up', description: 'Focus on craftsmanship and texture', icon: Focus },
  { id: 'in_situ', name: 'In-Situ', description: 'Product in its intended setting', icon: Camera }
]

const settings: { id: Setting; name: string }[] = [
  { id: 'indoor', name: 'Indoor' },
  { id: 'outdoor', name: 'Outdoor/Garden' },
  { id: 'seasonal', name: 'Seasonal' }
]

const lightingOptions: { id: Lighting; name: string; description: string }[] = [
  { id: 'natural', name: 'Natural', description: 'Soft daylight' },
  { id: 'warm', name: 'Warm', description: 'Golden hour feel' },
  { id: 'dramatic', name: 'Dramatic', description: 'High contrast' },
  { id: 'soft', name: 'Soft', description: 'Diffused, even' }
]

const outputUses: { id: OutputUse; name: string }[] = [
  { id: 'website', name: 'Website' },
  { id: 'catalog', name: 'Catalog' },
  { id: 'social', name: 'Social Media' }
]

const propSuggestions: Record<string, string[]> = {
  traditional: ['Fresh flowers', 'Candles', 'Photo frame', 'Soft fabric'],
  nature: ['Plants', 'Garden elements', 'Natural stones', 'Wood accents'],
  modern: ['Clean lines', 'Minimal decor', 'Geometric shapes', 'Neutral tones'],
  memorial: ['Memory book', 'Dried flowers', 'Keepsake items', 'Soft lighting']
}

export default function NewProductPhotoPage() {
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null)
  const [photoStyle, setPhotoStyle] = useState<PhotoStyle>('studio')
  const [setting, setSetting] = useState<Setting>('indoor')
  const [lighting, setLighting] = useState<Lighting>('natural')
  const [outputUse, setOutputUse] = useState<OutputUse>('website')
  const [selectedProps, setSelectedProps] = useState<string[]>([])
  const [customPrompt, setCustomPrompt] = useState('')
  const [cameraAngle, setCameraAngle] = useState('eye-level')
  const [generateCount, setGenerateCount] = useState(4)

  // Data
  const [concepts, setConcepts] = useState<UrnConcept[]>([])
  const [loadingConcepts, setLoadingConcepts] = useState(true)

  // UI state
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConcepts()
  }, [])

  async function loadConcepts() {
    try {
      const res = await fetch('/api/ltrfl/concepts?status=approved&limit=20')
      if (res.ok) {
        const data = await res.json()
        setConcepts(data)
      }
    } catch (error) {
      toast.error('Failed to load concepts')
    } finally {
      setLoadingConcepts(false)
    }
  }

  function toggleProp(prop: string) {
    if (selectedProps.includes(prop)) {
      setSelectedProps(selectedProps.filter(p => p !== prop))
    } else {
      setSelectedProps([...selectedProps, prop])
    }
  }

  function buildPrompt(): string {
    const concept = concepts.find(c => c.id === selectedConcept)
    const styleConfig = photoStyles.find(s => s.id === photoStyle)
    const lightConfig = lightingOptions.find(l => l.id === lighting)

    let prompt = `Professional product photography for LTRFL memorial urns.\n\n`

    if (concept) {
      prompt += `Product: ${concept.name} (${concept.category})\n`
    }

    prompt += `Photography style: ${styleConfig?.name} - ${styleConfig?.description}\n`
    prompt += `Setting: ${settings.find(s => s.id === setting)?.name}\n`
    prompt += `Lighting: ${lightConfig?.name} - ${lightConfig?.description}\n`
    prompt += `Camera angle: ${cameraAngle}\n`
    prompt += `Output use: ${outputUses.find(o => o.id === outputUse)?.name}\n\n`

    prompt += `LTRFL Brand Guidelines:\n`
    prompt += `- Color palette: Sage green (#9CAF88), cream (#F5F1EB), terracotta\n`
    prompt += `- Aesthetic: Premium home decor, warm, inviting\n`
    prompt += `- Include living elements where appropriate (plants, flowers)\n`
    prompt += `- NO clinical, hospital, or funeral home aesthetics\n`
    prompt += `- Celebrate life, not death\n\n`

    if (selectedProps.length > 0) {
      prompt += `Props/Elements: ${selectedProps.join(', ')}\n`
    }

    if (customPrompt) {
      prompt += `\nAdditional instructions: ${customPrompt}`
    }

    return prompt
  }

  async function handleGenerate() {
    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const prompt = buildPrompt()

      const res = await fetch('/api/ltrfl/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'product_photo',
          title,
          prompt,
          concept_id: selectedConcept,
          generated_content: {
            style: photoStyle,
            setting,
            lighting,
            camera_angle: cameraAngle,
            props: selectedProps,
            output_use: outputUse,
            generate_count: generateCount
          }
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create product photo')
      }

      const content = await res.json()
      router.push(`/ltrfl/marketing/${content.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate product photos')
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ltrfl/marketing/product-photos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
          >
            <Camera className="w-5 h-5" style={{ color: LTRFL_BRAND_COLORS.sage }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Generate Product Photos</h1>
            <p className="text-sm text-muted-foreground">Create professional urn photography</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Garden Collection Studio Shots"
          />
        </div>

        {/* Concept Selector */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-3 block">
            Select Urn Concept *
          </label>
          {loadingConcepts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : concepts.length > 0 ? (
            <div className="grid grid-cols-5 gap-3">
              {concepts.map((concept) => (
                <button
                  key={concept.id}
                  onClick={() => setSelectedConcept(concept.id)}
                  className={cn(
                    "aspect-square rounded-lg border-2 overflow-hidden transition-all relative",
                    selectedConcept === concept.id
                      ? "border-[#9CAF88] ring-2 ring-[#9CAF88]/30"
                      : "border-[color:var(--surface-border)] hover:border-[#9CAF88]/50"
                  )}
                >
                  {concept.generated_image_url ? (
                    <img src={concept.generated_image_url} alt={concept.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[color:var(--surface-muted)]">
                      <Sparkles className="w-6 h-6 text-muted-foreground opacity-30" />
                    </div>
                  )}
                  {selectedConcept === concept.id && (
                    <div className="absolute inset-0 bg-[#9CAF88]/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#9CAF88] flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No approved concepts available. <Link href="/ltrfl/concepts/new" className="text-[#9CAF88] hover:underline">Create one first</Link>
            </p>
          )}
        </div>

        {/* Photo Style */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-3 block">Photography Style</label>
          <div className="grid grid-cols-2 gap-3">
            {photoStyles.map((style) => {
              const Icon = style.icon
              return (
                <button
                  key={style.id}
                  onClick={() => setPhotoStyle(style.id)}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all flex items-start gap-3",
                    photoStyle === style.id
                      ? "border-[#9CAF88] bg-[#9CAF88]/10"
                      : "border-[color:var(--surface-border)] hover:border-[#9CAF88]/50"
                  )}
                >
                  <Icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{style.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{style.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Setting & Lighting */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Setting
            </label>
            <select
              value={setting}
              onChange={(e) => setSetting(e.target.value as Setting)}
              className="w-full bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-foreground"
            >
              {settings.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Lighting
            </label>
            <select
              value={lighting}
              onChange={(e) => setLighting(e.target.value as Lighting)}
              className="w-full bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-foreground"
            >
              {lightingOptions.map((l) => (
                <option key={l.id} value={l.id}>{l.name} - {l.description}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Camera & Output */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Camera Angle</label>
            <select
              value={cameraAngle}
              onChange={(e) => setCameraAngle(e.target.value)}
              className="w-full bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-foreground"
            >
              <option value="eye-level">Eye Level</option>
              <option value="high-angle">High Angle (Looking Down)</option>
              <option value="low-angle">Low Angle (Looking Up)</option>
              <option value="45-degree">45 Degree</option>
              <option value="flat-lay">Flat Lay (Top Down)</option>
            </select>
          </div>

          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Output Use</label>
            <select
              value={outputUse}
              onChange={(e) => setOutputUse(e.target.value as OutputUse)}
              className="w-full bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-foreground"
            >
              {outputUses.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Props */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-3 block">Props & Elements (Optional)</label>
          <div className="space-y-3">
            {Object.entries(propSuggestions).map(([category, props]) => (
              <div key={category}>
                <p className="text-xs text-muted-foreground mb-2 capitalize">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {props.map((prop) => (
                    <button
                      key={prop}
                      onClick={() => toggleProp(prop)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-all",
                        selectedProps.includes(prop)
                          ? "bg-[#9CAF88] text-white"
                          : "bg-[color:var(--surface-muted)] text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {prop}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Additional Instructions (Optional)
          </label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Any specific details for the photography..."
            rows={3}
          />
        </div>

        {/* Variations */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Number of Variations
          </label>
          <div className="flex gap-2">
            {[1, 2, 4].map((num) => (
              <button
                key={num}
                onClick={() => setGenerateCount(num)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm transition-all",
                  generateCount === num
                    ? "bg-[#9CAF88] text-white"
                    : "bg-[color:var(--surface-muted)] text-muted-foreground hover:text-foreground"
                )}
              >
                {num} {num === 1 ? 'Photo' : 'Photos'}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={generating || !title.trim() || !selectedConcept}
          className="w-full text-white py-6 text-lg"
          style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Photos...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 mr-2" />
              Generate {generateCount} {generateCount === 1 ? 'Photo' : 'Photos'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
