# That's My Hoodie - Master Prompt Library
## AI Image Generation Prompt Templates

---

## OVERVIEW

This library contains all prompt templates for generating consistent, high-quality TMH content across different scenarios. Each template uses variables that get filled with data from the Supabase knowledge base.

**Key Principles:**
- **Consistency** - Same quality/style across all cities
- **Modularity** - Swap variables without rewriting prompts
- **Specificity** - Detailed enough to get exact results
- **Flexibility** - Works with multiple AI models (Nano Banana, Google Veo, Sora)

---

## VARIABLE NAMING CONVENTION

All variables use `{{variable_name}}` format and pull from Supabase tables:

**City Variables:**
- `{{city_name}}` - From cities.name
- `{{area_code}}` - From cities.area_code
- `{{city_nickname}}` - From cities.nickname
- `{{landmark_name}}` - From city_landmarks.name
- `{{cultural_element}}` - From city_cultural_elements.element
- `{{city_vibe}}` - Derived from cultural_elements + description

**Design Variables:**
- `{{hoodie_color}}` - From design_concepts.design_elements
- `{{logo_description}}` - From design_concepts.description
- `{{logo_placement}}` - From design_concepts.design_elements
- `{{embroidery_color}}` - From design_concepts.design_elements
- `{{logo_size_inches}}` - From design_concepts.design_elements

**Model Variables:**
- `{{person_age}}` - e.g., "late 20s", "early 30s"
- `{{person_gender}}` - e.g., "male", "female"
- `{{person_ethnicity}}` - e.g., "Asian", "Black", "Latino", "White"
- `{{person_description}}` - Combined description

**Photography Variables:**
- `{{lens}}` - e.g., "50mm", "35mm", "85mm"
- `{{lighting_style}}` - e.g., "golden hour", "natural window light", "overcast"
- `{{setting}}` - e.g., "urban street", "coffee shop", "rooftop"

---

## PROMPT TEMPLATE LIBRARY

### CATEGORY 1: LIFESTYLE SCENES

---

#### TEMPLATE 1A: Urban Street Scene

**Use Case:** Street photography lifestyle shots  
**Model Preference:** Nano Banana  
**Quality Score:** 90/100

```
Premium lifestyle photography of {{person_description}} on urban {{city_name}} street, {{landmark_name}} visible in background, {{lighting_style}}, authentic city atmosphere.

Wearing {{hoodie_color}} premium pullover hoodie with embroidered logo on {{logo_placement}}: {{logo_description}}, {{embroidery_color}} embroidery thread, approximately {{logo_size_inches}} inches, clean sophisticated design.

Shot on {{lens}} lens, street photography style, natural movement, premium streetwear aesthetic, {{city_vibe}} energy, 4K quality. Styled in dark jeans and sneakers, natural confident expression.
```

**Required Variables:**
- person_description, city_name, landmark_name, lighting_style, hoodie_color, logo_placement, logo_description, embroidery_color, logo_size_inches, lens, city_vibe

**Example Filled Prompt (Seattle):**
```
Premium lifestyle photography of Asian male in his late 20s on urban Seattle street, Space Needle visible in background, overcast natural lighting, authentic city atmosphere.

Wearing cream premium pullover hoodie with embroidered logo on left chest: minimalist "TMH" typography with geometric location pin above, charcoal embroidery thread, approximately 3 inches, clean sophisticated design.

Shot on 35mm lens, street photography style, natural movement, premium streetwear aesthetic, rainy city resilience energy, 4K quality. Styled in dark jeans and sneakers, natural confident expression.
```

---

#### TEMPLATE 1B: Coffee Shop Interior

**Use Case:** Cozy lifestyle shots  
**Model Preference:** Nano Banana  
**Quality Score:** 95/100

```
Premium lifestyle photography of {{person_description}} in modern {{city_name}} coffee shop, large windows showing urban street outside, {{lighting_style}}, cozy authentic atmosphere.

Wearing {{hoodie_color}} premium pullover hoodie with embroidered logo on {{logo_placement}}: {{logo_description}}, {{embroidery_color}} embroidery thread, approximately {{logo_size_inches}} inches, understated luxury branding.

Shot on {{lens}} lens, shallow depth of field, soft natural lighting, lifestyle editorial style, {{city_vibe}} vibe, 4K quality. Model with coffee cup and laptop, natural relaxed moment.
```

