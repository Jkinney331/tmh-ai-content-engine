# TMH AI CONTENT ENGINE — TECHNICAL SPECIFICATION
## Supplement to TMH AI Content Engine Knowledge Base

**Purpose:** Technical requirements, workflows, data schemas, and content templates for building the automated AI content generation tool.

**For:** Claude Code / AI Software Developer

**Companion To:** TMH AI Content Engine Knowledge Base (brand context, city playbooks, prompt library)

---

# TABLE OF CONTENTS

1. [SYSTEM OVERVIEW](#1-system-overview)
2. [MODULE SPECIFICATIONS](#2-module-specifications)
3. [CITY ONBOARDING WORKFLOW](#3-city-onboarding-workflow)
4. [PRODUCT DESIGN GENERATION](#4-product-design-generation)
5. [CONTENT GENERATION PIPELINES](#5-content-generation-pipelines)
6. [FEEDBACK & LEARNING SYSTEM](#6-feedback--learning-system)
7. [CONTENT FORMAT TEMPLATES](#7-content-format-templates)
8. [COPY & CAPTION FORMULAS](#8-copy--caption-formulas)
9. [EVALUATION CRITERIA & GUARDRAILS](#9-evaluation-criteria--guardrails)
10. [JSON SCHEMAS](#10-json-schemas)

---

# 1. SYSTEM OVERVIEW

## Core Workflow

```
┌─────────────────┐
│   PICK CITY     │
└────────┬────────┘
         ▼
┌─────────────────┐
│ CITY RESEARCH   │ ← Configurable questionnaire + custom prompts
│ (AI + Human)    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ APPROVE CITY    │ ← User reviews research, approves/rejects elements
│ PROFILE         │
└────────┬────────┘
         ▼
┌─────────────────────────────────────────────────────────┐
│              GENERATION CASCADE (Parallel)               │
├─────────────┬─────────────┬─────────────┬───────────────┤
│  PRODUCT    │  LIFESTYLE  │   SOCIAL    │    VIDEO      │
│  DESIGNS    │   SHOTS     │   POSTS     │    ADS        │
├─────────────┼─────────────┼─────────────┼───────────────┤
│ • Hoodie    │ • Model     │ • Carousel  │ • 15-30s      │
│ • T-shirt   │ • Street    │ • Single    │ • Script      │
│ • Hat       │ • Location  │ • Stories   │ • B-roll      │
└─────────────┴─────────────┴─────────────┴───────────────┘
         ▼
┌─────────────────┐
│ USER GRADING    │ ← Thumbs up/down + text feedback on EVERYTHING
└────────┬────────┘
         ▼
┌─────────────────┐
│ LEARNING        │ ← Pattern recognition for predictions
│ SYSTEM          │
└─────────────────┘
```

## Model Stack

| Task | Primary Model | Fallback | Notes |
|------|--------------|----------|-------|
| Prompt generation | Claude | - | Best for nuanced prompts |
| Image generation | Gemini Nano Banana | OpenAI Image | A/B test both, user picks winner |
| Video generation | Sora 2 | Gemini Video | A/B test both |
| Copy/captions | Claude | - | Brand voice consistency |
| Research/analysis | Claude | - | City research, pattern recognition |

## Comparison Mode

For image and video generation, ALWAYS generate with multiple models and let user pick winner. This feeds the learning system.

```
User Request → Generate with Model A → Generate with Model B → Display side-by-side → User picks winner → Log preference
```

---

# 2. MODULE SPECIFICATIONS

## Module 1: City Research & Onboarding

**Purpose:** When user picks a new city, AI researches and compiles city profile for approval.

**Inputs:**
- City name
- User-configurable research checklist (checkboxes)
- Optional custom research prompt

**Research Categories (Configurable Checkboxes):**

```
□ SLANG & LANGUAGE
  □ Common greetings
  □ Local slang terms
  □ Neighborhood nicknames
  □ How locals refer to the city
  □ Pronunciation quirks
  
□ SPORTS & TEAMS
  □ NFL team + colorways
  □ NBA team + colorways
  □ MLB team + colorways
  □ NHL team + colorways
  □ College teams + colorways
  □ Historic championship moments
  □ Rivalries
  
□ LANDMARKS & LOCATIONS
  □ Iconic landmarks (tourist-known)
  □ Local landmarks (insider-known)
  □ Neighborhoods with character
  □ Streets/intersections with meaning
  □ Food spots with cultural significance
  
□ CULTURE & IDENTITY
  □ Music scene/genres associated
  □ Food the city is known for
  □ Industries/work culture
  □ Weather/seasonal identity
  □ Immigration/ethnic communities
  □ Historic events that shaped identity
  
□ VISUAL IDENTITY
  □ City color associations
  □ Architectural style
  □ Street aesthetic
  □ Skyline characteristics
  □ Iconic signage/typography
  
□ AREA CODES & NUMBERS
  □ Primary area code(s)
  □ Zip codes with meaning
  □ Street numbers with significance
```

**Custom Prompt Field:**
```
[Text input for user to add specific research requests]
Example: "Look for any connection between this city and hip-hop history"
```

**Outputs:**
- Structured city profile (JSON)
- Recommended slang terms for products (ranked)
- Recommended color palettes
- Landmark tier list (Tier 1: iconic, Tier 2: local insider, Tier 3: neighborhood-specific)
- Sports colorway options

---

## Module 2: Product Design Generation

**Purpose:** Generate hoodie/shirt/hat designs with city elements.

**Inputs:**
- Approved city profile
- Product type (hoodie, t-shirt, hat)
- Design style preference
- Color preference (or "surprise me")

**Generation Requirements:**

For each design concept, generate:
1. **Front design** - Primary graphic/text
2. **Back design** - Secondary graphic (if applicable)
3. **Colorway options** - 3-5 color variations
4. **Mockup views** - Front, back, detail shots

**Design Variables:**

```
{{city_name}}
{{city_nickname}}
{{slang_term}}
{{area_code}}
{{landmark}}
{{team_colors}}
{{vibe}} - (gritty, clean, vintage, modern, luxury)
{{placement}} - (center chest, left chest, back, sleeve)
```

---

## Module 3: Product Shot Generation

**Purpose:** Generate clean product photography once design is approved.

**Shot Types:**

| Shot Type | Description | Use Case |
|-----------|-------------|----------|
| Flat lay | Product laid flat on textured surface | Website, catalog |
| Ghost mannequin | 3D shape, no visible model | Website PDP |
| Hanging | On premium hanger against backdrop | Editorial |
| Detail/macro | Close-up of embroidery/print | Quality showcase |
| Folded stack | Multiple colorways stacked | Collection shot |

**Background Options:**

```
{{background_type}}:
- concrete_texture
- brick_wall
- city_street (blurred)
- studio_seamless (white/black/grey)
- wooden_surface
- metal_industrial
```

---

## Module 4: Lifestyle Shot Generation

**Purpose:** Generate model/street photography with products.

**Variables:**

```
{{model_ethnicity}} - See diversity requirements below
{{model_age_range}} - 24-35
{{model_style}} - streetwear_premium, streetwear_casual, athleisure
{{location}} - city-specific from approved profile
{{time_of_day}} - golden_hour, blue_hour, midday, night
{{activity}} - walking, standing, sitting, conversation
{{accessories}} - watch, sneakers, bag (from approved list)
```

**Diversity Requirements:**

Every batch of lifestyle shots must include:
- 30% Black/African American
- 25% Hispanic/Latino
- 20% White
- 15% Asian
- 10% Mixed/Other

**Sneaker Whitelist (Approved):**

```
APPROVED_SNEAKERS = [
    "Nike SB Dunk Low",
    "Nike SB Dunk High", 
    "Air Jordan 1 High OG",
    "Air Jordan 4",
    "Air Jordan 11",
    "Air Jordan 3",
    "New Balance 550",
    "New Balance 990v5",
    "New Balance 2002R",
    "Adidas Samba OG",
    "Adidas Gazelle",
    "Nike Air Force 1 Low",
    "Nike Air Max 1",
    "Nike Air Max 90",
    "Salomon XT-6",
    "ASICS Gel-Kayano 14"
]
```

**Sneaker Blacklist (NEVER USE):**

```
BANNED_SNEAKERS = [
    "Air Jordan 1 Mid",  # Considered "budget" version
    "Nike Monarch",
    "Generic white sneakers",
    "Visible logos that aren't real brands"
]
```

---

## Module 5: Social Content Generation

**Purpose:** Generate ready-to-post social media content with copy.

**Content Types:**

1. **Single Image Post** - Product or lifestyle shot + caption
2. **Carousel Post** - 3-10 slides with narrative flow
3. **Stories** - Vertical format, ephemeral content
4. **Reels/TikTok** - Short-form video concepts + scripts

**Platform Specs:**

| Platform | Feed Ratio | Stories Ratio | Reels Ratio |
|----------|------------|---------------|-------------|
| Instagram | 1:1 or 4:5 | 9:16 | 9:16 |
| TikTok | - | - | 9:16 |
| Facebook | 1:1 or 4:5 | 9:16 | 9:16 |

---

## Module 6: Video Ad Generation

**Purpose:** Generate video ads with scripts and b-roll direction.

**Ad Formats:**

| Format | Duration | Purpose |
|--------|----------|---------|
| Hook test | 3-5 sec | Test different hooks |
| Short-form | 15-30 sec | Social ads |
| Standard | 30-60 sec | Full story |
| Anthem | 45-90 sec | Brand building |

**Video Structure Template:**

```
HOOK (0-3 sec): {{hook_type}}
PROBLEM/TENSION (3-10 sec): {{tension}}
PRODUCT REVEAL (10-20 sec): {{product_showcase}}
SOCIAL PROOF/BENEFITS (20-25 sec): {{benefits}}
CTA (25-30 sec): {{call_to_action}}
```

---

## Module 7: Feedback & Learning System

**Purpose:** Capture user preferences to improve predictions over time.

**Feedback Capture Points:**

Every generated item should have:
1. **Thumbs up / Thumbs down** - Binary preference
2. **Text feedback field** - Optional detailed feedback
3. **Tags** - What specifically was good/bad

**Feedback Tags (Multi-select):**

```
POSITIVE_TAGS = [
    "color_on_point",
    "typography_good", 
    "vibe_matches_city",
    "model_styling_good",
    "background_works",
    "copy_hits",
    "premium_feel",
    "would_actually_post"
]

NEGATIVE_TAGS = [
    "color_off",
    "typography_wrong",
    "vibe_doesnt_match",
    "model_styling_off",
    "background_wrong",
    "copy_misses",
    "looks_cheap",
    "too_generic",
    "too_busy",
    "wrong_city_feel"
]
```

**Learning Patterns to Track:**

```
- Color preferences per city
- Typography style preferences
- Model styling preferences
- Background preferences
- Copy tone preferences
- Hook types that work
- Which model (Nano vs OpenAI) wins more often
- Time of day in shots
- Level of "busy-ness" in designs
```

---

# 3. CITY ONBOARDING WORKFLOW

## Step-by-Step Flow

### Step 1: City Selection
```
User Input: "Detroit"
System: Initiates research with default checklist OR user-configured checklist
```

### Step 2: Research Execution

**Research Prompt Template:**
```
Research {{city_name}} for a premium streetwear brand focused on city pride and local identity.

RESEARCH AREAS:
{{selected_checklist_items}}

CUSTOM REQUESTS:
{{user_custom_prompt}}

OUTPUT FORMAT:
Return structured data with:
1. Slang terms (ranked by authenticity/recognizability)
2. Landmarks (tiered: iconic → local insider → neighborhood)
3. Sports teams with exact colorways (hex codes)
4. Recommended design concepts
5. What to AVOID (overdone, tourist-y, offensive)

IMPORTANT: Focus on what LOCALS actually say/know, not tourist perspective.
```

### Step 3: Profile Review

Display research results for user approval:
- Approve/reject individual slang terms
- Approve/reject landmarks
- Select preferred colorways
- Add notes/corrections

### Step 4: Profile Lock

Once approved, city profile becomes the source of truth for all generation.

---

## City Profile Schema

```json
{
  "city_id": "detroit",
  "city_name": "Detroit",
  "nicknames": ["Motor City", "The D", "Motown"],
  "area_codes": ["313", "248"],
  "status": "approved",
  
  "slang": {
    "approved": [
      {
        "term": "What Up Doe",
        "meaning": "Greeting, like 'what's up'",
        "authenticity_score": 0.95,
        "product_ready": true
      }
    ],
    "rejected": [
      {
        "term": "Motorcity",
        "rejection_reason": "Too tourist-y, everyone knows it"
      }
    ]
  },
  
  "landmarks": {
    "tier_1_iconic": [
      {
        "name": "Joe Louis Fist",
        "description": "24-foot bronze fist sculpture",
        "visual_reference": "url_or_description"
      }
    ],
    "tier_2_local": [],
    "tier_3_neighborhood": []
  },
  
  "sports": {
    "nfl": {
      "team": "Detroit Lions",
      "colors": {
        "primary": "#0076B6",
        "secondary": "#B0B7BC",
        "accent": "#000000"
      }
    },
    "nba": {
      "team": "Detroit Pistons",
      "colors": {
        "primary": "#C8102E",
        "secondary": "#1D42BA",
        "accent": "#BEC0C2"
      }
    }
  },
  
  "visual_identity": {
    "recommended_colors": ["#0076B6", "#C8102E", "#000000"],
    "architectural_style": "Industrial, Art Deco",
    "street_aesthetic": "Gritty, resilient, comeback energy"
  },
  
  "avoid": [
    "Poverty porn imagery",
    "Ruin porn",
    "Overly negative 'abandoned' vibes",
    "Generic car imagery without context"
  ],
  
  "user_notes": "Focus on the comeback story, resilience, pride despite struggles"
}
```

---

# 4. PRODUCT DESIGN GENERATION

## Design Generation Prompt Template

```
Generate a premium streetwear {{product_type}} design for {{city_name}}.

DESIGN BRIEF:
- Primary text/slang: {{slang_term}}
- Style: {{design_style}} (options: minimal, bold, vintage, modern, luxury)
- Vibe: {{city_vibe}}
- Color palette: {{color_palette}}

BRAND REQUIREMENTS:
- Premium feel (think Kith, Aimé Leon Dore, not tourist shop)
- "If you know, you know" energy
- Clean typography, intentional placement
- No clip art, no generic city skylines
- Embroidery-friendly (will be embroidered, not printed)

PLACEMENT OPTIONS:
- Front: {{front_placement}} (center chest, left chest, large back)
- Back: {{back_placement}} (across shoulders, center back, lower back)

OUTPUT:
Generate design concept with:
1. Visual mockup
2. Typography specifications (font family, weight, size)
3. Color hex codes
4. Placement diagram
5. Embroidery notes (stitch direction, density)
```

## Design Style Presets

```json
{
  "minimal": {
    "typography": "clean sans-serif",
    "elements": "single word or phrase",
    "color_count": "2 max",
    "placement": "left chest or center back"
  },
  "bold": {
    "typography": "heavy weight, condensed",
    "elements": "large text, fills space",
    "color_count": "2-3",
    "placement": "center chest or full back"
  },
  "vintage": {
    "typography": "serif or script, distressed",
    "elements": "aged aesthetic, retro references",
    "color_count": "2-3 muted",
    "placement": "varies"
  },
  "modern": {
    "typography": "geometric sans, clean",
    "elements": "contemporary layout",
    "color_count": "2-3",
    "placement": "asymmetric or traditional"
  },
  "luxury": {
    "typography": "refined, premium weight",
    "elements": "subtle, understated",
    "color_count": "1-2 (tonal)",
    "placement": "left chest small, or tonal back"
  }
}
```

---

# 5. CONTENT GENERATION PIPELINES

## Pipeline 1: Product Shot Pipeline

**Trigger:** Design approved
**Output:** 5-8 product shots per design

```
Input: Approved design mockup
       ↓
Generate: Flat lay shot (3 angles)
          Ghost mannequin (front, back, detail)
          Hanging shot
          Folded/stacked (if multiple colorways)
       ↓
Output: Product shot gallery for review
       ↓
User grades each shot
       ↓
Approved shots → ready for website/ads
```

## Pipeline 2: Lifestyle Shot Pipeline

**Trigger:** Product shots approved
**Output:** 10-15 lifestyle shots per product

```
Input: Approved product + city profile
       ↓
Generate: Model configurations (diverse)
          Location variations (from city profile)
          Time of day variations
          Activity variations
       ↓
Output: Lifestyle gallery for review
       ↓
User grades each shot
       ↓
Approved shots → ready for social/ads
```

## Pipeline 3: Social Content Pipeline

**Trigger:** Lifestyle shots approved
**Output:** Week's worth of social content

```
Input: Approved lifestyle shots + product shots
       ↓
Generate: Monday Poll concept + caption
          Tuesday Carousel concept + caption
          Wednesday BTS concept + caption
          Thursday Culture post + caption
          Friday Debate concept + caption
          Saturday Lifestyle post + caption
          Sunday Spotlight template
       ↓
Output: Full content calendar with assets + copy
       ↓
User grades each piece
       ↓
Approved content → ready to schedule
```

## Pipeline 4: Video Ad Pipeline

**Trigger:** User requests video ads
**Output:** Multiple video ad variations

```
Input: Approved assets + city profile
       ↓
Generate: 3-5 hook variations (3-5 sec each)
          2-3 full ad scripts (15-30 sec)
          B-roll shot list
          Music/vibe direction
       ↓
Output: Video concepts with scripts
       ↓
User grades concepts
       ↓
Approved concepts → video generation (Sora 2)
       ↓
User grades final videos
       ↓
Approved videos → ready for ads
```

---

# 6. FEEDBACK & LEARNING SYSTEM

## Feedback Data Schema

```json
{
  "feedback_id": "uuid",
  "timestamp": "2026-01-20T12:00:00Z",
  "user_id": "jay",
  
  "content_type": "lifestyle_shot",
  "content_id": "uuid_of_generated_content",
  
  "city": "detroit",
  "product": "hoodie_what_up_doe",
  
  "rating": "thumbs_up",  // or "thumbs_down"
  
  "tags": ["color_on_point", "model_styling_good", "would_actually_post"],
  
  "text_feedback": "Love the golden hour lighting, model's fit is perfect. Maybe try a slightly wider shot next time.",
  
  "generation_params": {
    "model_used": "gemini_nano_banana",
    "prompt_template": "lifestyle_shot_v2",
    "variables": {
      "model_ethnicity": "black_male",
      "location": "detroit_downtown",
      "time_of_day": "golden_hour"
    }
  },
  
  "comparison_context": {
    "was_comparison": true,
    "competitor_model": "openai_image",
    "competitor_content_id": "uuid",
    "winner": "gemini_nano_banana"
  }
}
```

## Learning Queries

The system should be able to answer:

```
1. "What colorways does Jay prefer for Detroit?"
   → Query: feedback WHERE city=detroit AND rating=thumbs_up GROUP BY color

2. "Which model wins more often for lifestyle shots?"
   → Query: feedback WHERE content_type=lifestyle_shot AND was_comparison=true GROUP BY winner

3. "What tags correlate with thumbs_up for NYC content?"
   → Query: feedback WHERE city=nyc AND rating=thumbs_up GROUP BY tags

4. "What does Jay dislike about generated copy?"
   → Query: feedback WHERE content_type=caption AND rating=thumbs_down SELECT text_feedback

5. "Based on preferences, predict what Jay will like for Boston"
   → Pattern match: similar cities (cold weather, sports culture, strong identity) → apply learnings
```

## Prediction System

After sufficient feedback (50+ ratings per category), system should:

1. **Pre-select likely winners** - When generating, weight toward patterns that got thumbs_up
2. **Avoid known dislikes** - Skip combinations that consistently get thumbs_down
3. **Surface confidence** - Show "Based on your preferences, you'll probably like this" with confidence %
4. **Explain predictions** - "You've liked golden hour shots 85% of the time for lifestyle content"

---

# 7. CONTENT FORMAT TEMPLATES

## Format 1: City Pride Poll (Monday)

**Structure:**
```
IMAGE: Split-screen comparison
  - Left: {{city_a}} element
  - Right: {{city_b}} element
  - Center: "VS" or "🆚"
  - TMH logo in corner
  
CAPTION:
{{city_a}} {{element}} vs {{city_b}} {{element}}.

{{city_a_perspective}}
{{city_b_perspective}}

Both valid. Both fire. Both make their city proud.

Which one you choosing? 👇

⬜ {{city_a}} {{element}} ({{city_a_descriptor}})
⬜ {{city_b}} {{element}} ({{city_b_descriptor}})

Drop your vote and your city in the comments.

Real talk: this isn't about which is "better" — it's about which represents YOUR energy.

Both can be true. That's the whole point.

{{hashtags}}
```

**Variables:**
```
{{city_a}}, {{city_b}} - Two cities being compared
{{element}} - What's being compared (pizza, greeting, slang, etc.)
{{city_a_perspective}} - How city A does it
{{city_b_perspective}} - How city B does it
{{city_a_descriptor}}, {{city_b_descriptor}} - Short descriptors
{{hashtags}} - City-specific hashtag set
```

---

## Format 2: "You Know You're From" Carousel (Tuesday)

**Structure:**
```
SLIDE 1 (Cover):
  - Background: {{city}} skyline or iconic street
  - Text: "YOU KNOW YOU'RE FROM {{CITY}} WHEN..."
  - TMH logo bottom right

SLIDES 2-5:
  - Background: Relevant city image
  - Text: "{{relatable_statement}}"
  - Small icon representing the statement

CAPTION:
You know you're from {{city}} when... {{city_emoji}}

Swipe through if you felt ALL of these in your soul ➡️

Real {{city_demonym}} know:
- {{statement_1_short}}
- {{statement_2_short}}
- {{statement_3_short}}
- {{statement_4_short}}

Tag someone who does every single one of these 👇

And if you're from {{city}}, drop a {{city_slang}} in the comments. That's how we know you're real.

{{hashtags}}
```

---

## Format 3: Behind The Scenes Reel (Wednesday)

**Structure:**
```
VIDEO SCRIPT:

SHOT 1 (0-5 sec):
  Visual: Hands scrolling through notes/list
  Text overlay: "We had 20+ slang options for {{city}}"

SHOT 2 (5-12 sec):
  Visual: Circling the chosen word
  Text overlay: "But {{slang_term}} hit different"
  Voiceover: "Because it's how people ACTUALLY talk"

SHOT 3 (12-20 sec):
  Visual: Design process footage
  Text overlay: "It's real. It's direct. It's {{city}}."

SHOT 4 (20-25 sec):
  Visual: Final product (hoodie)
  Text overlay: "That's what TMH is about — real city language"

SHOT 5 (25-30 sec):
  Visual: Black screen → TMH logo
  Text overlay: "What {{city}} slang should we do next?"
  CTA: "Comment below 👇"

CAPTION:
Why we chose {{SLANG_TERM}} for {{city}} {{city_emoji}}

We had {{alternative_1}}, {{alternative_2}}, {{alternative_3}}... literally 20+ options.

But {{SLANG_TERM}} hit different because it's how {{city_demonym}} ACTUALLY talk.

When someone from {{city}} says "{{slang_term}}?" — you know they're serious. No games. Just facts.

That's what TMH is about. Not the tourist version of your city. The REAL version.

The language locals use. The slang that means something.

So yeah. We went with {{SLANG_TERM}}.

And if you're from {{city}}, you already know why.

What {{city}} slang should we do next? Drop your suggestions 👇

{{hashtags}}
```

---

## Format 4: Culture Thursday Carousel

**Structure:**
```
SLIDE 1 (Cover):
  - Background: {{city}} skyline at sunset
  - Text: "{{NUMBER}} THINGS {{CITY}} GAVE THE WORLD"
  - Subtext: "Your city created culture {{city_emoji}}"
  - TMH logo bottom right

SLIDES 2-N:
  - Background: Relevant imagery
  - Text: "{{number}}. {{CULTURAL_CONTRIBUTION}}"
  - Details: "{{brief_description}}"
  - Small icon

FINAL SLIDE:
  - Background: Product or text
  - Text: "{{slang_term}}"
  - Details: "{{slang_description}}"
  - CTA: "Rep your city. Link in bio."

CAPTION:
{{number}} things {{city}} gave the world {{city_emoji}}

Your city didn't just participate in culture.
Your city CREATED it.

{{cultural_summary}}

And yeah, we included {{SLANG_TERM}} on this list because when {{city}} slang hits, it goes global.

That's what city pride is about. Knowing where you're from shaped the world.

What else did {{city}} give us? Drop it in the comments 👇

Rep your hood. Wear your pride.

{{hashtags}}
```

---

## Format 5: Friendly Fire Friday (Debate)

**Structure:**
```
IMAGE:
  - Split screen design
  - Left: {{city_a}} element with text
  - Right: {{city_b}} element with text
  - "VS" in center
  - Both hoodies visible in corners
  - TMH logo

CAPTION:
{{city_a}} vs {{city_b}}: {{debate_topic}} {{emoji_a}}⚡{{emoji_b}}

{{city_a}} {{city_a_approach}}

{{city_b}} {{city_b_approach}}

Same energy. Different delivery.

Both valid. Both fire. Both mean "{{shared_meaning}}."

So which {{element}} hits different for you? 👇

Vote in the poll:
⬜ {{city_a_option}} ({{city_a_descriptor}})
⬜ {{city_b_option}} ({{city_b_descriptor}})

And real talk: if you're from {{city_a}} and visited {{city_b}} (or vice versa), did you try their {{element}}? How'd it feel? 👀

Both cities built different. That's the beauty of it.

{{hashtags}}
```

**CRITICAL GUARDRAIL:**
```
NEVER use "better than" framing
NEVER declare a winner
ALWAYS end with "both valid" or "both can be true"
ALWAYS position as preference, not superiority
```

---

## Format 6: Lifestyle Saturday

**Structure:**
```
IMAGE:
  - High-quality lifestyle shot
  - Model wearing {{product}} ({{colorway}})
  - Location: {{city_location}}
  - Natural pose, not stiff
  - Premium details visible (watch, sneakers)
  - Golden hour or premium lighting

CAPTION:
{{SLANG_TERM}} in its natural habitat.

{{location}}. {{day}}. City energy.

This is what we mean when we say "wear where you're from."

Not a costume. Not a billboard. Just real city pride you can actually wear.

Premium heavyweight. Clean embroidery. Built for the culture.

Available now. Link in bio.

📍 {{location_tag}}

{{hashtags}}
```

---

## Format 7: Community Spotlight Sunday (Stories Only)

**Structure:**
```
STORY 1:
  - Background: TMH logo
  - Text: "COMMUNITY SPOTLIGHT 🌟"
  - Subtext: "Every Sunday we feature someone from the TMH community"

STORY 2:
  - Background: Screenshot of follower's comment
  - Text: "Meet @{{username}}"

STORY 3:
  - Background: Profile context
  - Text: "From: {{location}}"
  - Details: "{{user_description}}"

STORY 4:
  - Background: Their best comment screenshot
  - Text: "This comment made us smile this week 👇"

STORY 5:
  - Background: Product image
  - Text: "@{{username}} — check your DMs 👀"
  - Subtext: "We got something for you"

STORY 6:
  - Background: Black
  - Text: "Want to be featured next Sunday?"
  - Instructions: "Engage with our posts. Share your city pride. Be part of the community."

STORY 7:
  - Background: TMH logo
  - Text: "This is what TMH is about. Real people. Real cities. Real community."
  - Sticker: "Tag someone who should be featured next! 👇"
```

---

# 8. COPY & CAPTION FORMULAS

## Hook Formulas (First Line)

```
QUESTION HOOK:
"{{city_a}} or {{city_b}}?"
"Which {{element}} hits different?"
"You know you're from {{city}} when..."

STATEMENT HOOK:
"{{SLANG_TERM}} in its natural habitat."
"Your city didn't just participate in culture. Your city CREATED it."
"This is what we mean when we say 'wear where you're from.'"

CONTROVERSY HOOK (Safe):
"{{city_a}} vs {{city_b}}: The {{topic}} Battle"
"We had 20+ options. We chose {{SLANG_TERM}}. Here's why."

NUMBER HOOK:
"{{N}} things {{city}} gave the world"
"{{N}} signs you're really from {{city}}"
```

## Body Copy Formulas

```
COMPARISON BODY:
"{{city_a}} {{does_thing_a}}
{{city_b}} {{does_thing_b}}
Same energy. Different delivery.
Both valid. Both fire."

STORY BODY:
"We had {{option_1}}, {{option_2}}, {{option_3}}... literally 20+ options.
But {{chosen}} hit different because {{reason}}.
That's what TMH is about. {{brand_statement}}."

CULTURAL BODY:
"From {{cultural_element_1}} to {{cultural_element_2}}, {{city}} changed how the world moves.
That's what city pride is about. Knowing where you're from shaped the world."

PRODUCT BODY:
"Premium heavyweight. Clean embroidery. Built for the culture.
Not a costume. Not a billboard. Just real city pride you can actually wear."
```

## CTA Formulas

```
ENGAGEMENT CTA:
"Drop your vote and your city in the comments."
"Tag someone who does every single one of these 👇"
"What {{city}} slang should we do next? Drop your suggestions 👇"
"What else did {{city}} give us? Drop it in the comments 👇"

PRODUCT CTA:
"Available now. Link in bio."
"Rep your city. Link in bio."

SOFT CTA:
"Both can be true. That's the whole point."
"If you're from {{city}}, you already know why."
```

## Hashtag Sets by City

```json
{
  "nyc": {
    "primary": ["#TMH", "#RepYourHood", "#NYC", "#NewYork", "#ThatsMyHoodie"],
    "slang": ["#DEADASS", "#YERR"],
    "location": ["#Manhattan", "#Brooklyn", "#Queens", "#Bronx", "#StatenIsland"],
    "general": ["#CityPride", "#Streetwear", "#PremiumStreetwear"]
  },
  "detroit": {
    "primary": ["#TMH", "#RepYourHood", "#Detroit", "#ThatsMyHoodie"],
    "slang": ["#WhatUpDoe", "#313"],
    "location": ["#MotorCity", "#TheD"],
    "general": ["#CityPride", "#Streetwear", "#DetroitVsEverybody"]
  },
  "chicago": {
    "primary": ["#TMH", "#RepYourHood", "#Chicago", "#ThatsMyHoodie"],
    "slang": ["#TheChi"],
    "location": ["#ChiTown", "#WindyCity"],
    "general": ["#CityPride", "#Streetwear"]
  }
}
```

---

# 9. EVALUATION CRITERIA & GUARDRAILS

## The "Is This Dope?" Test

Before presenting any generated content, AI should self-evaluate:

```
DOPE_CHECK = {
  "premium_feel": "Does this look like it costs $150+?",
  "insider_energy": "Would a local immediately recognize this?",
  "not_tourist": "Could this be sold at an airport gift shop? (If yes, FAIL)",
  "specific": "Is this specific to THIS city, not generic?",
  "brand_aligned": "Does this feel like Kith/Supreme/ALD, not H&M?"
}

If any check fails, regenerate or flag for review.
```

## Hard Guardrails (NEVER VIOLATE)

```
NEVER:
- Use "better than" framing in city comparisons
- Declare winners in debates
- Use clip art or generic city skylines
- Generate content that looks cheap/budget
- Use banned sneakers in lifestyle shots
- Misrepresent slang (wrong city attribution)
- Use poverty/ruin imagery for any city
- Generate sexual or inappropriate content
- Use real people's faces without consent
- Copy existing brand designs

ALWAYS:
- End debates with "both valid" / "both can be true"
- Include diverse models in lifestyle batches
- Use approved sneakers only
- Maintain premium aesthetic
- Respect city-specific sensitivities (from "avoid" list)
- Include TMH logo in graphics
```

## Soft Preferences (Learn Over Time)

```
These start as defaults but adapt based on feedback:

DEFAULT_PREFERENCES = {
  "lighting": "golden_hour",
  "typography": "clean_sans_serif",
  "color_saturation": "medium",
  "model_pose": "natural_candid",
  "background_complexity": "moderate",
  "copy_length": "medium",
  "emoji_usage": "minimal"
}

System tracks thumbs_up/thumbs_down and adjusts weights.
```

## Content Moderation

```
Before presenting to user, check:

1. NO_OFFENSIVE_CONTENT - Scan for slurs, hate speech, inappropriate imagery
2. NO_COMPETITOR_LOGOS - Ensure no visible brand logos except approved
3. NO_REAL_FACES - AI-generated faces only
4. CITY_ACCURACY - Slang/landmarks match the city
5. BRAND_CONSISTENCY - Colors, fonts, vibe match TMH
```

---

# 10. JSON SCHEMAS

## City Profile Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["city_id", "city_name", "status"],
  "properties": {
    "city_id": { "type": "string" },
    "city_name": { "type": "string" },
    "nicknames": { "type": "array", "items": { "type": "string" } },
    "area_codes": { "type": "array", "items": { "type": "string" } },
    "status": { "enum": ["draft", "researching", "review", "approved", "active"] },
    
    "slang": {
      "type": "object",
      "properties": {
        "approved": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "term": { "type": "string" },
              "meaning": { "type": "string" },
              "authenticity_score": { "type": "number", "minimum": 0, "maximum": 1 },
              "product_ready": { "type": "boolean" }
            }
          }
        },
        "rejected": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "term": { "type": "string" },
              "rejection_reason": { "type": "string" }
            }
          }
        }
      }
    },
    
    "landmarks": {
      "type": "object",
      "properties": {
        "tier_1_iconic": { "type": "array" },
        "tier_2_local": { "type": "array" },
        "tier_3_neighborhood": { "type": "array" }
      }
    },
    
    "sports": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "team": { "type": "string" },
          "colors": {
            "type": "object",
            "properties": {
              "primary": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
              "secondary": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
              "accent": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" }
            }
          }
        }
      }
    },
    
    "visual_identity": {
      "type": "object",
      "properties": {
        "recommended_colors": { "type": "array", "items": { "type": "string" } },
        "architectural_style": { "type": "string" },
        "street_aesthetic": { "type": "string" }
      }
    },
    
    "avoid": { "type": "array", "items": { "type": "string" } },
    "user_notes": { "type": "string" }
  }
}
```

## Feedback Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["feedback_id", "timestamp", "content_type", "content_id", "rating"],
  "properties": {
    "feedback_id": { "type": "string", "format": "uuid" },
    "timestamp": { "type": "string", "format": "date-time" },
    "user_id": { "type": "string" },
    
    "content_type": {
      "enum": [
        "product_design",
        "product_shot",
        "lifestyle_shot",
        "social_post",
        "carousel",
        "reel_script",
        "video_ad",
        "caption",
        "hook"
      ]
    },
    "content_id": { "type": "string", "format": "uuid" },
    
    "city": { "type": "string" },
    "product": { "type": "string" },
    
    "rating": { "enum": ["thumbs_up", "thumbs_down"] },
    
    "tags": {
      "type": "array",
      "items": {
        "enum": [
          "color_on_point", "typography_good", "vibe_matches_city",
          "model_styling_good", "background_works", "copy_hits",
          "premium_feel", "would_actually_post",
          "color_off", "typography_wrong", "vibe_doesnt_match",
          "model_styling_off", "background_wrong", "copy_misses",
          "looks_cheap", "too_generic", "too_busy", "wrong_city_feel"
        ]
      }
    },
    
    "text_feedback": { "type": "string" },
    
    "generation_params": {
      "type": "object",
      "properties": {
        "model_used": { "type": "string" },
        "prompt_template": { "type": "string" },
        "variables": { "type": "object" }
      }
    },
    
    "comparison_context": {
      "type": "object",
      "properties": {
        "was_comparison": { "type": "boolean" },
        "competitor_model": { "type": "string" },
        "competitor_content_id": { "type": "string" },
        "winner": { "type": "string" }
      }
    }
  }
}
```

