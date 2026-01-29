'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Video,
  Image,
  MessageSquare,
  Camera,
  Play,
  Download,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  Loader2,
  Calendar,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'

type ContentType = 'video_ad' | 'image_ad' | 'social_post' | 'product_photo'
type ContentStatus = 'draft' | 'generating' | 'review' | 'approved' | 'published'

interface MarketingContent {
  id: string
  content_type: ContentType
  title: string | null
  prompt: string
  generated_content: {
    image_url?: string
    video_url?: string
    thumbnail_url?: string
  }
  platform: string | null
  dimensions: string | null
  duration_seconds: number | null
  copy_text: string | null
  cta_text: string | null
  status: ContentStatus
  scheduled_date: string | null
  published_url: string | null
  created_at: string
  updated_at: string
  ltrfl_concepts?: {
    name: string
    category: string
    generated_image_url: string | null
  } | null
}

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>

const contentTypeConfig: Record<ContentType, { icon: IconComponent; label: string; color: string }> = {
  video_ad: { icon: Video, label: 'Video Ad', color: '#9333EA' },
  image_ad: { icon: Image, label: 'Image Ad', color: '#2563EB' },
  social_post: { icon: MessageSquare, label: 'Social Post', color: '#16A34A' },
  product_photo: { icon: Camera, label: 'Product Photo', color: '#EA580C' }
}

const statusConfig: Record<ContentStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  generating: { label: 'Generating', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  review: { label: 'In Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  approved: { label: 'Approved', color: 'text-green-400', bg: 'bg-green-500/10' },
  published: { label: 'Published', color: 'text-purple-400', bg: 'bg-purple-500/10' }
}

export default function MarketingContentDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [content, setContent] = useState<MarketingContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Editable fields
  const [title, setTitle] = useState('')
  const [copyText, setCopyText] = useState('')
  const [ctaText, setCtaText] = useState('')

  useEffect(() => {
    loadContent()
  }, [id])

  async function loadContent() {
    try {
      setLoading(true)
      const res = await fetch(`/api/ltrfl/marketing/${id}`)
      if (res.ok) {
        const data = await res.json()
        setContent(data)
        setTitle(data.title || '')
        setCopyText(data.copy_text || '')
        setCtaText(data.cta_text || '')
      } else {
        setError('Content not found')
      }
    } catch (error) {
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  async function saveChanges() {
    if (!content) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/ltrfl/marketing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          copy_text: copyText || null,
          cta_text: ctaText || null
        })
      })

      if (!res.ok) throw new Error('Failed to save')

      const updated = await res.json()
      setContent(updated)
    } catch (err) {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(newStatus: ContentStatus) {
    if (!content) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/ltrfl/marketing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error('Failed to update status')

      const updated = await res.json()
      setContent(updated)
    } catch (err) {
      setError('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const res = await fetch(`/api/ltrfl/marketing/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete')

      router.push('/ltrfl/marketing')
    } catch (err) {
      setError('Failed to delete content')
    }
  }

  async function handleDuplicate() {
    if (!content) return

    try {
      const res = await fetch('/api/ltrfl/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: content.content_type,
          title: `${content.title || 'Untitled'} (Copy)`,
          prompt: content.prompt,
          platform: content.platform,
          dimensions: content.dimensions,
          duration_seconds: content.duration_seconds,
          copy_text: content.copy_text,
          cta_text: content.cta_text,
          generated_content: content.generated_content
        })
      })

      if (!res.ok) throw new Error('Failed to duplicate')

      const newContent = await res.json()
      router.push(`/ltrfl/marketing/${newContent.id}`)
    } catch (err) {
      setError('Failed to duplicate content')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 mb-4">{error || 'Content not found'}</p>
        <Link href="/ltrfl/marketing">
          <Button variant="secondary">Back to Marketing</Button>
        </Link>
      </div>
    )
  }

  const typeConfig = contentTypeConfig[content.content_type]
  const TypeIcon = typeConfig.icon
  const status = statusConfig[content.status]
  const mediaUrl = content.generated_content?.video_url || content.generated_content?.image_url

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ltrfl/marketing">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${typeConfig.color}20` }}
          >
            <TypeIcon className="w-5 h-5" style={{ color: typeConfig.color }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {content.title || 'Untitled'}
            </h1>
            <p className="text-sm text-muted-foreground">{typeConfig.label}</p>
          </div>
        </div>
        <span className={cn("px-3 py-1 rounded-lg text-sm", status.bg, status.color)}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview */}
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg overflow-hidden">
            <div className="aspect-video bg-black flex items-center justify-center relative">
              {content.content_type === 'video_ad' && content.generated_content?.video_url ? (
                <video
                  src={content.generated_content.video_url}
                  controls
                  className="w-full h-full object-contain"
                  poster={content.generated_content?.thumbnail_url}
                />
              ) : mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt={content.title || 'Content preview'}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <TypeIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
                  <p>No preview available</p>
                </div>
              )}
            </div>

            {/* Media Actions */}
            <div className="p-4 border-t border-[color:var(--surface-border)] flex items-center gap-2">
              {mediaUrl && (
                <>
                  <a
                    href={mediaUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[color:var(--surface-border)] text-sm hover:bg-[color:var(--surface-muted)] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(mediaUrl)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[color:var(--surface-border)] text-sm hover:bg-[color:var(--surface-muted)] transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy URL
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Edit Fields */}
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-foreground">Content Details</h3>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
              />
            </div>

            {(content.content_type === 'social_post' || content.content_type === 'image_ad') && (
              <>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Copy Text</label>
                  <Textarea
                    value={copyText}
                    onChange={(e) => setCopyText(e.target.value)}
                    placeholder="Enter caption or copy text..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Call to Action</label>
                  <Input
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g., Shop Now, Learn More..."
                  />
                </div>
              </>
            )}

            <Button
              onClick={saveChanges}
              disabled={saving}
              className="w-full text-white"
              style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>

          {/* Prompt Used */}
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Prompt Used</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
              {content.prompt}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Actions */}
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-3">Actions</h3>
            <div className="space-y-2">
              {content.status === 'draft' && (
                <Button
                  onClick={() => updateStatus('review')}
                  disabled={saving}
                  className="w-full"
                  style={{ backgroundColor: LTRFL_BRAND_COLORS.brass, color: 'white' }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Review
                </Button>
              )}

              {content.status === 'review' && (
                <Button
                  onClick={() => updateStatus('approved')}
                  disabled={saving}
                  className="w-full text-white"
                  style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              )}

              {content.status === 'approved' && (
                <>
                  <Button
                    onClick={() => updateStatus('published')}
                    disabled={saving}
                    className="w-full text-white"
                    style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Publish Now
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </>
              )}

              {(content.status === 'review' || content.status === 'approved') && (
                <Button
                  onClick={() => updateStatus('draft')}
                  disabled={saving}
                  variant="secondary"
                  className="w-full"
                >
                  Return to Draft
                </Button>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              {content.platform && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="text-foreground capitalize">{content.platform}</span>
                </div>
              )}
              {content.dimensions && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions</span>
                  <span className="text-foreground">{content.dimensions}</span>
                </div>
              )}
              {content.duration_seconds && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground">{content.duration_seconds}s</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {new Date(content.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span className="text-foreground">
                  {new Date(content.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Other Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleDuplicate}
              variant="secondary"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button
              onClick={handleDelete}
              variant="ghost"
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
