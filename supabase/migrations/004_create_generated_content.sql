-- Migration: Create generated_content table for all AI outputs
-- Version: 004
-- Description: Universal table for storing all AI-generated content (product shots, lifestyle shots, social posts, video ads)

-- Create generated_content table
CREATE TABLE IF NOT EXISTS public.generated_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN ('product_shot', 'lifestyle_shot', 'social_post', 'video_ad')),
    parent_id UUID REFERENCES public.designs(id) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    generation_params JSONB NOT NULL DEFAULT '{}'::JSONB,
    model_used TEXT NOT NULL,
    prompt_used TEXT NOT NULL,
    output_url TEXT NOT NULL,
    output_metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_generated_content_content_type ON public.generated_content(content_type);
CREATE INDEX idx_generated_content_city_id ON public.generated_content(city_id);
CREATE INDEX idx_generated_content_status ON public.generated_content(status);
CREATE INDEX idx_generated_content_parent_id ON public.generated_content(parent_id);
CREATE INDEX idx_generated_content_created_at ON public.generated_content(created_at DESC);
CREATE INDEX idx_generated_content_type_city_status ON public.generated_content(content_type, city_id, status);

-- Add comments for documentation
COMMENT ON TABLE public.generated_content IS 'Universal table for all AI-generated content outputs';
COMMENT ON COLUMN public.generated_content.id IS 'Unique identifier for the generated content';
COMMENT ON COLUMN public.generated_content.content_type IS 'Type of content: product_shot, lifestyle_shot, social_post, or video_ad';
COMMENT ON COLUMN public.generated_content.parent_id IS 'Optional reference to parent design (nullable FK to designs table)';
COMMENT ON COLUMN public.generated_content.city_id IS 'Reference to the city this content belongs to';
COMMENT ON COLUMN public.generated_content.generation_params IS 'JSON object containing all parameters used for generation (model settings, style, etc.)';
COMMENT ON COLUMN public.generated_content.model_used IS 'Name/ID of the AI model used for generation (e.g., dalle-3, midjourney, stable-diffusion)';
COMMENT ON COLUMN public.generated_content.prompt_used IS 'The exact prompt sent to the AI model';
COMMENT ON COLUMN public.generated_content.output_url IS 'URL to the generated content (image, video, or text file location)';
COMMENT ON COLUMN public.generated_content.output_metadata IS 'JSON object containing metadata about the output (dimensions, format, duration, etc.)';
COMMENT ON COLUMN public.generated_content.status IS 'Current status of the content (pending, processing, completed, failed, approved, rejected)';
COMMENT ON COLUMN public.generated_content.created_at IS 'Timestamp when the content was created';

-- Enable RLS (Row Level Security)
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for reading generated content (everyone can read)
CREATE POLICY "Generated content is viewable by everyone" ON public.generated_content
    FOR SELECT USING (true);

