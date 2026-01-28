'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Plus, Filter, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TemplateCard } from '@/components/ltrfl/TemplateCard'
import { TemplateDetailModal } from '@/components/ltrfl/TemplateDetailModal'
import { TemplateEditor } from '@/components/ltrfl/TemplateEditor'
import { CategoryFilter } from '@/components/ltrfl/CategoryFilter'
import { useLTRFLTemplates } from '@/hooks/useLTRFLTemplates'
import { LTRFLTemplate, LTRFL_CATEGORIES, LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { toast } from 'sonner'

function TemplateLibraryContent() {
  const [templates, setTemplates] = useState<LTRFLTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'))
  const [selectedTemplate, setSelectedTemplate] = useState<LTRFLTemplate | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<LTRFLTemplate | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showEditor, setShowEditor] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const pageSize = 20

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    setSelectedCategory(searchParams.get('category'))
  }, [searchParams])

  const effectivePageSize = selectedCategory || searchQuery ? pageSize : 200
  const { templates: fetchedTemplates, total, loading: isLoading } = useLTRFLTemplates({
    category: selectedCategory,
    search: searchQuery,
    page: selectedCategory || searchQuery ? currentPage : 1,
    pageSize: effectivePageSize,
    refreshKey
  })

  useEffect(() => {
    setTemplates(fetchedTemplates)
    setLoading(isLoading)
  }, [fetchedTemplates, isLoading])

  const filteredTemplates = templates
  const totalPages = Math.max(1, Math.ceil((selectedCategory || searchQuery ? total : filteredTemplates.length) / pageSize))
  const paginatedTemplates = selectedCategory || searchQuery
    ? filteredTemplates
    : filteredTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const groupedByCategory = filteredTemplates.reduce((acc, template) => {
    const cat = template.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(template)
    return acc
  }, {} as Record<string, LTRFLTemplate[]>)

  const handleSelectCategory = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.replace(`/ltrfl/templates?${params.toString()}`)
    setSelectedCategory(category)
  }

  const handleCreateTemplate = async (payload: Partial<LTRFLTemplate>) => {
    try {
      const res = await fetch('/api/ltrfl/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        throw new Error('Failed to create template')
      }
      const created = await res.json()
      setTemplates((prev) => [created, ...prev])
      setRefreshKey((prev) => prev + 1)
      toast.success('Template created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create template')
      throw err
    }
  }

  const handleUpdateTemplate = async (id: string, payload: Partial<LTRFLTemplate>) => {
    try {
      setTemplates((prev) =>
        prev.map((template) => (template.id === id ? { ...template, ...payload } : template))
      )

      const res = await fetch(`/api/ltrfl/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        setRefreshKey((prev) => prev + 1)
        throw new Error('Failed to update template')
      }

      const updated = await res.json()
      setTemplates((prev) =>
        prev.map((template) => (template.id === id ? updated : template))
      )
      toast.success('Template updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update template')
      throw err
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      setTemplates((prev) => prev.filter((template) => template.id !== id))
      const res = await fetch(`/api/ltrfl/templates/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        setRefreshKey((prev) => prev + 1)
        throw new Error('Failed to delete template')
      }
      toast.success('Template deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete template')
      throw err
    }
  }

  return (
    <div className="flex h-full">
      {/* Category Sidebar */}
      {showFilters && (
        <CategoryFilter
          categories={LTRFL_CATEGORIES}
          selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          templateCounts={Object.entries(groupedByCategory).reduce((acc, [cat, temps]) => {
            acc[cat] = temps.length
            return acc
          }, {} as Record<string, number>)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[color:var(--surface-border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">Template Library</h1>
              <p className="text-sm text-muted-foreground">
                {templates.length} prompt templates for urn design generation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setShowEditor(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Template
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Templates Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-40 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] animate-pulse"
                />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
              >
                <Plus className="w-8 h-8" style={{ color: LTRFL_BRAND_COLORS.sage }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || selectedCategory
                  ? 'Try adjusting your filters'
                  : 'Templates will appear here once seeded'}
              </p>
            </div>
          ) : selectedCategory || searchQuery ? (
            // Single category view
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-2'
            }>
              {paginatedTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  viewMode={viewMode}
                  onSelect={() => setSelectedTemplate(template)}
                  onUseTemplate={() => {
                    window.location.href = `/ltrfl/concepts/new?template=${template.id}`
                  }}
                  onEdit={() => setEditingTemplate(template)}
                  onDelete={() => handleDeleteTemplate(template.id)}
                  showAdminActions
                />
              ))}
            </div>
          ) : (
            // Grouped by category view
            <div className="space-y-8">
              {Object.entries(groupedByCategory).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-foreground">{category}</h2>
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className="text-sm hover:underline"
                      style={{ color: LTRFL_BRAND_COLORS.sage }}
                    >
                      View all ({categoryTemplates.length})
                    </button>
                  </div>
                  <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-2'
                  }>
                    {categoryTemplates.slice(0, 3).map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        viewMode={viewMode}
                        onSelect={() => setSelectedTemplate(template)}
                        onUseTemplate={() => {
                          window.location.href = `/ltrfl/concepts/new?template=${template.id}`
                        }}
                        onEdit={() => setEditingTemplate(template)}
                        onDelete={() => handleDeleteTemplate(template.id)}
                        showAdminActions
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {((selectedCategory || searchQuery) && totalPages > 1) && (
          <div className="border-t border-[color:var(--surface-border)] px-4 py-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUseTemplate={(template) => {
            // Navigate to concept generator with template
            window.location.href = `/ltrfl/concepts/new?template=${template.id}`
          }}
        />
      )}

      {showEditor && (
        <TemplateEditor
          onClose={() => setShowEditor(false)}
          onSave={handleCreateTemplate}
        />
      )}

      {editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={(payload) => handleUpdateTemplate(editingTemplate.id, payload)}
        />
      )}
    </div>
  )
}

export default function TemplateLibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: LTRFL_BRAND_COLORS.sage }} />
        </div>
      }
    >
      <TemplateLibraryContent />
    </Suspense>
  )
}
