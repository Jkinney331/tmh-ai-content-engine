# LTRFL Phase 3: Marketing Content Suite
## PRD.md - Ralph Wiggums Executable Spec for Claude Code

---

## Context

Phase 3 adds the full marketing content suite to LTRFL, mirroring the TMH city profile structure. Users can generate video ads, image/text ads, social media posts, and product photography prompts for their urn products.

**Prerequisites:** 
- Phase 1 must be complete (templates + concept generation)
- Phase 2 must be complete (CAD pipeline)

---

## The Rule (CRITICAL - Read Every Time)

1. Read this entire file first.
2. Find the FIRST unchecked task (marked `[ ]`).
3. Execute that task AND ONLY that task.
4. Verify it works (run build, test, or manual verification as specified).
5. If successful, mark it as `[x]` in this file.
6. Commit the code with message: `[LTRFL-P3-XX] <task description>`
7. If ALL tasks are `[x]`, output exactly: `<promise>PHASE_3_COMPLETE</promise>`

---

## Pre-Flight Checklist

Before starting Phase 3:

- [ ] **CONFIRM:** Phase 1 and Phase 2 are 100% complete
- [ ] **CONFIRM:** Video generation API available (specify which)
- [ ] **CONFIRM:** LTRFL Prompt Library V2 loaded into template system

---

## Reference: LTRFL Brand Voice & Style

### Tone
- Warm, comforting, NOT morbid
- Premium home decor aesthetic
- Celebrates life, not death
- Peaceful and reflective
- Modern and accessible

### Visual Style
- Warm natural lighting
- Sage green, cream, terracotta palette
- Living elements (plants, gardens)
- No clinical/hospital aesthetics
- High-end product photography look

### Copy Style
- "Embrace the Moment"
- Focus on memory, legacy, celebration
- Avoid: funeral, death, ashes, cremains (use "remains" sparingly)
- Prefer: memorial, keepsake, tribute, remembrance, legacy

### Target Audiences
1. Adult children arranging for parents (40-60)
2. Pre-planners (50-70)
3. Pet owners (all ages)
4. Cultural/religious communities
5. Military families

---

## Task List - Phase 3

### Section A: Marketing Content Database

- [ ] **A1: Create `ltrfl_marketing_content` table**
    - *Schema:*
      ```sql
      CREATE TABLE ltrfl_marketing_content (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        content_type TEXT NOT NULL CHECK (content_type IN ('video_ad', 'image_ad', 'social_post', 'product_photo')),
        concept_id UUID REFERENCES ltrfl_concepts(id),
        title TEXT,
        prompt TEXT NOT NULL,
        generated_content JSONB DEFAULT '{}',
        platform TEXT,
        dimensions TEXT,
        duration_seconds INTEGER,
        copy_text TEXT,
        cta_text TEXT,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'review', 'approved', 'published')),
        version INTEGER DEFAULT 1,
        parent_version_id UUID REFERENCES ltrfl_marketing_content(id),
        scheduled_date TIMESTAMPTZ,
        published_url TEXT,
        analytics JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ```
    - *Verification:* Table created, accepts inserts

- [ ] **A2: Create `ltrfl_marketing_templates` table**
    - *Schema:*
      ```sql
      CREATE TABLE ltrfl_marketing_templates (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        content_type TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        prompt_template TEXT NOT NULL,
        variables JSONB DEFAULT '[]',
        platform TEXT,
        dimensions TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ```
    - *Verification:* Table created

- [ ] **A3: Seed marketing templates from Prompt Library V2**
    - *Categories from the prompt library:*
      - Product Photography prompts
      - Lifestyle shots with people
      - Campaign & Billboard prompts
      - Instagram Feed/Story formats
      - Website Hero images
    - *Each template includes:*
      - Platform (Instagram, Facebook, TikTok, Pinterest, Billboard)
      - Dimensions (1:1, 9:16, 16:9, etc.)
      - Variables for customization
    - *Verification:* 50+ marketing templates seeded

---

### Section B: Marketing Content Hub UI

- [ ] **B1: Create MarketingHub page**
    - *Route:* `/ltrfl/marketing`
    - *Layout:*
      - Tab navigation: Video Ads | Image Ads | Social Posts | Product Photos
      - Content grid with filters
      - "Create New" button
    - *Verification:* Page renders with tabs

