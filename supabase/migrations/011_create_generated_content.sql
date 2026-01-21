-- Create generated_content table for storing AI-generated images and videos
-- This table was missing and referenced by the dashboard

CREATE TABLE IF NOT EXISTS generated_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video', 'caption', 'script')),
    title TEXT,
    description TEXT,

    -- Generation details
    prompt TEXT NOT NULL,
    model TEXT NOT NULL,
    model_version TEXT,

    -- Output
    output_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER, -- For videos
    width INTEGER,
    height INTEGER,
    file_size_bytes BIGINT,

    -- Metadata
    style_slot_id UUID REFERENCES style_slots(id) ON DELETE SET NULL,
    model_spec_id UUID REFERENCES model_specs(id) ON DELETE SET NULL,
    sneaker_id UUID REFERENCES sneakers(id) ON DELETE SET NULL,

    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'approved', 'rejected')),
    error_message TEXT,

    -- Feedback and usage
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_notes TEXT,
    used_in_campaign BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,

    -- Cost tracking
    generation_cost_cents INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_generated_content_city ON generated_content(city_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);
CREATE INDEX IF NOT EXISTS idx_generated_content_created ON generated_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_content_model ON generated_content(model);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_generated_content_updated_at ON generated_content;
CREATE TRIGGER update_generated_content_updated_at
    BEFORE UPDATE ON generated_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Authenticated users can read generated_content" ON generated_content;
CREATE POLICY "Authenticated users can read generated_content"
    ON generated_content FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert generated_content" ON generated_content;
CREATE POLICY "Authenticated users can insert generated_content"
    ON generated_content FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update generated_content" ON generated_content;
CREATE POLICY "Authenticated users can update generated_content"
    ON generated_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete generated_content" ON generated_content;
CREATE POLICY "Authenticated users can delete generated_content"
    ON generated_content FOR DELETE TO authenticated USING (true);

-- Allow anonymous access for development (optional, can be removed in production)
DROP POLICY IF EXISTS "Anon users can read generated_content" ON generated_content;
CREATE POLICY "Anon users can read generated_content"
    ON generated_content FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anon users can insert generated_content" ON generated_content;
CREATE POLICY "Anon users can insert generated_content"
    ON generated_content FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can update generated_content" ON generated_content;
CREATE POLICY "Anon users can update generated_content"
    ON generated_content FOR UPDATE TO anon USING (true) WITH CHECK (true);
