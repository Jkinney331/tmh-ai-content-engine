'use client'

import React, { useState, useEffect } from 'react'
import { Database, SneakerTier, SNEAKER_TIER_LABELS } from '@/types/database'
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Flame,
  Ban,
  Search,
  X,
  Check,
  Crown,
  Zap,
  MapPin
} from 'lucide-react'

type Sneaker = Database['public']['Tables']['sneakers']['Row']

// 6-tier system per Knowledge Base Appendix Section 4
const tierConfig: Record<SneakerTier, { label: string; icon: typeof Star; color: string; bg: string; border: string }> = {
  ultra_grail: { label: 'Ultra Grail', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  heavy_heat: { label: 'Heavy Heat', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  certified_heat: { label: 'Certified Heat', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  new_heat: { label: 'New Heat', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  city_specific: { label: 'City Specific', icon: MapPin, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  banned: { label: 'Banned', icon: Ban, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
}

interface SneakerFormData {
  name: string
  tier: SneakerTier
  brand: string
  colorway: string
  city_relevance: string[]
  notes: string
  is_active: boolean
}

const emptyForm: SneakerFormData = {
  name: '',
  tier: 'certified_heat',
  brand: '',
  colorway: '',
  city_relevance: [],
  notes: '',
  is_active: true,
}

export default function SneakersPage() {
  const [sneakers, setSneakers] = useState<Sneaker[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<SneakerTier>('ultra_grail')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSneaker, setEditingSneaker] = useState<Sneaker | null>(null)
  const [formData, setFormData] = useState<SneakerFormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cityInput, setCityInput] = useState('')

  useEffect(() => {
    fetchSneakers()
  }, [])

  const fetchSneakers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/knowledge/sneakers')
      if (res.ok) {
        const data = await res.json()
        setSneakers(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching sneakers:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingSneaker(null)
    setFormData({ ...emptyForm, tier: activeTab })
    setCityInput('')
    setIsModalOpen(true)
  }

  const openEditModal = (sneaker: Sneaker) => {
    setEditingSneaker(sneaker)
    setFormData({
      name: sneaker.name,
      tier: sneaker.tier,
      brand: sneaker.brand || '',
      colorway: sneaker.colorway || '',
      city_relevance: sneaker.city_relevance || [],
      notes: sneaker.notes || '',
      is_active: sneaker.is_active,
    })
    setCityInput('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingSneaker
        ? `/api/knowledge/sneakers/${editingSneaker.id}`
        : '/api/knowledge/sneakers'

      const res = await fetch(url, {
        method: editingSneaker ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setIsModalOpen(false)
        fetchSneakers()
      }
    } catch (error) {
      console.error('Error saving sneaker:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sneaker?')) return

    try {
      const res = await fetch(`/api/knowledge/sneakers/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchSneakers()
      }
    } catch (error) {
      console.error('Error deleting sneaker:', error)
    }
  }

  const addCity = () => {
    if (cityInput.trim() && !formData.city_relevance.includes(cityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        city_relevance: [...prev.city_relevance, cityInput.trim()],
      }))
      setCityInput('')
    }
  }

  const removeCity = (city: string) => {
    setFormData(prev => ({
      ...prev,
      city_relevance: prev.city_relevance.filter(c => c !== city),
    }))
  }

  const filteredSneakers = sneakers.filter(s => {
    const matchesTier = s.tier === activeTab
    const matchesSearch = searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTier && matchesSearch
  })

  const tierCounts: Record<SneakerTier, number> = {
    ultra_grail: sneakers.filter(s => s.tier === 'ultra_grail').length,
    heavy_heat: sneakers.filter(s => s.tier === 'heavy_heat').length,
    certified_heat: sneakers.filter(s => s.tier === 'certified_heat').length,
    new_heat: sneakers.filter(s => s.tier === 'new_heat').length,
    city_specific: sneakers.filter(s => s.tier === 'city_specific').length,
    banned: sneakers.filter(s => s.tier === 'banned').length,
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sneakers</h1>
        <p className="text-gray-600">Manage approved sneakers for TMH content generation</p>
      </div>

      {/* Tier Tabs */}
      <div className="flex gap-2 mb-6">
        {(Object.entries(tierConfig) as [SneakerTier, typeof tierConfig.ultra_grail][]).map(([tier, config]) => {
          const Icon = config.icon
          return (
            <button
              key={tier}
              onClick={() => setActiveTab(tier)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${activeTab === tier
                  ? `${config.bg} ${config.border} border-2 ${config.color}`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {config.label}
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/50">
                {tierCounts[tier]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search & Add */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sneakers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Sneaker
        </button>
      </div>

      {/* Sneakers Grid */}
      {filteredSneakers.length === 0 ? (
        <div className={`text-center py-12 ${tierConfig[activeTab].bg} rounded-lg border ${tierConfig[activeTab].border}`}>
          {React.createElement(tierConfig[activeTab].icon, { className: `mx-auto h-12 w-12 ${tierConfig[activeTab].color} mb-4` })}
          <h3 className="text-sm font-medium text-gray-900">No {tierConfig[activeTab].label.toLowerCase()} sneakers</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery ? 'Try a different search term' : 'Add your first sneaker to this tier'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSneakers.map(sneaker => {
            const config = tierConfig[sneaker.tier]
            const Icon = config.icon
            return (
              <div
                key={sneaker.id}
                className={`p-4 rounded-lg border ${config.border} ${config.bg} relative group`}
              >
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(sneaker)}
                    className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(sneaker.id)}
                    className="p-1.5 bg-white rounded-lg shadow hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${config.color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{sneaker.name}</h3>
                    {sneaker.brand && (
                      <p className="text-sm text-gray-600">{sneaker.brand}</p>
                    )}
                    {sneaker.colorway && (
                      <p className="text-xs text-gray-500 mt-1">{sneaker.colorway}</p>
                    )}
                  </div>
                </div>

                {/* City Relevance */}
                {sneaker.city_relevance && sneaker.city_relevance.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {sneaker.city_relevance.slice(0, 3).map(city => (
                      <span
                        key={city}
                        className="px-2 py-0.5 text-xs bg-white/70 rounded-full text-gray-700"
                      >
                        {city}
                      </span>
                    ))}
                    {sneaker.city_relevance.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-white/70 rounded-full text-gray-500">
                        +{sneaker.city_relevance.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {sneaker.notes && (
                  <p className="mt-2 text-xs text-gray-600 italic line-clamp-2">{sneaker.notes}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {editingSneaker ? 'Edit Sneaker' : 'Add Sneaker'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    placeholder="e.g., Air Jordan 1 Chicago"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier *
                  </label>
                  <div className="flex gap-2">
                    {(Object.entries(tierConfig) as [SneakerTier, typeof tierConfig.ultra_grail][]).map(([tier, config]) => {
                      const Icon = config.icon
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tier }))}
                          className={`
                            flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                            ${formData.tier === tier
                              ? `${config.bg} ${config.border} ${config.color}`
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Brand & Colorway */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="e.g., Jordan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Colorway
                    </label>
                    <input
                      type="text"
                      value={formData.colorway}
                      onChange={e => setFormData(prev => ({ ...prev, colorway: e.target.value }))}
                      placeholder="e.g., Bred"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* City Relevance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City Relevance
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={cityInput}
                      onChange={e => setCityInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCity())}
                      placeholder="Add a city..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addCity}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.city_relevance.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.city_relevance.map(city => (
                        <span
                          key={city}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          {city}
                          <button
                            type="button"
                            onClick={() => removeCity(city)}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any notes about this sneaker..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Active (available for content generation)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {editingSneaker ? 'Save Changes' : 'Add Sneaker'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
