import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DEFAULT_CONTENT_TYPES = [
  {
    name: 'Product Shot',
    description: 'Clean product photography on studio background',
    template: 'Premium {{product}} hoodie with {{city}} embroidery, floating against clean studio background, professional product photography, 4K quality, soft shadows, commercial lighting',
    variables: JSON.stringify([
      { name: 'product', type: 'string', required: true },
      { name: 'city', type: 'string', required: true }
    ]),
    output_format: 'image',
    platform_specs: JSON.stringify({
      instagram: { aspect_ratio: '1:1', max_size: '1080x1080' },
      general: { format: 'png', quality: 'high' }
    }),
    active: true
  },
  {
    name: 'Lifestyle Shot',
    description: 'Model wearing product in city environment',
    template: '{{model_description}} wearing premium {{city}} hoodie, walking through iconic {{city}} street scene, {{landmark}} visible in background, golden hour lighting, streetwear photography style, cinematic composition',
    variables: JSON.stringify([
      { name: 'model_description', type: 'string', required: true },
      { name: 'city', type: 'string', required: true },
      { name: 'landmark', type: 'string', required: false }
    ]),
    output_format: 'image',
    platform_specs: JSON.stringify({
      instagram: { aspect_ratio: '4:5', max_size: '1080x1350' },
      general: { format: 'jpg', quality: 'high' }
    }),
    active: true
  },
  {
    name: 'Video Ad',
    description: 'Short video advertisement for social media',
    template: 'Cinematic slow-motion shot of {{model_description}} in premium {{city}} hoodie walking through {{landmark}}, camera follows and circles to reveal embroidered logo, urban streetwear aesthetic, professional cinematography',
    variables: JSON.stringify([
      { name: 'model_description', type: 'string', required: true },
      { name: 'city', type: 'string', required: true },
      { name: 'landmark', type: 'string', required: true }
    ]),
    output_format: 'video',
    platform_specs: JSON.stringify({
      tiktok: { duration: '15-30s', aspect_ratio: '9:16' },
      instagram_reels: { duration: '15-30s', aspect_ratio: '9:16' },
      general: { format: 'mp4', fps: 30 }
    }),
    active: true
  },
  {
    name: 'Instagram Caption',
    description: 'Caption for Instagram post',
    template: 'Write an engaging Instagram caption for {{city}} hoodie featuring {{theme}}. Maintain TMH brand voice - confident, authentic, exclusive. Include 5-8 relevant hashtags. Keep under 2200 characters.',
    variables: JSON.stringify([
      { name: 'city', type: 'string', required: true },
      { name: 'theme', type: 'string', required: true }
    ]),
    output_format: 'text',
    platform_specs: JSON.stringify({
      instagram: { max_length: 2200, max_hashtags: 30 }
    }),
    active: true
  },
  {
    name: 'Twitter Post',
    description: 'Short-form content for Twitter/X',
    template: 'Write a Twitter post about {{city}} hoodie drop. Include local {{element_type}}. TMH brand voice. Under 280 characters. Include 2-3 hashtags.',
    variables: JSON.stringify([
      { name: 'city', type: 'string', required: true },
      { name: 'element_type', type: 'string', required: false, default: 'slang' }
    ]),
    output_format: 'text',
    platform_specs: JSON.stringify({
      twitter: { max_length: 280, allow_threads: true }
    }),
    active: true
  },
  {
    name: 'TikTok Script',
    description: 'Short video script for TikTok',
    template: 'Write a 15-30 second TikTok script for {{city}} hoodie. Structure: Hook (0-3s), Reveal (3-10s), Details (10-25s), CTA (25-30s). Include {{city}} slang naturally.',
    variables: JSON.stringify([
      { name: 'city', type: 'string', required: true }
    ]),
    output_format: 'text',
    platform_specs: JSON.stringify({
      tiktok: { duration: '15-30s', format: 'script' }
    }),
    active: true
  },
  {
    name: 'Ad Copy',
    description: 'Facebook/Meta ad copy',
    template: 'Write compelling Facebook ad copy for {{city}} hoodie targeting {{audience}}. Include: headline, primary text, and CTA. Highlight premium quality and city authenticity.',
    variables: JSON.stringify([
      { name: 'city', type: 'string', required: true },
      { name: 'audience', type: 'string', required: true }
    ]),
    output_format: 'text',
    platform_specs: JSON.stringify({
      facebook: { headline_limit: 40, primary_text_limit: 125 }
    }),
    active: true
  }
]

export async function POST() {
  try {
    // Check if table exists by trying to query it
    const { error: checkError } = await supabase
      .from('content_types')
      .select('id')
      .limit(1)

    if (checkError && checkError.message.includes('does not exist')) {
      // Table doesn't exist - need to create it first
      return NextResponse.json({
        success: false,
        error: 'content_types table does not exist',
        fix: 'Run migration 006_create_content_types.sql in Supabase SQL Editor'
      }, { status: 500 })
    }

    // Check current count
    const { count: existingCount } = await supabase
      .from('content_types')
      .select('*', { count: 'exact', head: true })

    if (existingCount && existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `content_types table already has ${existingCount} rows`,
        seeded: false
      })
    }

    // Insert default content types
    const { data, error } = await supabase
      .from('content_types')
      .insert(DEFAULT_CONTENT_TYPES)
      .select()

    if (error) {
      console.error('Seed error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${data?.length || 0} content types`,
      seeded: true,
      data
    })

  } catch (error: any) {
    console.error('Seed content types error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error, count } = await supabase
      .from('content_types')
      .select('*', { count: 'exact' })

    if (error) {
      return NextResponse.json({
        exists: false,
        error: error.message
      })
    }

    return NextResponse.json({
      exists: true,
      count: count || 0,
      data
    })

  } catch (error: any) {
    return NextResponse.json({
      exists: false,
      error: error.message
    })
  }
}
