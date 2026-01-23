'use client'

import Link from 'next/link'
import {
  Footprints,
  Users,
  Shirt,
  MapPin,
  Building2,
  FileText,
  Lightbulb,
  ChevronRight,
  Database
} from 'lucide-react'

const knowledgeCategories = [
  {
    name: 'Sneakers',
    description: 'Manage approved sneakers by tier (Grails, Heat, Banned)',
    href: '/settings/knowledge-base/sneakers',
    icon: Footprints,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    name: 'Model Specs',
    description: 'Configure model demographics and city-specific casting',
    href: '/settings/knowledge-base/models',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Style Slots',
    description: 'Manage the 12 outfit configurations (6 men\'s, 6 women\'s)',
    href: '/settings/knowledge-base/styles',
    icon: Shirt,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'City Profiles',
    description: 'Enhanced city data with slang, landmarks, and culture',
    href: '/settings/knowledge-base/cities',
    icon: MapPin,
    color: 'bg-green-100 text-green-600',
  },
  {
    name: 'Competitors',
    description: 'Track competitor profiles and market intelligence',
    href: '/settings/knowledge-base/competitors',
    icon: Building2,
    color: 'bg-red-100 text-red-600',
  },
  {
    name: 'Prompt Templates',
    description: 'Manage and version prompt templates for generation',
    href: '/settings/knowledge-base/prompts',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    name: 'Learnings',
    description: 'View insights extracted from feedback and conversations',
    href: '/settings/knowledge-base/learnings',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-600',
  },
]

export default function KnowledgeBasePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="surface-strong rounded-2xl p-6 shadow-glass">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-2">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Knowledge Base</p>
            <h1 className="text-2xl font-semibold text-foreground">
              Institutional memory for TMH generation
            </h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Keep city insights, brand intelligence, and design rules centralized so the AI can
          generate culturally tuned outputs across campaigns.
        </p>
      </div>

      <div className="surface rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/15 p-2 text-primary">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">How this fuels generation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Categories below power your city research, prompt templates, and decision engine.
              Keep them updated to improve accuracy, consistency, and brand alignment.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {knowledgeCategories.map((category) => {
          const Icon = category.icon
          return (
            <Link
              key={category.name}
              href={category.href}
              className="surface group flex flex-col gap-3 rounded-2xl p-5 transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="surface-strong rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Knowledge Base Stats</p>
          <span className="text-xs text-muted-foreground">Supabase sync pending</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Sneakers", value: "—" },
            { label: "Model Specs", value: "—" },
            { label: "Style Slots", value: "12" },
            { label: "Learnings", value: "—" },
          ].map((stat) => (
            <div key={stat.label} className="surface rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Stats will populate once knowledge tables are connected to Supabase.
        </p>
      </div>
    </div>
  )
}
