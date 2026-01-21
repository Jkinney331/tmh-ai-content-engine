# TMH AI CONTENT ENGINE — EPIC PLAN
## Ralph-Compatible Development Plan

**Created:** January 2026
**Target:** 87 Atomic User Stories
**Execution Mode:** Autonomous (Ralph Wiggum Loop)

---

## Overview

We are transforming the existing TMH dashboard from a Reddit-focused validation tool into a **full AI Content Engine**. The system will onboard new cities via Perplexity + Claude research, generate product designs and content using A/B model comparison, capture user feedback (thumbs up/down + tags), and learn preferences over time to make predictions. All approved content flows to a social media grid preview for export.

---

# USER JOURNEYS

## Journey 1: City Onboarding

**GOAL:** User adds a new city to the system with a fully researched and approved profile

**STEPS:**
1. User clicks "Add City" button on Cities page → sees city input modal
2. User enters city name (e.g., "Washington D.C.") → clicks "Research"
3. System shows loading state → Perplexity fetches raw data → Claude synthesizes and ranks
4. User sees research results organized by category (slang, landmarks, sports, etc.)
5. User toggles each element: Approve / Reject / Maybe → adds optional notes
6. User clicks "Save City Profile" → city saved to Supabase with approved elements
7. User redirected to city detail page → sees "Ready to Generate" status

**CONNECTS TO:** Design Generation Journey (requires approved city)

---

## Journey 2: Design Generation

**GOAL:** User generates product designs for an approved city using A/B model comparison

**STEPS:**
1. User navigates to Generate page → selects city from dropdown
2. User selects product type (Hoodie / T-Shirt / Hat)
3. User selects design style (Minimal / Bold / Vintage / Modern / Luxury)
4. User optionally selects specific slang term or lets system suggest
5. User clicks "Generate Designs" → system generates with Model A (Nano Banana)
6. System simultaneously generates with Model B (OpenAI) → same prompt
7. User sees side-by-side comparison → clicks "Pick Winner" (A or B)
8. User provides feedback: thumbs up/down + tags + optional text
9. Winning design saved as "approved" → triggers content cascade option

**CONNECTS TO:** Product Shot Journey, Lifestyle Shot Journey

---

## Journey 3: Product Shot Generation

**GOAL:** User generates e-commerce product photography for an approved design

**STEPS:**
1. User views approved design → clicks "Generate Product Shots"
2. System shows shot type checklist (Flat Lay, Ghost Mannequin, Hanging, Macro, etc.)
3. User checks desired shot types → clicks "Generate"
4. System generates each shot with Model A and Model B
5. User sees shot gallery → compares each pair → picks winners
6. User grades each winner: thumbs + tags + text
7. Approved shots saved to asset library

**CONNECTS TO:** Social Content Journey, Export Journey

---

## Journey 4: Lifestyle Shot Generation

**GOAL:** User generates lifestyle/model photography featuring approved products

**STEPS:**
1. User views approved product → clicks "Generate Lifestyle Shots"
2. System auto-suggests model demographics based on city profile
3. User configures: location (from city landmarks), time of day, activity
4. User selects outfit configuration (or uses city preset)
5. User clicks "Generate" → Model A and Model B generate in parallel
6. User sees side-by-side pairs → picks winners → grades each
7. Approved lifestyle shots saved to asset library

**CONNECTS TO:** Social Content Journey, Video Ad Journey

---

## Journey 5: Social Content Generation

**GOAL:** User generates social media posts with images and captions

**STEPS:**
1. User navigates to Content page → clicks "Create Post"
2. User selects content type from library (Poll, Carousel, BTS Reel, etc.)
3. User selects assets to include (from approved library)
4. System generates caption using content type template + Claude
5. User sees preview with image(s) + caption + hashtags
6. User grades: thumbs + tags + text feedback
7. User clicks "Approve" → content added to calendar queue

**CONNECTS TO:** Grid Preview Journey, Export Journey

---

## Journey 6: Video Ad Generation

**GOAL:** User generates video ads with scripts and AI-generated clips

**STEPS:**
1. User navigates to Video page → clicks "Create Ad"
2. User selects ad format (Hook Test, Short-form, Standard, Anthem)
3. User selects approved assets to feature
4. Claude generates script with hook variations
5. User reviews script options → picks favorite hooks
6. User clicks "Generate Video" → Sora 2 and Gemini Video generate in parallel
7. User compares video outputs → picks winner → grades
8. Approved video saved to asset library

**CONNECTS TO:** Export Journey

---

## Journey 7: Content Calendar & Grid Preview

**GOAL:** User previews how approved content will look on social media grids

**STEPS:**
1. User navigates to Calendar page → sees approved content in list
2. User clicks "Grid Preview" → sees Instagram-style 3-column grid
3. User can drag-drop to reorder content
4. User can toggle between IG Grid / TikTok Feed views
5. User sees color flow and variety at a glance
6. User clicks "Lock Order" → saves sequence for export

**CONNECTS TO:** Export Journey

---

## Journey 8: Export & Download

**GOAL:** User exports approved content for posting

**STEPS:**
1. User views approved content in library or calendar
2. User selects items to export → clicks "Export"
3. System packages files with proper naming and formats
4. User downloads ZIP with images, videos, captions (as text files)
5. (Future) User can connect social accounts for direct posting

**CONNECTS TO:** All content journeys

---

## Journey 9: Preferences & Learning Dashboard

**GOAL:** User views learned preferences and adjusts prediction weights

**STEPS:**
1. User navigates to Preferences page
2. User sees aggregated patterns: "You prefer golden hour 85% of the time"
3. User sees model win rates: "Nano Banana wins 72% for lifestyle shots"
4. User can adjust weights or reset learning for specific categories
5. System uses preferences to pre-configure future generations

**CONNECTS TO:** All generation journeys (predictions inform defaults)

---

## Journey 10: Asset Library Management

**GOAL:** User browses, filters, and manages all approved assets

**STEPS:**
1. User navigates to Library page → sees all approved assets in grid
2. User filters by city, content type, date range
3. User clicks asset → sees detail modal with metadata
4. User can use asset in new post, download, or delete
5. Asset counts and status visible at a glance

**CONNECTS TO:** Social Content Journey, Export Journey

---

# PHASE 1: FOUNDATION RESET

**Goal:** Set up database, stores, API infrastructure, and app shell for the new architecture.

**Estimated Stories:** 20

---

## Feature 1.1: Supabase Schema

**Enables Journey:** All (data foundation)

### STORY 1.1.1: Create cities table

- **Description:** As a developer, I want a cities table so that city profiles can be persisted.
- **Acceptance Criteria:**
  - [ ] Table `cities` exists in Supabase with columns: `id` (uuid, primary), `name` (text, not null), `nicknames` (jsonb), `area_codes` (jsonb), `status` (text, default 'draft'), `visual_identity` (jsonb), `avoid` (jsonb), `user_notes` (text), `created_at` (timestamptz), `updated_at` (timestamptz)
  - [ ] Can INSERT a row with name='Detroit' via Supabase client
  - [ ] Can SELECT row back by id and name
  - [ ] RLS policy allows authenticated read/write
- **Dependencies:** None
- **Files:** `supabase/migrations/001_create_cities.sql`

### STORY 1.1.2: Create city_elements table

- **Description:** As a developer, I want a city_elements table to store slang, landmarks, sports, etc. with approval status.
- **Acceptance Criteria:**
  - [ ] Table `city_elements` exists with columns: `id` (uuid), `city_id` (uuid, FK to cities), `element_type` (text: 'slang' | 'landmark' | 'sport' | 'cultural'), `element_key` (text), `element_value` (jsonb), `status` (text: 'approved' | 'rejected' | 'pending'), `notes` (text), `created_at` (timestamptz)
  - [ ] Foreign key constraint to cities.id with ON DELETE CASCADE
  - [ ] Can INSERT element linked to a city
  - [ ] Can query all elements for a city filtered by status
