'use client'

import { cn } from '@/lib/utils'
import { LTRFL_BRAND_COLORS, LTRFLCategory } from '@/types/ltrfl'

interface CategoryFilterProps {
  categories: LTRFLCategory[]
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
  templateCounts: Record<string, number>
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  templateCounts
}: CategoryFilterProps) {
  const totalCount = Object.values(templateCounts).reduce((sum, count) => sum + count, 0)

  return (
    <aside className="w-56 border-r border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] overflow-auto">
      <div className="p-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
          Categories
        </h3>

        <div className="space-y-0.5">
          {/* All Templates */}
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(
              "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
              selectedCategory === null
                ? "text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-[color:var(--surface)]"
            )}
            style={selectedCategory === null ? { backgroundColor: LTRFL_BRAND_COLORS.sage } : undefined}
          >
            <span>All Templates</span>
            <span className={cn(
              "text-xs",
              selectedCategory === null ? "text-white/80" : "text-muted-foreground"
            )}>
              {totalCount}
            </span>
          </button>

          {/* Categories */}
          {categories.map((category) => {
            const count = templateCounts[category.name] || 0
            const isSelected = selectedCategory === category.name

            return (
              <button
                key={category.name}
                onClick={() => onSelectCategory(category.name)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
                  isSelected
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-[color:var(--surface)]"
                )}
                style={isSelected ? { backgroundColor: LTRFL_BRAND_COLORS.sage } : undefined}
              >
                <span className="truncate">{category.name}</span>
                <span className={cn(
                  "text-xs flex-shrink-0 ml-2",
                  isSelected ? "text-white/80" : "text-muted-foreground"
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