-- Policy for inserting generated content (authenticated users only)
CREATE POLICY "Authenticated users can insert generated content" ON public.generated_content
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating generated content (authenticated users only)
CREATE POLICY "Authenticated users can update generated content" ON public.generated_content
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Policy for deleting generated content (authenticated users only)
CREATE POLICY "Authenticated users can delete generated content" ON public.generated_content
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample test data
INSERT INTO public.generated_content (
    content_type,
    parent_id,
    city_id,
    generation_params,
    model_used,
    prompt_used,
    output_url,
    output_metadata,
    status
) VALUES
-- Product shot for Seattle design
(
    'product_shot',
    (SELECT id FROM public.designs WHERE design_name = 'Emerald City Vibes' LIMIT 1),
    (SELECT id FROM public.cities WHERE name = 'Seattle'),
    '{"style": "studio", "lighting": "soft", "background": "white", "angle": "front", "temperature": 0.7}'::JSONB,
    'dalle-3',
    'Professional product photography of a Seattle streetwear t-shirt with "HELLA SEATTLE" text, studio lighting, white background, front view',
    'https://storage.example.com/generated/seattle-product-001.png',
    '{"width": 1024, "height": 1024, "format": "png", "size_bytes": 856234, "color_profile": "sRGB"}'::JSONB,
    'completed'
),
-- Lifestyle shot for Detroit design
(
    'lifestyle_shot',
    (SELECT id FROM public.designs WHERE design_name = 'Motor City Pride' LIMIT 1),
    (SELECT id FROM public.cities WHERE name = 'Detroit'),
    '{"setting": "urban", "model_type": "male", "age_range": "25-35", "location": "downtown", "time_of_day": "golden_hour"}'::JSONB,
    'midjourney',
    'Young man wearing Detroit hoodie with "WHATUP DOE" text, standing in front of Detroit skyline during golden hour, urban streetwear photography',
    'https://storage.example.com/generated/detroit-lifestyle-001.png',
    '{"width": 1456, "height": 816, "format": "png", "size_bytes": 1234567, "aspect_ratio": "16:9"}'::JSONB,
    'approved'
),
-- Social post for Chicago
(
    'social_post',
    (SELECT id FROM public.designs WHERE design_name = 'Chi-Town Classic' LIMIT 1),
    (SELECT id FROM public.cities WHERE name = 'Chicago'),
    '{"platform": "instagram", "post_type": "carousel", "hashtags": ["chicago", "chitown", "streetwear"], "caption_style": "casual"}'::JSONB,
    'gpt-4',
    'Create an Instagram carousel post showcasing Chicago minimalist t-shirt design with engaging captions for streetwear audience',
    'https://storage.example.com/generated/chicago-social-001.json',
    '{"slides": 5, "captions": true, "hashtag_count": 15, "format": "carousel", "platform": "instagram"}'::JSONB,
    'completed'
),
-- Video ad for Seattle (no parent design)
(
    'video_ad',
    NULL,
    (SELECT id FROM public.cities WHERE name = 'Seattle'),
    '{"duration": 15, "style": "dynamic", "music": "hip-hop", "text_overlays": true, "transitions": "smooth", "fps": 30}'::JSONB,
    'runway-gen2',
    'Create 15-second video ad for Seattle streetwear collection, dynamic editing, hip-hop soundtrack, featuring Space Needle and city vibes',
    'https://storage.example.com/generated/seattle-video-001.mp4',
    '{"duration_seconds": 15, "resolution": "1920x1080", "fps": 30, "format": "mp4", "size_bytes": 15678234, "has_audio": true}'::JSONB,
    'processing'
),
-- Product shot for Chicago (different angle)
(
    'product_shot',
    (SELECT id FROM public.designs WHERE design_name = 'Chi-Town Classic' LIMIT 1),
    (SELECT id FROM public.cities WHERE name = 'Chicago'),
    '{"style": "lifestyle", "lighting": "natural", "background": "urban", "angle": "three-quarter", "temperature": 0.8}'::JSONB,
    'stable-diffusion-xl',
    'Chicago minimalist t-shirt with "JOE" text, three-quarter angle, natural lighting, urban background with Chicago skyline',
    'https://storage.example.com/generated/chicago-product-002.png',
    '{"width": 1024, "height": 1024, "format": "png", "size_bytes": 923456, "color_profile": "sRGB"}'::JSONB,
    'approved'
),
-- Social post without parent design (generic Detroit content)
(
    'social_post',
    NULL,
    (SELECT id FROM public.cities WHERE name = 'Detroit'),
    '{"platform": "twitter", "post_type": "thread", "hashtags": ["detroit", "motorcity", "313"], "tone": "proud"}'::JSONB,
    'claude-3',
    'Create Twitter thread about Detroit streetwear culture and local slang, highlighting Motor City pride',
    'https://storage.example.com/generated/detroit-social-002.json',
    '{"tweets": 5, "characters": 1200, "media_included": true, "format": "thread", "platform": "twitter"}'::JSONB,
    'completed'
);

-- Grant permissions
GRANT ALL ON public.generated_content TO anon;
GRANT ALL ON public.generated_content TO authenticated;
GRANT ALL ON public.generated_content TO service_role;