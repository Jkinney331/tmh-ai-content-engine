import { Suspense } from 'react'
import ShotsContent from './ShotsContent'

export default function ShotsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading shots...</p>
        </div>
      </div>
    }>
      <ShotsContent />
    </Suspense>
  )
}