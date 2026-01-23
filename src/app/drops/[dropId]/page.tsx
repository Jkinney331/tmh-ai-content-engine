'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  Globe,
  Layers,
  Sparkles,
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

export default function DropProfilePage() {
  const params = useParams()
  const dropId = params.dropId as string
  const [cities, setCities] = useState<City[]>([])
  const [assets, setAssets] = useState<GeneratedAsset[]>([])
  const [dropName, setDropName] = useState('Drop 1')
  const [launchDate, setLaunchDate] = useState('')
  const [collapsedCity, setCollapsedCity] = useState<Record<string, boolean>>({})

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

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Drop Profile</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <input
              value={dropName}
              onChange={(event) => setDropName(event.target.value)}
              className="w-full rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-4 py-3 text-2xl font-semibold text-foreground"
            />
            <p className="mt-1 text-sm text-muted-foreground">Drop ID: {dropId}</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={launchDate}
              onChange={(event) => setLaunchDate(event.target.value)}
              className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-3 py-2 text-sm text-foreground"
            />
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {status}
            </span>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Generate Social Ideas
            </button>
          </div>
        </div>
      </div>

      <section className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Cities in Drop</h2>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-[color:var(--surface-border)] px-3 py-2 text-sm text-muted-foreground">Add City</button>
            <button className="rounded-lg border border-[color:var(--surface-border)] px-3 py-2 text-sm text-muted-foreground">Manage Cities</button>
          </div>
        </div>
        {dropCities.length === 0 && (
          <div className="rounded-lg border border-dashed border-[color:var(--surface-border)] p-6 text-sm text-muted-foreground">
            Add cities to this drop to unlock content sections.
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {dropCities.map((city) => (
            <div key={city.id} className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{city.name}</p>
                  <p className="text-xs text-muted-foreground">{city.country || 'City'}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {assetCountByCity[city.id] || 0} assets
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <Link href={`/cities/${city.id}`} className="text-primary">View Assets</Link>
                <button className="text-destructive">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Individual City Content</h2>
        </div>
        <div className="space-y-4">
          {dropCities.map((city) => {
            const isCollapsed = collapsedCity[city.id]
            const cityAssets = assets.filter((asset) => asset.city_id === city.id)
            return (
              <div key={city.id} className="rounded-xl border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)]">
                <button
                  onClick={() => setCollapsedCity(prev => ({ ...prev, [city.id]: !prev[city.id] }))}
                  className="flex w-full items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{city.name}</p>
                    <p className="text-xs text-muted-foreground">{cityAssets.length} assets</p>
                  </div>
                  {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                </button>
                {!isCollapsed && (
                  <div className="grid grid-cols-1 gap-3 px-4 pb-4 md:grid-cols-3">
                    {cityAssets.length === 0 && (
                      <div className="col-span-full rounded-lg border border-dashed border-[color:var(--surface-border)] p-4 text-xs text-muted-foreground">
                        No approved assets yet.
                      </div>
                    )}
                    {cityAssets.map((asset) => (
                      <div key={asset.id} className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-strong)] p-3">
                        <p className="text-sm font-semibold text-foreground">{asset.content_type}</p>
                        <div className="mt-3 h-28 rounded-lg bg-[color:var(--surface-muted)]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Cross-City Collection Content</h2>
          </div>
          <button className="rounded-lg border border-[color:var(--surface-border)] px-3 py-2 text-sm text-muted-foreground">Generate More</button>
        </div>
        <div className="rounded-lg border border-dashed border-[color:var(--surface-border)] p-6 text-sm text-muted-foreground">
          Cross-city content will appear here once assets are added to the drop.
        </div>
      </section>

      <section className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Social Media Content</h2>
          </div>
          <button className="rounded-lg border border-[color:var(--surface-border)] px-3 py-2 text-sm text-muted-foreground">Generate</button>
        </div>
        <div className="rounded-lg border border-dashed border-[color:var(--surface-border)] p-6 text-sm text-muted-foreground">
          Generate social posts for single-city and cross-city content.
        </div>
      </section>

      <section className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Logistics</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {['Launch Venue', 'Shipping', 'Budget'].map((field) => (
            <div key={field} className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{field}</p>
              <p className="mt-2 text-sm text-foreground">Not set</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Launch Checklist</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            Confirm launch date
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            Approve cross-city assets
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            Schedule social posts
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Confirm Launch</button>
          <button className="rounded-lg border border-[color:var(--surface-border)] px-4 py-2 text-sm text-muted-foreground">Export Drop</button>
        </div>
      </section>
    </div>
  )
}
