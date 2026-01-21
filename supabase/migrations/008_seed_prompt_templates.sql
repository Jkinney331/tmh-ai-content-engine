-- 008_seed_prompt_templates.sql
-- Seeds initial prompt templates from TMH Knowledge Base

-- Insert prompt templates
INSERT INTO prompt_templates (
  id,
  name,
  description,
  template,
  category,
  variables,
  model_recommendations,
  quality_score,
  example_output
) VALUES
-- Product Photography Templates
(
  gen_random_uuid(),
  'Product Flat Lay - Hero Shot (Front)',
  'Main product image for homepage hero and primary e-commerce listings',
  'Professional overhead product photography of premium pullover hoodie laid flat on clean white surface, perfect symmetry, studio lighting.

{{HOODIE_COLOR}} colored heavyweight cotton fleece hoodie with drawstrings visible, hood laid flat. Center chest features embroidered design: {{DESIGN_DESCRIPTION}}, {{EMBROIDERY_COLOR}} embroidery thread, approximately {{SIZE_INCHES}} inches wide, premium quality stitching visible.

TMH Clothing logo embroidered on right wrist cuff - "TMH" in bold block letters above "Clothing" in cursive script, {{EMBROIDERY_COLOR}} thread.

Fabric: 400GSM cotton blend, soft brushed fleece interior, quality drawstring hood with metal aglets, ribbed cuffs and waistband, kangaroo pocket.

Commercial product photography, no shadows, high detail, shot on medium format camera, crystal clear focus on embroidery, 4K quality, e-commerce ready.',
  'product',
  ARRAY['HOODIE_COLOR', 'DESIGN_DESCRIPTION', 'EMBROIDERY_COLOR', 'SIZE_INCHES'],
  jsonb_build_object(
    'primary', 'gemini-nano-banana',
    'secondary', 'openai-image',
    'comparison_mode', true
  ),
  95,
  'https://example.com/flat-lay-front.jpg'
),

(
  gen_random_uuid(),
  'Product Flat Lay - Back View',
  'Secondary product image showing back design details',
  'Professional overhead product photography of premium pullover hoodie laid flat showing back view on clean white surface, perfect symmetry, studio lighting.

{{HOODIE_COLOR}} colored heavyweight hoodie, back view. {{BACK_DESIGN_DESCRIPTION}} embroidered in {{EMBROIDERY_COLOR}} thread on upper back between shoulder blades, approximately {{SIZE_INCHES}} inches.

TMH Clothing logo embroidered at back neck below collar - "TMH" in bold block letters above "Clothing" in cursive script.

Fabric: 400GSM cotton blend, premium construction visible. Commercial product photography, no harsh shadows, high detail, 4K quality, e-commerce ready.',
  'product',
  ARRAY['HOODIE_COLOR', 'BACK_DESIGN_DESCRIPTION', 'EMBROIDERY_COLOR', 'SIZE_INCHES'],
  jsonb_build_object(
    'primary', 'gemini-nano-banana',
    'secondary', 'openai-image',
    'comparison_mode', true
  ),
  90,
  'https://example.com/flat-lay-back.jpg'
),

(
  gen_random_uuid(),
  'Ghost Mannequin - Front View',
  'Product page display showing fit and drape',
  'Professional ghost mannequin product photography of premium pullover hoodie on invisible mannequin form, front view, centered composition, pure white background.

{{HOODIE_COLOR}} heavyweight cotton fleece hoodie, drawstrings hanging naturally. {{PLACEMENT}} features embroidered logo: {{DESIGN_DESCRIPTION}}, {{EMBROIDERY_COLOR}} embroidery thread, approximately {{SIZE_INCHES}} inches wide, premium subtle branding.

TMH Clothing logo on right wrist cuff in {{EMBROIDERY_COLOR}} thread.

Studio lighting, no harsh shadows, commercial fashion photography, sharp detail on embroidery, shot on 85mm lens, 4K quality, Amazon/Shopify product image style.',
  'product',
  ARRAY['HOODIE_COLOR', 'PLACEMENT', 'DESIGN_DESCRIPTION', 'EMBROIDERY_COLOR', 'SIZE_INCHES'],
  jsonb_build_object(
    'primary', 'gemini-nano-banana',
    'secondary', 'openai-image',
    'comparison_mode', true
  ),
  92,
  'https://example.com/ghost-mannequin-front.jpg'
),

