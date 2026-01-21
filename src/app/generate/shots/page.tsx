import { Suspense } from 'react'
import GenerateShotsContent from './GenerateShotsContent'

export default function GenerateShotsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading shot generator...</p>
        </div>
      </div>
    }>
      <GenerateShotsContent />
    </Suspense>
  )
}