-- Add output_metadata JSONB column to generated_content if missing
ALTER TABLE generated_content
ADD COLUMN IF NOT EXISTS output_metadata JSONB DEFAULT '{}'::jsonb;
