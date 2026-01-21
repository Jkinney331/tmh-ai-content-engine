-- TMH Knowledge Base Infrastructure
-- Phase 1: Create all knowledge base tables
-- Aligned with TMH_Knowledge_Base_Appendix.md
-- IDEMPOTENT: Safe to run multiple times

-- ============================================================================
-- HELPER FUNCTION (ensure it exists)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- CITIES TABLE (must exist first for foreign keys)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT,
    country TEXT DEFAULT 'USA',
    nicknames JSONB DEFAULT '[]'::jsonb,
    area_codes JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'researching', 'ready', 'error')),
    visual_identity JSONB DEFAULT '{}'::jsonb,
    avoid JSONB DEFAULT '[]'::jsonb,
    user_notes TEXT,
    slang JSONB DEFAULT '[]'::jsonb,
    landmarks JSONB DEFAULT '[]'::jsonb,
    neighborhoods JSONB DEFAULT '[]'::jsonb,
    sports_teams JSONB DEFAULT '{}'::jsonb,
    demographics JSONB DEFAULT '{}'::jsonb,
    pop_culture JSONB DEFAULT '{}'::jsonb,
    streetwear_scene TEXT,
    local_brands TEXT[] DEFAULT '{}',
    cultural_notes TEXT,
    population_notes TEXT,
    design_recommendations JSONB DEFAULT '{}'::jsonb,
    model_recommendations JSONB DEFAULT '{}'::jsonb,
    research_source TEXT DEFAULT 'manual',
    research_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add columns if they don't exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'state') THEN
        ALTER TABLE cities ADD COLUMN state TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'country') THEN
        ALTER TABLE cities ADD COLUMN country TEXT DEFAULT 'USA';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'slang') THEN
        ALTER TABLE cities ADD COLUMN slang JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'landmarks') THEN
        ALTER TABLE cities ADD COLUMN landmarks JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'neighborhoods') THEN
        ALTER TABLE cities ADD COLUMN neighborhoods JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'sports_teams') THEN
        ALTER TABLE cities ADD COLUMN sports_teams JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'demographics') THEN
        ALTER TABLE cities ADD COLUMN demographics JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'pop_culture') THEN
        ALTER TABLE cities ADD COLUMN pop_culture JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'streetwear_scene') THEN
        ALTER TABLE cities ADD COLUMN streetwear_scene TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'local_brands') THEN
        ALTER TABLE cities ADD COLUMN local_brands TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'cultural_notes') THEN
        ALTER TABLE cities ADD COLUMN cultural_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'population_notes') THEN
        ALTER TABLE cities ADD COLUMN population_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'design_recommendations') THEN
        ALTER TABLE cities ADD COLUMN design_recommendations JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'model_recommendations') THEN
        ALTER TABLE cities ADD COLUMN model_recommendations JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'research_source') THEN
        ALTER TABLE cities ADD COLUMN research_source TEXT DEFAULT 'manual';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'research_date') THEN
        ALTER TABLE cities ADD COLUMN research_date TIMESTAMPTZ;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_status ON cities(status);

-- Trigger
DROP TRIGGER IF EXISTS update_cities_updated_at ON cities;
CREATE TRIGGER update_cities_updated_at
    BEFORE UPDATE ON cities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read cities" ON cities;
