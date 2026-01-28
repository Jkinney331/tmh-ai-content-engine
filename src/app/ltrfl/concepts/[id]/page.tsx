'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Trash2,
  Download,
  RefreshCw,
  Loader2,
  Box,
  Settings2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { LTRFL_BRAND_COLORS, LTRFL_STATUS_COLORS, LTRFLConceptStatus } from '@/types/ltrfl'
import { cn } from '@/lib/utils'

interface ConceptDetail {
  id: string
  template_id: string | null
  category: string
  subcategory: string | null
  prompt_used: string
  images: Array<{ url: string; index: number }>
  selected_image_index: number | null
  status: LTRFLConceptStatus
  notes: string | null
  created_at: string
  updated_at: string
  ltrfl_templates?: {
    name: string
    category: string
    prompt: string
  } | null
}

const STATUS_LABELS: Record<LTRFLConceptStatus, string> = {
  draft: 'Draft',
  reviewing: 'In Review',
  approved: 'Approved',
  cad_pending: 'CAD Pending',
  cad_complete: 'CAD Complete',
  rejected: 'Rejected'
}

export default function ConceptDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [concept, setConcept] = useState<ConceptDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConcept()
  }, [id])

  const loadConcept = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/ltrfl/concepts/${id}`)
      if (res.ok) {
        const data = await res.json()
        setConcept(data)
        setReviewNotes(data.notes || '')
      } else {
        setError('Concept not found')
      }
    } catch (error) {
      console.error('Failed to load concept:', error)
      setError('Failed to load concept')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: LTRFLConceptStatus) => {
    if (!concept) return

    setUpdating(true)
    setError(null)

    try {
      const res = await fetch(`/api/ltrfl/concepts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: reviewNotes || null
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update concept')
      }

      const updated = await res.json()
      setConcept(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const handleSelectImage = async (index: number) => {
    if (!concept) return
    setConcept({ ...concept, selected_image_index: index })

    try {
      await fetch(`/api/ltrfl/concepts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_image_index: index
        })
      })
    } catch (err) {
      console.error('Failed to update selected image:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this concept?')) return

    setDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/ltrfl/concepts/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to delete concept')
      }

      router.push('/ltrfl/concepts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
      </div>
    )
  }

  if (error || !concept) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 mb-4">{error || 'Concept not found'}</p>
        <Link href="/ltrfl/concepts">
          <Button variant="secondary">Back to Concepts</Button>
        </Link>
      </div>
    )
  }

  const statusColors = LTRFL_STATUS_COLORS[concept.status]
  const allImages = concept.images || []
  const selectedImage = concept.selected_image_index !== null
    ? allImages[concept.selected_image_index]
    : allImages[0]
  const conceptTitle = concept.subcategory
    ? `${concept.subcategory} Concept`
    : `${concept.category} Concept`

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/ltrfl/concepts"
          className="p-2 rounded-lg hover:bg-[color:var(--surface)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{conceptTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {concept.category} {concept.subcategory && `• ${concept.subcategory}`}
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium",
          statusColors.bg, statusColors.text
        )}>
          {STATUS_LABELS[concept.status]}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Image */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Image */}
          <div className="aspect-square rounded-lg overflow-hidden border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
            {selectedImage?.url ? (
              <img
                src={selectedImage.url}
                alt={conceptTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-muted-foreground opacity-50" />
              </div>
            )}
          </div>

          {/* All Variations */}
          {allImages.length > 1 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">All Variations</h3>
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectImage(index)}
                    className={cn(
                      "aspect-square rounded-lg overflow-hidden border-2 transition-colors",
                      concept.selected_image_index === index
                        ? "border-[var(--ltrfl-sage)]"
                        : "border-[color:var(--surface-border)] hover:border-[color:var(--surface-border-hover)]"
                    )}
                    style={concept.selected_image_index === index ? { borderColor: LTRFL_BRAND_COLORS.sage } : undefined}
                  >
                    <img
                      src={img.url}
                      alt={`Variation ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Used */}
          <div className="p-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
            <h3 className="text-sm font-medium text-foreground mb-2">Prompt Used</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
              {concept.prompt_used}
            </p>
          </div>
        </div>

        {/* Right Column: Actions & Info */}
        <div className="space-y-4">
          {/* Status Actions */}
          <div className="p-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
            <h3 className="text-sm font-medium text-foreground mb-3">Review Actions</h3>

            {/* Review Notes */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1 block">Review Notes</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this concept..."
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {concept.status === 'draft' && (
                <Button
                  onClick={() => updateStatus('reviewing')}
                  disabled={updating}
                  className="w-full"
                  style={{ backgroundColor: LTRFL_BRAND_COLORS.brass, color: 'white' }}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Submit for Review
                </Button>
              )}

              {concept.status === 'reviewing' && (
                <>
                  <Button
                    onClick={async () => {
                      await updateStatus('approved')
                      router.push(`/ltrfl/concepts/${id}/cad-specs`)
                    }}
                    disabled={updating}
                    className="w-full text-white"
                    style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Concept
                  </Button>
                  <Button
                    onClick={() => updateStatus('rejected')}
                    disabled={updating}
                    variant="secondary"
                    className="w-full text-red-400 hover:text-red-300 hover:border-red-500/50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Concept
                  </Button>
                </>
              )}

              {(concept.status === 'approved' || concept.status === 'rejected') && (
                <Button
                  onClick={() => updateStatus('reviewing')}
                  disabled={updating}
                  variant="secondary"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Return to Review
                </Button>
              )}
            </div>

            {updating && (
              <div className="flex items-center justify-center mt-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </div>
            )}
          </div>

          {/* CAD Pipeline Actions - Show for approved, cad_pending, or cad_complete */}
          {(concept.status === 'approved' || concept.status === 'cad_pending' || concept.status === 'cad_complete') && (
            <div className="p-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
              <h3 className="text-sm font-medium text-foreground mb-3">CAD Pipeline</h3>
              <div className="space-y-2">
                {concept.status === 'approved' && (
                  <Link href={`/ltrfl/concepts/${id}/cad-specs`} className="block">
                    <Button
                      className="w-full text-white"
                      style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      Create CAD Specifications
                    </Button>
                  </Link>
                )}

                {(concept.status === 'cad_pending' || concept.status === 'cad_complete') && (
                  <>
                    <Link href={`/ltrfl/concepts/${id}/cad-status`} className="block">
                      <Button
                        className="w-full text-white"
                        style={{ backgroundColor: concept.status === 'cad_complete' ? LTRFL_BRAND_COLORS.sage : LTRFL_BRAND_COLORS.brass }}
                      >
                        <Box className="w-4 h-4 mr-2" />
                        {concept.status === 'cad_complete' ? 'View CAD File' : 'View CAD Status'}
                      </Button>
                    </Link>
                    <Link href={`/ltrfl/concepts/${id}/cad-specs`} className="block">
                      <Button
                        variant="secondary"
                        className="w-full"
                      >
                        <Settings2 className="w-4 h-4 mr-2" />
                        Edit CAD Specifications
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
            <h3 className="text-sm font-medium text-foreground mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {new Date(concept.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span className="text-foreground">
                  {new Date(concept.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Images</span>
                <span className="text-foreground">{allImages.length}</span>
              </div>
              {concept.ltrfl_templates && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template</span>
                  <span className="text-foreground">{concept.ltrfl_templates.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Download */}
          {selectedImage?.url && (
            <a
              href={selectedImage.url}
              download={`${conceptTitle.replace(/\s+/g, '-')}.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-muted)] transition-colors text-sm font-medium text-foreground"
            >
              <Download className="w-4 h-4" />
              Download Image
            </a>
          )}

          {/* Delete */}
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="ghost"
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Concept
          </Button>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
