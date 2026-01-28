'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Video,
  Sparkles,
  FileText,
  Loader2,
  Play,
  Music,
  Clock,
  Monitor,
  Ratio
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

type VideoStyle = 'product_showcase' | 'lifestyle_moment' | 'slideshow' | 'quote_overlay'
type Duration = 6 | 15 | 30 | 60
type Platform = 'instagram' | 'tiktok' | 'youtube' | 'facebook'
type AspectRatio = '9:16' | '16:9' | '1:1'
type MusicMood = 'peaceful' | 'uplifting' | 'emotional'

interface VideoStyleOption {
  id: VideoStyle
  name: string
  description: string
}

const videoStyles: VideoStyleOption[] = [
  { id: 'product_showcase', name: 'Product Showcase', description: 'Rotating urn with soft music' },
  { id: 'lifestyle_moment', name: 'Lifestyle Moment', description: 'Person interacting with memorial' },
  { id: 'slideshow', name: 'Slideshow Memorial', description: 'Multiple images with transitions' },
  { id: 'quote_overlay', name: 'Quote Overlay', description: 'Inspirational quote with background' }
]

const platforms: { id: Platform; name: string; recommendedRatio: AspectRatio }[] = [
  { id: 'instagram', name: 'Instagram Reels', recommendedRatio: '9:16' },
  { id: 'tiktok', name: 'TikTok', recommendedRatio: '9:16' },
  { id: 'youtube', name: 'YouTube Shorts', recommendedRatio: '9:16' },
  { id: 'facebook', name: 'Facebook', recommendedRatio: '16:9' }
]

const durations: { value: Duration; label: string }[] = [
  { value: 6, label: '6 seconds' },
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '60 seconds' }
]

const aspectRatios: { value: AspectRatio; label: string }[] = [
  { value: '9:16', label: '9:16 (Vertical)' },
  { value: '16:9', label: '16:9 (Horizontal)' },
  { value: '1:1', label: '1:1 (Square)' }
]

const musicMoods: { id: MusicMood; name: string }[] = [
  { id: 'peaceful', name: 'Peaceful' },
  { id: 'uplifting', name: 'Uplifting' },
  { id: 'emotional', name: 'Emotional' }
]

export default function NewVideoAdPage() {
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null)
  const [videoStyle, setVideoStyle] = useState<VideoStyle>('product_showcase')
  const [duration, setDuration] = useState<Duration>(15)
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16')
  const [musicMood, setMusicMood] = useState<MusicMood>('peaceful')
  const [textOverlay, setTextOverlay] = useState('')
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

  // Auto-update aspect ratio when platform changes
  useEffect(() => {
    const platformConfig = platforms.find(p => p.id === platform)
    if (platformConfig) {
      setAspectRatio(platformConfig.recommendedRatio)
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
    const styleConfig = videoStyles.find(s => s.id === videoStyle)
    const concept = concepts.find(c => c.id === selectedConcept)

    let prompt = `Create a ${duration}-second ${styleConfig?.name.toLowerCase()} video ad for LTRFL memorial urns.\n\n`

    if (concept) {
      prompt += `Featured product: ${concept.name} (${concept.category})\n`
    }

    prompt += `Style: ${styleConfig?.description}\n`
    prompt += `Mood: ${musicMood}, comforting, not morbid\n`
    prompt += `Aspect ratio: ${aspectRatio}\n`
    prompt += `Platform: ${platforms.find(p => p.id === platform)?.name}\n\n`

    prompt += `Brand voice: Warm, celebratory of life, premium home decor aesthetic.\n`
    prompt += `Color palette: Sage green (#9CAF88), cream, terracotta, warm natural tones.\n`

    if (textOverlay) {
      prompt += `\nText overlay: "${textOverlay}"\n`
    }

    if (ctaText) {
      prompt += `Call to action: "${ctaText}"\n`
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

      // Create the marketing content record
      const res = await fetch('/api/ltrfl/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'video_ad',
          title,
          prompt,
          concept_id: selectedConcept,
          platform,
          dimensions: aspectRatio,
          duration_seconds: duration,
          copy_text: textOverlay || null,
          cta_text: ctaText || null,
          generated_content: {
            style: videoStyle,
            music_mood: musicMood
          }
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create video ad')
      }

      const content = await res.json()

      // Note: Actual video generation would be triggered here
      // For now, redirect to the content detail page

      router.push(`/ltrfl/marketing/${content.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video ad')
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ltrfl/marketing/video-ads">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
          >
            <Video className="w-5 h-5" style={{ color: LTRFL_BRAND_COLORS.sage }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Create Video Ad</h1>
            <p className="text-sm text-muted-foreground">Generate engaging video content</p>
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
            placeholder="e.g., Spring Collection Showcase"
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
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => setSelectedConcept(null)}
                className={cn(
                  "aspect-square rounded-lg border-2 flex items-center justify-center transition-all",
                  selectedConcept === null
                    ? "border-[#9CAF88] bg-[#9CAF88]/10"
                    : "border-[color:var(--surface-border)] hover:border-[#9CAF88]/50"
                )}
              >
                <span className="text-sm text-muted-foreground">None</span>
              </button>
              {concepts.map((concept) => (
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
                    <img
                      src={concept.generated_image_url}
                      alt={concept.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[color:var(--surface-muted)]">
                      <Sparkles className="w-6 h-6 text-muted-foreground opacity-30" />
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

        {/* Video Style */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-3 block">Video Style</label>
          <div className="grid grid-cols-2 gap-3">
            {videoStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setVideoStyle(style.id)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all",
                  videoStyle === style.id
                    ? "border-[#9CAF88] bg-[#9CAF88]/10"
                    : "border-[color:var(--surface-border)] hover:border-[#9CAF88]/50"
                )}
              >
                <p className="font-medium text-foreground">{style.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{style.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Platform & Format */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Monitor className="w-4 h-4" />
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
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Ratio className="w-4 h-4" />
              Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-foreground"
            >
              {aspectRatios.map((ar) => (
                <option key={ar.value} value={ar.value}>{ar.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration & Music */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) as Duration)}
              className="w-full bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-foreground"
            >
              {durations.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Music className="w-4 h-4" />
              Music Mood
            </label>
            <select
              value={musicMood}
              onChange={(e) => setMusicMood(e.target.value as MusicMood)}
              className="w-full bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-foreground"
            >
              {musicMoods.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Overlay & CTA */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Text Overlay (Optional)
            </label>
            <Input
              value={textOverlay}
              onChange={(e) => setTextOverlay(e.target.value)}
              placeholder="e.g., Celebrate Their Legacy"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Call to Action (Optional)
            </label>
            <Input
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="e.g., Shop Now, Learn More"
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
            placeholder="Any specific details or requirements for the video..."
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
              Creating Video Ad...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Create Video Ad
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Video generation may take a few minutes. You&apos;ll be redirected to view progress.
        </p>
      </div>
    </div>
  )
}
