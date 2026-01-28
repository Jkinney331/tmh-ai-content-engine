# LTRFL Phase 1: Foundation + Urn Concept Generation
## PRD.md - Ralph Wiggums Executable Spec for Claude Code

---

## Context

LTRFL is a new tab in the TMH Social Media Engine for Jay's cremation urn business. Phase 1 establishes the foundation: database tables, template library, and AI image generation for urn concepts.

---

## The Rule (CRITICAL - Read Every Time)

1. Read this entire file first.
2. Find the FIRST unchecked task (marked `[ ]`).
3. Execute that task AND ONLY that task.
4. Verify it works (run build, test, or manual verification as specified).
5. If successful, mark it as `[x]` in this file.
6. Commit the code with message: `[LTRFL-P1-XX] <task description>`
7. If ALL tasks are `[x]`, output exactly: `<promise>PHASE_1_COMPLETE</promise>`

---

## Pre-Flight Checklist

Before starting, confirm these are true (check with Jay if unsure):

- [x] **CONFIRM:** TMH codebase access available
- [x] **CONFIRM:** Supabase project credentials available
- [x] **CONFIRM:** Wavespeed API key available
- [x] **CONFIRM:** Current tech stack documented (see Discovery Questions in Handoff doc)

---

## Task List - Phase 1

### Section A: Database Setup (Supabase)

- [x] **A1: Create `ltrfl_templates` table**
    - *Schema:*
      ```sql
      CREATE TABLE ltrfl_templates (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        category TEXT NOT NULL,
        subcategory TEXT,
        name TEXT NOT NULL,
        prompt TEXT NOT NULL,
        variables JSONB DEFAULT '{}',
        brand_colors JSONB DEFAULT '{"primary": "#9CAF88", "secondary": "#F5F1EB"}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ```
    - *Verification:* Run `SELECT * FROM ltrfl_templates LIMIT 1;` returns empty result (not error)
    - *Notes:* Enable RLS, create policy for authenticated users

- [x] **A2: Create `ltrfl_concepts` table**
    - *Schema:*
      ```sql
      CREATE TABLE ltrfl_concepts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        template_id UUID REFERENCES ltrfl_templates(id),
        prompt_used TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        images JSONB DEFAULT '[]',
        selected_image_index INTEGER,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewing', 'approved', 'cad_pending', 'cad_complete', 'rejected')),
        version INTEGER DEFAULT 1,
        parent_version_id UUID REFERENCES ltrfl_concepts(id),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ```
    - *Verification:* Table exists and accepts insert
    - *Notes:* Add index on `status` and `category`

- [x] **A3: Create `ltrfl_cad_specs` table**
    - *Schema:*
      ```sql
      CREATE TABLE ltrfl_cad_specs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        concept_id UUID REFERENCES ltrfl_concepts(id) NOT NULL,
        urn_type TEXT NOT NULL CHECK (urn_type IN ('traditional', 'figurine', 'keepsake')),
        material TEXT NOT NULL,
        volume_cu_in DECIMAL DEFAULT 200,
        height_mm DECIMAL,
        diameter_mm DECIMAL,
        wall_thickness_mm DECIMAL DEFAULT 3,
        access_method TEXT CHECK (access_method IN ('top_lid', 'bottom_loading', 'permanent_seal')),
        lid_type TEXT,
        base_plate_specs JSONB,
        engraving_area JSONB,
        cad_file_url TEXT,
        cad_format TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'complete', 'failed')),
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ```
    - *Verification:* Table exists and foreign key constraint works
    - *Notes:* This table used in Phase 2 but created now for schema completeness

- [x] **A4: Seed template library with initial categories**
    - *Insert these categories:*
      - Sports & Recreation (Baseball, Basketball, Football, Golf, Soccer, Hockey, Tennis, Fishing, Hunting)
      - Pets & Animals (Dogs, Cats, Horses, Birds, Elephants, Butterflies)
      - Hobbies & Interests (Gardening, Music, Art, Cooking, Gaming, Reading, Sewing)
      - Professions (Nurse, Teacher, Firefighter, Police, Military, Chef, Mechanic)
      - Faith & Spirituality (Angel, Cross, Praying Hands, Buddha, Star of David)
      - Travel & Adventure (Globe, Suitcase, Compass, Lighthouse, Mountain)
      - Vintage & Nostalgia (Radio, Rotary Phone, Jukebox, Classic Car, Motorcycle)
    - *Each template should have:*
      - A base prompt following LTRFL brand style (warm, not morbid, premium look)
      - Variables for customization (color, size, personalization)
    - *Verification:* `SELECT COUNT(*) FROM ltrfl_templates;` returns > 50

- [x] **A5: Create Supabase storage bucket for generated images**
    - *Bucket name:* `ltrfl-concepts`
    - *Access:* Public read, authenticated write
    - *Verification:* Bucket visible in Supabase dashboard

