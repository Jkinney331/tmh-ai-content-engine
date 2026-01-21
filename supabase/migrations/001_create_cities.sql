-- Create cities table for TMH AI Content Engine
CREATE TABLE IF NOT EXISTS cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    nicknames JSONB DEFAULT '[]'::jsonb,
    area_codes JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    visual_identity JSONB DEFAULT '{}'::jsonb,
    avoid JSONB DEFAULT '[]'::jsonb,
    user_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on name for faster lookups
CREATE INDEX idx_cities_name ON cities(name);

-- Create index on status for filtering
CREATE INDEX idx_cities_status ON cities(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_cities_updated_at
    BEFORE UPDATE ON cities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for authenticated users to read all cities
CREATE POLICY "Authenticated users can read cities"
    ON cities
    FOR SELECT
    TO authenticated
    USING (true);

-- Create RLS policy for authenticated users to insert cities
CREATE POLICY "Authenticated users can insert cities"
    ON cities
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create RLS policy for authenticated users to update cities
CREATE POLICY "Authenticated users can update cities"
    ON cities
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policy for authenticated users to delete cities
CREATE POLICY "Authenticated users can delete cities"
    ON cities
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert test data for verification (Detroit)
INSERT INTO cities (name, nicknames, area_codes, status, visual_identity, avoid, user_notes)
VALUES (
    'Detroit',
    '["Motor City", "Motown", "The D", "313"]'::jsonb,
    '["313", "248", "734"]'::jsonb,
    'draft',
    '{"colors": ["blue", "red"], "themes": ["automotive", "music", "resilience"]}'::jsonb,
    '["negative stereotypes", "decline narratives"]'::jsonb,
    'Test city for TMH content generation'
);