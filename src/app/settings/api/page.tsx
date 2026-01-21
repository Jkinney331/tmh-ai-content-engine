'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  SignalIcon
} from '@heroicons/react/24/outline'

interface APIConfig {
  id: string
  name: string
  description: string
  endpoint?: string
  status: 'connected' | 'error' | 'checking' | 'not_configured'
  lastUsed?: Date
  errorMessage?: string
  required: boolean
}

export default function APIStatusPage() {
  const [apis, setApis] = useState<APIConfig[]>([
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Database and authentication provider',
      endpoint: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      status: 'checking',
      required: true
    },
    {
      id: 'claude',
      name: 'Claude',
      description: 'Anthropic AI for content generation',
      endpoint: 'https://api.anthropic.com',
      status: 'checking',
      required: true
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'AI-powered search and research',
      endpoint: 'https://api.perplexity.ai',
      status: 'checking',
      required: true
    },
    {
      id: 'nano-banana',
      name: 'Nano Banana',
      description: 'Fast AI model for quick tasks',
      endpoint: 'https://api.nano-banana.com',
      status: 'checking',
      required: true
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT models for text generation',
      endpoint: 'https://api.openai.com',
      status: 'checking',
      required: true
    },
    {
      id: 'sora-2',
      name: 'Sora 2',
      description: 'AI video generation model',
      endpoint: 'https://api.openai.com/sora',
      status: 'checking',
      required: true
    },
    {
      id: 'gemini',
      name: 'Gemini',
      description: 'Google AI for multimodal tasks',
      endpoint: 'https://generativelanguage.googleapis.com',
      status: 'checking',
      required: true
    }
  ])

  const [isTestingAll, setIsTestingAll] = useState(false)
  const [testingApi, setTestingApi] = useState<string | null>(null)

  // Simulate checking API status on mount
  useEffect(() => {
    checkAllAPIs()
  }, [])

  const checkAllAPIs = async () => {
    // Simulate API status checks
    const updatedApis = apis.map(api => {
      // Simulate random status for demo
      const randomStatus = Math.random()
      let status: APIConfig['status'] = 'connected'
      let lastUsed = undefined
      let errorMessage = undefined

      if (randomStatus < 0.7) {
        status = 'connected'
        lastUsed = new Date(Date.now() - Math.random() * 86400000) // Random time within last 24 hours
      } else if (randomStatus < 0.85) {
        status = 'error'
        errorMessage = 'Connection timeout - please check your API key'
      } else {
        status = 'not_configured'
      }

      return { ...api, status, lastUsed, errorMessage }
    })

    setApis(updatedApis)
  }

  const testConnection = async (apiId: string) => {
    setTestingApi(apiId)

    // Update status to checking
    setApis(prev => prev.map(api =>
      api.id === apiId ? { ...api, status: 'checking', errorMessage: undefined } : api
    ))

    // Simulate API test delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate test result
    const success = Math.random() > 0.3

    setApis(prev => prev.map(api => {
      if (api.id === apiId) {
        if (success) {
          return {
            ...api,
            status: 'connected',
            lastUsed: new Date(),
            errorMessage: undefined
          }
        } else {
          return {
            ...api,
            status: 'error',
            errorMessage: 'Failed to connect. Please verify your API key and network connection.'
          }
        }
      }
      return api
    }))

    setTestingApi(null)
  }

  const testAllConnections = async () => {
    setIsTestingAll(true)

    for (const api of apis) {
      await testConnection(api.id)
    }

    setIsTestingAll(false)
  }

  const getStatusIcon = (status: APIConfig['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'checking':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
      case 'not_configured':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: APIConfig['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'error':
        return 'Error'
      case 'checking':
        return 'Checking...'
      case 'not_configured':
        return 'Not Configured'
    }
  }

  const getStatusColor = (status: APIConfig['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'checking':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'not_configured':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  }

  const formatLastUsed = (date?: Date) => {
    if (!date) return 'Never'

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const connectedCount = apis.filter(api => api.status === 'connected').length
  const errorCount = apis.filter(api => api.status === 'error').length
  const notConfiguredCount = apis.filter(api => api.status === 'not_configured').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Status</h1>
            <p className="mt-2 text-gray-600">
              Monitor and test your API connections
            </p>
          </div>
          <button
            onClick={testAllConnections}
            disabled={isTestingAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isTestingAll ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Testing All...</span>
              </>
            ) : (
              <>
                <SignalIcon className="h-5 w-5" />
                <span>Test All Connections</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Connected</p>
              <p className="text-2xl font-bold text-green-900">{connectedCount}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Errors</p>
              <p className="text-2xl font-bold text-red-900">{errorCount}</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Not Configured</p>
              <p className="text-2xl font-bold text-yellow-900">{notConfiguredCount}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* API List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">API Connections</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {apis.map(api => (
            <div key={api.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(api.status)}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {api.name}
                      </h3>
                      <p className="text-sm text-gray-500">{api.description}</p>
                    </div>
                  </div>

                  {/* Status and Last Used */}
                  <div className="mt-3 flex items-center space-x-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(api.status)}`}>
                      {getStatusText(api.status)}
                    </span>

                    {api.status === 'connected' && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <ClockIcon className="h-3.5 w-3.5" />
                        <span>Last used: {formatLastUsed(api.lastUsed)}</span>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {api.errorMessage && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                      {api.errorMessage}
                    </div>
                  )}
                </div>

                {/* Test Button */}
                <button
                  onClick={() => testConnection(api.id)}
                  disabled={testingApi === api.id || isTestingAll}
                  className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  {testingApi === api.id ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <span>Test Connection</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">API Configuration</h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                To configure API keys and endpoints, update your environment variables in the <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">.env.local</code> file.
                Test connections regularly to ensure your integrations are working properly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}