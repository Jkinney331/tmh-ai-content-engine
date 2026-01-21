// =============================================================================
// TMH Knowledge Base TypeScript Types
// Aligned with SQL migration 010_create_knowledge_base.sql
// =============================================================================

// Sneaker tier enum - 6 tiers per Knowledge Base Appendix Section 4
export type SneakerTier = 'ultra_grail' | 'heavy_heat' | 'certified_heat' | 'new_heat' | 'city_specific' | 'banned'

// Model gender enum
export type ModelGender = 'male' | 'female' | 'non-binary'

// Style gender enum (for slots)
export type StyleGender = 'male' | 'female'

// Competitor tier enum - per Knowledge Base Appendix Section 9
export type CompetitorTier = 'direct' | 'premium_adjacent' | 'city_specific' | 'aspirational'

// Learning category enum - per Knowledge Base Appendix Section 13
export type LearningCategory = 'preference' | 'dislike' | 'rule' | 'intel' | 'sneakers' | 'models' | 'styles' | 'cities' | 'prompts' | 'general'

// Learning source enum
export type LearningSource = 'feedback' | 'conversation' | 'manual'

// Queue status enum
export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed'

// City status enum
export type CityStatus = 'draft' | 'active' | 'archived' | 'researching' | 'ready' | 'error'

// Feedback rating enum
export type FeedbackRating = 'fire' | 'good' | 'mid' | 'miss'

// Feedback type enum
export type FeedbackType = 'generation' | 'prompt' | 'model' | 'general'

// Prompt template type enum
export type PromptTemplateType = 'image' | 'video' | 'copy' | 'research'

