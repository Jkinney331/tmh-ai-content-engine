'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  KeyIcon,
  DocumentTextIcon,
  SparklesIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

type IconComponent = React.ComponentType<{ className?: string }>

interface SectionCard {
  title: string
  description: string
  icon: IconComponent
  href: string
  stats: {
    label: string
    value: string | number
    status?: 'success' | 'warning' | 'neutral'
  }[]
}

export default function SettingsPage() {
  const [apiStatus, setApiStatus] = useState({
    configured: 0,
    total: 0,
    active: 0
  })

  const [contentTypes, setContentTypes] = useState({
    total: 0,
    active: 0
  })

  const [templates, setTemplates] = useState({
    total: 0,
    custom: 0
  })

  const [preferences, setPreferences] = useState({
    configured: 0,
    total: 5
  })

  useEffect(() => {
    // Simulate fetching data - in production, this would be API calls
    const fetchSettings = async () => {
      // API Status data
      setApiStatus({
        configured: 5,
        total: 8,
        active: 3
      })

      // Content Types data
      setContentTypes({
        total: 12,
        active: 7
      })

      // Templates data
      setTemplates({
        total: 15,
        custom: 4
      })

      // Preferences data
      setPreferences({
        configured: 3,
        total: 5
      })
    }

    fetchSettings()
  }, [])

  const sections: SectionCard[] = [
    {
      title: 'API Status',
      description: 'Manage API keys and integration settings for various services',
      icon: KeyIcon,
      href: '/settings/api',
      stats: [
        {
          label: 'APIs Configured',
          value: `${apiStatus.configured} of ${apiStatus.total}`,
          status: apiStatus.configured === apiStatus.total ? 'success' : 'warning'
        },
        {
          label: 'Active Connections',
          value: apiStatus.active,
          status: apiStatus.active > 0 ? 'success' : 'neutral'
        },
      ]
    },
    {
      title: 'Content Types',
      description: 'Configure and manage different types of content generation',
      icon: DocumentTextIcon,
      href: '/settings/content-types',
      stats: [
        {
          label: 'Total Types',
          value: contentTypes.total,
          status: 'neutral'
        },
        {
          label: 'Active Types',
          value: contentTypes.active,
          status: contentTypes.active > 0 ? 'success' : 'warning'
        },
      ]
    },
    {
      title: 'Prompt Templates',
      description: 'Create and edit AI prompt templates for content generation',
      icon: SparklesIcon,
      href: '/settings/prompts',
      stats: [
        {
          label: 'Total Templates',
          value: templates.total,
          status: 'neutral'
        },
        {
          label: 'Custom Templates',
          value: templates.custom,
          status: templates.custom > 0 ? 'success' : 'neutral'
        },
      ]
    },
    {
      title: 'Preferences',
      description: 'Customize your application experience and default settings',
      icon: CogIcon,
      href: '/settings/preferences',
      stats: [
        {
          label: 'Settings Configured',
          value: `${preferences.configured} of ${preferences.total}`,
          status: preferences.configured === preferences.total ? 'success' : 'warning'
        },
      ]
    },
  ]

  const getStatusIcon = (status?: string) => {
    if (status === 'success') {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />
    } else if (status === 'warning') {
      return <ExclamationCircleIcon className="h-4 w-4 text-yellow-500" />
    }
    return null
  }

  const getStatusColor = (status?: string) => {
    if (status === 'success') return 'text-green-700'
    if (status === 'warning') return 'text-yellow-700'
    return 'text-gray-700'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your application configuration and preferences
        </p>
      </div>

      {/* Settings Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon

          return (
            <Link
              key={section.title}
              href={section.href}
              className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>

              {/* Stats */}
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {section.stats.map((stat, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {getStatusIcon(stat.status)}
                      <div>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                        <p className={`text-sm font-medium ${getStatusColor(stat.status)}`}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-200" />
            </Link>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">Quick Tip</h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                Click on any section card to access detailed configuration options.
                Your settings are automatically saved as you make changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}