-- Migration: Create content_types table for configurable social content formats
-- Version: 006
-- Date: 2024-01-20

-- Drop table if exists (for clean migrations)
DROP TABLE IF EXISTS public.content_types CASCADE;

-- Create content_types table
CREATE TABLE public.content_types (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Content type information
    name TEXT NOT NULL UNIQUE,
    description TEXT,

    -- Template configuration
    template TEXT NOT NULL, -- Template string with variables like {{city_name}}, {{element}}
    variables JSONB DEFAULT '[]'::JSONB, -- Array of variable definitions [{name, type, required}]

    -- Output configuration
    output_format TEXT NOT NULL DEFAULT 'text', -- text, json, html, markdown
    platform_specs JSONB DEFAULT '{}'::JSONB, -- Platform-specific settings {twitter: {max_length: 280}}

    -- Status
    active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_content_types_active ON public.content_types(active);
CREATE INDEX idx_content_types_name ON public.content_types(name);
CREATE INDEX idx_content_types_created_at ON public.content_types(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public.content_types IS 'Stores configurable content type templates for AI content generation';
COMMENT ON COLUMN public.content_types.id IS 'Unique identifier for the content type';
COMMENT ON COLUMN public.content_types.name IS 'Human-readable name for the content type';
COMMENT ON COLUMN public.content_types.description IS 'Detailed description of what this content type generates';
COMMENT ON COLUMN public.content_types.template IS 'Template string with variable placeholders for content generation';
COMMENT ON COLUMN public.content_types.variables IS 'JSON array defining available variables and their types';
COMMENT ON COLUMN public.content_types.output_format IS 'Format of the generated output (text, json, html, markdown)';
COMMENT ON COLUMN public.content_types.platform_specs IS 'Platform-specific configuration (character limits, formats, etc)';
COMMENT ON COLUMN public.content_types.active IS 'Whether this content type is currently available for use';
COMMENT ON COLUMN public.content_types.created_at IS 'Timestamp when the content type was created';
COMMENT ON COLUMN public.content_types.updated_at IS 'Timestamp when the content type was last modified';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_content_types_updated_at
    BEFORE UPDATE ON public.content_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.content_types ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active content types
CREATE POLICY "Active content types are viewable by everyone"
    ON public.content_types
    FOR SELECT
    USING (active = true);

-- Policy: Only authenticated users can read all content types (including inactive)
CREATE POLICY "Authenticated users can view all content types"
    ON public.content_types
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Only authenticated users can insert content types
CREATE POLICY "Authenticated users can create content types"
    ON public.content_types
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Only authenticated users can update content types
CREATE POLICY "Authenticated users can update content types"
    ON public.content_types
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Only authenticated users can delete content types
CREATE POLICY "Authenticated users can delete content types"
    ON public.content_types
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert sample content types for testing
INSERT INTO public.content_types (name, description, template, variables, output_format, platform_specs) VALUES
(
    'Twitter Post',
    'Short-form content optimized for Twitter engagement',
    '🏙️ Discovered in {{city_name}}: {{element_type}} at {{location}}! {{description}} #TMH{{city_code}} #UrbanDiscovery',
    '[
        {"name": "city_name", "type": "string", "required": true},
        {"name": "city_code", "type": "string", "required": true},
        {"name": "element_type", "type": "string", "required": true},
        {"name": "location", "type": "string", "required": true},
        {"name": "description", "type": "string", "required": true}
    ]'::JSONB,
    'text',
    '{"twitter": {"max_length": 280, "allow_mentions": true, "allow_hashtags": true}}'::JSONB
),
(
    'Instagram Caption',
    'Engaging captions for Instagram posts with hashtag optimization',
    '📍 {{city_name}} Hidden Gem Alert!

{{description}}

Found this {{element_type}} at {{location}} and had to share! Have you been here?

{{hashtags}}',
    '[
        {"name": "city_name", "type": "string", "required": true},
        {"name": "element_type", "type": "string", "required": true},
        {"name": "location", "type": "string", "required": true},
        {"name": "description", "type": "string", "required": true},
        {"name": "hashtags", "type": "string", "required": false, "default": "#TMH #HiddenGems #UrbanExploration"}
    ]'::JSONB,
    'text',
    '{"instagram": {"max_length": 2200, "max_hashtags": 30, "allow_mentions": true}}'::JSONB
),
(
    'Reddit Post',
    'Long-form content for Reddit community engagement',
    '## {{title}}

Hey r/{{subreddit}}!

{{introduction}}

**Location:** {{location}}, {{city_name}}

{{body}}

{{call_to_action}}

**TL;DR:** {{tldr}}',
    '[
        {"name": "title", "type": "string", "required": true},
        {"name": "subreddit", "type": "string", "required": true, "default": "CityName"},
        {"name": "introduction", "type": "string", "required": true},
        {"name": "city_name", "type": "string", "required": true},
        {"name": "location", "type": "string", "required": true},
        {"name": "body", "type": "string", "required": true},
        {"name": "call_to_action", "type": "string", "required": false, "default": "What are your favorite hidden spots?"},
        {"name": "tldr", "type": "string", "required": true}
    ]'::JSONB,
    'markdown',
    '{"reddit": {"max_title_length": 300, "allow_markdown": true, "require_flair": false}}'::JSONB
),
(
    'Blog Post Intro',
    'SEO-optimized blog post introduction',
    '# {{title}}

*{{date}}* | {{city_name}} | {{read_time}} min read

{{hook}}

## What You''ll Discover

{{preview_points}}

{{introduction}}',
    '[
        {"name": "title", "type": "string", "required": true},
        {"name": "date", "type": "string", "required": false},
        {"name": "city_name", "type": "string", "required": true},
        {"name": "read_time", "type": "number", "required": false, "default": 5},
        {"name": "hook", "type": "string", "required": true},
        {"name": "preview_points", "type": "string", "required": true},
        {"name": "introduction", "type": "string", "required": true}
    ]'::JSONB,
    'markdown',
    '{"blog": {"min_length": 150, "seo_optimized": true, "allow_html": false}}'::JSONB
),
(
    'TikTok Script',
    'Short video script optimized for TikTok format',
    'HOOK (0-3s): {{hook}}

REVEAL (3-10s): {{reveal}}

DETAILS (10-25s): {{details}}

CTA (25-30s): {{call_to_action}}

#TMH #{{city_name}} #HiddenGems',
    '[
        {"name": "hook", "type": "string", "required": true},
        {"name": "reveal", "type": "string", "required": true},
        {"name": "details", "type": "string", "required": true},
        {"name": "call_to_action", "type": "string", "required": true},
        {"name": "city_name", "type": "string", "required": true}
    ]'::JSONB,
    'text',
    '{"tiktok": {"max_duration": 30, "format": "script", "trending_sounds": true}}'::JSONB
);

