'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageSquare, Plus, Filter, ArrowLeft, Loader2, Hash, Instagram, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SocialPost {
  id: string
  title: string | null
  status: string
  platform: string | null
  copy_text: string | null
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

type IconComponent = React.ComponentType<{ className?: string }>

const platformIcons: Record<string, IconComponent> = {
  instagram: Instagram,
  facebook: Facebook,
}

export default function SocialPostsPage() {
  const [content, setContent] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')

  useEffect(() => {
    loadContent()
  }, [statusFilter, platformFilter])

  async function loadContent() {
    setLoading(true)
    try {
      let url = '/api/ltrfl/marketing?content_type=social_post'
      if (statusFilter !== 'all') url += `&status=${statusFilter}`

      const res = await fetch(url)
      if (res.ok) {
        let data = await res.json()
        if (platformFilter !== 'all') {
          data = data.filter((item: SocialPost) => item.platform === platformFilter)
        }
        setContent(data)
      }
    } catch (error) {
      toast.error('Failed to load social posts')
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
          <h1 className="text-2xl font-bold text-foreground">Social Posts</h1>
          <p className="text-muted-foreground">
            Create engaging social media content for all platforms
          </p>
        </div>
        <Link href="/ltrfl/marketing/social-posts/new">
          <Button
            className="text-white"
            style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
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
          <option value="twitter">Twitter/X</option>
          <option value="linkedin">LinkedIn</option>
          <option value="pinterest">Pinterest</option>
          <option value="tiktok">TikTok</option>
        </select>
        <span className="text-sm text-muted-foreground ml-auto">
          {content.length} post{content.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
        </div>
      ) : content.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map((post) => (
            <SocialPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function SocialPostCard({ post }: { post: SocialPost }) {
  const colors = statusColors[post.status] || statusColors.draft
  const thumbnail = post.generated_content?.image_url || post.generated_content?.thumbnail_url
  const PlatformIcon = platformIcons[post.platform || ''] || Hash

  return (
    <Link href={`/ltrfl/marketing/${post.id}`}>
      <div className="group bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg overflow-hidden hover:border-[#9CAF88]/50 transition-all">
        {/* Header with platform */}
        <div className="flex items-center gap-2 p-3 border-b border-[color:var(--surface-border)]">
          <PlatformIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground capitalize">{post.platform || 'Multi-platform'}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded ml-auto", colors.bg, colors.text)}>
            {post.status}
          </span>
        </div>

        {/* Content */}
        <div className="p-3">
          {thumbnail && (
            <div className="aspect-square rounded-lg overflow-hidden mb-3">
              <img
                src={thumbnail}
                alt={post.title || 'Social post'}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h3 className="font-medium text-foreground truncate group-hover:text-[#9CAF88] transition-colors">
            {post.title || 'Untitled Post'}
          </h3>

          {post.copy_text && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {post.copy_text}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            {new Date(post.created_at).toLocaleDateString()}
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
        <MessageSquare className="w-8 h-8" style={{ color: LTRFL_BRAND_COLORS.sage }} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No social posts yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Create engaging social media content with AI-generated captions and images.
      </p>
      <Link href="/ltrfl/marketing/social-posts/new">
        <Button
          className="text-white"
          style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </Link>
    </div>
  )
}
