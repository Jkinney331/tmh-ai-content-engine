'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCityById } from '@/lib/supabase'
import { cityThreadSeeds } from '@/data/cityThreads'
import { Database } from '@/types/database'
import { GlassCard } from '@/components/shared/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AssetDetailModal from '@/components/AssetDetailModal'
import { useChatStore } from '@/stores/chatStore'
import {
  BarChart3,
  Check,
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
  output_metadata?: Record<string, any>
  title?: string
  duration_seconds?: number | null
  cities?: { id: string; name: string } | null
 }

type ConceptCard = {
  id: string
  name: string
  description: string
  colorways: string
  placement: string
  tagline: string
}

type ResearchStatus = 'idle' | 'running' | 'completed' | 'failed'

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

const HIDDEN_ELEMENT_FIELDS = new Set(['query', 'search_query'])

const pickFirstText = (...values: Array<unknown>) =>
  values.find((value) => typeof value === 'string' && value.trim().length > 0) as string | undefined

const formatElementTitle = (element: CityElement) => {
  const value = element.element_value as any
  return (
    pickFirstText(
      value?.name,
      value?.term,
      value?.team,
      value?.artist,
      value?.creator,
      value?.topic,
      value?.style,
      value?.code,
      value?.genre,
      value?.venue,
      value?.area,
      value?.palette,
      value?.symbol
    ) || element.element_key.replace(/_/g, ' ')
  )
}

const formatElementBody = (element: CityElement) => {
  const value = element.element_value as any
  const primary =
    pickFirstText(
      value?.description,
      value?.meaning,
      value?.significance,
      value?.details,
      value?.usage,
      value?.guidance,
      value?.notes,
      value?.response,
      value?.summary
    ) || ''

  const metaParts: string[] = []
  if (value?.sport && value?.team) metaParts.push(`${value.team} (${value.sport})`)
  if (value?.venue) metaParts.push(`Venue: ${value.venue}`)
  if (value?.league) metaParts.push(`League: ${value.league}`)
  if (value?.area && value?.code) metaParts.push(`Area: ${value.area} (${value.code})`)
  if (Array.isArray(value?.colors) && value.colors.length > 0) {
    metaParts.push(`Colors: ${value.colors.join(', ')}`)
  }

  const fallback =
    typeof element.element_value === 'string'
      ? element.element_value
      : JSON.stringify(
          Object.fromEntries(
            Object.entries(value || {}).filter(([key]) => !HIDDEN_ELEMENT_FIELDS.has(key))
          )
        )
  const normalizedFallback = fallback === '{}' || fallback === '[]' ? '' : fallback

  return {
    primary: primary || normalizedFallback,
    meta: metaParts.length > 0 ? metaParts.join(' • ') : ''
  }
}

function CollapsibleBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-4">
      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
        {title}
      </div>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </div>
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
  const [conceptCards, setConceptCards] = useState<ConceptCard[]>([])
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false)
  const [editingAsset, setEditingAsset] = useState<GeneratedAsset | null>(null)
  const [previewAsset, setPreviewAsset] = useState<GeneratedAsset | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [approvingCity, setApprovingCity] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [researchStatus, setResearchStatus] = useState<ResearchStatus>('idle')
  const [researchUpdatedAt, setResearchUpdatedAt] = useState<Date | null>(null)
  const [researchError, setResearchError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [notesUpdatedAt, setNotesUpdatedAt] = useState<Date | null>(null)
  const notesRef = useRef<HTMLDivElement>(null)
  const {
    currentConversation,
    addMessage,
    setLoading: setChatLoading,
    setError: setChatError,
    startNewConversation,
  } = useChatStore()

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
        skipResearch: true,
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

  // Concept card initialization moved after buildConceptCards definition

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

      const elementsResponse = await fetch(`/api/cities/${resolvedId}/elements`)
      if (elementsResponse.ok) {
        const elementsList = await elementsResponse.json()
        const grouped = (elementsList as any[]).reduce((acc: Record<string, CityElement[]>, element) => {
          const type = element.element_type
          if (!acc[type]) acc[type] = []
          acc[type].push(element)
          return acc
        }, {})
        setElements(grouped)
      } else {
        setElements({})
      }

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
    setResearchStatus('running')
    setResearchError(null)
    setError(null)
    try {
      const response = await fetch(`/api/cities/${cityId}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: [
            'slang',
            'landmark',
            'sport',
            'cultural',
            'visualIdentity',
            'areaCodes',
            'palettes',
            'typography',
            'music',
            'creators',
            'avoid',
          ],
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Research failed to start')
      }

      const data = await response.json()

      // If the API returned elements directly (fallback mode), use them
      if (data.elements && Array.isArray(data.elements) && data.elements.length > 0) {
        const grouped = data.elements.reduce((acc: Record<string, CityElement[]>, element: any) => {
          const type = element.element_type
          if (!acc[type]) acc[type] = []
          acc[type].push({
            id: element.element_key || `temp-${Date.now()}-${Math.random()}`,
            city_id: cityId,
            element_type: element.element_type,
            element_key: element.element_key,
            element_value: element.element_value,
            status: element.status || 'pending',
            notes: element.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as CityElement)
          return acc
        }, {} as Record<string, CityElement[]>)
        setElements(grouped)

        // Show warning if data wasn't saved
        if (data.warning) {
          setError(data.warning)
        }
      } else {
        // Fetch from database if elements were saved
        await fetchCityData()
      }

      setResearchStatus('completed')
      setResearchUpdatedAt(new Date())
    } catch (err) {
      console.error('Error running research:', err)
      setError(err instanceof Error ? err.message : 'Failed to run research. Please try again.')
      setResearchStatus('failed')
      setResearchError(err instanceof Error ? err.message : 'Research failed')
    } finally {
      setIsResearching(false)
    }
  }

  const handleGenerateConcepts = (count = 5) => {
    setConceptCards(buildConceptCards(count))
  }

  const handleGenerateMoreConcepts = () => {
    setConceptCards((prev) => [...prev, ...buildConceptCards(2, prev.length)])
  }

  const handleAddResearchNote = () => {
    notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (!notes) {
      setNotes('Research notes:\n- ')
    }
  }

  const handleAskResearch = async () => {
    if (!city) return
    const prompt = `Summarize the latest ${city.name} research insights and highlight any gaps.`

    if (!currentConversation) {
      startNewConversation({ page: `/cities/${city.id}`, cityId: city.id })
    }

    addMessage({ role: 'user', content: prompt })
    setChatLoading(true)
    setChatError(null)

    try {
      const messages = [
        ...(currentConversation?.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user' as const, content: prompt },
      ]

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          context: {
            page: `/cities/${city.id}`,
            cityId: city.id,
            cityName: city.name,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      addMessage({ role: 'assistant', content: data.message })
    } catch (err) {
      console.error('Chat error:', err)
      setChatError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setChatLoading(false)
    }
  }

  const handleExportAssets = async () => {
    if (assets.length === 0) return
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: assets.map((asset) => ({
            ...asset,
            city: city?.name,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to export assets')
      }

      const data = await response.json()
      if (data.downloadUrl) {
        const link = document.createElement('a')
        link.href = data.downloadUrl
        link.download = `${city?.name || 'city'}-assets.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error('Export error:', err)
      setError(err instanceof Error ? err.message : 'Failed to export assets')
    }
  }

  const handleGenerateAssets = async () => {
    if (!city || !activeConceptId) return

    const selectedTypes = Object.entries(assetSelections)
      .filter(([, enabled]) => enabled)
      .map(([type]) => type)

    if (selectedTypes.length === 0) {
      setError('Select at least one asset type to generate.')
      return
    }

    setIsGeneratingAssets(true)
    setError(null)

    const pollVideoStatus = async (provider: 'veo' | 'sora', jobId: string, contentId?: string | null) => {
      const maxAttempts = 60
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const response = await fetch(
          `/api/generate/video/${provider}/status?jobId=${jobId}${contentId ? `&contentId=${contentId}` : ''}`
        )
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'completed' || data.status === 'failed') {
            return
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }

    try {
      const concept = conceptCards.find((item) => item.id === activeConceptId)
      const basePrompt = concept
        ? `${concept.name}. ${concept.description} Colorways: ${concept.colorways}. Placement: ${concept.placement}. Tagline: ${concept.tagline}.`
        : `Premium streetwear concept for ${city.name}.`

      const tasks = selectedTypes.flatMap((type) => {
        const calls: Array<{ isVideo: boolean; request: Promise<Response> }> = []
        for (let index = 0; index < assetQuantity; index += 1) {
          if (type === 'Product Shots (with models)') {
            calls.push({
              isVideo: false,
              request: fetch('/api/generate/product-shot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  assetType: type,
                  cityId: city.id,
                  cityName: city.name,
                  shotType: 'hanging',
                  productType: 'Hoodie',
                  style: basePrompt,
                  model: 'gemini-pro',
                  generateBothModels: true,
                }),
              }),
            })
          } else if (type === 'Product Shots (without models)') {
            calls.push({
              isVideo: false,
              request: fetch('/api/generate/product-shot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  assetType: type,
                  cityId: city.id,
                  cityName: city.name,
                  shotType: 'flat-front',
                  productType: 'T-Shirt',
                  style: basePrompt,
                  model: 'gemini-pro',
                  generateBothModels: true,
                }),
              }),
            })
          } else if (type === 'Ghost Mannequin (photo)') {
            calls.push({
              isVideo: false,
              request: fetch('/api/generate/product-shot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  assetType: type,
                  cityId: city.id,
                  cityName: city.name,
                  shotType: 'ghost',
                  productType: 'Hoodie',
                  style: basePrompt,
                  model: 'gemini-pro',
                  generateBothModels: true,
                }),
              }),
            })
          } else if (type === 'Lifestyle / Scene Shots' || type === 'IG Ads' || type === 'Community Content') {
            calls.push({
              isVideo: false,
              request: fetch('/api/generate/lifestyle-shot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  assetType: type,
                  cityId: city.id,
                  cityName: city.name,
                  description: `${basePrompt} Lifestyle scene for ${city.name}.`,
                  aspectRatio: type === 'IG Ads' ? '4:3' : '16:9',
                  generateBothModels: true,
                }),
              }),
            })
          } else if (type === 'Ghost Mannequin (video)' || type === 'TikTok Ads') {
            calls.push({
              isVideo: true,
              request: fetch('/api/generate/video/veo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  assetType: type,
                  cityId: city.id,
                  cityName: city.name,
                  prompt: `${basePrompt} ${type === 'TikTok Ads' ? 'Short-form TikTok ad' : 'Ghost mannequin rotation'} featuring ${city.name} energy.`,
                  duration: 8,
                  aspectRatio: type === 'TikTok Ads' ? '9:16' : '16:9',
                  resolution: type === 'TikTok Ads' ? '720p' : '1080p',
                  model: 'veo-3',
                }),
              }),
            })
          }
        }
        return calls
      })

      const responses = await Promise.all(tasks.map((task) => task.request))
      const failed = responses.find((res) => !res.ok)
      if (failed) {
        const data = await failed.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate assets')
      }

      const videoResponses = await Promise.all(
        responses.map(async (response, index) => {
          if (!tasks[index]?.isVideo) return null
          const data = await response.json().catch(() => null)
          if (!data?.jobId) return null
          return { jobId: data.jobId as string, contentId: data.contentId as string | null }
        })
      )

      await Promise.all(
        videoResponses
          .filter((item): item is { jobId: string; contentId: string | null } => Boolean(item?.jobId))
          .map((item) => pollVideoStatus('veo', item.jobId, item.contentId))
      )

      await fetchCityData()
      setActiveConceptId(null)
      setAssetSelections({})
    } catch (err) {
      console.error('Asset generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate assets.')
    } finally {
      setIsGeneratingAssets(false)
    }
  }

  const handleAssetStatusChange = async (assetId: string, status: 'approved' | 'rejected') => {
    try {
      const payload: Record<string, unknown> = { id: assetId, status }
      if (status === 'approved') {
        payload.output_metadata = { drop_id: activeDropId }
      }
      const response = await fetch('/api/generated-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update asset')
      }

      await fetchCityData()
    } catch (err) {
      console.error('Asset status update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update asset.')
    }
  }

  const resolveAssetUrl = (url?: string, contentType?: string) => {
    if (!url) return ''
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const bucket = contentType?.includes('video') ? 'videos' : 'images'
    return baseUrl ? `${baseUrl}/storage/v1/object/public/${bucket}/${url}` : url
  }

  const handleAssetDownload = (asset: GeneratedAsset) => {
    if (!asset.output_url) return
    const link = document.createElement('a')
    link.href = resolveAssetUrl(asset.output_url, asset.content_type)
    link.download = `${city?.name || 'city'}-${asset.id}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAssetRegenerate = async (asset: GeneratedAsset, overridePrompt?: string) => {
    if (!city) return
    const prompt = overridePrompt || asset.prompt || `Premium streetwear concept for ${city.name}.`
    const assetType = asset.output_metadata?.asset_type as string | undefined
    try {
      if (asset.content_type === 'video') {
        const response = await fetch('/api/generate/video/veo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetType,
            cityId: city.id,
            cityName: city.name,
            prompt,
            duration: 8,
            aspectRatio: '9:16',
            resolution: '720p',
            model: 'veo-3',
          }),
        })
        if (!response.ok) throw new Error('Failed to regenerate video')
        const data = await response.json().catch(() => ({}))
        if (data.jobId) {
          const pollUrl = `/api/generate/video/veo/status?jobId=${data.jobId}${data.contentId ? `&contentId=${data.contentId}` : ''}`
          await fetch(pollUrl)
        }
      } else {
        const response = await fetch('/api/generate/product-shot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetType,
            cityId: city.id,
            cityName: city.name,
            shotType: 'flat-front',
            productType: 'T-Shirt',
            style: prompt,
            model: 'gemini-pro',
            generateBothModels: true,
          }),
        })
        if (!response.ok) throw new Error('Failed to regenerate image')
      }
      await fetchCityData()
    } catch (err) {
      console.error('Regenerate error:', err)
      setError(err instanceof Error ? err.message : 'Failed to regenerate asset.')
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

  const latestResearchRun = useMemo(() => {
    const runs = elements['research_run'] || []
    if (runs.length === 0) return null
    return runs.reduce((latest, current) => {
      const latestTime = new Date((latest.element_value as any)?.completed_at || latest.created_at).getTime()
      const currentTime = new Date((current.element_value as any)?.completed_at || current.created_at).getTime()
      return currentTime > latestTime ? current : latest
    }, runs[0])
  }, [elements])

  useEffect(() => {
    if (totalElements > 0) {
      setResearchStatus('completed')
    } else if (!isResearching && researchStatus === 'completed') {
      setResearchStatus('idle')
    }
  }, [totalElements, isResearching, researchStatus])

  const resolveAssetGroup = (asset: GeneratedAsset) => {
    const title = (asset as any).title as string | undefined
    const lowerTitle = title?.toLowerCase() || ''
    const metaType = asset.output_metadata?.asset_type as string | undefined
    if (metaType) return metaType
    if (lowerTitle.includes('product shot')) return 'Product Shots (with models)'
    if (lowerTitle.includes('lifestyle shot')) return 'Lifestyle / Scene Shots'
    if (lowerTitle.includes('sora video') || lowerTitle.includes('veo video')) return 'TikTok Ads'
    if (asset.content_type === 'video' || asset.content_type === 'video_ad') return 'TikTok Ads'
    if (asset.content_type === 'image') return 'Product Shots (without models)'
    return 'Other'
  }

  const groupedAssets = useMemo(() => {
    return assets.reduce<Record<string, GeneratedAsset[]>>((acc, asset) => {
      const type = resolveAssetGroup(asset)
      if (!acc[type]) acc[type] = []
      acc[type].push(asset)
      return acc
    }, {})
  }, [assets])

  const flag = city?.country ? (FLAG_BY_COUNTRY[city.country] || '🏙️') : '🏙️'
  const activeDropId = 'drop-1'

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
      description:
        (latestResearchRun as any)?.element_value?.summary ||
        (city as any)?.research_summary ||
        'Run research to generate a snapshot overview for this city.',
    },
    {
      key: 'signal',
      title: 'Signal Pulse',
      description:
        (city as any)?.signal_pulse ||
        'Signal pulse highlights will appear after research completes.',
    },
  ]

  const researchBlocks = [
    { key: 'cultural', title: 'Cultural Signals', elementsKey: 'cultural' },
    { key: 'sport', title: 'Sports Signals', elementsKey: 'sport' },
    { key: 'streetwear', title: 'Streetwear Landscape', elementsKey: 'cultural' },
    { key: 'slang', title: 'Local Slang', elementsKey: 'slang' },
    { key: 'palettes', title: 'Color Palettes', elementsKey: 'palettes' },
    { key: 'typography', title: 'Typography Inspiration', elementsKey: 'typography' },
    { key: 'landmark', title: 'Key Landmarks', elementsKey: 'landmark' },
    { key: 'music', title: 'Trending Sounds / Music', elementsKey: 'music' },
    { key: 'creators', title: 'Notable Local Creators', elementsKey: 'creators' },
    { key: 'visual_identity', title: 'Visual Identity', elementsKey: 'visual_identity' },
    { key: 'area_codes', title: 'Area Codes', elementsKey: 'area_codes' },
    { key: 'avoid', title: 'What to Avoid', elementsKey: 'avoid' },
    { key: 'reference', title: 'Reference Inputs', elementsKey: 'reference' },
  ]

  const conceptCityName = city?.name || 'City'
  const conceptTemplates = useMemo(
    () => [
      {
        name: `${conceptCityName} Night Market Luxe`,
        description: 'Neon-rich night market energy blended with premium embroidery and minimal typography.',
        colorways: 'Midnight teal, jet black, soft gold',
        placement: 'Left chest crest + back skyline',
        tagline: 'City lights. Quiet flex.',
      },
      {
        name: `${conceptCityName} Heritage Grid`,
        description: 'Architectural gridlines and archival textures with modern streetwear cuts.',
        colorways: 'Charcoal, bone, signal red',
        placement: 'Center chest lockup',
        tagline: 'Built by the city.',
      },
      {
        name: `${conceptCityName} Transit Pulse`,
        description: 'Transit-line graphics with bold numerics and refined textures for everyday layering.',
        colorways: 'Graphite, chalk, signal teal',
        placement: 'Sleeve wrap + chest lockup',
        tagline: 'Move with the city.',
      },
      {
        name: `${conceptCityName} Skyline Quiet`,
        description: 'Minimal skyline silhouette with subtle tonal embroidery and soft matte inks.',
        colorways: 'Ink black, smoke gray, frost white',
        placement: 'Back panel + cuff hit',
        tagline: 'Soft power.',
      },
      {
        name: `${conceptCityName} Culture Codes`,
        description: 'Local slang and iconography reworked as premium monograms and woven labels.',
        colorways: 'Bone, asphalt, neon lime',
        placement: 'Chest badge + inner label',
        tagline: 'Speak the city.',
      },
    ],
    [conceptCityName]
  )

  const buildConceptCards = useCallback((count: number, offset = 0): ConceptCard[] => {
    const cards: ConceptCard[] = []
    for (let index = 0; index < count; index += 1) {
      const template = conceptTemplates[(index + offset) % conceptTemplates.length]
      cards.push({
        id: `concept-${Date.now()}-${index + offset}`,
        ...template,
      })
    }
    return cards
  }, [conceptTemplates])

  // Initialize concept cards when city changes
  useEffect(() => {
    if (!cityId) return
    setConceptCards(buildConceptCards(2))
    setConceptApprovals({})
  }, [cityId, buildConceptCards])

  const assetTypeOptions = [
    'Product Shots (with models)',
    'Product Shots (without models)',
    'Ghost Mannequin (photo)',
    'Ghost Mannequin (video)',
    'Lifestyle / Scene Shots',
    'TikTok Ads',
    'IG Ads',
    'Community Content',
    'Other',
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
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-3 py-1">
                <span
                  className={`h-2 w-2 rounded-full ${
                    researchStatus === 'running'
                      ? 'bg-amber-400'
                      : researchStatus === 'failed'
                        ? 'bg-destructive'
                        : researchStatus === 'completed'
                          ? 'bg-emerald-400'
                          : 'bg-muted-foreground'
                  }`}
                />
                Research {researchStatus}
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
              <Button variant="secondary" onClick={handleAddResearchNote}>
                Add Note
              </Button>
              <Button variant="secondary" onClick={handleExportAssets} disabled={assets.length === 0}>
            Export
              </Button>
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
              <Button variant="secondary" size="sm" onClick={handleAskResearch}>
                Ask AI about Research
              </Button>
              <Button variant="secondary" size="sm" onClick={handleAddResearchNote}>
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
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard className="p-4 text-sm text-muted-foreground">
            <p className="text-sm font-semibold text-foreground">Research Status</p>
            <p className="mt-2 text-xs text-muted-foreground capitalize">
              {researchStatus === 'running' ? 'Research in progress...' : `Status: ${researchStatus}`}
            </p>
            {latestResearchRun && (
              <p className="mt-2 text-xs text-muted-foreground">
                Last run: {new Date(latestResearchRun.created_at).toLocaleString()}
              </p>
            )}
            {researchUpdatedAt && !latestResearchRun && (
              <p className="mt-2 text-xs text-muted-foreground">
                Last run: {researchUpdatedAt.toLocaleString()}
              </p>
            )}
            {(latestResearchRun as any)?.element_value?.summary && (
              <p className="mt-2 text-xs text-muted-foreground">
                Summary: {(latestResearchRun as any).element_value.summary}
              </p>
            )}
            {researchError && (
              <p className="mt-2 text-xs text-destructive">{researchError}</p>
            )}
          </GlassCard>
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
            return (
              <CollapsibleBlock key={block.key} title={block.title}>
                {block.key === 'avoid' ? (
                  blockElements.length === 0 ? (
                    <p>Awaiting avoid list from research.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {blockElements.map((element) => {
                        const value = element.element_value as any
                        return (
                          <li key={element.id} className="rounded-lg bg-[color:var(--surface-strong)] p-3">
                            <p className="text-sm font-semibold text-foreground">{value?.topic || element.element_key}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{value?.reason || 'No reason provided.'}</p>
                          </li>
                        )
                      })}
                    </ul>
                  )
                ) : blockElements.length === 0 ? (
                  <p>{placeholderByBlock[block.key] || 'No research items yet. Run research to populate this section.'}</p>
                ) : (
                  <div className="space-y-3">
                      {blockElements.map((element) => {
                        const approval = approvals.get(element.id)
                        const status = approval?.status || element.status
                        const formatted = formatElementBody(element)
                        return (
                          <div key={element.id} className="rounded-lg bg-[color:var(--surface-strong)] p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-foreground">{formatElementTitle(element)}</p>
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
                            {formatted.meta && (
                              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                {formatted.meta}
                              </div>
                            )}
                            <div className="mt-2 text-xs text-muted-foreground">{formatted.primary}</div>
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
              <Button size="sm" onClick={() => handleGenerateConcepts(5)}>
                <Sparkles className="h-4 w-4" />
                Generate 5 Concepts
              </Button>
              <Button variant="secondary" size="sm" onClick={handleGenerateMoreConcepts}>
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
              <Button onClick={handleGenerateAssets} disabled={isGeneratingAssets}>
                <Plus className="h-4 w-4" />
                {isGeneratingAssets ? 'Generating...' : 'Generate'}
              </Button>
              <Button variant="secondary" onClick={() => setActiveConceptId(null)} disabled={isGeneratingAssets}>
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
              <Button
                size="sm"
                onClick={() => setActiveConceptId(conceptCards[0]?.id || null)}
                disabled={conceptCards.length === 0}
              >
                Generate New Assets
              </Button>
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
                {items.map((asset) => {
                  const assetUrl = resolveAssetUrl(asset.output_url, asset.content_type)
                  const isVideo =
                    asset.content_type === 'video' ||
                    asset.content_type === 'video_ad' ||
                    asset.output_url?.endsWith('.mp4')
                  return (
                  <div key={asset.id} className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{asset.content_type}</span>
                        <span className="text-xs text-muted-foreground">{asset.status}</span>
                    </div>
                      <div className="mt-3 h-28 w-full overflow-hidden rounded-lg bg-[color:var(--surface-strong)]">
                        {assetUrl ? (
                          isVideo ? (
                            <video src={assetUrl} className="h-full w-full object-cover" muted playsInline />
                          ) : (
                            <img src={assetUrl} alt={asset.prompt || 'Generated asset'} className="h-full w-full object-cover" />
                          )
                        ) : null}
                    </div>
                      <div className="mt-3 text-xs text-muted-foreground">Concept: {asset.prompt || '—'}</div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <Button size="sm" variant="secondary" onClick={() => handleAssetStatusChange(asset.id, 'approved')}>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setRejectionTarget({ type: 'asset', id: asset.id })}
                        >
                          Reject
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleAssetRegenerate(asset)}>
                          Regenerate
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPreviewAsset(asset)}
                        >
                          View Full
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingAsset(asset)
                            setEditPrompt(asset.prompt || '')
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="sm" onClick={() => handleAssetDownload(asset)}>
                          Download
                        </Button>
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
            {approvedAssets.map((asset) => {
              const assetUrl = resolveAssetUrl(asset.output_url, asset.content_type)
              const isVideo =
                asset.content_type === 'video' ||
                asset.content_type === 'video_ad' ||
                asset.output_url?.endsWith('.mp4')
              return (
              <GlassCard key={asset.id} className="p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    {asset.content_type}
                  </label>
                  <span>{asset.created_at ? new Date(asset.created_at).toLocaleDateString() : '—'}</span>
        </div>
                <div className="mt-3 h-24 overflow-hidden rounded-lg bg-[color:var(--surface-strong)]">
                  {assetUrl ? (
                    isVideo ? (
                      <video src={assetUrl} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      <img src={assetUrl} alt={asset.prompt || 'Approved asset'} className="h-full w-full object-cover" />
                    )
                  ) : null}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Concept: {asset.prompt || '—'}</div>
              </GlassCard>
            )})}
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
              <Button
                key={tag}
                variant="secondary"
                size="sm"
                onClick={() => setRejectionReason((prev) => (prev ? `${prev}, ${tag}` : tag))}
              >
                {tag}
              </Button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => {
                if (rejectionTarget?.type === 'asset') {
                  handleAssetStatusChange(rejectionTarget.id, 'rejected')
                }
                setRejectionTarget(null)
                setRejectionReason('')
              }}
            >
              Submit
            </Button>
            <Button variant="secondary" onClick={() => setRejectionTarget(null)}>
              Skip
            </Button>
            <Button variant="ghost" onClick={() => setRejectionTarget(null)}>
              Close
            </Button>
          </div>
        </GlassCard>
      )}

      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <GlassCard className="w-full max-w-lg p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Edit Prompt</p>
              <button onClick={() => setEditingAsset(null)} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              className="mt-4 min-h-[140px] w-full rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3 text-sm text-foreground"
              value={editPrompt}
              onChange={(event) => setEditPrompt(event.target.value)}
              placeholder="Update the prompt for regeneration..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingAsset(null)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await handleAssetRegenerate(editingAsset, editPrompt)
                  setEditingAsset(null)
                }}
              >
                Regenerate
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-lg bg-success px-4 py-3 text-sm text-primary-foreground shadow-lg">
          Saved.
        </div>
      )}

      {previewAsset && (
        <AssetDetailModal
          asset={{
            id: previewAsset.id,
            output_url: previewAsset.output_url,
            content_type: previewAsset.content_type,
            title: previewAsset.title || undefined,
            model: previewAsset.model || undefined,
            prompt: previewAsset.prompt || undefined,
            duration_seconds: previewAsset.duration_seconds,
            created_at: previewAsset.created_at || new Date().toISOString(),
            cities: previewAsset.cities || (city ? { id: city.id, name: city.name } : null),
          }}
          onClose={() => setPreviewAsset(null)}
        />
      )}
    </div>
  )
 }