- **Dependencies:** 1.1.1
- **Files:** `supabase/migrations/002_create_city_elements.sql`

### STORY 1.1.3: Create designs table

- **Description:** As a developer, I want a designs table to store generated product designs.
- **Acceptance Criteria:**
  - [ ] Table `designs` exists with columns: `id` (uuid), `city_id` (uuid, FK), `product_type` (text), `design_name` (text), `design_style` (text), `slang_term` (text), `front_design` (jsonb), `back_design` (jsonb), `colorways` (jsonb), `generation_params` (jsonb), `status` (text: 'generated' | 'approved' | 'rejected'), `created_at` (timestamptz)
  - [ ] Can INSERT a design linked to a city
  - [ ] Can query designs by city_id and status
- **Dependencies:** 1.1.1
- **Files:** `supabase/migrations/003_create_designs.sql`

### STORY 1.1.4: Create generated_content table

- **Description:** As a developer, I want a universal generated_content table for all AI outputs.
- **Acceptance Criteria:**
  - [ ] Table `generated_content` exists with columns: `id` (uuid), `content_type` (text: 'product_shot' | 'lifestyle_shot' | 'social_post' | 'video_ad'), `parent_id` (uuid, nullable FK to designs), `city_id` (uuid, FK), `generation_params` (jsonb), `model_used` (text), `prompt_used` (text), `output_url` (text), `output_metadata` (jsonb), `status` (text), `created_at` (timestamptz)
  - [ ] Can INSERT content of any type
  - [ ] Can query by content_type, city_id, status
- **Dependencies:** 1.1.1, 1.1.3
- **Files:** `supabase/migrations/004_create_generated_content.sql`

### STORY 1.1.5: Create feedback table

- **Description:** As a developer, I want a feedback table to capture user ratings on all content.
- **Acceptance Criteria:**
  - [ ] Table `feedback` exists with columns: `id` (uuid), `content_id` (uuid), `content_type` (text), `rating` (text: 'thumbs_up' | 'thumbs_down'), `tags` (jsonb array), `text_feedback` (text), `comparison_winner` (boolean), `competitor_content_id` (uuid, nullable), `created_at` (timestamptz)
  - [ ] Can INSERT feedback linked to any content
  - [ ] Can query feedback aggregations (count thumbs_up by tags, etc.)
- **Dependencies:** 1.1.4
- **Files:** `supabase/migrations/005_create_feedback.sql`

### STORY 1.1.6: Create content_types table

- **Description:** As a developer, I want a content_types table for configurable social content formats.
- **Acceptance Criteria:**
  - [ ] Table `content_types` exists with columns: `id` (uuid), `name` (text), `description` (text), `template` (text), `variables` (jsonb array), `output_format` (text), `platform_specs` (jsonb), `active` (boolean), `created_at` (timestamptz)
  - [ ] Can INSERT new content type with template
  - [ ] Can query active content types
- **Dependencies:** None
- **Files:** `supabase/migrations/006_create_content_types.sql`

### STORY 1.1.7: Create prompt_templates table

- **Description:** As a developer, I want a prompt_templates table to store reusable AI prompts.
- **Acceptance Criteria:**
  - [ ] Table `prompt_templates` exists with columns: `id` (uuid), `name` (text), `category` (text), `model_target` (text), `prompt` (text), `variables` (jsonb), `settings` (jsonb), `success_rate` (numeric), `usage_count` (integer), `created_at` (timestamptz)
  - [ ] Can INSERT prompt template
  - [ ] Can query by category and model_target
- **Dependencies:** None
- **Files:** `supabase/migrations/007_create_prompt_templates.sql`

### STORY 1.1.8: Seed initial prompt templates

- **Description:** As a developer, I want the master prompt library seeded into the database.
- **Acceptance Criteria:**
  - [ ] At least 10 prompt templates seeded from TMH_AI_Content_Engine_Knowledge_Base.md
  - [ ] Templates include: product flat lay, ghost mannequin, lifestyle shot, video ad prompts
  - [ ] Each template has variables array populated
  - [ ] Can query and retrieve seeded templates
- **Dependencies:** 1.1.7
- **Files:** `supabase/migrations/008_seed_prompt_templates.sql`

---

## Feature 1.2: Zustand Store Setup

**Enables Journey:** All (state management)

### STORY 1.2.1: Create cityStore with initial state

- **Description:** As a developer, I want a Zustand store for city state management.
- **Acceptance Criteria:**
  - [ ] File `src/stores/cityStore.ts` exports `useCityStore` hook
  - [ ] Initial state: `{ cities: [], selectedCity: null, loading: false, error: null }`
  - [ ] Store can be imported and called in a component without error
  - [ ] TypeScript types defined for City interface
- **Dependencies:** None
- **Files:** `src/stores/cityStore.ts`, `src/types/city.ts`

### STORY 1.2.2: Add city CRUD actions to cityStore

- **Description:** As a developer, I want CRUD actions in cityStore.
- **Acceptance Criteria:**
  - [ ] `setCities(cities)` replaces cities array
  - [ ] `addCity(city)` appends to cities array
  - [ ] `selectCity(id)` sets selectedCity to matching city or null
  - [ ] `updateCity(id, data)` merges data into matching city
  - [ ] `removeCity(id)` filters out matching city
  - [ ] `setLoading(bool)` and `setError(error)` work correctly
- **Dependencies:** 1.2.1
- **Files:** `src/stores/cityStore.ts`

### STORY 1.2.3: Create generationStore with initial state

- **Description:** As a developer, I want a Zustand store for tracking generation state.
- **Acceptance Criteria:**
  - [ ] File `src/stores/generationStore.ts` exports `useGenerationStore` hook
  - [ ] Initial state: `{ queue: [], currentGeneration: null, comparisons: [], loading: false }`
  - [ ] TypeScript types defined for Generation, Comparison interfaces
- **Dependencies:** None
- **Files:** `src/stores/generationStore.ts`, `src/types/generation.ts`

### STORY 1.2.4: Add generation actions to generationStore

- **Description:** As a developer, I want actions to manage generation queue and comparisons.
- **Acceptance Criteria:**
  - [ ] `addToQueue(item)` appends to queue
  - [ ] `setCurrentGeneration(gen)` sets currentGeneration
  - [ ] `addComparison(modelA, modelB)` creates comparison object
  - [ ] `selectWinner(comparisonId, winner)` marks winner in comparison
  - [ ] `clearQueue()` empties queue
- **Dependencies:** 1.2.3
- **Files:** `src/stores/generationStore.ts`

### STORY 1.2.5: Create feedbackStore with initial state

- **Description:** As a developer, I want a Zustand store for feedback capture.
- **Acceptance Criteria:**
  - [ ] File `src/stores/feedbackStore.ts` exports `useFeedbackStore` hook
  - [ ] Initial state: `{ pendingFeedback: null, feedbackHistory: [], submitting: false }`
  - [ ] TypeScript types defined for Feedback interface
- **Dependencies:** None
- **Files:** `src/stores/feedbackStore.ts`, `src/types/feedback.ts`

### STORY 1.2.6: Add feedback actions to feedbackStore

- **Description:** As a developer, I want actions to capture and submit feedback.
- **Acceptance Criteria:**
  - [ ] `startFeedback(contentId, contentType)` initializes pendingFeedback
  - [ ] `setRating(rating)` sets thumbs_up or thumbs_down
  - [ ] `toggleTag(tag)` adds/removes tag from tags array
  - [ ] `setTextFeedback(text)` sets text feedback
  - [ ] `submitFeedback()` moves pending to history and clears pending
