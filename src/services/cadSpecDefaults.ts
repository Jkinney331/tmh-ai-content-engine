/**
 * LTRFL CAD Specification Defaults Service
 * Auto-populates CAD specs based on urn type and material selection
 */

import { UrnType, UrnAccessMethod, BasePlateSpecs, EngravingArea } from '@/types/ltrfl'

export interface CADSpecDefaults {
  volume_cu_in: number
  height_mm: number
  diameter_mm: number
  wall_thickness_mm: number
  access_method: UrnAccessMethod
  lid_type: string | null
  base_plate_specs: BasePlateSpecs | null
  engraving_area: EngravingArea | null
}

// Urn type specifications
const URN_TYPE_SPECS: Record<UrnType, {
  volume_cu_in: number
  height_range: [number, number]
  diameter_range: [number, number]
  default_access: UrnAccessMethod
  lid_type: string | null
}> = {
  traditional: {
    volume_cu_in: 200,
    height_range: [170, 210],
    diameter_range: [100, 120],
    default_access: 'top_lid',
    lid_type: 'dome'
  },
  figurine: {
    volume_cu_in: 200,
    height_range: [150, 300],
    diameter_range: [80, 150],
    default_access: 'bottom_loading',
    lid_type: null
  },
  keepsake: {
    volume_cu_in: 10,
    height_range: [50, 80],
    diameter_range: [40, 60],
    default_access: 'top_lid',
    lid_type: 'threaded'
  }
}

// Material-specific wall thickness
const MATERIAL_WALL_THICKNESS: Record<string, number> = {
  resin: 2.5,
  biodegradable: 3.5,
  ceramic: 5,
  aluminum: 2.5
}

// Default base plate specs for bottom-loading urns
const DEFAULT_BASE_PLATE: BasePlateSpecs = {
  plate_type: 'removable',
  thickness_mm: 3,
  screw_count: 4,
  screw_type: 'M3',
  gasket: true,
  gasket_material: 'silicone',
  felt_pad: true
}

// Default engraving area
const DEFAULT_ENGRAVING: EngravingArea = {
  has_engraving: false,
  width_mm: 60,
  height_mm: 40,
  position: 'front',
  depth_mm: 0.5
}

/**
 * Get default CAD specifications based on urn type and material
 */
export function getDefaultSpecs(
  urnType: UrnType,
  material: string
): CADSpecDefaults {
  const typeSpecs = URN_TYPE_SPECS[urnType]
  const wallThickness = MATERIAL_WALL_THICKNESS[material] || 3

  // Calculate middle values from ranges
  const height = Math.round((typeSpecs.height_range[0] + typeSpecs.height_range[1]) / 2)
  const diameter = Math.round((typeSpecs.diameter_range[0] + typeSpecs.diameter_range[1]) / 2)

  return {
    volume_cu_in: typeSpecs.volume_cu_in,
    height_mm: height,
    diameter_mm: diameter,
    wall_thickness_mm: wallThickness,
    access_method: typeSpecs.default_access,
    lid_type: typeSpecs.lid_type,
    base_plate_specs: typeSpecs.default_access === 'bottom_loading' ? { ...DEFAULT_BASE_PLATE } : null,
    engraving_area: { ...DEFAULT_ENGRAVING }
  }
}

/**
 * Get available materials list
 */
export function getAvailableMaterials(): { id: string; name: string; description: string }[] {
  return [
    { id: 'resin', name: 'Resin (SLA)', description: 'High detail, smooth finish' },
    { id: 'biodegradable', name: 'Biodegradable (PLA)', description: 'Eco-friendly, slightly thicker walls' },
    { id: 'ceramic', name: 'Ceramic', description: 'Traditional look, fired clay' },
    { id: 'aluminum', name: 'Aluminum', description: 'Metal finish, durable' }
  ]
}

/**
 * Get available urn types
 */
export function getUrnTypes(): { id: UrnType; name: string; description: string }[] {
  return [
    { id: 'traditional', name: 'Traditional', description: 'Classic urn shape with dome lid' },
    { id: 'figurine', name: 'Figurine', description: 'Custom shape with bottom-loading access' },
    { id: 'keepsake', name: 'Keepsake', description: 'Small memorial keepsake' }
  ]
}

/**
 * Get available access methods
 */
export function getAccessMethods(): { id: UrnAccessMethod; name: string; description: string }[] {
  return [
    { id: 'top_lid', name: 'Top Lid', description: 'Removable lid on top' },
    { id: 'bottom_loading', name: 'Bottom Loading', description: 'Removable base plate with screws' },
    { id: 'permanent_seal', name: 'Permanent Seal', description: 'No access after sealing' }
  ]
}

/**
 * Validate CAD specs
 */
export function validateCADSpecs(specs: Partial<CADSpecDefaults>): {
  valid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (!specs.volume_cu_in || specs.volume_cu_in <= 0 || specs.volume_cu_in > 500) {
    errors.volume_cu_in = 'Volume must be between 0 and 500 cubic inches'
  }

  if (!specs.height_mm || specs.height_mm <= 0) {
    errors.height_mm = 'Height must be greater than 0'
  }

  if (!specs.diameter_mm || specs.diameter_mm <= 0) {
    errors.diameter_mm = 'Diameter must be greater than 0'
  }

  if (!specs.wall_thickness_mm || specs.wall_thickness_mm < 1.5) {
    errors.wall_thickness_mm = 'Wall thickness must be at least 1.5mm'
  }

  if (!specs.access_method) {
    errors.access_method = 'Access method is required'
  }

  // Validate base plate specs for bottom loading
  if (specs.access_method === 'bottom_loading' && !specs.base_plate_specs) {
    errors.base_plate_specs = 'Base plate specifications required for bottom loading urns'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
