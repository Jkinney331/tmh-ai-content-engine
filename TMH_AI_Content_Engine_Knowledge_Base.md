# TMH (That's My Hoodie) - AI Content Engine Knowledge Base
## Complete System Documentation for Automated Content Generation

**Document Purpose:** This is the comprehensive knowledge base for the TMH AI Content Engine. It provides full context for automated systems to generate product designs, lifestyle photography, video ads, and social content while learning user preferences over time.

**Last Updated:** January 2026  
**System Owner:** Jay (Founder/CEO)  
**Website:** ThatsMyHoodie.com

---

# TABLE OF CONTENTS

1. [BRAND EVOLUTION: WHERE WE STARTED TO WHERE WE ARE](#section-1-brand-evolution)
2. [BRAND IDENTITY & AESTHETIC DNA](#section-2-brand-identity--aesthetic-dna)
3. [TARGET CUSTOMER PROFILE](#section-3-target-customer-profile)
4. [PRODUCT SPECIFICATIONS & STANDARDS](#section-4-product-specifications--standards)
5. [COMPLETE CITY PLAYBOOK](#section-5-complete-city-playbook)
6. [AI MODEL CONFIGURATION & USAGE](#section-6-ai-model-configuration--usage)
7. [MASTER PROMPT LIBRARY](#section-7-master-prompt-library)
8. [MODEL STYLING & CASTING GUIDE](#section-8-model-styling--casting-guide)
9. [AD & CONTENT STRATEGY](#section-9-ad--content-strategy)
10. [PREFERENCE LEARNING SYSTEM](#section-10-preference-learning-system)
11. [HARD RULES & SOFT PREFERENCES](#section-11-hard-rules--soft-preferences)
12. [SYSTEM WORKFLOWS](#section-12-system-workflows)

---

# SECTION 1: BRAND EVOLUTION

## The Journey: Where We Started → Where We Are

### Phase 1: Concept & Validation (November 2024)

**Initial Vision:**
- Premium streetwear brand built on hometown pride
- Cold-weather cities where hoodie culture is embedded in daily life
- "If you know, you know" approach - insider references only locals understand

**Original Positioning:**
- Price Point: $60 retail
- Target Age: 18-35
- Target Income: Middle class
- Business Model: Print-on-demand via Printful + Shopify
- Revenue Goal: $100,000 in 45-60 days

**Key Learnings from This Phase:**
- 99designs logo contest produced 107 submissions - ALL fell into tired patterns (literal location pins, cartoon hoodies)
- Realized we needed to control the creative process with AI prompts rather than outsourcing to designers who didn't understand the vision
- Built prompt libraries that guide image generation toward "sporty luxury" aesthetics

### Phase 2: Premium Repositioning (December 2024 - January 2025)

**Strategic Pivot:**
The brand evolved from accessible streetwear to premium positioning:

| Attribute | Original | Current |
|-----------|----------|---------|
| **Price Point** | $60 | $150-175 |
| **Target Age** | 18-35 | 24-35 |
| **Target Income** | Middle class | $100K-$200K+ |
| **Fabric Quality** | Standard | 400-450 GSM heavyweight |
| **Brand Positioning** | Affordable pride | Sporty luxury |
| **Competitive Set** | Generic merch | Kith, Supreme, Moncler |

**Why This Pivot:**
- Realized $60 hoodies compete with commodity products
- Premium customers buy identity, not just fabric
- Higher margins allow for better quality and marketing
- Sporty luxury positioning creates defensible brand

### Phase 3: AI Infrastructure Build (December 2024 - Present)

**What We Built:**
- Complete prompt libraries for every content type
- City-by-city playbooks with cultural research
- Model styling guides with specific casting
- Video ad frameworks for Sora 2
- Supabase database with 13+ tables for operations
- n8n workflow automation for content generation

**Current State:**
- 9 cities fully researched and documented
- 50+ design concepts across collections
- Comprehensive prompt templates for all content types
- Team of 4 video producers using our frameworks
- Princess onboarded as Ecommerce Manager

---

# SECTION 2: BRAND IDENTITY & AESTHETIC DNA

## What Makes a "TMH Look"

### The Non-Negotiables

TMH is NOT:
- Tourist merchandise
- Generic city gear
- Fast fashion
- Mass market

TMH IS:
- Premium hometown identity
- Insider culture you can wear
- Sporty luxury for the streets
- Specific, authentic, unapologetic

### The "Is This Dope?" Test

When evaluating any creative output, ask: **"Is this dope?"**

If yes → approve  
If no → reject

TMH succeeds by being undeniably, specifically, unapologetically dope. That's the filter. That's the standard.

### Visual DNA

**Inspiration Brands:**
- **Moncler:** Cartoon rooster executed with premium badge aesthetic
- **Stone Island:** Compass rose with technical/precise rendering
- **Arc'teryx:** Fossil creature with geometric abstraction
- **The North Face:** Half dome simplified to iconic perfection
- **Kith:** Drop culture, limited releases, quality over quantity
- **Supreme:** Scarcity model, cultural credibility

**The Pattern We Follow:**
Literal symbols executed with technical mastery, perfect proportions, and premium materials feel.

### Color Philosophy

**Base Palette (Always Available):**
- Black (primary)
- Navy Blue
- Forest Green
- Charcoal/Heather Grey
- Cream/Off-White

**City-Specific Colors:**
Each city gets colorways tied to local teams, culture, or landmarks. See Section 5 for city-specific palettes.

**Embroidery Thread Standards:**
- Dark hoodies: White, cream, gold, silver thread
- Light hoodies: Black, navy, charcoal thread
- Always high contrast for visibility
- Metallic threads for premium accent

### Logo Guidelines

**TMH Clothing Logo (Required on ALL products):**
- "TMH" in bold block letters (NOT cursive)
- "Clothing" in cursive script below
- Two-line vertical stack
- Standard placement: Right wrist cuff (~1.5" width)
- Alternative: Back neck below collar

**Logo Execution Standards:**
- Must work at 1" embroidered on hoodie chest
- Minimum 2-3mm line weight for embroidery visibility
- Embroidery-friendly (no gradients, no thin lines)
- Monochromatic (black or white, depending on base)

### What We Avoid

❌ Cartoon/clipart style rendering  
❌ Overly busy designs - too much detail  
❌ Poor hierarchy - elements competing equally  
❌ Cheap typography - generic fonts  
❌ Asymmetry without purpose  
❌ Thin lines that won't embroider well  
❌ Trendy effects (gradients, drop shadows, grunge)  
❌ Generic skylines without local specificity  
❌ Anything that looks like airport gift shop merch  
❌ Designs that require explanation  

---

# SECTION 3: TARGET CUSTOMER PROFILE

## Demographics

| Attribute | Profile |
|-----------|---------|
| **Age** | 24-35 years old |
| **Income** | $100K-$200K+ annually |
| **Location** | NYC, Detroit, Chicago, Boston, Seattle + expansion cities |
| **Price Tolerance** | $150-175 per hoodie |
| **Gender** | 60% Male / 40% Female |

## Psychographics: Who They Are

The TMH customer is:

- **The Wall Street guy who's still streetwear** — Makes money but loves hip-hop
- **Hip-hop music artist managers** — Entertainment industry professionals
- **Finance bros who stood in line for sneakers as kids** — Made it but kept the culture
- **Real estate professionals who "still got their shit together"** — Successful but authentic
- **The Syracuse kid who came from upstate, made it to the city, and stays fresh**
- **Tech workers who grew up on Dipset and still rock Jordans to meetings**

## Lifestyle Markers

The TMH customer:
- Wears a Rolex
- Drives a Tesla
- Clothes are baggy, doesn't fit traditional corporate mold
- Loves hip-hop music (grew up on it)
- Stood in line for sneakers as a kid
- Makes $150K+ a year
- Eats at nice restaurants
- Goes to concerts, travels, gets shit done
- **Reps their hood, where they or their people are from**

## Ethnic Diversity (Reflecting City Demographics)

- 30% Black/African American
- 25% Hispanic/Latino (Dominican, Puerto Rican, Mexican)
- 20% White
- 15% Asian (Chinese, Korean, South Asian)
- 10% Mixed/Other ethnicities

## The Emotional Driver

TMH customers aren't buying a hoodie. They're buying:
- **Identity confirmation** — "This is who I am"
- **Belonging** — "These are my people"
- **Nostalgia** — "Where I came from made me"
- **Status** — "I made it but I didn't forget"
- **Conversation** — "You from there too?"

---

# SECTION 4: PRODUCT SPECIFICATIONS & STANDARDS

## Fabric & Construction

| Specification | Standard |
|---------------|----------|
| **Fabric Weight** | 400-450 GSM (heavyweight) |
| **Material** | Premium cotton blend (80% cotton / 20% polyester) |
| **Interior** | Soft brushed fleece lining |
| **Hood** | Quality drawstring with metal or reinforced aglets |
| **Cuffs & Waistband** | 2x2 ribbed knit with elasticity retention |
| **Pockets** | Kangaroo style with reinforced stitching |
| **Construction** | Double-stitched seams, reinforced stress points |

## Embroidery Standards

| Specification | Standard |
|---------------|----------|
| **Thread Quality** | Premium polyester, colorfast and durable |
| **Stitch Density** | High-density (minimum 5,000 stitches per design) |
| **Backing** | Tearaway stabilizer for clean finish |
| **Detail Level** | Simple enough for thread, complex enough for premium |

## Product Types

### Currently Active:
1. **Pullover Hoodies** — Core product, 400-450 GSM
2. **Crewneck Sweatshirts** — Same quality standards
3. **T-Shirts** — Premium heavyweight cotton

### Future Expansion:
4. **Hats/Caps** — Fitted, snapback, beanies
5. **Outerwear** — Varsity jackets, bombers
6. **Accessories** — Bags, scarves, gloves

## Sizing Strategy

- Unisex sizing with true-to-size fit
- Size range: XS - 3XL
- Relaxed/slightly oversized cut (streetwear standard)
- Size guide with actual measurements on product pages

## Pricing Strategy

| Product | Price Point | Positioning |
|---------|-------------|-------------|
| **Pullover Hoodie** | $150-175 | Premium streetwear |
| **Crewneck** | $125-150 | Premium casual |
| **T-Shirt** | $65-85 | Premium basics |

**Why These Prices:**
- Signals quality and exclusivity
- Filters for target customer
- Supports quality materials and manufacturing
- Allows margin for proper marketing

## Manufacturing Partners

| Partner | Products | Notes |
|---------|----------|-------|
| **Tapstitch** | Premium embroidered pieces | Flagship designs |
| **POD Partner** | Standard embroidered | Volume production |
| **Printful** | Testing/samples | Quick iterations |

---

# SECTION 5: COMPLETE CITY PLAYBOOK

## City Onboarding Framework

When adding a new city, the system should:

1. **Research Phase:**
   - Identify city nicknames (official and street)
   - Compile local slang dictionary (20+ terms minimum)
   - Map iconic landmarks (Tier 1, 2, 3)
   - Document sports teams and colors
   - Identify cultural touchpoints (music, food, history)
   - Find "if you know, you know" insider references

2. **Design Phase:**
   - Generate 5-8 core design concepts
   - Create city-specific colorways
   - Develop seasonal variants (Christmas, etc.)

3. **Content Phase:**
   - Identify location banks for photo backgrounds
   - Define model demographics for city
   - Create city-specific prompt variables

---

## NYC (NEW YORK CITY) - FLAGSHIP CITY

### City Nicknames
- The Big Apple
- The City
- NYC
- The Five Boroughs
- Gotham

### Complete Slang Dictionary

| Term | Meaning | Design Potential |
|------|---------|------------------|
| **DEADASS** | Seriously / For real | ⭐⭐⭐⭐⭐ (Flagship) |
| **YERR** | Greeting call across the street | ⭐⭐⭐⭐⭐ (Flagship) |
| **BODEGA** | Corner store, NYC institution | ⭐⭐⭐⭐⭐ (Flagship) |
| **FUHGEDDABOUDIT** | Forget about it (Italian-NYC) | ⭐⭐⭐⭐⭐ |
| **BRICK** | Very cold outside | ⭐⭐⭐⭐ |
| **MAD** | Very/A lot | ⭐⭐⭐ |
| **TIGHT** | Cool/Angry (context dependent) | ⭐⭐⭐ |
| **DEADASS B** | Seriously, bro | ⭐⭐⭐ |
| **OD** | Overdoing it / Too much | ⭐⭐⭐ |
| **BUGGIN** | Acting crazy | ⭐⭐ |

### Iconic Landmarks

**Tier 1 (Primary Backgrounds):**
- Brooklyn Bridge
- Empire State Building
- Statue of Liberty
- Times Square
- Central Park

**Tier 2 (Neighborhood):**
- Brownstone stoops (Brooklyn, Harlem)
- Corner bodegas with yellow awnings
- Subway platforms and entrances
- Fire escapes
- Basketball courts (Rucker Park)

**Tier 3 (Cultural):**
- John's Pizzeria Times Square (stained glass dome)
- Madison Square Garden
- Apollo Theater
- Katz's Deli
- Washington Square Park arch

### NYC Design Collection

#### DESIGN 1: DEADASS
- **Meaning:** NYC way of saying "seriously" or "I'm not lying"
- **Vibe:** Confident, direct, undeniable NYC energy
- **Colorways:** Cream (primary), Black, Navy
- **Front:** "DEADASS" bold text + skull emoji + peach emoji
- **Back:** Five boroughs listed or NYC skyline

#### DESIGN 2: YERR
- **Meaning:** The call across the street to get someone's attention
- **Vibe:** Energetic, community, call-and-response
- **Colorways:** Black, Navy, Forest Green, Olive, Grey, Blue
- **Front:** Silhouette person yelling "YERR" with hands cupped
- **Back:** NYC skyline with "YERR" echoing back

#### DESIGN 3: BODEGA
- **Meaning:** The corner store, NYC institution
- **Vibe:** Retro deli aesthetic, 24/7 culture
- **Colorways:** Mustard Yellow (primary), Black, Navy Blue
- **Front:** "BODEGA OPEN 24/7" purple collegiate text
- **Special Features:** Bodega cat silhouette on sleeve

#### DESIGN 4: FUHGEDDABOUDIT
- **Meaning:** "Forget about it" — classic Italian-NYC slang
- **Vibe:** Faded/gradient collection, Italian-American heritage
- **Colorways:** Green Fade, Blue Fade, Black/Smoke Fade, Sand/Tan Fade
- **Back:** Five boroughs: Manhattan • Brooklyn • Queens • Bronx • Staten Island

#### DESIGN 5: YERR-Y CHRISTMAS (Seasonal)
- **Vibe:** Holiday collection, NYC Christmas energy
- **Colorways:** Forest Green, Red
- **Front:** "YERR-Y CHRISTMAS" with holiday elements

### NYC Sports Colorways

| Team | Colors | Design Application |
|------|--------|-------------------|
| **Yankees** | Navy/White | Classic NYC |
| **Mets** | Blue/Orange | Queens pride |
| **Knicks** | Blue/Orange | Basketball culture |
| **Giants** | Blue/Red | Football heritage |
| **Jets** | Green/White | Alternative football |

### NYC Location Banks (Photo Backgrounds)

**Premium Locations:**
- John's Pizzeria stained glass dome interior
- MSG courtside during Knicks game
- Brooklyn Bridge pedestrian walkway at golden hour
- Brownstone stoop in Brooklyn Heights
- Corner bodega with neon signs at night

---

## DETROIT - MOTOR CITY

### City Nicknames
- Motor City
- Motown
- The D
- The 313
- Hockeytown

### Complete Slang Dictionary

| Term | Meaning | Design Potential |
|------|---------|------------------|
| **WHAT UP DOE** | Detroit greeting (intimate, warm) | ⭐⭐⭐⭐⭐ (Flagship) |
| **313** | Area code pride | ⭐⭐⭐⭐⭐ |
| **MOTOR CITY** | City nickname | ⭐⭐⭐⭐⭐ |
| **MOTOWN** | Music heritage | ⭐⭐⭐⭐⭐ |
| **THE D** | Detroit abbreviation | ⭐⭐⭐⭐ |
| **THE MILE** | 8 Mile Road (Eminem) | ⭐⭐⭐⭐ |
| **CONEY & POP** | Coney dog + soda | ⭐⭐⭐ |
| **DA LAKE** | Lake Michigan | ⭐⭐ |

### Iconic Landmarks

**Tier 1 (Primary):**
- Joe Louis Fist
- Renaissance Center (RenCen)
- Spirit of Detroit statue
- Michigan Central Station

**Tier 2 (Neighborhood):**
- 8 Mile Road
- Corktown historic district
- Eastern Market
- Belle Isle

**Tier 3 (Cultural):**
- Motown Museum (Hitsville U.S.A.)
- Fox Theatre
- Heidelberg Project
- Diego Rivera murals (DIA)

### Detroit Design Collection

#### DESIGN 1: WHAT UP DOE
- **Meaning:** Detroit greeting (intimate, warm)
- **Vibe:** Soulful, close, Motown heritage
- **Colorways:** Black, Navy, Red/Green (Christmas)
- **Front:** "WHAT UP DOE" in warm, welcoming typography
- **Back:** Spirit of Detroit or Joe Louis Fist silhouette

#### DESIGN 2: MOTOWN ESTABLISHED 1959
- **Meaning:** Music history, Detroit pride
- **Vibe:** Heritage, classic, musical
- **Colorways:** Black, Cream, Maroon
- **Front:** "MOTOWN" with vinyl record element or musical notes

#### DESIGN 3: 313
- **Meaning:** Area code, Detroit identity
- **Vibe:** Bold, proud, unmistakable
- **Colorways:** Black with multicolor (all Detroit sports), Navy
- **Front:** Large "313" numbers

#### DESIGN 4: THE D
- **Meaning:** Detroit abbreviation
- **Vibe:** Clean, modern, versatile
- **Colorways:** Maize Yellow (U of M), Pastel Lavender (women's), Black
- **Front:** "THE D" with city skyline inside letters

#### DESIGN 5: WHAT UP DOE HO HO (Christmas)
- **Vibe:** Holiday Detroit energy
- **Colorways:** Red, Green

### Detroit Sports Colorways

| Team | Colors | Design Application |
|------|--------|-------------------|
| **Lions** | Honolulu Blue/Silver | Football pride |
| **Tigers** | Navy/Orange | Baseball heritage |
| **Red Wings** | Red/White | Hockey town |
| **Pistons** | Blue/Red | Bad Boys era |
| **U of M** | Maize/Blue | College connection |

### Detroit Location Banks

**Premium Locations:**
- Joe Louis Fist monument
- Spirit of Detroit statue
- Michigan Central Station (restored)
- Belle Isle with skyline across river
- Eastern Market murals

---

## CHICAGO - THE CHI

### City Nicknames
- The Chi (pronounced "Shy")
- Chi-Town
- The Windy City
- Second City
- City of Big Shoulders

### Complete Slang Dictionary

| Term | Meaning | Design Potential |
|------|---------|------------------|
| **THE CHI** | What locals call Chicago | ⭐⭐⭐⭐⭐ (Flagship) |
| **LSD** | Lake Shore Drive (NOT the drug) | ⭐⭐⭐⭐⭐ |
| **THE BEAN** | Cloud Gate sculpture | ⭐⭐⭐⭐⭐ |
| **DESE DEM DOSE** | Chicago accent (these, them, those) | ⭐⭐⭐⭐ |
| **312/773** | Area codes (downtown/neighborhoods) | ⭐⭐⭐⭐ |
| **DA BEARS** | Chicago Bears reference | ⭐⭐⭐ |

### Iconic Landmarks

**Tier 1 (Primary):**
- The Bean (Cloud Gate)
- Willis Tower (Sears Tower)
- Chicago skyline
- Lake Michigan shoreline

**Tier 2 (Neighborhood):**
- Wrigley Field
- L train elevated tracks
- Navy Pier
- Magnificent Mile

**Tier 3 (Cultural):**
- Chicago Theatre marquee
- Buckingham Fountain
- Art Institute lions
- Deep dish pizza spots

### Chicago Design Collection

#### DESIGN 1: THE CHI
- **Meaning:** What locals call Chicago
- **Vibe:** Urban pride, L train culture
- **Colorways:** Black (primary), Navy, Cream (women's)
- **Front:** "THE CHI" bold typography
- **Back:** L train graphic or Chicago skyline

#### DESIGN 2: DESE DEM DOSE
- **Meaning:** Chicago accent for "these, them, those"
- **Vibe:** Playful, local humor, working class pride
- **Colorways:** Navy, Cream, Bears Orange/Navy
- **Variations:** Vintage jazz era (1920s aesthetic), Bears colorway

#### DESIGN 3: LSD
- **Meaning:** Lake Shore Drive
- **Vibe:** Iconic highway, lakefront life
- **Colorways:** Navy with white, Grey with blue
- **Front:** "LSD" with curved road graphic
- **Important:** Must make clear it's about the road (add "LAKE SHORE DRIVE" text)

### Chicago Sports Colorways

| Team | Colors | Design Application |
|------|--------|-------------------|
| **Bears** | Navy/Orange | Football heritage |
| **Cubs** | Blue/Red | North side |
| **White Sox** | Black/White | South side |
| **Bulls** | Red/Black | Jordan era |
| **Blackhawks** | Red/Black | Hockey |

### Chicago Location Banks

**Premium Locations:**
- The Bean reflection shots
- L train platform (elevated)
- Lake Shore Drive curve
- Wrigley Field exterior
- Chicago Theatre marquee at night

---

## BOSTON - BEANTOWN

### City Nicknames
- Beantown
- The Hub
- Titletown
- The Cradle of Liberty

### Complete Slang Dictionary

| Term | Meaning | Design Potential |
|------|---------|------------------|
| **WICKED PISSAH** | Really awesome | ⭐⭐⭐⭐⭐ (Flagship) |
| **PAHK THE CAH** | Park the car (accent) | ⭐⭐⭐⭐⭐ |
| **JAGOFF** | Jerk (family-friendly insult) | ⭐⭐⭐⭐ |
| **SOUTHIE** | South Boston | ⭐⭐⭐⭐ |
| **WICKED** | Very/Really | ⭐⭐⭐⭐ |
| **MASSHOLE** | Massachusetts driver | ⭐⭐⭐ |
| **THE T** | Subway system | ⭐⭐⭐ |
| **DUNKS** | Dunkin' Donuts | ⭐⭐ |

### Iconic Landmarks

**Tier 1 (Primary):**
- Fenway Park
- Boston Harbor
- Freedom Trail
- Faneuil Hall/Quincy Market

**Tier 2 (Neighborhood):**
- Southie (South Boston)
- North End (Italian)
- Newbury Street
- Beacon Hill
- Harvard Yard

**Tier 3 (Cultural):**
- TD Garden
- The T stations
- Triple-deckers (houses)
- Irish pubs

### Boston Design Collection

#### DESIGN 1: WICKED PISSAH
- **Meaning:** Boston slang for "really awesome"
- **Vibe:** Local pride, authentic, playful
- **Colorways:** Celtics Green/Gold, Forest Green/Brown
- **Variations:** Minimal text only, or with "boy peeing" silhouette (Boston humor)

#### DESIGN 2: PAHK THE CAH
- **Meaning:** Boston accent for "Park the car"
- **Vibe:** Working-class, family, funny
- **Colorways:** Navy, Grey
- **Optional:** Harvard Yard reference

#### DESIGN 3: JAGOFF
- **Meaning:** Boston/Philly slang term
- **Vibe:** Holiday, family chaos (Christmas version)
- **Colorways:** Red (Christmas primary)

#### DESIGN 4: FRICKIN LEPRECHAUN (Christmas)
- **Vibe:** Irish heritage + Christmas
- **Colorways:** Red, Forest green, Navy, Burgundy
- **Front:** Large leprechaun character (Santa variant)

#### DESIGN 5: THE PARQUET
- **Meaning:** Celtics parquet floor
- **Vibe:** Heritage basketball design
- **Colorways:** Cream with Celtics green/brown pattern
- **Front:** Geometric parquet floor pattern embroidered

### Boston Sports Colorways

| Team | Colors | Design Application |
|------|--------|-------------------|
| **Celtics** | Green/Gold | Parquet heritage |
| **Red Sox** | Navy/Red | Baseball classic |
| **Bruins** | Black/Gold | Hockey |
| **Patriots** | Navy/Red/Silver | Football dynasty |

### Boston Location Banks

**Premium Locations:**
- Fenway Park exterior/Green Monster
- Newbury Street brownstones
- Boston Harbor waterfront
- North End Italian neighborhood
- Beacon Hill cobblestones

---

## SEATTLE - EMERALD CITY

### City Nicknames
- Emerald City
- The 206
- Rain City
- Jet City
- Gateway to Alaska

### Complete Slang Dictionary

| Term | Meaning | Design Potential |
|------|---------|------------------|
| **SEATTLE FREEZE** | Seattle's social coldness | ⭐⭐⭐⭐⭐ (Flagship) |
| **206 PREFUNK** | Area code + pre-gaming | ⭐⭐⭐⭐⭐ |
| **LIQUID SUNSHINE** | What Seattleites call rain | ⭐⭐⭐⭐ |
| **EMERALD CITY** | City nickname | ⭐⭐⭐⭐ |
| **THE 12s** | Seahawks fans | ⭐⭐⭐ |
| **VITAMIN R** | Rainier Beer | ⭐⭐⭐ |
| **NO UMBRELLA** | Real Seattleites don't use them | ⭐⭐⭐ |

### Iconic Landmarks

**Tier 1 (Primary):**
- Space Needle
- Pike Place Market
- Mt. Rainier (backdrop)
- Puget Sound

**Tier 2 (Neighborhood):**
- Capitol Hill
- Fremont Troll
- Gas Works Park
- Kerry Park viewpoint

**Tier 3 (Cultural):**
- Gum Wall
- Original Starbucks
- EMP Museum
- Fisherman's Terminal

### Seattle Design Collection

#### DESIGN 1: SEATTLE FREEZE
- **Meaning:** Seattle's reputation for social distance
- **Vibe:** Ironic, self-aware, rain culture
- **Colorways:** Ice Blue, Slate Grey, Black
- **Front:** "SEATTLE FREEZE" in icicle-style letters
- **Back:** Minimalist figure with speech bubble "I'M FINE"

#### DESIGN 2: 206 PREFUNK
- **Meaning:** Area code + Seattle pre-gaming culture
- **Vibe:** Local insider, party culture
- **Colorways:** Grey, Navy, Forest Green
- **Special Feature:** Space Needle as the "0" in 206

#### DESIGN 3: LIQUID SUNSHINE
- **Meaning:** What Seattleites call rain
- **Vibe:** Weather-positive, rain culture
- **Colorways:** Slate Blue, Grey
- **Special Features:** Water-resistant exterior, crossed-out umbrella icon

#### DESIGN 4: EMERALD CITY
- **Meaning:** Seattle's nickname
- **Vibe:** City pride, PNW
- **Colorways:** Forest Green, Emerald

### Seattle Sports Colorways

| Team | Colors | Design Application |
|------|--------|-------------------|
| **Seahawks** | Navy/Action Green | 12th man |
| **Mariners** | Navy/Teal | Baseball |
| **Kraken** | Deep Sea Blue/Ice Blue | New hockey |
| **Sounders** | Rave Green | Soccer |

### Seattle Location Banks

**Premium Locations:**
- Space Needle with Mt. Rainier backdrop
- Pike Place Market neon sign
- Kerry Park skyline view
- Fremont Troll
- Gas Works Park with skyline

---

## PORTLAND - PDX

### City Nicknames
- PDX
- Stumptown
- Rose City
- Bridge City
- Rip City

### Complete Slang Dictionary

| Term | Meaning | Design Potential |
|------|---------|------------------|
| **PDX** | Airport code, city identity | ⭐⭐⭐⭐⭐ |
| **KEEP PORTLAND WEIRD** | City motto | ⭐⭐⭐⭐⭐ |
| **THE GORGE** | Columbia River Gorge | ⭐⭐⭐⭐ |
| **NO UMBRELLA** | Real Portlanders don't use them | ⭐⭐⭐ |
| **STUMPTOWN** | Coffee culture reference | ⭐⭐⭐ |

### Iconic Landmarks

**Tier 1 (Primary):**
- Mt. Hood
- Portland bridges (St. Johns, Hawthorne)
- International Rose Test Garden
- Powell's Books

**Tier 2 (Neighborhood):**
- Alberta Arts District
- NW 23rd
- The Pearl District
- Hawthorne

**Tier 3 (Cultural):**
- Portlandia statue
- Voodoo Doughnut
- Food cart pods
- Forest Park

### Portland Sports Colorways

| Team | Colors | Design Application |
|------|--------|-------------------|
| **Trail Blazers** | Red/Black/White | Rip City |
| **Timbers** | Green/Gold | Soccer culture |

---

## MILWAUKEE - BREW CITY

### City Nicknames
- Brew City
- MKE
- Mil-Town
- The Dirty Mill
- Cream City

### Complete Slang Dictionary

| Term | Meaning | Design Potential |
|------|---------|------------------|
| **BUBBLER** | Drinking fountain (very Wisconsin!) | ⭐⭐⭐⭐⭐ |
| **BRATS** | Bratwurst (rhymes with "shots") | ⭐⭐⭐⭐ |
| **BREW CITY** | City nickname | ⭐⭐⭐⭐ |
| **CHEESEHEAD** | Wisconsin resident | ⭐⭐⭐⭐ |
| **HOG** | Harley Davidson motorcycle | ⭐⭐⭐ |
| **YOU BETCHA** | Yes/agreement | ⭐⭐⭐ |

### Iconic Landmarks

**Tier 1 (Primary):**
- Milwaukee Art Museum (Calatrava wings)
- Miller Park / American Family Field
- Harley-Davidson Museum
- Milwaukee River

**Tier 2 (Neighborhood):**
- Historic Third Ward
- Brady Street
- Bay View
- Walker's Point

### Milwaukee Sports Colorways

| Team | Colors | Design Application |
|------|--------|-------------------|
| **Bucks** | Green/Cream | Championship era |
| **Brewers** | Navy/Gold | Beer barrel |
| **Packers** | Green/Gold | Wisconsin connection |

---

## PITTSBURGH - STEEL CITY

### City Nicknames
- Steel City
- The 'Burgh
- City of Bridges
- City of Champions

### Complete Slang Dictionary

| Term | Meaning | Design Potential |
|------|---------|------------------|
| **YINZ** | You all (Pittsburgh's "y'all") | ⭐⭐⭐⭐⭐ (Flagship) |
| **DAHNTAHN** | Downtown | ⭐⭐⭐⭐⭐ |
| **JAGOFF** | Jerk (shared with Boston) | ⭐⭐⭐⭐ |
| **STILLERS** | Steelers | ⭐⭐⭐⭐ |
| **N'AT** | And that (sentence ender) | ⭐⭐⭐ |

### Iconic Landmarks

**Tier 1 (Primary):**
- Three Rivers confluence
- Inclines (Duquesne, Monongahela)
- Point State Park fountain
- Steel bridges

### Pittsburgh Sports Colorways

| Team | Colors | Design Application |
|------|--------|-------------------|
| **Steelers** | Black/Gold | Steel curtain |
| **Penguins** | Black/Gold | Hockey |
| **Pirates** | Black/Gold | Baseball |

---

## CLEVELAND - THE LAND

### City Nicknames
- The Land
- CLE
- The 216
- Forest City
- Rock and Roll Capital

### Complete Slang Dictionary

| Term | Meaning | Design Potential |
|------|---------|------------------|
| **THE LAND** | Cleveland (LeBron popularized) | ⭐⭐⭐⭐⭐ |
| **216** | Area code | ⭐⭐⭐⭐ |
| **LAKE EFFECT** | Weather phenomenon | ⭐⭐⭐ |
| **POLISH BOY** | Cleveland sandwich | ⭐⭐⭐ |
| **O-H I-O** | Ohio State call and response | ⭐⭐⭐ |

### Iconic Landmarks

**Tier 1 (Primary):**
- Rock and Roll Hall of Fame
- Lake Erie shoreline
- Terminal Tower
- The Flats

### Cleveland Sports Colorways

| Team | Colors | Design Application |
|------|--------|-------------------|
| **Browns** | Brown/Orange | Dawg Pound |
| **Cavaliers** | Wine/Gold | LeBron era |
| **Guardians** | Red/Navy | Baseball |

---

## CITY SUMMARY TABLE

| Rank | City | Metro Pop | Key Slang | Top Landmarks | Vibe |
|------|------|-----------|-----------|---------------|------|
| **1** | **NYC** | 19.5M | Deadass, Yerr, Bodega | Brooklyn Bridge, Bodegas | Fast-paced, diverse, bold |
| **2** | **Chicago** | 9.6M | The Chi, LSD, Dese Dem Dose | The Bean, L Train | Second City pride, lakefront |
| **3** | **Boston** | 4.9M | Wicked Pissah, Pahk the Cah | Fenway, Harbor | Irish pride, college energy |
| **4** | **Detroit** | 4.3M | What Up Doe, 313 | Joe Louis Fist, Spirit | Motor City hustle |
| **5** | **Seattle** | 4.0M | Seattle Freeze, 206 Prefunk | Space Needle, Pike Place | PNW outdoor, tech-grunge |
| **6** | **Portland** | 2.5M | PDX, Keep Portland Weird | Mt. Hood, Bridges | Quirky, artsy, nature |
| **7** | **Pittsburgh** | 2.4M | Yinz, Dahntahn, Jagoff | Three Rivers, Inclines | Blue collar, Steelers |
| **8** | **Cleveland** | 2.1M | The Land, 216 | Rock Hall, Lake Erie | Underdog, comeback |
| **9** | **Milwaukee** | 1.6M | Bubbler, Brats, Brew City | Art Museum, Harley | Brew heritage, Wisconsin |

---

# SECTION 6: AI MODEL CONFIGURATION & USAGE

## Model Stack Overview

| Model | Primary Use | Strengths | Weaknesses |
|-------|-------------|-----------|------------|
| **Claude** | Prompt writing, strategy | Best prompts, nuanced understanding | Can't generate images/video |
| **Gemini Nano Banana** | Product images, lifestyle shots | Best image quality, consistent style | Video limited |
| **Sora 2** | Video ads, motion content | Best video generation | Text rendering issues |
| **Gemini Video** | Alternative video generation | Different style options | Compare with Sora |
| **OpenAI Image** | Alternative image generation | Good for comparison | Compare with Nano Banana |

## Model Selection Logic

### For Product Photography:
```
Primary: Gemini Nano Banana
Secondary: OpenAI Image Model
Action: Generate with both, compare, user selects winner (thumbs up/down)
```

### For Lifestyle/Model Shots:
```
Primary: Gemini Nano Banana
Secondary: OpenAI Image Model
Action: Generate with both, compare, user selects winner
```

### For Video Ads:
```
Primary: Sora 2
Secondary: Gemini Video
Action: Generate with both, compare, user selects winner
```

### For Prompt Generation:
```
Primary: Claude
Action: Claude writes all prompts, no comparison needed
```

## Generation Settings by Model

### Gemini Nano Banana (Images)

**Recommended Settings:**
- Resolution: 4K (3840x2160) minimum
- Aspect Ratios: 1:1 (product), 4:5 (Instagram), 9:16 (Stories/TikTok)
- Style: Photorealistic, commercial photography

**Best Practices:**
- Include specific lens descriptions (50mm, 85mm, 35mm)
- Specify lighting conditions (golden hour, studio, natural)
- Include depth of field instructions (shallow for bokeh)
- Add color grading notes (warm, cool, natural)

### Sora 2 (Video)

**Recommended Settings:**
- Resolution: 1080p or 4K
- Frame Rate: 24fps (cinematic) or 30fps (standard)
- Clip Length: 3-5 seconds per generation (stitch in post)
- Takes: Generate 3-5 versions, select cleanest

**What Sora Does Well:**
✅ Slow camera movements (dolly, crane, slow rotation)
✅ Atmospheric weather (snow, rain, fog, wind)
✅ Static subjects with subtle movement
✅ Environmental details (city streets, buildings)
✅ Lighting transitions (dawn to dusk, neon)
✅ Wide establishing shots (skylines)
✅ Product close-ups (fabric texture, embroidery)
✅ Shallow depth of field (bokeh backgrounds)

**What to Avoid with Sora:**
❌ Complex hand movements or gestures
❌ Detailed facial expressions or lip-syncing
❌ Fast camera movements (whip pans, quick zooms)
❌ TEXT GENERATION (always add text in post)
❌ Long continuous takes of people walking/talking
❌ Multiple people with complex interactions
❌ Extreme close-ups of faces
❌ Perfect symmetry

**Critical Rule:** NEVER rely on Sora to generate text on hoodies or in scenes. All text overlays must be added in post-production.

### OpenAI Image Model (Comparison)

**Use For:**
- A/B testing against Nano Banana
- Different style variations
- Backup when primary model struggles

### Gemini Video (Comparison)

**Use For:**
- A/B testing against Sora 2
- Different motion styles
- Backup for video generation

## Comparison Mode Workflow

When generating content, the system should:

1. **Generate with Primary Model** (e.g., Nano Banana for images)
2. **Generate with Secondary Model** (e.g., OpenAI) using same prompt
3. **Present Side-by-Side** to user
4. **Capture Preference** via thumbs up/down
5. **Store Result** for learning (see Section 10)

## Prompt-to-Model Mapping

The system should automatically route prompts to appropriate models:

| Prompt Type | Route To |
|-------------|----------|
| Product flat lay | Nano Banana + OpenAI (compare) |
| Ghost mannequin | Nano Banana + OpenAI (compare) |
| Lifestyle/model shots | Nano Banana + OpenAI (compare) |
| Video ad clip | Sora 2 + Gemini Video (compare) |
| Logo design | Nano Banana + OpenAI (compare) |
| Embroidery close-up | Nano Banana + OpenAI (compare) |

## Export Specifications

### Images
- Resolution: 4K minimum
- Color Space: sRGB
- Format: PNG (product), JPEG (lifestyle)
- Aspect Ratios Needed:
  - 1:1 (Instagram feed, product pages)
  - 4:5 (Instagram portrait)
  - 9:16 (Stories, TikTok, Reels)
  - 16:9 (YouTube, website banners)

### Videos
- Resolution: 4K (3840x2160) or 1080p minimum
- Frame Rate: 24fps (cinematic) or 30fps
- Codec: H.264 / H.265
- Aspect Ratios Needed:
  - 16:9 (YouTube, website)
  - 9:16 (TikTok, Reels, Stories)
  - 1:1 (Instagram feed)

---

# SECTION 7: MASTER PROMPT LIBRARY

## Prompt Structure Philosophy

Every prompt follows this hierarchy:
1. **Shot Type** (what kind of image/video)
2. **Subject** (who/what is in frame)
3. **Action/Position** (what they're doing)
4. **Environment** (where this takes place)
5. **Lighting** (how it's lit)
6. **Technical** (lens, camera, quality)
7. **Mood** (aesthetic, vibe, feeling)

## Variable System

Prompts use bracketed variables for customization:

| Variable | Description | Example Values |
|----------|-------------|----------------|
| `[HOODIE_COLOR]` | Base hoodie color | Black, Navy, Cream, Forest Green |
| `[DESIGN_NAME]` | Design being featured | DEADASS, YERR, BODEGA |
| `[EMBROIDERY_COLOR]` | Thread color | White, Gold, Silver, Cream |
| `[PLACEMENT]` | Logo/design location | Center chest, Left chest, Back |
| `[SIZE_INCHES]` | Design size | 4, 5, 7 |
| `[CITY]` | City context | NYC, Detroit, Chicago |
| `[LANDMARK]` | Background landmark | Brooklyn Bridge, Joe Louis Fist |
| `[MODEL_DEMO]` | Model demographics | Black male late 20s, Latina female early 30s |
| `[LENS]` | Camera lens | 35mm, 50mm, 85mm |
| `[LIGHTING]` | Lighting style | Golden hour, Studio, Neon night |

---

## CATEGORY 1: PRODUCT PHOTOGRAPHY (E-Commerce)

### 1.1 Flat Lay - Hero Shot (Front)

**Use Case:** Main product image, homepage hero  
**Primary Model:** Nano Banana  
**Quality Score:** 95/100

```
Professional overhead product photography of premium pullover hoodie laid flat on clean white surface, perfect symmetry, studio lighting.

[HOODIE_COLOR] colored heavyweight cotton fleece hoodie with drawstrings visible, hood laid flat. Center chest features embroidered design: [DESIGN_DESCRIPTION], [EMBROIDERY_COLOR] embroidery thread, approximately [SIZE_INCHES] inches wide, premium quality stitching visible.

TMH Clothing logo embroidered on right wrist cuff - "TMH" in bold block letters above "Clothing" in cursive script, [EMBROIDERY_COLOR] thread.

Fabric: 400GSM cotton blend, soft brushed fleece interior, quality drawstring hood with metal aglets, ribbed cuffs and waistband, kangaroo pocket.

Commercial product photography, no shadows, high detail, shot on medium format camera, crystal clear focus on embroidery, 4K quality, e-commerce ready.
```

### 1.2 Flat Lay - Back View

**Use Case:** Secondary product image showing back design  
**Primary Model:** Nano Banana

```
Professional overhead product photography of premium pullover hoodie laid flat showing back view on clean white surface, perfect symmetry, studio lighting.

[HOODIE_COLOR] colored heavyweight hoodie, back view. [BACK_DESIGN_DESCRIPTION] embroidered in [EMBROIDERY_COLOR] thread on upper back between shoulder blades, approximately [SIZE_INCHES] inches.

TMH Clothing logo embroidered at back neck below collar - "TMH" in bold block letters above "Clothing" in cursive script.

Fabric: 400GSM cotton blend, premium construction visible. Commercial product photography, no harsh shadows, high detail, 4K quality, e-commerce ready.
```

### 1.3 Ghost Mannequin - Front View

**Use Case:** Product page, showing fit/drape  
**Primary Model:** Nano Banana

```
Professional ghost mannequin product photography of premium pullover hoodie on invisible mannequin form, front view, centered composition, pure white background.

[HOODIE_COLOR] heavyweight cotton fleece hoodie, drawstrings hanging naturally. [PLACEMENT] features embroidered logo: [DESIGN_DESCRIPTION], [EMBROIDERY_COLOR] embroidery thread, approximately [SIZE_INCHES] inches wide, premium subtle branding.

TMH Clothing logo on right wrist cuff in [EMBROIDERY_COLOR] thread.

Studio lighting, no harsh shadows, commercial fashion photography, sharp detail on embroidery, shot on 85mm lens, 4K quality, Amazon/Shopify product image style.
```

### 1.4 Ghost Mannequin - Back View

**Use Case:** Product page back view  
**Primary Model:** Nano Banana

```
Professional ghost mannequin product photography of premium pullover hoodie on invisible form, back view showing shoulder and neck area, pure white background.

[HOODIE_COLOR] heavyweight hoodie. [BACK_DESIGN_DESCRIPTION] positioned on upper back between shoulder blades, [EMBROIDERY_COLOR] embroidery thread, approximately [SIZE_INCHES] inches.

TMH Clothing logo embroidered at back neck below collar.

Studio lighting, clean commercial photography, detailed embroidery visible, shot on 85mm, centered composition, 4K quality, e-commerce ready.
```

### 1.5 Hanging Shot with Texture

**Use Case:** Lifestyle product shot, adds warmth  
**Primary Model:** Nano Banana

```
Professional product photography of premium pullover hoodie hanging on wooden hanger against light gray textured wall, slightly off-center composition showing texture and drape.

[HOODIE_COLOR] heavyweight hoodie with visible texture detail. [PLACEMENT] features embroidered logo: [DESIGN_DESCRIPTION], [EMBROIDERY_COLOR] thread embroidery, approximately [SIZE_INCHES] inches wide, looks sophisticated and technical.

Natural window lighting from side, soft shadows, premium retail photography style, extreme sharpness on embroidery detail, shot on 50mm, shallow depth of field, 4K quality.
```

### 1.6 Embroidery Close-Up (Macro)

**Use Case:** Detail shot showing quality  
**Primary Model:** Nano Banana

```
Extreme macro photography close-up of embroidered logo on premium hoodie fabric, showing thread texture and stitching quality in hyper detail.

[DESIGN_DESCRIPTION] embroidered in [EMBROIDERY_COLOR] thread on [HOODIE_COLOR] fabric. Each individual thread visible, showing premium stitch density and craftsmanship. Fabric texture of 400GSM cotton fleece visible surrounding the embroidery.

Ring light creating even illumination, extreme sharpness, product detail photography, 4K quality, shows quality worth the premium price.
```

---

## CATEGORY 2: LIFESTYLE/MODEL PHOTOGRAPHY

### 2.1 Urban Street - Single Model

**Use Case:** Social media, lookbook  
**Primary Model:** Nano Banana

```
Professional streetwear fashion photoshoot. [MODEL_DEMO] wearing [HOODIE_COLOR] premium pullover hoodie with embroidered [DESIGN_NAME] design on [PLACEMENT] in [EMBROIDERY_COLOR] thread, approximately [SIZE_INCHES] inches.

Model standing on [CITY] street with [LANDMARK_OR_CONTEXT] visible in background. [POSE_DESCRIPTION]. TMH Clothing logo embroidered on right wrist in [EMBROIDERY_COLOR] thread.

[LIGHTING] lighting, premium streetwear photography, authentic urban vibe, shot on [LENS] lens, shallow depth of field, [COLOR_GRADE] color tones, 4K quality.

Model styled with [PANTS_DESCRIPTION], [SHOES - from approved grail list], [ACCESSORIES].
```

### 2.2 Landmark Context Shot

**Use Case:** City-specific marketing  
**Primary Model:** Nano Banana

```
Professional lifestyle photography of [MODEL_DEMO] wearing [HOODIE_COLOR] [DESIGN_NAME] hoodie at iconic [CITY] location.

Model positioned at [SPECIFIC_LANDMARK], [POSE_DESCRIPTION]. Embroidered design clearly visible: [DESIGN_DESCRIPTION] in [EMBROIDERY_COLOR] thread on [PLACEMENT].

[LIGHTING] lighting, landmark visible but hoodie is hero, shot on [LENS] lens, premium streetwear editorial style, 4K quality.

Styled: [FULL_OUTFIT_DESCRIPTION]
```

### 2.3 Group Shot - Multiple Hoodies

**Use Case:** Collection showcase, social  
**Primary Model:** Nano Banana

```
Professional streetwear fashion photoshoot with [NUMBER] people in [CITY] urban setting.

Person 1: [MODEL_DEMO_1] wearing [HOODIE_1_COLOR] [DESIGN_1] hoodie
Person 2: [MODEL_DEMO_2] wearing [HOODIE_2_COLOR] [DESIGN_2] hoodie
Person 3: [MODEL_DEMO_3] wearing [HOODIE_3_COLOR] [DESIGN_3] hoodie

Group positioned naturally at [LOCATION], showing genuine interaction, not posed. [LIGHTING] lighting, each hoodie design clearly visible. Shot on [LENS], streetwear campaign aesthetic, 4K quality.

IMPORTANT: Each person has different pants, different shoes (from approved grail list), different accessories. No matching outfits except the TMH hoodies.
```

### 2.4 Lifestyle Interior Shot

**Use Case:** Warmer, relatable content  
**Primary Model:** Nano Banana

```
Professional lifestyle photography of [MODEL_DEMO] wearing [HOODIE_COLOR] [DESIGN_NAME] hoodie in [INTERIOR_SETTING].

Model [ACTION - e.g., sitting on couch, standing by window, at coffee shop counter]. Relaxed, authentic moment. Embroidered design visible: [DESIGN_DESCRIPTION] on [PLACEMENT].

Natural [LIGHTING] through windows, warm interior tones, lifestyle editorial style, shot on [LENS], 4K quality.

Styled casually: [OUTFIT_DESCRIPTION]
```

---

## CATEGORY 3: VIDEO AD PROMPTS (Sora 2)

### 3.1 Product Reveal - Slow Rotation

**Use Case:** Product video, website hero  
**Primary Model:** Sora 2  
**Duration:** 4-5 seconds

```
Cinematic 5-second clip of [HOODIE_COLOR] premium hoodie slowly rotating on invisible display form against [BACKGROUND - clean studio or city blur].

Hoodie rotating 180 degrees left to right, showing front embroidered [DESIGN_NAME] design transitioning to back design. Embroidery detail catching light as it turns.

Camera: Static, centered
Lighting: Soft studio lighting with rim light for depth
Movement: Slow, smooth rotation (approx 36 degrees per second)
Quality: 4K, cinematic, premium product video aesthetic

NO TEXT ON HOODIE - add graphics in post-production.
```

### 3.2 Lifestyle Walk - City Street

**Use Case:** Social ad, brand video  
**Primary Model:** Sora 2  
**Duration:** 4-5 seconds

```
Cinematic 5-second clip of [MODEL_DEMO] walking confidently down [CITY] street wearing [HOODIE_COLOR] hoodie.

[SPECIFIC_LOCATION_DETAILS] visible in background. Model walks toward camera with natural stride, hoodie visible. [TIME_OF_DAY] lighting, [WEATHER_IF_ANY].

Camera: Slow tracking backward as model approaches
Lighting: [LIGHTING_STYLE]
Movement: Natural walking pace, confident energy
Quality: 4K, 24fps cinematic, streetwear campaign aesthetic

NO TEXT ON HOODIE - add graphics in post-production.
```

### 3.3 Hero Moment - Static with Movement

**Use Case:** Ad opener, social content  
**Primary Model:** Sora 2  
**Duration:** 3-4 seconds

```
Cinematic 4-second clip of [MODEL_DEMO] standing still at [LOCATION] wearing [HOODIE_COLOR] [DESIGN_NAME] hoodie.

Model faces camera with confident expression, subtle movement: wind catching hood slightly, drawstrings swaying gently. [CITY] environment alive around them (people passing in blur, cars in background).

Camera: Slow push-in from medium shot to medium close-up
Lighting: [LIGHTING_STYLE]
Movement: Subject still, environment active
Quality: 4K, cinematic depth of field, premium aesthetic

NO TEXT ON HOODIE - add graphics in post-production.
```

### 3.4 Multi-City Anthem Structure

**Use Case:** Brand anthem video (30-60 seconds)  
**Structure:**

```
[0:00-0:03] COLD OPEN
Text overlay: "WHERE YOU FROM?"
Black screen, bold white text

[0:03-0:08] CITY 1 SEQUENCE (5 sec)
[City-specific Sora prompt]

[0:08-0:13] CITY 2 SEQUENCE (5 sec)
[City-specific Sora prompt]

[0:13-0:18] CITY 3 SEQUENCE (5 sec)
[City-specific Sora prompt]

[0:18-0:23] CITY 4 SEQUENCE (5 sec)
[City-specific Sora prompt]

[0:23-0:28] CITY 5 SEQUENCE (5 sec)
[City-specific Sora prompt]

[0:28-0:30] END CARD
TMH logo + "Rep Your Hood"
```

### 3.5 NYC-Specific Video Prompt

**Location:** John's Pizzeria Times Square (stained glass dome)

```
Cinematic 5-second clip inside John's Pizzeria Times Square beneath the stained glass dome. Camera slowly pushes in on three friends at a round table.

Black man late 20s in black YERR hoodie center, Latina woman early 30s in green FUHGEDDABOUDIT hoodie to his left, White woman late 20s in cream DEADASS hoodie to his right.

Friends laughing together, pizza on table, cathedral ceiling with stained glass dome visible above. Warm golden interior lighting, vintage chandeliers in background.

Camera: Slow push in, eye level
Lighting: Warm interior, stained glass color cast
Movement: Subtle character movement, natural laughter
Quality: 4K, cinematic, authentic NYC dining moment

NO TEXT ON HOODIES - add graphics in post-production.
```

### 3.6 Detroit-Specific Video Prompt

**Location:** Spirit of Detroit statue

```
Cinematic 5-second clip of two friends greeting each other with "What up doe" energy at Spirit of Detroit statue.

Black male mid-20s in black WHAT UP DOE hoodie, mixed-race female late 20s in maize yellow THE D hoodie. They embrace/dap up warmly in front of the iconic bronze statue.

Golden hour lighting, Detroit skyline visible. Camera captures the warmth of the greeting.

Camera: Medium shot, slight movement toward subjects
Lighting: Golden hour, warm Detroit evening
Movement: Natural greeting, authentic connection
Quality: 4K, cinematic, soulful energy

NO TEXT ON HOODIES - add graphics in post-production.
```

---

## CATEGORY 4: DESIGN GENERATION PROMPTS

### 4.1 New City Research Prompt

**Use Case:** Onboarding a new city  
**Model:** Claude (for research synthesis)

```
I'm adding [CITY_NAME] to the TMH collection. Research and provide:

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
Who should model this city's collection? Ethnic breakdown, age range, style references.

8. LOCATION BANKS
5 specific locations for photo backgrounds with exact addresses/descriptions.
```

### 4.2 New Design Concept Prompt

**Use Case:** Creating a new hoodie design  
**Model:** Claude → Nano Banana

```
Create a design concept for TMH [CITY] collection:

DESIGN NAME: [NAME]
MEANING: [What this word/phrase means to locals]
VIBE: [The feeling/energy]

FRONT DESIGN:
- Main element: [TEXT/GRAPHIC]
- Typography style: [DESCRIPTION]
- Placement: [Center chest / Left chest]
- Size: [X inches]
- Colors: [Thread colors]

BACK DESIGN:
- Main element: [TEXT/GRAPHIC/NONE]
- Placement: [Upper back / Full back]
- Size: [X inches]
- Colors: [Thread colors]

COLORWAYS:
1. [Primary colorway - hoodie color + thread colors]
2. [Secondary colorway]
3. [Tertiary colorway]
4. [Seasonal variant if applicable]

STYLE REFERENCES:
[Brands/aesthetics this should feel like]

AVOID:
[What this design should NOT look like]

Generate image prompt for Nano Banana:
[Full product shot prompt following Category 1.1 template]
```

---

## CATEGORY 5: SOCIAL MEDIA TEMPLATES

### 5.1 Instagram Carousel - City Drop

**Use Case:** New city collection announcement

```
SLIDE 1 (HOOK):
[City skyline or landmark, dramatic lighting, text overlay: "[CITY] COLLECTION"]

SLIDE 2-4 (PRODUCTS):
[Individual hoodie product shots, ghost mannequin or flat lay]

SLIDE 5-6 (LIFESTYLE):
[Models wearing hoodies in city context]

SLIDE 7 (DETAILS):
[Embroidery close-up, quality callout]

SLIDE 8 (CTA):
[Product grid with "Shop Now" text overlay]
```

### 5.2 TikTok/Reels - Quick Product

**Use Case:** Fast product showcase

```
[0:00-0:02] HOOK
Close-up of embroidery detail, text: "If you're from [CITY]..."

[0:02-0:05] REVEAL
Pull back to show full hoodie on model

[0:05-0:08] CONTEXT
Cut to model in city location wearing hoodie

[0:08-0:10] CTA
Text overlay: "Link in bio" or "ThatsMyHoodie.com"
```

### 5.3 Story Sequence - Behind the Scenes

```
STORY 1: "Working on something for [CITY]..."
[Blurred design preview or embroidery machine]

STORY 2: "The details matter"
[Close-up of embroidery quality]

STORY 3: "Dropping soon"
[Full product reveal, swipe up link]
```

---

# SECTION 8: MODEL STYLING & CASTING GUIDE

## Casting Philosophy

**Core Principle:** Models should look like they LIVE in the city, not like they're visiting.

**Diversity Standard:** Reflect actual city demographics. No tokenism. Authentic representation.

## Individual Style Slot System

For multi-model shots, assign each model a distinct "style slot" to avoid uniformity:

| Slot | Pants | Shoes | Accessory |
|------|-------|-------|-----------|
| **Slot A** | Black cargo pants | Timberland 6" Wheat | Gold Cuban chain |
| **Slot B** | Black slim jeans | Jordan 1 (any colorway) | Silver rope chain |
| **Slot C** | Black joggers/sweats | New Balance 990/550 | Gold box chain |
| **Slot D** | Wide-leg trousers | Yeezy 350/700 | Layered thin chains |
| **Slot E** | Leather pants (women) | Air Force 1 or Dunks | Statement hoops |

**RULE:** No two models in the same shot should wear the same shoe silhouette, pant style, or accessory combo.

## Approved Grail Sneakers

**ONLY use sneakers that have cultural credibility. No general releases.**

### Nike SB Dunks (Approved)
- Nike SB Dunk Low "Freddy Krueger" (ultimate grail)
- Nike SB Dunk Low "Wu-Tang" (black/yellow)
- Nike SB Dunk Low "Pigeon" (Jeff Staple)
- Nike SB Dunk Low "Tiffany"
- Nike SB Dunk Low "Travis Scott"
- Nike SB Dunk Low "Strangelove"

### Jordans (Heat Only)
- Air Jordan 1 High "Chicago"
- Air Jordan 1 High "Bred/Banned"
- Air Jordan 1 High "Royal"
- Air Jordan 1 High "Shadow"
- Air Jordan 1 High "Union LA"
- Air Jordan 1 High "Travis Scott" (Mocha or Reverse)
- Air Jordan 1 High "Off-White"
- Air Jordan 4 "Travis Scott"
- Air Jordan 11 "Concord"
- Air Jordan 11 "Bred"

### Nike Air Max
- Air Max 1 "Patta"
- Air Max 90 "Infrared"
- Air Max 95 "Neon"
- Air Max 97 "Silver Bullet"
- Air Max 97 "Sean Wotherspoon"

### New Balance
- New Balance 990v5 (grey - the classic)
- New Balance 990v6
- New Balance 2002R "Protection Pack"
- New Balance 550 (any colorway)
- New Balance x Aimé Leon Dore (any collab)
- New Balance x JJJJound

### Yeezy
- Yeezy 350 V2 "Zebra"
- Yeezy 350 V2 "Cream/Triple White"
- Yeezy 700 V1 "Wave Runner"

### Timberlands (NYC Essential)
- Timberland 6-Inch Premium "Wheat" (CLEAN, not work-worn)
- Timberland 6-Inch "Black Nubuck"

### BANNED Sneakers
❌ Jordan 1 Mids (BANNED in sneaker culture)
❌ General release Dunks
❌ Beat up or dirty sneakers
❌ Off-brand lookalikes
❌ Mall sneakers (Skechers, generic)

## Model Specifications by Design

### BODEGA Design (Male Model)
- **Ethnicity:** Dominican male
- **Age:** 27
- **Height:** 5'11"
- **Build:** Athletic, lean
- **Skin Tone:** Medium-tan (Fitzpatrick IV)
- **Hairstyle:** Fresh taper fade with textured curly top, lineup crisp
- **Facial Hair:** Short, well-groomed beard

**Outfit (Black Variant):**
- Hoodie: BODEGA Black
- Bottoms: Black cargo pants (mid-rise, tapered fit)
- Sneakers: Black/White Air Jordan 1 High
- Accessories: Silver Cuban link chain (medium), Black Yankees fitted (backwards), small black crossbody bag

### DEADASS Design (Male Model)
- **Ethnicity:** Nigerian-American male
- **Age:** 24-26
- **Height:** 6'0" - 6'2"
- **Build:** Lean, tall frame
- **Hairstyle:** Shoulder-length locs or voluminous curly afro

**Outfit (Cream Variant):**
- Hoodie: DEADASS Cream
- Bottoms: Vintage washed baggy jeans
- Sneakers: New Balance 550 or Jordan 4 "Travis Scott"
- Accessories: Layered gold chains, vintage watch

### YERR Design (Female Model)
- **Ethnicity:** Puerto Rican/Dominican female
- **Age:** 25-28
- **Height:** 5'6"
- **Build:** Athletic, curves
- **Hairstyle:** Slicked back ponytail or natural curls

**Outfit (Navy Variant):**
- Hoodie: YERR Navy
- Bottoms: High-waisted baggy jeans or leather pants
- Sneakers: Air Force 1 Low White or Nike Dunk
- Accessories: Large gold hoops, layered necklaces

## Studio Shot Guidelines

**Backdrop:** #DCE1E4 (light grey) for all studio shots

**Lighting Setup:**
- Key light: 45° right, eye level
- Fill light: Left side, softer (40% intensity of key)
- Rim light: Behind left, creating edge definition
- Camera: Eye level, slight low angle (camera at chest height shooting slightly up)
- Depth: Model positioned 6 feet from backdrop for subtle shadow

**Poses:**
- Natural, confident, not stiff
- Hands in hoodie pocket or relaxed at sides
- Slight lean back okay
- Expression: Relaxed, subtle smile or neutral cool

## Street/Location Shot Guidelines

**Vibe:** Natural, "caught in the wild" — NOT posed or staged

**Timing:**
- Golden hour (4-5 PM) for warm shots
- Blue hour (6-7 PM) for mood/neon shots

**Direction:**
- Models look like they LIVE there, not visiting
- Mid-stride, walking, looking at phone — natural moments
- Real bodies, diverse representations
- Cultural authenticity is critical

---

# SECTION 9: AD & CONTENT STRATEGY

## Ad Formats That Work

### Carousel Ads (Instagram/Facebook)
- 3-5 slides optimal
- Lead with strongest hook image
- Sequence: Lifestyle → Product → Detail → Social Proof → CTA
- Consistent visual thread (color grading, fonts)

### Video Ads (Reels/TikTok)
- 15-30 seconds optimal
- Hook in first 2 seconds
- Show product in authentic context
- End with clear CTA

### Static Image Ads
- Bold, simple composition
- Hoodie is hero
- City context adds authenticity
- Price point visible if promotion

## Content Pillars

1. **Product Showcase** (30%)
   - Clean product shots
   - Detail close-ups
   - New arrivals

2. **Lifestyle/Culture** (30%)
   - Models in city contexts
   - "Day in the life" content
   - Authentic moments

3. **City Pride** (20%)
   - City-specific content
   - Local landmarks
   - Cultural celebrations

4. **Behind the Scenes** (10%)
   - Production process
   - Design development
   - Team content

5. **Community/UGC** (10%)
   - Customer photos
   - Reposts
   - Testimonials

## Ad Copy Framework

### Hook Types

**Identity Play:**
"Your borough raised you. Now wear it."

**Curiosity + Culture:**
"They said NYC style couldn't be bottled. We put it in a hoodie."

**Direct Challenge:**
"If your hoodie doesn't rep where you're from, is it really yours?"

**Seasonal Urgency:**
"Winter's coming. Rep your block the right way."

### Copy Structure

```
LINE 1: Hook (stops scroll) - under 125 characters
LINE 2: What it is (product/collection name)
LINE 3: Offer (discount code, limited drop)
LINE 4: CTA (Shop Now, Link in Bio)
```

### CTA Options
- "Shop Now" (direct, proven)
- "Get Yours" (ownership)
- "Rep Your Hood" (brand voice)
- "Limited Drop" (scarcity)

## Targeting Strategy

### Geographic Targeting
- Primary: City-specific (10-25 mile radius)
- Secondary: Diaspora (people who moved from city)
- Tertiary: Metro area expansion

### Interest Stacking
- Streetwear brands (Kith, Supreme, Stüssy)
- Hip-hop culture
- Sneaker culture
- Local sports teams
- City-specific pages

### Lookalike Audiences
- Based on purchasers
- Based on high-intent site visitors
- Based on engaged social followers

## What Makes TMH Ads Different

**Generic Hoodie Ad:**
- Model in hoodie
- "Buy now" energy
- No cultural context
- Could be any brand

**TMH Ad:**
- Model in authentic city location
- Cultural reference in design
- "If you know, you know" energy
- Immediate city identification
- Premium quality signals

---

# SECTION 10: PREFERENCE LEARNING SYSTEM

## Learning Philosophy

The system learns what Jay (and team) prefers through explicit feedback signals. Over time, the system should:

1. **Predict preferences** for new cities based on patterns from approved cities
2. **Suggest designs** that match validated aesthetic patterns
3. **Auto-select models** that fit the established casting preferences
4. **Recommend backgrounds** based on what's worked before

## Feedback Capture Points

### Thumbs Up/Down Opportunities

| Decision Point | What We're Learning |
|----------------|---------------------|
| Image A vs B comparison | Model preference (Nano Banana vs OpenAI) |
| Design concept approval | Aesthetic preferences |
| Model selection | Casting preferences |
| Background selection | Location preferences |
| Colorway approval | Color palette preferences |
| Ad copy selection | Voice/tone preferences |
| Video clip selection | Motion/pacing preferences |

### Data to Capture Per Decision

```json
{
  "decision_id": "uuid",
  "decision_type": "image_comparison",
  "option_a": {
    "model": "nano_banana",
    "prompt": "full prompt text",
    "output_url": "image_url"
  },
  "option_b": {
    "model": "openai",
    "prompt": "full prompt text",
    "output_url": "image_url"
  },
  "selected": "option_a",
  "timestamp": "2026-01-20T12:00:00Z",
  "context": {
    "city": "NYC",
    "design": "BODEGA",
    "content_type": "product_shot"
  }
}
```

## Pattern Recognition

### What the System Should Learn

**Model Preferences:**
- Track win rate: Nano Banana vs OpenAI for images
- Track win rate: Sora 2 vs Gemini for video
- Identify which model wins for which content type

**Aesthetic Preferences:**
- Color temperature (warm vs cool)
- Lighting style (natural vs studio)
- Composition (centered vs rule of thirds)
- Background complexity (simple vs busy)

**Casting Preferences:**
- Demographics that get approved
- Style combinations that work
- Poses that get selected

**City Patterns:**
- Design elements that get approved per city
- Color palettes that work per city
- Cultural elements that resonate

### Applying Learnings to New Cities

When onboarding a new city, the system should:

1. **Analyze approved designs** from similar cities
2. **Suggest design patterns** based on what's worked
3. **Recommend color palettes** based on city type (Midwest vs East Coast vs West Coast)
4. **Propose cultural elements** based on similar city research
5. **Pre-select model demographics** based on city population data

## Preset Configuration System

### What Users Can Save as Presets

**Prompt Presets:**
- Full prompt templates with variables
- Validated prompts that consistently produce good results
- City-specific prompt variations

**Model Presets:**
- Preferred model for each content type
- Generation settings (resolution, aspect ratio)
- Style modifiers

**Styling Presets:**
- Approved outfit combinations
- Sneaker selections by city
- Accessory configurations

### Preset Inheritance

```
Global Defaults
    └── Content Type Defaults (Product / Lifestyle / Video)
        └── City-Specific Overrides
            └── Design-Specific Overrides
```

Example:
- Global: Always use 4K, always include TMH logo
- Product Type: Ghost mannequin, white background
- NYC Override: Add bodega/subway context options
- BODEGA Design: Mustard yellow preference, bodega cat element

---

# SECTION 11: HARD RULES & SOFT PREFERENCES

## HARD RULES (Never Break)

### Brand Rules
✅ ALWAYS include TMH Clothing logo on all products
✅ ALWAYS use premium quality language (400GSM, heavyweight)
✅ ALWAYS show authentic city context, never generic
✅ ALWAYS ensure diverse representation reflecting city demographics

❌ NEVER use clipart or cartoon style
❌ NEVER include tourist merchandise aesthetic
❌ NEVER show cheap/fast fashion signals
❌ NEVER use Jordan 1 Mids (banned in sneaker culture)
❌ NEVER generate text with Sora (add in post)
❌ NEVER use thin lines that won't embroider
❌ NEVER create designs that require explanation

### Technical Rules
✅ ALWAYS generate at 4K minimum
✅ ALWAYS provide multiple aspect ratios
✅ ALWAYS compare primary vs secondary model
✅ ALWAYS capture user preference on decisions

❌ NEVER rely on AI text generation in images
❌ NEVER use outdated model settings
❌ NEVER skip the comparison step

### Content Rules
✅ ALWAYS lead with hook in ad copy
✅ ALWAYS show product clearly
✅ ALWAYS include clear CTA
✅ ALWAYS match model demographics to city

❌ NEVER use generic stock photo aesthetic
❌ NEVER make ads that could be any brand
❌ NEVER ignore cultural authenticity

## SOFT PREFERENCES (Generally Follow)

### Aesthetic Preferences
- Prefer warm color grading over cool
- Prefer golden hour over harsh midday
- Prefer natural poses over stiff
- Prefer shallow depth of field
- Prefer 85mm or 50mm lenses

### Composition Preferences
- Prefer hoodie as hero element
- Prefer city context over plain backgrounds
- Prefer authentic moments over staged
- Prefer movement/energy over static

### Copy Preferences
- Prefer identity-focused hooks
- Prefer under 125 characters for first line
- Prefer questions that get "yes" answers
- Prefer scarcity/exclusivity signals

## Learnings & Corrections

### Mistakes We Made

**99designs Logo Contest:**
- Learned: External designers default to cliché (location pins, cartoon hoodies)
- Correction: Control creative process with specific AI prompts

**Initial $60 Pricing:**
- Learned: Competed with commodity products
- Correction: Premium positioning at $150-175

**Generic City Merch Approach:**
- Learned: "NYC" by itself isn't distinctive
- Correction: "If you know, you know" insider references

**Text in Sora Videos:**
- Learned: AI text generation is unreliable
- Correction: ALWAYS add text in post-production

### Insights That Took Time

1. **Specificity is a feature, not a bug** - The more specific the reference, the more it resonates with true locals

2. **Premium quality signals matter** - 400GSM, metal aglets, high-density embroidery justify price

3. **Comparison drives preference learning** - Always generate with multiple models to learn what works

4. **Cultural authenticity can't be faked** - Research deeply, validate with locals

5. **The "Is This Dope?" test** - Simple but effective quality filter

---

# SECTION 12: SYSTEM WORKFLOWS

## Workflow 1: New City Onboarding

```
STEP 1: RESEARCH
├── Claude generates city research (Section 7, Prompt 4.1)
├── Review slang dictionary (minimum 20 terms)
├── Review landmark tiers
├── Review sports colorways
├── User approves research (👍/👎 on each element)
└── System stores approved elements

STEP 2: DESIGN CONCEPTS
├── Claude generates 5-8 design concepts
├── For each concept:
│   ├── Generate product image (Nano Banana)
│   ├── Generate comparison (OpenAI)
│   ├── Present side-by-side
│   └── Capture preference (👍/👎)
├── User selects top 3-5 designs to develop
└── System stores approved designs

STEP 3: COLORWAY DEVELOPMENT
├── Generate colorway variations for approved designs
├── Present options
├── Capture preferences
└── Lock final colorways

STEP 4: CONTENT GENERATION
├── Generate product photography
├── Generate lifestyle shots
├── Generate video clips
├── Capture preferences on each
└── Build approved asset library

STEP 5: AD CREATION
├── Generate ad copy variations
├── Assemble ads from approved assets
├── Present ad concepts
├── Capture preferences
└── Export for campaigns
```

## Workflow 2: Design to Content Pipeline

```
INPUT: Approved design concept

STEP 1: PRODUCT SHOTS
├── Flat lay front (Nano Banana + OpenAI compare)
├── Flat lay back
├── Ghost mannequin front
├── Ghost mannequin back
├── Hanging shot
├── Embroidery macro
└── User selects winners

STEP 2: LIFESTYLE SHOTS
├── Select model demographics from city profile
├── Select location from city location bank
├── Select outfit from styling presets
├── Generate lifestyle images
├── Compare models
└── User selects winners

STEP 3: VIDEO CLIPS
├── Product rotation (Sora 2 + Gemini compare)
├── Lifestyle walk
├── Hero moment
└── User selects winners

STEP 4: AD ASSEMBLY
├── Select hook copy from approved options
├── Combine with approved visuals
├── Generate carousel sequence
├── Generate video ad edit
└── User approves final ads

OUTPUT: Ready-to-deploy ad assets
```

## Workflow 3: Quick Content Generation

```
INPUT: "Generate 3 lifestyle shots for DEADASS cream hoodie"

SYSTEM:
├── Pulls DEADASS design spec
├── Pulls NYC location bank
├── Pulls approved model demographics
├── Pulls styling presets
├── Generates 3 unique prompts
├── Runs each through Nano Banana + OpenAI
├── Presents 6 images (3 pairs)
├── Captures preferences
└── Exports winners

OUTPUT: 3 approved lifestyle images + learning data
```

## Workflow 4: Preference-Informed Generation

```
CONTEXT: System has learned from 500+ decisions

INPUT: "Create product shots for new YINZ Pittsburgh design"

SYSTEM LEARNS:
├── Rust belt cities prefer warmer tones (pattern from Detroit/Cleveland)
├── Text-heavy designs perform better in industrial cities
├── Black + gold colorway wins 80% for Pittsburgh sports
├── Similar demographics to Detroit casting approved

SYSTEM SUGGESTS:
├── Colorway: Black hoodie, gold embroidery
├── Model: Similar demo to approved Detroit models
├── Location: Industrial backdrop with bridges (Pittsburgh pattern)
├── Lighting: Golden hour, warm tones (rust belt pattern)

GENERATES:
├── Pre-configured prompts based on learned patterns
├── Runs comparison
├── Presents with "Based on your preferences" note
└── Captures feedback to refine learning
```

---

# APPENDIX A: QUICK REFERENCE TABLES

## Hoodie Colors Available

| Color | Hex | Best For | Thread Colors |
|-------|-----|----------|---------------|
| Black | #000000 | Universal | White, Gold, Silver |
| Navy | #000080 | East Coast | White, Gold, Cream |
| Forest Green | #228B22 | PNW, Boston | White, Gold, Cream |
| Charcoal | #36454F | Universal | White, Cream |
| Cream | #FFFDD0 | Neutral | Black, Navy, Gold |
| Burgundy | #800020 | Premium | Gold, Cream |
| Maize | #FFCB05 | Detroit/Michigan | Blue, Black |
| Ice Blue | #99FFFF | Seattle | White, Silver |

## Content Type to Model Mapping

| Content Type | Primary | Secondary | Notes |
|--------------|---------|-----------|-------|
| Product flat lay | Nano Banana | OpenAI | Always compare |
| Ghost mannequin | Nano Banana | OpenAI | Always compare |
| Lifestyle/model | Nano Banana | OpenAI | Always compare |
| Logo design | Nano Banana | OpenAI | Always compare |
| Video product | Sora 2 | Gemini | Always compare |
| Video lifestyle | Sora 2 | Gemini | Always compare |
| Prompts/copy | Claude | N/A | No comparison needed |

## City Launch Priority

| Priority | City | Status | Notes |
|----------|------|--------|-------|
| 1 | NYC | Active | Flagship, most designs |
| 2 | Detroit | Active | Strong collection |
| 3 | Chicago | Active | Growing collection |
| 4 | Boston | Active | Holiday focus |
| 5 | Seattle | Active | PNW launch |
| 6 | Portland | Researched | Ready for development |
| 7 | Pittsburgh | Researched | Yinz potential |
| 8 | Cleveland | Researched | The Land potential |
| 9 | Milwaukee | Researched | Brew City potential |

---

# APPENDIX B: PROMPT VARIABLE REFERENCE

## Standard Variables

```
[HOODIE_COLOR] - Base color of hoodie
[DESIGN_NAME] - Name of design (DEADASS, YERR, etc.)
[DESIGN_DESCRIPTION] - Full description of embroidered design
[EMBROIDERY_COLOR] - Thread color for embroidery
[PLACEMENT] - Where design is located (center chest, left chest, back)
[SIZE_INCHES] - Size of design in inches
[CITY] - City name
[LANDMARK] - Specific landmark for background
[LANDMARK_OR_CONTEXT] - Landmark or contextual description
[MODEL_DEMO] - Model demographics description
[MODEL_DEMO_1/2/3] - Multiple model demographics
[POSE_DESCRIPTION] - How model is positioned
[LENS] - Camera lens (35mm, 50mm, 85mm)
[LIGHTING] - Lighting description
[LIGHTING_STYLE] - More detailed lighting
[COLOR_GRADE] - Color grading notes
[TIME_OF_DAY] - Time context
[WEATHER_IF_ANY] - Weather elements
[PANTS_DESCRIPTION] - Model's pants
[SHOES] - Model's shoes (from approved list)
[ACCESSORIES] - Model's accessories
[FULL_OUTFIT_DESCRIPTION] - Complete outfit
[INTERIOR_SETTING] - Indoor location type
[ACTION] - What model is doing
[BACKGROUND] - Background description
[SPECIFIC_LOCATION_DETAILS] - Detailed location
[NUMBER] - Number of people
[HOODIE_1/2/3_COLOR] - Multiple hoodie colors
[DESIGN_1/2/3] - Multiple design names
```

---

# APPENDIX C: SORA 2 TROUBLESHOOTING

## Common Issues & Fixes

**Weird Faces:**
- Use profile or back shots instead of direct face
- Specify "three-quarter angle"
- Use wider shots where faces are less detailed

**Bad Hoodie Text:**
- NEVER rely on Sora text generation
- Add "no visible text on clothing" to prompt
- Add all text/graphics in post-production

**Inconsistent Lighting:**
- Use exact same lighting descriptors across all prompts
- Specify time of day consistently
- Match color temperature words

**Stiff Movement:**
- Add "natural, organic movement"
- Specify "authentic, not posed"
- Use verbs like "walking naturally" vs "walks"

**Complex Interactions Failing:**
- Simplify to fewer people
- Focus on single subject
- Cut complex interactions into separate clips

---

# APPENDIX D: POST-PRODUCTION CHECKLIST

## For Images

- [ ] Color grade consistently across set
- [ ] Match color temperature between variants
- [ ] Add/fix hoodie graphics if AI rendered poorly
- [ ] Ensure embroidery is sharp and visible
- [ ] Apply subtle film grain (2-3%) for cohesion
- [ ] Export at 4K minimum
- [ ] Create all aspect ratio versions (1:1, 4:5, 9:16, 16:9)

## For Videos

- [ ] Color grade consistently across all clips
- [ ] Match color temperature between scenes
- [ ] Add all text overlays (NEVER use AI-generated text)
- [ ] Add transitions (0.3-0.5s crossfades recommended)
- [ ] Add music (royalty-free, premium streetwear vibe)
- [ ] Add sound design (city ambiance, relevant audio)
- [ ] Apply subtle film grain (2-3%) for cohesion
- [ ] Add end card with logo and CTA
- [ ] Export in all aspect ratios needed

---

**END OF DOCUMENT**

*TMH AI Content Engine Knowledge Base v1.0*
*Last Updated: January 2026*
*Total Pages: ~75*
*Comprehensive guide for automated content generation with preference learning*