(
  gen_random_uuid(),
  'Ghost Mannequin - Back View',
  'Product page back view showing design placement',
  'Professional ghost mannequin product photography of premium pullover hoodie on invisible form, back view showing shoulder and neck area, pure white background.

{{HOODIE_COLOR}} heavyweight hoodie. {{BACK_DESIGN_DESCRIPTION}} positioned on upper back between shoulder blades, {{EMBROIDERY_COLOR}} embroidery thread, approximately {{SIZE_INCHES}} inches.

TMH Clothing logo embroidered at back neck below collar.

Studio lighting, clean commercial photography, detailed embroidery visible, shot on 85mm, centered composition, 4K quality, e-commerce ready.',
  'product',
  ARRAY['HOODIE_COLOR', 'BACK_DESIGN_DESCRIPTION', 'EMBROIDERY_COLOR', 'SIZE_INCHES'],
  jsonb_build_object(
    'primary', 'gemini-nano-banana',
    'secondary', 'openai-image',
    'comparison_mode', true
  ),
  88,
  'https://example.com/ghost-mannequin-back.jpg'
),

(
  gen_random_uuid(),
  'Embroidery Close-Up (Macro)',
  'Detail shot showing premium embroidery quality',
  'Extreme macro photography close-up of embroidered logo on premium hoodie fabric, showing thread texture and stitching quality in hyper detail.

{{DESIGN_DESCRIPTION}} embroidered in {{EMBROIDERY_COLOR}} thread on {{HOODIE_COLOR}} fabric. Each individual thread visible, showing premium stitch density and craftsmanship. Fabric texture of 400GSM cotton fleece visible surrounding the embroidery.

Ring light creating even illumination, extreme sharpness, product detail photography, 4K quality, shows quality worth the premium price.',
  'product',
  ARRAY['DESIGN_DESCRIPTION', 'EMBROIDERY_COLOR', 'HOODIE_COLOR'],
  jsonb_build_object(
    'primary', 'gemini-nano-banana',
    'secondary', 'openai-image',
    'comparison_mode', true
  ),
  93,
  'https://example.com/embroidery-macro.jpg'
),

-- Lifestyle Photography Templates
(
  gen_random_uuid(),
  'Urban Street - Single Model',
  'Social media and lookbook lifestyle photography',
  'Professional streetwear fashion photoshoot. {{MODEL_DEMO}} wearing {{HOODIE_COLOR}} premium pullover hoodie with embroidered {{DESIGN_NAME}} design on {{PLACEMENT}} in {{EMBROIDERY_COLOR}} thread, approximately {{SIZE_INCHES}} inches.

Model standing on {{CITY}} street with {{LANDMARK_OR_CONTEXT}} visible in background. {{POSE_DESCRIPTION}}. TMH Clothing logo embroidered on right wrist in {{EMBROIDERY_COLOR}} thread.

{{LIGHTING}} lighting, premium streetwear photography, authentic urban vibe, shot on {{LENS}} lens, shallow depth of field, {{COLOR_GRADE}} color tones, 4K quality.

Model styled with {{PANTS_DESCRIPTION}}, {{SHOES}}, {{ACCESSORIES}}.',
  'lifestyle',
  ARRAY['MODEL_DEMO', 'HOODIE_COLOR', 'DESIGN_NAME', 'PLACEMENT', 'EMBROIDERY_COLOR', 'SIZE_INCHES', 'CITY', 'LANDMARK_OR_CONTEXT', 'POSE_DESCRIPTION', 'LIGHTING', 'LENS', 'COLOR_GRADE', 'PANTS_DESCRIPTION', 'SHOES', 'ACCESSORIES'],
  jsonb_build_object(
    'primary', 'gemini-nano-banana',
    'secondary', 'openai-image',
    'comparison_mode', true
  ),
  91,
  'https://example.com/urban-single.jpg'
),

(
  gen_random_uuid(),
  'Landmark Context Shot',
  'City-specific marketing with iconic location',
  'Professional lifestyle photography of {{MODEL_DEMO}} wearing {{HOODIE_COLOR}} {{DESIGN_NAME}} hoodie at iconic {{CITY}} location.

Model positioned at {{SPECIFIC_LANDMARK}}, {{POSE_DESCRIPTION}}. Embroidered design clearly visible: {{DESIGN_DESCRIPTION}} in {{EMBROIDERY_COLOR}} thread on {{PLACEMENT}}.

{{LIGHTING}} lighting, landmark visible but hoodie is hero, shot on {{LENS}} lens, premium streetwear editorial style, 4K quality.

Styled: {{FULL_OUTFIT_DESCRIPTION}}',
  'lifestyle',
  ARRAY['MODEL_DEMO', 'HOODIE_COLOR', 'DESIGN_NAME', 'CITY', 'SPECIFIC_LANDMARK', 'POSE_DESCRIPTION', 'DESIGN_DESCRIPTION', 'EMBROIDERY_COLOR', 'PLACEMENT', 'LIGHTING', 'LENS', 'FULL_OUTFIT_DESCRIPTION'],
  jsonb_build_object(
    'primary', 'gemini-nano-banana',
    'secondary', 'openai-image',
    'comparison_mode', true
  ),
  89,
  'https://example.com/landmark-shot.jpg'
),