**Required Variables:**
- person_description, city_name, lighting_style, hoodie_color, logo_placement, logo_description, embroidery_color, logo_size_inches, lens, city_vibe

---

#### TEMPLATE 1C: Rooftop Overlook

**Use Case:** Aspirational city skyline shots  
**Model Preference:** Nano Banana  
**Quality Score:** 92/100

```
Premium lifestyle photography of {{person_description}} on modern rooftop deck with dramatic {{city_name}} skyline in background, {{landmark_name}} prominent in view, {{lighting_style}}, urban sunset atmosphere.

Wearing {{hoodie_color}} premium pullover hoodie with embroidered logo on {{logo_placement}}: {{logo_description}}, {{embroidery_color}} embroidery thread, approximately {{logo_size_inches}} inches, bold statement piece.

Shot on {{lens}} lens, beautiful bokeh background, cinematic composition, premium streetwear campaign aesthetic, {{city_vibe}} pride, 4K quality. Model leaning on railing, confident natural pose.
```

---

#### TEMPLATE 1D: Sporting Event

**Use Case:** Athletic/team spirit shots  
**Model Preference:** Nano Banana  
**Quality Score:** 88/100

```
Premium lifestyle photography of {{person_description}} at {{city_name}} sporting event, {{primary_sports_team}} stadium atmosphere, crowd visible in soft focus background, {{lighting_style}}, energetic authentic vibe.

Wearing {{hoodie_color}} premium pullover hoodie with embroidered logo on {{logo_placement}}: {{logo_description}}, {{embroidery_color}} embroidery thread, approximately {{logo_size_inches}} inches, hometown pride statement.

Shot on {{lens}} lens, sports lifestyle photography style, natural authentic energy, premium athletic wear aesthetic, {{city_vibe}} spirit, 4K quality. Model cheering or holding team gear.
```

**Additional Variable:**
- primary_sports_team (from cities table)

---

#### TEMPLATE 1E: Urban Nighttime

**Use Case:** Moody evening city shots  
**Model Preference:** Nano Banana  
**Quality Score:** 90/100

```
Premium lifestyle photography portrait of {{person_description}} on {{city_name}} street at night, {{landmark_name}} neon signs and street lights creating ambient glow in background, urban nightlife atmosphere, confident direct gaze.

Wearing {{hoodie_color}} premium pullover hoodie with embroidered logo on {{logo_placement}}: {{logo_description}}, {{embroidery_color}} embroidery thread catching ambient light, approximately {{logo_size_inches}} inches, bold nighttime presence.

Shot on {{lens}} lens, wide aperture for bokeh, neon lights creating color in background, moody premium streetwear editorial style, {{city_vibe}} after dark, cinematic color grading, 4K quality.
```

---

### CATEGORY 2: PRODUCT SHOTS

---

#### TEMPLATE 2A: Flat Lay Product

**Use Case:** E-commerce overhead shots  
**Model Preference:** Midjourney or Stable Diffusion  
**Quality Score:** 93/100

```
Professional overhead product photography of premium pullover hoodie laid flat on clean white surface, perfect symmetry, studio lighting.

{{hoodie_color}} colored heavyweight cotton fleece hoodie with drawstrings visible, hood laid flat. {{logo_placement}} features embroidered logo: {{logo_description}}, {{embroidery_color}} embroidery thread, approximately {{logo_size_inches}} inches wide, premium quality stitching visible.

Commercial product photography, no shadows, high detail, shot on medium format camera, crystal clear focus on embroidery, 4K quality, e-commerce ready.
```

---

#### TEMPLATE 2B: Ghost Mannequin

**Use Case:** Website product pages  
**Model Preference:** Midjourney  
**Quality Score:** 95/100

```
Professional ghost mannequin product photography of premium pullover hoodie on invisible mannequin form, {{view_angle}} view, centered composition, pure white background.

{{hoodie_color}} heavyweight cotton fleece hoodie, drawstrings hanging naturally. {{logo_placement}} features embroidered logo: {{logo_description}}, {{embroidery_color}} embroidery thread, approximately {{logo_size_inches}} inches, premium quality branding.

Studio lighting, no harsh shadows, commercial fashion photography, sharp detail on logo embroidery, shot on 85mm lens, 4K quality, Amazon/Shopify product image style.
```

