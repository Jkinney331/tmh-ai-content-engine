'use client'

import { Database } from '@/types/database'
import {
  FileText,
  Hash,
  Twitter,
  Instagram,
  Edit3,
  Video,
  MessageSquare,
  Newspaper,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

type ContentType = Database['public']['Tables']['content_types']['Row']

interface ContentTypeCardProps {
  contentType: ContentType
  onClick?: (contentType: ContentType) => void
}

const formatIcons: Record<string, any> = {
  'text': FileText,
  'json': Hash,
  'markdown': Edit3,
  'html': Newspaper,
  'structured': MessageSquare
}

const platformIcons: Record<string, any> = {
  'Twitter Post': Twitter,
  'Instagram Caption': Instagram,
  'Reddit Post': Hash,
  'Blog Post Intro': Edit3,
  'TikTok Script': Video,
  'LinkedIn Update': Newspaper,
  'Facebook Post': MessageSquare
}

export default function ContentTypeCard({ contentType, onClick }: ContentTypeCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick(contentType)
    } else {
      // Default behavior: navigate to content creation flow with content_type_id
      router.push(`/generate?type=social&contentTypeId=${contentType.id}&contentTypeName=${encodeURIComponent(contentType.name)}`)
    }
  }

  const getPlatformColor = (name: string) => {
    if (name.includes('Twitter')) return 'bg-blue-500'
    if (name.includes('Instagram')) return 'bg-gradient-to-r from-purple-500 to-pink-500'
    if (name.includes('Reddit')) return 'bg-orange-500'
    if (name.includes('Blog')) return 'bg-green-500'
    if (name.includes('TikTok')) return 'bg-black'
    if (name.includes('LinkedIn')) return 'bg-blue-700'
    if (name.includes('Facebook')) return 'bg-blue-600'
    return 'bg-gray-500'
  }

  const PlatformIcon = platformIcons[contentType.name] || FileText
  const FormatIcon = formatIcons[contentType.output_format.toLowerCase()] || FileText
  const platformColor = getPlatformColor(contentType.name)

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className={`h-2 ${platformColor} group-hover:h-3 transition-all duration-200`}></div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${platformColor} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-200`}>
            <PlatformIcon className="w-6 h-6 text-gray-700" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              <FormatIcon className="w-3 h-3" />
              <span>{contentType.output_format}</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {contentType.name}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {contentType.description || 'Create engaging content for this platform'}
        </p>

        {contentType.platform_specs && Object.keys(contentType.platform_specs).length > 0 && (
          <div className="mb-4 space-y-1">
            {Object.entries(contentType.platform_specs).slice(0, 2).map(([key, value]) => (
              <div key={key} className="text-xs text-gray-500">
                <span className="font-medium">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        )}

        {contentType.variables && Object.keys(contentType.variables).length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {Object.keys(contentType.variables).slice(0, 3).map((variable) => (
                <span
                  key={variable}
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded"
                >
                  {variable}
                </span>
              ))}
              {Object.keys(contentType.variables).length > 3 && (
                <span className="text-xs text-gray-500">
                  +{Object.keys(contentType.variables).length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium group-hover:gap-3 transition-all">
            <span>Create Content</span>
            <ArrowRight className="w-4 h-4" />
          </div>

          {contentType.active ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Inactive
            </span>
          )}
        </div>
      </div>
    </div>
  )
}