- [ ] **B2: Create content type sub-pages**
    - *Routes:*
      - `/ltrfl/marketing/video-ads`
      - `/ltrfl/marketing/image-ads`
      - `/ltrfl/marketing/social-posts`
      - `/ltrfl/marketing/product-photos`
    - *Each page:*
      - Grid of content for that type
      - Filter by status, platform, date
      - Quick actions (edit, duplicate, delete)
    - *Verification:* All sub-pages render

- [ ] **B3: Create MarketingContentCard component**
    - *Display:*
      - Thumbnail preview
      - Content type badge
      - Platform icon
      - Status indicator
      - Title
      - Created date
    - *Click:* Navigate to detail/editor
    - *Verification:* Cards render correctly

- [ ] **B4: Create content detail/editor page**
    - *Route:* `/ltrfl/marketing/:id`
    - *Sections:*
      - Preview area (image/video)
      - Copy/text editor
      - Settings (platform, dimensions, etc.)
      - Version history
      - Actions (approve, publish, delete)
    - *Verification:* Detail page shows all fields

---

### Section C: Video Ad Generation

- [ ] **C1: Create VideoAdGenerator component**
    - *Route:* `/ltrfl/marketing/video-ads/new`
    - *Options:*
      - Start from template
      - Start from urn concept (use concept image as base)
      - Start from scratch
    - *Verification:* Generator page renders

- [ ] **C2: Create video ad form**
    - *Fields:*
      - Template selector (optional)
      - Urn concept selector (optional)
      - Video style (testimonial, product showcase, slideshow, animated)
      - Duration (6s, 15s, 30s, 60s)
      - Platform (Instagram Reels, TikTok, YouTube Shorts, Facebook)
      - Aspect ratio (9:16, 16:9, 1:1)
      - Music mood (peaceful, uplifting, emotional)
      - Text overlay/CTA
    - *Verification:* Form validates correctly

- [ ] **C3: Integrate video generation API**
    - *Service:* `src/services/videoGeneration.ts`
    - *Function:* `generateVideo(params): Promise<VideoResult>`
    - *Handle:*
      - API connection
      - Progress tracking
      - Error handling
    - *Note:* Specify which video API to use (Runway, Pika, etc.)
    - *Verification:* Can generate basic video

- [ ] **C4: Create video preview component**
    - *Features:*
      - Video player with controls
      - Full-screen option
      - Download button
      - Timestamp markers (if applicable)
    - *Verification:* Video plays in preview

- [ ] **C5: Add video ad templates**
    - *Templates:*
      - "Product Showcase" - Rotating urn with soft music
      - "Lifestyle Moment" - Person interacting with memorial
      - "Slideshow Memorial" - Multiple images with transitions
      - "Quote Overlay" - Inspirational quote with background
    - *Verification:* Templates selectable and work

---

### Section D: Image Ad Generation

- [ ] **D1: Create ImageAdGenerator component**
    - *Route:* `/ltrfl/marketing/image-ads/new`
    - *Options:*
      - From template
      - From urn concept
      - From scratch
    - *Verification:* Page renders

- [ ] **D2: Create image ad form**
    - *Fields:*
      - Template selector
      - Urn concept selector (to feature in ad)
      - Ad type (single image, carousel, before/after)
      - Platform (Instagram, Facebook, Pinterest, Google Display)
      - Dimensions preset selector
      - Headline text
      - Body copy
      - CTA button text
      - Brand elements (logo placement, colors)
    - *Verification:* Form works

- [ ] **D3: Generate image with text overlay**
    - *Flow:*
      1. Generate base image (Wavespeed)
      2. Add text overlays (headline, body, CTA)
      3. Add brand elements (logo, colors)
      4. Export final composite
    - *Library:* Canvas API or similar for compositing
    - *Verification:* Can generate complete ad image

- [ ] **D4: Create image ad templates**
    - *Templates based on Prompt Library V2:*
      - Billboard - Brand Awareness
      - Billboard - Product Hero
      - Instagram Feed - Product Square
      - Instagram Story - Store Tour
      - Website Hero - Homepage
    - *Each includes:*
      - Base prompt
      - Text placement zones
      - Recommended copy length
    - *Verification:* Templates generate correct formats

