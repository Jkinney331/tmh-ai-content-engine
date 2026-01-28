'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Video, Plus, Filter, ArrowLeft, Loader2, Play, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'

interface VideoAd {
  id: string
  title: string | null
  status: string
  platform: string | null
  duration_seconds: number | null
  generated_content: {
    thumbnail_url?: string
    video_url?: string
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

export default function VideoAdsPage() {
  const [content, setContent] = useState<VideoAd[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')

  useEffect(() => {
    loadContent()
  }, [statusFilter, platformFilter])

  async function loadContent() {
    setLoading(true)
    try {
      let url = '/api/ltrfl/marketing?content_type=video_ad'
      if (statusFilter !== 'all') url += `&status=${statusFilter}`

      const res = await fetch(url)
      if (res.ok) {
        let data = await res.json()
        if (platformFilter !== 'all') {
          data = data.filter((item: VideoAd) => item.platform === platformFilter)
        }
        setContent(data)
      }
    } catch (error) {
      console.error('Failed to load video ads:', error)
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
          <h1 className="text-2xl font-bold text-foreground">Video Ads</h1>
          <p className="text-muted-foreground">
            Create engaging video advertisements for your urn products
          </p>
        </div>
        <Link href="/ltrfl/marketing/video-ads/new">
          <Button
            className="text-white"
            style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Video Ad
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
          <option value="instagram">Instagram Reels</option>
          <option value="tiktok">TikTok</option>
          <option value="youtube">YouTube Shorts</option>
          <option value="facebook">Facebook</option>
        </select>
        <span className="text-sm text-muted-foreground ml-auto">
          {content.length} video{content.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
        </div>
      ) : content.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {content.map((video) => (
            <VideoAdCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function VideoAdCard({ video }: { video: VideoAd }) {
  const colors = statusColors[video.status] || statusColors.draft
  const thumbnail = video.generated_content?.thumbnail_url

  return (
    <Link href={`/ltrfl/marketing/${video.id}`}>
      <div className="group bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg overflow-hidden hover:border-[#9CAF88]/50 transition-all">
        {/* Thumbnail */}
        <div className="aspect-video bg-[color:var(--surface-muted)] relative">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={video.title || 'Video ad'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-12 h-12 text-muted-foreground opacity-30" />
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-5 h-5 text-black ml-1" />
            </div>
          </div>

          {/* Duration badge */}
          {video.duration_seconds && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-black/70 text-white text-xs">
              <Clock className="w-3 h-3" />
              {video.duration_seconds}s
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-foreground truncate group-hover:text-[#9CAF88] transition-colors">
            {video.title || 'Untitled Video'}
          </h3>

          <div className="flex items-center justify-between mt-2">
            <span className={cn("text-xs px-2 py-0.5 rounded", colors.bg, colors.text)}>
              {video.status}
            </span>
            {video.platform && (
              <span className="text-xs text-muted-foreground capitalize">
                {video.platform}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {new Date(video.created_at).toLocaleDateString()}
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
        <Video className="w-8 h-8" style={{ color: LTRFL_BRAND_COLORS.sage }} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No video ads yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Create engaging video advertisements for Instagram Reels, TikTok, YouTube Shorts, and more.
      </p>
      <Link href="/ltrfl/marketing/video-ads/new">
        <Button
          className="text-white"
          style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Video Ad
        </Button>
      </Link>
    </div>
  )
}
