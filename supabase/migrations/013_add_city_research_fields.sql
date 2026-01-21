-- Add research fields to cities table
-- These fields store Perplexity research results

-- Add new status values for research workflow
ALTER TABLE cities DROP CONSTRAINT IF EXISTS cities_status_check;
ALTER TABLE cities ADD CONSTRAINT cities_status_check
  CHECK (status IN ('draft', 'researching', 'ready', 'active', 'archived', 'error'));

-- Add slang field for local expressions
ALTER TABLE cities ADD COLUMN IF NOT EXISTS slang JSONB DEFAULT '[]'::jsonb;

-- Add landmarks field for iconic locations
ALTER TABLE cities ADD COLUMN IF NOT EXISTS landmarks JSONB DEFAULT '[]'::jsonb;

-- Add sports_teams field for sports culture
ALTER TABLE cities ADD COLUMN IF NOT EXISTS sports_teams JSONB DEFAULT '{}'::jsonb;

-- Add culture field for streetwear culture info
ALTER TABLE cities ADD COLUMN IF NOT EXISTS culture JSONB DEFAULT '{}'::jsonb;

-- Add research_raw for storing the raw research response
ALTER TABLE cities ADD COLUMN IF NOT EXISTS research_raw TEXT;

-- Add research_completed_at timestamp
ALTER TABLE cities ADD COLUMN IF NOT EXISTS research_completed_at TIMESTAMPTZ;

-- Comment on new columns
COMMENT ON COLUMN cities.slang IS 'Local slang, expressions, and linguistic patterns from Perplexity research';
COMMENT ON COLUMN cities.landmarks IS 'Iconic landmarks and locations for streetwear photography';
COMMENT ON COLUMN cities.sports_teams IS 'Sports teams, colors, rivalries, and fashion influence';
COMMENT ON COLUMN cities.culture IS 'Streetwear culture, local brands, influencers, styles';
COMMENT ON COLUMN cities.research_raw IS 'Raw research response for debugging';
COMMENT ON COLUMN cities.research_completed_at IS 'When Perplexity research was completed';