- [ ] **D5: Add carousel ad builder**
    - *Features:*
      - Add multiple slides (2-10)
      - Drag to reorder
      - Individual slide editing
      - Preview carousel flow
      - Export as separate images or combined
    - *Verification:* Can create 3+ slide carousel

---

### Section E: Social Media Post Generation

- [ ] **E1: Create SocialPostGenerator component**
    - *Route:* `/ltrfl/marketing/social-posts/new`
    - *Verification:* Page renders

- [ ] **E2: Create social post form**
    - *Fields:*
      - Platform (Instagram, Facebook, Twitter/X, LinkedIn, Pinterest, TikTok)
      - Post type (image, video, text-only, link share)
      - Image/video upload or generate
      - Caption text (with character counter per platform)
      - Hashtags (with suggestions)
      - Link (optional)
      - Schedule date/time (optional)
    - *Verification:* Form handles all platforms

- [ ] **E3: Add platform-specific character limits**
    - *Limits:*
      - Instagram: 2,200 chars
      - Twitter/X: 280 chars
      - Facebook: 63,206 chars (but recommend 40-80)
      - LinkedIn: 3,000 chars
      - TikTok: 2,200 chars
    - *UI:* Character counter, warning at 90%, block at limit
    - *Verification:* Limits enforced correctly

- [ ] **E4: Create hashtag suggestion system**
    - *Categories:*
      - Memorial/Tribute: #InLovingMemory #CelebrationOfLife #MemorialKeepsake
      - Product: #CremationUrn #MemorialUrn #CustomUrn
      - Emotional: #ForeverRemembered #AlwaysInOurHearts
      - Brand: #LTRFL #LaidToRestForLess #EmbraceTheMoment
    - *Behavior:* Suggest based on content type and category
    - *Verification:* Suggestions appear, can add to caption

- [ ] **E5: Create caption AI generator**
    - *Input:* Image/concept, tone, platform
    - *Output:* 3 caption options
    - *Styles:*
      - Emotional/heartfelt
      - Informational/product-focused
      - Call-to-action focused
    - *Verification:* Can generate captions from concept

- [ ] **E6: Add social post templates**
    - *Templates:*
      - New Product Announcement
      - Customer Testimonial
      - Behind the Scenes
      - Educational (urn care, choosing an urn)
      - Holiday/Remembrance Day posts
    - *Verification:* Templates work for all platforms

---

### Section F: Product Photography Prompts

- [ ] **F1: Create ProductPhotoGenerator component**
    - *Route:* `/ltrfl/marketing/product-photos/new`
    - *Verification:* Page renders

- [ ] **F2: Create product photo form**
    - *Fields:*
      - Urn concept/product selector
      - Photography style (studio, lifestyle, detail, in-situ)
      - Setting (indoor, outdoor, seasonal)
      - Props (suggested based on urn category)
      - Lighting (natural, warm, dramatic, soft)
      - Camera specs (lens, angle)
      - Output use (website, catalog, social)
    - *Verification:* Form works

- [ ] **F3: Load Prompt Library V2 product photography templates**
    - *Import all category prompts from the library:*
      - Sports & Recreation (14.1 - 14.11)
      - Pets & Animals
      - Hobbies & Interests
      - Professions
      - Faith & Spirituality
      - Travel & Adventure
      - Vintage & Nostalgia
      - Creative/Whimsical
    - *Each prompt includes:*
      - Scene description
      - Props list
      - Lighting direction
      - Lens recommendation
      - Color palette
    - *Verification:* All 200+ prompts imported and categorized

- [ ] **F4: Create prompt customization interface**
    - *Features:*
      - Edit template prompt
      - Swap variables (color, material, setting)
      - Preview prompt before generation
      - Save as new custom template
    - *Verification:* Can modify and save templates

- [ ] **F5: Generate product photos**
    - *Flow:*
      1. Select template or write custom
      2. Fill variables
      3. Generate 4 variations
      4. Select best
      5. Save to library
    - *Verification:* Full flow works

