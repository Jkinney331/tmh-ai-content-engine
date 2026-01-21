# TMH KNOWLEDGE BASE APPENDIX
## Master Reference Document for AI Content Engine

**Version:** 1.0
**Last Updated:** January 21, 2026
**Purpose:** This document serves as the comprehensive knowledge base for the TMH AI Content Engine. It is used for:
- Seeding database tables
- Chat agent context (system prompt + RAG)
- Generation prompt construction
- Editorial guidelines enforcement

**IMPORTANT:** All sections are editable via the Settings > Knowledge Base UI in the app. This document represents the initial seed data.

---

# TABLE OF CONTENTS

1. [Brand Foundation](#1-brand-foundation)
2. [Target Customer](#2-target-customer)
3. [Product Specifications](#3-product-specifications)
4. [Approved Sneakers](#4-approved-sneakers)
5. [Model Specifications](#5-model-specifications)
6. [Style Slot System](#6-style-slot-system)
7. [Photography Guidelines](#7-photography-guidelines)
8. [City Profiles](#8-city-profiles)
9. [Competitor Intelligence](#9-competitor-intelligence)
10. [Market Trends](#10-market-trends)
11. [Content Types & Formats](#11-content-types--formats)
12. [AI Pipeline Configuration](#12-ai-pipeline-configuration)
13. [Feedback Taxonomy](#13-feedback-taxonomy)
14. [Chat Agent Behavior](#14-chat-agent-behavior)

---

# 1. BRAND FOUNDATION

## Brand Identity

| Attribute | Value |
|-----------|-------|
| **Brand Name** | That's My Hoodie (TMH) |
| **Tagline** | "Wear Where You're From" / "Rep Your Hood" |
| **Positioning** | Premium streetwear celebrating hometown pride |
| **Price Point** | $150-175 retail |
| **Quality Tier** | Premium (competes with Kith, Supreme, not H&M) |

## Brand Voice

```yaml
tone: confident, authentic, slightly exclusive
energy: "if you know, you know"
avoid:
  - generic
  - salesy
  - desperate
  - try-hard
  - explaining the joke
wordplay:
  - "Wear" (W-E-A-R) where you're from
  - "Where" (W-H-E-R-E) you're from
  - "Hood" = neighborhood + hoodie
```

## Non-Negotiables

These rules are NEVER broken:

1. **No Jordan 1 Mids** — Banned in sneaker culture, instant credibility loss
2. **No general release sneakers** — Only heat/grails
3. **No dirty/beat sneakers** — Always crispy clean
4. **Rolex in every shot** — Signals premium positioning
5. **High-quality embroidery only** — No screen print aesthetic
6. **Heavy GSM fabric** — 400-450 GSM minimum
7. **Authentic local slang** — If it's not real, don't use it
8. **Diverse model casting** — Reflects the city's actual demographics

## Brand Aesthetic

```yaml
style_references:
  - Kith (clean, premium, editorial)
  - Supreme (exclusive, drop culture)
  - Stüssy (street credibility, heritage)
  - Moncler (sporty luxury)
  - Stone Island (technical premium)
  
avoid_aesthetic:
  - Fast fashion (H&M, Zara)
  - Mall brands
  - Over-designed/busy graphics
  - Cheap fabric appearance
```

---

# 2. TARGET CUSTOMER

## Demographics

| Attribute | Primary | Secondary |
|-----------|---------|-----------|
| **Age** | 25-35 | 18-24, 36-45 |
| **Income** | $100K-$200K | $75K-$100K |
| **Gender** | Male (60%) | Female (40%) |
| **Location** | Urban/Suburban | College towns |
| **Education** | College educated | Some college |

## Psychographics

```yaml
identity:
  - Proud of where they're from
  - Moved away but still rep their city
  - Sneakerhead or sneaker-aware
  - Values quality over quantity
  - Willing to pay for authenticity
  
behaviors:
  - Follows streetwear accounts
  - Knows release dates
  - Has a "grail" sneaker
  - Travels back home for holidays
  - Posts fit pics
  
values:
  - Authenticity over hype
  - Quality over quantity
  - Community and belonging
  - Cultural credibility
  - Standing out while fitting in
```

## Customer Personas

### Persona 1: "The Transplant" (Primary)
- Moved from hometown for work/school
- Makes good money now
- Misses home, reps it proudly
- Buys premium because they can afford it now
- **Trigger:** Nostalgia, hometown pride, proving they made it

### Persona 2: "The Local Legend" (Secondary)
- Still lives in their city
- Known in their neighborhood
- Wants premium gear that represents
- **Trigger:** Local credibility, standing out, quality

### Persona 3: "The Culture Enthusiast" (Secondary)
- May not be from the city
- Appreciates the culture/aesthetic
- Collects city-specific items
- **Trigger:** Design, exclusivity, cultural appreciation

---

# 3. PRODUCT SPECIFICATIONS

## Hoodie Specs

| Attribute | Specification |
|-----------|---------------|
| **Fabric Weight** | 400-450 GSM (extra heavyweight) |
| **Material** | Premium cotton blend, fleece-lined |
| **Construction** | Double-stitched seams, reinforced cuffs |
| **Drawstrings** | Metal-tipped |
| **Fit** | Relaxed/boxy (streetwear cut) |
| **Sizes** | S, M, L, XL, XXL, XXXL |

## Embroidery Specs

| Attribute | Specification |
|-----------|---------------|
| **Type** | Chain stitch embroidery (premium) |
| **Thread** | Polyester, color-matched |
| **Placement - Front** | Center chest, 7-8 inches wide |
| **Placement - Back** | Upper back, 8-10 inches tall |
| **Placement - Wrist** | TMH logo, right wrist |
| **Quality** | Dense stitching, no loose threads |

## Color Palette by City

| City | Primary Colors | Accent Colors |
|------|----------------|---------------|
| NYC | Black, Navy, Cream | Yellow (taxi), Orange (Knicks) |
| Detroit | Black, Navy, Honolulu Blue | Silver, Red (Wings) |
| Chicago | Black, Red, Navy | White, Baby Blue |
| Boston | Navy, Green, Grey | Gold, White |
| LA | Black, Purple, Gold | Cream, Royal Blue |
| Seattle | Navy, Green, Grey | Lime, Orange |

---

# 4. APPROVED SNEAKERS

## Tier 1: Ultra Grails
*The rarest, most coveted. Use sparingly for maximum impact.*

| Sneaker | Cultural Notes | Best Cities |
|---------|----------------|-------------|
| Nike SB Dunk Low "Freddy Krueger" | Ultimate grail, horror collab | Any |
| Nike SB Dunk Low "Wu-Tang" | Black/yellow, hip-hop royalty | NYC |
| Nike SB Dunk Low "Paris" | Extremely rare, art world | NYC |
| Nike SB Dunk Low "Pigeon" | Jeff Staple, NYC riot shoe | NYC |
| Air Jordan 1 "Dior" | Luxury crossover | Any |
| Air Jordan 4 "KAWS" | Art world grail | Any |
| Nike SB Dunk Low "Heineken" | Classic SB era | Any |
| Air Jordan 1 "Off-White" (any) | Virgil legacy | Chicago, Any |

## Tier 2: Heavy Heat
*High credibility, more accessible than grails.*

| Sneaker | Cultural Notes | Best Cities |
|---------|----------------|-------------|
| Air Jordan 1 High "Chicago" | The original, always works | Chicago, Any |
| Air Jordan 1 High "Bred/Banned" | MJ banned story | Any |
| Air Jordan 1 High "Royal" | Clean, versatile | Any |
| Air Jordan 1 High "Shadow" | Underrated classic | Any |
| Air Jordan 1 High "Union LA" | LA collab heat | LA |
| Air Jordan 1 High "Travis Scott" (Mocha/Reverse) | Current hype king | Any |
| Air Jordan 4 "Travis Scott" | Cactus Jack essential | Any |
| Air Jordan 11 "Concord" | Formal heat | Any |
| Air Jordan 11 "Bred" | Holiday classic | Any |
| Nike SB Dunk Low "Travis Scott" | SB revival | Any |
| Nike SB Dunk Low "Strangelove" | Valentine's grail | Any |
| Nike SB Dunk Low "Tiffany" | Luxury collab | NYC |
| Air Max 97 "Sean Wotherspoon" | Corduroy king | Any |

## Tier 3: Certified Heat
*Solid choices, widely respected.*

| Sneaker | Cultural Notes | Best Cities |
|---------|----------------|-------------|
| Air Jordan 3 "Black Cement" | Tinker classic | Any |
| Air Jordan 4 "Military Black" | Current favorite | Any |
| Air Jordan 4 "Lightning" | Black/gold heat | Any |
| Air Max 1 "Patta" (any) | Amsterdam collab | Any |
| Air Max 90 "Infrared" | OG essential | Any |
| Air Max 95 "Neon" | London energy | Any |
| Air Max 97 "Silver Bullet" | Futuristic OG | Any |
| Nike Dunk Low "Panda" | If styled right | Any |
| Nike Air Force 1 Low "White" | CRISPY clean only | Any |
| Yeezy 350 V2 "Zebra" | Kanye peak | LA, Chicago |
| Yeezy 350 V2 "Cream/Triple White" | Versatile Ye | Any |
| Yeezy 700 V1 "Wave Runner" | Dad shoe revolution | Any |

## Tier 4: New Heat (New Balance Era)
*The current wave, taste-maker approved.*

| Sneaker | Cultural Notes | Best Cities |
|---------|----------------|-------------|
| New Balance 990v5 Grey | The classic dad shoe | NYC, Boston |
| New Balance 990v6 | Latest version | Any |
| New Balance 2002R "Protection Pack" | Salehe hype | Any |
| New Balance 550 (any) | Aimé Leon Dore effect | NYC |
| New Balance 1906R | Underrated gem | Any |
| New Balance x Aimé Leon Dore (any) | NYC elite collab | NYC |
| New Balance x JJJJound (any) | Minimalist grail | Any |
| New Balance x Teddy Santis | Made in USA heat | Any |

## City-Specific Essentials
*MUST use when shooting for these cities.*

| Sneaker | City | Reason |
|---------|------|--------|
| Timberland 6" Premium "Wheat" | NYC | Winter essential, cultural staple |
| Timberland 6" "Black Nubuck" | NYC | Year-round option |
| Nike Cortez (White/Red or Black) | LA | Chicano culture essential |
| Air Jordan 1 "LA to Chicago" | LA, Chicago | City crossover |
| Air Jordan "Michigan" PE | Detroit | State pride |
| New Balance 990 | Boston | East coast dad energy |

## ❌ BANNED SNEAKERS
*NEVER use these. Instant credibility loss.*

| Sneaker | Reason |
|---------|--------|
| Jordan 1 Mids | Universally clowned in sneaker culture |
| General release Dunks | No hype, mall energy |
| Beat up/dirty sneakers | We're premium, not vintage |
| Off-brand lookalikes | Fake = banned |
| Mall sneakers (Skechers, etc.) | Wrong demographic entirely |
| Retro Jordans in bad colorways | Not all Jordans are heat |
| Any sneaker with visible wear | Crispy only |

---

# 5. MODEL SPECIFICATIONS

## General Casting Guidelines

```yaml
diversity: Required - reflects city demographics
age_range: 22-35
build: Athletic to lean, not bodybuilder
vibe: Confident, natural, not try-hard
expression: Relaxed cool, subtle smile OK
authenticity: Should look like they live there

requirements:
  - Clear skin (minor blemishes OK, adds realism)
  - Well-groomed (fresh cuts, clean beards)
  - Natural poses (not catalog stiff)
  - Cultural authenticity (matches city demo)
```

## Model Specs by Design

### BODEGA Design
```yaml
gender: Male
ethnicity: Dominican
age: 27
height: 5'11"
build: Athletic, lean
skin_tone: Medium-tan (Fitzpatrick IV)
hairstyle: Fresh taper fade, textured curly top, crisp lineup
facial_hair: Short, well-groomed beard
vibe: Confident bodega regular
```

### DEADASS Design
```yaml
gender: Male
ethnicity: Nigerian-American
age: 24-26
height: 6'0" - 6'2"
build: Lean, tall frame
hairstyle: Shoulder-length locs OR voluminous curly afro
vibe: Brooklyn creative class
```

### YERR Design
```yaml
gender: Female
ethnicity: Puerto Rican/Dominican
age: 25-28
height: 5'6"
build: Athletic, curves
hairstyle: Slicked back ponytail OR natural curls
vibe: Bronx/Washington Heights fly girl
```

### FUHGEDDABOUDIT Design
```yaml
gender: Male
ethnicity: Italian-American
age: 30-35
height: 5'10"
build: Stocky, broad shoulders
hairstyle: Slicked back or clean cut
facial_hair: 5 o'clock shadow or clean shaven
vibe: Staten Island/Brooklyn Italian
```

### WHAT UP DOE Design (Detroit)
```yaml
gender: Male
ethnicity: Black/African-American
age: 26-30
height: 6'0"
build: Athletic
hairstyle: Low fade, waves OR short twists
vibe: Detroit hustle energy
```

### THE CHI Design (Chicago)
```yaml
gender: Male
ethnicity: Black/African-American
age: 24-28
height: 5'11"
build: Athletic, lean
hairstyle: High top fade OR short dreads
vibe: South Side pride
```

## LA-Specific Models (New)
*To be refined after Perplexity research*

### LA Male Option 1
```yaml
gender: Male
ethnicity: Chicano/Mexican-American
age: 25-30
height: 5'9"
build: Athletic
hairstyle: Clean fade, slicked back top OR shaved head
facial_hair: Thin mustache or goatee
vibe: East LA, lowrider culture adjacent
sneaker_default: Nike Cortez
```

### LA Female Option 1
```yaml
gender: Female
ethnicity: Black/African-American
age: 24-28
height: 5'7"
build: Athletic, curves
hairstyle: Long braids OR silk press
vibe: Inglewood/Compton fly
```

### LA Mixed Option
```yaml
gender: Any
ethnicity: Mixed/Biracial
age: 22-27
height: Varies
build: Lean/athletic
hairstyle: Natural texture
vibe: LA melting pot, creative class
```

---

# 6. STYLE SLOT SYSTEM

## Purpose
When shooting multiple models together, assign each a different "style slot" to ensure variety. **No two models in the same shot should have the same shoe silhouette, pant style, or accessory combo.**

## Men's Style Slots

| Slot | Name | Sneaker Vibe | Pants | Chain | Best For |
|------|------|--------------|-------|-------|----------|
| M1 | Boot Heavy | Timbs Wheat/Black | Dickies 874, slim cargo | Gold Cuban, heavy | NYC winter, workwear edge |
| M2 | Jordan Head | Jordan 1s/4s/11s | Black slim jeans, tapered cargo | Gold rope, box chain | Classic streetwear |
| M3 | NB Dad | NB 990/550/2002R | Wide-leg trousers, relaxed denim | Silver Cuban, thin gold | East coast mature |
| M4 | Dunk Culture | SB Dunks, Dunk Low | Baggy cargo, Carhartt double knee | Layered gold (Cuban + rope) | Skate adjacent |
| M5 | Yeezy Wave | Yeezy 350/700/Foam | Tapered joggers, cropped pants | Gold box chain | LA, minimal flex |
| M6 | High Fashion Edge | Rick Owens, Balenciaga | Black wide-leg, leather | Thin gold or none | Editorial, avant-garde |

## Women's Style Slots

| Slot | Name | Sneaker Vibe | Bottoms | Jewelry | Best For |
|------|------|--------------|---------|---------|----------|
| W1 | Tomboy Clean | Jordan 1s (OG colors) | Baggy cargo, wide-leg jeans | Medium Cuban, nameplate | Classic tomboy |
| W2 | Athleisure Boss | NB 550, Air Max 90/97 | Biker shorts, leggings + jacket | Large hoops, layered gold | Gym to street |
| W3 | Street Glam | SB Dunks, Jordan 4s | Leather pants, high-waisted cargo | Chunky Cuban, pendants | Night out |
| W4 | Minimalist Flex | Yeezy 350, Foam Runner | Black joggers, tailored pants | Thin hoops, thin chains | Clean aesthetic |
| W5 | Y2K Revival | Nike Shox, Air Max Plus | Low-rise baggy, mini skirt | Medium hoops, layered + anklet | Throwback |
| W6 | Designer Edge | Balenciaga, Rick Owens, Prada | Black leather, wide-leg | Drop earrings, statement chain | High fashion |

## Multi-Model Shot Rules

```yaml
rule_1: No two models wear same shoe silhouette
  bad: Both in Jordans
  good: One in Jordans, one in New Balance
  
rule_2: No two models wear same pant style
  bad: Both in black slim jeans
  good: One slim, one wide-leg, one cargo
  
rule_3: No two models wear same chain style
  bad: All gold Cuban
  good: Cuban, rope, silver Cuban
  
rule_4: Assign style slots before prompting
  method: Pick M1 + M3 + M5 for variety
  
rule_5: Cohesion through vibe, not uniformity
  goal: They look like a crew, not a uniform
```

## Example: 3-Model Shot (Correct)

| Model | Design | Style Slot | Sneakers | Pants | Chain |
|-------|--------|------------|----------|-------|-------|
| A | YERRMAN Olive | M1: Boot Heavy | Timbs Wheat | Black Dickies | Gold Cuban |
| B | YERRMAN Grey | M2: Jordan Head | Jordan 4 Military Black | Slim jeans | Gold rope |
| C | YERRMAN Blue | M3: NB Dad | NB 990v5 Grey | Navy wide-leg | Silver Cuban |

---

# 7. PHOTOGRAPHY GUIDELINES

## Studio Shot Settings

```yaml
backdrop: "#DCE1E4" (light grey)
lighting:
  key_light: 45° right, eye level
  fill_light: Left side, 40% intensity of key
  rim_light: Behind left, edge definition
camera:
  position: Eye level, slight low angle (chest height shooting up)
  lens: 85mm equivalent
  depth: Model 6 feet from backdrop (subtle shadow)
```

## Poses (Studio)

```yaml
standing:
  - 3/4 angle, hands in hoodie pocket
  - Slight lean back, confident stance
  - One hand in pocket, one relaxed at side
  
expression:
  - Relaxed, subtle smile OR neutral cool
  - NOT: Cheesy grin, mean mug, trying too hard
  
movement:
  - Natural, not catalog stiff
  - Slight weight shift OK
  - Can be mid-motion (adjusting hood, etc.)
```

## Street/Location Shot Settings

```yaml
vibe: Natural, "caught in the wild", NOT posed/staged
timing:
  golden_hour: 4-5 PM (warm shots)
  blue_hour: 6-7 PM (mood/neon shots)
  overcast: Anytime (soft, even light)

direction:
  - Models look like they LIVE there, not visiting
  - Mid-stride, walking, looking at phone — natural moments
  - Real bodies, diverse representations
  - Cultural authenticity is critical
```

## Product Shot Types

### Flat Lay (No Model)
```yaml
surface: Premium (marble, wood, concrete, fabric)
arrangement: Hoodie laid flat, styled with accessories
accessories: Sneakers beside, chain draped, hat placed
lighting: Soft overhead, minimal shadows
background: Clean, complementary to hoodie color
```

### Ghost Mannequin
```yaml
style: Invisible mannequin effect
shape: Shows hoodie form without visible mannequin
lighting: Even, product photography style
background: White or light grey (#DCE1E4)
details: Show embroidery clearly, fabric texture visible
```

### Lifestyle (Model + Environment)
```yaml
setting: Authentic city location
model: Wearing hoodie naturally
activity: Walking, standing, sitting — real life
background: City elements visible (signs, architecture)
mood: Aspirational but achievable
```

## Accessory Styling (Always Include)

| Accessory | Requirement | Notes |
|-----------|-------------|-------|
| Watch | Rolex (Submariner, Datejust, or Day-Date) | Non-negotiable for premium positioning |
| Chain | Per style slot | Gold Cuban, rope, or silver Cuban |
| Bag | Optional | Crossbody, tote (Louis Vuitton, Goyard, or clean black) |
| Hat | Optional | Fitted cap (backwards or to side), beanie in winter |
| Sunglasses | Optional | If used: premium (no mall brands) |

---

# 8. CITY PROFILES

## Profile Template
*Each city follows this structure. Populated by Perplexity research + manual additions.*

```yaml
city_name: String
state: String
area_codes: [Array]
nicknames: [Array]
slang_terms:
  - term: String
    meaning: String
    usage_example: String
landmarks: [Array]
neighborhoods:
  - name: String
    vibe: String
    good_for: String
cultural_elements:
  - element: String
    significance: String
sports_teams:
  - team: String
    colors: [Array]
    stadium: String
local_brands: [Array]
streetwear_scene:
  key_stores: [Array]
  local_brands: [Array]
  style_notes: String
demographics:
  primary_ethnicities: [Array]
  streetwear_demo: String
pop_culture:
  celebrities_from_here: [Array]
  referenced_in: [Array] # songs, movies, shows
  current_trends: [Array]
design_recommendations:
  suggested_concepts: [Array]
  color_palette: [Array]
  must_have_elements: [Array]
model_recommendations:
  primary_demo: String
  style_slots_preferred: [Array]
  sneakers_essential: [Array]
```

## NYC Profile (Seeded)

```yaml
city_name: New York City
state: New York
area_codes: [212, 718, 917, 347, 929, 646]
nicknames: ["The Big Apple", "Gotham", "The City That Never Sleeps", "The Five Boroughs"]

slang_terms:
  - term: "Deadass"
    meaning: "Seriously, for real"
    usage_example: "I'm deadass hungry right now"
  - term: "Yerr"
    meaning: "Hey, what's up (greeting)"
    usage_example: "Yerrrr, what's good?"
  - term: "Bodega"
    meaning: "Corner store/deli"
    usage_example: "I'm going to the bodega for a bacon egg and cheese"
  - term: "Brick"
    meaning: "Very cold"
    usage_example: "It's brick outside"
  - term: "OD"
    meaning: "Overdoing it, too much"
    usage_example: "That's OD, chill"
  - term: "Tight"
    meaning: "Angry, upset"
    usage_example: "I'm tight right now"
  - term: "Fuhgeddaboudit"
    meaning: "Forget about it (Italian-American)"
    usage_example: "You want me to pay? Fuhgeddaboudit"

landmarks:
  - Times Square
  - Brooklyn Bridge
  - Statue of Liberty
  - Empire State Building
  - Central Park
  - Yankee Stadium
  - Madison Square Garden
  - Apollo Theater
  - Coney Island
  - Grand Central Station

neighborhoods:
  - name: "Harlem"
    vibe: "Historic Black culture, renaissance energy"
    good_for: "Lifestyle shots, cultural authenticity"
  - name: "Bushwick"
    vibe: "Creative, street art, young energy"
    good_for: "Edgy lifestyle shots"
  - name: "SoHo"
    vibe: "Fashion, premium retail, editorial"
    good_for: "Premium positioning shots"
  - name: "Washington Heights"
    vibe: "Dominican culture, community"
    good_for: "BODEGA, YERR designs"
  - name: "Staten Island"
    vibe: "Italian-American, working class"
    good_for: "FUHGEDDABOUDIT design"

sports_teams:
  - team: "Yankees"
    colors: ["Navy", "White"]
    stadium: "Yankee Stadium"
  - team: "Knicks"
    colors: ["Orange", "Blue", "White"]
    stadium: "Madison Square Garden"
  - team: "Mets"
    colors: ["Orange", "Blue"]
    stadium: "Citi Field"

demographics:
  primary_ethnicities: ["Black/African-American", "Latino/Hispanic", "White", "Asian"]
  streetwear_demo: "Diverse, heavy Latino and Black influence"

design_recommendations:
  suggested_concepts: ["BODEGA", "DEADASS", "YERR", "FUHGEDDABOUDIT", "BX", "BK", "TIMBS SEASON"]
  color_palette: ["Black", "Navy", "Cream", "Yellow", "Orange"]
  must_have_elements: ["Area codes (212, 718)", "Bodega references", "Subway references"]

model_recommendations:
  primary_demo: "Dominican, Black, Puerto Rican"
  style_slots_preferred: ["M1: Boot Heavy", "M2: Jordan Head", "W1: Tomboy Clean"]
  sneakers_essential: ["Timberland Wheat", "Jordan 1", "Air Force 1"]
```

## Detroit Profile (Seeded)

```yaml
city_name: Detroit
state: Michigan
area_codes: [313, 248, 734]
nicknames: ["The D", "Motor City", "Motown", "The 313"]

slang_terms:
  - term: "What up doe"
    meaning: "What's up, hello"
    usage_example: "What up doe, how you been?"
  - term: "Finna"
    meaning: "Fixing to, about to"
    usage_example: "I'm finna go to the store"
  - term: "Bet"
    meaning: "Okay, agreement"
    usage_example: "Bet, I'll be there"

landmarks:
  - Eastern Market
  - Ford Field
  - Comerica Park
  - Spirit of Detroit statue
  - Motown Museum
  - Belle Isle
  - Renaissance Center
  - Fox Theatre

sports_teams:
  - team: "Lions"
    colors: ["Honolulu Blue", "Silver"]
    stadium: "Ford Field"
  - team: "Pistons"
    colors: ["Red", "Blue", "White"]
    stadium: "Little Caesars Arena"
  - team: "Tigers"
    colors: ["Navy", "Orange", "White"]
    stadium: "Comerica Park"
  - team: "Red Wings"
    colors: ["Red", "White"]
    stadium: "Little Caesars Arena"

design_recommendations:
  suggested_concepts: ["WHAT UP DOE", "313", "MOTOWN", "THE D", "BAD BOYS", "SPIRIT OF DETROIT"]
  color_palette: ["Black", "Honolulu Blue", "Red", "Silver"]
  must_have_elements: ["313 area code", "Motown references", "Auto industry nods"]

model_recommendations:
  primary_demo: "Black/African-American"
  style_slots_preferred: ["M2: Jordan Head", "M3: NB Dad"]
  sneakers_essential: ["Jordan 4", "New Balance 990"]
```

## LA Profile (To Be Populated by Perplexity)

```yaml
city_name: Los Angeles
state: California
area_codes: [213, 310, 323, 818, 424, 562, 626, 747]
nicknames: ["LA", "The City of Angels", "La La Land", "Tinseltown"]

slang_terms: # To be researched
  - term: "Foo"
    meaning: "Friend, dude (Chicano slang)"
    usage_example: "What's up foo?"
  - term: "Hyna"
    meaning: "Girl, girlfriend (Chicano slang)"
    usage_example: "That's my hyna"
  - term: "Firme"
    meaning: "Cool, nice (Chicano slang)"
    usage_example: "That's firme"
  - term: "The 405"
    meaning: "Major freeway, traffic reference"
    usage_example: "I'm stuck on the 405"
  # Additional terms to be added via Perplexity research

landmarks:
  - Venice Beach
  - Griffith Observatory
  - Hollywood Sign
  - Dodger Stadium
  - Staples Center (Crypto.com Arena)
  - Santa Monica Pier
  - DTLA skyline
  - Fairfax district

neighborhoods:
  - name: "Fairfax"
    vibe: "Streetwear epicenter, hype culture"
    good_for: "Streetwear lifestyle shots"
  - name: "Venice"
    vibe: "Beach, skate, creative"
    good_for: "Lifestyle, outdoor shots"
  - name: "East LA"
    vibe: "Chicano culture, authenticity"
    good_for: "Cultural authenticity shots"
  - name: "Inglewood"
    vibe: "Black culture, hip-hop"
    good_for: "Hip-hop adjacent shots"
  - name: "K-Town"
    vibe: "Korean-American, food, nightlife"
    good_for: "Diverse casting shots"
  - name: "The Valley (818)"
    vibe: "Suburban LA, different energy"
    good_for: "Valley-specific designs"

sports_teams:
  - team: "Lakers"
    colors: ["Purple", "Gold"]
    stadium: "Crypto.com Arena"
  - team: "Dodgers"
    colors: ["Dodger Blue", "White"]
    stadium: "Dodger Stadium"
  - team: "Rams"
    colors: ["Royal Blue", "Gold"]
    stadium: "SoFi Stadium"

demographics:
  primary_ethnicities: ["Latino/Hispanic (Chicano)", "White", "Black/African-American", "Asian (Korean, Filipino)"]
  streetwear_demo: "Heavy Chicano influence, celebrity culture"

design_recommendations:
  suggested_concepts: ["FOO", "THE VALLEY", "WEST SIDE", "213", "CALI LOVE", "LA NATIVE"]
  color_palette: ["Black", "Purple", "Gold", "Cream", "Dodger Blue"]
  must_have_elements: ["Area codes", "Chicano references", "Beach/palm elements"]

model_recommendations:
  primary_demo: "Chicano/Mexican-American, Black, Korean-American"
  style_slots_preferred: ["M5: Yeezy Wave", "M2: Jordan Head"]
  sneakers_essential: ["Nike Cortez", "Jordan 1 LA to Chicago", "Yeezy"]
```

---

# 9. COMPETITOR INTELLIGENCE

## Direct Competitors

### Supreme
```yaml
positioning: OG streetwear, hype king
price_range: $148-$198 (hoodies)
strengths:
  - Brand recognition
  - Drop culture mastery
  - Resale value
  - Collaborations (Nike, LV, etc.)
weaknesses:
  - Sold out (literally and figuratively)
  - VF Corp ownership = less cool
  - Overexposed
  - Quality perception declining
what_they_do_well:
  - Scarcity/hype building
  - Brand protection
  - Consistent drops
watch_for:
  - Collab announcements
  - Drop dates
  - Resale market sentiment
```

### Kith
```yaml
positioning: Premium streetwear meets lifestyle
price_range: $165-$225 (hoodies)
strengths:
  - Premium quality perception
  - Retail experience (stores)
  - Diverse collabs (Nike, New Balance, brands)
  - Clean aesthetic
weaknesses:
  - NYC-centric (less national)
  - Premium price
  - Can feel exclusive/inaccessible
what_they_do_well:
  - Editorial content
  - Store design
  - Collab curation
  - Quality consistency
watch_for:
  - Monday drops
  - Seasonal lookbooks
  - Store openings
```

### BAPE
```yaml
positioning: Japanese streetwear, camo king
price_range: $200-$400+ (hoodies)
strengths:
  - Iconic camo/shark hoodie
  - Japanese quality
  - Celebrity co-signs
weaknesses:
  - Price point very high
  - Aesthetic is specific (love it or hate it)
  - Counterfeits everywhere
what_they_do_well:
  - Brand iconography
  - Limited releases
  - Japanese market dominance
```

### Stüssy
```yaml
positioning: Heritage streetwear, surf/skate roots
price_range: $120-$165 (hoodies)
strengths:
  - Heritage/history (40+ years)
  - Consistent quality
  - Global recognition
  - Cool without trying
weaknesses:
  - Less hype than Supreme/Kith
  - Can feel "dad streetwear"
what_they_do_well:
  - Consistency
  - Quality
  - Not overexposing
```

### Palace
```yaml
positioning: UK streetwear, skate-rooted
price_range: $150-$188 (hoodies)
strengths:
  - Strong UK following
  - Skate authenticity
  - Humor/irreverence
weaknesses:
  - Less US penetration
  - Specific aesthetic
what_they_do_well:
  - Video content
  - Brand voice
  - Skate team
```

## Premium Adjacent

### Fear of God
```yaml
positioning: Luxury streetwear, elevated basics
price_range: $400-$600+ (hoodies)
relevance: Shows where streetwear can go premium
watch_for: Silhouettes, color palettes, Essentials line pricing
```

### Rhude
```yaml
positioning: LA luxury streetwear
price_range: $400-$700+ (hoodies)
relevance: LA-based, similar aesthetic territory
watch_for: LA-specific designs, celebrity placements
```

## City-Specific Competitors

### Only NY
```yaml
positioning: NYC-focused streetwear
price_range: $100-$150
relevance: Direct competitor in "city pride" space for NYC
watch_for: NYC designs, aesthetic direction
```

### Detroit vs Everybody
```yaml
positioning: Detroit pride apparel
price_range: $50-$80
relevance: Direct city-pride competitor, lower price point
watch_for: Detroit market penetration, designs
```

## Fast Fashion (Differentiate Against)

```yaml
brands: [H&M, Zara, ASOS, Forever 21]
their_play: Cheap streetwear knockoffs
our_counter: 
  - Quality (450 GSM vs their 280 GSM)
  - Authenticity (real local slang vs generic)
  - Exclusivity (limited runs vs mass production)
  - Price justification (you get what you pay for)
never_compare_to: Don't even acknowledge them
```

## Competitive Positioning Map

```
                    HIGH PRICE
                        │
        Fear of God  ●  │  ● Rhude
                        │
        Kith ●          │          ● BAPE
                        │
    ────────────────────┼────────────────────
        TMH ●           │          ● Supreme
                        │
        Stüssy ●        │          ● Palace
                        │
        Only NY ●       │
                        │
                    LOW PRICE
    
    HERITAGE ◄─────────────────────► HYPE
```

---

# 10. MARKET TRENDS

## Current Streetwear Trends (2025-2026)

### Silhouettes
```yaml
trending_up:
  - Boxy/oversized fits (TMH aligned ✓)
  - Wide-leg pants
  - Cropped lengths
  - Layering
trending_down:
  - Skinny fits
  - Slim hoodies
  - Athleisure dominance
```

### Colors
```yaml
trending_up:
  - Earth tones (brown, olive, cream)
  - Archival blues (navy, royal)
  - Muted pastels
  - Black (always)
trending_down:
  - Neon
  - Tie-dye (oversaturated)
  - All-over prints
```

### Aesthetics
```yaml
trending_up:
  - Quiet luxury / stealth wealth
  - Vintage/archival references
  - Workwear influence
  - Japanese minimalism
  - "If you know, you know" energy
trending_down:
  - Loud logos
  - Hype for hype's sake
  - Influencer-bait pieces
```

### Sneaker Trends
```yaml
trending_up:
  - New Balance (990, 550, 2002R)
  - Asics (Gel-Kayano, GT-2160)
  - Adidas Samba/Gazelle
  - Classic runners
  - Hiking/trail silhouettes
trending_down:
  - Triple S/chunky dad shoes
  - Yeezy (post-controversy)
  - Nike Dunk (oversaturated)
stable:
  - Jordan 1 (always)
  - Air Force 1 (always)
  - Timbs in winter (regional)
```

## Social Media Trends

### Platforms
```yaml
instagram:
  - Grid aesthetic still matters
  - Reels dominate reach
  - Stories for engagement
  - 4-5 posts/week optimal
tiktok:
  - Short form video essential
  - Behind-the-scenes performs
  - Trend participation (selective)
  - 1-2 posts/day optimal
youtube:
  - Long-form for brand building
  - Shorts for reach
  - Lookbooks, behind-scenes
```

### Content That Performs
```yaml
high_engagement:
  - Fit pics with grail sneakers
  - City-specific content (local pride)
  - Behind-the-scenes production
  - "Spot the details" posts
  - Model/influencer candids
  - Limited drop announcements
low_engagement:
  - Generic product shots
  - Over-produced content
  - Salesy captions
  - Reposted memes (unless very relevant)
```

## Pricing Trends

```yaml
premium_streetwear_hoodies:
  2023: $120-$165
  2024: $135-$175
  2025: $145-$195
  trend: Prices rising, market accepting
  
tmh_position: $150-$175 (mid-premium, justified by quality)

consumer_behavior:
  - Willing to pay for quality
  - Researches before purchasing
  - Values brand story
  - Wants exclusivity, not mass
```

---

# 11. CONTENT TYPES & FORMATS

## Image Content Types

| Type | Description | Use Case | Specs |
|------|-------------|----------|-------|
| **Product Shot (Ghost)** | Hoodie on invisible mannequin | E-commerce, clean display | 1:1 or 4:5, white/grey BG |
| **Product Shot (Flat Lay)** | Hoodie laid flat with accessories | Social, editorial | 1:1 or 4:5, styled surface |
| **Lifestyle (Single Model)** | Model wearing hoodie in scene | Hero content, ads | 4:5 or 9:16, location |
| **Lifestyle (Multi-Model)** | 2-3 models in scene | Campaign, community vibe | 16:9 or 4:5, location |
| **Detail Shot** | Close-up of embroidery/fabric | Quality showcase | 1:1, macro |
| **Static Ad** | Designed ad creative | Paid social | Per platform specs |

## Video Content Types

| Type | Description | Duration | Pipeline |
|------|-------------|----------|----------|
| **Product GIF** | Short loop of product | 3-5 sec | NB→NB |
| **Product Animation** | Hoodie reveal, rotation | 5-8 sec | NB→NB or NB→VEO3 |
| **Lifestyle Clip** | Model in motion, scene | 8-15 sec | NB→Sora2 or GPT→VEO3 |
| **UGC-Style Ad** | Authentic, phone-shot feel | 12-24 sec | NB→Sora2 |
| **Cinematic Ad** | High production, editorial | 15-24 sec | GPT→VEO3 or GPT→Sora2 |
| **TikTok/Reel** | Platform-native format | 8-15 sec | NB→Sora2 |

## Platform Specifications

| Platform | Image Specs | Video Specs | Caption Length |
|----------|-------------|-------------|----------------|
| **Instagram Feed** | 1080x1350 (4:5) | 1080x1350, 60 sec max | 2,200 chars |
| **Instagram Reels** | 1080x1920 (9:16) | 1080x1920, 90 sec max | 2,200 chars |
| **Instagram Stories** | 1080x1920 (9:16) | 1080x1920, 60 sec max | Short, punchy |
| **TikTok** | 1080x1920 (9:16) | 1080x1920, 10 min max | 2,200 chars |
| **Facebook Feed** | 1200x630 (1.91:1) | 1280x720, 240 min max | 63,206 chars |
| **Twitter/X** | 1200x675 (16:9) | 1920x1080, 2:20 max | 280 chars |

---

# 12. AI PIPELINE CONFIGURATION

## Image Models

| Model ID | OpenRouter Slug | Best For | Cost Tier |
|----------|-----------------|----------|-----------|
| Nano Banana | `nexa/nano-banana` | Primary image gen, can animate | $$ |
| GPT Image 1.5 | `openai/gpt-image-1.5` | High quality stills, comparison | $$$ |

## Video Models

| Model ID | OpenRouter Slug | Duration Limit | Best For | Cost Tier |
|----------|-----------------|----------------|----------|-----------|
| Nano Banana Video | `nexa/nano-banana` | 3-5 sec | GIFs, short loops | $ |
| Sora 2 | `openai/sora-2` | 4, 8, or 12 sec | UGC ads, lifestyle | $$$$ |
| VEO 3 | `google/veo-3` | 4, 6, or 8 sec | Cinematic, longer (via extend) | $$$ |

## Text/Copy Models

| Model ID | OpenRouter Slug | Best For |
|----------|-----------------|----------|
| Claude Sonnet 4.5 | `anthropic/claude-sonnet-4.5` | Brand voice, nuanced copy |
| GPT 5.1 | `openai/gpt-5.1` | Fast iteration, variations |
| DeepSeek | `deepseek/deepseek-v3.2` | Cost-effective drafts |

## Research Model

| Model ID | OpenRouter Slug | Best For |
|----------|-----------------|----------|
| Perplexity Sonar Pro | `perplexity/sonar-pro-search` | City research, market intel, trends |

## Pipeline Combinations

| Pipeline ID | Image Model | Video Model | Duration | Best For | Est. Cost |
|-------------|-------------|-------------|----------|----------|-----------|
| `nb-nb` | Nano Banana | Nano Banana | 3-5 sec | GIFs, product loops | $0.15 |
| `nb-sora2` | Nano Banana | Sora 2 | 8-12 sec | UGC ads, lifestyle | $0.50 |
| `nb-veo3` | Nano Banana | VEO 3 | 8 sec | Cinematic clips | $0.40 |
| `gpt-sora2` | GPT Image | Sora 2 | 8-12 sec | Premium UGC | $0.75 |
| `gpt-veo3` | GPT Image | VEO 3 | 8 sec | Premium cinematic | $0.65 |

## Video Stitching (FFmpeg)

```yaml
max_duration: 24 seconds
stitching_method: FFmpeg concatenate
transition: 0.5 sec crossfade (optional)

sora2_path:
  - Segment 1: 12 sec
  - Segment 2: 12 sec
  - Total: 24 sec (2 API calls)

veo3_path:
  - Segment 1: 8 sec
  - Segment 2: 8 sec
  - Segment 3: 8 sec
  - Total: 24 sec (3 API calls)

output: Single MP4 with metadata
metadata_tracked:
  - segments_used
  - pipelines_per_segment
  - total_cost
  - generation_time
```

## Budget Configuration

```yaml
monthly_budget: 30000 # cents ($300)
test_budget: 1000 # cents ($10)
daily_auto_suggestion_cap: 500 # cents ($5)

alerts:
  - threshold: 80%
    action: warning_notification
  - threshold: 90%
    action: urgent_warning
  - threshold: 100%
    action: hard_stop

cost_tracking:
  - per_pipeline
  - per_content_type
  - per_city
  - per_model
```

---

# 13. FEEDBACK TAXONOMY

## Rating System

```yaml
primary_rating:
  - thumbs_up: Approved, use this
  - thumbs_down: Rejected, don't use
  
status_flow:
  pending_review → (thumbs_up) → approved
  pending_review → (thumbs_down) → rejected
```

## Feedback Tags

### Positive Tags
| Tag | Meaning |
|-----|---------|
| `good_lighting` | Lighting is on point |
| `model_works` | Model casting/styling is right |
| `sneakers_fire` | Sneaker choice is perfect |
| `vibe_correct` | Overall energy matches brand |
| `quality_high` | Image/video quality is excellent |
| `authentic_feel` | Feels real, not AI-generated |
| `would_post` | Ready for social media |
| `hero_content` | Could be a campaign hero |

### Negative Tags
| Tag | Meaning |
|-----|---------|
| `wrong_vibe` | Doesn't match brand energy |
| `lighting_off` | Lighting needs work |
| `model_wrong` | Model doesn't fit |
| `sneakers_off` | Wrong sneaker choice |
| `too_ai` | Looks obviously AI-generated |
| `quality_low` | Resolution or detail issues |
| `not_authentic` | Doesn't feel real |
| `wrong_city` | Doesn't capture city energy |

### Neutral/Specific Tags
| Tag | Meaning |
|-----|---------|
| `needs_edit` | Good base, needs post-processing |
| `close_but` | Almost there, minor issues |
| `try_different_pipeline` | Retry with different models |
| `good_for_b_roll` | Not hero, but usable |

## Text Feedback Processing

When user provides text feedback, extract:

```yaml
extract:
  - preferences (positive statements about what works)
  - dislikes (negative statements about what doesn't)
  - suggestions (what to try instead)
  - learnings (generalizable insights)

examples:
  input: "The Cortez works way better than Jordans for LA shots"
  extract:
    preference: "Nike Cortez for LA"
    dislike: "Jordans for LA"
    learning: "LA + Cortez = strong match"
    action: "Prioritize Cortez for LA generations"
```

---

# 14. CHAT AGENT BEHAVIOR

## Agent Persona

```yaml
name: TMH Creative Assistant
role: Creative director + production assistant
tone: Knowledgeable, efficient, streetwear-fluent
capabilities:
  - Answer questions about TMH brand/rules
  - Generate content from conversation
  - Extract and organize knowledge from chat
  - Provide market intelligence
  - Suggest creative directions
  - Explain decisions and rationale
```

## Context Awareness

The agent always knows:
```yaml
current_context:
  - Active city (if selected)
  - Recent generations
  - Recent feedback given
  - Current budget status
  - Pending reviews count
  
historical_context:
  - All learnings extracted
  - Win rates by pipeline
  - User preferences
  - Past conversations (via RAG)
```

## Insight Extraction

When user says something, agent processes:

```yaml
extraction_types:
  - preference:
      trigger: Positive statement about something
      action: Store as preference, increase weight
      example: "I like the Cortez for LA" → preference(LA, sneakers, Cortez, +1)
  
  - dislike:
      trigger: Negative statement about something
      action: Store as anti-preference, decrease weight
      example: "Navy isn't working" → dislike(colors, navy, -1)
  
  - intel:
      trigger: Competitive or market information
      action: Store in competitor/market section
      example: "Supreme just dropped..." → intel(Supreme, drop, date)
  
  - rule:
      trigger: Statement of how things should be done
      action: Store as rule/guideline
      example: "Always use Cortez for Chicano models" → rule(model, Chicano, sneaker, Cortez)

confirmation:
  low_stakes: Auto-save (preferences, likes/dislikes)
  high_stakes: Confirm before saving (rules, major changes)
```

## Generation from Chat

When user requests generation:

```yaml
trigger_phrases:
  - "generate a..."
  - "create a..."
  - "make me a..."
  - "show me what ... would look like"
  - "try a..."

process:
  1. Parse request for parameters
  2. Fill gaps with defaults/knowledge base
  3. Present 3 configuration options
  4. User selects or modifies
  5. Generate with selected config
  6. Present results for feedback

example:
  user: "Generate a lifestyle shot for LA with the Foo design"
  agent_response: |
    I'll create a lifestyle shot for LA. Here are 3 configurations:
    
    **Option A (Recommended):**
    - Design: FOO
    - Model: Chicano male, M5 style slot
    - Location: Fairfax district
    - Sneakers: Nike Cortez White/Red
    - Pipeline: NB→Sora2 (8 sec video)
    - Est. cost: $0.50
    
    **Option B (Premium):**
    - Design: FOO
    - Model: Chicano male, M2 style slot
    - Location: Venice Beach
    - Sneakers: Jordan 1 LA to Chicago
    - Pipeline: GPT→VEO3 (8 sec video)
    - Est. cost: $0.65
    
    **Option C (Budget):**
    - Design: FOO
    - Model: Chicano male, M5 style slot
    - Location: East LA
    - Sneakers: Nike Cortez
    - Pipeline: NB→NB (5 sec GIF)
    - Est. cost: $0.15
    
    Which would you like, or should I modify any of these?
```

## Knowledge Base Updates

Agent can update knowledge base:

```yaml
update_triggers:
  - User explicitly says "remember this" or "add this"
  - User confirms an extracted insight
  - User provides correction

update_process:
  1. Identify what's being added/changed
  2. Categorize (sneakers, models, rules, etc.)
  3. Present proposed change
  4. User confirms
  5. Update database
  6. Confirm update complete

example:
  user: "Add Nike Air Force 1 'Tiffany' to the grails list"
  agent: |
    I'll add that to Approved Sneakers > Grails:
    
    **Adding:** Nike Air Force 1 "Tiffany & Co."
    **Category:** Tier 1: Ultra Grails
    **Notes:** Tiffany collab, 2022 release
    
    Confirm? (yes/no)
  
  user: "yes"
  agent: "Added Nike Air Force 1 'Tiffany' to Grails. It's now available for all generations."
```

---

# APPENDIX A: DATABASE SCHEMA

## Tables

```sql
-- Approved sneakers
CREATE TABLE approved_sneakers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'ultra_grail', 'heavy_heat', 'certified_heat', 'new_heat', 'city_specific'
  brand TEXT,
  cultural_notes TEXT,
  best_cities JSONB, -- ['NYC', 'LA', 'Any']
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Model specifications
CREATE TABLE model_specs (
  id UUID PRIMARY KEY,
  design_name TEXT, -- NULL = general spec
  gender TEXT,
  ethnicity TEXT,
  age_range TEXT,
  height TEXT,
  build TEXT,
  hairstyle TEXT,
  facial_hair TEXT,
  vibe TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Style slots
CREATE TABLE style_slots (
  id UUID PRIMARY KEY,
  slot_code TEXT NOT NULL, -- 'M1', 'M2', 'W1', etc.
  name TEXT NOT NULL, -- 'Boot Heavy', 'Jordan Head', etc.
  gender TEXT NOT NULL,
  sneaker_vibe TEXT,
  pants_style TEXT,
  chain_style TEXT,
  best_for TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- City profiles
CREATE TABLE city_profiles (
  id UUID PRIMARY KEY,
  city_name TEXT NOT NULL,
  state TEXT,
  area_codes JSONB,
  nicknames JSONB,
  slang_terms JSONB, -- [{term, meaning, usage_example}]
  landmarks JSONB,
  neighborhoods JSONB,
  sports_teams JSONB,
  demographics JSONB,
  design_recommendations JSONB,
  model_recommendations JSONB,
  research_source TEXT, -- 'perplexity', 'manual'
  research_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Competitors
CREATE TABLE competitors (
  id UUID PRIMARY KEY,
  brand_name TEXT NOT NULL,
  category TEXT, -- 'direct', 'premium', 'city_specific', 'fast_fashion'
  positioning TEXT,
  price_range TEXT,
  strengths JSONB,
  weaknesses JSONB,
  watch_for JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Learnings (extracted from feedback + conversations)
CREATE TABLE learnings (
  id UUID PRIMARY KEY,
  category TEXT NOT NULL, -- 'preference', 'dislike', 'rule', 'intel'
  subcategory TEXT, -- 'sneakers', 'colors', 'models', etc.
  insight TEXT NOT NULL,
  city_id UUID REFERENCES city_profiles(id), -- NULL = applies to all
  weight FLOAT DEFAULT 1.0, -- Increases with repeated confirmation
  source_type TEXT, -- 'feedback', 'conversation', 'manual'
  source_id UUID,
  auto_apply BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Brand guidelines
CREATE TABLE brand_guidelines (
  id UUID PRIMARY KEY,
  category TEXT NOT NULL, -- 'voice', 'non_negotiable', 'aesthetic'
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# APPENDIX B: PROMPT TEMPLATES

## City Research Prompt (Perplexity)

```
Research the city of {{city_name}}, {{state}} for a premium streetwear brand targeting millennials and Gen Z (ages 22-35, income $100K+).

I need deep, authentic information about:

1. LOCAL SLANG
- What do locals actually say? Not tourist terms.
- Include origin/meaning and usage examples
- Focus on terms that would resonate with streetwear culture

2. LANDMARKS & NEIGHBORHOODS
- Iconic spots locals are proud of
- Neighborhoods with streetwear/urban culture significance
- Places that would work as lifestyle photo backdrops

3. AREA CODES
- All area codes and which areas they cover
- Which codes have cultural significance (like 212 for NYC)

4. POP CULTURE
- Celebrities/artists from here who influence streetwear
- Songs, movies, shows that reference this city
- Current trends among young people here

5. STREETWEAR SCENE
- Local streetwear stores and boutiques
- Local streetwear brands
- Style notes (what's the local flavor?)

6. DEMOGRAPHICS
- Primary ethnic/cultural communities
- How this affects local streetwear style
- Who would our target customer be here?

7. SPORTS & CULTURE
- Major teams and their colors
- Cultural moments of pride
- Rivalries or identity markers

Format your response as structured data I can parse. Be specific and authentic - we want the real local perspective, not tourist guide info.
```

## Image Generation Prompt Template

```
Professional streetwear fashion photoshoot.

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
- Watch: Rolex {{watch_model}} visible on wrist
{{#if additional_accessories}}
- Additional: {{additional_accessories}}
{{/if}}

SETTING:
{{#if is_studio}}
Studio shot, {{backdrop_color}} backdrop.
Lighting: Key light 45° right, fill light left at 40%, rim light behind left.
Camera: 85mm, eye level with slight low angle.
{{else}}
Location: {{location_name}}, {{city_name}}
Time: {{time_of_day}}
Vibe: Natural, "caught in the wild", not posed.
{{/if}}

MOOD:
{{brand_vibe}} - Confident, authentic, premium streetwear.
"If you know, you know" energy.

QUALITY:
Professional fashion photography, 4K quality, sharp focus on hoodie details and embroidery.
```

## Video Generation Prompt Template

```
Create a {{duration}} second video for a premium streetwear brand.

SCENE:
{{scene_description}}

SUBJECT:
{{model_description}} wearing {{hoodie_description}}.
Styled with {{styling_details}}.

MOTION:
{{motion_description}}
Camera: {{camera_movement}}

MOOD:
{{mood_description}}
Energy: Confident, authentic streetwear. Premium but not pretentious.

AUDIO (if applicable):
{{audio_notes}}

TECHNICAL:
- Resolution: {{resolution}}
- Aspect ratio: {{aspect_ratio}}
- Style: {{style_notes}}
```

---

# APPENDIX C: API ENDPOINTS NEEDED

```yaml
# Knowledge Base Management
GET /api/knowledge/sneakers          # List all sneakers
POST /api/knowledge/sneakers         # Add sneaker
PUT /api/knowledge/sneakers/:id      # Update sneaker
DELETE /api/knowledge/sneakers/:id   # Delete sneaker

GET /api/knowledge/models            # List model specs
POST /api/knowledge/models           # Add model spec
PUT /api/knowledge/models/:id        # Update model spec
DELETE /api/knowledge/models/:id     # Delete model spec

GET /api/knowledge/style-slots       # List style slots
PUT /api/knowledge/style-slots/:id   # Update style slot

GET /api/knowledge/competitors       # List competitors
POST /api/knowledge/competitors      # Add competitor
PUT /api/knowledge/competitors/:id   # Update competitor

GET /api/knowledge/learnings         # List learnings
POST /api/knowledge/learnings        # Add learning (from chat extraction)
DELETE /api/knowledge/learnings/:id  # Remove learning

# City Management
GET /api/cities                      # List all cities
POST /api/cities                     # Create city (triggers Perplexity research)
GET /api/cities/:id                  # Get city profile
PUT /api/cities/:id                  # Update city profile
DELETE /api/cities/:id               # Delete city

# Generation
POST /api/generate/research          # Run Perplexity research for city
POST /api/generate/image             # Generate image
POST /api/generate/video             # Generate video
POST /api/generate/video/stitch      # Stitch video segments (FFmpeg)
POST /api/generate/batch             # Batch generate (test run)

# Chat
POST /api/chat                       # Send message, get response
POST /api/chat/extract               # Extract insights from conversation
GET /api/chat/history                # Get conversation history

# Feedback
POST /api/feedback                   # Submit feedback on content
GET /api/feedback/analytics          # Get feedback analytics

# Dashboard
GET /api/dashboard/summary           # Main dashboard data
GET /api/dashboard/suggestions       # Suggested content to review
GET /api/dashboard/budget            # Budget status
```

---

# VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-21 | Initial creation |

---

*This document is the source of truth for the TMH AI Content Engine. All sections are editable via the app UI.*
