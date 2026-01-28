'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Image, Plus, Filter, ArrowLeft, Loader2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageAd {
  id: string
  title: string | null
  status: string
  platform: string | null
  dimensions: string | null
  generated_content: {
    image_url?: string
    thumbnail_url?: string
  }
  created_at: string
}

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
  generating: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  review: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  approved: { bg: 'bg-green-500/10', text: 'text-green-400' },
  published: { bg: 'bg-purple-500/10', text: 'text-purple-400' }
}

export default function ImageAdsPage() {
  const [content, setContent] = useState<ImageAd[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')

  useEffect(() => {
    loadContent()
  }, [statusFilter, platformFilter])

  async function loadContent() {
    setLoading(true)
    try {
      let url = '/api/ltrfl/marketing?content_type=image_ad'
      if (statusFilter !== 'all') url += `&status=${statusFilter}`

      const res = await fetch(url)
      if (res.ok) {
        let data = await res.json()
        if (platformFilter !== 'all') {
          data = data.filter((item: ImageAd) => item.platform === platformFilter)
        }
        setContent(data)
      }
    } catch (error) {
      toast.error('Failed to load image ads')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ltrfl/marketing">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Image Ads</h1>
          <p className="text-muted-foreground">
            Design static ad creatives for social media and display networks
          </p>
        </div>
        <Link href="/ltrfl/marketing/image-ads/new">
          <Button
            className="text-white"
            style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Image Ad
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-[color:var(--surface)] rounded-lg border border-[color:var(--surface-border)]">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-1.5 text-foreground"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="generating">Generating</option>
          <option value="review">In Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
        </select>
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="text-sm bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-1.5 text-foreground"
        >
          <option value="all">All Platforms</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="pinterest">Pinterest</option>
          <option value="google">Google Display</option>
          <option value="billboard">Billboard</option>
        </select>
        <span className="text-sm text-muted-foreground ml-auto">
          {content.length} image{content.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
        </div>
      ) : content.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {content.map((ad) => (
            <ImageAdCard key={ad.id} ad={ad} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function ImageAdCard({ ad }: { ad: ImageAd }) {
  const colors = statusColors[ad.status] || statusColors.draft
  const thumbnail = ad.generated_content?.image_url || ad.generated_content?.thumbnail_url

  return (
    <Link href={`/ltrfl/marketing/${ad.id}`}>
      <div className="group bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg overflow-hidden hover:border-[#9CAF88]/50 transition-all">
        {/* Thumbnail */}
        <div className="aspect-square bg-[color:var(--surface-muted)] relative">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={ad.title || 'Image ad'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-12 h-12 text-muted-foreground opacity-30" />
            </div>
          )}

          {/* Dimensions badge */}
          {ad.dimensions && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-black/70 text-white text-xs">
              <Layers className="w-3 h-3" />
              {ad.dimensions}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-foreground truncate group-hover:text-[#9CAF88] transition-colors">
            {ad.title || 'Untitled Ad'}
          </h3>

          <div className="flex items-center justify-between mt-2">
            <span className={cn("text-xs px-2 py-0.5 rounded", colors.bg, colors.text)}>
              {ad.status}
            </span>
            {ad.platform && (
              <span className="text-xs text-muted-foreground capitalize">
                {ad.platform}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {new Date(ad.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
      >
        <Image className="w-8 h-8" style={{ color: LTRFL_BRAND_COLORS.sage }} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No image ads yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Design beautiful static ads for Instagram, Facebook, Pinterest, and display networks.
      </p>
      <Link href="/ltrfl/marketing/image-ads/new">
        <Button
          className="text-white"
          style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Image Ad
        </Button>
      </Link>
    </div>
  )
}
