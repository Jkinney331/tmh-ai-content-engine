'use client'

import { useEffect, useRef, useState, FormEvent } from 'react'

interface AddCityModalProps {
  isOpen: boolean
  onClose: () => void
  onCityAdded?: () => void
}

interface ResearchCategories {
  slang: boolean
  landmarks: boolean
  sports: boolean
  culture: boolean
  visualIdentity: boolean
  areaCodes: boolean
}

export default function AddCityModal({ isOpen, onClose, onCityAdded }: AddCityModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [cityName, setCityName] = useState('')
  const [error, setError] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [researchCategories, setResearchCategories] = useState<ResearchCategories>({
    slang: true,
    landmarks: true,
    sports: true,
    culture: true,
    visualIdentity: true,
    areaCodes: true
  })

  const validateCityName = (value: string): string => {
    if (!value.trim()) {
      return 'City name is required'
    }
    if (value.trim().length < 2) {
      return 'City name must be at least 2 characters'
    }
    return ''
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCityName(value)
    const validationError = validateCityName(value)
    setError(validationError)
  }

  const handleCategoryToggle = (category: keyof ResearchCategories) => {
    setResearchCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationError = validateCityName(cityName)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: cityName,
          researchCategories,
          customPrompt: customPrompt || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create city')
      }

      const data = await response.json()
      console.log('City created successfully:', data)

      if (onCityAdded) {
        onCityAdded()
      }

      onClose()
    } catch (err) {
      console.error('Error creating city:', err)
      setError(err instanceof Error ? err.message : 'Failed to create city. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isSubmitDisabled = !cityName.trim() || cityName.trim().length < 2 || isLoading

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'hidden'
    } else {
      // Reset form when modal closes
      setCityName('')
      setError('')
      setCustomPrompt('')
      setIsLoading(false)
      setResearchCategories({
        slang: true,
        landmarks: true,
        sports: true,
        culture: true,
        visualIdentity: true,
        areaCodes: true
      })
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div
          ref={modalRef}
          data-testid="add-city-modal"
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
        >
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Add New City
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
              {error && !cityName.trim() === false && cityName.trim().length >= 2 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <div>
                <label htmlFor="cityName" className="block text-sm font-medium text-gray-700">
                  City Name
                </label>
                <input
                  type="text"
                  name="cityName"
                  id="cityName"
                  value={cityName}
                  onChange={handleInputChange}
                  placeholder="Enter city name..."
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    error
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600" id="cityName-error">
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Research Categories</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={researchCategories.slang}
                      onChange={() => handleCategoryToggle('slang')}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Slang</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={researchCategories.landmarks}
                      onChange={() => handleCategoryToggle('landmarks')}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Landmarks</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={researchCategories.sports}
                      onChange={() => handleCategoryToggle('sports')}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sports</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={researchCategories.culture}
                      onChange={() => handleCategoryToggle('culture')}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Culture</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={researchCategories.visualIdentity}
                      onChange={() => handleCategoryToggle('visualIdentity')}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Visual Identity</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={researchCategories.areaCodes}
                      onChange={() => handleCategoryToggle('areaCodes')}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Area Codes</span>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700">
                  Custom Research Instructions
                </label>
                <div className="mt-1">
                  <textarea
                    name="customPrompt"
                    id="customPrompt"
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value.slice(0, 500))}
                    placeholder="Any specific things to research?"
                    maxLength={500}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <div className="mt-1 text-right">
                    <span className={`text-xs ${customPrompt.length >= 500 ? 'text-red-500' : 'text-gray-500'}`}>
                      {customPrompt.length}/500
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`inline-flex w-full justify-center items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                    isSubmitDisabled
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Start Research'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className={`mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}