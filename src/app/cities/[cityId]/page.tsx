'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCityById, getCityElementsByType } from '@/lib/supabase'
import { Database } from '@/types/database'
import { ArrowLeft, MapPin, Hash, Clock, AlertCircle, CheckCircle, XCircle, Save } from 'lucide-react'

type City = Database['public']['Tables']['cities']['Row']
type CityElement = Database['public']['Tables']['city_elements']['Row']
type ElementsByType = Record<string, CityElement[]>

type ElementApproval = {
  elementId: string
  status: 'approved' | 'rejected' | 'pending'
  notes?: string
}

export default function CityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cityId = params.cityId as string

  const [city, setCity] = useState<City | null>(null)
  const [elements, setElements] = useState<ElementsByType>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [approvals, setApprovals] = useState<Map<string, ElementApproval>>(new Map())
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [approvingCity, setApprovingCity] = useState(false)

  useEffect(() => {
    fetchCityData()
  }, [cityId])

  const fetchCityData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch city data
      const cityData = await getCityById(cityId)
      setCity(cityData)

      // Fetch city elements grouped by type
      const elementsData = await getCityElementsByType(cityId)
      setElements(elementsData)
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

  const getApprovedElementsCount = () => {
    // Count elements with approved status from both saved and pending approvals
    let approvedCount = 0

    // Count already approved elements
    Object.values(elements).forEach(typeElements => {
      typeElements.forEach(element => {
        const pendingApproval = approvals.get(element.id)
        if (pendingApproval?.status === 'approved' ||
            (!pendingApproval && element.status === 'approved')) {
          approvedCount++
        }
      })
    })

    return approvedCount
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

      // Show success toast
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)

      // Refresh data to get updated status
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

      // Show success toast
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)

      // Refresh data to get updated statuses
      await fetchCityData()

      // Clear approvals after successful save
      setApprovals(new Map())
    } catch (err) {
      console.error('Error saving decisions:', err)
      setError('Failed to save decisions. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ready':
        return 'text-green-600 bg-green-100'
      case 'draft':
      case 'researching':
        return 'text-yellow-600 bg-yellow-100'
      case 'archived':
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getElementStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getElementTypeLabel = (type: string) => {
    switch (type) {
      case 'slang':
        return 'Slang & Language'
      case 'landmark':
        return 'Landmarks'
      case 'sport':
        return 'Sports'
      case 'cultural':
        return 'Culture'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const renderElementContent = (element: CityElement) => {
    const value = element.element_value as any

    switch (element.element_type) {
      case 'slang':
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{value.term || element.element_key}</p>
            {value.meaning && (
              <p className="text-sm text-gray-600">Meaning: {value.meaning}</p>
            )}
            {value.usage && (
              <p className="text-sm text-gray-500">Usage: {value.usage}</p>
            )}
            {value.popularity && (
              <span className="inline-block px-2 py-1 mt-1 text-xs bg-blue-100 text-blue-700 rounded">
                {value.popularity} popularity
              </span>
            )}
          </div>
        )

      case 'landmark':
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{value.name || element.element_key}</p>
            {value.type && (
              <p className="text-sm text-gray-600">Type: {value.type}</p>
            )}
            {value.significance && (
              <p className="text-sm text-gray-500">{value.significance}</p>
            )}
            {value.year_built && (
              <p className="text-sm text-gray-400">Built: {value.year_built}</p>
            )}
          </div>
        )

      case 'sport':
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{value.team || element.element_key}</p>
            {value.sport && value.league && (
              <p className="text-sm text-gray-600">{value.sport} - {value.league}</p>
            )}
            {value.venue && (
              <p className="text-sm text-gray-500">Venue: {value.venue}</p>
            )}
            {value.championships && (
              <span className="inline-block px-2 py-1 mt-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                {value.championships} championships
              </span>
            )}
          </div>
        )

      case 'cultural':
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{value.name || element.element_key}</p>
            {value.type && (
              <p className="text-sm text-gray-600">Type: {value.type}</p>
            )}
            {value.significance && (
              <p className="text-sm text-gray-500">{value.significance}</p>
            )}
            {value.founded && (
              <p className="text-sm text-gray-400">Founded: {value.founded}</p>
            )}
            {value.famous_acts && Array.isArray(value.famous_acts) && (
              <div className="flex flex-wrap gap-1 mt-1">
                {value.famous_acts.map((act: string, idx: number) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    {act}
                  </span>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{element.element_key}</p>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        )
    }
  }

  const elementTypes = Object.keys(elements)
  const tabs = ['all', ...elementTypes]

  const getFilteredElements = () => {
    if (activeTab === 'all') {
      return Object.entries(elements).flatMap(([type, items]) =>
        items.map(item => ({ ...item, displayType: type }))
      )
    }
    return elements[activeTab]?.map(item => ({ ...item, displayType: activeTab })) || []
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 text-red-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold">Error</h3>
            </div>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => router.push('/cities')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Cities
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">City not found</p>
          <button
            onClick={() => router.push('/cities')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Cities
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/cities')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cities</span>
          </button>

          {/* City Header */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{city.name}</h1>

                {/* Status Badge */}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(city.status)}`}>
                  {city.status}
                </span>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(city.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* City Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Area Codes */}
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Hash className="w-4 h-4" />
                  <span className="text-sm font-medium">Area Codes</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {city.area_codes && city.area_codes.length > 0 ? (
                    city.area_codes.map((code: any, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        {code}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No area codes</span>
                  )}
                </div>
              </div>

              {/* Nicknames */}
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Nicknames</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {city.nicknames && city.nicknames.length > 0 ? (
                    city.nicknames.map((nickname: any, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                        {nickname}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No nicknames</span>
                  )}
                </div>
              </div>

              {/* Visual Themes */}
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Visual Themes</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {city.visual_identity?.themes && Array.isArray(city.visual_identity.themes) ? (
                    city.visual_identity.themes.map((theme: any, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        {theme}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No themes defined</span>
                  )}
                </div>
              </div>
            </div>

            {/* User Notes */}
            {city.user_notes && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-600 mb-2">Notes</p>
                <p className="text-gray-700">{city.user_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Research Elements Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Research Elements</h2>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'all' ? 'All Elements' : getElementTypeLabel(tab)}
                  {tab !== 'all' && elements[tab] && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {elements[tab].length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Elements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredElements().length > 0 ? (
              getFilteredElements().map((element: any) => {
                const currentApproval = approvals.get(element.id)
                const displayStatus = currentApproval?.status || element.status

                return (
                  <div
                    key={element.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getElementTypeLabel(element.displayType || element.element_type)}
                      </span>
                      {getElementStatusIcon(displayStatus)}
                    </div>

                    {renderElementContent(element)}

                    {/* Approval Controls */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <button
                          onClick={() => handleApprovalChange(element.id, 'approved')}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            displayStatus === 'approved'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-green-100 hover:text-green-700'
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApprovalChange(element.id, 'rejected')}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            displayStatus === 'rejected'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-700'
                          }`}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprovalChange(element.id, 'pending')}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            displayStatus === 'pending'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700'
                          }`}
                        >
                          Pending
                        </button>
                      </div>

                      {/* Notes input */}
                      <input
                        type="text"
                        placeholder="Add notes (optional)"
                        value={currentApproval?.notes || ''}
                        onChange={(e) => handleApprovalChange(element.id, displayStatus || 'pending', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {element.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 italic">{element.notes}</p>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {activeTab === 'all'
                    ? 'No research elements found for this city'
                    : `No ${getElementTypeLabel(activeTab).toLowerCase()} elements found`}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between items-center">
            {/* City Approval Section */}
            <div className="flex items-center space-x-4">
              {city.status !== 'active' ? (
                <>
                  {getApprovedElementsCount() >= 3 ? (
                    <button
                      onClick={handleApproveCityProfile}
                      disabled={approvingCity}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{approvingCity ? 'Approving...' : 'Approve City Profile'}</span>
                    </button>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Approve at least {3 - getApprovedElementsCount()} more elements to approve the city profile
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    disabled
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>City Approved</span>
                  </button>
                  <button
                    onClick={() => router.push(`/generate?cityId=${cityId}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>Start Generating</span>
                  </button>
                </div>
              )}
            </div>

            {/* Save Decisions Button */}
            {approvals.size > 0 && (
              <button
                onClick={handleSaveDecisions}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Decisions'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in-up">
          <CheckCircle className="w-5 h-5" />
          <span>Decisions saved</span>
        </div>
      )}
    </div>
  )
}