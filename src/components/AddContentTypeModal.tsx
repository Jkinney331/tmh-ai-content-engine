'use client'

import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'

interface AddContentTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (contentType: NewContentType) => void
}

interface NewContentType {
  name: string
  description: string
  template: string
  output_format: 'text' | 'markdown' | 'html'
  variables: Record<string, boolean>
  platform_specs: Record<string, any>
  active: boolean
}

const platformOptions = [
  { value: 'twitter', label: 'Twitter/X', specs: { maxLength: 280, allowHashtags: true } },
  { value: 'instagram', label: 'Instagram', specs: { maxLength: 2200, hashtagLimit: 30 } },
  { value: 'tiktok', label: 'TikTok', specs: { maxDuration: 60, verticalFormat: true } },
  { value: 'linkedin', label: 'LinkedIn', specs: { maxLength: 3000, professionalTone: true } },
  { value: 'reddit', label: 'Reddit', specs: { allowMarkdown: true } },
  { value: 'blog', label: 'Blog Post', specs: { seoOptimized: true, minWords: 150 } },
  { value: 'custom', label: 'Custom', specs: {} },
]

export default function AddContentTypeModal({ isOpen, onClose, onAdd }: AddContentTypeModalProps) {
  const [formData, setFormData] = useState<NewContentType>({
    name: '',
    description: '',
    template: '',
    output_format: 'text',
    variables: {},
    platform_specs: {},
    active: true,
  })
  const [variables, setVariables] = useState<string[]>([''])
  const [selectedPlatform, setSelectedPlatform] = useState('custom')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform)
    const option = platformOptions.find(p => p.value === platform)
    if (option) {
      setFormData(prev => ({
        ...prev,
        platform_specs: option.specs,
      }))
    }
  }

  const addVariable = () => {
    setVariables(prev => [...prev, ''])
  }

  const removeVariable = (index: number) => {
    setVariables(prev => prev.filter((_, i) => i !== index))
  }

  const updateVariable = (index: number, value: string) => {
    setVariables(prev => prev.map((v, i) => i === index ? value : v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Build variables object from array
    const varsObject: Record<string, boolean> = {}
    variables.filter(v => v.trim()).forEach(v => {
      varsObject[v.trim()] = true
    })

    const contentType: NewContentType = {
      ...formData,
      variables: varsObject,
    }

    try {
      onAdd(contentType)
      // Reset form
      setFormData({
        name: '',
        description: '',
        template: '',
        output_format: 'text',
        variables: {},
        platform_specs: {},
        active: true,
      })
      setVariables([''])
      setSelectedPlatform('custom')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Add Content Type</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Twitter Post, Instagram Caption"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={selectedPlatform}
                  onChange={e => handlePlatformChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {platformOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this content type is for..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template *
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Use {'{{variableName}}'} for dynamic content
                </p>
                <textarea
                  required
                  value={formData.template}
                  onChange={e => setFormData(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="e.g., Hey {{cityName}}! {{content}} #{{hashtag}}"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              {/* Variables */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variables
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Define the variables used in your template
                </p>
                <div className="space-y-2">
                  {variables.map((variable, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={variable}
                        onChange={e => updateVariable(index, e.target.value)}
                        placeholder="e.g., cityName, content, hashtag"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {variables.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariable(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVariable}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Variable
                  </button>
                </div>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={formData.output_format}
                  onChange={e => setFormData(prev => ({ ...prev, output_format: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">Plain Text</option>
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={e => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Active (available for content generation)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.template}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Content Type'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
