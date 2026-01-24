'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCityById, getCityElementsByType } from '@/lib/supabase'
import { Database } from '@/types/database'
import { GlassCard } from '@/components/shared/GlassCard'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Check,
  ChevronDown,
  FileText,
  Image,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'

type City = Database['public']['Tables']['cities']['Row']
type CityElement = Database['public']['Tables']['city_elements']['Row']
type ElementsByType = Record<string, CityElement[]>

type ElementApproval = {
  elementId: string
  status: 'approved' | 'rejected' | 'pending'
  notes?: string
}

type GeneratedAsset = {
  id: string
  output_url: string
  content_type: string
  status: string
  prompt?: string
  model?: string
}

const FLAG_BY_COUNTRY: Record<string, string> = {
  USA: '🇺🇸',
  Japan: '🇯🇵',
  Korea: '🇰🇷',
  France: '🇫🇷',
  UK: '🇬🇧',
  China: '🇨🇳',
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

function CollapsibleBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <details className="group rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-foreground">
        {title}
        <ChevronDown className="h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </details>
  )
}

export default function CityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cityId = params.cityId as string

  const [city, setCity] = useState<City | null>(null)
  const [elements, setElements] = useState<ElementsByType>({})
  const [assets, setAssets] = useState<GeneratedAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvals, setApprovals] = useState<Map<string, ElementApproval>>(new Map())
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [approvingCity, setApprovingCity] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [notes, setNotes] = useState('')
  const notesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCityData()
  }, [cityId])

  useEffect(() => {
    if (!cityId) return
    const stored = window.localStorage.getItem(`tmh-city-notes-${cityId}`)
    if (stored) {
      setNotes(stored)
    } else if (city?.user_notes) {
      setNotes(city.user_notes)
    }
  }, [cityId, city?.user_notes])

  const fetchCityData = async () => {
    try {
      setLoading(true)
      setError(null)

      const cityData = await getCityById(cityId)
      setCity(cityData)

      const elementsData = await getCityElementsByType(cityId)
      setElements(elementsData)

      const assetsResponse = await fetch(`/api/generated-content?city_id=${cityId}`)
      if (assetsResponse.ok) {
        const data = await assetsResponse.json()
        setAssets(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching city data:', err)
      setError('Failed to load city data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprovalChange = (elementId: string, status: 'approved' | 'rejected' | 'pending', notes?: string) => {
    const newApprovals = new Map(approvals)
    newApprovals.set(elementId, { elementId, status, notes })
    setApprovals(newApprovals)
  }

  const handleApproveCityProfile = async () => {
    setApprovingCity(true)
    try {
      const response = await fetch(`/api/cities/${cityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve city profile')
      }

      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)

      await fetchCityData()
    } catch (err) {
      console.error('Error approving city profile:', err)
      setError('Failed to approve city profile. Please try again.')
    } finally {
      setApprovingCity(false)
    }
  }

  const handleSaveDecisions = async () => {
    if (approvals.size === 0) return

    setSaving(true)
    try {
      const approvalsArray = Array.from(approvals.values())

      const response = await fetch(`/api/cities/${cityId}/elements`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalsArray),
      })

      if (!response.ok) {
        throw new Error('Failed to save decisions')
      }

      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)

      await fetchCityData()
      setApprovals(new Map())
    } catch (err) {
      console.error('Error saving decisions:', err)
      setError('Failed to save decisions. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleRunResearch = async () => {
    setIsResearching(true)
    try {
      const response = await fetch(`/api/cities/${cityId}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories: ['slang', 'landmark', 'sport', 'cultural'] }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Research failed to start')
      }

      await fetchCityData()
    } catch (err) {
      console.error('Error running research:', err)
      setError(err instanceof Error ? err.message : 'Failed to run research. Please try again.')
    } finally {
      setIsResearching(false)
    }
  }

  const handleNotesSave = () => {
    if (!cityId) return
    window.localStorage.setItem(`tmh-city-notes-${cityId}`, notes)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const totalElements = useMemo(() => {
    return Object.values(elements).reduce((acc, group) => acc + group.length, 0)
  }, [elements])

  const groupedAssets = useMemo(() => {
    return assets.reduce<Record<string, GeneratedAsset[]>>((acc, asset) => {
      const type = asset.content_type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(asset)
      return acc
    }, {})
  }, [assets])

  const flag = city?.country ? (FLAG_BY_COUNTRY[city.country] || '🏙️') : '🏙️'

  const statCards = [
    { label: 'Population', value: city?.population_notes || 'Not set' },
    { label: 'Streetwear Shops', value: (city?.visual_identity as any)?.shops || 'Not set' },
    { label: 'Market Growth', value: (city?.visual_identity as any)?.growth || 'Not set' },
    { label: 'Avg Spend', value: (city?.visual_identity as any)?.avg_spend || 'Not set' },
  ]

  const researchBlocks = [
    { key: 'slang', title: 'Local Slang' },
    { key: 'landmark', title: 'Key Landmarks' },
    { key: 'sport', title: 'Sports Culture' },
    { key: 'cultural', title: 'Cultural Signals' },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading city profile...
      </div>
    )
  }

  if (!city) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>City not found.</p>
        <Button variant="secondary" onClick={() => router.push('/cities')}>
          Back to Cities
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <GlassCard className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-3xl font-display font-semibold">
              {flag} {city.name}
            </p>
            <p className="text-sm text-muted-foreground">{city.country || 'City Intelligence'}</p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-3 py-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {totalElements > 0 ? 'Research Complete' : 'Research Pending'}
              {city.updated_at && `· Updated ${new Date(city.updated_at).toLocaleDateString()}`}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRunResearch} disabled={isResearching}>
              <Sparkles className="h-4 w-4" />
              {isResearching ? 'Researching...' : 'Start Research'}
            </Button>
            <Button variant="secondary" onClick={() => notesRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              Add Note
            </Button>
            <Button variant="secondary">Export</Button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statCards.map((stat) => (
            <GlassCard key={stat.label} className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-lg font-semibold">{stat.value}</p>
            </GlassCard>
          ))}
        </div>
      </GlassCard>

      <section className="space-y-4">
        <SectionHeader
          icon={BarChart3}
          title="Research Insights"
          actions={
            <>
              <Button variant="secondary" size="sm">
                Ask AI about Research
              </Button>
              <Button variant="secondary" size="sm">
                Add Research Note
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveDecisions}
                disabled={saving || approvals.size === 0}
              >
                Save Decisions
              </Button>
            </>
          }
        />
        <div className="grid gap-4">
          {researchBlocks.map((block) => {
            const blockElements = elements[block.key] || []
            return (
              <CollapsibleBlock key={block.key} title={block.title}>
                {blockElements.length === 0 ? (
                  <p>No research items yet.</p>
                ) : (
                  <div className="space-y-3">
                    {blockElements.map((element) => {
                      const approval = approvals.get(element.id)
                      const status = approval?.status || element.status
                      return (
                        <div key={element.id} className="rounded-lg bg-[color:var(--surface-strong)] p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">{element.element_key}</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprovalChange(element.id, 'approved')}
                                className={status === 'approved' ? 'text-primary' : 'text-muted-foreground'}
                                aria-label="Approve"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleApprovalChange(element.id, 'rejected')}
                                className={status === 'rejected' ? 'text-destructive' : 'text-muted-foreground'}
                                aria-label="Reject"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {typeof element.element_value === 'string'
                              ? element.element_value
                              : JSON.stringify(element.element_value)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CollapsibleBlock>
            )
          })}
        </div>
      </section>

      <div className="h-px w-full bg-[color:var(--surface-border)]" />

      <section ref={notesRef} className="space-y-4">
        <SectionHeader
          icon={FileText}
          title="Your Notes"
          actions={
            <Button variant="secondary" size="sm" onClick={handleNotesSave}>
              Save Note
            </Button>
          }
        />
        <GlassCard className="p-5">
          <textarea
            placeholder="Add notes for this city. The AI will reference these when generating assets."
            className="min-h-[140px] w-full rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3 text-sm text-foreground"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Local notes saved on this device.</span>
            <span>{notes.length} / 1200</span>
          </div>
        </GlassCard>
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={Sparkles}
          title="Design Concepts"
          actions={
            <>
              <Button size="sm">
                <Sparkles className="h-4 w-4" />
                Generate 5 Concepts
              </Button>
              <Button variant="secondary" size="sm">
                Generate More
              </Button>
            </>
          }
        />
        <GlassCard className="p-5 text-sm text-muted-foreground">
          No concepts yet. Generate a batch to begin ideation.
        </GlassCard>
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={Image}
          title="Generated Assets"
          actions={
            <>
              <Button size="sm">Generate New Assets</Button>
              <Button variant="secondary" size="sm">Upload</Button>
            </>
          }
        />
        {Object.keys(groupedAssets).length === 0 && (
          <GlassCard className="p-5 text-sm text-muted-foreground">
            No assets yet. Generate images or videos to populate this section.
          </GlassCard>
        )}
        <div className="grid gap-4">
          {Object.entries(groupedAssets).map(([type, items]) => (
            <GlassCard key={type} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{type.replace(/_/g, ' ')}</p>
                <span className="text-xs text-muted-foreground">{items.length} assets</span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {items.map((asset) => (
                  <div key={asset.id} className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{asset.content_type}</p>
                      <span className="text-xs text-muted-foreground">{asset.status}</span>
                    </div>
                    <div className="mt-3 h-28 w-full rounded-lg bg-[color:var(--surface-strong)]" />
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{asset.model || 'model'}</span>
                      <button className="inline-flex items-center gap-1 text-primary">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={Check}
          title="Approved for Drop"
          actions={
            <Button size="sm" onClick={handleApproveCityProfile} disabled={approvingCity}>
              {approvingCity ? 'Approving...' : 'Approve City Profile'}
            </Button>
          }
        />
        <GlassCard className="p-5 text-sm text-muted-foreground">
          Approve assets and concepts to surface them in drop workflows.
        </GlassCard>
      </section>

      <section className="space-y-4">
        <SectionHeader icon={Sparkles} title="Agentic Insights" />
        <GlassCard className="p-5 text-sm text-muted-foreground">
          AI insights will appear here once you start running city workflows.
        </GlassCard>
      </section>

      {showToast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-lg bg-success px-4 py-3 text-sm text-primary-foreground shadow-lg">
          Saved.
        </div>
      )}
    </div>
  )
}
