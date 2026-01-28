'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  Megaphone,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
  disabled?: boolean
  badge?: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/ltrfl', icon: LayoutDashboard },
  { id: 'templates', label: 'Template Library', href: '/ltrfl/templates', icon: FileText },
  { id: 'concepts', label: 'My Concepts', href: '/ltrfl/concepts', icon: Lightbulb },
  { id: 'marketing', label: 'Marketing Content', href: '/ltrfl/marketing', icon: Megaphone, disabled: true, badge: 'Phase 3' },
]

export function LTRFLSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/ltrfl') {
      return pathname === '/ltrfl'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="w-64 border-r border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] flex flex-col"
      style={{
        '--ltrfl-sage': LTRFL_BRAND_COLORS.sage,
        '--ltrfl-cream': LTRFL_BRAND_COLORS.cream
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="p-4 border-b border-[color:var(--surface-border)]">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">LTRFL</h2>
            <p className="text-xs text-muted-foreground">Urn Design Studio</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.id}
              href={item.disabled ? '#' : item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active && !item.disabled && "text-white",
                !active && !item.disabled && "text-muted-foreground hover:text-foreground hover:bg-[color:var(--surface)]",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
              style={active && !item.disabled ? { backgroundColor: LTRFL_BRAND_COLORS.sage } : undefined}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[color:var(--surface)] text-muted-foreground">
                  {item.badge}
                </span>
              )}
              {active && !item.disabled && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-3 border-t border-[color:var(--surface-border)]">
        <Link
          href="/ltrfl/concepts/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
        >
          <Sparkles className="w-4 h-4" />
          New Concept
        </Link>
      </div>

      {/* Brand Footer */}
      <div className="p-4 border-t border-[color:var(--surface-border)]">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium" style={{ color: LTRFL_BRAND_COLORS.sage }}>Laid to Rest for Less</p>
          <p className="mt-1 opacity-75">Memorial Keepers</p>
        </div>
      </div>
    </aside>
  )
}