CREATE POLICY "Anyone can read cities" ON cities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert cities" ON cities;
CREATE POLICY "Authenticated can insert cities" ON cities FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can update cities" ON cities;
CREATE POLICY "Authenticated can update cities" ON cities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can delete cities" ON cities;
CREATE POLICY "Authenticated can delete cities" ON cities FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- SNEAKERS TABLE (Story 1.1.1)
-- Tiers: ultra_grail, heavy_heat, certified_heat, new_heat, city_specific, banned
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE sneaker_tier AS ENUM ('ultra_grail', 'heavy_heat', 'certified_heat', 'new_heat', 'city_specific', 'banned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS sneakers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    tier sneaker_tier NOT NULL DEFAULT 'certified_heat',
    brand TEXT,
    colorway TEXT,
    cultural_notes TEXT,
    best_cities TEXT[] DEFAULT ARRAY['Any']::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sneakers_tier ON sneakers(tier);
CREATE INDEX IF NOT EXISTS idx_sneakers_brand ON sneakers(brand);
CREATE INDEX IF NOT EXISTS idx_sneakers_active ON sneakers(is_active);

DROP TRIGGER IF EXISTS update_sneakers_updated_at ON sneakers;
CREATE TRIGGER update_sneakers_updated_at
    BEFORE UPDATE ON sneakers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE sneakers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read sneakers" ON sneakers;
CREATE POLICY "Anyone can read sneakers" ON sneakers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert sneakers" ON sneakers;
CREATE POLICY "Authenticated can insert sneakers" ON sneakers FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can update sneakers" ON sneakers;
CREATE POLICY "Authenticated can update sneakers" ON sneakers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can delete sneakers" ON sneakers;
CREATE POLICY "Authenticated can delete sneakers" ON sneakers FOR DELETE TO authenticated USING (true);

-- Seed data: From Knowledge Base Appendix (only if table is empty)
INSERT INTO sneakers (name, tier, brand, colorway, cultural_notes, best_cities)
SELECT * FROM (VALUES
-- Tier 1: Ultra Grails
('Nike SB Dunk Low "Freddy Krueger"', 'ultra_grail'::sneaker_tier, 'Nike SB', 'Various', 'Ultimate grail, horror collab', ARRAY['Any']),
('Nike SB Dunk Low "Wu-Tang"', 'ultra_grail'::sneaker_tier, 'Nike SB', 'Black/Yellow', 'Hip-hop royalty', ARRAY['NYC']),
('Nike SB Dunk Low "Paris"', 'ultra_grail'::sneaker_tier, 'Nike SB', 'Various', 'Extremely rare, art world', ARRAY['NYC']),
('Nike SB Dunk Low "Pigeon"', 'ultra_grail'::sneaker_tier, 'Nike SB', 'Various', 'Jeff Staple, NYC riot shoe', ARRAY['NYC']),
('Air Jordan 1 "Dior"', 'ultra_grail'::sneaker_tier, 'Jordan', 'Grey/White', 'Luxury crossover', ARRAY['Any']),
('Air Jordan 4 "KAWS"', 'ultra_grail'::sneaker_tier, 'Jordan', 'Grey', 'Art world grail', ARRAY['Any']),
('Nike SB Dunk Low "Heineken"', 'ultra_grail'::sneaker_tier, 'Nike SB', 'Green/Red', 'Classic SB era', ARRAY['Any']),
('Air Jordan 1 "Off-White" Chicago', 'ultra_grail'::sneaker_tier, 'Jordan/Off-White', 'White/Red/Black', 'Virgil legacy', ARRAY['Chicago', 'Any']),

-- Tier 2: Heavy Heat
('Air Jordan 1 High "Chicago"', 'heavy_heat'::sneaker_tier, 'Jordan', 'Red/White/Black', 'The original, always works', ARRAY['Chicago', 'Any']),
('Air Jordan 1 High "Bred/Banned"', 'heavy_heat'::sneaker_tier, 'Jordan', 'Black/Red', 'MJ banned story', ARRAY['Any']),
('Air Jordan 1 High "Royal"', 'heavy_heat'::sneaker_tier, 'Jordan', 'Black/Blue', 'Clean, versatile', ARRAY['Any']),
('Air Jordan 1 High "Shadow"', 'heavy_heat'::sneaker_tier, 'Jordan', 'Black/Grey', 'Underrated classic', ARRAY['Any']),
('Air Jordan 1 High "Union LA"', 'heavy_heat'::sneaker_tier, 'Jordan/Union', 'Various', 'LA collab heat', ARRAY['Los Angeles']),
('Air Jordan 1 High "Travis Scott" Mocha', 'heavy_heat'::sneaker_tier, 'Jordan/Travis Scott', 'Brown/Sail', 'Current hype king', ARRAY['Any']),
('Air Jordan 4 "Travis Scott"', 'heavy_heat'::sneaker_tier, 'Jordan/Travis Scott', 'Blue', 'Cactus Jack essential', ARRAY['Any']),
('Air Jordan 11 "Concord"', 'heavy_heat'::sneaker_tier, 'Jordan', 'White/Black/Concord', 'Formal heat', ARRAY['Any']),
('Air Jordan 11 "Bred"', 'heavy_heat'::sneaker_tier, 'Jordan', 'Black/Red', 'Holiday classic', ARRAY['Any']),
('Nike SB Dunk Low "Travis Scott"', 'heavy_heat'::sneaker_tier, 'Nike SB/Travis Scott', 'Brown', 'SB revival', ARRAY['Any']),
('Nike SB Dunk Low "Strangelove"', 'heavy_heat'::sneaker_tier, 'Nike SB', 'Pink', 'Valentine''s grail', ARRAY['Any']),
('Nike SB Dunk Low "Tiffany"', 'heavy_heat'::sneaker_tier, 'Nike SB', 'Black/Aqua', 'Luxury collab', ARRAY['NYC']),
('Air Max 97 "Sean Wotherspoon"', 'heavy_heat'::sneaker_tier, 'Nike', 'Corduroy Multi', 'Corduroy king', ARRAY['Any']),

-- Tier 3: Certified Heat
('Air Jordan 3 "Black Cement"', 'certified_heat'::sneaker_tier, 'Jordan', 'Black/Cement', 'Tinker classic', ARRAY['Any']),
('Air Jordan 4 "Military Black"', 'certified_heat'::sneaker_tier, 'Jordan', 'White/Black', 'Current favorite', ARRAY['Any']),
('Air Jordan 4 "Lightning"', 'certified_heat'::sneaker_tier, 'Jordan', 'Yellow/Black', 'Black/gold heat', ARRAY['Any']),
('Air Max 1 "Patta"', 'certified_heat'::sneaker_tier, 'Nike/Patta', 'Various', 'Amsterdam collab', ARRAY['Any']),
('Air Max 90 "Infrared"', 'certified_heat'::sneaker_tier, 'Nike', 'White/Infrared', 'OG essential', ARRAY['Any']),
('Air Max 95 "Neon"', 'certified_heat'::sneaker_tier, 'Nike', 'Neon Yellow', 'London energy', ARRAY['Any']),
('Air Max 97 "Silver Bullet"', 'certified_heat'::sneaker_tier, 'Nike', 'Silver', 'Futuristic OG', ARRAY['Any']),
('Nike Dunk Low "Panda"', 'certified_heat'::sneaker_tier, 'Nike', 'Black/White', 'If styled right', ARRAY['Any']),
('Nike Air Force 1 Low "White"', 'certified_heat'::sneaker_tier, 'Nike', 'Triple White', 'CRISPY clean only', ARRAY['Any']),
('Yeezy 350 V2 "Zebra"', 'certified_heat'::sneaker_tier, 'Adidas/Yeezy', 'White/Black', 'Kanye peak', ARRAY['Los Angeles', 'Chicago']),
('Yeezy 700 V1 "Wave Runner"', 'certified_heat'::sneaker_tier, 'Adidas/Yeezy', 'Multi', 'Dad shoe revolution', ARRAY['Any']),

-- Tier 4: New Heat (New Balance Era)
('New Balance 990v5 Grey', 'new_heat'::sneaker_tier, 'New Balance', 'Grey', 'The classic dad shoe', ARRAY['NYC', 'Boston']),
('New Balance 990v6', 'new_heat'::sneaker_tier, 'New Balance', 'Grey', 'Latest version', ARRAY['Any']),
('New Balance 2002R "Protection Pack"', 'new_heat'::sneaker_tier, 'New Balance', 'Various', 'Salehe hype', ARRAY['Any']),
('New Balance 550', 'new_heat'::sneaker_tier, 'New Balance', 'Various', 'Aimé Leon Dore effect', ARRAY['NYC']),
('New Balance 1906R', 'new_heat'::sneaker_tier, 'New Balance', 'Various', 'Underrated gem', ARRAY['Any']),
('New Balance x Aimé Leon Dore', 'new_heat'::sneaker_tier, 'New Balance/ALD', 'Various', 'NYC elite collab', ARRAY['NYC']),
('New Balance x JJJJound', 'new_heat'::sneaker_tier, 'New Balance/JJJJound', 'Various', 'Minimalist grail', ARRAY['Any']),

-- City-Specific Essentials
('Timberland 6" Premium "Wheat"', 'city_specific'::sneaker_tier, 'Timberland', 'Wheat', 'Winter essential, cultural staple', ARRAY['NYC']),
('Timberland 6" "Black Nubuck"', 'city_specific'::sneaker_tier, 'Timberland', 'Black', 'Year-round option', ARRAY['NYC']),
('Nike Cortez', 'city_specific'::sneaker_tier, 'Nike', 'White/Red or Black', 'Chicano culture essential', ARRAY['Los Angeles', 'Oakland']),
('Air Jordan "LA to Chicago"', 'city_specific'::sneaker_tier, 'Jordan', 'Various', 'City crossover', ARRAY['Los Angeles', 'Chicago']),
('Air Jordan "Michigan" PE', 'city_specific'::sneaker_tier, 'Jordan', 'Blue/Yellow', 'State pride', ARRAY['Detroit']),

-- Banned Sneakers
('Jordan 1 Mids', 'banned'::sneaker_tier, 'Jordan', 'Various', 'Universally clowned in sneaker culture', ARRAY[]::TEXT[]),
('General release Dunks', 'banned'::sneaker_tier, 'Nike', 'Various', 'No hype, mall energy', ARRAY[]::TEXT[]),
('Beat up/dirty sneakers', 'banned'::sneaker_tier, 'Various', 'Various', 'We are premium, not vintage', ARRAY[]::TEXT[]),
('Off-brand lookalikes', 'banned'::sneaker_tier, 'Various', 'Various', 'Fake = banned', ARRAY[]::TEXT[]),
('Mall sneakers (Skechers)', 'banned'::sneaker_tier, 'Skechers', 'Various', 'Wrong demographic entirely', ARRAY[]::TEXT[])
) AS v(name, tier, brand, colorway, cultural_notes, best_cities)
WHERE NOT EXISTS (SELECT 1 FROM sneakers LIMIT 1);

-- ============================================================================
-- MODEL SPECS TABLE (Story 1.2.1)
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE model_gender AS ENUM ('male', 'female', 'non-binary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS model_specs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    design_name TEXT,
    name TEXT NOT NULL,
    gender model_gender NOT NULL,
    ethnicity TEXT,
    age_range TEXT,
    height TEXT,
    build TEXT,
    skin_tone TEXT,
    hairstyle TEXT,
    facial_hair TEXT,
    vibe TEXT,
    sneaker_default TEXT,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_model_specs_gender ON model_specs(gender);
CREATE INDEX IF NOT EXISTS idx_model_specs_city ON model_specs(city_id);
CREATE INDEX IF NOT EXISTS idx_model_specs_design ON model_specs(design_name);
CREATE INDEX IF NOT EXISTS idx_model_specs_active ON model_specs(is_active);

DROP TRIGGER IF EXISTS update_model_specs_updated_at ON model_specs;
CREATE TRIGGER update_model_specs_updated_at
    BEFORE UPDATE ON model_specs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE model_specs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read model_specs" ON model_specs;
CREATE POLICY "Anyone can read model_specs" ON model_specs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert model_specs" ON model_specs;
CREATE POLICY "Authenticated can insert model_specs" ON model_specs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can update model_specs" ON model_specs;
CREATE POLICY "Authenticated can update model_specs" ON model_specs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can delete model_specs" ON model_specs;
CREATE POLICY "Authenticated can delete model_specs" ON model_specs FOR DELETE TO authenticated USING (true);

-- Seed data (only if table is empty)
INSERT INTO model_specs (design_name, name, gender, ethnicity, age_range, height, build, skin_tone, hairstyle, facial_hair, vibe, sneaker_default)
SELECT * FROM (VALUES
('BODEGA', 'Bodega Design Model', 'male'::model_gender, 'Dominican', '27', '5''11"', 'Athletic, lean', 'Medium-tan (Fitzpatrick IV)', 'Fresh taper fade, textured curly top, crisp lineup', 'Short, well-groomed beard', 'Confident bodega regular', NULL),
('DEADASS', 'Deadass Design Model', 'male'::model_gender, 'Nigerian-American', '24-26', '6''0" - 6''2"', 'Lean, tall frame', NULL, 'Shoulder-length locs OR voluminous curly afro', NULL, 'Brooklyn creative class', NULL),
('YERR', 'Yerr Design Model', 'female'::model_gender, 'Puerto Rican/Dominican', '25-28', '5''6"', 'Athletic, curves', NULL, 'Slicked back ponytail OR natural curls', NULL, 'Bronx/Washington Heights fly girl', NULL),
('FUHGEDDABOUDIT', 'Fuhgeddaboudit Design Model', 'male'::model_gender, 'Italian-American', '30-35', '5''10"', 'Stocky, broad shoulders', NULL, 'Slicked back or clean cut', '5 o''clock shadow or clean shaven', 'Staten Island/Brooklyn Italian', NULL),
('WHAT UP DOE', 'What Up Doe Design Model', 'male'::model_gender, 'Black/African-American', '26-30', '6''0"', 'Athletic', NULL, 'Low fade, waves OR short twists', NULL, 'Detroit hustle energy', NULL),
('THE CHI', 'The Chi Design Model', 'male'::model_gender, 'Black/African-American', '24-28', '5''11"', 'Athletic, lean', NULL, 'High top fade OR short dreads', NULL, 'South Side pride', NULL),
('LA Male Chicano', 'LA Male Option 1', 'male'::model_gender, 'Chicano/Mexican-American', '25-30', '5''9"', 'Athletic', NULL, 'Clean fade, slicked back top OR shaved head', 'Thin mustache or goatee', 'East LA, lowrider culture adjacent', 'Nike Cortez'),
('LA Female', 'LA Female Option 1', 'female'::model_gender, 'Black/African-American', '24-28', '5''7"', 'Athletic, curves', NULL, 'Long braids OR silk press', NULL, 'Inglewood/Compton fly', NULL),
('LA Mixed', 'LA Mixed Option', 'non-binary'::model_gender, 'Mixed/Biracial', '22-27', 'Varies', 'Lean/athletic', NULL, 'Natural texture', NULL, 'LA melting pot, creative class', NULL),
(NULL, 'Urban Male Default', 'male'::model_gender, 'Diverse/Mixed', '22-30', '5''10"-6''1"', 'Athletic', NULL, 'Various (fresh)', NULL, 'Confident stance, streetwear native', NULL),
(NULL, 'Urban Female Default', 'female'::model_gender, 'Diverse/Mixed', '21-28', '5''5"-5''9"', 'Athletic/Slim', NULL, 'Various (styled)', NULL, 'Bold, independent energy', NULL)
) AS v(design_name, name, gender, ethnicity, age_range, height, build, skin_tone, hairstyle, facial_hair, vibe, sneaker_default)
WHERE NOT EXISTS (SELECT 1 FROM model_specs LIMIT 1);

-- ============================================================================
-- STYLE SLOTS TABLE (Story 1.3.1)
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE style_gender AS ENUM ('male', 'female');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS style_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slot_code TEXT NOT NULL,
    slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 6),
    gender style_gender NOT NULL,
    name TEXT NOT NULL,
    sneaker_vibe TEXT NOT NULL,
    pants_style TEXT NOT NULL,
    chain_style TEXT,
    best_for TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(slot_code)
);