- **Dependencies:** 1.2.5
- **Files:** `src/stores/feedbackStore.ts`

---

## Feature 1.3: API Route Infrastructure

**Enables Journey:** All (backend communication)

### STORY 1.3.1: Create Supabase client utility

- **Description:** As a developer, I want a configured Supabase client for API routes.
- **Acceptance Criteria:**
  - [ ] File `src/lib/supabase.ts` exports `supabase` client
  - [ ] Client uses environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] Client can be imported in both server and client components
  - [ ] Includes typed helpers for common queries
- **Dependencies:** None
- **Files:** `src/lib/supabase.ts`, `.env.local.example`

### STORY 1.3.2: Create Perplexity API client

- **Description:** As a developer, I want a Perplexity API client for city research.
- **Acceptance Criteria:**
  - [ ] File `src/lib/perplexity.ts` exports `perplexitySearch(query)` function
  - [ ] Function calls Perplexity API with proper auth header
  - [ ] Returns parsed JSON response
  - [ ] Handles errors gracefully with typed error response
  - [ ] Uses environment variable `PERPLEXITY_API_KEY`
- **Dependencies:** None
- **Files:** `src/lib/perplexity.ts`

### STORY 1.3.3: Create Claude API client

- **Description:** As a developer, I want a Claude API client for prompt generation and synthesis.
- **Acceptance Criteria:**
  - [ ] File `src/lib/claude.ts` exports `claudeGenerate(prompt, options)` function
  - [ ] Function calls Anthropic API with proper auth
  - [ ] Supports system prompt and user prompt
  - [ ] Returns parsed response content
  - [ ] Uses environment variable `ANTHROPIC_API_KEY`
- **Dependencies:** None
- **Files:** `src/lib/claude.ts`

### STORY 1.3.4: Create image generation client (multi-model)

- **Description:** As a developer, I want an image generation client that supports multiple models.
- **Acceptance Criteria:**
  - [ ] File `src/lib/imageGeneration.ts` exports `generateImage(prompt, model, options)` function
  - [ ] `model` parameter accepts 'nano_banana' | 'openai'
  - [ ] Routes to correct API based on model
  - [ ] Returns standardized response: `{ url, model, prompt, metadata }`
  - [ ] Handles errors with typed responses
- **Dependencies:** None
- **Files:** `src/lib/imageGeneration.ts`

---

## Feature 1.4: App Shell & Navigation

**Enables Journey:** All (consistent navigation)

### STORY 1.4.1: Create app layout with sidebar navigation

- **Description:** As a user, I want a consistent navigation sidebar across all pages.
- **Acceptance Criteria:**
  - [ ] Layout component wraps all pages in `src/app/layout.tsx`
  - [ ] Sidebar with links: Cities, Generate, Content, Calendar, Library, Preferences, Settings
  - [ ] Each link has icon (Lucide icons) and label
  - [ ] Active route highlighted with different background color
  - [ ] Sidebar is 240px wide on desktop
  - [ ] TMH logo at top links to `/cities`
- **Dependencies:** None
- **Files:** `src/app/layout.tsx`, `src/components/Sidebar.tsx`

### STORY 1.4.2: Create mobile navigation

- **Description:** As a user, I want navigation to work on mobile devices.
- **Acceptance Criteria:**
  - [ ] Sidebar hidden on screens < 768px
  - [ ] Hamburger menu button appears in header on mobile
  - [ ] Clicking hamburger opens sidebar as overlay
  - [ ] Clicking outside overlay closes it
  - [ ] Clicking nav link closes overlay and navigates
- **Dependencies:** 1.4.1
- **Files:** `src/components/Sidebar.tsx`, `src/components/MobileNav.tsx`

### STORY 1.4.3: Create breadcrumb component

- **Description:** As a user, I want to see my location in the app hierarchy.
- **Acceptance Criteria:**
  - [ ] Breadcrumb component shows path: Home > Cities > Detroit
  - [ ] Each segment is clickable link except current page
  - [ ] Displays below header, above page content
  - [ ] Auto-generates from route path
- **Dependencies:** 1.4.1
- **Files:** `src/components/Breadcrumb.tsx`

---

# PHASE 2: CITY ONBOARDING

**Goal:** Implement the complete city onboarding flow from input to approved profile.

**Estimated Stories:** 13

---

## Feature 2.1: City List Page

**Enables Journey:** City Onboarding (step 1)

### STORY 2.1.1: Create cities page with empty state

- **Description:** As a user, I want to see a Cities page so I can view and manage cities.
- **Acceptance Criteria:**
  - [ ] Route `/cities` renders CitiesPage component
  - [ ] Page has heading "Cities"
  - [ ] Empty state shows "No cities yet" message
  - [ ] "Add City" button is visible with `data-testid="add-city-button"`
- **Dependencies:** 1.4.1
- **Files:** `src/app/cities/page.tsx`

### STORY 2.1.2: Display city cards in grid

- **Description:** As a user, I want to see my cities displayed as cards.
- **Acceptance Criteria:**
  - [ ] CityCard component exists with props: `city: City`
  - [ ] Card shows: city name, status badge, area codes, nickname count
  - [ ] Cards display in responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
  - [ ] Clicking card navigates to `/cities/[cityId]`
- **Dependencies:** 2.1.1, 1.2.1
- **Files:** `src/components/CityCard.tsx`, `src/app/cities/page.tsx`

### STORY 2.1.3: Fetch cities from Supabase on page load

- **Description:** As a user, I want cities to load from the database when I visit the page.
- **Acceptance Criteria:**
  - [ ] Page calls `supabase.from('cities').select('*')` on mount
  - [ ] Loading state shows skeleton cards while fetching
  - [ ] Fetched cities populate cityStore via `setCities()`
  - [ ] Error state shows error message if query fails
- **Dependencies:** 2.1.2, 1.3.1, 1.2.2
- **Files:** `src/app/cities/page.tsx`

---

## Feature 2.2: Add City Modal

**Enables Journey:** City Onboarding (steps 1-2)

### STORY 2.2.1: Create AddCityModal component shell

- **Description:** As a user, I want an Add City modal to appear when I click the button.
- **Acceptance Criteria:**
  - [ ] Clicking "Add City" button opens modal with `data-testid="add-city-modal"`
  - [ ] Modal has close button (X) that closes modal
  - [ ] Modal has heading "Add New City"
  - [ ] Clicking outside modal closes it
- **Dependencies:** 2.1.1
- **Files:** `src/components/AddCityModal.tsx`, `src/app/cities/page.tsx`

### STORY 2.2.2: Add city name input with validation

- **Description:** As a user, I want to enter a city name in the modal.
- **Acceptance Criteria:**
  - [ ] Text input with `name="cityName"` and placeholder "Enter city name..."
  - [ ] Input validates: required, min 2 characters
  - [ ] Validation error shows below input when invalid
  - [ ] Submit button disabled when input invalid
- **Dependencies:** 2.2.1
- **Files:** `src/components/AddCityModal.tsx`

### STORY 2.2.3: Add research configuration checklist

- **Description:** As a user, I want to configure what research categories to include.
- **Acceptance Criteria:**
  - [ ] Checklist section with heading "Research Categories"
  - [ ] Checkboxes for: Slang, Landmarks, Sports, Culture, Visual Identity, Area Codes
  - [ ] All checkboxes checked by default
  - [ ] User can toggle individual checkboxes
  - [ ] State stored in component for submission
- **Dependencies:** 2.2.2
- **Files:** `src/components/AddCityModal.tsx`

### STORY 2.2.4: Add custom research prompt field

- **Description:** As a user, I want to add custom research instructions.
- **Acceptance Criteria:**
  - [ ] Textarea with `name="customPrompt"` and placeholder "Any specific things to research?"
  - [ ] Textarea is optional (can be empty)
  - [ ] Max length 500 characters with counter
