'use client'

import React, { useState, useEffect } from 'react'
import { ModelGender } from '@/types/database'
import { Plus, Edit2, Trash2, Users, User, X, Check, Filter } from 'lucide-react'

type ModelSpec = {
  id: string
  name: string
  gender: ModelGender
  age_range: string | null
  ethnicity: string | null
  build: string | null
  style_notes: string | null
  city_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const genderConfig = {
  male: { label: 'Male', color: 'bg-blue-100 text-blue-700' },
  female: { label: 'Female', color: 'bg-pink-100 text-pink-700' },
  'non-binary': { label: 'Non-Binary', color: 'bg-purple-100 text-purple-700' },
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelSpec[]>([])
  const [loading, setLoading] = useState(true)
  const [genderFilter, setGenderFilter] = useState<ModelGender | 'all'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<ModelSpec | null>(null)
  const [formData, setFormData] = useState({
    name: '', gender: 'male' as ModelGender, age_range: '', ethnicity: '', build: '', style_notes: '', is_active: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { fetchModels() }, [])

  const fetchModels = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/knowledge/models')
      if (res.ok) setModels(await res.json())
    } finally { setLoading(false) }
  }

  const openAddModal = () => {
    setEditingModel(null)
    setFormData({ name: '', gender: 'male', age_range: '', ethnicity: '', build: '', style_notes: '', is_active: true })
    setIsModalOpen(true)
  }

  const openEditModal = (model: ModelSpec) => {
    setEditingModel(model)
    setFormData({
      name: model.name, gender: model.gender, age_range: model.age_range || '',
      ethnicity: model.ethnicity || '', build: model.build || '', style_notes: model.style_notes || '', is_active: model.is_active
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = editingModel ? `/api/knowledge/models/${editingModel.id}` : '/api/knowledge/models'
      const res = await fetch(url, { method: editingModel ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { setIsModalOpen(false); fetchModels() }
    } finally { setIsSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this model spec?')) return
    const res = await fetch(`/api/knowledge/models/${id}`, { method: 'DELETE' })
    if (res.ok) fetchModels()
  }

  const filteredModels = genderFilter === 'all' ? models : models.filter(m => m.gender === genderFilter)

  if (loading) return <div className="p-6"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-8"></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>)}</div></div></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Model Specs</h1>
        <p className="text-gray-600">Configure model demographics and city-specific casting rules</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={genderFilter} onChange={e => setGenderFilter(e.target.value as ModelGender | 'all')} className="px-3 py-2 border rounded-lg">
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-Binary</option>
          </select>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto">
          <Plus className="w-4 h-4" /> Add Model Spec
        </button>
      </div>

      {filteredModels.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No model specs found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModels.map(model => (
            <div key={model.id} className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${genderConfig[model.gender].color}`}>
                    {genderConfig[model.gender].label}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(model)} className="p-1.5 hover:bg-gray-100 rounded"><Edit2 className="w-4 h-4 text-gray-600" /></button>
                  <button onClick={() => handleDelete(model.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-600" /></button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {model.age_range && <p><span className="font-medium">Age:</span> {model.age_range}</p>}
                {model.ethnicity && <p><span className="font-medium">Ethnicity:</span> {model.ethnicity}</p>}
                {model.build && <p><span className="font-medium">Build:</span> {model.build}</p>}
              </div>
              {model.style_notes && <p className="mt-2 text-xs text-gray-500 italic line-clamp-2">{model.style_notes}</p>}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">{editingModel ? 'Edit' : 'Add'} Model Spec</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., LA Male" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <div className="flex gap-2">
                    {(['male', 'female', 'non-binary'] as ModelGender[]).map(g => (
                      <button key={g} type="button" onClick={() => setFormData(p => ({ ...p, gender: g }))} className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${formData.gender === g ? genderConfig[g].color + ' border-current' : 'border-gray-200'}`}>
                        {genderConfig[g].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                    <input type="text" value={formData.age_range} onChange={e => setFormData(p => ({ ...p, age_range: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., 22-30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Build</label>
                    <input type="text" value={formData.build} onChange={e => setFormData(p => ({ ...p, build: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Athletic" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ethnicity</label>
                  <input type="text" value={formData.ethnicity} onChange={e => setFormData(p => ({ ...p, ethnicity: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Diverse/Mixed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Style Notes</label>
                  <textarea value={formData.style_notes} onChange={e => setFormData(p => ({ ...p, style_notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Casting direction..." />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={isSubmitting || !formData.name} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    <Check className="w-4 h-4" /> {editingModel ? 'Save' : 'Add'}
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
