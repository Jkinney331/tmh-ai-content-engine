-- Migration: 002_create_city_elements.sql
-- Purpose: Create city_elements table to store slang, landmarks, sports, etc. with approval status
-- Dependencies: 001_create_cities.sql (cities table)

-- Create city_elements table
CREATE TABLE IF NOT EXISTS public.city_elements (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Foreign key to cities
    city_id UUID NOT NULL,

    -- Element categorization
    element_type TEXT NOT NULL CHECK (element_type IN ('slang', 'landmark', 'sport', 'cultural')),

    -- Key identifier for the element
    element_key TEXT NOT NULL,

    -- JSON data for element details
    element_value JSONB NOT NULL DEFAULT '{}'::JSONB,

    -- Approval status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'rejected', 'pending')),

    -- Optional notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Foreign key constraint
    CONSTRAINT fk_city
        FOREIGN KEY (city_id)
        REFERENCES public.cities(id)
        ON DELETE CASCADE,

    -- Ensure unique element keys within a city and type
    CONSTRAINT unique_city_element UNIQUE(city_id, element_type, element_key)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_city_elements_city_id ON public.city_elements(city_id);
CREATE INDEX IF NOT EXISTS idx_city_elements_element_type ON public.city_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_city_elements_status ON public.city_elements(status);
CREATE INDEX IF NOT EXISTS idx_city_elements_city_status ON public.city_elements(city_id, status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.city_elements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users (read/write access)
CREATE POLICY "Enable read access for authenticated users" ON public.city_elements
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.city_elements
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.city_elements
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON public.city_elements
    FOR DELETE
    TO authenticated
    USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_city_elements_updated_at
    BEFORE UPDATE ON public.city_elements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.city_elements IS 'Stores city-specific elements like slang, landmarks, sports, and cultural references with approval status';
COMMENT ON COLUMN public.city_elements.element_type IS 'Category of element: slang, landmark, sport, or cultural';
COMMENT ON COLUMN public.city_elements.element_key IS 'Unique identifier for the element within its type and city';
COMMENT ON COLUMN public.city_elements.element_value IS 'JSON object containing element details (e.g., description, examples, context)';
COMMENT ON COLUMN public.city_elements.status IS 'Approval status: approved, rejected, or pending';

-- Insert test data for Detroit to verify functionality
DO $$
DECLARE
    detroit_id UUID;
BEGIN
    -- Get Detroit city ID
    SELECT id INTO detroit_id FROM public.cities WHERE name = 'Detroit' LIMIT 1;

    IF detroit_id IS NOT NULL THEN
        -- Insert slang elements
        INSERT INTO public.city_elements (city_id, element_type, element_key, element_value, status, notes) VALUES
            (detroit_id, 'slang', 'whats_good', '{"term": "What''s good", "meaning": "Hello/How are you", "usage": "Casual greeting", "popularity": "high"}'::JSONB, 'approved', 'Common Detroit greeting'),
            (detroit_id, 'slang', 'the_d', '{"term": "The D", "meaning": "Detroit", "usage": "City nickname", "popularity": "very high"}'::JSONB, 'approved', 'Most common nickname for Detroit'),
            (detroit_id, 'slang', 'coney', '{"term": "Coney", "meaning": "Coney Island hot dog", "usage": "Detroit-style chili dog", "popularity": "high"}'::JSONB, 'pending', 'Local food term');

        -- Insert landmark elements
        INSERT INTO public.city_elements (city_id, element_type, element_key, element_value, status, notes) VALUES
            (detroit_id, 'landmark', 'renaissance_center', '{"name": "Renaissance Center", "type": "Building", "significance": "GM Headquarters, Detroit skyline icon", "year_built": 1977}'::JSONB, 'approved', 'Iconic Detroit skyline building'),
            (detroit_id, 'landmark', 'hart_plaza', '{"name": "Hart Plaza", "type": "Public space", "significance": "Waterfront plaza, festival venue", "features": ["Horace E. Dodge Fountain", "Detroit Riverwalk"]}'::JSONB, 'pending', 'Major public gathering space');

        -- Insert sport elements
        INSERT INTO public.city_elements (city_id, element_type, element_key, element_value, status, notes) VALUES
            (detroit_id, 'sport', 'red_wings', '{"team": "Detroit Red Wings", "sport": "Hockey", "league": "NHL", "venue": "Little Caesars Arena", "championships": 11}'::JSONB, 'approved', 'Hockeytown USA'),
            (detroit_id, 'sport', 'lions', '{"team": "Detroit Lions", "sport": "Football", "league": "NFL", "venue": "Ford Field", "colors": ["Honolulu Blue", "Silver"]}'::JSONB, 'approved', 'NFL team');

        -- Insert cultural elements
        INSERT INTO public.city_elements (city_id, element_type, element_key, element_value, status, notes) VALUES
            (detroit_id, 'cultural', 'motown', '{"name": "Motown", "type": "Music", "significance": "Birthplace of Motown Records", "founded": 1959, "founder": "Berry Gordy", "famous_acts": ["The Supremes", "The Temptations", "Stevie Wonder", "Marvin Gaye"]}'::JSONB, 'approved', 'Detroit musical heritage'),
            (detroit_id, 'cultural', 'techno', '{"name": "Detroit Techno", "type": "Music", "significance": "Birthplace of techno music", "pioneers": ["Juan Atkins", "Derrick May", "Kevin Saunderson"], "era": "1980s"}'::JSONB, 'approved', 'Electronic music origins');

        RAISE NOTICE 'Test data inserted for Detroit city with ID: %', detroit_id;
    ELSE
        RAISE NOTICE 'Detroit city not found. Please ensure 001_create_cities.sql has been run first.';
    END IF;
END $$;

-- Verification queries (commented out for migration, can be run manually)
-- SELECT COUNT(*) as total_elements FROM public.city_elements WHERE city_id = (SELECT id FROM public.cities WHERE name = 'Detroit');
-- SELECT * FROM public.city_elements WHERE city_id = (SELECT id FROM public.cities WHERE name = 'Detroit') AND status = 'approved';
-- SELECT element_type, COUNT(*) FROM public.city_elements WHERE city_id = (SELECT id FROM public.cities WHERE name = 'Detroit') GROUP BY element_type;