- **Dependencies:** 2.2.3
- **Files:** `src/components/AddCityModal.tsx`

### STORY 2.2.5: Submit modal creates city and triggers research

- **Description:** As a user, I want to submit the modal to start city research.
- **Acceptance Criteria:**
  - [ ] Clicking "Start Research" button calls POST `/api/cities`
  - [ ] Request body includes: `{ name, researchCategories, customPrompt }`
  - [ ] Loading state shows spinner on button
  - [ ] Success: modal closes, city appears in list with status "researching"
  - [ ] Error: error message shown in modal
- **Dependencies:** 2.2.4
- **Files:** `src/components/AddCityModal.tsx`, `src/app/api/cities/route.ts`

---

## Feature 2.3: City Research API

**Enables Journey:** City Onboarding (step 3)

### STORY 2.3.1: Create POST /api/cities endpoint

- **Description:** As a developer, I want an API route to create a city and initiate research.
- **Acceptance Criteria:**
  - [ ] POST `/api/cities` accepts body: `{ name, researchCategories, customPrompt }`
  - [ ] Creates city record in Supabase with status='researching'
  - [ ] Returns city object with id
  - [ ] Returns 400 with `{ error: 'City name is required' }` if name missing
  - [ ] Returns 400 with `{ error: 'City name must be at least 2 characters' }` if too short
  - [ ] Returns 409 with `{ error: 'City already exists' }` if duplicate name
  - [ ] Returns 500 with `{ error: message }` if database error
- **Dependencies:** 1.3.1, 1.1.1
- **Files:** `src/app/api/cities/route.ts`

### STORY 2.3.2: Create research pipeline function

- **Description:** As a developer, I want a function that orchestrates Perplexity + Claude research.
- **Acceptance Criteria:**
  - [ ] Function `runCityResearch(cityId, name, categories, customPrompt)` in `src/lib/research.ts`
  - [ ] Calls Perplexity with city-specific query based on categories
  - [ ] Passes Perplexity results to Claude for synthesis and ranking
  - [ ] Returns structured research results matching city_elements schema
  - [ ] Updates city status to 'review' when complete
- **Dependencies:** 1.3.2, 1.3.3
- **Files:** `src/lib/research.ts`

### STORY 2.3.3: Store research results as city_elements

- **Description:** As a developer, I want research results saved as city_elements.
- **Acceptance Criteria:**
  - [ ] Research results INSERT into city_elements table
  - [ ] Each element has element_type, element_key, element_value, status='pending'
  - [ ] Elements are linked to city_id
  - [ ] At least 5 slang terms, 5 landmarks, 3 sports teams per research
- **Dependencies:** 2.3.2, 1.1.2
- **Files:** `src/lib/research.ts`

---

## Feature 2.4: City Review Page

**Enables Journey:** City Onboarding (steps 4-7)

### STORY 2.4.1: Create city detail page with research results

- **Description:** As a user, I want to see research results on the city detail page.
- **Acceptance Criteria:**
  - [ ] Route `/cities/[cityId]` renders CityDetailPage
  - [ ] Page fetches city and city_elements from Supabase
  - [ ] Shows city name, status, area codes
  - [ ] Displays research elements grouped by element_type
- **Dependencies:** 1.1.1, 1.1.2, 1.3.1
- **Files:** `src/app/cities/[cityId]/page.tsx`

### STORY 2.4.2: Create ElementReviewCard component

- **Description:** As a user, I want to approve/reject individual research elements.
- **Acceptance Criteria:**
  - [ ] ElementReviewCard shows: element name, value/meaning, current status
  - [ ] Three buttons: Approve (green), Reject (red), Maybe (yellow)
  - [ ] Clicking button updates element status in local state
  - [ ] Optional notes field expands on click
- **Dependencies:** 2.4.1
- **Files:** `src/components/ElementReviewCard.tsx`

### STORY 2.4.3: Save element approvals to database

- **Description:** As a user, I want my approval decisions saved.
- **Acceptance Criteria:**
  - [ ] "Save Decisions" button calls PATCH `/api/cities/[cityId]/elements`
  - [ ] Request includes array of `{ elementId, status, notes }`
  - [ ] Database updates each element's status
  - [ ] Success toast: "Decisions saved"
- **Dependencies:** 2.4.2
- **Files:** `src/app/cities/[cityId]/page.tsx`, `src/app/api/cities/[cityId]/elements/route.ts`

### STORY 2.4.4: Approve city profile

- **Description:** As a user, I want to finalize and approve the city profile.
- **Acceptance Criteria:**
  - [ ] "Approve City Profile" button visible when at least 3 elements approved
  - [ ] Clicking button calls PATCH `/api/cities/[cityId]` with status='approved'
  - [ ] City status updates to 'approved'
  - [ ] Button changes to "City Approved" (disabled, green)
  - [ ] "Start Generating" button appears
- **Dependencies:** 2.4.3
- **Files:** `src/app/cities/[cityId]/page.tsx`, `src/app/api/cities/[cityId]/route.ts`

---

# PHASE 3: DESIGN GENERATION

**Goal:** Implement design generation with A/B model comparison and feedback capture.

**Estimated Stories:** 11

---

## Feature 3.1: Generation Page Setup

**Enables Journey:** Design Generation (steps 1-4)

### STORY 3.1.1: Create generate page with city selector

- **Description:** As a user, I want to select a city to generate designs for.
- **Acceptance Criteria:**
  - [ ] Route `/generate` renders GeneratePage
  - [ ] CitySelector dropdown shows only approved cities
  - [ ] Selecting city stores in generationStore
  - [ ] Shows "Select a city to begin" when none selected
- **Dependencies:** 1.2.3, 1.2.1, 1.4.1
- **Files:** `src/app/generate/page.tsx`, `src/components/CitySelector.tsx`

### STORY 3.1.2: Add product type selector

- **Description:** As a user, I want to select what product type to generate.
- **Acceptance Criteria:**
  - [ ] Radio group with options: Hoodie, T-Shirt, Hat
  - [ ] "Hoodie" selected by default
  - [ ] Selection stored in generationStore
  - [ ] Shows product icon for each option
- **Dependencies:** 3.1.1
- **Files:** `src/app/generate/page.tsx`

### STORY 3.1.3: Add design style selector

- **Description:** As a user, I want to select a design style.
- **Acceptance Criteria:**
  - [ ] Radio group with options: Minimal, Bold, Vintage, Modern, Luxury
  - [ ] Each option has short description tooltip
  - [ ] Selection stored in generationStore
- **Dependencies:** 3.1.2
- **Files:** `src/app/generate/page.tsx`

### STORY 3.1.4: Add slang term selector with suggestions

- **Description:** As a user, I want to pick a slang term or see suggestions.
- **Acceptance Criteria:**
  - [ ] Dropdown populated with approved slang from selected city
  - [ ] "Let AI Suggest" option at top
  - [ ] Shows meaning next to each term
  - [ ] Selection stored in generationStore
- **Dependencies:** 3.1.3
- **Files:** `src/app/generate/page.tsx`

---

## Feature 3.2: Generation Execution

**Enables Journey:** Design Generation (steps 5-6)

### STORY 3.2.1: Create "Generate Designs" button with loading state

- **Description:** As a user, I want to click a button to start generation.
- **Acceptance Criteria:**
  - [ ] "Generate Designs" button enabled when city, product, style selected
  - [ ] Clicking button shows loading state with spinner
  - [ ] Button disabled during generation
  - [ ] Loading message: "Generating with 2 models..."
- **Dependencies:** 3.1.4
- **Files:** `src/app/generate/page.tsx`

### STORY 3.2.2: Create POST /api/generate/design endpoint

