'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/shared/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Globe,
  Layers,
  Sparkles,
  Users,
  Video,
  FileText,
} from 'lucide-react'

interface City {
  id: string
  name: string
  country?: string | null
}

interface GeneratedAsset {
  id: string
  city_id?: string
  content_type: string
  output_url: string
  status: string
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

  useEffect(() => {
    const load = async () => {
      const response = await fetch('/api/cities')
      if (response.ok) {
        const data = await response.json()
        setCities(Array.isArray(data) ? data : data.cities || [])
      }
      const assetsResponse = await fetch('/api/generated-content')
      if (assetsResponse.ok) {
        const data = await assetsResponse.json()
        setAssets(data.data || [])
      }
    }

    load()
  }, [])

  const dropCities = useMemo(() => cities.slice(0, 3), [cities])

  const assetCountByCity = useMemo(() => {
    return assets.reduce<Record<string, number>>((acc, asset) => {
      if (!asset.city_id) return acc
      acc[asset.city_id] = (acc[asset.city_id] || 0) + 1
      return acc
    }, {})
  }, [assets])

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
            <p className="mt-2 text-lg font-semibold">{assets.length} Assets</p>
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
        <GlassCard className="p-5 text-sm text-muted-foreground">
          Curate approved assets city by city. (Connect approvals to surface real assets here.)
        </GlassCard>
      </section>

      <section className="space-y-4">
        <SectionHeader icon={Sparkles} title="Cross-City Collection Content" actions={<Button variant="secondary" size="sm">Generate More</Button>} />
        <GlassCard className="p-5 text-sm text-muted-foreground">
          Cross-city content will appear here once assets are added to the drop.
        </GlassCard>
      </section>

      <section className="space-y-4">
        <SectionHeader icon={Sparkles} title="Social Media Content" actions={<Button variant="secondary" size="sm">Generate</Button>} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[{ title: 'Single City Posts', icon: Globe }, { title: 'All Products Together', icon: Layers }, { title: 'Text Ads', icon: FileText }, { title: 'Video Ads', icon: Video }, { title: 'Community Content', icon: Users }].map((item) => (
            <GlassCard key={item.title} className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <item.icon className="h-4 w-4 text-primary" />
                {item.title}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Generate assets for this content stream.</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader icon={ClipboardList} title="Logistics" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {['Launch Venue', 'Shipping', 'Budget'].map((field) => (
            <GlassCard key={field} className="p-4">
              <p className="text-xs text-muted-foreground">{field}</p>
              <p className="mt-2 text-sm">Not set</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader icon={CheckCircle2} title="Launch Checklist" />
        <GlassCard className="p-5">
          <div className="space-y-3 text-sm text-muted-foreground">
            {[
              'All product shots approved',
              'All lifestyle shots approved',
              'Video ads finalized',
              'Social content scheduled',
              'Pricing finalized',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button>Confirm Launch</Button>
            <Button variant="secondary">Export Drop</Button>
          </div>
        </GlassCard>
      </section>
    </div>
  )
}