**Additional Variable:**
- view_angle (front, back, side, 3/4)

---

#### TEMPLATE 2C: Extreme Logo Close-Up

**Use Case:** Detail shots showcasing embroidery quality  
**Model Preference:** Midjourney or Stable Diffusion  
**Quality Score:** 91/100

```
Extreme macro photography close-up of embroidered logo on premium hoodie fabric, showing thread texture and stitching quality in hyper detail.

Logo design: {{logo_description}}, embroidered on {{hoodie_color}} heavyweight cotton fleece, {{embroidery_color}} thread creating contrast, visible individual thread strands, professional embroidery quality, satin stitch technique visible.

Macro lens photography, dramatic side lighting to show texture dimension, fabric weave visible, embroidery thread texture prominent, shot on 100mm macro, f/2.8, ultra high detail, 4K quality.
```

---

#### TEMPLATE 2D: Lifestyle Product (Hanging)

**Use Case:** Retail catalog style  
**Model Preference:** Midjourney  
**Quality Score:** 89/100

```
Professional product photography of premium pullover hoodie hanging on {{hanger_type}} against {{background_color}} background, {{view_angle}} view, perfectly centered.

{{hoodie_color}} heavyweight hoodie with visible texture detail, drawstrings {{drawstring_position}}. {{logo_placement}} features embroidered logo: {{logo_description}}, {{embroidery_color}} embroidery thread, approximately {{logo_size_inches}} inches.

Studio lighting, crisp shadows, commercial fashion photography, logo embroidery in sharp detail, shot on 85mm, high contrast, 4K quality, premium brand catalog style.
```

**Additional Variables:**
- hanger_type (wooden, black matte, chrome)
- background_color (white, gray, textured wall)
- drawstring_position (tied in knot, hanging loose, tucked)

---

### CATEGORY 3: REDDIT COMPARISON TEMPLATES

---

#### TEMPLATE 3A: Side-by-Side Comparison

**Use Case:** Reddit voting posts  
**Model Preference:** Nano Banana (or Photoshop composite)  
**Quality Score:** 94/100

```
Professional lifestyle photography composite showing two people side by side in {{setting}}, {{city_name}} atmosphere, {{lighting_style}}.

LEFT PERSON: {{person_1_description}} wearing {{hoodie_1_color}} premium pullover hoodie with embroidered logo on {{logo_1_placement}}: {{logo_1_description}}, {{embroidery_1_color}} thread, approximately {{logo_1_size}} inches.

RIGHT PERSON: {{person_2_description}} wearing {{hoodie_2_color}} premium pullover hoodie with embroidered logo on {{logo_2_placement}}: {{logo_2_description}}, {{embroidery_2_color}} thread, approximately {{logo_2_size}} inches.

Both in natural poses, {{city_name}} landmarks visible in background, premium streetwear photography, authentic urban vibe, shot on {{lens}}, 4K quality. Clear view of both logos.
```

**Required Variables:**
- setting, city_name, lighting_style, person_1_description, person_2_description, hoodie_1_color, hoodie_2_color, logo_1_placement, logo_2_placement, logo_1_description, logo_2_description, embroidery_1_color, embroidery_2_color, logo_1_size, logo_2_size, lens

**Example Filled (Seattle):**
```
Professional lifestyle photography composite showing two people side by side in downtown Seattle street, overcast moody atmosphere, natural lighting.

LEFT PERSON: Asian male in late 20s wearing cream premium pullover hoodie with embroidered logo on center chest: minimalist "TMH" with geometric pin above, charcoal thread, approximately 4 inches.

RIGHT PERSON: Black female in early 30s wearing black premium pullover hoodie with embroidered logo on left chest: "TMH" with pin and subtle hoodie outline, white thread, approximately 3 inches.

Both in natural poses, Pike Place Market visible in background, premium streetwear photography, authentic urban vibe, shot on 35mm, 4K quality. Clear view of both logos.
```

