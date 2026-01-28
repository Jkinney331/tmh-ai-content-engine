'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Camera, Plus, Filter, ArrowLeft, Loader2, Sun, Aperture } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ProductPhoto {
  id: string
  title: string | null
  status: string
  generated_content: {
    image_url?: string
    thumbnail_url?: string
    style?: string
    setting?: string
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

export default function ProductPhotosPage() {
  const [content, setContent] = useState<ProductPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [styleFilter, setStyleFilter] = useState('all')

  useEffect(() => {
    loadContent()
  }, [statusFilter, styleFilter])

  async function loadContent() {
    setLoading(true)
    try {
      let url = '/api/ltrfl/marketing?content_type=product_photo'
      if (statusFilter !== 'all') url += `&status=${statusFilter}`

      const res = await fetch(url)
      if (res.ok) {
        let data = await res.json()
        if (styleFilter !== 'all') {
          data = data.filter((item: ProductPhoto) =>
            item.generated_content?.style === styleFilter
          )
        }
        setContent(data)
      }
    } catch (error) {
      toast.error('Failed to load product photos')
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
          <h1 className="text-2xl font-bold text-foreground">Product Photos</h1>
          <p className="text-muted-foreground">
            Generate professional product photography for your urn catalog
          </p>
        </div>
        <Link href="/ltrfl/marketing/product-photos/new">
          <Button
            className="text-white"
            style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Photos
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
        </select>
        <select
          value={styleFilter}
          onChange={(e) => setStyleFilter(e.target.value)}
          className="text-sm bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-1.5 text-foreground"
        >
          <option value="all">All Styles</option>
          <option value="studio">Studio</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="detail">Detail/Close-up</option>
          <option value="in-situ">In-Situ</option>
        </select>
        <span className="text-sm text-muted-foreground ml-auto">
          {content.length} photo{content.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
        </div>
      ) : content.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {content.map((photo) => (
            <ProductPhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function ProductPhotoCard({ photo }: { photo: ProductPhoto }) {
  const colors = statusColors[photo.status] || statusColors.draft
  const thumbnail = photo.generated_content?.image_url || photo.generated_content?.thumbnail_url
  const style = photo.generated_content?.style

  return (
    <Link href={`/ltrfl/marketing/${photo.id}`}>
      <div className="group bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg overflow-hidden hover:border-[#9CAF88]/50 transition-all">
        {/* Thumbnail */}
        <div className="aspect-square bg-[color:var(--surface-muted)] relative">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={photo.title || 'Product photo'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-muted-foreground opacity-30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
            {style && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/70 text-white text-xs capitalize">
                {style === 'studio' && <Aperture className="w-3 h-3" />}
                {style === 'lifestyle' && <Sun className="w-3 h-3" />}
                {style}
              </div>
            )}
            <span className={cn("text-xs px-2 py-0.5 rounded", colors.bg, colors.text)}>
              {photo.status}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-2">
          <h3 className="text-sm font-medium text-foreground truncate group-hover:text-[#9CAF88] transition-colors">
            {photo.title || 'Untitled'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(photo.created_at).toLocaleDateString()}
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
        <Camera className="w-8 h-8" style={{ color: LTRFL_BRAND_COLORS.sage }} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No product photos yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Generate professional product photography with various styles and settings.
      </p>
      <Link href="/ltrfl/marketing/product-photos/new">
        <Button
          className="text-white"
          style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Photos
        </Button>
      </Link>
    </div>
  )
}
