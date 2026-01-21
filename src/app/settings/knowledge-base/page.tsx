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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Database className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
        </div>
        <p className="text-gray-600">
          Configure all TMH institutional knowledge for AI-powered content generation
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">How the Knowledge Base Works</h3>
            <p className="text-sm text-blue-700 mt-1">
              Everything you configure here is used by the AI to make smarter content decisions.
              The chat agent can access this data to answer questions, and the decision engine
              uses it to auto-generate culturally appropriate content for each city.
            </p>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {knowledgeCategories.map((category) => {
          const Icon = category.icon
          return (
            <Link
              key={category.name}
              href={category.href}
              className="group p-5 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {category.name}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {category.description}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Knowledge Base Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">—</p>
            <p className="text-sm text-gray-500">Sneakers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">—</p>
            <p className="text-sm text-gray-500">Model Specs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-500">Style Slots</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">—</p>
            <p className="text-sm text-gray-500">Learnings</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500 text-center">
          Stats will populate once connected to Supabase
        </p>
      </div>
    </div>
  )
}
