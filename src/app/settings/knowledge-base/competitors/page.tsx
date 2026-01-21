'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Target,
  TrendingUp,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'
import { CompetitorTier } from '@/types/database'

interface Competitor {
  id: string
  name: string
  tier: CompetitorTier
  price_range: string | null
  target_demo: string | null
  strengths: string[]
  weaknesses: string[]
  key_products: string[]
  social_presence: Record<string, string>
  notes: string | null
  created_at: string
  updated_at: string
}

// 4-tier system per Knowledge Base Appendix Section 9
const tierConfig: Record<CompetitorTier, { label: string; color: string; bgColor: string; description: string }> = {
  direct: {
    label: 'Direct',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Same market, same customer'
  },
  premium_adjacent: {
    label: 'Premium Adjacent',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Higher-end lifestyle overlap'
  },
  city_specific: {
    label: 'City Specific',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Local market competitors'
  },
  aspirational: {
    label: 'Aspirational',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Where we want to be'
  },
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTier, setSelectedTier] = useState<CompetitorTier | 'all'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tier: 'direct' as CompetitorTier,
    price_range: '',
    target_demo: '',
    strengths: [] as string[],
    weaknesses: [] as string[],
    key_products: [] as string[],
    social_presence: {} as Record<string, string>,
    notes: '',
  })
  const [newStrength, setNewStrength] = useState('')
  const [newWeakness, setNewWeakness] = useState('')
  const [newProduct, setNewProduct] = useState('')
  const [newSocialPlatform, setNewSocialPlatform] = useState('')
  const [newSocialHandle, setNewSocialHandle] = useState('')

  useEffect(() => {
    fetchCompetitors()
  }, [])

  const fetchCompetitors = async () => {
    try {
      const res = await fetch('/api/knowledge/competitors')
      const data = await res.json()
      setCompetitors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching competitors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      tier: formData.tier,
      price_range: formData.price_range || null,
      target_demo: formData.target_demo || null,
      strengths: formData.strengths,
      weaknesses: formData.weaknesses,
      key_products: formData.key_products,
      social_presence: formData.social_presence,
      notes: formData.notes || null,
    }

    try {
      if (editingCompetitor) {
        await fetch(`/api/knowledge/competitors/${editingCompetitor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/knowledge/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      setIsModalOpen(false)
      resetForm()
      fetchCompetitors()
    } catch (error) {
      console.error('Error saving competitor:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this competitor?')) return

    try {
      await fetch(`/api/knowledge/competitors/${id}`, { method: 'DELETE' })
      fetchCompetitors()
    } catch (error) {
      console.error('Error deleting competitor:', error)
    }
  }

  const openEditModal = (competitor: Competitor) => {
    setEditingCompetitor(competitor)
    setFormData({
      name: competitor.name,
      tier: competitor.tier,
      price_range: competitor.price_range || '',
      target_demo: competitor.target_demo || '',
      strengths: competitor.strengths || [],
      weaknesses: competitor.weaknesses || [],
      key_products: competitor.key_products || [],
      social_presence: competitor.social_presence || {},
      notes: competitor.notes || '',
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingCompetitor(null)
    setFormData({
      name: '',
      tier: 'direct',
      price_range: '',
      target_demo: '',
      strengths: [],
      weaknesses: [],
      key_products: [],
      social_presence: {},
      notes: '',
    })
    setNewStrength('')
    setNewWeakness('')
    setNewProduct('')
    setNewSocialPlatform('')
    setNewSocialHandle('')
  }

  const addStrength = () => {
    if (newStrength.trim() && !formData.strengths.includes(newStrength.trim())) {
      setFormData({ ...formData, strengths: [...formData.strengths, newStrength.trim()] })
      setNewStrength('')
    }
  }

  const addWeakness = () => {
    if (newWeakness.trim() && !formData.weaknesses.includes(newWeakness.trim())) {
      setFormData({ ...formData, weaknesses: [...formData.weaknesses, newWeakness.trim()] })
      setNewWeakness('')
    }
  }

  const addProduct = () => {
    if (newProduct.trim() && !formData.key_products.includes(newProduct.trim())) {
      setFormData({ ...formData, key_products: [...formData.key_products, newProduct.trim()] })
      setNewProduct('')
    }
  }

  const addSocial = () => {
    if (newSocialPlatform.trim() && newSocialHandle.trim()) {
      setFormData({
        ...formData,
        social_presence: { ...formData.social_presence, [newSocialPlatform.trim()]: newSocialHandle.trim() }
      })
      setNewSocialPlatform('')
      setNewSocialHandle('')
    }
  }

  const filteredCompetitors = competitors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTier = selectedTier === 'all' || c.tier === selectedTier
    return matchesSearch && matchesTier
  })

  const groupedByTier: Record<CompetitorTier, Competitor[]> = {
    direct: filteredCompetitors.filter(c => c.tier === 'direct'),
    premium_adjacent: filteredCompetitors.filter(c => c.tier === 'premium_adjacent'),
    city_specific: filteredCompetitors.filter(c => c.tier === 'city_specific'),
    aspirational: filteredCompetitors.filter(c => c.tier === 'aspirational'),
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
            <div className="p-2 bg-red-100 rounded-lg">
              <Building2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Competitors</h1>
              <p className="text-gray-600">Track competitor profiles and market intelligence</p>
            </div>
          </div>

          <button
            onClick={() => { resetForm(); setIsModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Add Competitor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search competitors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTier === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {(Object.keys(tierConfig) as CompetitorTier[]).map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTier === tier
                  ? `${tierConfig[tier].bgColor} ${tierConfig[tier].color}`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tierConfig[tier].label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading competitors...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(Object.keys(tierConfig) as CompetitorTier[]).map(tier => {
            const tierCompetitors = groupedByTier[tier]
            if (selectedTier !== 'all' && selectedTier !== tier) return null

            return (
              <div key={tier}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className={`text-lg font-semibold ${tierConfig[tier].color}`}>
                    {tierConfig[tier].label} Competitors
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({tierCompetitors.length}) — {tierConfig[tier].description}
                  </span>
                </div>

                {tierCompetitors.length === 0 ? (
                  <p className="text-gray-500 py-4">No {tier} competitors found</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {tierCompetitors.map(competitor => (
                      <div
                        key={competitor.id}
                        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{competitor.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${tierConfig[competitor.tier].bgColor} ${tierConfig[competitor.tier].color}`}>
                                {tierConfig[competitor.tier].label}
                              </span>
                              {competitor.price_range && (
                                <span className="text-sm text-gray-500">{competitor.price_range}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditModal(competitor)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(competitor.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {competitor.target_demo && (
                          <p className="text-sm text-gray-600 mb-3">
                            <Target className="w-3 h-3 inline mr-1" />
                            {competitor.target_demo}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {competitor.strengths.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-green-700 mb-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Strengths
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {competitor.strengths.slice(0, 3).map((s, i) => (
                                  <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                    {s}
                                  </span>
                                ))}
                                {competitor.strengths.length > 3 && (
                                  <span className="text-xs text-gray-400">+{competitor.strengths.length - 3}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {competitor.weaknesses.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-orange-700 mb-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Weaknesses
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {competitor.weaknesses.slice(0, 3).map((w, i) => (
                                  <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                                    {w}
                                  </span>
                                ))}
                                {competitor.weaknesses.length > 3 && (
                                  <span className="text-xs text-gray-400">+{competitor.weaknesses.length - 3}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {competitor.key_products.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Key Products</p>
                            <p className="text-sm text-gray-700">{competitor.key_products.join(', ')}</p>
                          </div>
                        )}

                        {Object.keys(competitor.social_presence).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(competitor.social_presence).map(([platform, handle]) => (
                              <span key={platform} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                {platform}: {handle}
                              </span>
                            ))}
                          </div>
                        )}

                        {competitor.notes && (
                          <p className="text-sm text-gray-500 mt-3 italic">{competitor.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingCompetitor ? 'Edit Competitor' : 'Add Competitor'}
                </h2>
                <button onClick={() => { setIsModalOpen(false); resetForm() }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., Supreme"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier *</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as CompetitorTier })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {(Object.keys(tierConfig) as CompetitorTier[]).map(tier => (
                      <option key={tier} value={tier}>{tierConfig[tier].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <input
                    type="text"
                    value={formData.price_range}
                    onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., $150-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Demo</label>
                  <input
                    type="text"
                    value={formData.target_demo}
                    onChange={(e) => setFormData({ ...formData, target_demo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., Hypebeasts, 18-35"
                  />
                </div>
              </div>

              {/* Strengths */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strengths</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Add a strength..."
                  />
                  <button type="button" onClick={addStrength} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.strengths.map((s, i) => (
                    <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                      {s}
                      <button type="button" onClick={() => setFormData({ ...formData, strengths: formData.strengths.filter((_, j) => j !== i) })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weaknesses</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newWeakness}
                    onChange={(e) => setNewWeakness(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWeakness())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Add a weakness..."
                  />
                  <button type="button" onClick={addWeakness} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.weaknesses.map((w, i) => (
                    <span key={i} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                      {w}
                      <button type="button" onClick={() => setFormData({ ...formData, weaknesses: formData.weaknesses.filter((_, j) => j !== i) })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Products */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Products</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Add a product..."
                  />
                  <button type="button" onClick={addProduct} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.key_products.map((p, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                      {p}
                      <button type="button" onClick={() => setFormData({ ...formData, key_products: formData.key_products.filter((_, j) => j !== i) })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Presence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Social Presence</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSocialPlatform}
                    onChange={(e) => setNewSocialPlatform(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Platform"
                  />
                  <input
                    type="text"
                    value={newSocialHandle}
                    onChange={(e) => setNewSocialHandle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSocial())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="@handle or URL"
                  />
                  <button type="button" onClick={addSocial} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(formData.social_presence).map(([platform, handle]) => (
                    <span key={platform} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                      {platform}: {handle}
                      <button type="button" onClick={() => {
                        const { [platform]: _, ...rest } = formData.social_presence
                        setFormData({ ...formData, social_presence: rest })
                      }}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Additional insights..."
                />
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
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {editingCompetitor ? 'Save Changes' : 'Add Competitor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
