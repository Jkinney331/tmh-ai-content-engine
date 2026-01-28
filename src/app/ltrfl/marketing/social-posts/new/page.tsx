'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Loader2,
  Hash,
  Image as ImageIcon,
  Instagram,
  AlertCircle
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

type Platform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'pinterest' | 'tiktok'
type PostType = 'image' | 'video' | 'text' | 'link'

interface PlatformConfig {
  id: Platform
  name: string
  charLimit: number
  icon: React.ElementType
}

const platformConfigs: PlatformConfig[] = [
  { id: 'instagram', name: 'Instagram', charLimit: 2200, icon: Instagram },
  { id: 'facebook', name: 'Facebook', charLimit: 63206, icon: MessageSquare },
  { id: 'twitter', name: 'Twitter/X', charLimit: 280, icon: MessageSquare },
  { id: 'linkedin', name: 'LinkedIn', charLimit: 3000, icon: MessageSquare },
  { id: 'pinterest', name: 'Pinterest', charLimit: 500, icon: MessageSquare },
  { id: 'tiktok', name: 'TikTok', charLimit: 2200, icon: MessageSquare }
]

const postTypes: { id: PostType; name: string }[] = [
  { id: 'image', name: 'Image Post' },
  { id: 'video', name: 'Video Post' },
  { id: 'text', name: 'Text Only' },
  { id: 'link', name: 'Link Share' }
]

const suggestedHashtags = {
  memorial: ['#InLovingMemory', '#CelebrationOfLife', '#MemorialKeepsake', '#ForeverRemembered'],
  product: ['#CremationUrn', '#MemorialUrn', '#CustomUrn', '#UniqueUrn'],
  emotional: ['#AlwaysInOurHearts', '#GoneTooSoon', '#RestInPeace', '#MemoryLives'],
  brand: ['#LTRFL', '#LaidToRestForLess', '#EmbraceTheMoment', '#MemorialKeepers']
}

