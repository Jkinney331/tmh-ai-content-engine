-- =============================================================================
-- LTRFL Phase 3: Marketing Templates Table
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table: ltrfl_marketing_templates
-- Stores templates for marketing content generation
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ltrfl_marketing_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('video_ad', 'image_ad', 'social_post', 'product_photo')),
  name TEXT NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  platform TEXT,
  dimensions TEXT,
  category TEXT,
  subcategory TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ltrfl_marketing_templates_content_type ON ltrfl_marketing_templates(content_type);
CREATE INDEX IF NOT EXISTS idx_ltrfl_marketing_templates_platform ON ltrfl_marketing_templates(platform);
CREATE INDEX IF NOT EXISTS idx_ltrfl_marketing_templates_category ON ltrfl_marketing_templates(category);
CREATE INDEX IF NOT EXISTS idx_ltrfl_marketing_templates_is_active ON ltrfl_marketing_templates(is_active);

-- Enable RLS
ALTER TABLE ltrfl_marketing_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view marketing_templates" ON ltrfl_marketing_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create marketing_templates" ON ltrfl_marketing_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update marketing_templates" ON ltrfl_marketing_templates
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete marketing_templates" ON ltrfl_marketing_templates
  FOR DELETE USING (auth.role() = 'authenticated');

-- Allow anon access for development
CREATE POLICY "Anon users can view marketing_templates" ON ltrfl_marketing_templates
  FOR SELECT USING (true);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_ltrfl_marketing_templates_updated_at ON ltrfl_marketing_templates;
CREATE TRIGGER update_ltrfl_marketing_templates_updated_at
  BEFORE UPDATE ON ltrfl_marketing_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