CREATE INDEX IF NOT EXISTS idx_style_slots_gender ON style_slots(gender);
CREATE INDEX IF NOT EXISTS idx_style_slots_active ON style_slots(is_active);

DROP TRIGGER IF EXISTS update_style_slots_updated_at ON style_slots;
CREATE TRIGGER update_style_slots_updated_at
    BEFORE UPDATE ON style_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE style_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read style_slots" ON style_slots;
CREATE POLICY "Anyone can read style_slots" ON style_slots FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert style_slots" ON style_slots;
CREATE POLICY "Authenticated can insert style_slots" ON style_slots FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can update style_slots" ON style_slots;
CREATE POLICY "Authenticated can update style_slots" ON style_slots FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can delete style_slots" ON style_slots;
CREATE POLICY "Authenticated can delete style_slots" ON style_slots FOR DELETE TO authenticated USING (true);

-- Seed data (only if table is empty)
INSERT INTO style_slots (slot_code, slot_number, gender, name, sneaker_vibe, pants_style, chain_style, best_for)
SELECT * FROM (VALUES
('M1', 1, 'male'::style_gender, 'Boot Heavy', 'Timbs Wheat/Black', 'Dickies 874, slim cargo', 'Gold Cuban, heavy', 'NYC winter, workwear edge'),
('M2', 2, 'male'::style_gender, 'Jordan Head', 'Jordan 1s/4s/11s', 'Black slim jeans, tapered cargo', 'Gold rope, box chain', 'Classic streetwear'),
('M3', 3, 'male'::style_gender, 'NB Dad', 'NB 990/550/2002R', 'Wide-leg trousers, relaxed denim', 'Silver Cuban, thin gold', 'East coast mature'),
('M4', 4, 'male'::style_gender, 'Dunk Culture', 'SB Dunks, Dunk Low', 'Baggy cargo, Carhartt double knee', 'Layered gold (Cuban + rope)', 'Skate adjacent'),
('M5', 5, 'male'::style_gender, 'Yeezy Wave', 'Yeezy 350/700/Foam', 'Tapered joggers, cropped pants', 'Gold box chain', 'LA, minimal flex'),
('M6', 6, 'male'::style_gender, 'High Fashion Edge', 'Rick Owens, Balenciaga', 'Black wide-leg, leather', 'Thin gold or none', 'Editorial, avant-garde'),
('W1', 1, 'female'::style_gender, 'Tomboy Clean', 'Jordan 1s (OG colors)', 'Baggy cargo, wide-leg jeans', 'Medium Cuban, nameplate', 'Classic tomboy'),
('W2', 2, 'female'::style_gender, 'Athleisure Boss', 'NB 550, Air Max 90/97', 'Biker shorts, leggings + jacket', 'Large hoops, layered gold', 'Gym to street'),
('W3', 3, 'female'::style_gender, 'Street Glam', 'SB Dunks, Jordan 4s', 'Leather pants, high-waisted cargo', 'Chunky Cuban, pendants', 'Night out'),
('W4', 4, 'female'::style_gender, 'Minimalist Flex', 'Yeezy 350, Foam Runner', 'Black joggers, tailored pants', 'Thin hoops, thin chains', 'Clean aesthetic'),
('W5', 5, 'female'::style_gender, 'Y2K Revival', 'Nike Shox, Air Max Plus', 'Low-rise baggy, mini skirt', 'Medium hoops, layered + anklet', 'Throwback'),
('W6', 6, 'female'::style_gender, 'Designer Edge', 'Balenciaga, Rick Owens, Prada', 'Black leather, wide-leg', 'Drop earrings, statement chain', 'High fashion')
) AS v(slot_code, slot_number, gender, name, sneaker_vibe, pants_style, chain_style, best_for)
WHERE NOT EXISTS (SELECT 1 FROM style_slots LIMIT 1);

