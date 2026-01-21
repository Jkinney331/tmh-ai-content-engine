'use client'

import { useState } from 'react'
import { Database } from '@/types/database'

type CityElement = Database['public']['Tables']['city_elements']['Row']
type ElementStatus = 'approved' | 'rejected' | 'pending'

interface ElementReviewCardProps {
  element: CityElement
  onStatusChange?: (elementId: string, newStatus: ElementStatus, notes?: string) => void
}

export default function ElementReviewCard({ element, onStatusChange }: ElementReviewCardProps) {
  const [currentStatus, setCurrentStatus] = useState<ElementStatus>(element.status)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState(element.notes || '')

  const handleStatusChange = (newStatus: ElementStatus) => {
    setCurrentStatus(newStatus)
    if (onStatusChange) {
      onStatusChange(element.id, newStatus, notes)
    }
  }

  const getElementTypeLabel = (type: CityElement['element_type']) => {
    switch (type) {
      case 'slang':
        return 'Slang'
      case 'landmark':
        return 'Landmark'
      case 'sport':
        return 'Sport'
      case 'cultural':
        return 'Cultural'
      default:
        return type
    }
  }

  const getStatusColor = (status: ElementStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200'
      case 'rejected':
        return 'bg-red-50 border-red-200'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatElementValue = (value: Record<string, any>) => {
    if (typeof value === 'string') return value

    if (value.meaning) {
      return value.meaning
    }

    if (value.description) {
      return value.description
    }

    return JSON.stringify(value, null, 2)
  }

  return (
    <div className={`rounded-lg border-2 p-6 transition-all duration-200 ${getStatusColor(currentStatus)}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{element.element_key}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getElementTypeLabel(element.element_type)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formatElementValue(element.element_value)}
          </p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm font-medium text-gray-500">Status:</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            currentStatus === 'approved' ? 'bg-green-100 text-green-800' :
            currentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => handleStatusChange('approved')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentStatus === 'approved'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm'
          }`}
        >
          ✓ Approve
        </button>

        <button
          onClick={() => handleStatusChange('rejected')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentStatus === 'rejected'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-sm'
          }`}
        >
          ✗ Reject
        </button>

        <button
          onClick={() => handleStatusChange('pending')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentStatus === 'pending'
              ? 'bg-yellow-600 text-white shadow-md'
              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:shadow-sm'
          }`}
        >
          ? Maybe
        </button>
      </div>

      <div className="border-t pt-3">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-medium text-gray-700">Notes</span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              showNotes ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showNotes && (
          <div className="mt-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (onStatusChange) {
                  onStatusChange(element.id, currentStatus, notes)
                }
              }}
              placeholder="Add notes about this element..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  )
}