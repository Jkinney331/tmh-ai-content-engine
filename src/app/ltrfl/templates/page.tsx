'use client'

import { useEffect, useState } from 'react'
import { Search, Plus, Filter, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TemplateCard } from '@/components/ltrfl/TemplateCard'
import { TemplateDetailModal } from '@/components/ltrfl/TemplateDetailModal'
import { CategoryFilter } from '@/components/ltrfl/CategoryFilter'
import { LTRFLTemplate, LTRFL_CATEGORIES, LTRFL_BRAND_COLORS } from '@/types/ltrfl'

export default function TemplateLibraryPage() {
  const [templates, setTemplates] = useState<LTRFLTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<LTRFLTemplate | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    loadTemplates()
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/ltrfl/templates?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates
  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / pageSize))
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const groupedByCategory = filteredTemplates.reduce((acc, template) => {
    const cat = template.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(template)
    return acc
  }, {} as Record<string, LTRFLTemplate[]>)

  return (
    <div className="flex h-full">
      {/* Category Sidebar */}
      {showFilters && (
        <CategoryFilter
          categories={LTRFL_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
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
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: LTRFL_BRAND_COLORS.sage }} />
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
                  onClick={() => setSelectedTemplate(template)}
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
                        onClick={() => setSelectedTemplate(template)}
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
    </div>
  )
}
