# That's My Hoodie - Knowledge Base Schema
## Supabase Database Structure

---

## OVERVIEW

This document defines the complete database structure for storing all TMH brand knowledge, city-specific concepts, design references, and generated content. Designed for Supabase PostgreSQL.

---

## DATABASE TABLES

### TABLE 1: `cities`
**Purpose:** Store all city information and metadata

```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  state VARCHAR(50),
  area_code VARCHAR(10) NOT NULL,
  nickname VARCHAR(100),
  timezone VARCHAR(50),
  population INTEGER,
  climate VARCHAR(50), -- e.g., "cold-weather", "temperate", "warm"
  primary_sports_team VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_cities_area_code ON cities(area_code);
CREATE INDEX idx_cities_is_active ON cities(is_active);

-- Example Data
INSERT INTO cities (name, state, area_code, nickname, timezone, climate, primary_sports_team) VALUES
('Seattle', 'Washington', '206', 'Emerald City', 'America/Los_Angeles', 'cold-weather', 'Seahawks'),
('Detroit', 'Michigan', '313', 'Motor City', 'America/Detroit', 'cold-weather', 'Lions'),
('Chicago', 'Illinois', '312', 'Windy City', 'America/Chicago', 'cold-weather', 'Bears');
```

---

### TABLE 2: `city_landmarks`
**Purpose:** Store iconic locations and landmarks per city

```sql
CREATE TABLE city_landmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50), -- e.g., "building", "monument", "park", "bridge", "street"
  description TEXT,
  visual_keywords TEXT[], -- Array of keywords for image generation
  is_primary BOOLEAN DEFAULT false, -- Flag for most iconic landmarks
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_landmarks_city ON city_landmarks(city_id);
CREATE INDEX idx_landmarks_primary ON city_landmarks(is_primary);

-- Example Data
INSERT INTO city_landmarks (city_id, name, type, description, visual_keywords, is_primary) VALUES
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  'Space Needle',
  'monument',
  'Iconic 605-foot observation tower',
  ARRAY['space needle', 'skyline', 'observation deck', 'seattle center'],
  true
),
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  'Pike Place Market',
  'market',
  'Historic public market and tourist attraction',
  ARRAY['pike place', 'public market', 'neon sign', 'fish market', 'downtown'],
  true
);
```

---

### TABLE 3: `city_cultural_elements`
**Purpose:** Store cultural touchpoints, slang, music, food, vibes

```sql
CREATE TABLE city_cultural_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  category VARCHAR(50), -- "music", "food", "slang", "sports", "history", "vibe"
  element VARCHAR(200) NOT NULL,
  description TEXT,
  tags TEXT[], -- Additional searchable tags
  relevance_score INTEGER DEFAULT 50, -- 0-100, how central is this to city identity
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cultural_city ON city_cultural_elements(city_id);
CREATE INDEX idx_cultural_category ON city_cultural_elements(category);
CREATE INDEX idx_cultural_relevance ON city_cultural_elements(relevance_score DESC);

-- Example Data
INSERT INTO city_cultural_elements (city_id, category, element, description, relevance_score) VALUES
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  'music',
  'Grunge',
  'Birthplace of grunge music - Nirvana, Pearl Jam, Soundgarden',
  95
),
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  'food',
  'Coffee Culture',
  'Home of Starbucks, independent coffee shops everywhere',
  90
),
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  'vibe',
  'Rain City Resilience',
  'Embracing the gray, PNW outdoor lifestyle despite weather',
  85
),
(
  (SELECT id FROM cities WHERE name = 'Detroit'),
  'music',
  'Motown',
  'Motown Records - soul, R&B, cultural impact',
  100
),
(
  (SELECT id FROM cities WHERE name = 'Detroit'),
  'history',
  'Automotive Capital',
  'Motor City - birthplace of American auto industry',
  95
);
```

---

### TABLE 4: `city_events`
**Purpose:** Track local events, moments, celebrations

```sql
CREATE TABLE city_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  event_type VARCHAR(50), -- "annual", "historic", "seasonal", "sports"
  date_start DATE,
  date_end DATE,
  is_recurring BOOLEAN DEFAULT false,
  description TEXT,
  visual_keywords TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_city ON city_events(city_id);
CREATE INDEX idx_events_type ON city_events(event_type);
CREATE INDEX idx_events_recurring ON city_events(is_recurring);

-- Example Data
INSERT INTO city_events (city_id, name, event_type, is_recurring, description, visual_keywords) VALUES
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  'Seafair',
  'annual',
  true,
  'Summer festival with hydroplane races and Blue Angels',
  ARRAY['seafair', 'summer', 'boats', 'blue angels', 'lake washington']
),
(
  (SELECT id FROM cities WHERE name = 'Detroit'),
  'Detroit Auto Show',
  'annual',
  true,
  'North American International Auto Show',
  ARRAY['auto show', 'cars', 'innovation', 'technology']
);
```