-- ============================================================================
-- COMPETITORS TABLE (Story 1.5.1)
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE competitor_tier AS ENUM ('direct', 'premium_adjacent', 'city_specific', 'aspirational');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS competitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    tier competitor_tier NOT NULL DEFAULT 'direct',
    positioning TEXT,
    price_range TEXT,
    target_demo TEXT,
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    what_they_do_well TEXT,
    watch_for TEXT[] DEFAULT '{}',
    key_products TEXT[] DEFAULT '{}',
    social_presence JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_competitors_tier ON competitors(tier);
CREATE INDEX IF NOT EXISTS idx_competitors_name ON competitors(name);

DROP TRIGGER IF EXISTS update_competitors_updated_at ON competitors;
CREATE TRIGGER update_competitors_updated_at
    BEFORE UPDATE ON competitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read competitors" ON competitors;
CREATE POLICY "Anyone can read competitors" ON competitors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert competitors" ON competitors;
CREATE POLICY "Authenticated can insert competitors" ON competitors FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can update competitors" ON competitors;
CREATE POLICY "Authenticated can update competitors" ON competitors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can delete competitors" ON competitors;
CREATE POLICY "Authenticated can delete competitors" ON competitors FOR DELETE TO authenticated USING (true);

-- Seed data (only if table is empty)
INSERT INTO competitors (name, tier, positioning, price_range, target_demo, strengths, weaknesses, what_they_do_well, watch_for, key_products, notes)
SELECT * FROM (VALUES
('Supreme', 'direct'::competitor_tier, 'OG streetwear, hype king', '$148-$198', 'Hypebeasts, collectors, 18-35',
 ARRAY['Brand recognition', 'Drop culture mastery', 'Resale value', 'Collaborations (Nike, LV, etc.)'],
 ARRAY['Sold out (literally and figuratively)', 'VF Corp ownership = less cool', 'Overexposed', 'Quality perception declining'],
 'Scarcity/hype building, brand protection, consistent drops',
 ARRAY['Collab announcements', 'Drop dates', 'Resale market sentiment'],
 ARRAY['Box logo hoodie', 'Tees', 'Collabs'],
 'The benchmark for streetwear hype.'),

('Kith', 'aspirational'::competitor_tier, 'Premium streetwear meets lifestyle', '$165-$225', 'Fashion-conscious, 25-40, higher income',
 ARRAY['Premium quality perception', 'Retail experience (stores)', 'Diverse collabs (Nike, New Balance)', 'Clean aesthetic'],
 ARRAY['NYC-centric (less national)', 'Premium price', 'Can feel exclusive/inaccessible'],
 'Editorial content, store design, collab curation, quality consistency',
 ARRAY['Monday drops', 'Seasonal lookbooks', 'Store openings'],
 ARRAY['Hoodies', 'Collabs', 'Footwear partnerships'],
 'Elevated streetwear. Premium but less hype-driven.'),

('BAPE', 'direct'::competitor_tier, 'Japanese streetwear, camo king', '$200-$400+', 'Collectors, hip-hop fans, 20-35',
 ARRAY['Iconic camo/shark hoodie', 'Japanese quality', 'Celebrity co-signs'],
 ARRAY['Price point very high', 'Aesthetic is specific', 'Counterfeits everywhere'],
 'Brand iconography, limited releases, Japanese market dominance',
 ARRAY['Collab drops', 'Celebrity placements'],
 ARRAY['Shark hoodie', 'Camo pieces', 'Collabs'],
 'OG streetwear. Still relevant but peaked.'),

('Stussy', 'direct'::competitor_tier, 'Heritage streetwear, surf/skate roots', '$120-$165', 'Skaters, surfers, OG streetwear fans',
 ARRAY['Heritage/history (40+ years)', 'Consistent quality', 'Global recognition', 'Cool without trying'],
 ARRAY['Less hype than Supreme/Kith', 'Can feel dad streetwear'],
 'Consistency, quality, not overexposing',
 ARRAY['Seasonal collections', 'Nike collabs'],
 ARRAY['Logo tees', 'Hoodies', 'Caps'],
 'OG streetwear brand. Respect but not competition.'),

('Palace', 'direct'::competitor_tier, 'UK streetwear, skate-rooted', '$150-$188', 'UK youth, skaters, 18-30',
 ARRAY['Strong UK following', 'Skate authenticity', 'Humor/irreverence'],
 ARRAY['Less US penetration', 'Specific aesthetic'],
 'Video content, brand voice, skate team',
 ARRAY['Triferg releases', 'Video content'],
 ARRAY['Triferg pieces', 'Collabs'],
 'UK competitor. Less relevant in US.'),

('Fear of God', 'premium_adjacent'::competitor_tier, 'Luxury streetwear, elevated basics', '$400-$600+', 'Fashion-forward, high income, 25-45',
 ARRAY['Premium positioning', 'Jerry Lorenzo influence', 'Celebrity placement'],
 ARRAY['Very expensive', 'Less street credibility'],
 'Silhouettes, color palettes',
 ARRAY['Essentials line pricing', 'Mainline drops'],
 ARRAY['Essentials hoodie', 'Basics'],
 'Shows where streetwear can go premium.'),

('Rhude', 'premium_adjacent'::competitor_tier, 'LA luxury streetwear', '$400-$700+', 'LA fashion scene, 25-40',
 ARRAY['Strong LA presence', 'Celebrity endorsements', 'Racing aesthetic'],
 ARRAY['Very expensive', 'Niche appeal'],
 'LA-specific designs, celebrity placements',
 ARRAY['Collabs', 'Seasonal themes'],
 ARRAY['Graphic hoodies', 'Shorts'],
 'LA-based, similar aesthetic territory.'),

('Only NY', 'city_specific'::competitor_tier, 'NYC-focused streetwear', '$100-$150', 'NYC locals, outdoor enthusiasts',
 ARRAY['Authentic NYC focus', 'Outdoor/nature angle', 'Local credibility'],
 ARRAY['Small scale', 'Limited reach outside NYC'],
 'NYC authenticity',
 ARRAY['NYC designs', 'Seasonal drops'],
 ARRAY['Logo gear', 'Outdoors-influenced'],
 'Direct competitor in city pride space for NYC.'),

('Detroit vs Everybody', 'city_specific'::competitor_tier, 'Detroit pride apparel', '$50-$80', 'Detroit locals and transplants',
 ARRAY['Strong local following', 'Authentic Detroit rep'],
 ARRAY['Lower price point = less premium', 'Regional only'],
 'Detroit market penetration',
 ARRAY['Detroit designs', 'Sports tie-ins'],
 ARRAY['Detroit tees', 'Hoodies'],
 'Direct city-pride competitor, lower price point.')
) AS v(name, tier, positioning, price_range, target_demo, strengths, weaknesses, what_they_do_well, watch_for, key_products, notes)
WHERE NOT EXISTS (SELECT 1 FROM competitors LIMIT 1);

