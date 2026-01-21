'use client'

import React, { useState, useEffect } from 'react'
import { StyleGender } from '@/types/database'
import { Edit2, Shirt, X, Check } from 'lucide-react'

type StyleSlot = {
  id: string
  slot_code: string
  slot_number: number
  gender: StyleGender
  name: string
  top: string
  bottom: string
  sneaker_vibe: string | null
  pants_style: string | null
  chain_style: string | null
  accessories: string[]
  best_for: string | null
  mood: string | null
  is_active: boolean
}

export default function StylesPage() {
  const [styles, setStyles] = useState<StyleSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStyle, setEditingStyle] = useState<StyleSlot | null>(null)
  const [formData, setFormData] = useState({
    name: '', top: '', bottom: '', sneaker_vibe: '', pants_style: '', chain_style: '', accessories: [] as string[], best_for: '', mood: '', is_active: true
  })
  const [accessoryInput, setAccessoryInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { fetchStyles() }, [])

  const fetchStyles = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/knowledge/styles')
      if (res.ok) setStyles(await res.json())
    } finally { setLoading(false) }
  }

  const openEditModal = (style: StyleSlot) => {
    setEditingStyle(style)
    setFormData({
      name: style.name, top: style.top, bottom: style.bottom,
      sneaker_vibe: style.sneaker_vibe || '', pants_style: style.pants_style || '',
      chain_style: style.chain_style || '', accessories: style.accessories || [],
      best_for: style.best_for || '', mood: style.mood || '', is_active: style.is_active
    })
    setAccessoryInput('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStyle) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/knowledge/styles/${editingStyle.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      })
      if (res.ok) { setIsModalOpen(false); fetchStyles() }
    } finally { setIsSubmitting(false) }
  }

  const addAccessory = () => {
    if (accessoryInput.trim() && !formData.accessories.includes(accessoryInput.trim())) {
      setFormData(p => ({ ...p, accessories: [...p.accessories, accessoryInput.trim()] }))
      setAccessoryInput('')
    }
  }

  const maleStyles = styles.filter(s => s.gender === 'male').sort((a, b) => a.slot_number - b.slot_number)
  const femaleStyles = styles.filter(s => s.gender === 'female').sort((a, b) => a.slot_number - b.slot_number)

  if (loading) return <div className="p-6"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-8"></div><div className="grid grid-cols-2 gap-8"><div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}</div><div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}</div></div></div></div>

  const StyleCard = ({ style }: { style: StyleSlot }) => (
    <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 group relative hover:border-blue-200 transition-colors">
      <button onClick={() => openEditModal(style)} className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity">
        <Edit2 className="w-4 h-4 text-gray-600" />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg font-bold text-gray-400">#{style.slot_number}</span>
        <h3 className="font-semibold text-gray-900">{style.name}</h3>
        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{style.slot_code}</span>
      </div>
      <div className="space-y-1 text-sm">
        <p><span className="font-medium text-gray-500">Top:</span> {style.top}</p>
        <p><span className="font-medium text-gray-500">Bottom:</span> {style.bottom}</p>
        {style.sneaker_vibe && <p><span className="font-medium text-gray-500">Sneaker Vibe:</span> {style.sneaker_vibe}</p>}
        {style.pants_style && <p><span className="font-medium text-gray-500">Pants:</span> {style.pants_style}</p>}
        {style.chain_style && <p><span className="font-medium text-gray-500">Chain:</span> {style.chain_style}</p>}
        {style.accessories && style.accessories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {style.accessories.map(a => <span key={a} className="px-2 py-0.5 bg-white/70 rounded-full text-xs">{a}</span>)}
          </div>
        )}
      </div>
      {style.best_for && <p className="mt-2 text-xs text-blue-600"><span className="font-medium">Best for:</span> {style.best_for}</p>}
      {style.mood && <p className="mt-1 text-xs text-gray-600 italic">{style.mood}</p>}
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Style Slots</h1>
        <p className="text-gray-600">12 pre-configured outfit combinations (6 men's, 6 women's)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shirt className="w-5 h-5 text-blue-600" /> Men's Styles
          </h2>
          <div className="space-y-3">
            {maleStyles.length > 0 ? maleStyles.map(s => <StyleCard key={s.id} style={s} />) :
              <div className="text-center py-8 bg-gray-50 rounded-lg border text-gray-500">No men's styles configured</div>}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shirt className="w-5 h-5 text-pink-600" /> Women's Styles
          </h2>
          <div className="space-y-3">
            {femaleStyles.length > 0 ? femaleStyles.map(s => <StyleCard key={s.id} style={s} />) :
              <div className="text-center py-8 bg-gray-50 rounded-lg border text-gray-500">No women's styles configured</div>}
          </div>
        </div>
      </div>

      {isModalOpen && editingStyle && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Edit Style Slot #{editingStyle.slot_number}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top</label>
                    <input type="text" value={formData.top} onChange={e => setFormData(p => ({ ...p, top: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bottom</label>
                    <input type="text" value={formData.bottom} onChange={e => setFormData(p => ({ ...p, bottom: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sneaker Vibe</label>
                    <input type="text" value={formData.sneaker_vibe} onChange={e => setFormData(p => ({ ...p, sneaker_vibe: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Classic, Bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pants Style</label>
                    <input type="text" value={formData.pants_style} onChange={e => setFormData(p => ({ ...p, pants_style: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Slim, Baggy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chain Style</label>
                    <input type="text" value={formData.chain_style} onChange={e => setFormData(p => ({ ...p, chain_style: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Cuban, Rope" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accessories</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={accessoryInput} onChange={e => setAccessoryInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAccessory())} className="flex-1 px-3 py-2 border rounded-lg" placeholder="Add accessory..." />
                    <button type="button" onClick={addAccessory} className="px-3 py-2 bg-gray-100 rounded-lg">+</button>
                  </div>
                  {formData.accessories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.accessories.map(a => (
                        <span key={a} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          {a} <button type="button" onClick={() => setFormData(p => ({ ...p, accessories: p.accessories.filter(x => x !== a) }))}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Best For</label>
                    <input type="text" value={formData.best_for} onChange={e => setFormData(p => ({ ...p, best_for: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Street, Events" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
                    <input type="text" value={formData.mood} onChange={e => setFormData(p => ({ ...p, mood: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Relaxed, confident" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                    <Check className="w-4 h-4" /> Save Changes
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