export default function NewSocialPostPage() {
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null)
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [postType, setPostType] = useState<PostType>('image')
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [linkUrl, setLinkUrl] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')

  // Data
  const [concepts, setConcepts] = useState<UrnConcept[]>([])
  const [loadingConcepts, setLoadingConcepts] = useState(true)

  // UI state
  const [generating, setGenerating] = useState(false)
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentPlatform = platformConfigs.find(p => p.id === platform)!
  const captionLength = caption.length + (hashtags.length > 0 ? hashtags.join(' ').length + 2 : 0)
  const isOverLimit = captionLength > currentPlatform.charLimit
  const isNearLimit = captionLength > currentPlatform.charLimit * 0.9

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

  function toggleHashtag(tag: string) {
    if (hashtags.includes(tag)) {
      setHashtags(hashtags.filter(h => h !== tag))
    } else {
      setHashtags([...hashtags, tag])
    }
  }

  async function generateCaptionSuggestions() {
    setGeneratingCaption(true)
    // Stub: In production, this would call an AI endpoint
    setTimeout(() => {
      const concept = concepts.find(c => c.id === selectedConcept)
      const suggestions = [
        concept
          ? `Introducing our ${concept.name} - a beautiful tribute that celebrates life's precious moments. 💚 #LTRFL`
          : `Every life tells a story worth remembering. Our handcrafted urns help preserve those memories with dignity and beauty. 💚 #LTRFL`,
      ]
      setCaption(suggestions[0])
      setGeneratingCaption(false)
    }, 1000)
  }

  function buildPrompt(): string {
    const concept = concepts.find(c => c.id === selectedConcept)

    let prompt = `Create a ${currentPlatform.name} ${postType} post for LTRFL memorial urns.\n\n`

    if (concept) {
      prompt += `Featured product: ${concept.name} (${concept.category})\n`
    }

    prompt += `Platform: ${currentPlatform.name}\n`
    prompt += `Post type: ${postType}\n\n`

    prompt += `Brand voice: Warm, comforting, celebratory of life, NOT morbid.\n`
    prompt += `Avoid: funeral, death, ashes, cremains\n`
    prompt += `Prefer: memorial, keepsake, tribute, remembrance, legacy\n\n`

    if (caption) {
      prompt += `Caption: "${caption}"\n`
    }

    if (hashtags.length > 0) {
      prompt += `Hashtags: ${hashtags.join(' ')}\n`
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

    if (isOverLimit) {
      setError(`Caption exceeds ${currentPlatform.name}'s character limit`)
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const prompt = buildPrompt()
      const fullCaption = caption + (hashtags.length > 0 ? '\n\n' + hashtags.join(' ') : '')

      const res = await fetch('/api/ltrfl/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'social_post',
          title,
          prompt,
          concept_id: selectedConcept,
          platform,
          copy_text: fullCaption,
          generated_content: {
            post_type: postType,
            hashtags,
            link_url: linkUrl || null
          }
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create social post')
      }

      const content = await res.json()
      router.push(`/ltrfl/marketing/${content.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate social post')
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ltrfl/marketing/social-posts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
          >
            <MessageSquare className="w-5 h-5" style={{ color: LTRFL_BRAND_COLORS.sage }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Create Social Post</h1>
            <p className="text-sm text-muted-foreground">Craft engaging social media content</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">Title (Internal) *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Spring Collection Launch Post"
          />
        </div>

        {/* Platform & Post Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-foreground"
            >
              {platformConfigs.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Post Type</label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              className="w-full bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-foreground"
            >
              {postTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Concept Selector */}
        {(postType === 'image' || postType === 'video') && (
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Feature an Urn Concept
            </label>
            {loadingConcepts ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : concepts.length > 0 ? (
              <div className="grid grid-cols-6 gap-2">
                <button
                  onClick={() => setSelectedConcept(null)}
                  className={cn(
                    "aspect-square rounded-lg border-2 flex items-center justify-center transition-all text-xs",
                    selectedConcept === null
                      ? "border-[#9CAF88] bg-[#9CAF88]/10"
                      : "border-[color:var(--surface-border)] hover:border-[#9CAF88]/50"
                  )}
                >
                  None
                </button>
                {concepts.slice(0, 11).map((concept) => (
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
                      <Sparkles className="w-4 h-4 text-muted-foreground opacity-30 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No approved concepts available.</p>
            )}
          </div>
        )}

        {/* Caption */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Caption</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateCaptionSuggestions}
              disabled={generatingCaption}
              className="text-[#9CAF88]"
            >
              {generatingCaption ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              Generate
            </Button>
          </div>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your caption..."
            rows={4}
          />
          <div className={cn(
            "flex items-center justify-between mt-2 text-xs",
            isOverLimit ? "text-red-400" : isNearLimit ? "text-yellow-400" : "text-muted-foreground"
          )}>
            <span>
              {isOverLimit && <AlertCircle className="w-3 h-3 inline mr-1" />}
              {captionLength} / {currentPlatform.charLimit} characters
            </span>
            <span>{currentPlatform.name}</span>
          </div>
        </div>

        {/* Hashtags */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Hashtags
          </label>
          <div className="space-y-3">
            {Object.entries(suggestedHashtags).map(([category, tags]) => (
              <div key={category}>
                <p className="text-xs text-muted-foreground mb-2 capitalize">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleHashtag(tag)}
                      className={cn(
                        "px-2 py-1 rounded-lg text-xs transition-all",
                        hashtags.includes(tag)
                          ? "bg-[#9CAF88] text-white"
                          : "bg-[color:var(--surface-muted)] text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {hashtags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[color:var(--surface-border)]">
              <p className="text-xs text-muted-foreground">Selected: {hashtags.join(' ')}</p>
            </div>
          )}
        </div>

        {/* Link (for link posts) */}
        {postType === 'link' && (
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Link URL</label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </div>
        )}

        {/* Custom Instructions */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Additional Instructions (Optional)
          </label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Any specific details for the post..."
            rows={2}
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
          disabled={generating || !title.trim() || isOverLimit}
          className="w-full text-white py-6 text-lg"
          style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Post...
            </>
          ) : (
            <>
              <MessageSquare className="w-5 h-5 mr-2" />
              Create Social Post
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
