'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import AddContentTypeModal from '@/components/AddContentTypeModal'
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  Hash,
  Twitter,
  Instagram,
  Video,
  MessageSquare,
  Newspaper,
  Search,
  Filter
} from 'lucide-react'

type ContentType = Database['public']['Tables']['content_types']['Row']

// Mock data for demonstration - in production this would come from your database
const mockContentTypes: (ContentType & { usage_count?: number })[] = [
  {
    id: '1',
    name: 'Twitter Post',
    description: 'Create engaging tweets with city-specific content',
    template: 'Hey {{cityName}}! {{content}} #{{hashtag}}',
    variables: { cityName: true, content: true, hashtag: true },
    output_format: 'text',
    platform_specs: { maxLength: 280, allowHashtags: true, allowMentions: true },
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    usage_count: 145
  },
  {
    id: '2',
    name: 'Instagram Caption',
    description: 'Craft Instagram captions with local flavor',
    template: '{{emoji}} {{headline}}\n\n{{content}}\n\n{{hashtags}}',
    variables: { emoji: true, headline: true, content: true, hashtags: true },
    output_format: 'text',
    platform_specs: { maxLength: 2200, hashtagLimit: 30, emojiRecommended: true },
    active: true,
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-16T14:30:00Z',
    usage_count: 89
  },
  {
    id: '3',
    name: 'Reddit Post',
    description: 'Create Reddit posts that resonate with local communities',
    template: '## {{title}}\n\n{{content}}\n\n**TL;DR:** {{tldr}}',
    variables: { title: true, content: true, tldr: true },
    output_format: 'markdown',
    platform_specs: { allowMarkdown: true, maxTitleLength: 300 },
    active: true,
    created_at: '2024-01-13T08:00:00Z',
    updated_at: '2024-01-17T11:20:00Z',
    usage_count: 67
  },
  {
    id: '4',
    name: 'Blog Post Intro',
    description: 'Generate blog post introductions with local context',
    template: '# {{title}}\n\n{{hook}}\n\n{{introduction}}\n\n## Key Points\n{{keyPoints}}',
    variables: { title: true, hook: true, introduction: true, keyPoints: true },
    output_format: 'markdown',
    platform_specs: { seoOptimized: true, minWords: 150 },
    active: false,
    created_at: '2024-01-12T07:00:00Z',
    updated_at: '2024-01-12T07:00:00Z',
    usage_count: 23
  },
  {
    id: '5',
    name: 'TikTok Script',
    description: 'Short-form video scripts with local trends',
    template: 'Hook: {{hook}}\nMain: {{mainContent}}\nCTA: {{callToAction}}',
    variables: { hook: true, mainContent: true, callToAction: true },
    output_format: 'text',
    platform_specs: { maxDuration: 60, verticalFormat: true },
    active: true,
    created_at: '2024-01-18T15:00:00Z',
    updated_at: '2024-01-19T09:45:00Z',
    usage_count: 112
  },
  {
    id: '6',
    name: 'LinkedIn Update',
    description: 'Professional updates with local business insights',
    template: '{{headline}}\n\n{{content}}\n\n{{hashtags}}',
    variables: { headline: true, content: true, hashtags: true },
    output_format: 'text',
    platform_specs: { maxLength: 3000, professionalTone: true },
    active: true,
    created_at: '2024-01-11T06:00:00Z',
    updated_at: '2024-01-11T06:00:00Z',
    usage_count: 45
  }
]

const platformIcons: Record<string, any> = {
  'Twitter Post': Twitter,
  'Instagram Caption': Instagram,
  'Reddit Post': Hash,
  'Blog Post Intro': FileText,
  'TikTok Script': Video,
  'LinkedIn Update': Newspaper,
  'Facebook Post': MessageSquare
}

export default function ContentTypesPage() {
  const [contentTypes, setContentTypes] = useState<(ContentType & { usage_count?: number })[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setContentTypes(mockContentTypes)
      setLoading(false)
    }, 500)
  }, [])

  const handleEdit = (id: string) => {
    console.log('Edit content type:', id)
    // In production, navigate to edit page or open edit modal
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this content type?')) {
      setContentTypes(prev => prev.filter(ct => ct.id !== id))
      // In production, also delete from database
    }
  }

  const handleAddContentType = (newContentType: any) => {
    const contentType: ContentType & { usage_count?: number } = {
      id: `${Date.now()}`,
      name: newContentType.name,
      description: newContentType.description,
      template: newContentType.template,
      variables: newContentType.variables,
      output_format: newContentType.output_format,
      platform_specs: newContentType.platform_specs,
      active: newContentType.active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0
    }
    setContentTypes(prev => [contentType, ...prev])
    // In production, also save to database
  }

  const filteredContentTypes = contentTypes.filter(ct => {
    const matchesSearch = ct.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ct.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && ct.active) ||
                         (statusFilter === 'inactive' && !ct.active)
    return matchesSearch && matchesStatus
  })

  const getPlatformIcon = (name: string) => {
    const Icon = platformIcons[name] || FileText
    return Icon
  }

  const getPlatformColor = (name: string) => {
    if (name.includes('Twitter')) return 'text-blue-500'
    if (name.includes('Instagram')) return 'text-purple-500'
    if (name.includes('Reddit')) return 'text-orange-500'
    if (name.includes('Blog')) return 'text-green-500'
    if (name.includes('TikTok')) return 'text-black'
    if (name.includes('LinkedIn')) return 'text-blue-700'
    if (name.includes('Facebook')) return 'text-blue-600'
    return 'text-gray-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Types</h1>
        <p className="text-gray-600">Manage your content type templates for different platforms</p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search content types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Content Type
        </button>
      </div>

      {/* Add Content Type Modal */}
      <AddContentTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddContentType}
      />

      {/* Content Types Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContentTypes.map((contentType) => {
                const Icon = getPlatformIcon(contentType.name)
                const iconColor = getPlatformColor(contentType.name)

                return (
                  <tr key={contentType.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 ${iconColor}`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contentType.name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {contentType.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contentType.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contentType.usage_count?.toLocaleString() || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {contentType.output_format}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contentType.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(contentType.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contentType.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredContentTypes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No content types found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding a new content type'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Add Content Type
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Total Content Types</div>
          <div className="text-2xl font-bold text-gray-900">{contentTypes.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Active Templates</div>
          <div className="text-2xl font-bold text-green-600">
            {contentTypes.filter(ct => ct.active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Total Usage</div>
          <div className="text-2xl font-bold text-blue-600">
            {contentTypes.reduce((acc, ct) => acc + (ct.usage_count || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}