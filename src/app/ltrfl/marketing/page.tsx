'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Video,
  Image,
  MessageSquare,
  Camera,
  Plus,
  Filter,
  Calendar,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'

type ContentType = 'video_ad' | 'image_ad' | 'social_post' | 'product_photo'

interface TabConfig {
  id: ContentType
  label: string
  icon: React.ElementType
  description: string
  newRoute: string
}

const tabs: TabConfig[] = [
  {
    id: 'video_ad',
    label: 'Video Ads',
    icon: Video,
    description: 'Create engaging video advertisements',
    newRoute: '/ltrfl/marketing/video-ads/new'
  },
  {
    id: 'image_ad',
    label: 'Image Ads',
    icon: Image,
    description: 'Design static ad creatives',
    newRoute: '/ltrfl/marketing/image-ads/new'
  },
  {
    id: 'social_post',
    label: 'Social Posts',
    icon: MessageSquare,
    description: 'Create social media content',
    newRoute: '/ltrfl/marketing/social-posts/new'
  },
  {
    id: 'product_photo',
    label: 'Product Photos',
    icon: Camera,
    description: 'Generate product photography',
    newRoute: '/ltrfl/marketing/product-photos/new'
  }
]

interface ContentStats {
  video_ad: number
  image_ad: number
  social_post: number
  product_photo: number
  total: number
}

interface MarketingContent {
  id: string
  content_type: ContentType
  title: string | null
  status: string
  platform: string | null
  generated_content: {
    thumbnail_url?: string
    video_url?: string
    image_url?: string
  }
  created_at: string
}

export default function MarketingHubPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('video_ad')
  const [content, setContent] = useState<MarketingContent[]>([])
  const [stats, setStats] = useState<ContentStats>({
    video_ad: 0,
    image_ad: 0,
    social_post: 0,
    product_photo: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadContent()
  }, [activeTab, statusFilter])

  async function loadContent() {
    setLoading(true)
    try {
      let url = `/api/ltrfl/marketing?content_type=${activeTab}`
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`
      }

      const [contentRes, statsRes] = await Promise.all([
        fetch(url),
        fetch('/api/ltrfl/marketing?stats=true')
      ])

      if (contentRes.ok) {
        const data = await contentRes.json()
        setContent(data)
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeTabConfig = tabs.find(t => t.id === activeTab)!
  const filteredContent = content.filter(c => c.content_type === activeTab)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Marketing Content</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create ads, social posts, and product photography
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link href="/ltrfl/marketing/calendar">
            <Button variant="secondary" size="sm" className="sm:size-default">
              <Calendar className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
          </Link>
          <Link href={activeTabConfig.newRoute}>
            <Button
              size="sm"
              className="text-white sm:size-default"
              style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Create {activeTabConfig.label.slice(0, -1)}</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const count = stats[tab.id]

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "p-3 sm:p-4 rounded-lg border transition-all text-left",
                activeTab === tab.id
                  ? "border-[#9CAF88] bg-[#9CAF88]/10"
                  : "border-[color:var(--surface-border)] bg-[color:var(--surface)] hover:border-[#9CAF88]/50"
              )}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    activeTab === tab.id
                      ? "bg-[#9CAF88] text-white"
                      : "bg-[color:var(--surface-muted)] text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{tab.label}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-[color:var(--surface-border)]">
        <div className="flex gap-1 overflow-x-auto pb-0 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-[#9CAF88] text-[#9CAF88]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 pb-3 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg px-2 sm:px-3 py-1.5 text-foreground w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="generating">Generating</option>
            <option value="review">In Review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: LTRFL_BRAND_COLORS.sage }}
          />
        </div>
      ) : filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredContent.map((item) => (
            <MarketingContentCard key={item.id} content={item} />
          ))}
        </div>
      ) : (
        <EmptyState tab={activeTabConfig} />
      )}
    </div>
  )
}

function MarketingContentCard({ content }: { content: MarketingContent }) {
  const tabConfig = tabs.find(t => t.id === content.content_type)
  const Icon = tabConfig?.icon || Image

  const thumbnail =
    content.generated_content?.thumbnail_url ||
    content.generated_content?.image_url ||
    null

  const statusColors: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
    generating: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    review: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    approved: { bg: 'bg-green-500/10', text: 'text-green-400' },
    published: { bg: 'bg-purple-500/10', text: 'text-purple-400' }
  }

  const colors = statusColors[content.status] || statusColors.draft

  return (
    <Link href={`/ltrfl/marketing/${content.id}`}>
      <div className="group bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg overflow-hidden hover:border-[#9CAF88]/50 transition-all">
        {/* Thumbnail */}
        <div className="aspect-video bg-[color:var(--surface-muted)] relative">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={content.title || 'Marketing content'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-12 h-12 text-muted-foreground opacity-30" />
            </div>
          )}

          {/* Content Type Badge */}
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/50 text-white text-xs">
              <Icon className="w-3 h-3" />
              {tabConfig?.label.slice(0, -1)}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-foreground truncate group-hover:text-[#9CAF88] transition-colors">
            {content.title || 'Untitled'}
          </h3>

          <div className="flex items-center justify-between mt-2">
            <span className={cn("text-xs px-2 py-0.5 rounded", colors.bg, colors.text)}>
              {content.status}
            </span>
            {content.platform && (
              <span className="text-xs text-muted-foreground">
                {content.platform}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {new Date(content.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ tab }: { tab: TabConfig }) {
  const Icon = tab.icon

  return (
    <div className="text-center py-20">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
      >
        <Icon className="w-8 h-8" style={{ color: LTRFL_BRAND_COLORS.sage }} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No {tab.label.toLowerCase()} yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {tab.description}. Create your first one to get started.
      </p>
      <Link href={tab.newRoute}>
        <Button
          className="text-white"
          style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create {tab.label.slice(0, -1)}
        </Button>
      </Link>
    </div>
  )
}