- **Description:** As a developer, I want an API to generate designs with two models.
- **Acceptance Criteria:**
  - [ ] POST `/api/generate/design` accepts: `{ cityId, productType, designStyle, slangTerm }`
  - [ ] Fetches prompt template from database
  - [ ] Calls Claude to finalize prompt with variables
  - [ ] Calls Nano Banana with prompt
  - [ ] Calls OpenAI with same prompt
  - [ ] Returns: `{ modelA: { url, model }, modelB: { url, model }, prompt }`
  - [ ] Returns 400 with `{ error: 'City ID is required' }` if cityId missing
  - [ ] Returns 404 with `{ error: 'City not found' }` if city doesn't exist
  - [ ] Returns partial success if one model succeeds: `{ modelA: result, modelB: null, modelBError: message }`
- **Dependencies:** 1.3.3, 1.3.4, 1.1.7
- **Files:** `src/app/api/generate/design/route.ts`

### STORY 3.2.3: Display generation results in comparison view

- **Description:** As a user, I want to see both generated designs side by side.
- **Acceptance Criteria:**
  - [ ] ComparisonViewer component receives modelA and modelB results
  - [ ] Shows images side by side (or stacked on mobile)
  - [ ] Labels: "Model A" and "Model B" (not actual model names initially)
  - [ ] Images are same size, centered
- **Dependencies:** 3.2.2
- **Files:** `src/components/ComparisonViewer.tsx`, `src/app/generate/page.tsx`

---

## Feature 3.3: Comparison & Feedback

**Enables Journey:** Design Generation (steps 7-9)

### STORY 3.3.1: Add "Pick Winner" buttons to comparison

- **Description:** As a user, I want to pick which design I prefer.
- **Acceptance Criteria:**
  - [ ] "Pick A" and "Pick B" buttons below each image
  - [ ] Clicking highlights winner with border/checkmark
  - [ ] Stores winner selection in generationStore
  - [ ] Reveals feedback panel after selection
- **Dependencies:** 3.2.3
- **Files:** `src/components/ComparisonViewer.tsx`

### STORY 3.3.2: Create FeedbackPanel component

- **Description:** As a user, I want to provide detailed feedback on my choice.
- **Acceptance Criteria:**
  - [ ] FeedbackPanel shows: thumbs up/down toggle, tag checkboxes, text input
  - [ ] Thumbs buttons are mutually exclusive
  - [ ] Tags from POSITIVE_TAGS and NEGATIVE_TAGS arrays (10 each)
  - [ ] Text input placeholder: "Any specific feedback?"
  - [ ] "Submit Feedback" button at bottom
- **Dependencies:** 3.3.1, 1.2.5
- **Files:** `src/components/FeedbackPanel.tsx`

### STORY 3.3.3: Submit feedback to database

- **Description:** As a user, I want my feedback saved for learning.
- **Acceptance Criteria:**
  - [ ] Clicking "Submit Feedback" calls POST `/api/feedback`
  - [ ] Request includes: contentId, contentType, rating, tags, textFeedback, comparisonWinner
  - [ ] Saves to feedback table
  - [ ] Also saves winning design to designs table with status='approved'
  - [ ] Shows success message: "Design saved!"
  - [ ] Returns 400 with `{ error: 'Rating is required' }` if rating missing
  - [ ] Returns 400 with `{ error: 'Invalid rating value' }` if rating not thumbs_up/thumbs_down
  - [ ] Returns 404 with `{ error: 'Content not found' }` if content_id invalid
- **Dependencies:** 3.3.2, 1.1.5, 1.1.3
- **Files:** `src/components/FeedbackPanel.tsx`, `src/app/api/feedback/route.ts`

### STORY 3.3.4: Show "Generate More" and "Continue to Shots" options

- **Description:** As a user, I want to generate more designs or continue to next step.
- **Acceptance Criteria:**
  - [ ] After feedback submitted, show two buttons
  - [ ] "Generate Another" resets form for new generation
  - [ ] "Generate Product Shots" navigates to shots page with design context
  - [ ] Approved design ID passed as query param
- **Dependencies:** 3.3.3
- **Files:** `src/app/generate/page.tsx`

---

# PHASE 4: CONTENT CASCADE

**Goal:** Implement product shots, lifestyle shots, social content, and video generation.

**Estimated Stories:** 20

---

## Feature 4.1: Product Shot Generation

**Enables Journey:** Product Shot Generation

### STORY 4.1.1: Create product shots page

- **Description:** As a user, I want a page to generate product photography.
- **Acceptance Criteria:**
  - [ ] Route `/generate/shots` renders ProductShotsPage
  - [ ] Reads designId from query params
  - [ ] Fetches design details from database
  - [ ] Shows design preview thumbnail
- **Dependencies:** 3.3.3
- **Files:** `src/app/generate/shots/page.tsx`

### STORY 4.1.2: Add shot type checklist

- **Description:** As a user, I want to select which shot types to generate.
- **Acceptance Criteria:**
  - [ ] Checkboxes: Flat Lay Front, Flat Lay Back, Ghost Mannequin, Hanging, Macro Detail
  - [ ] At least one must be selected to proceed
  - [ ] Each checkbox has icon and description
  - [ ] Default: all checked
- **Dependencies:** 4.1.1
- **Files:** `src/app/generate/shots/page.tsx`

### STORY 4.1.3: Generate product shots with comparison

- **Description:** As a user, I want to generate each shot type with model comparison.
- **Acceptance Criteria:**
  - [ ] "Generate Shots" button triggers generation for each selected type
  - [ ] Progress indicator: "Generating shot 1 of 5..."
  - [ ] Each shot generated with Model A and Model B
  - [ ] Results displayed in scrollable gallery
- **Dependencies:** 4.1.2, 1.3.4
- **Files:** `src/app/generate/shots/page.tsx`, `src/app/api/generate/product-shot/route.ts`

### STORY 4.1.4: Review and approve product shots

- **Description:** As a user, I want to pick winners and approve shots.
- **Acceptance Criteria:**
  - [ ] Each shot pair shows in ComparisonViewer
  - [ ] Can pick winner for each pair
  - [ ] Can provide feedback for each
  - [ ] "Approve All Winners" button saves all at once
  - [ ] Approved shots saved to generated_content with status='approved'
- **Dependencies:** 4.1.3, 3.3.2
- **Files:** `src/app/generate/shots/page.tsx`

---

## Feature 4.2: Lifestyle Shot Generation

**Enables Journey:** Lifestyle Shot Generation

### STORY 4.2.1: Create lifestyle shots page

- **Description:** As a user, I want a page to generate lifestyle photography.
- **Acceptance Criteria:**
  - [ ] Route `/generate/lifestyle` renders LifestyleShotsPage
  - [ ] Reads designId from query params
  - [ ] Shows design preview and city context
- **Dependencies:** 4.1.4
- **Files:** `src/app/generate/lifestyle/page.tsx`

### STORY 4.2.2: Add model/location/style configurator

- **Description:** As a user, I want to configure lifestyle shot parameters.
- **Acceptance Criteria:**
  - [ ] Model demographics dropdown (auto-populated from diversity requirements)
  - [ ] Location dropdown (populated from city landmarks)
  - [ ] Time of day selector (Golden Hour, Blue Hour, Midday, Night)
  - [ ] Activity selector (Walking, Standing, Sitting, Conversation)
  - [ ] Sneaker selector (from approved whitelist)
- **Dependencies:** 4.2.1
- **Files:** `src/app/generate/lifestyle/page.tsx`

### STORY 4.2.3: Generate lifestyle shots with comparison

- **Description:** As a user, I want to generate lifestyle shots.
- **Acceptance Criteria:**
  - [ ] "Generate Lifestyle Shots" generates 3 variations
  - [ ] Each variation uses different model/location combo
  - [ ] Each generated with Model A and Model B
  - [ ] Results in scrollable comparison gallery
