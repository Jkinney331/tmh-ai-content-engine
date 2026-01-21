-- Create generated_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  design_concept_id UUID NULL,
  image_url TEXT NOT NULL,
  prompt_used TEXT,
  model_used VARCHAR(100),
  image_type VARCHAR(50),
  is_approved BOOLEAN DEFAULT false,
  approval_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_generated_city ON generated_images(city_id);
CREATE INDEX IF NOT EXISTS idx_generated_approved ON generated_images(is_approved);
CREATE INDEX IF NOT EXISTS idx_generated_type ON generated_images(image_type);
CREATE INDEX IF NOT EXISTS idx_generated_created ON generated_images(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access for all authenticated users
CREATE POLICY IF NOT EXISTS "Allow read access for all" ON generated_images
  FOR SELECT
  USING (true);

-- Create policy to allow insert for authenticated users
CREATE POLICY IF NOT EXISTS "Allow insert for authenticated" ON generated_images
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow update for authenticated users
CREATE POLICY IF NOT EXISTS "Allow update for authenticated" ON generated_images
  FOR UPDATE
  USING (true);