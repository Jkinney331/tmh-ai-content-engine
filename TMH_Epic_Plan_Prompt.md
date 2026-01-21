# TMH AI CONTENT ENGINE — EPIC PLAN PROMPT
## Instructions for Building a Ralph-Compatible Development Plan

---

## CONTEXT FOR CLAUDE CODE

You are building the **TMH AI Content Engine** — an automated content generation tool for a premium streetwear brand. The user (Jay) wants to go from picking a city to having AI-generated product designs, lifestyle shots, social content, and video ads — all graded via thumbs up/down with a learning system.

**CRITICAL:** This plan will be executed using the **Ralph Wiggum autonomous loop** — meaning each user story must be:
1. **Atomic** — Completable in ONE iteration (one context window)
2. **Testable** — Has clear acceptance criteria the agent can verify WITHOUT human input
3. **Independent** — Can be built and committed without breaking other features
4. **Small** — If a story feels "big," break it into smaller stories

---

## HOW TO STRUCTURE THE EPIC PLAN

### 1. START WITH USER JOURNEYS (The "Click Paths")

Before writing ANY code stories, map out every user journey as a sequence of clicks/actions. This ensures nothing is orphaned.

**Format for User Journeys:**
```
JOURNEY: [Name]
GOAL: [What user accomplishes]
STEPS:
1. User clicks [X] → sees [Y]
2. User enters [data] → system does [Z]
3. User clicks [confirm] → [result]
CONNECTS TO: [Other journeys this enables]
```

**Example:**
```
JOURNEY: City Onboarding
GOAL: User adds a new city to the system with researched profile
STEPS:
1. User clicks "Add City" button → sees city input modal
2. User enters city name → clicks "Research"
3. System shows loading state → Perplexity/Claude research runs
4. User sees research results with checkboxes for each element
5. User checks/unchecks elements → adds notes
6. User clicks "Approve Profile" → city saved to database
7. User redirected to city dashboard → can start generating
CONNECTS TO: Design Generation journey (needs approved city)
```

---

### 2. CONVERT JOURNEYS TO FEATURES

Each journey becomes a **Feature** (epic-level grouping). Each feature contains multiple **User Stories**.

**Format:**
```
FEATURE: [Name]
JOURNEY IT ENABLES: [Reference journey above]
USER STORIES:
- [Story 1]
- [Story 2]
- [Story 3]
```

---

### 3. WRITE ATOMIC USER STORIES

Each story must follow this format:

```json
{
  "id": "FEAT-001",
  "title": "Short descriptive title",
  "description": "As a [user], I want to [action] so that [benefit]",
  "acceptance_criteria": [
    "TESTABLE: [Specific thing agent can verify]",
    "TESTABLE: [Another specific thing]",
    "TESTABLE: [Third thing]"
  ],
  "dependencies": ["FEAT-000"],  // Stories that must be done first
  "touches_files": ["src/components/X.tsx", "src/lib/Y.ts"],
  "estimated_complexity": "small|medium",  // Never "large" — break it up
  "ui_elements": ["button", "modal", "form"],  // What gets rendered
  "api_calls": ["POST /api/cities", "GET /api/research"]  // External calls
}
```