export type Database = {
  public: {
    Tables: {
      cities: {
        Row: {
          id: string
          name: string
          state: string | null
          country: string | null
          nicknames: string[]
          area_codes: string[]
          status: CityStatus
          visual_identity: Record<string, any>
          avoid: string[]
          user_notes: string | null
          slang: Record<string, any>[]
          landmarks: string[]
          neighborhoods: string[]
          sports_teams: Record<string, any>
          streetwear_scene: string | null
          local_brands: string[]
          cultural_notes: string | null
          population_notes: string | null
          research_source: string | null
          research_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          state?: string | null
          country?: string | null
          nicknames?: string[]
          area_codes?: string[]
          status?: CityStatus
          visual_identity?: Record<string, any>
          avoid?: string[]
          user_notes?: string | null
          slang?: Record<string, any>[]
          landmarks?: string[]
          neighborhoods?: string[]
          sports_teams?: Record<string, any>
          streetwear_scene?: string | null
          local_brands?: string[]
          cultural_notes?: string | null
          population_notes?: string | null
          research_source?: string | null
          research_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          state?: string | null
          country?: string | null
          nicknames?: string[]
          area_codes?: string[]
          status?: CityStatus
          visual_identity?: Record<string, any>
          avoid?: string[]
          user_notes?: string | null
          slang?: Record<string, any>[]
          landmarks?: string[]
          neighborhoods?: string[]
          sports_teams?: Record<string, any>
          streetwear_scene?: string | null
          local_brands?: string[]
          cultural_notes?: string | null
          population_notes?: string | null
          research_source?: string | null
          research_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sneakers: {
        Row: {
          id: string
          name: string
          tier: SneakerTier
          brand: string | null
          colorway: string | null
          city_relevance: string[]
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tier: SneakerTier
          brand?: string | null
          colorway?: string | null
          city_relevance?: string[]
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tier?: SneakerTier
          brand?: string | null
          colorway?: string | null
          city_relevance?: string[]
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      model_specs: {
        Row: {
          id: string
          name: string
          design_name: string | null
          gender: ModelGender
          age_range: string | null
          ethnicity: string | null
          height: string | null
          build: string | null
          skin_tone: string | null
          hairstyle: string | null
          facial_hair: string | null
          vibe: string | null
          style_notes: string | null
          sneaker_default: SneakerTier | null
          city_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          design_name?: string | null
          gender: ModelGender
          age_range?: string | null
          ethnicity?: string | null
          height?: string | null
          build?: string | null
          skin_tone?: string | null
          hairstyle?: string | null
          facial_hair?: string | null
          vibe?: string | null
          style_notes?: string | null
          sneaker_default?: SneakerTier | null
          city_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          design_name?: string | null
          gender?: ModelGender
          age_range?: string | null
          ethnicity?: string | null
          height?: string | null
          build?: string | null
          skin_tone?: string | null
          hairstyle?: string | null
          facial_hair?: string | null
          vibe?: string | null
          style_notes?: string | null
          sneaker_default?: SneakerTier | null
          city_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      style_slots: {
        Row: {
          id: string
          slot_code: string
          slot_number: number
          gender: StyleGender
          name: string
          top: string
          bottom: string
          sneaker_vibe: string | null
          pants_style: string | null
          chain_style: string | null
          accessories: string[]
          best_for: string | null
          mood: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slot_code: string
          slot_number: number
          gender: StyleGender
          name: string
          top: string
          bottom: string
          sneaker_vibe?: string | null
          pants_style?: string | null
          chain_style?: string | null
          accessories?: string[]
          best_for?: string | null
          mood?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slot_code?: string
          slot_number?: number
          gender?: StyleGender
          name?: string
          top?: string
          bottom?: string
          sneaker_vibe?: string | null
          pants_style?: string | null
          chain_style?: string | null
          accessories?: string[]
          best_for?: string | null
          mood?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      competitors: {
        Row: {
          id: string
          name: string
          tier: CompetitorTier
          price_range: string | null
          target_demo: string | null
          strengths: string[]
          weaknesses: string[]
          key_products: string[]
          social_presence: Record<string, any>
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tier: CompetitorTier
          price_range?: string | null
          target_demo?: string | null
          strengths?: string[]
          weaknesses?: string[]
          key_products?: string[]
          social_presence?: Record<string, any>
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tier?: CompetitorTier
          price_range?: string | null
          target_demo?: string | null
          strengths?: string[]
          weaknesses?: string[]
          key_products?: string[]
          social_presence?: Record<string, any>
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      learnings: {
        Row: {
          id: string
          category: LearningCategory
          city_id: string | null
          insight: string
          source: LearningSource
          source_id: string | null
          confidence: number
          tags: string[]
          applied_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: LearningCategory
          city_id?: string | null
          insight: string
          source?: LearningSource
          source_id?: string | null
          confidence?: number
          tags?: string[]
          applied_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: LearningCategory
          city_id?: string | null
          insight?: string
          source?: LearningSource
          source_id?: string | null
          confidence?: number
          tags?: string[]
          applied_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      brand_guidelines: {
        Row: {
          id: string
          category: string
          key: string
          value: string
          priority: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          key: string
          value: string
          priority?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          key?: string
          value?: string
          priority?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          feedback_type: FeedbackType
          reference_id: string | null
          rating: FeedbackRating
          comment: string | null
          tags: string[]
          auto_learning: boolean
          created_at: string
        }
        Insert: {
          id?: string
          feedback_type: FeedbackType
          reference_id?: string | null
          rating: FeedbackRating
          comment?: string | null
          tags?: string[]
          auto_learning?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          feedback_type?: FeedbackType
          reference_id?: string | null
          rating?: FeedbackRating
          comment?: string | null
          tags?: string[]
          auto_learning?: boolean
          created_at?: string
        }
      }
      prompt_templates: {
        Row: {
          id: string
          name: string
          template_type: PromptTemplateType
          template: string
          variables: string[]
          model_hint: string | null
          use_count: number
          avg_rating: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          template_type: PromptTemplateType
          template: string
          variables?: string[]
          model_hint?: string | null
          use_count?: number
          avg_rating?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          template_type?: PromptTemplateType
          template?: string
          variables?: string[]
          model_hint?: string | null
          use_count?: number
          avg_rating?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      generation_queue: {
        Row: {
          id: string
          city_id: string | null
          content_type: string
          prompt_template_id: string | null
          status: QueueStatus
          priority: number
          model_pipeline: Record<string, any>
          result_id: string | null
          error_message: string | null
          created_at: string
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          city_id?: string | null
          content_type: string
          prompt_template_id?: string | null
          status?: QueueStatus
          priority?: number
          model_pipeline?: Record<string, any>
          result_id?: string | null
          error_message?: string | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          city_id?: string | null
          content_type?: string
          prompt_template_id?: string | null
          status?: QueueStatus
          priority?: number
          model_pipeline?: Record<string, any>
          result_id?: string | null
          error_message?: string | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
      }
      cost_logs: {
        Row: {
          id: string
          category: string
          model: string | null
          cost_cents: number
          content_type: string | null
          city_id: string | null
          metadata: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          model?: string | null
          cost_cents: number
          content_type?: string | null
          city_id?: string | null
          metadata?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          model?: string | null
          cost_cents?: number
          content_type?: string | null
          city_id?: string | null
          metadata?: Record<string, any>
          created_at?: string
        }
      }
      city_elements: {
        Row: {
          id: string
          city_id: string
          element_type: 'slang' | 'landmark' | 'sport' | 'cultural'
          element_key: string
          element_value: Record<string, any>
          status: 'approved' | 'rejected' | 'pending'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city_id: string
          element_type: 'slang' | 'landmark' | 'sport' | 'cultural'
          element_key: string
          element_value?: Record<string, any>
          status?: 'approved' | 'rejected' | 'pending'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city_id?: string
          element_type?: 'slang' | 'landmark' | 'sport' | 'cultural'
          element_key?: string
          element_value?: Record<string, any>
          status?: 'approved' | 'rejected' | 'pending'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_types: {
        Row: {
          id: string
          name: string
          description: string | null
          template: string
          variables: any
          output_format: string
          platform_specs: any
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          template: string
          variables?: any
          output_format?: string
          platform_specs?: any
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          template?: string
          variables?: any
          output_format?: string
          platform_specs?: any
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      generated_images: {
        Row: {
          id: string
          city_id: string
          design_concept_id: string | null
          image_url: string
          prompt_used: string | null
          model_used: string | null
          image_type: string | null
          is_approved: boolean
          approval_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          city_id: string
          design_concept_id?: string | null
          image_url: string
          prompt_used?: string | null
          model_used?: string | null
          image_type?: string | null
          is_approved?: boolean
          approval_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          city_id?: string
          design_concept_id?: string | null
          image_url?: string
          prompt_used?: string | null
          model_used?: string | null
          image_type?: string | null
          is_approved?: boolean
          approval_notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      sneaker_tier: SneakerTier
      model_gender: ModelGender
      style_gender: StyleGender
      competitor_tier: CompetitorTier
      learning_category: LearningCategory
      learning_source: LearningSource
      queue_status: QueueStatus
      city_status: CityStatus
      feedback_rating: FeedbackRating
      feedback_type: FeedbackType
      prompt_template_type: PromptTemplateType
    }
  }
}

// =============================================================================
// Helper Types for API Usage
// =============================================================================

// Sneaker with tier display info
export interface SneakerWithTier {
  id: string
  name: string
  tier: SneakerTier
  tierLabel: string
  brand: string | null
  colorway: string | null
  city_relevance: string[]
  notes: string | null
  is_active: boolean
}

// Model spec with design association
export interface ModelSpecWithDesign {
  id: string
  name: string
  design_name: string | null
  gender: ModelGender
  age_range: string | null
  ethnicity: string | null
  height: string | null
  build: string | null
  skin_tone: string | null
  hairstyle: string | null
  facial_hair: string | null
  vibe: string | null
  style_notes: string | null
  sneaker_default: SneakerTier | null
  city?: {
    id: string
    name: string
  } | null
  is_active: boolean
}

// Style slot for generation
export interface StyleSlotForGeneration {
  slot_code: string
  gender: StyleGender
  name: string
  top: string
  bottom: string
  sneaker_vibe: string | null
  pants_style: string | null
  chain_style: string | null
  accessories: string[]
  best_for: string | null
  mood: string | null
}

// City with full research data
export interface CityWithResearch {
  id: string
  name: string
  state: string | null
  nicknames: string[]
  area_codes: string[]
  slang: { term: string; meaning: string; example?: string }[]
  landmarks: string[]
  neighborhoods: string[]
  sports_teams: Record<string, string[]>
  streetwear_scene: string | null
  local_brands: string[]
  cultural_notes: string | null
  visual_identity: {
    colors?: string[]
    typography?: string
    imagery?: string[]
  }
  avoid: string[]
  status: CityStatus
}

// Competitor analysis
export interface CompetitorAnalysis {
  id: string
  name: string
  tier: CompetitorTier
  price_range: string | null
  target_demo: string | null
  strengths: string[]
  weaknesses: string[]
  key_products: string[]
  social_presence: {
    instagram?: string
    tiktok?: string
    twitter?: string
    followers?: number
  }
  notes: string | null
}

// Learning insight
export interface LearningInsight {
  id: string
  category: LearningCategory
  insight: string
  source: LearningSource
  confidence: number
  tags: string[]
  applied_count: number
  city?: {
    id: string
    name: string
  } | null
}

// Tier display labels
export const SNEAKER_TIER_LABELS: Record<SneakerTier, string> = {
  ultra_grail: 'Ultra Grail',
  heavy_heat: 'Heavy Heat',
  certified_heat: 'Certified Heat',
  new_heat: 'New Heat',
  city_specific: 'City Specific',
  banned: 'Banned'
}

export const COMPETITOR_TIER_LABELS: Record<CompetitorTier, string> = {
  direct: 'Direct Competitor',
  premium_adjacent: 'Premium Adjacent',
  city_specific: 'City Specific',
  aspirational: 'Aspirational'
}

export const LEARNING_CATEGORY_LABELS: Record<LearningCategory, string> = {
  preference: 'Preference',
  dislike: 'Dislike',
  rule: 'Rule',
  intel: 'Intel',
  sneakers: 'Sneakers',
  models: 'Models',
  styles: 'Styles',
  cities: 'Cities',
  prompts: 'Prompts',
  general: 'General'
}

export const FEEDBACK_RATING_LABELS: Record<FeedbackRating, string> = {
  fire: '🔥 Fire',
  good: '👍 Good',
  mid: '😐 Mid',
  miss: '❌ Miss'
}