---

### TABLE 5: `city_catchphrases`
**Purpose:** Store local sayings, slogans, expressions

```sql
CREATE TABLE city_catchphrases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  phrase TEXT NOT NULL,
  context TEXT, -- When/how it's used
  popularity_score INTEGER DEFAULT 50, -- 0-100
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_catchphrases_city ON city_catchphrases(city_id);
CREATE INDEX idx_catchphrases_popularity ON city_catchphrases(popularity_score DESC);

-- Example Data
INSERT INTO city_catchphrases (city_id, phrase, context, popularity_score) VALUES
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  'The mountain is out',
  'Said when Mt. Rainier is visible on a clear day',
  80
),
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  'Go Hawks',
  'Seahawks fan rallying cry, especially during 12th man reference',
  95
),
(
  (SELECT id FROM cities WHERE name = 'Detroit'),
  'Detroit vs. Everybody',
  'Pride statement about city resilience and unity',
  100
);
```

---

### TABLE 6: `reference_images`
**Purpose:** Store approved reference images for style/vibe

```sql
CREATE TABLE reference_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, -- Supabase Storage URL
  image_type VARCHAR(50), -- "landscape", "landmark", "lifestyle", "product", "logo"
  description TEXT,
  tags TEXT[],
  is_approved BOOLEAN DEFAULT false,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ref_images_city ON reference_images(city_id);
CREATE INDEX idx_ref_images_type ON reference_images(image_type);
CREATE INDEX idx_ref_images_approved ON reference_images(is_approved);

-- Example Data
INSERT INTO reference_images (city_id, image_url, image_type, description, tags, is_approved) VALUES
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  'supabase-storage-url/seattle-pike-place-rainy.jpg',
  'landmark',
  'Pike Place Market on rainy day with neon signs',
  ARRAY['pike place', 'rain', 'neon', 'moody'],
  true
);
```

---

### TABLE 7: `design_concepts`
**Purpose:** Store hoodie design concepts per city

```sql
CREATE TABLE design_concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  concept_name VARCHAR(200) NOT NULL,
  description TEXT,
  design_elements JSONB, -- Flexible JSON for logo variations, colors, placements
  status VARCHAR(50) DEFAULT 'draft', -- "draft", "in_review", "approved", "produced"
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_concepts_city ON design_concepts(city_id);
CREATE INDEX idx_concepts_status ON design_concepts(status);

-- Example Design Elements JSON Structure:
-- {
--   "logo_style": "minimal TMH with pin",
--   "logo_placement": "center chest",
--   "hoodie_color": "black",
--   "embroidery_color": "white",
--   "logo_size_inches": 4,
--   "additional_elements": ["city skyline", "area code"],
--   "inspiration": "Seattle grunge minimalism"
-- }

-- Example Data
INSERT INTO design_concepts (city_id, concept_name, description, design_elements, status) VALUES
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  'Seattle Minimal Pin',
  'Clean TMH with geometric pin, black hoodie white embroidery',
  '{"logo_style": "minimal TMH with pin", "logo_placement": "center chest", "hoodie_color": "black", "embroidery_color": "white", "logo_size_inches": 4}'::jsonb,
  'approved'
);
```

---

### TABLE 8: `generated_images`
**Purpose:** Store AI-generated product mockups

```sql
CREATE TABLE generated_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  design_concept_id UUID REFERENCES design_concepts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, -- Supabase Storage URL
  prompt_used TEXT, -- The exact prompt that generated this image
  model_used VARCHAR(100), -- "nano-banana", "google-veo", etc.
  image_type VARCHAR(50), -- "lifestyle", "product_shot", "reddit_comparison"
  is_approved BOOLEAN DEFAULT false,
  approval_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_generated_city ON generated_images(city_id);
CREATE INDEX idx_generated_concept ON generated_images(design_concept_id);
CREATE INDEX idx_generated_approved ON generated_images(is_approved);
CREATE INDEX idx_generated_type ON generated_images(image_type);

-- Example Data
INSERT INTO generated_images (city_id, design_concept_id, image_url, prompt_used, model_used, image_type, is_approved) VALUES
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  (SELECT id FROM design_concepts WHERE concept_name = 'Seattle Minimal Pin'),
  'supabase-storage-url/seattle-coffee-shop-mockup.jpg',
  'Photorealistic lifestyle photography of young man in coffee shop...',
  'nano-banana',
  'lifestyle',
  true
);
```

---

### TABLE 9: `reddit_posts`
**Purpose:** Track Reddit posts and their performance