- [ ] **F6: Create product photo library view**
    - *Features:*
      - Grid of all generated product photos
      - Filter by urn category, style, use case
      - Batch download
      - Copy prompt for regeneration
    - *Verification:* Library view works

---

### Section G: Content Calendar & Publishing

- [ ] **G1: Create ContentCalendar component**
    - *Route:* `/ltrfl/marketing/calendar`
    - *View:* Monthly calendar with content dots
    - *Click day:* Show scheduled content
    - *Drag:* Reschedule content
    - *Verification:* Calendar renders with scheduled content

- [ ] **G2: Add scheduling to all content types**
    - *Fields:*
      - Schedule toggle
      - Date picker
      - Time picker
      - Timezone selector
      - Recurrence (optional: daily, weekly, monthly)
    - *Verification:* Content appears on calendar when scheduled

- [ ] **G3: Create publishing status workflow**
    - *Statuses:*
      - Draft → Review → Approved → Scheduled → Published
    - *Actions:*
      - Submit for review
      - Approve
      - Schedule
      - Publish now
      - Unpublish
    - *Verification:* Status transitions work correctly

- [ ] **G4: Add content duplication**
    - *"Duplicate" action:*
      - Copies all fields
      - Sets status to draft
      - Opens in editor
    - *Use case:* Create similar content for different platforms
    - *Verification:* Duplicate creates editable copy

---

### Section H: Testing & Polish

- [ ] **H1: Write tests for marketing content CRUD**
    - *Tests:*
      - Create content of each type
      - Update content
      - Delete content
      - Status transitions
      - Scheduling logic
    - *Verification:* All tests pass

- [ ] **H2: Add loading states for generation**
    - *Components:*
      - Video generation progress
      - Image generation progress
      - Caption generation loading
    - *Verification:* All async ops have loading UI

- [ ] **H3: Add empty states for all sections**
    - *Messages:*
      - "No video ads yet. Create your first!"
      - "No scheduled content for this day."
      - etc.
    - *Verification:* Empty states display correctly

- [ ] **H4: Responsive design for marketing hub**
    - *Mobile:*
      - Stack layout
      - Touch-friendly controls
      - Swipe for calendar
    - *Verification:* Works on mobile devices

- [ ] **H5: Performance optimization**
    - *Optimizations:*
      - Lazy load video players
      - Image optimization (WebP)
      - Paginate content grids
      - Virtual scroll for large lists
    - *Verification:* Pages load under 2 seconds

- [ ] **H6: Final Phase 3 review**
    - *Checklist:*
      - All content types can be created
      - Templates work correctly
      - Calendar shows scheduled content
      - Status workflow complete
      - No console errors
      - TypeScript clean
      - All tests pass
    - *Verification:* `npm run build` passes

---

## Progress Log

*Append notes here after each task completion:*

```
[Date] [Task] - Notes
---
```

---

## Environment Variables Needed (Phase 3 additions)

```env
# Video Generation (specify provider)
VIDEO_API_KEY=your_video_api_key
VIDEO_API_URL=https://api.video-provider.com/v1

# Social Media Scheduling (if applicable)
SOCIAL_SCHEDULER_ENABLED=true
```

---

## Completion Criteria

Phase 3 is complete when:
- [ ] All tasks above marked `[x]`
- [ ] Can create video ads from templates
- [ ] Can create image ads with text overlay
- [ ] Can create social posts for all platforms
- [ ] Can generate product photography from Prompt Library V2
- [ ] Content calendar shows scheduled items
- [ ] Publishing workflow works
- [ ] All 200+ prompts from library imported
- [ ] All tests pass

When all complete, output: `<promise>PHASE_3_COMPLETE</promise>`

---

## Final Milestone: Full LTRFL Tab Complete

When Phase 3 is done, the LTRFL tab should have feature parity with TMH city profiles:

✅ Urn concept generation (Phase 1)
✅ Template library management (Phase 1)  
✅ CAD file conversion (Phase 2)
✅ Video ad generation (Phase 3)
✅ Image ad generation (Phase 3)
✅ Social media posts (Phase 3)
✅ Product photography (Phase 3)
✅ Content calendar (Phase 3)

Output: `<promise>LTRFL_FEATURE_COMPLETE</promise>`
