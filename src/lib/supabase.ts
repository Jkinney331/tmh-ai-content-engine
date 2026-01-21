import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have real credentials
export const hasRealCredentials = supabaseUrl && supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('your-anon-key') &&
  !supabaseAnonKey.includes('placeholder')

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Typed helpers for common queries

// City helpers
export async function getCities() {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching cities:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Failed to fetch cities:', err)
    return []
  }
}

export async function getCityById(id: string) {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching city:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('Failed to fetch city:', err)
    return null
  }
}

export async function getCityByName(name: string) {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('name', name)
      .single()

    if (error) {
      console.error('Error fetching city by name:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('Failed to fetch city by name:', err)
    return null
  }
}

export async function updateCityStatus(id: string, status: string) {
  const { data, error } = await (supabase as any)
    .from('cities')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// City Elements helpers
export async function getCityElements(cityId: string, elementType?: string, status?: string) {
  let query = supabase
    .from('city_elements')
    .select('*')
    .eq('city_id', cityId)

  if (elementType) {
    query = query.eq('element_type', elementType)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('element_type').order('element_key')

  if (error) throw error
  return data
}

export async function getCityElementsByType(cityId: string) {
  const { data, error } = await supabase
    .from('city_elements')
    .select('*')
    .eq('city_id', cityId)
    .order('element_type')
    .order('element_key')

  if (error) throw error

  // Group elements by type
  const grouped = (data as any)?.reduce((acc: Record<string, typeof data>, element: any) => {
    const type = element.element_type
    if (!acc[type]) {
      acc[type] = []
    }
    (acc as any)[type].push(element)
    return acc
  }, {}) || {}

  return grouped
}

// Image helpers
export async function getImages(cityId?: string, status?: string) {
  let query = supabase
    .from('images')
    .select(`
      *,
      cities (
        id,
        name,
        country
      )
    `)

  if (cityId) {
    query = query.eq('city_id', cityId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getImageById(id: string) {
  const { data, error } = await supabase
    .from('images')
    .select(`
      *,
      cities (
        id,
        name,
        country
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateImageStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
  const { data, error } = await (supabase as any)
    .from('images')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Story helpers
export async function getStories(cityId?: string, status?: string) {
  let query = supabase
    .from('stories')
    .select(`
      *,
      cities (
        id,
        name,
        country
      )
    `)

  if (cityId) {
    query = query.eq('city_id', cityId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getStoryById(id: string) {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      cities (
        id,
        name,
        country
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateStoryStatus(id: string, status: 'draft' | 'published' | 'archived') {
  const { data, error } = await (supabase as any)
    .from('stories')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Reddit post helpers
export async function getRedditPosts(cityId?: string, status?: string) {
  let query = supabase
    .from('reddit_posts')
    .select(`
      *,
      cities (
        id,
        name,
        country
      )
    `)

  if (cityId) {
    query = query.eq('city_id', cityId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getRedditPostById(id: string) {
  const { data, error } = await supabase
    .from('reddit_posts')
    .select(`
      *,
      cities (
        id,
        name,
        country
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateRedditPostStatus(id: string, status: 'draft' | 'scheduled' | 'posted' | 'failed') {
  const { data, error } = await (supabase as any)
    .from('reddit_posts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Generation job helpers
export async function createGenerationJob(data: {
  city_id: string
  type: 'image' | 'story' | 'reddit_post'
  prompt?: string
  metadata?: Record<string, any>
}) {
  const { data: job, error } = await supabase
    .from('generation_jobs')
    .insert({
      ...data,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any)
    .select()
    .single()

  if (error) throw error
  return job
}

export async function getGenerationJobs(status?: string) {
  let query = supabase
    .from('generation_jobs')
    .select(`
      *,
      cities (
        id,
        name,
        country
      )
    `)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateGenerationJobStatus(
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  result?: any,
  error_message?: string
) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  }

  if (result) {
    updateData.result = result
  }

  if (error_message) {
    updateData.error_message = error_message
  }

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await (supabase as any)
    .from('generation_jobs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Analytics helpers
export async function getAnalytics(startDate?: Date, endDate?: Date) {
  let query = supabase
    .from('analytics')
    .select('*')

  if (startDate) {
    query = query.gte('date', startDate.toISOString().split('T')[0])
  }

  if (endDate) {
    query = query.lte('date', endDate.toISOString().split('T')[0])
  }

  const { data, error } = await query.order('date', { ascending: false })

  if (error) throw error
  return data
}

export async function upsertAnalytics(data: {
  date: string
  metric_type: string
  metric_value: number
  city_id?: string
  metadata?: Record<string, any>
}) {
  const { data: analytics, error } = await (supabase as any)
    .from('analytics')
    .upsert({
      ...data,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'date,metric_type,city_id'
    })
    .select()
    .single()

  if (error) throw error
  return analytics
}

// Content types helpers
export async function getContentTypes(active?: boolean) {
  let query = supabase
    .from('content_types')
    .select('*')

  if (active !== undefined) {
    query = query.eq('active', active)
  }

  const { data, error } = await query.order('name')

  if (error) throw error
  return data
}

export async function getContentTypeById(id: string) {
  const { data, error } = await supabase
    .from('content_types')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Storage helpers
export async function uploadImage(file: File, bucket: string = 'images') {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) throw error
  return data
}

export async function getImageUrl(path: string, bucket: string = 'images') {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

export async function deleteImage(path: string, bucket: string = 'images') {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) throw error
}

// Generated Images helpers
export async function getApprovedGeneratedImages() {
  const { data, error } = await supabase
    .from('generated_images')
    .select(`
      *,
      cities (
        id,
        name,
        state
      )
    `)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}