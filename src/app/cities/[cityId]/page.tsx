'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCityById, getCityElementsByType } from '@/lib/supabase'
import { cityThreadSeeds } from '@/data/cityThreads'
import { Database } from '@/types/database'
import { GlassCard } from '@/components/shared/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BarChart3,
  Check,
  ChevronDown,
  FileText,
  Image,
  Plus,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
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
  created_at?: string
 }

 const FLAG_BY_COUNTRY: Record<string, string> = {
  USA: '🇺🇸',
  'United States': '🇺🇸',
  Japan: '🇯🇵',
  Korea: '🇰🇷',
  'South Korea': '🇰🇷',
  France: '🇫🇷',
  UK: '🇬🇧',
  'United Kingdom': '🇬🇧',
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
  const [conceptApprovals, setConceptApprovals] = useState<Record<string, 'approved' | 'rejected' | 'pending'>>({})
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null)
  const [rejectionTarget, setRejectionTarget] = useState<{ type: 'concept' | 'asset'; id: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [assetSelections, setAssetSelections] = useState<Record<string, boolean>>({})
  const [assetQuantity, setAssetQuantity] = useState(2)
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [approvingCity, setApprovingCity] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesUpdatedAt, setNotesUpdatedAt] = useState<Date | null>(null)
  const notesRef = useRef<HTMLDivElement>(null)

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

  const resolveCityId = async (value: string) => {
    if (isUuid(value)) return value

    const seed = cityThreadSeeds.find((item) => item.id === value)
    const nameFromSlug = seed?.name || value.split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ')

    const createResponse = await fetch('/api/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameFromSlug,
        researchCategories: {
          slang: true,
          landmarks: true,
          sports: true,
          culture: true,
          visualIdentity: true,
          areaCodes: true,
        },
      }),
    })

    if (!createResponse.ok && createResponse.status !== 409) {
      return value
    }

    const listResponse = await fetch('/api/cities')
    if (!listResponse.ok) return value
    const data = await listResponse.json()
    const list = Array.isArray(data) ? data : data.cities || []
    const match = list.find((item: City) => item.name?.toLowerCase() === nameFromSlug.toLowerCase())
    return match?.id || value
  }

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

      const resolvedId = await resolveCityId(cityId)
      if (resolvedId !== cityId) {
        router.replace(`/cities/${resolvedId}`)
        return
      }

      const cityData = await getCityById(resolvedId)
      setCity(cityData)

      const elementsData = await getCityElementsByType(resolvedId)
      setElements(elementsData)

      const assetsResponse = await fetch(`/api/generated-content?city_id=${resolvedId}`)
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
    setNotesUpdatedAt(new Date())
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleConceptApproval = (conceptId: string, status: 'approved' | 'rejected') => {
    setConceptApprovals((prev) => ({ ...prev, [conceptId]: status }))
    if (status === 'rejected') {
      setRejectionTarget({ type: 'concept', id: conceptId })
    }
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

  const topInsightCards = [
    {
      key: 'snapshot',
      title: 'Research Snapshot',
      description: (city as any)?.research_summary || 'Run research to generate a snapshot overview for this city.',
    },
    {
      key: 'signal',
      title: 'Signal Pulse',
      description: (city as any)?.signal_pulse || 'Signal pulse highlights will appear after research completes.',
    },
  ]

  const researchBlocks = [
    { key: 'cultural', title: 'Cultural Signals', elementsKey: 'cultural' },
    { key: 'streetwear', title: 'Streetwear Landscape' },
    { key: 'slang', title: 'Local Slang', elementsKey: 'slang' },
    { key: 'palettes', title: 'Color Palettes' },
    { key: 'typography', title: 'Typography Inspiration' },
    { key: 'landmark', title: 'Key Landmarks', elementsKey: 'landmark' },
    { key: 'music', title: 'Trending Sounds / Music' },
    { key: 'creators', title: 'Notable Local Creators' },
    { key: 'avoid', title: 'What to Avoid' },
  ]

  const conceptCityName = city?.name || 'City'
  const conceptCards = [
    {
      id: 'concept-1',
      name: `${conceptCityName} Night Market Luxe`,
      description: 'Neon-rich night market energy blended with premium embroidery and minimal typography.',
      colorways: 'Midnight teal, jet black, soft gold',
      placement: 'Left chest crest + back skyline',
      tagline: 'City lights. Quiet flex.',
    },
    {
      id: 'concept-2',
      name: `${conceptCityName} Heritage Grid`,
      description: 'Architectural gridlines and archival textures with modern streetwear cuts.',
      colorways: 'Charcoal, bone, signal red',
      placement: 'Center chest lockup',
      tagline: 'Built by the city.',
    },
  ]

  const assetTypeOptions = [
    'Product Shots (with models)',
    'Product Shots (without models)',
    'Ghost Mannequin (photo)',
    'Ghost Mannequin (video)',
    'Lifestyle / Scene Shots',
    'TikTok Ads',
    'IG Ads',
    'Community Content',
  ]

  const approvedAssets = assets.filter((asset) => asset.status === 'approved')
  const placeholderByBlock: Record<string, string> = {
    streetwear: 'Streetwear landscape insights will appear after research completes.',
    palettes: 'Color palette recommendations will appear after research completes.',
    typography: 'Typography inspiration will appear after research completes.',
    music: 'Trending sounds and music references will appear after research completes.',
    creators: 'Notable local creators will appear after research completes.',
  }

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
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-3 py-1">
                Status: {city.status || 'active'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {totalElements > 0 ? 'Research Complete' : 'Research Pending'}
              </span>
              {city.updated_at && (
                <span className="rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-3 py-1">
                  Updated {new Date(city.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Actions</span>
            <div className="flex flex-wrap gap-2">
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
        <div className="grid gap-4 md:grid-cols-2">
          {topInsightCards.map((card) => (
            <GlassCard key={card.key} className="p-4 text-sm text-muted-foreground">
              <p className="text-sm font-semibold text-foreground">{card.title}</p>
              <p className="mt-2 text-xs text-muted-foreground">{card.description}</p>
            </GlassCard>
          ))}
            </div>
        <div className="grid gap-4">
          {researchBlocks.map((block) => {
            const blockElements = block.elementsKey ? elements[block.elementsKey] || [] : []
            const avoidList = Array.isArray((city as any).avoid) ? (city as any).avoid : []
              return (
              <CollapsibleBlock key={block.key} title={block.title}>
                {block.key === 'avoid' ? (
                  avoidList.length === 0 ? (
                    <p>Awaiting avoid list from research.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {avoidList.map((item: any, index: number) => (
                        <li key={`${block.key}-${index}`} className="rounded-lg bg-[color:var(--surface-strong)] p-3">
                          <p className="text-sm font-semibold text-foreground">{item.topic || 'Avoid'}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.reason || 'No reason provided.'}</p>
                        </li>
                      ))}
                    </ul>
                  )
                ) : blockElements.length === 0 ? (
                  <p>{placeholderByBlock[block.key] || 'No research items yet. Run research to populate this section.'}</p>
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
              Pin Note
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
            <span>
              Last edited:{' '}
              {notesUpdatedAt ? notesUpdatedAt.toLocaleString() : 'Not saved yet'}
            </span>
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
        <div className="grid gap-4 md:grid-cols-2">
          {conceptCards.map((concept) => {
            const approval = conceptApprovals[concept.id] || 'pending'
            return (
              <GlassCard key={concept.id} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{concept.name}</p>
                  <span className="text-xs text-muted-foreground capitalize">{approval}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{concept.description}</p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p><span className="text-foreground">Colorways:</span> {concept.colorways}</p>
                  <p><span className="text-foreground">Placement:</span> {concept.placement}</p>
                  <p><span className="text-foreground">Tagline:</span> {concept.tagline}</p>
          </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleConceptApproval(concept.id, 'approved')}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Thumbs Up
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleConceptApproval(concept.id, 'rejected')}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Thumbs Down
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveConceptId(concept.id)}
                    disabled={approval !== 'approved'}
                  >
                    Generate Assets
                  </Button>
          </div>
              </GlassCard>
            )
          })}
        </div>
        {activeConceptId && (
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Generate Assets</p>
                <p className="text-xs text-muted-foreground">
                  {conceptCards.find((concept) => concept.id === activeConceptId)?.name}
                </p>
              </div>
              <button onClick={() => setActiveConceptId(null)} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {assetTypeOptions.slice(0, 6).map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={Boolean(assetSelections[type])}
                    onChange={(event) => setAssetSelections((prev) => ({ ...prev, [type]: event.target.checked }))}
                  />
                  {type}
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Quantity per type</p>
                <Input
                  type="number"
                  min={1}
                  value={assetQuantity}
                  onChange={(event) => setAssetQuantity(Number(event.target.value || 1))}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Model / Pipeline</p>
                <select className="mt-1 w-full rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-3 py-2 text-sm text-foreground">
                  <option>Nano Banana (Primary)</option>
                  <option>OpenAI GPT Image 1.5</option>
                  <option>Dual Model (A/B)</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estimated Cost</p>
                <p className="mt-2 text-lg font-semibold">$ {(assetQuantity * 0.12).toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button>
                <Plus className="h-4 w-4" />
                Generate
              </Button>
              <Button variant="secondary" onClick={() => setActiveConceptId(null)}>
                Cancel
              </Button>
        </div>
          </GlassCard>
        )}
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
          {assetTypeOptions.map((type) => {
            const items = groupedAssets[type] || []
            return (
              <CollapsibleBlock key={type} title={`${type} (${items.length})`}>
                {items.length === 0 ? (
                  <p>No assets yet for this type.</p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {items.map((asset) => (
                  <div key={asset.id} className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3">
                    <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{asset.content_type}</span>
                          <span className="text-xs text-muted-foreground">{asset.status}</span>
                    </div>
                        <div className="mt-3 h-28 w-full rounded-lg bg-[color:var(--surface-strong)]" />
                        <div className="mt-3 text-xs text-muted-foreground">Concept: {asset.prompt || '—'}</div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <Button size="sm" variant="secondary">Approve</Button>
                          <Button size="sm" variant="secondary" onClick={() => setRejectionTarget({ type: 'asset', id: asset.id })}>Reject</Button>
                          <Button size="sm" variant="secondary">Regenerate</Button>
                          <Button size="sm" variant="secondary">View Full</Button>
                          <Button size="sm" variant="secondary">Edit</Button>
                          <Button size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
                )}
              </CollapsibleBlock>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={Check}
          title="Approved for Drop"
          actions={
            <div className="flex flex-wrap gap-2">
              <select className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-3 py-2 text-sm text-foreground">
                <option>Drop 1</option>
                <option>Drop 2</option>
              </select>
              <Button size="sm">Add to Drop</Button>
              <Button size="sm" onClick={handleApproveCityProfile} disabled={approvingCity}>
                {approvingCity ? 'Approving...' : 'Approve City Profile'}
              </Button>
            </div>
          }
        />
        {approvedAssets.length === 0 ? (
          <GlassCard className="p-5 text-sm text-muted-foreground">
            No approved assets yet. Approve items to stage them for a drop.
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {approvedAssets.map((asset) => (
              <GlassCard key={asset.id} className="p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    {asset.content_type}
                  </label>
                  <span>{asset.created_at ? new Date(asset.created_at).toLocaleDateString() : '—'}</span>
                </div>
                <div className="mt-3 h-24 rounded-lg bg-[color:var(--surface-strong)]" />
                <div className="mt-2 text-xs text-muted-foreground">Concept: {asset.prompt || '—'}</div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={Sparkles}
          title="Insights (Agentic Transparency)"
          actions={
            <>
              <Button variant="secondary" size="sm">
                Ask AI about Insights
              </Button>
              <Button size="sm">Create Action Plan</Button>
            </>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {['Execution Plan', 'Reasoning Summary', 'Audit Trail'].map((panel) => (
            <GlassCard key={panel} className="p-4 text-sm text-muted-foreground">
              <p className="text-sm font-semibold text-foreground">{panel}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {panel} will appear here once the assistant runs a workflow.
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {rejectionTarget && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Why didn’t this work?</p>
            <button onClick={() => setRejectionTarget(null)} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <textarea
            placeholder="Share feedback to improve future generations."
            className="mt-3 min-h-[120px] w-full rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3 text-sm text-foreground"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {['Wrong vibe', 'Off-brand', 'Low quality', 'Overdone', 'Other'].map((tag) => (
              <Button key={tag} variant="secondary" size="sm">
                {tag}
              </Button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setRejectionTarget(null)}>Submit</Button>
            <Button variant="secondary" onClick={() => setRejectionTarget(null)}>
              Skip
            </Button>
            <Button variant="ghost" onClick={() => setRejectionTarget(null)}>
              Close
            </Button>
          </div>
        </GlassCard>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-lg bg-success px-4 py-3 text-sm text-primary-foreground shadow-lg">
          Saved.
        </div>
      )}
    </div>
  )
 }
