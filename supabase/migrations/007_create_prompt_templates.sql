-- Migration: Create prompt_templates table
-- Description: Store reusable AI prompts with tracking and configuration

-- Create prompt_templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    model_target TEXT NOT NULL,
    prompt TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    success_rate NUMERIC(5, 2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX idx_prompt_templates_model_target ON prompt_templates(model_target);
CREATE INDEX idx_prompt_templates_category_model ON prompt_templates(category, model_target);
CREATE INDEX idx_prompt_templates_created_at ON prompt_templates(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_prompt_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prompt_templates_updated_at_trigger
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_prompt_templates_updated_at();

-- Add RLS policies
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all templates
CREATE POLICY "Allow authenticated read access to prompt_templates"
    ON prompt_templates
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for authenticated users to insert templates
CREATE POLICY "Allow authenticated insert to prompt_templates"
    ON prompt_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy for authenticated users to update templates
CREATE POLICY "Allow authenticated update to prompt_templates"
    ON prompt_templates
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for authenticated users to delete templates
CREATE POLICY "Allow authenticated delete from prompt_templates"
    ON prompt_templates
    FOR DELETE
    TO authenticated
    USING (true);

-- Add comments for documentation
COMMENT ON TABLE prompt_templates IS 'Store reusable AI prompts with tracking and configuration';
COMMENT ON COLUMN prompt_templates.id IS 'Unique identifier for the prompt template';
COMMENT ON COLUMN prompt_templates.name IS 'Name of the prompt template';
COMMENT ON COLUMN prompt_templates.category IS 'Category for organizing prompts (e.g., reddit_post, image_generation)';
COMMENT ON COLUMN prompt_templates.model_target IS 'Target AI model (e.g., gpt-4, claude-3, dall-e-3)';
COMMENT ON COLUMN prompt_templates.prompt IS 'The actual prompt text with variable placeholders';
COMMENT ON COLUMN prompt_templates.variables IS 'JSON object defining available variables and their descriptions';
COMMENT ON COLUMN prompt_templates.settings IS 'JSON object for model-specific settings (temperature, max_tokens, etc.)';
COMMENT ON COLUMN prompt_templates.success_rate IS 'Percentage success rate based on user feedback (0-100)';
COMMENT ON COLUMN prompt_templates.usage_count IS 'Number of times this template has been used';
COMMENT ON COLUMN prompt_templates.created_at IS 'Timestamp when the template was created';
COMMENT ON COLUMN prompt_templates.updated_at IS 'Timestamp when the template was last modified';

-- Insert sample prompt templates for testing
INSERT INTO prompt_templates (name, category, model_target, prompt, variables, settings, success_rate, usage_count)
VALUES
    (
        'Reddit Post Generator - Casual',
        'reddit_post',
        'gpt-4',
        'Create a casual Reddit post about {{topic}} for the r/{{subreddit}} community. Include: {{requirements}}. Tone should be {{tone}}.',
        '{
            "topic": "The main subject of the post",
            "subreddit": "Target subreddit name",
            "requirements": "Specific requirements or points to include",
            "tone": "casual, funny, serious, informative, etc."
        }'::jsonb,
        '{
            "temperature": 0.8,
            "max_tokens": 500,
            "top_p": 0.9
        }'::jsonb,
        85.5,
        142
    ),
    (
        'Image Generation - Urban Scene',
        'image_generation',
        'dall-e-3',
        'Generate a photorealistic image of {{city}} showing {{scene_type}}. Style: {{style}}, Lighting: {{lighting}}, Season: {{season}}',
        '{
            "city": "City name",
            "scene_type": "Type of urban scene (street, skyline, park, etc.)",
            "style": "Visual style (photorealistic, artistic, vintage, etc.)",
            "lighting": "Lighting conditions (golden hour, night, overcast, etc.)",
            "season": "Season (spring, summer, fall, winter)"
        }'::jsonb,
        '{
            "size": "1024x1024",
            "quality": "hd",
            "style": "vivid"
        }'::jsonb,
        92.0,
        89
    ),
    (
        'Content Moderation Check',
        'moderation',
        'gpt-4',
        'Review the following content for appropriateness: "{{content}}". Check for: {{criteria}}. Return JSON with fields: is_appropriate (boolean), issues (array), suggestions (array).',
        '{
            "content": "The content to moderate",
            "criteria": "Specific criteria to check against"
        }'::jsonb,
        '{
            "temperature": 0.1,
            "max_tokens": 200,
            "response_format": {"type": "json_object"}
        }'::jsonb,
        95.0,
        567
    );