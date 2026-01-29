'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import JSZip from 'jszip'
import {
  ArrowLeft,
  Box,
  Download,
  Filter,
  Loader2,
  Search,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CadModelViewer } from '@/components/ltrfl/CadModelViewer'
import { Input } from '@/components/ui/input'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type CadStatus = 'pending' | 'generating' | 'complete' | 'failed'

interface CadConcept {
  id: string
  name: string | null
  category: string | null
  subcategory: string | null
  status: string | null
}

interface CadFile {
  id: string
  concept_id: string
  urn_type: string | null
  material: string | null
  status: CadStatus
  cad_file_url: string | null
  cad_format: string | null
  created_at: string
  updated_at: string
  concept?: CadConcept | null
}

const statusStyles: Record<CadStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  generating: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  complete: { bg: 'bg-green-500/10', text: 'text-green-400' },
  failed: { bg: 'bg-red-500/10', text: 'text-red-400' }
}

export default function CadFilesPage() {
  const [files, setFiles] = useState<CadFile[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [zipping, setZipping] = useState(false)
  const [activeFile, setActiveFile] = useState<CadFile | null>(null)

  useEffect(() => {
    loadFiles()
  }, [statusFilter, formatFilter, search])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (formatFilter !== 'all') params.set('format', formatFilter)
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/ltrfl/cad-files?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load CAD files')
      const data = await res.json()
      setFiles(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load CAD files')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectedFiles = useMemo(
    () => files.filter((file) => selectedIds.has(file.id)),
    [files, selectedIds]
  )

  const handleDownloadZip = async () => {
    if (selectedFiles.length === 0) return
    setZipping(true)
    try {
      const zip = new JSZip()
      let added = 0

      for (const file of selectedFiles) {
        const url = resolveCadFileUrl(file.cad_file_url)
        if (!url) continue

        try {
          const response = await fetch(url)
          if (!response.ok) continue
          const blob = await response.blob()
          const filename = buildCadFilename(file)
          zip.file(filename, blob)
          added += 1
        } catch {
          continue
        }
      }

      if (added === 0) {
        toast.error('No CAD files available to zip')
        return
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const downloadUrl = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `ltrfl-cad-files-${new Date().toISOString().slice(0, 10)}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
      toast.success(`Downloaded ${added} CAD file${added !== 1 ? 's' : ''}`)
    } catch (error) {
      toast.error('Failed to build CAD zip')
    } finally {
      setZipping(false)
    }
  }

  const handleDownloadSingle = (file: CadFile) => {
    const url = resolveCadFileUrl(file.cad_file_url)
    if (!url) {
      toast.error('CAD file URL is missing')
      return
    }
    const link = document.createElement('a')
    link.href = url
    link.download = buildCadFilename(file)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenFile = (file: CadFile) => {
    const url = resolveCadFileUrl(file.cad_file_url)
    if (!url) {
      toast.error('CAD file URL is missing')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Link href="/ltrfl/marketing">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">CAD Files</h1>
          <p className="text-muted-foreground">
            View, review, and download generated CAD files
          </p>
        </div>
        <Button
          onClick={handleDownloadZip}
          disabled={selectedFiles.length === 0 || zipping}
          className="text-white"
          style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
        >
          {zipping ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download Zip
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6 p-4 bg-[color:var(--surface)] rounded-lg border border-[color:var(--surface-border)]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-1.5 text-foreground"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="generating">Generating</option>
            <option value="complete">Complete</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="text-sm bg-[color:var(--surface-muted)] border border-[color:var(--surface-border)] rounded-lg px-3 py-1.5 text-foreground"
          >
            <option value="all">All Formats</option>
            <option value="STL">STL</option>
            <option value="OBJ">OBJ</option>
            <option value="STEP">STEP</option>
          </select>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search concept, material, or format..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground lg:ml-auto">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] p-10 text-center">
          <Box className="w-12 h-12 mx-auto text-muted-foreground opacity-40" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No CAD files yet</h3>
          <p className="text-sm text-muted-foreground mt-2">
            CAD files will appear here after concepts reach cad_complete status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {files.map((file) => {
            const badge = statusStyles[file.status] || statusStyles.pending
            const conceptName = file.concept?.name || 'Untitled Concept'
            const format = file.cad_format || 'Unknown'
            const fileUrl = resolveCadFileUrl(file.cad_file_url)
            const isSelectable = Boolean(fileUrl)

            return (
              <div
                key={file.id}
                className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1">{conceptName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {file.urn_type || 'Urn'} • {file.material || 'Material'}
                    </p>
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded capitalize', badge.bg, badge.text)}>
                    {file.status}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  <div>Format: {format}</div>
                  <div>Created: {new Date(file.created_at).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveFile(file)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownloadSingle(file)}
                    disabled={!fileUrl}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(file.id)}
                      onChange={() => toggleSelection(file.id)}
                      disabled={!isSelectable}
                    />
                    Select
                  </label>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeFile && (
        <CadFileModal
          file={activeFile}
          onClose={() => setActiveFile(null)}
          onDownload={() => handleDownloadSingle(activeFile)}
          onOpen={() => handleOpenFile(activeFile)}
        />
      )}
    </div>
  )
}

function CadFileModal({
  file,
  onClose,
  onDownload,
  onOpen
}: {
  file: CadFile
  onClose: () => void
  onDownload: () => void
  onOpen: () => void
}) {
  const conceptName = file.concept?.name || 'Untitled Concept'
  const fileUrl = resolveCadFileUrl(file.cad_file_url)
  const format = (file.cad_format || '').toLowerCase()
  const supportsViewer = fileUrl && (format === 'stl' || fileUrl.toLowerCase().endsWith('.stl'))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[color:var(--surface)] rounded-lg shadow-xl overflow-hidden mx-4">
        <div className="p-4 border-b border-[color:var(--surface-border)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{conceptName}</h2>
            <p className="text-xs text-muted-foreground">
              {file.urn_type || 'Urn'} • {file.material || 'Material'} • {file.cad_format || 'Unknown'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
        <div className="p-4 space-y-4">
          {supportsViewer ? (
            <CadModelViewer url={fileUrl} />
          ) : (
            <div className="rounded-lg border border-dashed border-[color:var(--surface-border)] p-6 text-center">
              <Box className="w-12 h-12 mx-auto text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground mt-2">
                CAD preview is unavailable for this format. Use “Open File” to view the model in a dedicated viewer.
              </p>
            </div>
          )}
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Status: {file.status}</div>
            <div>Created: {new Date(file.created_at).toLocaleString()}</div>
            <div>CAD URL: {fileUrl || 'Unavailable'}</div>
          </div>
        </div>
        <div className="p-4 border-t border-[color:var(--surface-border)] flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onOpen} disabled={!fileUrl}>
            Open File
          </Button>
          <Button
            className="text-white"
            style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
            onClick={onDownload}
            disabled={!fileUrl}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}

function resolveCadFileUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (url.startsWith('/')) return url
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return url
  return `${supabaseUrl}/storage/v1/object/public/ltrfl-cad/${url}`
}

function buildCadFilename(file: CadFile) {
  const conceptName = file.concept?.name || file.concept_id
  const safeName = conceptName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  const format = (file.cad_format || 'stl').toLowerCase()
  return `${safeName || 'cad-file'}-${file.id}.${format}`
}
