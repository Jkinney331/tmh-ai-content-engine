'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/shared/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mergeCityThreads } from '@/data/cityThreads'
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Globe,
  Layers,
  Plus,
  Sparkles,
  Users,
  Video,
  FileText,
  X,
} from 'lucide-react'

interface City {
  id: string
  name: string
  country?: string | null
  metadata?: Record<string, any>
}

interface GeneratedAsset {
  id: string
  city_id?: string
  content_type: string
  output_url: string
  status: string
  output_metadata?: Record<string, any>
}

function SectionHeader({
  icon: Icon,
  title,
  actions,
}: {
  icon: typeof Sparkles
  title: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  )
}

function statusVariant(status: string) {
  if (status === 'Scheduled') return 'teal'
  if (status === 'Launched') return 'amber'
  return 'default'
}

export default function DropProfilePage() {
  const params = useParams()
  const dropId = params.dropId as string
  const [cities, setCities] = useState<City[]>([])
  const [assets, setAssets] = useState<GeneratedAsset[]>([])
  const [dropName, setDropName] = useState('Drop 1')
  const [launchDate, setLaunchDate] = useState('')
  const [rejectionTarget, setRejectionTarget] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    const load = async () => {
      const response = await fetch('/api/cities')
      if (response.ok) {
        const data = await response.json()
        const resolved = Array.isArray(data) ? data : data.cities || []
        setCities(mergeCityThreads(resolved))
      }
      const assetsResponse = await fetch('/api/generated-content')
      if (assetsResponse.ok) {
        const data = await assetsResponse.json()
        setAssets(data.data || [])
      }
    }

    load()
  }, [])

  const assetTypeGroups = [
    'Product Shots (with models)',
    'Product Shots (without models)',
    'Ghost Mannequin (photo)',
    'Ghost Mannequin (video)',
    'Lifestyle / Scene Shots',
    'TikTok Ads',
    'IG Ads',
    'Community Content',
  ]

  const socialSections = [
    'Single City Posts',
    'All Products Together',
    'Text Ads',
    'Video Ads',
    'Community Content',
  ]

  const checklistItems = [
    { label: 'All product shots approved', priority: 'High' },
    { label: 'All lifestyle shots approved', priority: 'High' },
    { label: 'Video ads finalized', priority: 'Medium' },
    { label: 'Social content scheduled', priority: 'Medium' },
    { label: 'Pricing finalized', priority: 'Low' },
  ]

  const checklistComplete = 2

  const dropAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (asset.status !== 'approved') return false
      const dropIdMeta = (asset as any).output_metadata?.drop_id
      if (!dropIdMeta) {
        return dropId === 'drop-1'
      }
      return dropIdMeta === dropId
    })
  }, [assets, dropId])

  const resolveAssetGroup = (asset: GeneratedAsset) => {
    const title = (asset as any).title as string | undefined
    const lowerTitle = title?.toLowerCase() || ''
    if (lowerTitle.includes('product shot')) return 'Product Shots (with models)'
    if (lowerTitle.includes('lifestyle shot')) return 'Lifestyle / Scene Shots'
    if (lowerTitle.includes('sora video') || lowerTitle.includes('veo video')) return 'TikTok Ads'
    if (asset.content_type === 'video') return 'TikTok Ads'
    if (asset.content_type === 'image') return 'Product Shots (without models)'
    return 'Community Content'
  }

  const assetCountByCity = useMemo(() => {
    return dropAssets.reduce<Record<string, number>>((acc, asset) => {
      if (!asset.city_id) return acc
      acc[asset.city_id] = (acc[asset.city_id] || 0) + 1
      return acc
    }, {})
  }, [dropAssets])

  const assetsByCity = useMemo(() => {
    return dropAssets.reduce<Record<string, GeneratedAsset[]>>((acc, asset) => {
      if (!asset.city_id) return acc
      if (!acc[asset.city_id]) acc[asset.city_id] = []
      acc[asset.city_id].push(asset)
      return acc
    }, {})
  }, [dropAssets])

  const dropCities = useMemo(() => {
    const cityIds = new Set(
      dropAssets.map((asset) => asset.city_id).filter(Boolean) as string[]
    )
    const matched = cities.filter((city) => cityIds.has(city.id))
    return matched.length > 0 ? matched : cities.slice(0, 3)
  }, [cities, dropAssets])

  const status = launchDate
    ? new Date(launchDate) > new Date() ? 'Scheduled' : 'Launched'
    : 'Draft'

  const launchCountdown = useMemo(() => {
    if (!launchDate) return 'Set launch date'
    const now = new Date()
    const target = new Date(launchDate)
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (Number.isNaN(diff)) return 'Set launch date'
    if (diff < 0) return 'Launched'
    if (diff === 0) return 'Launch day'
    return `${diff} days`
  }, [launchDate])

  return (
    <div className="flex flex-col gap-8">
      <GlassCard className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Input value={dropName} onChange={(event) => setDropName(event.target.value)} className="min-w-[240px]" />
              <Badge variant={statusVariant(status)}>{status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-3 py-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>Launch Date</span>
              </div>
              <Input type="date" value={launchDate} onChange={(event) => setLaunchDate(event.target.value)} className="w-[180px]" />
              <span className="text-xs text-muted-foreground">Drop ID: {dropId}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>
              <Sparkles className="h-4 w-4" />
              Generate Social Ideas
            </Button>
            <Button variant="secondary">Edit Drop</Button>
            <Button variant="secondary">Export Drop</Button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Cities in Drop</p>
            <p className="mt-2 text-lg font-semibold">{dropCities.length} Cities</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Total Approved Assets</p>
            <p className="mt-2 text-lg font-semibold">{dropAssets.length} Assets</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Days Until Launch</p>
            <p className="mt-2 text-lg font-semibold">{launchCountdown}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-2 text-lg font-semibold">{status}</p>
          </GlassCard>
        </div>
        <div className="mt-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-4 text-xs text-muted-foreground">
          Correlative search analyzes cities, concepts, and seasonal timing to suggest social ideas. Approve ideas to queue for generation.
        </div>
      </GlassCard>

      <section className="space-y-4">
        <SectionHeader
          icon={Layers}
          title="Cities in Drop"
          actions={
            <>
              <Button variant="secondary" size="sm">
                Add City
              </Button>
              <Button variant="secondary" size="sm">
                Manage Cities
              </Button>
            </>
          }
        />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {dropCities.map((city) => (
            <GlassCard key={city.id} className="min-w-[220px] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{city.name}</p>
                  <p className="text-xs text-muted-foreground">{city.country || 'City'}</p>
                </div>
                {city.metadata?.tier && (
                  <Badge variant="slate" className="text-[10px] uppercase tracking-wide">
                    {city.metadata.tier}
                  </Badge>
                )}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Assets: {assetCountByCity[city.id] || 0}</div>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/cities/${city.id}`}
                  className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                >
                  View Assets
                </Link>
                <Button variant="ghost" size="sm">Remove</Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader icon={Globe} title="Individual City Content" />
        <div className="space-y-4">
          {dropCities.map((city) => (
            <GlassCard key={city.id} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{city.name}</p>
                <span className="text-xs text-muted-foreground">Assets: {assetCountByCity[city.id] || 0}</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {assetTypeGroups.map((group) => {
                  const items = (assetsByCity[city.id] || []).filter(
                    (asset) => resolveAssetGroup(asset) === group
                  )
                  return (
                    <div key={`${city.id}-${group}`} className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground">{group}</p>
                        <span className="text-xs text-muted-foreground">{items.length} items</span>
                      </div>
                      {items.length === 0 ? (
                        <div className="mt-3 text-xs text-muted-foreground">Awaiting approved assets.</div>
                      ) : (
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          {items.map((asset) => (
                            <div key={asset.id} className="rounded-lg bg-[color:var(--surface-strong)] p-2 text-xs text-muted-foreground">
                              <div className="flex items-center justify-between">
                                <span>{asset.content_type}</span>
                                <span className="text-[10px] uppercase">{asset.status}</span>
                              </div>
                              <div className="mt-2 h-20 w-full overflow-hidden rounded bg-[color:var(--surface)]">
                                {asset.output_url ? (
                                  asset.content_type === 'video' ? (
                                    <video src={asset.output_url} className="h-full w-full object-cover" muted playsInline />
                                  ) : (
                                    <img src={asset.output_url} alt="Approved asset" className="h-full w-full object-cover" />
                                  )
                                ) : null}
                              </div>
                              <div className="mt-2 flex gap-2">
                                <Button size="sm" variant="secondary">View Full</Button>
                                <Button size="sm" variant="secondary">Remove</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={Sparkles}
          title="Cross-City Collection Content"
          actions={<Button variant="secondary" size="sm">Generate More</Button>}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {[
            {
              title: 'Midnight Transit Capsule',
              description: 'Cross-city nightlife energy with reflective details.',
              cities: ['Tokyo', 'Seoul', 'New York'],
            },
            {
              title: 'Heritage Grid Collection',
              description: 'Architectural silhouettes and archival typography.',
              cities: ['London', 'Paris', 'Chicago'],
            },
          ].map((item) => (
            <GlassCard key={item.title} className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{item.title}</p>
                <Badge variant="teal">Generating</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {item.cities.map((city) => (
                  <span key={city} className="rounded-full border border-[color:var(--surface-border)] px-2 py-1">
                    {city}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary">Approve</Button>
                <Button size="sm" variant="secondary" onClick={() => setRejectionTarget(item.title)}>Reject</Button>
                <Button size="sm" variant="secondary">Regenerate</Button>
                <Button size="sm">View Full</Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader icon={Sparkles} title="Social Media Content" actions={<Button variant="secondary" size="sm">Generate</Button>} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {socialSections.map((title) => (
            <GlassCard key={title} className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {title.includes('Video') ? <Video className="h-4 w-4 text-primary" /> : title.includes('Text') ? <FileText className="h-4 w-4 text-primary" /> : <Users className="h-4 w-4 text-primary" />}
                {title}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Generate content for this stream.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary">Copy</Button>
                <Button size="sm" variant="secondary">Edit</Button>
                <Button size="sm" variant="secondary">Schedule</Button>
                <Button size="sm" variant="secondary" onClick={() => setRejectionTarget(title)}>Reject</Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={ClipboardList}
          title="Logistics"
          actions={
            <>
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4" />
                Add Field
              </Button>
              <Button variant="secondary" size="sm">Export Logistics</Button>
            </>
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">SKUs</p>
            <p className="mt-2 text-sm text-muted-foreground">Table placeholder</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Inventory</p>
            <p className="mt-2 text-sm text-muted-foreground">Table placeholder</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Pricing</p>
            <p className="mt-2 text-sm text-muted-foreground">Table placeholder</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Shipping Dates</p>
            <div className="mt-2 grid gap-2">
              <Input placeholder="Start date" />
              <Input placeholder="Delivery ETA" />
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Manufacturer Status</p>
            <div className="mt-2 flex gap-2">
              <Badge variant="teal">On Track</Badge>
              <Badge variant="amber">Needs Review</Badge>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Notes</p>
            <textarea className="mt-2 min-h-[100px] w-full rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-2 text-sm text-foreground" />
          </GlassCard>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={CheckCircle2}
          title="Launch Checklist"
          actions={
            <>
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
              <Button size="sm">Confirm Launch</Button>
            </>
          }
        />
        <GlassCard className="p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{checklistComplete} of {checklistItems.length} complete</span>
            <span>{Math.round((checklistComplete / checklistItems.length) * 100)}% ready</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-[color:var(--surface-border)]">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${(checklistComplete / checklistItems.length) * 100}%` }} />
          </div>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            {checklistItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </div>
                <Badge variant="slate">{item.priority}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {rejectionTarget && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Why didn't this work?</p>
            <button onClick={() => setRejectionTarget(null)} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <textarea
            placeholder="Share feedback for this rejection."
            className="mt-3 min-h-[120px] w-full rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3 text-sm text-foreground"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setRejectionTarget(null)}>Submit Feedback</Button>
            <Button variant="secondary" onClick={() => setRejectionTarget(null)}>
              Cancel
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