-- ============================================================================
-- LEARNINGS TABLE (Story 1.7.1)
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE learning_category AS ENUM ('preference', 'dislike', 'rule', 'intel', 'sneakers', 'models', 'styles', 'cities', 'prompts', 'general');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE learning_source AS ENUM ('feedback', 'conversation', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS learnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category learning_category NOT NULL,
    subcategory TEXT,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    insight TEXT NOT NULL,
    source learning_source NOT NULL DEFAULT 'manual',
    source_id UUID,
    weight FLOAT DEFAULT 1.0,
    confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
    tags TEXT[] DEFAULT '{}',
    auto_apply BOOLEAN DEFAULT true,
    applied_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_learnings_category ON learnings(category);
CREATE INDEX IF NOT EXISTS idx_learnings_subcategory ON learnings(subcategory);
CREATE INDEX IF NOT EXISTS idx_learnings_city ON learnings(city_id);
CREATE INDEX IF NOT EXISTS idx_learnings_source ON learnings(source);
CREATE INDEX IF NOT EXISTS idx_learnings_confidence ON learnings(confidence);

DROP TRIGGER IF EXISTS update_learnings_updated_at ON learnings;
CREATE TRIGGER update_learnings_updated_at
    BEFORE UPDATE ON learnings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE learnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read learnings" ON learnings;
CREATE POLICY "Anyone can read learnings" ON learnings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert learnings" ON learnings;
CREATE POLICY "Authenticated can insert learnings" ON learnings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can update learnings" ON learnings;
CREATE POLICY "Authenticated can update learnings" ON learnings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can delete learnings" ON learnings;
CREATE POLICY "Authenticated can delete learnings" ON learnings FOR DELETE TO authenticated USING (true);

-- Seed data (only if table is empty)
INSERT INTO learnings (category, subcategory, insight, source, confidence, weight, tags)
SELECT * FROM (VALUES
('preference'::learning_category, 'sneakers', 'Nike Cortez is essential for any Los Angeles content', 'manual'::learning_source, 0.95, 2.0, ARRAY['Los Angeles', 'Cortez', 'west coast']),
('preference'::learning_category, 'sneakers', 'Jordan 11 Concords work exceptionally well for Atlanta lifestyle shots', 'manual'::learning_source, 0.9, 1.5, ARRAY['Atlanta', 'Jordan', 'lifestyle']),
('preference'::learning_category, 'sneakers', 'Timberlands are non-negotiable for NYC winter content', 'manual'::learning_source, 0.95, 2.0, ARRAY['NYC', 'Timberland', 'winter']),
('rule'::learning_category, 'models', 'Athletic builds photograph better in hoodies than slim builds', 'feedback'::learning_source, 0.7, 1.0, ARRAY['body type', 'hoodie', 'photography']),
('rule'::learning_category, 'general', 'Rolex must be visible in every premium shot', 'manual'::learning_source, 1.0, 3.0, ARRAY['accessories', 'luxury', 'non-negotiable']),
('rule'::learning_category, 'sneakers', 'Jordan 1 Mids are NEVER to be used - instant credibility loss', 'manual'::learning_source, 1.0, 5.0, ARRAY['banned', 'Jordan', 'non-negotiable']),
('intel'::learning_category, 'trends', 'Baggy jeans trending strongly with 18-25 demographic', 'manual'::learning_source, 0.8, 1.0, ARRAY['denim', 'trends', 'youth']),
('preference'::learning_category, 'prompts', 'Including specific lighting direction improves Sora output', 'feedback'::learning_source, 0.85, 1.5, ARRAY['prompts', 'Sora', 'lighting'])
) AS v(category, subcategory, insight, source, confidence, weight, tags)
WHERE NOT EXISTS (SELECT 1 FROM learnings LIMIT 1);

-- ============================================================================
-- BRAND GUIDELINES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS brand_guidelines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(category, key)
);