```sql
CREATE TABLE reddit_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  subreddit VARCHAR(100) NOT NULL,
  reddit_post_id VARCHAR(50), -- Reddit's post ID once posted
  post_title TEXT NOT NULL,
  post_body TEXT,
  image_1_id UUID REFERENCES generated_images(id),
  image_2_id UUID REFERENCES generated_images(id),
  comparison_image_url TEXT, -- Final comparison template URL
  status VARCHAR(50) DEFAULT 'queued', -- "queued", "posted", "archived"
  scheduled_post_time TIMESTAMP,
  actual_post_time TIMESTAMP,
  upvotes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reddit_city ON reddit_posts(city_id);
CREATE INDEX idx_reddit_subreddit ON reddit_posts(subreddit);
CREATE INDEX idx_reddit_status ON reddit_posts(status);
CREATE INDEX idx_reddit_scheduled ON reddit_posts(scheduled_post_time);
```

---

### TABLE 10: `reddit_comments`
**Purpose:** Store comments from Reddit posts for analysis

```sql
CREATE TABLE reddit_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reddit_post_id UUID REFERENCES reddit_posts(id) ON DELETE CASCADE,
  reddit_comment_id VARCHAR(50) NOT NULL, -- Reddit's comment ID
  author VARCHAR(100),
  comment_text TEXT NOT NULL,
  sentiment VARCHAR(50), -- "positive", "negative", "neutral", "question"
  design_preference VARCHAR(50), -- "option_1", "option_2", "both", "neither", "unclear"
  is_flagged BOOLEAN DEFAULT false, -- Flag important comments for review
  flag_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_post ON reddit_comments(reddit_post_id);
CREATE INDEX idx_comments_sentiment ON reddit_comments(sentiment);
CREATE INDEX idx_comments_preference ON reddit_comments(design_preference);
CREATE INDEX idx_comments_flagged ON reddit_comments(is_flagged);
```

---

### TABLE 11: `brand_assets`
**Purpose:** Store TMH brand files (logos, guidelines, templates)

```sql
CREATE TABLE brand_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_name VARCHAR(200) NOT NULL,
  asset_type VARCHAR(50), -- "logo", "color_palette", "font", "template", "guideline"
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_format VARCHAR(20), -- "svg", "png", "pdf", "ai", etc.
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0',
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_assets_type ON brand_assets(asset_type);
CREATE INDEX idx_assets_current ON brand_assets(is_current);

-- Example Data
INSERT INTO brand_assets (asset_name, asset_type, file_url, file_format, description) VALUES
('TMH Primary Logo', 'logo', 'supabase-storage-url/tmh-logo-primary.svg', 'svg', 'Main TMH logo with pin - vector format'),
('TMH Logo Black', 'logo', 'supabase-storage-url/tmh-logo-black.png', 'png', 'Primary logo black version - 4000x4000px'),
('TMH Color Palette', 'color_palette', 'supabase-storage-url/tmh-colors.pdf', 'pdf', 'Brand color specifications with hex codes');
```

---

### TABLE 12: `color_palettes`
**Purpose:** Store color schemes for different cities or collections

```sql
CREATE TABLE color_palettes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  palette_name VARCHAR(100) NOT NULL,
  primary_color VARCHAR(7), -- Hex code
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_palettes_city ON color_palettes(city_id);
CREATE INDEX idx_palettes_default ON color_palettes(is_default);

-- Example Data
INSERT INTO color_palettes (city_id, palette_name, primary_color, secondary_color, accent_color) VALUES
(
  (SELECT id FROM cities WHERE name = 'Seattle'),
  'Seattle Grunge',
  '#2C3E50', -- Dark gray
  '#1ABC9C', -- Teal
  '#F39C12'  -- Gold
),
(
  (SELECT id FROM cities WHERE name = 'Detroit'),
  'Detroit Motor',
  '#000000', -- Black
  '#C0C0C0', -- Silver
  '#B22222'  -- Firebrick red
);
```

---

### TABLE 13: `prompt_templates`
**Purpose:** Store reusable prompt templates with variables

```sql
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name VARCHAR(200) NOT NULL,
  category VARCHAR(50), -- "lifestyle", "product_shot", "reddit_comparison", "logo_only"
  prompt_text TEXT NOT NULL, -- Template with {{variable}} placeholders
  variables JSONB, -- Array of required variables and descriptions
  model_preference VARCHAR(100), -- Which AI model works best with this prompt
  quality_score INTEGER DEFAULT 50, -- 0-100 based on historical performance
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_prompts_category ON prompt_templates(category);
CREATE INDEX idx_prompts_quality ON prompt_templates(quality_score DESC);

-- Example Data
INSERT INTO prompt_templates (template_name, category, prompt_text, variables, model_preference) VALUES
(
  'Lifestyle Coffee Shop Scene',
  'lifestyle',
  'Photorealistic lifestyle photography of {{person_description}} in modern coffee shop, {{city_name}} urban atmosphere. Wearing {{hoodie_color}} premium pullover hoodie with embroidered logo on {{logo_placement}}: {{logo_description}}, {{embroidery_color}} thread. Shot on {{lens}}, {{lighting_style}}, 4K quality.',
  '{"variables": ["person_description", "city_name", "hoodie_color", "logo_placement", "logo_description", "embroidery_color", "lens", "lighting_style"]}'::jsonb,
  'nano-banana'
);
```

