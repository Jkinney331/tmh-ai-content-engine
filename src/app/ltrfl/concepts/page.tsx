'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Lightbulb,
  Plus,
  Filter,
  Grid,
  List,
  Search,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConceptCard } from '@/components/ltrfl/ConceptCard'
import { LTRFL_BRAND_COLORS, LTRFLConceptStatus } from '@/types/ltrfl'
import { cn } from '@/lib/utils'

interface ConceptListItem {
  id: string
  name: string
  category: string
  subcategory: string | null
  generated_image_url: string | null
  status: LTRFLConceptStatus
  created_at: string
  ltrfl_templates?: {
    name: string
    category: string
  } | null
}

const STATUS_FILTERS: { value: LTRFLConceptStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'reviewing', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
]

function ConceptsContent() {
  const searchParams = useSearchParams()
  const statusParam = searchParams.get('status') as LTRFLConceptStatus | null

  const [concepts, setConcepts] = useState<ConceptListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<LTRFLConceptStatus | 'all'>(statusParam || 'all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadConcepts()
  }, [statusFilter])

  const loadConcepts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const res = await fetch(`/api/ltrfl/concepts?${params}`)
      if (res.ok) {
        const data = await res.json()
        setConcepts(data)
      }
    } catch (error) {
      console.error('Failed to load concepts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConcepts = concepts.filter(concept => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      concept.name.toLowerCase().includes(query) ||
      concept.category.toLowerCase().includes(query) ||
      (concept.subcategory?.toLowerCase().includes(query))
    )
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Concepts</h1>
          <p className="text-sm text-muted-foreground">
            {concepts.length} urn design concepts
          </p>
        </div>
        <Link href="/ltrfl/concepts/new">
          <Button
            className="text-white"
            style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Concept
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 p-1 rounded-lg bg-[color:var(--surface-muted)]">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                statusFilter === filter.value
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={statusFilter === filter.value ? { backgroundColor: LTRFL_BRAND_COLORS.sage } : undefined}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-[color:var(--surface)]' : ''}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-[color:var(--surface)]' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Concepts Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
        </div>
      ) : filteredConcepts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
          >
            <Lightbulb className="w-8 h-8" style={{ color: LTRFL_BRAND_COLORS.sage }} />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            {searchQuery || statusFilter !== 'all' ? 'No concepts found' : 'No concepts yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start generating urn design concepts'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link href="/ltrfl/concepts/new">
              <Button
                className="text-white"
                style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Concept
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-2'
        }>
          {filteredConcepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ConceptsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
      </div>
    }>
      <ConceptsContent />
    </Suspense>
  )
}
