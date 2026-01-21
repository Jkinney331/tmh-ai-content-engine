'use client'

import { useRouter } from 'next/navigation'

// Accept any city shape - handles both typed City and raw Supabase data
interface CityCardProps {
  city: {
    id: string
    name: string
    state?: string | null
    country?: string | null
    status?: string | null
    areaCodes?: string[]
    area_codes?: string[] | null
    nicknameCount?: number
    nicknames?: string[] | null
    population?: number | null
  }
}

export default function CityCard({ city }: CityCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/cities/${city.id}`)
  }

  // Normalize area codes from either format
  const areaCodes = city.areaCodes || city.area_codes || []

  // Calculate nickname count from either format
  const nicknameCount = city.nicknameCount ?? (city.nicknames?.length || 0)

  // Normalize status with fallback
  const status = city.status || 'draft'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'paused':
      case 'researching':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{city.name || 'Unnamed City'}</h3>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(status)}`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-3">
        {(city.state || city.country) && (
          <div>
            <p className="text-sm font-medium text-gray-500">Location</p>
            <p className="text-sm text-gray-900">
              {[city.state, city.country].filter(Boolean).join(', ') || 'Not specified'}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-500">Area Codes</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {areaCodes.length > 0 ? (
              areaCodes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {code}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">No area codes</span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-500">Nicknames</p>
            <p className="text-lg font-semibold text-gray-900">{nicknameCount}</p>
          </div>
          {city.population && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Population</p>
              <p className="text-sm text-gray-900">
                {city.population.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