-- Grant permissions to authenticated users
GRANT ALL ON public.content_types TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.content_types TO anon;

-- Create a function to validate template variables
CREATE OR REPLACE FUNCTION validate_content_type_template()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract all variable names from the template
    DECLARE
        template_vars TEXT[];
        defined_vars TEXT[];
        var_record JSONB;
    BEGIN
        -- Extract variables from template (pattern: {{variable_name}})
        template_vars := ARRAY(
            SELECT DISTINCT regexp_replace(matches[1], '[{}]', '', 'g')
            FROM regexp_matches(NEW.template, '{{([^}]+)}}', 'g') AS matches
        );

        -- Extract defined variable names from the variables JSON array
        IF NEW.variables IS NOT NULL AND jsonb_array_length(NEW.variables) > 0 THEN
            defined_vars := ARRAY(
                SELECT jsonb_array_elements_text(
                    jsonb_agg(elem->>'name')
                )
                FROM jsonb_array_elements(NEW.variables) AS elem
            );
        END IF;

        -- Log validation for debugging (optional)
        RAISE NOTICE 'Template variables: %', template_vars;
        RAISE NOTICE 'Defined variables: %', defined_vars;

        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for template validation
CREATE TRIGGER validate_content_type_template_trigger
    BEFORE INSERT OR UPDATE ON public.content_types
    FOR EACH ROW
    EXECUTE FUNCTION validate_content_type_template();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Content types table created successfully with sample data';
END $$;