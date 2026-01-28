'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Settings,
  Save,
  RefreshCw,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  LTRFL_BRAND_COLORS,
  UrnType,
  UrnAccessMethod,
  BasePlateSpecs,
  EngravingArea
} from '@/types/ltrfl'
import {
  getDefaultSpecs,
  getAvailableMaterials,
  getUrnTypes,
  getAccessMethods,
  validateCADSpecs,
  CADSpecDefaults
} from '@/services/cadSpecDefaults'
import { cn } from '@/lib/utils'

interface ConceptData {
  id: string
  name: string
  category: string
  subcategory: string | null
  generated_image_url: string | null
  prompt_used: string
  status: string
}

export default function CADSpecsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [concept, setConcept] = useState<ConceptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Form state
  const [urnType, setUrnType] = useState<UrnType>('traditional')
  const [material, setMaterial] = useState('resin')
  const [specs, setSpecs] = useState<CADSpecDefaults>(() => getDefaultSpecs('traditional', 'resin'))

  // Load concept data
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

        // Check if concept is approved
        if (data.status !== 'approved' && data.status !== 'cad_pending' && data.status !== 'cad_complete') {
          setError('Concept must be approved before creating CAD specs')
        }
      } else {
        setError('Concept not found')
      }
    } catch (err) {
      setError('Failed to load concept')
    } finally {
      setLoading(false)
    }
  }

  // Auto-populate specs when type or material changes
  const handleTypeChange = (newType: UrnType) => {
    setUrnType(newType)
    const defaults = getDefaultSpecs(newType, material)
    setSpecs(defaults)
    setValidationErrors({})
  }

  const handleMaterialChange = (newMaterial: string) => {
    setMaterial(newMaterial)
    const defaults = getDefaultSpecs(urnType, newMaterial)
    setSpecs(defaults)
    setValidationErrors({})
  }

  // Update individual spec fields
  const updateSpec = <K extends keyof CADSpecDefaults>(key: K, value: CADSpecDefaults[K]) => {
    setSpecs(prev => ({ ...prev, [key]: value }))
    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Update base plate specs
  const updateBasePlate = <K extends keyof BasePlateSpecs>(key: K, value: BasePlateSpecs[K]) => {
    setSpecs(prev => ({
      ...prev,
      base_plate_specs: prev.base_plate_specs
        ? { ...prev.base_plate_specs, [key]: value }
        : null
    }))
  }

  // Update engraving area
  const updateEngraving = <K extends keyof EngravingArea>(key: K, value: EngravingArea[K]) => {
    setSpecs(prev => ({
      ...prev,
      engraving_area: prev.engraving_area
        ? { ...prev.engraving_area, [key]: value }
        : null
    }))
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate
    const validation = validateCADSpecs(specs)
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/ltrfl/cad-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept_id: id,
          urn_type: urnType,
          material,
          ...specs
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save CAD specs')
      }

      // Navigate to status page
      router.push(`/ltrfl/concepts/${id}/cad-status`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
      </div>
    )
  }

  if (error && !concept) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href={`/ltrfl/concepts/${id}`}>
          <Button variant="secondary">Back to Concept</Button>
        </Link>
      </div>
    )
  }

  const materials = getAvailableMaterials()
  const urnTypes = getUrnTypes()
  const accessMethods = getAccessMethods()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/ltrfl/concepts/${id}`}
          className="p-2 rounded-lg hover:bg-[color:var(--surface)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">CAD Specifications</h1>
          <p className="text-sm text-muted-foreground">{concept?.name}</p>
        </div>
        <Settings className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Concept Preview */}
        <div className="space-y-4">
          {/* Concept Image */}
          <div className="aspect-square rounded-lg overflow-hidden border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
            {concept?.generated_image_url ? (
              <img
                src={concept.generated_image_url}
                alt={concept.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="p-3 rounded-lg bg-[color:var(--surface-muted)] text-sm">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">
                  Specs auto-populate based on urn type and material. You can adjust all values before generating.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Urn Type Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Urn Type</label>
            <div className="grid grid-cols-3 gap-2">
              {urnTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-colors",
                    urnType === type.id
                      ? "border-2"
                      : "border-[color:var(--surface-border)] hover:border-[color:var(--surface-border-hover)]"
                  )}
                  style={urnType === type.id ? { borderColor: LTRFL_BRAND_COLORS.sage } : undefined}
                >
                  <div className="font-medium text-foreground text-sm">{type.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Material Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Material</label>
            <div className="grid grid-cols-2 gap-2">
              {materials.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => handleMaterialChange(mat.id)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-colors",
                    material === mat.id
                      ? "border-2"
                      : "border-[color:var(--surface-border)] hover:border-[color:var(--surface-border-hover)]"
                  )}
                  style={material === mat.id ? { borderColor: LTRFL_BRAND_COLORS.sage } : undefined}
                >
                  <div className="font-medium text-foreground text-sm">{mat.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{mat.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="p-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
            <h3 className="font-medium text-foreground mb-4">Dimensions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Volume (cu in)</label>
                <Input
                  type="number"
                  value={specs.volume_cu_in}
                  onChange={(e) => updateSpec('volume_cu_in', parseFloat(e.target.value) || 0)}
                  className={validationErrors.volume_cu_in ? 'border-red-500' : ''}
                />
                {validationErrors.volume_cu_in && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.volume_cu_in}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Height (mm)</label>
                <Input
                  type="number"
                  value={specs.height_mm}
                  onChange={(e) => updateSpec('height_mm', parseFloat(e.target.value) || 0)}
                  className={validationErrors.height_mm ? 'border-red-500' : ''}
                />
                {validationErrors.height_mm && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.height_mm}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Diameter (mm)</label>
                <Input
                  type="number"
                  value={specs.diameter_mm}
                  onChange={(e) => updateSpec('diameter_mm', parseFloat(e.target.value) || 0)}
                  className={validationErrors.diameter_mm ? 'border-red-500' : ''}
                />
                {validationErrors.diameter_mm && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.diameter_mm}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Wall Thickness (mm)</label>
                <Input
                  type="number"
                  step="0.5"
                  value={specs.wall_thickness_mm}
                  onChange={(e) => updateSpec('wall_thickness_mm', parseFloat(e.target.value) || 0)}
                  className={validationErrors.wall_thickness_mm ? 'border-red-500' : ''}
                />
                {validationErrors.wall_thickness_mm && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.wall_thickness_mm}</p>
                )}
              </div>
            </div>
          </div>

          {/* Access Method */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Access Method</label>
            <select
              value={specs.access_method}
              onChange={(e) => {
                const method = e.target.value as UrnAccessMethod
                updateSpec('access_method', method)
                // Add/remove base plate specs based on method
                if (method === 'bottom_loading' && !specs.base_plate_specs) {
                  updateSpec('base_plate_specs', {
                    plate_type: 'removable',
                    thickness_mm: 3,
                    screw_count: 4,
                    screw_type: 'M3',
                    gasket: true,
                    gasket_material: 'silicone',
                    felt_pad: true
                  })
                } else if (method !== 'bottom_loading') {
                  updateSpec('base_plate_specs', null)
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] text-foreground"
            >
              {accessMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name} - {method.description}
                </option>
              ))}
            </select>
          </div>

          {/* Base Plate Specs (conditional) */}
          {specs.access_method === 'bottom_loading' && specs.base_plate_specs && (
            <div className="p-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
              <h3 className="font-medium text-foreground mb-4">Base Plate Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Plate Type</label>
                  <select
                    value={specs.base_plate_specs.plate_type}
                    onChange={(e) => updateBasePlate('plate_type', e.target.value as 'removable' | 'press-fit' | 'permanent')}
                    className="w-full px-3 py-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] text-foreground text-sm"
                  >
                    <option value="removable">Removable</option>
                    <option value="press-fit">Press-Fit</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Thickness (mm)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={specs.base_plate_specs.thickness_mm}
                    onChange={(e) => updateBasePlate('thickness_mm', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Screw Count</label>
                  <select
                    value={specs.base_plate_specs.screw_count}
                    onChange={(e) => updateBasePlate('screw_count', parseInt(e.target.value) as 2 | 4 | 6)}
                    className="w-full px-3 py-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] text-foreground text-sm"
                  >
                    <option value={2}>2</option>
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Screw Type</label>
                  <select
                    value={specs.base_plate_specs.screw_type}
                    onChange={(e) => updateBasePlate('screw_type', e.target.value as 'M2' | 'M3' | 'M4')}
                    className="w-full px-3 py-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] text-foreground text-sm"
                  >
                    <option value="M2">M2</option>
                    <option value="M3">M3</option>
                    <option value="M4">M4</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={specs.base_plate_specs.gasket}
                      onChange={(e) => updateBasePlate('gasket', e.target.checked)}
                      className="rounded"
                    />
                    Gasket
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={specs.base_plate_specs.felt_pad}
                      onChange={(e) => updateBasePlate('felt_pad', e.target.checked)}
                      className="rounded"
                    />
                    Felt Pad
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Engraving Area */}
          <div className="p-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Engraving Area</h3>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={specs.engraving_area?.has_engraving || false}
                  onChange={(e) => updateEngraving('has_engraving', e.target.checked)}
                  className="rounded"
                />
                Include engraving area
              </label>
            </div>
            {specs.engraving_area?.has_engraving && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Width (mm)</label>
                  <Input
                    type="number"
                    value={specs.engraving_area.width_mm || 60}
                    onChange={(e) => updateEngraving('width_mm', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Height (mm)</label>
                  <Input
                    type="number"
                    value={specs.engraving_area.height_mm || 40}
                    onChange={(e) => updateEngraving('height_mm', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Position</label>
                  <select
                    value={specs.engraving_area.position || 'front'}
                    onChange={(e) => updateEngraving('position', e.target.value as 'front' | 'back' | 'side' | 'base')}
                    className="w-full px-3 py-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] text-foreground text-sm"
                  >
                    <option value="front">Front</option>
                    <option value="back">Back</option>
                    <option value="side">Side</option>
                    <option value="base">Base</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Depth (mm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={specs.engraving_area.depth_mm || 0.5}
                    onChange={(e) => updateEngraving('depth_mm', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                const defaults = getDefaultSpecs(urnType, material)
                setSpecs(defaults)
                setValidationErrors({})
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 text-white"
              style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save & Generate CAD
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