- **Dependencies:** 4.2.2, 1.3.4
- **Files:** `src/app/generate/lifestyle/page.tsx`, `src/app/api/generate/lifestyle-shot/route.ts`

### STORY 4.2.4: Review and approve lifestyle shots

- **Description:** As a user, I want to approve lifestyle shots.
- **Acceptance Criteria:**
  - [ ] Same flow as product shots: pick winners, provide feedback
  - [ ] "Approve Selected" saves approved shots
  - [ ] Shows "Continue to Social Content" button after approvals
- **Dependencies:** 4.2.3, 3.3.2
- **Files:** `src/app/generate/lifestyle/page.tsx`

---

## Feature 4.3: Social Content Generation

**Enables Journey:** Social Content Generation

### STORY 4.3.1: Create social content page

- **Description:** As a user, I want a page to create social posts.
- **Acceptance Criteria:**
  - [ ] Route `/content` renders SocialContentPage
  - [ ] Shows list of available content types from database
  - [ ] "Create Post" button for each content type
- **Dependencies:** 1.1.6
- **Files:** `src/app/content/page.tsx`

### STORY 4.3.2: Create content type selector

- **Description:** As a user, I want to choose a content format.
- **Acceptance Criteria:**
  - [ ] ContentTypeCard for each active content type
  - [ ] Card shows: name, description, output format icon
  - [ ] Clicking card opens content creation flow
  - [ ] Passes content_type_id to creation flow
- **Dependencies:** 4.3.1
- **Files:** `src/components/ContentTypeCard.tsx`

### STORY 4.3.3: Create asset selector for social posts

- **Description:** As a user, I want to select approved assets for my post.
- **Acceptance Criteria:**
  - [ ] AssetSelector shows approved product and lifestyle shots
  - [ ] Filterable by city, product, shot type
  - [ ] Multi-select for carousel formats
  - [ ] Single select for single image formats
  - [ ] Selected assets shown with checkmarks
- **Dependencies:** 4.3.2
- **Files:** `src/components/AssetSelector.tsx`

### STORY 4.3.4: Generate caption and hashtags

- **Description:** As a user, I want AI-generated captions for my posts.
- **Acceptance Criteria:**
  - [ ] After asset selection, system generates caption
  - [ ] Uses content type template + Claude
  - [ ] Shows generated caption in editable textarea
  - [ ] Shows hashtags as tags (can remove/add)
  - [ ] "Regenerate" button for new caption
- **Dependencies:** 4.3.3, 1.3.3
- **Files:** `src/app/content/create/page.tsx`, `src/app/api/generate/caption/route.ts`

### STORY 4.3.5: Preview and approve social post

- **Description:** As a user, I want to preview and approve my post.
- **Acceptance Criteria:**
  - [ ] Preview shows image(s) + caption in platform-styled frame
  - [ ] Toggle between Instagram and TikTok preview styles
  - [ ] Feedback panel for thumbs + tags
  - [ ] "Approve & Add to Calendar" saves to database
- **Dependencies:** 4.3.4
- **Files:** `src/app/content/create/page.tsx`

---

## Feature 4.4: Content Type Management

**Enables Journey:** Social Content Generation (configurable types)

### STORY 4.4.1: Create content types management page

- **Description:** As a user, I want to manage content type templates.
- **Acceptance Criteria:**
  - [ ] Route `/settings/content-types` renders ContentTypesPage
  - [ ] Lists all content types with name, status, usage count
  - [ ] "Add Content Type" button
  - [ ] Edit/Delete buttons per row
- **Dependencies:** 1.1.6
- **Files:** `src/app/settings/content-types/page.tsx`

### STORY 4.4.2: Create content type editor

- **Description:** As a user, I want to create/edit content type templates.
- **Acceptance Criteria:**
  - [ ] Form with: name, description, template (textarea), variables (tag input)
  - [ ] Output format selector: single_image, carousel, video
  - [ ] Platform specs: aspect ratios per platform
  - [ ] Active toggle
  - [ ] Save creates/updates record in database
- **Dependencies:** 4.4.1
- **Files:** `src/components/ContentTypeEditor.tsx`

---

## Feature 4.5: Video Ad Generation

**Enables Journey:** Video Ad Generation

### STORY 4.5.1: Create video ads page

- **Description:** As a user, I want a page to create video advertisements.
- **Acceptance Criteria:**
  - [ ] Route `/generate/video` renders VideoAdsPage
  - [ ] Shows heading "Create Video Ad"
  - [ ] City selector dropdown (approved cities only)
  - [ ] Format selector: Hook Test (3-5s), Short-form (15-30s), Standard (30-60s), Anthem (45-90s)
- **Dependencies:** 3.3.3
- **Files:** `src/app/generate/video/page.tsx`

### STORY 4.5.2: Add asset selector for video

- **Description:** As a user, I want to select approved assets to feature in my video.
- **Acceptance Criteria:**
  - [ ] Shows approved product shots and lifestyle shots for selected city
  - [ ] Multi-select with checkboxes
  - [ ] Selected assets shown in "Selected Assets" preview strip
  - [ ] Minimum 1 asset required to proceed
- **Dependencies:** 4.5.1
- **Files:** `src/app/generate/video/page.tsx`

### STORY 4.5.3: Generate video script with hook variations

- **Description:** As a user, I want AI to generate a script with multiple hook options.
- **Acceptance Criteria:**
  - [ ] "Generate Script" button calls POST `/api/generate/video-script`
  - [ ] API uses Claude to generate script based on format, city, assets
  - [ ] Returns: main script + 3 hook variations
  - [ ] Display script in editable textarea
  - [ ] Display hooks as selectable cards (pick 1-3 to generate)
- **Dependencies:** 4.5.2, 1.3.3
- **Files:** `src/app/generate/video/page.tsx`, `src/app/api/generate/video-script/route.ts`

### STORY 4.5.4: Generate videos with model comparison

- **Description:** As a user, I want to generate videos with two models for comparison.
- **Acceptance Criteria:**
  - [ ] "Generate Video" button triggers generation
  - [ ] Calls Sora 2 API with script + assets
  - [ ] Calls Gemini Video API with same inputs
  - [ ] Shows progress: "Generating with Sora 2..." then "Generating with Gemini..."
  - [ ] Both videos display in ComparisonViewer when complete
- **Dependencies:** 4.5.3, 4.5.5
- **Files:** `src/app/generate/video/page.tsx`, `src/app/api/generate/video/route.ts`

### STORY 4.5.5: Create video API clients

- **Description:** As a developer, I want API clients for video generation models.
- **Acceptance Criteria:**
  - [ ] File `src/lib/videoGeneration.ts` exports `generateVideo(script, assets, model, options)`
  - [ ] `model` parameter accepts 'sora_2' | 'gemini_video'
  - [ ] Routes to correct API based on model
  - [ ] Returns standardized response: `{ url, model, duration, metadata }`
  - [ ] Uses environment variables `OPENAI_API_KEY` (Sora) and `GOOGLE_AI_API_KEY` (Gemini)
- **Dependencies:** None
- **Files:** `src/lib/videoGeneration.ts`

### STORY 4.5.6: Review and approve video ads

- **Description:** As a user, I want to compare, grade, and approve video ads.
- **Acceptance Criteria:**
  - [ ] ComparisonViewer works with video (play buttons, same UI as images)
  - [ ] Pick winner button for videos
  - [ ] Feedback panel same as images (thumbs, tags, text)
  - [ ] "Approve" saves to generated_content with content_type='video_ad'
  - [ ] Shows "View in Library" button after approval
- **Dependencies:** 4.5.4, 3.3.2
- **Files:** `src/app/generate/video/page.tsx`

---