**ACCEPTANCE CRITERIA RULES:**
- ❌ BAD: "The UI looks good" (subjective, agent can't test)
- ❌ BAD: "User can add cities" (too vague)
- ✅ GOOD: "Clicking 'Add City' button opens modal with id='add-city-modal'"
- ✅ GOOD: "Form has text input with name='cityName' and submit button"
- ✅ GOOD: "Submitting form with 'Detroit' calls POST /api/cities with body {name: 'Detroit'}"
- ✅ GOOD: "Success response (200) closes modal and shows city in list"
- ✅ GOOD: "Error response (400) displays error message in modal"

---

### 4. ORDER STORIES BY DEPENDENCY

Stories must be ordered so that:
1. Database/schema changes come first
2. API routes come second
3. UI components come third
4. Integration/wiring comes fourth
5. Polish/edge cases come last

---

## THE EPIC PLAN TEMPLATE

Use this structure:

```markdown
# TMH AI CONTENT ENGINE — EPIC PLAN

## Overview
[2-3 sentences on what we're building]

## User Journeys

### Journey 1: [Name]
[Full journey as described above]

### Journey 2: [Name]
[Full journey]

[...continue for all journeys]

---

## Phase 1: [Name]

### Feature 1.1: [Name]
**Enables Journey:** [Reference]
**Stories:**

#### STORY 1.1.1: [Title]
- **Description:** As a [user], I want...
- **Acceptance Criteria:**
  - [ ] [Testable criterion 1]
  - [ ] [Testable criterion 2]
  - [ ] [Testable criterion 3]
- **Dependencies:** None
- **Files:** [list]

#### STORY 1.1.2: [Title]
[...continue]

### Feature 1.2: [Name]
[...continue]

---

## Phase 2: [Name]
[...continue pattern]
```

---

## SPECIFIC REQUIREMENTS FOR TMH CONTENT ENGINE

### User Journeys to Map:

1. **City Onboarding Journey**
   - Add new city → Configure research → Run research → Review results → Approve/reject elements → Save profile

2. **Design Generation Journey**
   - Select city → Select product type → Configure design params → Generate (2 models) → Compare side-by-side → Grade (thumbs + tags + feedback) → Approve/reject

3. **Product Shot Journey**
   - Select approved design → Configure shot types → Generate shots → Grade each → Approve for cascade

4. **Lifestyle Shot Journey**
   - Select approved product → Configure model/location/style → Generate (2 models) → Compare → Grade → Approve

5. **Social Content Journey**
   - Select approved assets → Choose content format (poll, carousel, etc.) → Generate post + caption → Grade → Approve → Add to calendar

6. **Video Ad Journey**
   - Select approved assets → Choose ad format → Generate script + hook variations → Grade → Generate video (2 models) → Compare → Grade → Approve

7. **Learning/Preferences Journey**
   - View preference dashboard → See patterns (what you like) → Adjust weights → See predictions on new content

8. **Export Journey**
   - View approved content → Preview as grid → Reorder → Download/export

### Database Entities Needed:

```
- cities (profile data)
- city_elements (slang, landmarks, etc. with approval status)
- products (hoodie, tee, hat configs)
- designs (generated designs with feedback)
- product_shots (generated shots with feedback)
- lifestyle_shots (generated shots with feedback)
- social_posts (generated posts with feedback)
- video_ads (generated videos with feedback)
- feedback (universal feedback table)
- preferences (learned patterns)
- generation_logs (what was generated with what params)
```

### API Integrations Needed:

```
- Perplexity API (city research)
- Claude API (prompt generation, copy writing)
- Gemini Nano Banana (image generation)
- OpenAI Image (image generation - comparison)
- Sora 2 (video generation)
- Gemini Video (video generation - comparison)
```

### UI Patterns to Reuse:

```
- Comparison viewer (side-by-side with "Pick Winner" buttons)
- Feedback capture (thumbs + tags + text field)
- Approval flow (approve/reject/maybe with notes)
- Generation queue (show what's generating, what's done)
- Asset gallery (grid of generated content with status badges)
```

---

## STORY SIZE GUIDELINES

**TOO BIG — Break it up:**
- "Build city onboarding flow" → 10+ stories
- "Add feedback system" → 5+ stories
- "Create comparison mode" → 4+ stories

**RIGHT SIZE:**
- "Add 'New City' button that opens empty modal"
- "Add city name input field to modal with validation"
- "Add API route POST /api/cities that saves to Supabase"
- "Wire form submit to API and handle success/error states"
- "Add loading spinner during API call"

**ATOMIC TEST:**
Ask: "Can the agent verify this is done without asking me?"
- If yes → good story
- If no → needs clearer acceptance criteria or is too big

---

## EXAMPLE: PHASE 1 BREAKDOWN

Here's how Phase 1 (Foundation Reset) might break down:

### Feature 1.1: Database Schema
```
STORY 1.1.1: Create cities table
- Acceptance: Table exists with columns: id, name, nicknames, area_codes, status, created_at
- Acceptance: Can INSERT a row via Supabase client
- Acceptance: Can SELECT row back by id

STORY 1.1.2: Create city_elements table  
- Acceptance: Table exists with columns: id, city_id, element_type, value, status, notes
- Acceptance: Foreign key to cities works
- Acceptance: Can INSERT element linked to city

STORY 1.1.3: Create feedback table
- Acceptance: Table exists with columns: id, content_type, content_id, rating, tags, text_feedback, created_at
- Acceptance: rating is enum ('thumbs_up', 'thumbs_down')
- Acceptance: tags is JSONB array
```

### Feature 1.2: Zustand Store Reset
```
STORY 1.2.1: Create cityStore with initial state
- Acceptance: Store exports useCityStore hook
- Acceptance: Initial state has cities: [], selectedCity: null, loading: false
- Acceptance: Can call useCityStore() in component without error

STORY 1.2.2: Add city CRUD actions to store
- Acceptance: addCity(city) adds to cities array
- Acceptance: selectCity(id) sets selectedCity
- Acceptance: updateCity(id, data) updates matching city
- Acceptance: removeCity(id) removes from array
```

---

## OUTPUT REQUEST

Generate the full epic plan with:

1. **All 8 user journeys** mapped with click paths
2. **6 phases** with features
3. **Every feature** broken into atomic stories
4. **Every story** with testable acceptance criteria
5. **Dependency ordering** so stories can be executed in sequence
6. **Estimated story count** per phase

Target: **50-80 total stories** across all phases (if more, we can batch into releases)

---

## REMINDER: RALPH COMPATIBILITY

Every story you write will be:
1. Put into a PRD.json file
2. Picked up by an autonomous agent
3. Implemented WITHOUT human intervention
4. Tested against acceptance criteria BY THE AGENT
5. Committed and logged
6. Then the next story is picked

**If the agent can't tell if it's done, the story is bad.**

Write stories like you're giving instructions to a very smart but very literal junior developer who will work overnight without being able to ask you questions.

---

## GO BUILD THE EPIC PLAN

Start with the user journeys. Then break into phases. Then break into features. Then break into stories. Make it atomic. Make it testable. Make it Ralph-ready.