(
  gen_random_uuid(),
  'Group Shot - Multiple Hoodies',
  'Collection showcase with diverse models',
  'Professional streetwear fashion photoshoot with {{NUMBER}} people in {{CITY}} urban setting.

Person 1: {{MODEL_DEMO_1}} wearing {{HOODIE_1_COLOR}} {{DESIGN_1}} hoodie
Person 2: {{MODEL_DEMO_2}} wearing {{HOODIE_2_COLOR}} {{DESIGN_2}} hoodie
Person 3: {{MODEL_DEMO_3}} wearing {{HOODIE_3_COLOR}} {{DESIGN_3}} hoodie

Group positioned naturally at {{LOCATION}}, showing genuine interaction, not posed. {{LIGHTING}} lighting, each hoodie design clearly visible. Shot on {{LENS}}, streetwear campaign aesthetic, 4K quality.

IMPORTANT: Each person has different pants, different shoes (from approved grail list), different accessories. No matching outfits except the TMH hoodies.',
  'lifestyle',
  ARRAY['NUMBER', 'CITY', 'MODEL_DEMO_1', 'HOODIE_1_COLOR', 'DESIGN_1', 'MODEL_DEMO_2', 'HOODIE_2_COLOR', 'DESIGN_2', 'MODEL_DEMO_3', 'HOODIE_3_COLOR', 'DESIGN_3', 'LOCATION', 'LIGHTING', 'LENS'],
  jsonb_build_object(
    'primary', 'gemini-nano-banana',
    'secondary', 'openai-image',
    'comparison_mode', true
  ),
  87,
  'https://example.com/group-shot.jpg'
),

-- Video Ad Templates
(
  gen_random_uuid(),
  'Product Reveal - Slow Rotation',
  'Product video with 360-degree rotation for website hero',
  'Cinematic 5-second clip of {{HOODIE_COLOR}} premium hoodie slowly rotating on invisible display form against {{BACKGROUND}}.

Hoodie rotating 180 degrees left to right, showing front embroidered {{DESIGN_NAME}} design transitioning to back design. Embroidery detail catching light as it turns.

Camera: Static, centered
Lighting: Soft studio lighting with rim light for depth
Movement: Slow, smooth rotation (approx 36 degrees per second)
Quality: 4K, cinematic, premium product video aesthetic

NO TEXT ON HOODIE - add graphics in post-production.',
  'video',
  ARRAY['HOODIE_COLOR', 'BACKGROUND', 'DESIGN_NAME'],
  jsonb_build_object(
    'primary', 'sora-2',
    'secondary', 'gemini-video',
    'comparison_mode', true,
    'duration', '4-5 seconds'
  ),
  94,
  'https://example.com/product-rotation.mp4'
),

(
  gen_random_uuid(),
  'Lifestyle Walk - City Street',
  'Social ad with model walking in urban environment',
  'Cinematic 5-second clip of {{MODEL_DEMO}} walking confidently down {{CITY}} street wearing {{HOODIE_COLOR}} hoodie.

{{SPECIFIC_LOCATION_DETAILS}} visible in background. Model walks toward camera with natural stride, hoodie visible. {{TIME_OF_DAY}} lighting, {{WEATHER_IF_ANY}}.

Camera: Slow tracking backward as model approaches
Lighting: {{LIGHTING_STYLE}}
Movement: Natural walking pace, confident energy
Quality: 4K, 24fps cinematic, streetwear campaign aesthetic

NO TEXT ON HOODIE - add graphics in post-production.',
  'video',
  ARRAY['MODEL_DEMO', 'CITY', 'HOODIE_COLOR', 'SPECIFIC_LOCATION_DETAILS', 'TIME_OF_DAY', 'WEATHER_IF_ANY', 'LIGHTING_STYLE'],
  jsonb_build_object(
    'primary', 'sora-2',
    'secondary', 'gemini-video',
    'comparison_mode', true,
    'duration', '4-5 seconds'
  ),
  90,
  'https://example.com/lifestyle-walk.mp4'
),