## Generated Content Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["content_id", "content_type", "created_at", "status"],
  "properties": {
    "content_id": { "type": "string", "format": "uuid" },
    "content_type": { "type": "string" },
    "created_at": { "type": "string", "format": "date-time" },
    "status": { "enum": ["generated", "pending_review", "approved", "rejected", "archived"] },
    
    "city_id": { "type": "string" },
    "product_id": { "type": "string" },
    
    "generation_params": {
      "type": "object",
      "properties": {
        "model": { "type": "string" },
        "prompt_template": { "type": "string" },
        "prompt_full": { "type": "string" },
        "variables": { "type": "object" },
        "settings": { "type": "object" }
      }
    },
    
    "outputs": {
      "type": "object",
      "properties": {
        "image_url": { "type": "string" },
        "video_url": { "type": "string" },
        "caption": { "type": "string" },
        "hashtags": { "type": "array", "items": { "type": "string" } },
        "script": { "type": "string" }
      }
    },
    
    "feedback": {
      "type": "array",
      "items": { "$ref": "#/definitions/feedback" }
    }
  }
}
```

## Prompt Template Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["template_id", "name", "category", "prompt"],
  "properties": {
    "template_id": { "type": "string" },
    "name": { "type": "string" },
    "category": {
      "enum": [
        "product_design",
        "product_shot",
        "lifestyle_shot",
        "social_caption",
        "video_script",
        "city_research"
      ]
    },
    "model_target": { "type": "string" },
    "prompt": { "type": "string" },
    "variables": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "type": { "enum": ["string", "select", "number", "boolean"] },
          "options": { "type": "array" },
          "default": {},
          "required": { "type": "boolean" }
        }
      }
    },
    "settings": {
      "type": "object",
      "properties": {
        "aspect_ratio": { "type": "string" },
        "quality": { "type": "string" },
        "style": { "type": "string" }
      }
    },
    "success_rate": { "type": "number" },
    "usage_count": { "type": "integer" }
  }
}
```

---

# APPENDIX: QUICK REFERENCE

## Variable Syntax

All templates use `{{variable_name}}` syntax:
- `{{city_name}}` - String variable
- `{{SLANG_TERM}}` - Uppercase = display as uppercase
- `{{city_emoji}}` - Will be replaced with appropriate emoji
- `{{hashtags}}` - Will be replaced with full hashtag set

## Model Selection Logic

```
IF content_type == "image":
    generate_with(gemini_nano_banana)
    generate_with(openai_image)
    display_comparison()
    
IF content_type == "video":
    generate_with(sora_2)
    generate_with(gemini_video)
    display_comparison()
    
IF content_type == "text":
    generate_with(claude)
    // No comparison needed, Claude is primary
```

## Feedback Loop

```
Every generated item:
1. Display to user
2. Capture: thumbs_up OR thumbs_down
3. Capture: tags (optional multi-select)
4. Capture: text_feedback (optional)
5. Store with generation_params
6. Update preference weights
```

---

**END OF TECHNICAL SPECIFICATION**

*TMH AI Content Engine Technical Spec v1.0*
*Companion to: TMH AI Content Engine Knowledge Base*
*For: Claude Code / AI Software Developer*
*Last Updated: January 2026*
