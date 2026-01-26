'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, getCities } from '@/lib/supabase'
import Image from 'next/image'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import AssetDetailModal from '@/components/AssetDetailModal'

interface GeneratedContent {
  id: string
  city_id: string
  content_type: string | null
  title: string | null
  prompt: string | null
  model: string | null
  status: string
  output_url: string | null
  generation_cost_cents: number | null
  duration_seconds: number | null
  created_at: string
  cities?: {
    id: string
    name: string
    state: string | null
  }
}

interface City {
  id: string
  name: string
  state: string | null
  country: string | null
}

const contentTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'product_shot', label: 'Product Shot' },
  { value: 'lifestyle_shot', label: 'Lifestyle Shot' },
  { value: 'social_post', label: 'Social Post' },
  { value: 'video_ad', label: 'Video Ad' }
]

const dateRanges = [
  { value: 'all', label: 'All time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' }
]

export default function LibraryContent() {
  const [assets, setAssets] = useState<GeneratedContent[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<GeneratedContent | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get filter values from URL params
  const selectedCity = searchParams.get('city') || 'all'
  const selectedContentType = searchParams.get('type') || 'all'
  const selectedDateRange = searchParams.get('range') || 'all'

  // Fetch cities on mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await getCities()
        setCities(citiesData || [])
      } catch (err) {
        console.error('Error loading cities:', err)
      }
    }
    loadCities()
  }, [])

  // Update URL params when filters change
  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  useEffect(() => {
    fetchApprovedAssets()
  }, [selectedCity, selectedContentType, selectedDateRange])

  const fetchApprovedAssets = async () => {
    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from('generated_content')
        .select(`
          *,
          cities (
            id,
            name,
            state
          )
        `)
        .eq('status', 'approved')

      // Apply city filter
      if (selectedCity !== 'all') {
        query = query.eq('city_id', selectedCity)
      }

      // Apply content type filter
      if (selectedContentType !== 'all') {
        query = query.eq('content_type', selectedContentType)
      }

      // Apply date range filter
      if (selectedDateRange !== 'all') {
        const days = parseInt(selectedDateRange)
        const dateThreshold = new Date()
        dateThreshold.setDate(dateThreshold.getDate() - days)
        query = query.gte('created_at', dateThreshold.toISOString())
      }

      const { data, error: supabaseError } = await query
        .order('created_at', { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      setAssets(data || [])
    } catch (err) {
      console.error('Error fetching approved assets:', err)
      setError(err instanceof Error ? err.message : 'Failed to load assets')
    } finally {
      setIsLoading(false)
    }
  }

  // Get filtered asset count
  const filteredCount = assets.length

  const getImageUrl = (url: string | null) => {
    if (!url) return '/placeholder-image.png'
    // If it's already a full URL or data URL, return it
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url
    // Otherwise, construct the Supabase storage URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/images/${url}`
  }

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', assetId)

      if (deleteError) {
        throw deleteError
      }

      // Remove from local state
      setAssets(prev => prev.filter(a => a.id !== assetId))
    } catch (err) {
      console.error('Error deleting asset:', err)
      throw err
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Library</h1>
        <p className="text-lg text-gray-600">
          {filteredCount} approved {filteredCount === 1 ? 'asset' : 'assets'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City Filter */}
          <div>
            <label htmlFor="city-filter" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              id="city-filter"
              value={selectedCity}
              onChange={(e) => updateFilter('city', e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}{city.state && `, ${city.state}`}
                </option>
              ))}
            </select>
          </div>

          {/* Content Type Filter */}
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              id="type-filter"
              value={selectedContentType}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label htmlFor="range-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              id="range-filter"
              value={selectedDateRange}
              onChange={(e) => updateFilter('range', e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedCity !== 'all' || selectedContentType !== 'all' || selectedDateRange !== 'all') && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {selectedCity !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  City: {cities.find(c => c.id === selectedCity)?.name}
                  <button
                    onClick={() => updateFilter('city', 'all')}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedContentType !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Type: {contentTypes.find(t => t.value === selectedContentType)?.label}
                  <button
                    onClick={() => updateFilter('type', 'all')}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedDateRange !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Range: {dateRanges.find(r => r.value === selectedDateRange)?.label}
                  <button
                    onClick={() => updateFilter('range', 'all')}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  updateFilter('city', 'all')
                  updateFilter('type', 'all')
                  updateFilter('range', 'all')
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading assets</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchApprovedAssets}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No approved assets yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Approved assets will appear here once you start generating and approving content.
            </p>
          </div>
        </div>
      ) : (
        /* Asset Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="relative w-full h-full">
                {asset.content_type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs">{asset.duration_seconds}s video</p>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={getImageUrl(asset.output_url)}
                    alt={asset.title || 'Generated asset'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                )}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                  {asset.cities && (
                    <p className="text-xs font-medium mb-1">
                      {asset.cities.name}{asset.cities.state && `, ${asset.cities.state}`}
                    </p>
                  )}
                  {asset.title && (
                    <p className="text-xs opacity-90">
                      {asset.title}
                    </p>
                  )}
                  {asset.model && (
                    <p className="text-xs opacity-75 mt-1">
                      {asset.model}
                    </p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Download functionality
                      const link = document.createElement('a')
                      link.href = getImageUrl(asset.output_url)
                      link.download = `tmh-asset-${asset.id}.${asset.content_type === 'video' ? 'mp4' : 'jpg'}`
                      link.click()
                    }}
                    className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    title="Download"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onDelete={handleDeleteAsset}
        />
      )}
    </div>
  )
}