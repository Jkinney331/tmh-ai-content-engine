export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cities: {
        Row: {
          id: string
          name: string
          nicknames: Json
          area_codes: Json
          status: 'draft' | 'active' | 'archived' | 'researching' | 'ready' | 'error'
          visual_identity: Json
          avoid: Json
          user_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          nicknames?: Json
          area_codes?: Json
          status?: 'draft' | 'active' | 'archived' | 'researching' | 'ready' | 'error'
          visual_identity?: Json
          avoid?: Json
          user_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          nicknames?: Json
          area_codes?: Json
          status?: 'draft' | 'active' | 'archived' | 'researching' | 'ready' | 'error'
          visual_identity?: Json
          avoid?: Json
          user_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      city_elements: {
        Row: {
          id: string
          city_id: string
          element_type: string
          element_key: string
          element_value: Json
          status: 'draft' | 'reviewed' | 'approved' | 'rejected' | 'pending'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city_id: string
          element_type: string
          element_key: string
          element_value: Json
          status?: 'draft' | 'reviewed' | 'approved' | 'rejected' | 'pending'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city_id?: string
          element_type?: string
          element_key?: string
          element_value?: Json
          status?: 'draft' | 'reviewed' | 'approved' | 'rejected' | 'pending'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      designs: {
        Row: {
          id: string
          city_id: string
          design_type: string
          design_data: Json
          status: 'draft' | 'reviewed' | 'approved' | 'published' | 'archived'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city_id: string
          design_type: string
          design_data: Json
          status?: 'draft' | 'reviewed' | 'approved' | 'published' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city_id?: string
          design_type?: string
          design_data?: Json
          status?: 'draft' | 'reviewed' | 'approved' | 'published' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      generated_content: {
        Row: {
          id: string
          content_type: string
          parent_id: string | null
          city_id: string | null
          generation_params: Json | null
          model_used: string | null
          prompt_used: string | null
          title?: string | null
          model?: string | null
          prompt?: string | null
          output_url: string | null
          output_metadata: Json
          order_index?: number | null
          generation_cost_cents?: number | null
          duration_seconds?: number | null
          error_message?: string | null
          status: 'pending' | 'processing' | 'completed' | 'approved' | 'rejected' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_type: string
          parent_id?: string | null
          city_id?: string | null
          generation_params?: Json | null
          model_used?: string | null
          prompt_used?: string | null
          title?: string | null
          model?: string | null
          prompt?: string | null
          output_url?: string | null
          output_metadata: Json
          order_index?: number | null
          generation_cost_cents?: number | null
          duration_seconds?: number | null
          error_message?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'approved' | 'rejected' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_type?: string
          parent_id?: string | null
          city_id?: string | null
          generation_params?: Json | null
          model_used?: string | null
          prompt_used?: string | null
          title?: string | null
          model?: string | null
          prompt?: string | null
          output_url?: string | null
          output_metadata?: Json
          order_index?: number | null
          generation_cost_cents?: number | null
          duration_seconds?: number | null
          error_message?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'approved' | 'rejected' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          content_id: string
          content_type: string
          rating: number | null
          tags: Json
          text_feedback: string | null
          comparison_winner: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content_id: string
          content_type: string
          rating?: number | null
          tags?: Json
          text_feedback?: string | null
          comparison_winner?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          content_type?: string
          rating?: number | null
          tags?: Json
          text_feedback?: string | null
          comparison_winner?: string | null
          created_at?: string
        }
      }
      content_types: {
        Row: {
          id: string
          type_key: string
          display_name: string
          category: string
          description: string | null
          config: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type_key: string
          display_name: string
          category: string
          description?: string | null
          config?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type_key?: string
          display_name?: string
          category?: string
          description?: string | null
          config?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      prompt_templates: {
        Row: {
          id: string
          name: string
          category: string
          template: string
          variables: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          template: string
          variables?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          template?: string
          variables?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      generated_images: {
        Row: {
          id: string
          prompt: string
          image_url: string
          thumbnail_url: string | null
          model_name: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt: string
          image_url: string
          thumbnail_url?: string | null
          model_name: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt?: string
          image_url?: string
          thumbnail_url?: string | null
          model_name?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          date: string
          metric_type: string
          metric_value: number
          city_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          metric_type: string
          metric_value: number
          city_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          metric_type?: string
          metric_value?: number
          city_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      reddit_posts: {
        Row: {
          id: string
          city_id: string
          title: string
          body: string
          subreddit: string
          post_type: 'discussion' | 'question' | 'story' | 'meta'
          status: 'draft' | 'scheduled' | 'posted' | 'failed'
          scheduled_for: string | null
          posted_at: string | null
          reddit_id: string | null
          reddit_url: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city_id: string
          title: string
          body: string
          subreddit: string
          post_type?: 'discussion' | 'question' | 'story' | 'meta'
          status?: 'draft' | 'scheduled' | 'posted' | 'failed'
          scheduled_for?: string | null
          posted_at?: string | null
          reddit_id?: string | null
          reddit_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city_id?: string
          title?: string
          body?: string
          subreddit?: string
          post_type?: 'discussion' | 'question' | 'story' | 'meta'
          status?: 'draft' | 'scheduled' | 'posted' | 'failed'
          scheduled_for?: string | null
          posted_at?: string | null
          reddit_id?: string | null
          reddit_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      generation_jobs: {
        Row: {
          id: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          city_id: string
          type: 'image' | 'story' | 'reddit_post'
          prompt: string | null
          result: Json | null
          error: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          city_id: string
          type: 'image' | 'story' | 'reddit_post'
          prompt?: string | null
          result?: Json | null
          error?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          city_id?: string
          type?: 'image' | 'story' | 'reddit_post'
          prompt?: string | null
          result?: Json | null
          error?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}