---

## ROW LEVEL SECURITY (RLS) POLICIES

```sql
-- Enable RLS on all tables
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_landmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_cultural_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_catchphrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Example policy (adjust based on your auth setup)
-- Allow authenticated users to read all data
CREATE POLICY "Allow authenticated read access" ON cities
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert/update (you can restrict this further)
CREATE POLICY "Allow authenticated write access" ON cities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Repeat similar policies for other tables as needed
```

---

## SUPABASE STORAGE BUCKETS

Create these storage buckets in Supabase:

1. **`brand-assets`** - Logo files, guidelines, templates
2. **`reference-images`** - City reference photos, inspiration images
3. **`generated-images`** - AI-generated mockups
4. **`reddit-comparison-templates`** - Final comparison images for posting

---

## DATABASE FUNCTIONS

### Function 1: Get Complete City Context
**Purpose:** Returns all context for a city in one query

```sql
CREATE OR REPLACE FUNCTION get_city_context(city_name_param VARCHAR)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'city', (SELECT row_to_json(c) FROM cities c WHERE c.name = city_name_param),
    'landmarks', (SELECT json_agg(row_to_json(l)) FROM city_landmarks l WHERE l.city_id = (SELECT id FROM cities WHERE name = city_name_param)),
    'cultural_elements', (SELECT json_agg(row_to_json(ce)) FROM city_cultural_elements ce WHERE ce.city_id = (SELECT id FROM cities WHERE name = city_name_param)),
    'events', (SELECT json_agg(row_to_json(e)) FROM city_events e WHERE e.city_id = (SELECT id FROM cities WHERE name = city_name_param)),
    'catchphrases', (SELECT json_agg(row_to_json(cp)) FROM city_catchphrases cp WHERE cp.city_id = (SELECT id FROM cities WHERE name = city_name_param)),
    'color_palette', (SELECT row_to_json(cp) FROM color_palettes cp WHERE cp.city_id = (SELECT id FROM cities WHERE name = city_name_param) AND cp.is_default = true)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Usage: SELECT get_city_context('Seattle');
```

### Function 2: Log Prompt Usage
**Purpose:** Track which prompts are used and update usage count

```sql
CREATE OR REPLACE FUNCTION log_prompt_usage(template_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE prompt_templates
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = template_id_param;
END;
$$;
```

---

## API ENDPOINTS TO EXPOSE

These are the key queries your frontend/n8n will make:

1. **GET /cities** - List all active cities
2. **GET /cities/:id/context** - Get complete city context (uses function above)
3. **GET /design-concepts?city_id=:id&status=approved** - Get approved designs for a city
4. **POST /generated-images** - Save newly generated image
5. **GET /generated-images?city_id=:id&is_approved=true** - Get approved mockups
6. **POST /reddit-posts** - Create new Reddit post record
7. **GET /reddit-posts/:id/comments** - Get all comments for a post
8. **GET /brand-assets?asset_type=logo&is_current=true** - Get current logo files
9. **GET /prompt-templates?category=lifestyle** - Get prompts by category
10. **POST /reference-images** - Upload new reference image

---

## USAGE EXAMPLE: n8n Workflow Query

When n8n needs to generate an image for Seattle:

```javascript
// 1. Get city context
const cityContext = await supabase
  .rpc('get_city_context', { city_name_param: 'Seattle' });

// 2. Get approved design concepts for Seattle
const { data: concepts } = await supabase
  .from('design_concepts')
  .select('*')
  .eq('city_id', cityContext.city.id)
  .eq('status', 'approved');

// 3. Get prompt template
const { data: promptTemplate } = await supabase
  .from('prompt_templates')
  .select('*')
  .eq('category', 'lifestyle')
  .order('quality_score', { ascending: false })
  .limit(1);

// 4. Build prompt by filling variables with city context
// 5. Send to OpenRouter/AI model
// 6. Save generated image back to database
```

---

## NEXT STEPS

1. Run SQL schema in Supabase SQL Editor
2. Create storage buckets
3. Seed initial data (cities, brand assets, prompt templates)
4. Set up RLS policies based on your auth requirements
5. Test queries from frontend/n8n

This schema is production-ready and fully supports your workflow!
