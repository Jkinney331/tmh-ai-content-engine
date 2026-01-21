'use client'

import { Settings, Database, Key } from 'lucide-react'
import Link from 'next/link'

interface SetupRequiredProps {
  title?: string
  description?: string
  missingItems?: string[]
}

export default function SetupRequired({
  title = 'Setup Required',
  description = 'Please configure the required services to use this feature.',
  missingItems = [],
}: SetupRequiredProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-amber-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{description}</p>

        {missingItems.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-700 mb-3">Missing Configuration:</p>
            <ul className="space-y-2">
              {missingItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  {item.toLowerCase().includes('supabase') ? (
                    <Database className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Key className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/settings/api"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Go to Settings
          </Link>

          <div className="text-xs text-gray-500">
            <p className="mb-1">Environment variables needed:</p>
            <code className="block bg-gray-100 rounded px-2 py-1 text-xs">
              NEXT_PUBLIC_SUPABASE_URL<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY<br />
              OPENROUTER_API_KEY
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
