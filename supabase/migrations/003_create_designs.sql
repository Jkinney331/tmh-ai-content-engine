-- Migration: Create designs table for storing generated product designs
-- Version: 003
-- Description: Store product designs with city references, design details, and approval status

-- Create designs table
CREATE TABLE IF NOT EXISTS public.designs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL,
    design_name TEXT NOT NULL,
    design_style TEXT NOT NULL,
    slang_term TEXT,
    front_design JSONB NOT NULL DEFAULT '{}'::JSONB,
    back_design JSONB NOT NULL DEFAULT '{}'::JSONB,
    colorways JSONB NOT NULL DEFAULT '[]'::JSONB,
    generation_params JSONB NOT NULL DEFAULT '{}'::JSONB,
    status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_designs_city_id ON public.designs(city_id);
CREATE INDEX idx_designs_status ON public.designs(status);
CREATE INDEX idx_designs_city_status ON public.designs(city_id, status);
CREATE INDEX idx_designs_created_at ON public.designs(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public.designs IS 'Stores generated product designs for cities';
COMMENT ON COLUMN public.designs.id IS 'Unique identifier for the design';
COMMENT ON COLUMN public.designs.city_id IS 'Reference to the city this design belongs to';
COMMENT ON COLUMN public.designs.product_type IS 'Type of product (t-shirt, hoodie, etc.)';
COMMENT ON COLUMN public.designs.design_name IS 'Name of the design';
COMMENT ON COLUMN public.designs.design_style IS 'Style of the design (streetwear, minimalist, etc.)';
COMMENT ON COLUMN public.designs.slang_term IS 'Local slang term used in the design';
COMMENT ON COLUMN public.designs.front_design IS 'JSON object containing front design details (text, layout, fonts, etc.)';
COMMENT ON COLUMN public.designs.back_design IS 'JSON object containing back design details (text, layout, fonts, etc.)';
COMMENT ON COLUMN public.designs.colorways IS 'JSON array of color combinations for the design';
COMMENT ON COLUMN public.designs.generation_params IS 'JSON object containing AI generation parameters used';
COMMENT ON COLUMN public.designs.status IS 'Approval status of the design (generated, approved, rejected)';
COMMENT ON COLUMN public.designs.created_at IS 'Timestamp when the design was created';
COMMENT ON COLUMN public.designs.updated_at IS 'Timestamp when the design was last updated';

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_designs_updated_at
    BEFORE UPDATE ON public.designs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for reading designs (everyone can read)
CREATE POLICY "Designs are viewable by everyone" ON public.designs
    FOR SELECT USING (true);

-- Policy for inserting designs (authenticated users only)
CREATE POLICY "Authenticated users can insert designs" ON public.designs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating designs (authenticated users only)
CREATE POLICY "Authenticated users can update designs" ON public.designs
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Policy for deleting designs (authenticated users only)
CREATE POLICY "Authenticated users can delete designs" ON public.designs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample test data
INSERT INTO public.designs (
    city_id,
    product_type,
    design_name,
    design_style,
    slang_term,
    front_design,
    back_design,
    colorways,
    generation_params,
    status
) VALUES
-- Sample design for Seattle
(
    (SELECT id FROM public.cities WHERE name = 'Seattle'),
    't-shirt',
    'Emerald City Vibes',
    'streetwear',
    'hella',
    '{"text": "HELLA SEATTLE", "font": "bold-sans", "layout": "centered", "size": "large"}'::JSONB,
    '{"text": "206 TILL I DIE", "font": "script", "layout": "bottom", "size": "medium"}'::JSONB,
    '[{"primary": "#2C5530", "secondary": "#FFFFFF", "accent": "#69BE28"}, {"primary": "#002244", "secondary": "#69BE28", "accent": "#FFFFFF"}]'::JSONB,
    '{"model": "dalle-3", "prompt": "Seattle streetwear design with Space Needle", "temperature": 0.8}'::JSONB,
    'approved'
),
-- Sample design for Detroit
(
    (SELECT id FROM public.cities WHERE name = 'Detroit'),
    'hoodie',
    'Motor City Pride',
    'vintage',
    'whatup doe',
    '{"text": "WHATUP DOE", "font": "vintage-serif", "layout": "arch", "size": "xl"}'::JSONB,
    '{"text": "DETROIT VS EVERYBODY", "font": "bold-sans", "layout": "centered", "size": "large"}'::JSONB,
    '[{"primary": "#003A70", "secondary": "#C8102E", "accent": "#FFFFFF"}, {"primary": "#000000", "secondary": "#C8102E", "accent": "#SILVER"}]'::JSONB,
    '{"model": "midjourney", "prompt": "Detroit automotive vintage design", "style": "retro"}'::JSONB,
    'generated'
),
-- Sample design for Chicago
(
    (SELECT id FROM public.cities WHERE name = 'Chicago'),
    't-shirt',
    'Chi-Town Classic',
    'minimalist',
    'joe',
    '{"text": "JOE", "font": "modern-sans", "layout": "left-chest", "size": "small"}'::JSONB,
    '{"text": "CHICAGO", "font": "bold-sans", "layout": "centered", "size": "xxl", "outline": true}'::JSONB,
    '[{"primary": "#C8102E", "secondary": "#003A70", "accent": "#FFFFFF"}, {"primary": "#000000", "secondary": "#FFFFFF", "accent": "#C8102E"}]'::JSONB,
    '{"model": "stable-diffusion", "prompt": "Chicago minimalist skyline design", "steps": 50}'::JSONB,
    'approved'
);

-- Grant permissions
GRANT ALL ON public.designs TO anon;
GRANT ALL ON public.designs TO authenticated;
GRANT ALL ON public.designs TO service_role;