CREATE INDEX IF NOT EXISTS idx_brand_guidelines_category ON brand_guidelines(category);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_active ON brand_guidelines(is_active);

ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read brand_guidelines" ON brand_guidelines;
CREATE POLICY "Anyone can read brand_guidelines" ON brand_guidelines FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert brand_guidelines" ON brand_guidelines;
CREATE POLICY "Authenticated can insert brand_guidelines" ON brand_guidelines FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can update brand_guidelines" ON brand_guidelines;
CREATE POLICY "Authenticated can update brand_guidelines" ON brand_guidelines FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Seed brand guidelines (only if table is empty)
INSERT INTO brand_guidelines (category, key, value, notes)
SELECT * FROM (VALUES
('identity', 'brand_name', 'That''s My Hoodie (TMH)', NULL),
('identity', 'tagline', 'Wear Where You''re From / Rep Your Hood', 'Wordplay on wear/where and hood/hoodie'),
('identity', 'positioning', 'Premium streetwear celebrating hometown pride', NULL),
('identity', 'price_point', '$150-175 retail', NULL),
('identity', 'quality_tier', 'Premium (competes with Kith, Supreme, not H&M)', NULL),
('voice', 'tone', 'confident, authentic, slightly exclusive', NULL),
('voice', 'energy', 'if you know, you know', NULL),
('voice', 'avoid', 'generic, salesy, desperate, try-hard, explaining the joke', NULL),
('non_negotiable', 'no_jordan_mids', 'NEVER use Jordan 1 Mids', 'Banned in sneaker culture, instant credibility loss'),
('non_negotiable', 'no_general_release', 'Only heat/grails sneakers', 'No GR sneakers'),
('non_negotiable', 'clean_sneakers', 'Always crispy clean sneakers', 'No dirty/beat sneakers'),
('non_negotiable', 'rolex_required', 'Rolex in every shot', 'Signals premium positioning'),
('non_negotiable', 'quality_embroidery', 'High-quality embroidery only', 'No screen print aesthetic'),
('non_negotiable', 'heavy_gsm', '400-450 GSM minimum', 'Heavy fabric weight'),
('non_negotiable', 'authentic_slang', 'Authentic local slang only', 'If it is not real, do not use it'),
('non_negotiable', 'diverse_casting', 'Diverse model casting', 'Reflects city actual demographics'),
('product', 'fabric_weight', '400-450 GSM (extra heavyweight)', NULL),
('product', 'material', 'Premium cotton blend, fleece-lined', NULL),
('product', 'construction', 'Double-stitched seams, reinforced cuffs', NULL),
('product', 'fit', 'Relaxed/boxy (streetwear cut)', NULL),
('aesthetic', 'style_references', 'Kith, Supreme, Stussy, Moncler, Stone Island', 'Clean, premium, editorial'),
('aesthetic', 'avoid_aesthetic', 'Fast fashion (H&M, Zara), Mall brands, Over-designed graphics', 'Cheap fabric appearance')
) AS v(category, key, value, notes)
WHERE NOT EXISTS (SELECT 1 FROM brand_guidelines LIMIT 1);

