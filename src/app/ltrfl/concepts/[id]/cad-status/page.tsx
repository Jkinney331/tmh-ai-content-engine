'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, XCircle, Loader2, FileBox, Download, RefreshCw } from 'lucide-react'

interface CADSpec {
  id: string
  concept_id: string
  urn_type: string
  material: string
  volume_cu_in: number
  height_mm: number
  diameter_mm: number
  wall_thickness_mm: number
  access_method: string
  lid_type: string | null
  base_plate_specs: Record<string, unknown> | null
  engraving_area: Record<string, unknown> | null
  cad_file_url: string | null
  cad_format: string | null
  status: 'pending' | 'generating' | 'complete' | 'failed'
  error_message: string | null
  created_at: string
  updated_at: string
  ltrfl_concepts: {
    name: string
    category: string
    generated_image_url: string | null
    status: string
  } | null
}

type IconComponent = React.ComponentType<{ className?: string }>

const statusConfig: Record<string, { icon: IconComponent; color: string; bgColor: string; label: string; description: string }> = {
  pending: {
    icon: Loader2,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    label: 'Pending',
    description: 'CAD generation is queued and waiting to start'
  },
  generating: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Generating',
    description: 'CAD file is being generated...'
  },
  complete: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Complete',
    description: 'CAD file has been generated successfully'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Failed',
    description: 'CAD generation encountered an error'
  }
}

export default function CADStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [cadSpec, setCadSpec] = useState<CADSpec | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    fetchCADSpec()
    // Poll for updates every 5 seconds if status is pending or generating
    const interval = setInterval(() => {
      if (cadSpec?.status === 'pending' || cadSpec?.status === 'generating') {
        fetchCADSpec()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [resolvedParams.id, cadSpec?.status])

  async function fetchCADSpec() {
    try {
      const response = await fetch(`/api/ltrfl/cad-specs?concept_id=${resolvedParams.id}`)
      if (!response.ok) throw new Error('Failed to fetch CAD spec')

      const data = await response.json()
      if (data.length === 0) {
        setError('No CAD specifications found for this concept')
        setLoading(false)
        return
      }

      setCadSpec(data[0])
      setLoading(false)
    } catch (err) {
      setError('Failed to load CAD specifications')
      setLoading(false)
    }
  }

  async function handleRetry() {
    if (!cadSpec) return

    setRetrying(true)
    try {
      const response = await fetch(`/api/ltrfl/cad-specs/${cadSpec.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending', error_message: null })
      })

      if (!response.ok) throw new Error('Failed to retry')

      await fetchCADSpec()
    } catch (err) {
      setError('Failed to retry CAD generation')
    } finally {
      setRetrying(false)
    }
  }

  // Stub: Simulate CAD generation (would be triggered by backend in production)
  async function simulateGeneration() {
    if (!cadSpec) return

    try {
      // Update status to generating
      await fetch(`/api/ltrfl/cad-specs/${cadSpec.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'generating' })
      })

      await fetchCADSpec()

      // Simulate processing time
      setTimeout(async () => {
        // Mark as complete (API will attach a stub CAD file if needed)
        await fetch(`/api/ltrfl/cad-specs/${cadSpec.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'complete',
            cad_format: 'STL'
          })
        })

        await fetchCADSpec()
      }, 3000)
    } catch (err) {
      setError('Simulation failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#9CAF88]" />
      </div>
    )
  }

  if (error && !cadSpec) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] p-8">
        <div className="max-w-2xl mx-auto">
          <Link href={`/ltrfl/concepts/${resolvedParams.id}`}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Concept
            </Button>
          </Link>

          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">No CAD Specifications</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href={`/ltrfl/concepts/${resolvedParams.id}/cad-specs`}>
              <Button className="bg-[#9CAF88] hover:bg-[#8BA078] text-white">
                Create CAD Specifications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!cadSpec) return null

  const status = statusConfig[cadSpec.status]
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-[color:var(--background)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/ltrfl/concepts/${resolvedParams.id}`}>
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                CAD Generation Status
              </h1>
              <p className="text-muted-foreground">
                {cadSpec.ltrfl_concepts?.name || 'Unnamed Concept'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="lg:col-span-2">
            <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-6">
              {/* Status Header */}
              <div className={`${status.bgColor} rounded-lg p-6 mb-6`}>
                <div className="flex items-center gap-4">
                  <StatusIcon className={`h-12 w-12 ${status.color} ${
                    cadSpec.status === 'pending' || cadSpec.status === 'generating' ? 'animate-spin' : ''
                  }`} />
                  <div>
                    <h2 className={`text-2xl font-bold ${status.color}`}>
                      {status.label}
                    </h2>
                    <p className="text-muted-foreground">
                      {status.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {cadSpec.status === 'failed' && cadSpec.error_message && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <h3 className="text-red-500 font-semibold mb-2">Error Details</h3>
                  <p className="text-muted-foreground">{cadSpec.error_message}</p>
                </div>
              )}

              {/* CAD File Download */}
              {cadSpec.status === 'complete' && cadSpec.cad_file_url && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileBox className="h-10 w-10 text-green-500" />
                      <div>
                        <h3 className="font-semibold text-foreground">CAD File Ready</h3>
                        <p className="text-muted-foreground text-sm">
                          Format: {cadSpec.cad_format || 'STL'}
                        </p>
                      </div>
                    </div>
                    <Button className="bg-[#9CAF88] hover:bg-[#8BA078] text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {cadSpec.status === 'failed' && (
                  <Button
                    onClick={handleRetry}
                    disabled={retrying}
                    className="bg-[#9CAF88] hover:bg-[#8BA078] text-white"
                  >
                    {retrying ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Retry Generation
                  </Button>
                )}

                {cadSpec.status === 'pending' && (
                  <Button
                    onClick={simulateGeneration}
                    className="bg-[#9CAF88] hover:bg-[#8BA078] text-white"
                  >
                    <Loader2 className="h-4 w-4 mr-2" />
                    Start Generation (Stub)
                  </Button>
                )}

                <Link href={`/ltrfl/concepts/${resolvedParams.id}/cad-specs`}>
                  <Button variant="secondary">
                    Edit Specifications
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Specifications Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Specifications</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Urn Type</span>
                  <span className="text-foreground capitalize">{cadSpec.urn_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material</span>
                  <span className="text-foreground capitalize">{cadSpec.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="text-foreground">{cadSpec.volume_cu_in} cu in</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Height</span>
                  <span className="text-foreground">{cadSpec.height_mm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diameter</span>
                  <span className="text-foreground">{cadSpec.diameter_mm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wall Thickness</span>
                  <span className="text-foreground">{cadSpec.wall_thickness_mm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Access Method</span>
                  <span className="text-foreground capitalize">{cadSpec.access_method?.replace('_', ' ')}</span>
                </div>
                {cadSpec.lid_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lid Type</span>
                    <span className="text-foreground capitalize">{cadSpec.lid_type}</span>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="mt-6 pt-4 border-t border-[color:var(--surface-border)]">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div>Created: {new Date(cadSpec.created_at).toLocaleString()}</div>
                  <div>Updated: {new Date(cadSpec.updated_at).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Concept Image Preview */}
            {cadSpec.ltrfl_concepts?.generated_image_url && (
              <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Concept Image</h3>
                <img
                  src={cadSpec.ltrfl_concepts.generated_image_url}
                  alt={cadSpec.ltrfl_concepts.name}
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
