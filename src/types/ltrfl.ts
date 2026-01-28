// =============================================================================
// LTRFL (Laid to Rest for Less) TypeScript Types
// =============================================================================

// Template status
export type LTRFLTemplateStatus = 'active' | 'inactive'

// Concept status workflow
export type LTRFLConceptStatus = 'draft' | 'reviewing' | 'approved' | 'cad_pending' | 'cad_complete' | 'rejected'

// CAD generation status
export type LTRFLCADStatus = 'pending' | 'generating' | 'complete' | 'failed'

// Urn types
export type UrnType = 'traditional' | 'figurine' | 'keepsake'

// Access methods
export type UrnAccessMethod = 'top_lid' | 'bottom_loading' | 'permanent_seal'

// Marketing content types
export type MarketingContentType = 'video_ad' | 'image_ad' | 'social_post' | 'product_photo'

// Marketing content status
export type MarketingContentStatus = 'draft' | 'generating' | 'review' | 'approved' | 'published'

// -----------------------------------------------------------------------------
// Template Types
// -----------------------------------------------------------------------------

export interface LTRFLTemplateVariables {
  [key: string]: string | undefined
}

export interface LTRFLBrandColors {
  primary: string
  secondary: string
  [key: string]: string | undefined
}

export interface LTRFLTemplate {
  id: string
  category: string
  subcategory: string | null
  name: string
  prompt: string
  variables: LTRFLTemplateVariables
  brand_colors: LTRFLBrandColors
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LTRFLTemplateInsert {
  category: string
  subcategory?: string | null
  name: string
  prompt: string
  variables?: LTRFLTemplateVariables
  brand_colors?: LTRFLBrandColors
  is_active?: boolean
}

export interface LTRFLTemplateUpdate {
  category?: string
  subcategory?: string | null
  name?: string
  prompt?: string
  variables?: LTRFLTemplateVariables
  brand_colors?: LTRFLBrandColors
  is_active?: boolean
}

// -----------------------------------------------------------------------------
// Concept Types
// -----------------------------------------------------------------------------

export interface LTRFLConceptImage {
  url: string
  index: number
  generated_at: string
  model?: string
}

export interface LTRFLConcept {
  id: string
  template_id: string | null
  prompt_used: string
  category: string
  subcategory: string | null
  images: LTRFLConceptImage[]
  selected_image_index: number | null
  status: LTRFLConceptStatus
  version: number
  parent_version_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined data
  template?: LTRFLTemplate | null
}

export interface LTRFLConceptInsert {
  template_id?: string | null
  prompt_used: string
  category: string
  subcategory?: string | null
  images?: LTRFLConceptImage[]
  selected_image_index?: number | null
  status?: LTRFLConceptStatus
  version?: number
  parent_version_id?: string | null
  notes?: string | null
}

export interface LTRFLConceptUpdate {
  prompt_used?: string
  category?: string
  subcategory?: string | null
  images?: LTRFLConceptImage[]
  selected_image_index?: number | null
  status?: LTRFLConceptStatus
  notes?: string | null
}

// -----------------------------------------------------------------------------
// CAD Spec Types
// -----------------------------------------------------------------------------

export interface BasePlateSpecs {
  plate_type: 'removable' | 'press-fit' | 'permanent'
  thickness_mm: number
  screw_count: 2 | 4 | 6
  screw_type: 'M2' | 'M3' | 'M4'
  gasket: boolean
  gasket_material?: string
  felt_pad: boolean
}

export interface EngravingArea {
  has_engraving: boolean
  width_mm?: number
  height_mm?: number
  position?: 'front' | 'back' | 'side' | 'base'
  depth_mm?: number
}

export interface LTRFLCADSpecs {
  id: string
  concept_id: string
  urn_type: UrnType
  material: string
  volume_cu_in: number
  height_mm: number | null
  diameter_mm: number | null
  wall_thickness_mm: number
  access_method: UrnAccessMethod | null
  lid_type: string | null
  base_plate_specs: BasePlateSpecs | null
  engraving_area: EngravingArea | null
  cad_file_url: string | null
  cad_format: string | null
  status: LTRFLCADStatus
  error_message: string | null
  created_at: string
  updated_at: string
  // Joined data
  concept?: LTRFLConcept | null
}

export interface LTRFLCADSpecsInsert {
  concept_id: string
  urn_type: UrnType
  material: string
  volume_cu_in?: number
  height_mm?: number | null
  diameter_mm?: number | null
  wall_thickness_mm?: number
  access_method?: UrnAccessMethod | null
  lid_type?: string | null
  base_plate_specs?: BasePlateSpecs | null
  engraving_area?: EngravingArea | null
}

// -----------------------------------------------------------------------------
// Marketing Content Types (Phase 3)
// -----------------------------------------------------------------------------

export interface LTRFLMarketingContent {
  id: string
  content_type: MarketingContentType
  concept_id: string | null
  title: string | null
  prompt: string
  generated_content: Record<string, unknown>
  platform: string | null
  dimensions: string | null
  duration_seconds: number | null
  copy_text: string | null
  cta_text: string | null
  status: MarketingContentStatus
  version: number
  parent_version_id: string | null
  scheduled_date: string | null
  published_url: string | null
  analytics: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

// -----------------------------------------------------------------------------
// UI/Component Types
// -----------------------------------------------------------------------------

export interface LTRFLCategory {
  name: string
  subcategories: string[]
  count?: number
}

export const LTRFL_CATEGORIES: LTRFLCategory[] = [
  {
    name: 'Sports & Recreation',
    subcategories: ['Baseball', 'Basketball', 'Football', 'Golf', 'Soccer', 'Hockey', 'Tennis', 'Fishing', 'Hunting', 'Bowling']
  },
  {
    name: 'Pets & Animals',
    subcategories: ['Dogs', 'Cats', 'Horses', 'Birds', 'Butterflies', 'Elephants', 'Turtles']
  },
  {
    name: 'Hobbies & Interests',
    subcategories: ['Gardening', 'Music', 'Art', 'Cooking', 'Gaming', 'Reading', 'Sewing', 'Knitting']
  },
  {
    name: 'Professions',
    subcategories: ['Nurse', 'Teacher', 'Firefighter', 'Police', 'Military', 'Chef', 'Mechanic', 'Doctor']
  },
  {
    name: 'Faith & Spirituality',
    subcategories: ['Angel', 'Cross', 'Praying Hands', 'Buddha', 'Star of David', 'Rosary']
  },
  {
    name: 'Travel & Adventure',
    subcategories: ['Globe', 'Suitcase', 'Compass', 'Lighthouse', 'Mountain', 'Anchor', 'Camper Van']
  },
  {
    name: 'Vintage & Nostalgia',
    subcategories: ['Radio', 'Rotary Phone', 'Jukebox', 'Classic Car', 'Motorcycle', 'Record Player']
  },
  {
    name: 'Creative & Whimsical',
    subcategories: ['Rubiks Cube', 'Lego Brick', 'Fortune Cookie', 'Snow Globe', 'Treasure Chest', 'Mason Jar']
  }
]

// Brand colors
export const LTRFL_BRAND_COLORS = {
  sage: '#9CAF88',
  cream: '#F5F1EB',
  terracotta: '#D9A384',
  skyBlue: '#A8C4D9',
  brass: '#C9A962',
  charcoal: '#4A4A4A'
} as const

// Status badge colors
export const LTRFL_STATUS_COLORS: Record<LTRFLConceptStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  reviewing: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  approved: { bg: 'bg-green-500/20', text: 'text-green-400' },
  cad_pending: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  cad_complete: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-400' }
}
