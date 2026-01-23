'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCityById, getCityElementsByType } from '@/lib/supabase'
import { Database } from '@/types/database'
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  Save,
  Sparkles,
  Flag,
  ThumbsDown,
  ThumbsUp,
  RefreshCw,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
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

const STATUS_STYLES: Record<string, string> = {
  ready: 'bg-success/15 text-success',
  active: 'bg-success/15 text-success',
  approved: 'bg-primary/15 text-primary',
  researching: 'bg-warning/15 text-warning',
  draft: 'bg-muted text-muted-foreground',
  error: 'bg-destructive/15 text-destructive',
}

const FLAG_BY_COUNTRY: Record<string, string> = {
  USA: '🇺🇸',
  Japan: '🇯🇵',
  Korea: '🇰🇷',
  France: '🇫🇷',
  UK: '🇬🇧',
  China: '🇨🇳',
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
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
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
        throw new Error('Research failed to start')
      }

      await fetchCityData()
    } catch (err) {
      console.error('Error running research:', err)
      setError('Failed to run research. Please try again.')
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

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }))
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

  const statusLabel = city?.status || 'draft'
  const statusStyle = STATUS_STYLES[statusLabel] || 'bg-muted text-muted-foreground'
  const flag = city?.country ? (FLAG_BY_COUNTRY[city.country] || '🏙️') : '🏙️'

  const insightBlocks = [
    { key: 'slang', label: 'Local Slang', icon: Flag },
    { key: 'landmark', label: 'Landmarks', icon: MapPin },
    { key: 'sport', label: 'Sports Culture', icon: Sparkles },
    { key: 'cultural', label: 'Cultural Signals', icon: Sparkles },
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
        <button
          onClick={() => router.push('/cities')}
          className="rounded-lg border border-[color:var(--surface-border)] px-4 py-2"
        >
          Back to Cities
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">City Profile</p>
            <h1 className="text-3xl font-bold text-foreground">
              {flag} {city.name}
            </h1>
            <p className="text-sm text-muted-foreground">{city.country || 'City Intelligence'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyle}`}>
            {statusLabel}
          </span>
          <button
            onClick={() => notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="rounded-lg border border-[color:var(--surface-border)] px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Add Note
          </button>
          <button
            onClick={handleRunResearch}
            disabled={isResearching}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {isResearching ? 'Researching...' : 'Start Research'}
          </button>
          <button
            className="rounded-lg border border-[color:var(--surface-border)] px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Population', value: city.population_notes || 'Not set' },
          { label: 'Market Growth', value: (city.visual_identity as any)?.growth || 'Not set' },
          { label: 'Avg Spend', value: (city.visual_identity as any)?.avg_spend || 'Not set' },
          { label: 'Last Updated', value: city.updated_at ? new Date(city.updated_at).toLocaleDateString() : 'Unknown' },
        ].map((stat) => (
          <div key={stat.label} className="surface rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {totalElements > 0 && (
        <section className="surface rounded-xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Research Insights</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSaveDecisions()}
                disabled={saving || approvals.size === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--surface-border)] px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save Decisions
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {insightBlocks.map((block) => {
              const blockElements = elements[block.key] || []
              if (!blockElements.length) return null
              const isCollapsed = collapsedSections[block.key]
              const Icon = block.icon

              return (
                <div key={block.key} className="rounded-xl border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)]">
                  <button
                    onClick={() => toggleSection(block.key)}
                    className="flex w-full items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{block.label}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {blockElements.length}
                      </span>
                    </div>
                    {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {!isCollapsed && (
                    <div className="space-y-3 px-4 pb-4">
                      {blockElements.map((element) => {
                        const approval = approvals.get(element.id)
                        const status = approval?.status || element.status
                        return (
                          <div key={element.id} className="rounded-lg bg-[color:var(--surface-strong)] p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{element.element_key}</p>
                                <p className="text-xs text-muted-foreground">{element.element_type}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprovalChange(element.id, 'approved')}
                                  className={`rounded-lg px-2 py-1 text-xs ${status === 'approved' ? 'bg-success/20 text-success' : 'text-muted-foreground hover:text-success'}`}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleApprovalChange(element.id, 'rejected')}
                                  className={`rounded-lg px-2 py-1 text-xs ${status === 'rejected' ? 'bg-destructive/20 text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-muted-foreground">
                              {typeof element.element_value === 'string'
                                ? element.element_value
                                : JSON.stringify(element.element_value)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section ref={notesRef} className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Your Notes</h2>
          </div>
          <button
            onClick={handleNotesSave}
            className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--surface-border)] px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Capture local insights, design ideas, or operator notes..."
          className="h-32 w-full rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </section>

      <section className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Design Concepts</h2>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Generate 5 Concepts</button>
            <button className="rounded-lg border border-[color:var(--surface-border)] px-3 py-2 text-sm text-muted-foreground">Generate More</button>
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-[color:var(--surface-border)] p-6 text-sm text-muted-foreground">
          No concepts yet. Generate a batch to begin ideation.
        </div>
      </section>

      <section className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Generated Assets</h2>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Generate New Assets</button>
            <button className="rounded-lg border border-[color:var(--surface-border)] px-3 py-2 text-sm text-muted-foreground">Upload</button>
          </div>
        </div>
        {Object.keys(groupedAssets).length === 0 && (
          <div className="rounded-lg border border-dashed border-[color:var(--surface-border)] p-6 text-sm text-muted-foreground">
            No assets yet. Generate images or videos to populate this section.
          </div>
        )}
        <div className="space-y-6">
          {Object.entries(groupedAssets).map(([type, items]) => (
            <div key={type} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{type.replace(/_/g, ' ')}</h3>
                <span className="text-xs text-muted-foreground">{items.length} assets</span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {items.map((asset) => (
                  <div key={asset.id} className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{asset.content_type}</p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{asset.status}</span>
                    </div>
                    <div className="mt-3 h-32 w-full rounded-lg bg-[color:var(--surface-strong)]" />
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{asset.model || 'model'}</span>
                      <button className="inline-flex items-center gap-1 text-primary">
                        <Download className="h-3 w-3" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Approved for Drop</h2>
          </div>
          <button onClick={handleApproveCityProfile} disabled={approvingCity} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
            {approvingCity ? 'Approving...' : 'Approve City Profile'}
          </button>
        </div>
        <div className="rounded-lg border border-dashed border-[color:var(--surface-border)] p-6 text-sm text-muted-foreground">
          Approve assets and concepts to surface them in drop workflows.
        </div>
      </section>

      <section className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Agentic Insights</h2>
        </div>
        <div className="rounded-lg border border-dashed border-[color:var(--surface-border)] p-6 text-sm text-muted-foreground">
          AI insights will appear here once you start running city workflows.
        </div>
      </section>

      {showToast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-lg bg-success px-4 py-3 text-sm text-primary-foreground shadow-lg">
          <CheckCircle className="h-4 w-4" />
          Saved.
        </div>
      )}
    </div>
  )
 }