---

### Section B: Frontend - Navigation & Layout

- [x] **B1: Add LTRFL tab to main navigation**
    - *Location:* Same level as existing TMH tabs
    - *Icon:* Use appropriate icon (urn, memorial, or custom)
    - *Route:* `/ltrfl` or `/ltrfl/dashboard`
    - *Verification:* Click tab, page loads without error

- [x] **B2: Create LTRFL layout component**
    - *Structure:*
      ```
      LTRFLLayout
      ├── Sidebar
      │   ├── Urn Design Studio (link)
      │   ├── Template Library (link)
      │   ├── My Concepts (link)
      │   └── Marketing Content (link - disabled for Phase 1)
      └── Main Content Area
      ```
    - *Styling:* Match TMH aesthetic, use LTRFL brand colors (#9CAF88 sage, #F5F1EB cream)
    - *Verification:* Layout renders, sidebar navigation works

- [x] **B3: Create LTRFL Dashboard page**
    - *Content:*
      - Welcome message
      - Quick stats (total templates, concepts in review, approved concepts)
      - Recent activity feed
      - Quick action buttons (New Concept, Browse Templates)
    - *Verification:* Dashboard loads with placeholder data

---

### Section C: Template Library Feature

- [x] **C1: Create TemplateLibrary page component**
    - *Route:* `/ltrfl/templates`
    - *Features:*
      - Grid/list view toggle
      - Category filter sidebar
      - Search bar
      - Pagination (20 per page)
    - *Verification:* Page renders, shows loading state

- [x] **C2: Implement Supabase query for templates**
    - *Create hook:* `useLTRFLTemplates`
    - *Supports:* 
      - Filter by category
      - Filter by subcategory
      - Search by name/prompt
      - Pagination
    - *Verification:* Console log shows templates from database

- [x] **C3: Create TemplateCard component**
    - *Display:*
      - Template name
      - Category badge
      - Truncated prompt preview
      - "Use Template" button
      - Edit/Delete dropdown (for admin)
    - *Verification:* Cards render with seeded data

- [x] **C4: Create TemplateEditor modal/drawer**
    - *Fields:*
      - Name (required)
      - Category (dropdown, required)
      - Subcategory (dropdown, depends on category)
      - Prompt (textarea, required)
      - Variables (JSON editor or key-value pairs)
      - Active toggle
    - *Actions:* Save, Cancel
    - *Verification:* Can create new template, appears in list

- [x] **C5: Implement template CRUD operations**
    - *Operations:*
      - Create: Insert new template
      - Read: Already done in C2
      - Update: Edit existing template
      - Delete: Soft delete (set is_active = false) or hard delete
    - *Verification:* All CRUD operations work, UI updates optimistically

- [x] **C6: Add category filter functionality**
    - *Behavior:*
      - Clicking category filters list
      - "All" option shows all templates
      - Active filter highlighted
      - URL updates with filter param for shareability
    - *Verification:* Filter changes results correctly

---

### Section D: Concept Generation Feature

- [x] **D1: Create ConceptGenerator page component**
    - *Route:* `/ltrfl/concepts/new`
    - *Layout:*
      - Left panel: Prompt input area
      - Right panel: Generated images grid
    - *Verification:* Page renders with empty state

- [x] **D2: Create prompt input form**
    - *Options:*
      - Start from template (dropdown to select)
      - Start from scratch (free text)
    - *Fields:*
      - Prompt textarea (pre-filled if template selected)
      - Category selector
      - Number of variations (1-4, default 4)
      - Model selector (for future multi-model support)
    - *Verification:* Form validates, template selection populates prompt

- [x] **D3: Integrate Wavespeed API service**
    - *Create:* `src/services/wavespeed.ts` (or appropriate location)
    - *Functions:*
      - `generateImages(prompt: string, count: number): Promise<string[]>`
      - Handle API key from environment
      - Error handling with retries
    - *Verification:* Can call API, returns image URLs (test with simple prompt)

- [x] **D4: Implement image generation flow**
    - *Flow:*
      1. User submits prompt
      2. Show loading state with progress
      3. Call Wavespeed API
      4. Display generated images
      5. Save concept to Supabase (status: 'reviewing')
      6. Upload images to Supabase storage
    - *Verification:* Full flow works end-to-end

- [x] **D5: Create ImageVariationGrid component**
    - *Display:*
      - 2x2 grid of generated images
      - Click to enlarge (modal)
      - Select button on each image
      - Regenerate button
    - *Verification:* Grid displays images, selection works

- [x] **D6: Implement concept selection and approval**
    - *Actions on each image:*
      - Select as final (sets selected_image_index)
      - Reject (removes from consideration)
      - Request new variation (regenerates that slot)
    - *Approval button:*
      - Requires one image selected
      - Changes status to 'approved'
      - Navigates to CAD specs page (Phase 2) or confirmation
    - *Verification:* Can select, approve, status updates in database

---

### Section E: My Concepts (Gallery/Management)

- [x] **E1: Create MyConcepts page component**
    - *Route:* `/ltrfl/concepts`
    - *Features:*
      - Grid view of all user's concepts
      - Filter by status (draft, reviewing, approved, etc.)
      - Sort by date
      - Search by prompt/category
    - *Verification:* Page renders with user's concepts

- [x] **E2: Create ConceptCard component**
    - *Display:*
      - Thumbnail of selected image (or first image)
      - Status badge (color-coded)
      - Category
      - Created date
      - Version number
    - *Click action:* Navigate to concept detail
    - *Verification:* Cards render correctly

- [x] **E3: Create ConceptDetail page**
    - *Route:* `/ltrfl/concepts/:id`
    - *Display:*
      - All generated images
      - Selected image highlighted
      - Prompt used
      - Category/subcategory
      - Status with actions
      - Version history (if parent_version_id exists)
    - *Actions:*
      - Change selection
      - Approve (if reviewing)
      - Create new version
      - Delete
    - *Verification:* Detail page shows all concept data

- [x] **E4: Implement versioning functionality**
    - *"Create New Version" action:*
      - Copies current concept
      - Increments version number
      - Sets parent_version_id
      - Opens in generator with prompt pre-filled
    - *Version history display:*
      - Show all versions of a concept
      - Can navigate between versions
    - *Verification:* Can create v2, v3, history shows correctly

---

### Section F: Testing & Polish

- [x] **F1: Add loading states to all async operations**
    - *Components:*
      - Template list loading skeleton
      - Concept generation loading spinner/progress
      - Image loading placeholders
    - *Verification:* No flash of empty content

- [x] **F2: Add error handling and toast notifications**
    - *Errors:*
      - API failures show user-friendly message
      - Network errors have retry option
      - Validation errors highlight fields
    - *Notifications:*
      - Success toasts for CRUD operations
      - Error toasts with action to retry
    - *Verification:* Disconnect network, errors handled gracefully

- [x] **F3: Add empty states**
    - *Locations:*
      - Template library: "No templates yet. Create your first template."
      - My Concepts: "No concepts yet. Start generating!"
      - Search with no results: "No matches found."
    - *Verification:* Empty states display correctly

- [x] **F4: Responsive design check**
    - *Breakpoints:*
      - Mobile: Stack layout, hide sidebar, hamburger menu
      - Tablet: Compact sidebar
      - Desktop: Full layout
    - *Verification:* Test at 375px, 768px, 1024px, 1440px

- [x] **F5: Write integration tests for critical paths**
    - *Tests:*
      - Template CRUD operations
      - Concept generation flow
      - Approval workflow
    - *Tool:* Use existing test framework in TMH
    - *Verification:* All tests pass

- [x] **F6: Final review and cleanup**
    - *Checklist:*
      - Remove console.logs
      - Check for TypeScript errors
      - Verify all imports used
      - Check for accessibility (labels, alt text)
      - Update README if needed
    - *Verification:* `npm run build` succeeds with no warnings

---

## Progress Log

*Append notes here after each task completion:*

```
[Date] [Task] - Notes
---
```

---

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Wavespeed API
WAVESPEED_API_KEY=your_wavespeed_key
WAVESPEED_API_URL=https://api.wavespeed.ai/v1 # or correct endpoint

# Optional
NEXT_PUBLIC_LTRFL_ENABLED=true
```

---

## Brand Guidelines Reference

**LTRFL Brand Colors:**
- Sage Green: #9CAF88
- Warm Cream: #F5F1EB
- Soft Terracotta: #D9A384
- Muted Sky Blue: #A8C4D9
- Warm Brass: #C9A962
- Soft Charcoal: #4A4A4A

**Brand Dos:**
- Peaceful, reflective expressions
- Warm, soothing colors
- Living elements (plants, gardens, homes)
- Premium home decor aesthetic
- Gentle smiles and connection

**Brand Don'ts:**
- No crying or heavy grief imagery
- No clinical/hospital aesthetics
- No traditional funeral home feeling
- No cold, sterile lighting
- No sad, mournful expressions

---

## Completion Criteria

Phase 1 is complete when:
- [x] All tasks above marked `[x]`
- [x] Can navigate to LTRFL tab
- [x] Can browse and filter template library
- [x] Can create/edit templates
- [x] Can generate urn concept images from prompts
- [x] Can view multiple variations
- [x] Can select and approve concepts
- [x] Concepts saved with versioning
- [x] All tests pass
- [ ] No build errors

When all complete, output: `<promise>PHASE_1_COMPLETE</promise>`