# PHASE 5: EXPORT & PREVIEW

**Goal:** Implement asset library, social media grid preview, and export functionality.

**Estimated Stories:** 10

---

## Feature 5.0: Asset Library

**Enables Journey:** Asset Library Management

### STORY 5.0.1: Create asset library page

- **Description:** As a user, I want to view all my approved assets in one place.
- **Acceptance Criteria:**
  - [ ] Route `/library` renders AssetLibraryPage
  - [ ] Fetches all generated_content with status='approved'
  - [ ] Displays as grid of thumbnails
  - [ ] Shows count: "47 approved assets"
- **Dependencies:** 4.1.4, 4.2.4
- **Files:** `src/app/library/page.tsx`

### STORY 5.0.2: Add filters to asset library

- **Description:** As a user, I want to filter assets by various criteria.
- **Acceptance Criteria:**
  - [ ] Filter dropdown: City (all cities + "All")
  - [ ] Filter dropdown: Content Type (product_shot, lifestyle_shot, social_post, video_ad)
  - [ ] Filter dropdown: Date range (Last 7 days, Last 30 days, All time)
  - [ ] Filters update URL query params
  - [ ] Grid updates when filters change
- **Dependencies:** 5.0.1
- **Files:** `src/app/library/page.tsx`

### STORY 5.0.3: Add asset detail modal

- **Description:** As a user, I want to view asset details and metadata.
- **Acceptance Criteria:**
  - [ ] Clicking asset thumbnail opens modal
  - [ ] Modal shows: full-size image/video, generation params, feedback given, created date
  - [ ] "Use in Post" button (links to content creation with asset pre-selected)
  - [ ] "Download" button for single asset
  - [ ] "Delete" button with confirmation
- **Dependencies:** 5.0.2
- **Files:** `src/components/AssetDetailModal.tsx`

---

## Feature 5.1: Content Calendar

**Enables Journey:** Content Calendar & Grid Preview

### STORY 5.1.1: Create calendar page with approved content

- **Description:** As a user, I want to see all approved content in a calendar view.
- **Acceptance Criteria:**
  - [ ] Route `/calendar` renders CalendarPage
  - [ ] Fetches approved social posts from database
  - [ ] Lists content with thumbnail, caption preview, created date
  - [ ] Filter by city, content type
- **Dependencies:** 4.3.5
- **Files:** `src/app/calendar/page.tsx`

### STORY 5.1.2: Create Instagram grid preview

- **Description:** As a user, I want to see how my content will look on Instagram.
- **Acceptance Criteria:**
  - [ ] "Grid Preview" button toggles preview mode
  - [ ] Shows 3-column grid mimicking Instagram profile
  - [ ] Each cell shows post thumbnail
  - [ ] Scrollable to show more posts
  - [ ] Shows 9-12 posts at a time
- **Dependencies:** 5.1.1
- **Files:** `src/components/InstagramGridPreview.tsx`

### STORY 5.1.3: Add drag-drop reordering to grid

- **Description:** As a user, I want to reorder content by dragging.
- **Acceptance Criteria:**
  - [ ] Can drag posts to new positions in grid
  - [ ] Visual feedback during drag (ghost image, drop zone highlight)
  - [ ] Order persists in local state
  - [ ] "Lock Order" button saves order to database
- **Dependencies:** 5.1.2
- **Files:** `src/components/InstagramGridPreview.tsx`

### STORY 5.1.4: Add TikTok feed preview

- **Description:** As a user, I want to preview TikTok-style vertical feed.
- **Acceptance Criteria:**
  - [ ] Toggle between "Instagram" and "TikTok" preview modes
  - [ ] TikTok shows single-column vertical scroll
  - [ ] Each post shows 9:16 preview
  - [ ] Same drag-drop reordering works
- **Dependencies:** 5.1.3
- **Files:** `src/components/TikTokFeedPreview.tsx`

---

## Feature 5.2: Export

**Enables Journey:** Export & Download

### STORY 5.2.1: Add export selection mode

- **Description:** As a user, I want to select content for export.
- **Acceptance Criteria:**
  - [ ] "Export Mode" toggle adds checkboxes to content items
  - [ ] "Select All" / "Deselect All" buttons
  - [ ] Shows count: "5 items selected"
  - [ ] "Export Selected" button enabled when items selected
- **Dependencies:** 5.1.1
- **Files:** `src/app/calendar/page.tsx`

### STORY 5.2.2: Create export API endpoint

- **Description:** As a developer, I want an API to package content for download.
- **Acceptance Criteria:**
  - [ ] POST `/api/export` accepts array of content IDs
  - [ ] Fetches content URLs from database
  - [ ] Generates caption text files for each post
  - [ ] Creates ZIP file with organized folders (images/, videos/, captions/)
  - [ ] Returns download URL
- **Dependencies:** 5.2.1
- **Files:** `src/app/api/export/route.ts`

### STORY 5.2.3: Download exported content

- **Description:** As a user, I want to download my exported content.
- **Acceptance Criteria:**
  - [ ] After export API returns, show download link
  - [ ] Clicking link downloads ZIP file
  - [ ] ZIP contains: images in /images, videos in /videos, captions in /captions
  - [ ] File naming: `{city}_{content_type}_{date}_{index}.{ext}`
- **Dependencies:** 5.2.2
- **Files:** `src/app/calendar/page.tsx`

---

# PHASE 6: LEARNING SYSTEM

**Goal:** Implement preference tracking, pattern recognition, predictions, and settings.

**Estimated Stories:** 13

---

## Feature 6.1: Preference Dashboard

**Enables Journey:** Preferences & Learning Dashboard

### STORY 6.1.1: Create preferences page

- **Description:** As a user, I want to see my learned preferences.
- **Acceptance Criteria:**
  - [ ] Route `/preferences` renders PreferencesPage
  - [ ] Shows heading "Your Preferences"
  - [ ] Sections for: Model Preferences, Style Preferences, Content Preferences
- **Dependencies:** 1.1.5
- **Files:** `src/app/preferences/page.tsx`

### STORY 6.1.2: Display model win rate statistics

- **Description:** As a user, I want to see which AI models I prefer.
- **Acceptance Criteria:**
  - [ ] Query feedback where comparison_winner = true
  - [ ] Calculate win rate per model per content type
  - [ ] Display as bar charts: "Nano Banana: 72% | OpenAI: 28%"
  - [ ] Separate charts for: images, videos
- **Dependencies:** 6.1.1
- **Files:** `src/app/preferences/page.tsx`, `src/components/WinRateChart.tsx`

### STORY 6.1.3: Display tag frequency analysis

- **Description:** As a user, I want to see what attributes I like/dislike.
- **Acceptance Criteria:**
  - [ ] Query feedback tags
  - [ ] Count frequency of each tag with thumbs_up vs thumbs_down
  - [ ] Display as sorted list: "golden_hour: 85% positive"
  - [ ] Color code: green for positive, red for negative patterns
- **Dependencies:** 6.1.2
- **Files:** `src/app/preferences/page.tsx`, `src/components/TagAnalysis.tsx`

### STORY 6.1.4: Display city-specific insights

- **Description:** As a user, I want to see preferences per city.
- **Acceptance Criteria:**
  - [ ] Group feedback by city
  - [ ] Show top 3 positive tags per city
  - [ ] Show preferred colorways per city
  - [ ] Collapsible sections per city
- **Dependencies:** 6.1.3
- **Files:** `src/app/preferences/page.tsx`

---

## Feature 6.2: Predictive Defaults

**Enables Journey:** All generation journeys (improved defaults)

### STORY 6.2.1: Create preference calculation service