(
  gen_random_uuid(),
  'Hero Moment - Static with Movement',
  'Ad opener with environmental movement around static subject',
  'Cinematic 4-second clip of {{MODEL_DEMO}} standing still at {{LOCATION}} wearing {{HOODIE_COLOR}} {{DESIGN_NAME}} hoodie.

Model faces camera with confident expression, subtle movement: wind catching hood slightly, drawstrings swaying gently. {{CITY}} environment alive around them (people passing in blur, cars in background).

Camera: Slow push-in from medium shot to medium close-up
Lighting: {{LIGHTING_STYLE}}
Movement: Subject still, environment active
Quality: 4K, cinematic depth of field, premium aesthetic

NO TEXT ON HOODIE - add graphics in post-production.',
  'video',
  ARRAY['MODEL_DEMO', 'LOCATION', 'HOODIE_COLOR', 'DESIGN_NAME', 'CITY', 'LIGHTING_STYLE'],
  jsonb_build_object(
    'primary', 'sora-2',
    'secondary', 'gemini-video',
    'comparison_mode', true,
    'duration', '3-4 seconds'
  ),
  92,
  'https://example.com/hero-moment.mp4'
),

-- City-Specific Templates
(
  gen_random_uuid(),
  'NYC Pizza Shop Interior',
  'NYC-specific Johns Pizzeria Times Square scene',
  'Cinematic 5-second clip inside John''s Pizzeria Times Square beneath the stained glass dome. Camera slowly pushes in on three friends at a round table.

Black man late 20s in black YERR hoodie center, Latina woman early 30s in green FUHGEDDABOUDIT hoodie to his left, White woman late 20s in cream DEADASS hoodie to his right.

Friends laughing together, pizza on table, cathedral ceiling with stained glass dome visible above. Warm golden interior lighting, vintage chandeliers in background.

Camera: Slow push in, eye level
Lighting: Warm interior, stained glass color cast
Movement: Subtle character movement, natural laughter
Quality: 4K, cinematic, authentic NYC dining moment

NO TEXT ON HOODIES - add graphics in post-production.',
  'video',
  ARRAY[],
  jsonb_build_object(
    'primary', 'sora-2',
    'secondary', 'gemini-video',
    'comparison_mode', true,
    'duration', '5 seconds',
    'city', 'NYC'
  ),
  96,
  'https://example.com/nyc-pizza-shop.mp4'
),

(
  gen_random_uuid(),
  'Detroit Spirit Statue Greeting',
  'Detroit-specific Spirit of Detroit monument scene',
  'Cinematic 5-second clip of two friends greeting each other with "What up doe" energy at Spirit of Detroit statue.

Black male mid-20s in black WHAT UP DOE hoodie, mixed-race female late 20s in maize yellow THE D hoodie. They embrace/dap up warmly in front of the iconic bronze statue.

Golden hour lighting, Detroit skyline visible. Camera captures the warmth of the greeting.

Camera: Medium shot, slight movement toward subjects
Lighting: Golden hour, warm Detroit evening
Movement: Natural greeting, authentic connection
Quality: 4K, cinematic, soulful energy

NO TEXT ON HOODIES - add graphics in post-production.',
  'video',
  ARRAY[],
  jsonb_build_object(
    'primary', 'sora-2',
    'secondary', 'gemini-video',
    'comparison_mode', true,
    'duration', '5 seconds',
    'city', 'Detroit'
  ),
  95,
  'https://example.com/detroit-spirit.mp4'
),

-- Design Generation Templates
(
  gen_random_uuid(),
  'New City Research',
  'Template for onboarding a new city to the TMH collection',
  'I''m adding {{CITY_NAME}} to the TMH collection. Research and provide:

1. CITY NICKNAMES
- Official nicknames
- Street/local nicknames
- What natives actually call it

2. SLANG DICTIONARY (20+ terms)
For each term provide:
- The word/phrase
- What it means
- Design potential (⭐ rating 1-5)
- Example usage

3. LANDMARKS (Tiered)
Tier 1 (Primary backgrounds): [3-5 iconic locations]
Tier 2 (Neighborhood): [5-7 local spots]
Tier 3 (Cultural): [5-7 insider locations]

4. SPORTS TEAMS & COLORS
Team name | Colors | Design application

5. CULTURAL TOUCHPOINTS
- Music history
- Food culture
- Historical significance
- Local heroes
- "If you know, you know" references

6. DESIGN RECOMMENDATIONS
Suggest 5 flagship designs with:
- Design name
- Meaning
- Vibe
- Recommended colorways
- Front/back concepts

7. MODEL DEMOGRAPHICS
Who should model this city''s collection? Ethnic breakdown, age range, style references.

8. LOCATION BANKS
5 specific locations for photo backgrounds with exact addresses/descriptions.',
  'research',
  ARRAY['CITY_NAME'],
  jsonb_build_object(
    'primary', 'claude',
    'model', 'claude-3-opus'
  ),
  100,
  NULL
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_quality_score ON prompt_templates(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_name ON prompt_templates(name);

-- Add metadata
COMMENT ON TABLE prompt_templates IS 'Master prompt library seeded from TMH AI Content Engine Knowledge Base';