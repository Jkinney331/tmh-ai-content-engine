'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Image,
  Sparkles,
  Loader2,
  Layers,
  Type,
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

type AdType = 'single' | 'carousel' | 'before_after'
type Platform = 'instagram' | 'facebook' | 'pinterest' | 'google' | 'billboard'

interface DimensionPreset {
  id: string
  name: string
  width: number
  height: number
  platforms: Platform[]
}

const adTypes: { id: AdType; name: string; description: string }[] = [
  { id: 'single', name: 'Single Image', description: 'One impactful image' },
  { id: 'carousel', name: 'Carousel', description: 'Multiple slides (2-10)' },
  { id: 'before_after', name: 'Before/After', description: 'Comparison layout' }
]

const platforms: { id: Platform; name: string }[] = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'pinterest', name: 'Pinterest' },
  { id: 'google', name: 'Google Display' },
  { id: 'billboard', name: 'Billboard' }
]

const dimensionPresets: DimensionPreset[] = [
  { id: '1:1', name: 'Square (1:1)', width: 1080, height: 1080, platforms: ['instagram', 'facebook'] },
  { id: '4:5', name: 'Portrait (4:5)', width: 1080, height: 1350, platforms: ['instagram', 'facebook'] },
  { id: '9:16', name: 'Story (9:16)', width: 1080, height: 1920, platforms: ['instagram', 'facebook'] },
  { id: '16:9', name: 'Landscape (16:9)', width: 1920, height: 1080, platforms: ['facebook', 'google'] },
  { id: '2:3', name: 'Pinterest (2:3)', width: 1000, height: 1500, platforms: ['pinterest'] },
  { id: 'billboard', name: 'Billboard', width: 2400, height: 1200, platforms: ['billboard'] }
]

export default function NewImageAdPage() {
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null)
  const [adType, setAdType] = useState<AdType>('single')
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [dimensions, setDimensions] = useState('1:1')
  const [headline, setHeadline] = useState('')
  const [bodyCopy, setBodyCopy] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')

  // Data
  const [concepts, setConcepts] = useState<UrnConcept[]>([])
  const [loadingConcepts, setLoadingConcepts] = useState(true)

  // UI state
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConcepts()
  }, [])

  // Filter dimensions by platform
  const availableDimensions = dimensionPresets.filter(d =>
    d.platforms.includes(platform)
  )

  // Auto-select first available dimension when platform changes
  useEffect(() => {
    const available = dimensionPresets.filter(d => d.platforms.includes(platform))
    if (available.length > 0 && !available.find(d => d.id === dimensions)) {
      setDimensions(available[0].id)
    }
  }, [platform])

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

  function buildPrompt(): string {
    const concept = concepts.find(c => c.id === selectedConcept)
    const dimPreset = dimensionPresets.find(d => d.id === dimensions)

    let prompt = `Create a professional ${adType === 'single' ? 'image' : adType} ad for LTRFL memorial urns.\n\n`

    if (concept) {
      prompt += `Featured product: ${concept.name} (${concept.category})\n`
    }

    prompt += `Platform: ${platforms.find(p => p.id === platform)?.name}\n`
    prompt += `Dimensions: ${dimPreset?.width}x${dimPreset?.height} (${dimPreset?.name})\n\n`

    prompt += `Brand aesthetic:\n`
    prompt += `- Warm, natural lighting\n`
    prompt += `- Sage green (#9CAF88), cream (#F5F1EB), terracotta palette\n`
    prompt += `- Premium home decor look\n`
    prompt += `- Living elements (plants, gardens) welcome\n`
    prompt += `- NO clinical or hospital aesthetics\n\n`

    if (headline) {
      prompt += `Headline: "${headline}"\n`
    }

    if (bodyCopy) {
      prompt += `Body copy: "${bodyCopy}"\n`
    }

    if (ctaText) {
      prompt += `CTA button: "${ctaText}"\n`
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
      const dimPreset = dimensionPresets.find(d => d.id === dimensions)

      const res = await fetch('/api/ltrfl/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'image_ad',
          title,
          prompt,
          concept_id: selectedConcept,
          platform,
          dimensions: `${dimPreset?.width}x${dimPreset?.height}`,
          copy_text: bodyCopy || null,
          cta_text: ctaText || null,
          generated_content: {
            ad_type: adType,
            headline,
            dimension_preset: dimensions
          }
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create image ad')
      }

      const content = await res.json()
      router.push(`/ltrfl/marketing/${content.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image ad')
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ltrfl/marketing/image-ads">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
          >
            <Image className="w-5 h-5" style={{ color: LTRFL_BRAND_COLORS.sage }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Create Image Ad</h1>
            <p className="text-sm text-muted-foreground">Design static ad creatives</p>
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
            placeholder="e.g., Memorial Garden Collection Ad"
          />
        </div>

        {/* Concept Selector */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-3 block">
            Feature an Urn Concept (Optional)
          </label>
          {loadingConcepts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : concepts.length > 0 ? (
            <div className="grid grid-cols-5 gap-3">
              <button
                onClick={() => setSelectedConcept(null)}
                className={cn(
                  "aspect-square rounded-lg border-2 flex items-center justify-center transition-all",
                  selectedConcept === null
                    ? "border-[#9CAF88] bg-[#9CAF88]/10"
                    : "border-[color:var(--surface-border)] hover:border-[#9CAF88]/50"
                )}
              >
                <span className="text-xs text-muted-foreground">None</span>
              </button>
              {concepts.slice(0, 9).map((concept) => (
                <button
                  key={concept.id}
                  onClick={() => setSelectedConcept(concept.id)}
                  className={cn(
                    "aspect-square rounded-lg border-2 overflow-hidden transition-all",
                    selectedConcept === concept.id
                      ? "border-[#9CAF88] ring-2 ring-[#9CAF88]/30"
                      : "border-[color:var(--surface-border)] hover:border-[#9CAF88]/50"
                  )}
                >
                  {concept.generated_image_url ? (
                    <img src={concept.generated_image_url} alt={concept.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[color:var(--surface-muted)]">
                      <Sparkles className="w-4 h-4 text-muted-foreground opacity-30" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No approved concepts available.</p>
          )}
        </div>

        {/* Ad Type */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Ad Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {adTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setAdType(type.id)}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all",
                  adType === type.id
                    ? "border-[#9CAF88] bg-[#9CAF88]/10"
                    : "border-[color:var(--surface-border)] hover:border-[#9CAF88]/50"
                )}
              >
                <p className="font-medium text-foreground text-sm">{type.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Platform & Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-foreground"
            >
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Dimensions</label>
            <select
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-full bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-foreground"
            >
              {availableDimensions.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.width}x{d.height})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Copy */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Type className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Ad Copy</span>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Headline</label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., Embrace the Moment"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Body Copy</label>
            <Textarea
              value={bodyCopy}
              onChange={(e) => setBodyCopy(e.target.value)}
              placeholder="e.g., Beautiful, personalized urns that celebrate life..."
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">CTA Button Text</label>
            <Input
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="e.g., Shop Now"
            />
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
            placeholder="Any specific details for the image..."
            rows={3}
          />
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
          disabled={generating || !title.trim()}
          className="w-full text-white py-6 text-lg"
          style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Image Ad...
            </>
          ) : (
            <>
              <Image className="w-5 h-5 mr-2" />
              Create Image Ad
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