---

#### TEMPLATE 3B: Front and Back Comparison

**Use Case:** Showing front vs back placement  
**Model Preference:** Nano Banana  
**Quality Score:** 92/100

```
Professional lifestyle photography composite showing same person in two views, {{setting}}, {{city_name}} background, {{lighting_style}}.

LEFT IMAGE - FRONT VIEW: {{person_description}} facing camera, wearing {{hoodie_color}} premium pullover hoodie with embroidered logo on {{logo_front_placement}}: {{logo_front_description}}, {{embroidery_color}} thread, approximately {{logo_size_inches}} inches.

RIGHT IMAGE - BACK VIEW: Same person from behind, showing {{logo_back_placement}}: {{logo_back_description}}, {{embroidery_color}} thread, approximately {{logo_size_inches}} inches.

{{city_name}} skyline or landmark visible in background, premium streetwear campaign aesthetic, shot on {{lens}}, 4K quality.
```

---

### CATEGORY 4: LOGO DESIGN ONLY

---

#### TEMPLATE 4A: Minimal Logo Concept

**Use Case:** Pure logo design generation  
**Model Preference:** Midjourney or DALL-E  
**Quality Score:** 87/100

```
Professional vector logo design for "That's My Hoodie" streetwear brand representing {{city_name}} hometown pride.

Design elements: {{logo_elements}}, {{logo_style}} aesthetic, {{color_count}} color design using {{color_palette}}.

Embroidery-friendly, works at 1-inch scale, clean iconic mark, premium sporty luxury feel inspired by {{brand_references}}. Vector-style, high contrast, timeless design.
```

**Variables:**
- city_name
- logo_elements (e.g., "geometric location pin, TMH monogram, subtle city skyline")
- logo_style (e.g., "minimalist", "technical", "heritage badge")
- color_count (e.g., "single", "two", "three")
- color_palette (from color_palettes table)
- brand_references (e.g., "Moncler, Stone Island, Arc'teryx")

---

#### TEMPLATE 4B: Logo Variation Generator

**Use Case:** Creating multiple logo options at once  
**Model Preference:** Midjourney with --v 6 parameter  
**Quality Score:** 85/100

```
Four professional logo design variations for "That's My Hoodie" {{city_name}} collection, arranged in 2x2 grid on white background.

All variations incorporate {{core_elements}} but with different {{variation_focus}}.

Top Left: {{variation_1_description}}
Top Right: {{variation_2_description}}
Bottom Left: {{variation_3_description}}
Bottom Right: {{variation_4_description}}

All embroidery-friendly, premium sporty luxury aesthetic, {{color_palette}} color scheme, vector-style clarity, high detail.
```

---

### CATEGORY 5: VIDEO PROMPTS (For Sora/Google Veo)

---

#### TEMPLATE 5A: City Walk Video

**Use Case:** Short promotional clips  
**Model Preference:** Google Veo or Sora  
**Quality Score:** TBD (New feature)

```
5-second premium lifestyle video of {{person_description}} walking through downtown {{city_name}}, {{landmark_name}} visible in background, {{lighting_style}}.

Wearing {{hoodie_color}} premium pullover hoodie with embroidered logo clearly visible on {{logo_placement}}: {{logo_description}}, {{embroidery_color}} thread.

Smooth cinematic camera movement following subject, shallow depth of field, premium streetwear campaign aesthetic, {{city_vibe}} energy, shot on cinema camera, 4K 60fps.
```

---

#### TEMPLATE 5B: Logo Reveal Animation

**Use Case:** Social media content  
**Model Preference:** Sora  
**Quality Score:** TBD

```
3-second close-up video of embroidered logo on premium {{hoodie_color}} hoodie.

Logo: {{logo_description}}, {{embroidery_color}} embroidery thread. Camera slowly pushes in on logo detail, then pulls out to reveal full hoodie on person in {{city_name}} setting.

Cinematic lighting, macro detail visible, smooth camera movement, premium brand reveal aesthetic, 4K quality.
```

---

## CONSISTENCY GUIDELINES

### Photography Style Rules

