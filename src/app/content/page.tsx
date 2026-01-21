'use client'

import { useEffect, useState } from 'react'
import { getContentTypes } from '@/lib/supabase'
import { Database } from '@/types/database'
import { FileText } from 'lucide-react'
import ContentTypeCard from '@/components/ContentTypeCard'

type ContentType = Database['public']['Tables']['content_types']['Row']

export default function SocialContentPage() {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadContentTypes()
  }, [])

  async function loadContentTypes() {
    try {
      setLoading(true)
      setError(null)
      const data = await getContentTypes(true) // Only get active content types
      setContentTypes(data || [])
    } catch (err) {
      console.error('Error loading content types:', err)
      setError('Failed to load content types. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadContentTypes}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Content</h1>
          <p className="text-gray-600 mt-2">Create engaging social media posts for different platforms</p>
        </div>
      </div>

      {contentTypes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Types Available</h3>
          <p className="text-gray-600">Content types will appear here once they are configured in the database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentTypes.map((contentType) => (
            <ContentTypeCard
              key={contentType.id}
              contentType={contentType}
            />
          ))}
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">About Content Types</h3>
            <p className="text-sm text-gray-600">
              Content types are pre-configured templates for generating social media posts.
              Each type is optimized for specific platforms with appropriate formatting,
              character limits, and style guidelines. Click "Create Post" to generate
              content using AI based on these templates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}