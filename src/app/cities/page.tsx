'use client'

import { useEffect, useState } from 'react'
import { useCityStore } from '@/stores/cityStore'
import CityCard from '@/components/CityCard'
import AddCityModal from '@/components/AddCityModal'
import SetupRequired from '@/components/SetupRequired'
import { hasRealCredentials } from '@/lib/supabase'

export default function CitiesPage() {
  const { cities, setCities } = useCityStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  const fetchCities = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setShowSetup(false)

      // Try API endpoint
      const response = await fetch('/api/cities')

      if (response.ok) {
        const data = await response.json()
        // Handle both array response and error object
        if (Array.isArray(data)) {
          setCities(data)
        } else if (data.error) {
          throw new Error(data.error)
        } else {
          setCities([])
        }
        return
      }

      // If API fails, check if it's a config issue
      if (!hasRealCredentials) {
        setShowSetup(true)
        setCities([])
        return
      }

      throw new Error('Failed to fetch cities')
    } catch (err) {
      console.error('Error fetching cities:', err)

      // Check if it's likely a Supabase config issue
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cities'
      if (
        errorMessage.includes('placeholder') ||
        errorMessage.includes('your-project') ||
        errorMessage.includes('ENOTFOUND') ||
        !hasRealCredentials
      ) {
        setShowSetup(true)
        setCities([])
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCities()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cities</h1>
        <button
          data-testid="add-city-button"
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={showSetup}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="-ml-0.5 mr-1.5 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add City
        </button>
      </div>

      {/* Setup Required State */}
      {showSetup && !isLoading && (
        <SetupRequired
          title="Database Connection Required"
          description="Connect your Supabase database to manage cities and store content."
          missingItems={['Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)']}
        />
      )}

      {/* Error State */}
      {error && !showSetup && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading cities</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchCities}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !showSetup && cities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 4h1m-1 4h1M9 15h1m4 0h1m-5 4h1m4 0h1"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No cities yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first city.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Add Your First City
            </button>
          </div>
        </div>
      ) : !showSetup && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city: any) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
      )}

      <AddCityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCityAdded={fetchCities}
      />
    </div>
  )
}