**Lighting:**
- Natural lighting preferred (golden hour, overcast, window light)
- Avoid harsh artificial lighting unless nighttime scene
- Consistent color temperature within city (Seattle = cooler tones, desert cities = warmer)

**Composition:**
- Subject centered or rule of thirds
- Logo always clearly visible
- City context in background (not dominant)
- Breathing room around subject

**Models:**
- Diverse representation (age 20s-30s, mixed gender, various ethnicities)
- Natural expressions (no forced smiles)
- Casual confident energy
- Realistic body types

**Hoodie Requirements:**
- Always "premium pullover hoodie" in prompt
- Specify "heavyweight cotton fleece" for quality perception
- Drawstrings visible and natural
- Proper fit (not oversized unless specified)

### Logo Embroidery Rules

**Consistency Across All Prompts:**
- Always specify thread color
- Always specify approximate size in inches
- Use terms: "embroidered", "premium quality stitching", "satin stitch"
- Avoid: "printed", "graphic", "screen printed"

**Size Guidelines:**
- Small placement (left/right chest): 2.5-3.5 inches
- Center chest: 4-6 inches  
- Back placement: 3-5 inches

---

## VARIABLE FILLING LOGIC (For n8n)

### Step 1: Query Supabase for City Context
```javascript
const cityContext = await supabase.rpc('get_city_context', { 
  city_name_param: selectedCity 
});
```

### Step 2: Extract Variables
```javascript
const variables = {
  city_name: cityContext.city.name,
  area_code: cityContext.city.area_code,
  city_nickname: cityContext.city.nickname,
  landmark_name: cityContext.landmarks[0].name, // Most prominent
  cultural_element: cityContext.cultural_elements
    .filter(e => e.relevance_score > 80)[0].element,
  city_vibe: generateCityVibe(cityContext), // Custom function
  primary_sports_team: cityContext.city.primary_sports_team
};
```

### Step 3: Get Design Concept
```javascript
const designConcept = await supabase
  .from('design_concepts')
  .select('*')
  .eq('city_id', cityContext.city.id)
  .eq('status', 'approved')
  .single();

variables.hoodie_color = designConcept.design_elements.hoodie_color;
variables.logo_description = designConcept.design_elements.logo_style;
// etc.
```

### Step 4: Fill Template
```javascript
const promptTemplate = await supabase
  .from('prompt_templates')
  .select('*')
  .eq('category', 'lifestyle')
  .eq('template_name', 'Urban Street Scene')
  .single();

let filledPrompt = promptTemplate.prompt_text;
for (const [key, value] of Object.entries(variables)) {
  filledPrompt = filledPrompt.replace(`{{${key}}}`, value);
}
```

### Step 5: Send to AI Model via OpenRouter
```javascript
const response = await openRouter.generate({
  model: promptTemplate.model_preference,
  prompt: filledPrompt
});
```

---

## QUALITY CONTROL CHECKLIST

Before approving AI-generated images, verify:

✅ **Logo is clearly visible and legible**  
✅ **Embroidery looks realistic (not flat/printed)**  
✅ **City context is appropriate and recognizable**  
✅ **Model appearance is natural and diverse**  
✅ **Hoodie fit and quality looks premium**  
✅ **Lighting and composition are professional**  
✅ **No obvious AI artifacts or distortions**  
✅ **Brand consistency with other approved images**

---

## PROMPT ITERATION STRATEGY

If results aren't satisfactory:

1. **Add more specificity** to weak areas (e.g., "embroidery with visible thread texture and dimensional satin stitch")
2. **Change model** (Nano Banana vs Midjourney may handle differently)
3. **Adjust variables** (try different landmarks, lighting styles)
4. **Use negative prompts** (e.g., "not cartoon, not illustration, not flat design")
5. **Increase quality modifiers** (e.g., "professional photography", "4K", "high detail")

---

## USAGE IN n8n

Each prompt template has an ID in the `prompt_templates` table. n8n workflow:

1. Select city
2. Select scenario type (lifestyle, product, reddit comparison)
3. Query appropriate prompt template
4. Fill variables from Supabase
5. Send to OpenRouter
6. Save result to `generated_images` table
7. Log usage in `prompt_templates.usage_count`

This library is production-ready and ensures consistent brand quality across all AI-generated content!