-- ============================================================================
-- GENERATION QUEUE TABLE
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE queue_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS generation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    prompt_template_id UUID,
    status queue_status NOT NULL DEFAULT 'pending',
    priority INTEGER DEFAULT 5,
    model_pipeline JSONB DEFAULT '{}'::jsonb,
    result_id UUID,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_generation_queue_status ON generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_generation_queue_city ON generation_queue(city_id);
CREATE INDEX IF NOT EXISTS idx_generation_queue_priority ON generation_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_generation_queue_created ON generation_queue(created_at);

ALTER TABLE generation_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read generation_queue" ON generation_queue;
CREATE POLICY "Anyone can read generation_queue" ON generation_queue FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert generation_queue" ON generation_queue;
CREATE POLICY "Authenticated can insert generation_queue" ON generation_queue FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can update generation_queue" ON generation_queue;
CREATE POLICY "Authenticated can update generation_queue" ON generation_queue FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can delete generation_queue" ON generation_queue;
CREATE POLICY "Authenticated can delete generation_queue" ON generation_queue FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- COST LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cost_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    model TEXT,
    cost_cents INTEGER NOT NULL,
    content_type TEXT,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cost_logs_category ON cost_logs(category);
CREATE INDEX IF NOT EXISTS idx_cost_logs_created ON cost_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_cost_logs_city ON cost_logs(city_id);
CREATE INDEX IF NOT EXISTS idx_cost_logs_model ON cost_logs(model);

