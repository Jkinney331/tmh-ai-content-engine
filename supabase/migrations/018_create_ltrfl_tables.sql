-- =============================================================================
-- LTRFL (Laid to Rest for Less) Tables
-- Phase 1: Templates, Concepts, CAD Specs
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table: ltrfl_templates
-- Stores urn design prompt templates organized by category
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ltrfl_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  brand_colors JSONB DEFAULT '{"primary": "#9CAF88", "secondary": "#F5F1EB"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ltrfl_templates_category ON ltrfl_templates(category);
CREATE INDEX IF NOT EXISTS idx_ltrfl_templates_subcategory ON ltrfl_templates(subcategory);
CREATE INDEX IF NOT EXISTS idx_ltrfl_templates_is_active ON ltrfl_templates(is_active);

-- Enable RLS
ALTER TABLE ltrfl_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users full access
CREATE POLICY "Authenticated users can view templates" ON ltrfl_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create templates" ON ltrfl_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update templates" ON ltrfl_templates
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete templates" ON ltrfl_templates
  FOR DELETE USING (auth.role() = 'authenticated');

-- Allow anon access for development (remove in production if needed)
CREATE POLICY "Anon users can view templates" ON ltrfl_templates
  FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- Table: ltrfl_concepts
-- Stores generated urn concept images and approval status
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ltrfl_concepts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES ltrfl_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  generated_image_url TEXT,
  thumbnail_url TEXT,
  images JSONB DEFAULT '[]',
  selected_image_index INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewing', 'approved', 'cad_pending', 'cad_complete', 'rejected')),
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES ltrfl_concepts(id) ON DELETE SET NULL,
  review_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ltrfl_concepts_status ON ltrfl_concepts(status);
CREATE INDEX IF NOT EXISTS idx_ltrfl_concepts_category ON ltrfl_concepts(category);
CREATE INDEX IF NOT EXISTS idx_ltrfl_concepts_template_id ON ltrfl_concepts(template_id);
CREATE INDEX IF NOT EXISTS idx_ltrfl_concepts_parent_version_id ON ltrfl_concepts(parent_version_id);
CREATE INDEX IF NOT EXISTS idx_ltrfl_concepts_created_at ON ltrfl_concepts(created_at DESC);

-- Enable RLS
ALTER TABLE ltrfl_concepts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view concepts" ON ltrfl_concepts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create concepts" ON ltrfl_concepts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update concepts" ON ltrfl_concepts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete concepts" ON ltrfl_concepts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Allow anon access for development
CREATE POLICY "Anon users can view concepts" ON ltrfl_concepts
  FOR SELECT USING (true);

CREATE POLICY "Anon users can create concepts" ON ltrfl_concepts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon users can update concepts" ON ltrfl_concepts
  FOR UPDATE USING (true);

-- -----------------------------------------------------------------------------
-- Table: ltrfl_cad_specs
-- Stores CAD specifications for approved concepts (Phase 2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ltrfl_cad_specs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  concept_id UUID REFERENCES ltrfl_concepts(id) ON DELETE CASCADE NOT NULL,
  urn_type TEXT NOT NULL CHECK (urn_type IN ('traditional', 'figurine', 'keepsake')),
  material TEXT NOT NULL,
  volume_cu_in DECIMAL DEFAULT 200,
  height_mm DECIMAL,
  diameter_mm DECIMAL,
  wall_thickness_mm DECIMAL DEFAULT 3,
  access_method TEXT CHECK (access_method IN ('top_lid', 'bottom_loading', 'permanent_seal')),
  lid_type TEXT,
  base_plate_specs JSONB,
  engraving_area JSONB,
  cad_file_url TEXT,
  cad_format TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'complete', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ltrfl_cad_specs_concept_id ON ltrfl_cad_specs(concept_id);
CREATE INDEX IF NOT EXISTS idx_ltrfl_cad_specs_status ON ltrfl_cad_specs(status);

-- Enable RLS
ALTER TABLE ltrfl_cad_specs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view cad_specs" ON ltrfl_cad_specs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create cad_specs" ON ltrfl_cad_specs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update cad_specs" ON ltrfl_cad_specs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete cad_specs" ON ltrfl_cad_specs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Allow anon access for development
CREATE POLICY "Anon users can view cad_specs" ON ltrfl_cad_specs
  FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- Table: ltrfl_marketing_content (Phase 3 - created now for completeness)
-- Stores generated marketing content (video ads, image ads, social posts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ltrfl_marketing_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('video_ad', 'image_ad', 'social_post', 'product_photo')),
  concept_id UUID REFERENCES ltrfl_concepts(id) ON DELETE SET NULL,
  title TEXT,
  prompt TEXT NOT NULL,
  generated_content JSONB DEFAULT '{}',
  platform TEXT,
  dimensions TEXT,
  duration_seconds INTEGER,
  copy_text TEXT,
  cta_text TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'review', 'approved', 'published')),
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES ltrfl_marketing_content(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMPTZ,
  published_url TEXT,
  analytics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ltrfl_marketing_content_type ON ltrfl_marketing_content(content_type);
CREATE INDEX IF NOT EXISTS idx_ltrfl_marketing_content_status ON ltrfl_marketing_content(status);
CREATE INDEX IF NOT EXISTS idx_ltrfl_marketing_content_concept_id ON ltrfl_marketing_content(concept_id);

-- Enable RLS
ALTER TABLE ltrfl_marketing_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can manage marketing_content" ON ltrfl_marketing_content
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anon users can view marketing_content" ON ltrfl_marketing_content
  FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- Updated_at trigger function (reuse if exists, create if not)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_ltrfl_templates_updated_at ON ltrfl_templates;
CREATE TRIGGER update_ltrfl_templates_updated_at
  BEFORE UPDATE ON ltrfl_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ltrfl_concepts_updated_at ON ltrfl_concepts;
CREATE TRIGGER update_ltrfl_concepts_updated_at
  BEFORE UPDATE ON ltrfl_concepts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ltrfl_cad_specs_updated_at ON ltrfl_cad_specs;
CREATE TRIGGER update_ltrfl_cad_specs_updated_at
  BEFORE UPDATE ON ltrfl_cad_specs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ltrfl_marketing_content_updated_at ON ltrfl_marketing_content;
CREATE TRIGGER update_ltrfl_marketing_content_updated_at
  BEFORE UPDATE ON ltrfl_marketing_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