- **Description:** As a developer, I want a service to calculate preference weights.
- **Acceptance Criteria:**
  - [ ] Function `calculatePreferences(userId)` in `src/lib/preferences.ts`
  - [ ] Queries feedback table
  - [ ] Returns object: `{ modelPreferences, tagPreferences, cityPreferences }`
  - [ ] Caches result for 1 hour
- **Dependencies:** 6.1.3
- **Files:** `src/lib/preferences.ts`

### STORY 6.2.2: Apply preferences to generation defaults

- **Description:** As a developer, I want generation forms to use learned preferences.
- **Acceptance Criteria:**
  - [ ] Generation pages call `calculatePreferences()` on mount
  - [ ] If preference confidence > 70%, pre-select that option
  - [ ] Show indicator: "Based on your preferences" next to pre-selected options
  - [ ] User can still override any default
- **Dependencies:** 6.2.1
- **Files:** `src/app/generate/page.tsx`, `src/app/generate/lifestyle/page.tsx`

### STORY 6.2.3: Show prediction confidence on comparisons

- **Description:** As a user, I want to see when the system predicts my preference.
- **Acceptance Criteria:**
  - [ ] In ComparisonViewer, if one model has > 70% win rate for this content type
  - [ ] Show subtle indicator: "You usually prefer this style"
  - [ ] Don't auto-select, just inform
  - [ ] Track if prediction was correct to improve model
- **Dependencies:** 6.2.2
- **Files:** `src/components/ComparisonViewer.tsx`

---

## Feature 6.3: Prompt Template Management

**Enables Journey:** All generation journeys (custom prompts)

### STORY 6.3.1: Create prompt templates settings page

- **Description:** As a user, I want to view and manage all prompt templates.
- **Acceptance Criteria:**
  - [ ] Route `/settings/prompts` renders PromptTemplatesPage
  - [ ] Lists all prompt templates from database
  - [ ] Table columns: Name, Category, Model Target, Usage Count, Last Updated
  - [ ] Search/filter by category
  - [ ] "Add Template" button
- **Dependencies:** 1.1.7
- **Files:** `src/app/settings/prompts/page.tsx`

### STORY 6.3.2: Create prompt template editor modal

- **Description:** As a user, I want to create and edit prompt templates.
- **Acceptance Criteria:**
  - [ ] Clicking template row or "Add Template" opens editor modal
  - [ ] Form fields: name (text), category (dropdown), model_target (dropdown), prompt (textarea)
  - [ ] Variables section: add/remove variables with name and type
  - [ ] Settings section: aspect_ratio, quality, style (JSON editor or form)
  - [ ] "Save" creates or updates record
  - [ ] "Cancel" closes without saving
- **Dependencies:** 6.3.1
- **Files:** `src/components/PromptTemplateEditor.tsx`

### STORY 6.3.3: Add prompt template test mode

- **Description:** As a user, I want to test a prompt template with sample data.
- **Acceptance Criteria:**
  - [ ] "Test Template" button in editor
  - [ ] Opens panel with variable inputs (based on template variables)
  - [ ] "Run Test" button generates preview with Claude
  - [ ] Shows rendered prompt (variables replaced)
  - [ ] Shows Claude's response (for text) or "would generate image" (for image prompts)
- **Dependencies:** 6.3.2, 1.3.3
- **Files:** `src/components/PromptTemplateEditor.tsx`

### STORY 6.3.4: Add prompt template duplication

- **Description:** As a user, I want to duplicate a template as a starting point.
- **Acceptance Criteria:**
  - [ ] "Duplicate" button on each template row
  - [ ] Creates copy with name "{original} (Copy)"
  - [ ] Opens editor with duplicated content
  - [ ] Saving creates new record (doesn't overwrite original)
- **Dependencies:** 6.3.2
- **Files:** `src/app/settings/prompts/page.tsx`

---

## Feature 6.4: Settings Hub

**Enables Journey:** All (configuration)

### STORY 6.4.1: Create settings page with sections

- **Description:** As a user, I want a central settings page.
- **Acceptance Criteria:**
  - [ ] Route `/settings` renders SettingsPage
  - [ ] Sections: API Status, Content Types, Prompt Templates, Preferences
  - [ ] Each section is a card with link to detail page
  - [ ] Shows summary info per section (e.g., "5 API keys configured")
- **Dependencies:** None
- **Files:** `src/app/settings/page.tsx`

### STORY 6.4.2: Create API status dashboard

- **Description:** As a user, I want to see if my API connections are working.
- **Acceptance Criteria:**
  - [ ] Route `/settings/api` renders APIStatusPage
  - [ ] Lists all required APIs: Supabase, Claude, Perplexity, Nano Banana, OpenAI, Sora 2, Gemini
  - [ ] For each: shows status (Connected/Error), last used timestamp
  - [ ] "Test Connection" button pings each API
  - [ ] Shows error message if connection fails
- **Dependencies:** 1.3.1, 1.3.2, 1.3.3, 1.3.4, 4.5.5
- **Files:** `src/app/settings/api/page.tsx`

---

# STORY COUNT SUMMARY

| Phase | Features | Stories |
|-------|----------|---------|
| Phase 1: Foundation Reset | 4 | 20 |
| Phase 2: City Onboarding | 4 | 13 |
| Phase 3: Design Generation | 3 | 11 |
| Phase 4: Content Cascade | 5 | 20 |
| Phase 5: Export & Preview | 3 | 10 |
| Phase 6: Learning System | 4 | 13 |
| **TOTAL** | **23** | **87** |

---

# EXECUTION ORDER

Stories should be executed in this order to maintain dependencies:

1. **Phase 1.1-1.3** - Database, stores, API clients
2. **Phase 1.4** - App shell & navigation
3. **Phase 2 (all)** - City onboarding
4. **Phase 3 (all)** - Design generation
5. **Phase 4.1-4.2** - Product and lifestyle shots
6. **Phase 5.0** - Asset library (needs approved assets)
7. **Phase 4.3-4.4** - Social content
8. **Phase 4.5** - Video ads
9. **Phase 5.1-5.2** - Calendar, preview, export
10. **Phase 6.1-6.2** - Preferences & predictions
11. **Phase 6.3** - Prompt template editor
12. **Phase 6.4** - Settings hub

---

# ACCEPTANCE CRITERIA VERIFICATION

All stories have been written to be verifiable by an autonomous agent:

- Database stories: "Table exists with columns X, Y, Z" - agent can query schema
- API stories: "POST /api/X returns Y" - agent can make HTTP request
- UI stories: "Button with data-testid='X' exists" - agent can query DOM
- Integration stories: "Clicking X calls Y and shows Z" - agent can simulate and verify

**No story requires subjective human judgment to verify completion.**

---

# NOTES FOR RALPH

1. **Environment Setup:** Before starting, ensure `.env.local` has all required keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for migrations)
   - `ANTHROPIC_API_KEY`
   - `PERPLEXITY_API_KEY`
   - `OPENAI_API_KEY`
   - `GOOGLE_AI_API_KEY` (for Gemini)

2. **Database Migrations:** Run in order (001 through 008) before any API/UI work.

3. **Type Safety:** Always create/update TypeScript types when creating new data structures.

4. **Testing Strategy:** Each story should have its acceptance criteria verifiable via:
   - Supabase query (for DB)
   - HTTP request (for API)
   - DOM query (for UI)

5. **Commits:** One commit per story with message format: `[STORY-X.X.X] Title`

---

# PRE-FLIGHT CHECKLIST

Before starting Ralph, confirm:

- [ ] `.env.local` has all required API keys
- [ ] Supabase project created and accessible
- [ ] Git repo initialized with clean state
- [ ] Node.js 18+ installed
- [ ] `pnpm` or `npm` available
- [ ] TMH Knowledge Base document in `/docs` folder for reference
- [ ] TMH Technical Spec document in `/docs` folder for reference

---

**END OF EPIC PLAN**