ALTER TABLE cost_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read cost_logs" ON cost_logs;
CREATE POLICY "Anyone can read cost_logs" ON cost_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert cost_logs" ON cost_logs;
CREATE POLICY "Authenticated can insert cost_logs" ON cost_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================================
-- FEEDBACK TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL,
    rating TEXT NOT NULL CHECK (rating IN ('thumbs_up', 'thumbs_down')),
    tags TEXT[] DEFAULT '{}',
    text_feedback TEXT,
    extracted_learnings UUID[] DEFAULT '{}',
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_content ON feedback(content_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_city ON feedback(city_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read feedback" ON feedback;
CREATE POLICY "Anyone can read feedback" ON feedback FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert feedback" ON feedback;
CREATE POLICY "Authenticated can insert feedback" ON feedback FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can update feedback" ON feedback;
CREATE POLICY "Authenticated can update feedback" ON feedback FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- PROMPT TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    model_recommendation TEXT,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prompt_templates_type ON prompt_templates(type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active);

DROP TRIGGER IF EXISTS update_prompt_templates_updated_at ON prompt_templates;
CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read prompt_templates" ON prompt_templates;
CREATE POLICY "Anyone can read prompt_templates" ON prompt_templates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert prompt_templates" ON prompt_templates;
CREATE POLICY "Authenticated can insert prompt_templates" ON prompt_templates FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can update prompt_templates" ON prompt_templates;
CREATE POLICY "Authenticated can update prompt_templates" ON prompt_templates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated can delete prompt_templates" ON prompt_templates;
CREATE POLICY "Authenticated can delete prompt_templates" ON prompt_templates FOR DELETE TO authenticated USING (true);

-- Seed prompt templates (only if table is empty)
INSERT INTO prompt_templates (name, type, template, variables, model_recommendation)
SELECT * FROM (VALUES
('City Research', 'research', 'Research the city of {{city_name}}, {{state}} for a premium streetwear brand targeting millennials and Gen Z (ages 22-35, income $100K+).

I need deep, authentic information about:

1. LOCAL SLANG - What do locals actually say? Not tourist terms.
2. LANDMARKS & NEIGHBORHOODS - Iconic spots locals are proud of
3. AREA CODES - All area codes and cultural significance
4. POP CULTURE - Celebrities/artists, songs, movies that reference this city
5. STREETWEAR SCENE - Local stores and brands
6. DEMOGRAPHICS - Primary ethnic/cultural communities
7. SPORTS & CULTURE - Major teams and their colors

Format your response as structured data I can parse. Be specific and authentic.',
'["city_name", "state"]'::jsonb, 'perplexity/sonar-pro'),

('Lifestyle Image', 'image', 'Professional streetwear fashion photoshoot.

MODEL:
{{model_ethnicity}} {{model_gender}} in {{model_age_range}}, {{model_build}} build.
Hairstyle: {{hairstyle}}
Expression: {{expression}}

CLOTHING:
Wearing {{hoodie_color}} heavyweight hoodie (450GSM) with embroidered "{{design_text}}" on {{embroidery_placement}} in {{embroidery_colors}}.

STYLING:
- Bottoms: {{pants_style}}
- Sneakers: {{sneaker_model}} ({{sneaker_colorway}})
- Chain: {{chain_style}}
- Watch: Rolex visible on wrist

SETTING:
Location: {{location_name}}, {{city_name}}
Time: {{time_of_day}}
Vibe: Natural, caught in the wild, not posed.

MOOD:
Confident, authentic, premium streetwear. If you know, you know energy.

QUALITY:
Professional fashion photography, 4K quality, sharp focus on hoodie details and embroidery.',
'["model_ethnicity", "model_gender", "model_age_range", "model_build", "hairstyle", "expression", "hoodie_color", "design_text", "embroidery_placement", "embroidery_colors", "pants_style", "sneaker_model", "sneaker_colorway", "chain_style", "location_name", "city_name", "time_of_day"]'::jsonb,
'nexa/nano-banana')
) AS v(name, type, template, variables, model_recommendation)
WHERE NOT EXISTS (SELECT 1 FROM prompt_templates LIMIT 1);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
