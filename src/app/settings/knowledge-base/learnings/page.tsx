'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Lightbulb,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  MessageSquare,
  ThumbsUp,
  User,
  TrendingUp,
  Filter
} from 'lucide-react'
import { LearningCategory, LearningSource } from '@/types/database'

interface Learning {
  id: string
  category: LearningCategory
  city_id: string | null
  insight: string
  source: LearningSource
  source_id: string | null
  confidence: number
  tags: string[]
  applied_count: number
  created_at: string
  updated_at: string
}

// 10-category system per Knowledge Base Appendix Section 13
const categoryConfig: Record<LearningCategory, { label: string; color: string; bgColor: string }> = {
  preference: { label: 'Preference', color: 'text-green-700', bgColor: 'bg-green-100' },
  dislike: { label: 'Dislike', color: 'text-red-700', bgColor: 'bg-red-100' },
  rule: { label: 'Rule', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  intel: { label: 'Intel', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  sneakers: { label: 'Sneakers', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  models: { label: 'Models', color: 'text-pink-700', bgColor: 'bg-pink-100' },
  styles: { label: 'Styles', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  cities: { label: 'Cities', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  prompts: { label: 'Prompts', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  general: { label: 'General', color: 'text-gray-700', bgColor: 'bg-gray-100' },
}

const sourceConfig: Record<LearningSource, { label: string; icon: typeof MessageSquare }> = {
  feedback: { label: 'Feedback', icon: ThumbsUp },
  conversation: { label: 'Conversation', icon: MessageSquare },
  manual: { label: 'Manual', icon: User },
}

export default function LearningsPage() {
  const [learnings, setLearnings] = useState<Learning[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<LearningCategory | 'all'>('all')
  const [selectedSource, setSelectedSource] = useState<LearningSource | 'all'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLearning, setEditingLearning] = useState<Learning | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    category: 'general' as LearningCategory,
    insight: '',
    source: 'manual' as LearningSource,
    confidence: 0.5,
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    fetchLearnings()
  }, [])

  const fetchLearnings = async () => {
    try {
      const res = await fetch('/api/knowledge/learnings')
      const data = await res.json()
      setLearnings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching learnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      category: formData.category,
      insight: formData.insight,
      source: formData.source,
      confidence: formData.confidence,
      tags: formData.tags,
    }

    try {
      if (editingLearning) {
        await fetch(`/api/knowledge/learnings/${editingLearning.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/knowledge/learnings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      setIsModalOpen(false)
      resetForm()
      fetchLearnings()
    } catch (error) {
      console.error('Error saving learning:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this learning?')) return

    try {
      await fetch(`/api/knowledge/learnings/${id}`, { method: 'DELETE' })
      fetchLearnings()
    } catch (error) {
      console.error('Error deleting learning:', error)
    }
  }

  const openEditModal = (learning: Learning) => {
    setEditingLearning(learning)
    setFormData({
      category: learning.category,
      insight: learning.insight,
      source: learning.source,
      confidence: learning.confidence,
      tags: learning.tags || [],
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingLearning(null)
    setFormData({
      category: 'general',
      insight: '',
      source: 'manual',
      confidence: 0.5,
      tags: [],
    })
    setNewTag('')
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const filteredLearnings = learnings.filter(l => {
    const matchesSearch = l.insight.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || l.category === selectedCategory
    const matchesSource = selectedSource === 'all' || l.source === selectedSource
    return matchesSearch && matchesCategory && matchesSource
  })

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/settings/knowledge-base"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Knowledge Base
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Learnings</h1>
              <p className="text-gray-600">View insights extracted from feedback and conversations</p>
            </div>
          </div>

          <button
            onClick={() => { resetForm(); setIsModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            <Plus className="w-4 h-4" />
            Add Learning
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search insights or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Category:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {(Object.keys(categoryConfig) as LearningCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? `${categoryConfig[cat].bgColor} ${categoryConfig[cat].color}`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {categoryConfig[cat].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Source:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedSource('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedSource === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {(Object.keys(sourceConfig) as LearningSource[]).map(src => (
                <button
                  key={src}
                  onClick={() => setSelectedSource(src)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSource === src
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sourceConfig[src].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-gray-900">{learnings.length}</p>
          <p className="text-sm text-gray-500">Total Learnings</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">
            {learnings.filter(l => l.confidence >= 0.8).length}
          </p>
          <p className="text-sm text-gray-500">High Confidence</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-600">
            {learnings.reduce((sum, l) => sum + l.applied_count, 0)}
          </p>
          <p className="text-sm text-gray-500">Times Applied</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-purple-600">
            {learnings.filter(l => l.source === 'feedback').length}
          </p>
          <p className="text-sm text-gray-500">From Feedback</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading learnings...</p>
        </div>
      ) : filteredLearnings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No learnings found</p>
          <p className="text-sm text-gray-400 mt-1">Add manual insights or they'll be extracted from feedback</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLearnings.map(learning => {
            const SourceIcon = sourceConfig[learning.source].icon
            return (
              <div
                key={learning.id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryConfig[learning.category].bgColor} ${categoryConfig[learning.category].color}`}>
                        {categoryConfig[learning.category].label}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <SourceIcon className="w-3 h-3" />
                        {sourceConfig[learning.source].label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(learning.confidence)}`}>
                        {Math.round(learning.confidence * 100)}% confidence
                      </span>
                    </div>

                    <p className="text-gray-900 mb-3">{learning.insight}</p>

                    <div className="flex items-center gap-4">
                      {learning.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {learning.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Applied {learning.applied_count}x
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(learning)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(learning.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingLearning ? 'Edit Learning' : 'Add Learning'}
                </h2>
                <button onClick={() => { setIsModalOpen(false); resetForm() }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as LearningCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  {(Object.keys(categoryConfig) as LearningCategory[]).map(cat => (
                    <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insight *</label>
                <textarea
                  value={formData.insight}
                  onChange={(e) => setFormData({ ...formData, insight: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="What did you learn?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as LearningSource })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  >
                    {(Object.keys(sourceConfig) as LearningSource[]).map(src => (
                      <option key={src} value={src}>{sourceConfig[src].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidence: {Math.round(formData.confidence * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formData.confidence}
                    onChange={(e) => setFormData({ ...formData, confidence: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    placeholder="Add a tag..."
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, i) => (
                    <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                      #{tag}
                      <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, j) => j !== i) })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm() }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  {editingLearning ? 'Save Changes' : 'Add Learning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
