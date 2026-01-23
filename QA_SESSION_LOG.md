# TMH AI Content Engine - QA Session Log

## Document Purpose
This document captures all bugs, errors, fixes, and issues encountered during QA sessions. It serves as a reference for understanding the current state of the project and informing decisions about next steps.

---

## Session Overview

**Date Range:** January 2025
**Project State:** Multiple issues across data flow, API integrations, and UI
**Root Cause Pattern:** Incomplete database setup, missing error handling, fragmented codebase

---

## Issue #1: Cities Not Appearing in Generate Dropdown

### Symptoms
- City selector dropdown showed no cities or only some cities
- Users couldn't select a city to begin generation

### Root Cause
- API response handling expected different data structure
- Status filtering was incorrect - checking for wrong status values

### Files Affected
- `src/components/CitySelector.tsx`
- `src/lib/supabase.ts`

### Fix Applied
```typescript
// CitySelector.tsx - Fixed API response handling
// Changed to handle both array and object responses
const citiesData = Array.isArray(response) ? response : response.data || []

// Fixed status filtering to show 'ready' cities
const readyCities = citiesData.filter(city => city.status === 'ready')
```

### Status: FIXED

---

## Issue #2: Content Types Not Loading

### Symptoms
- Content page failed to load
- Error: "Failed to load content types"
- Generate page couldn't show content type options

### Root Cause
- `content_types` table did not exist in database
- Migration 006 had not been run in Supabase

### Files Affected
- `src/lib/supabase.ts` (getContentTypes function)
- `supabase/migrations/006_create_content_types.sql`

### Fix Applied
1. Added error handling to getContentTypes:
```typescript
export async function getContentTypes() {
  try {
    const { data, error } = await supabase
      .from('content_types')
      .select('*')
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Error fetching content types:', err)
    return [] // Return empty array instead of crashing
  }
}
```

2. Created seed endpoint: `src/app/api/seed/content-types/route.ts`
3. User ran migration 006 in Supabase

### Status: FIXED (requires migration to be run)

---

## Issue #3: Gray/Invisible Text in Form Inputs

### Symptoms
- Form input text was gray or invisible
- Users couldn't see what they were typing
- Affected inputs across multiple pages

### Root Cause
- CSS styles had gray text color for inputs
- Dark mode or theme conflicts

### Files Affected
- `src/app/globals.css`

### Fix Applied
```css
/* Force visible text in all form inputs */
input, textarea, select {
  color: #1a1a1a !important;
}

input::placeholder, textarea::placeholder {
  color: #6b7280 !important;
}
```

### Status: FIXED

---

## Issue #4: Research Stuck at "Researching" Status

### Symptoms
- Cities remained in "researching" status indefinitely
- No error messages shown to user
- Research never completed or failed gracefully

### Root Cause
- No error handling in `performCityResearch()` function
- API failures didn't update city status
- No timeout or fallback behavior

### Files Affected
- `src/app/api/cities/route.ts`
- `supabase/migrations/014_add_error_message_to_cities.sql`

### Fix Applied
1. Added `updateCityError()` helper function:
```typescript
async function updateCityError(cityId: string, errorMessage: string) {
  try {
    await supabase.from('cities').update({
      status: 'error',
      error_message: errorMessage,
      updated_at: new Date().toISOString()
    }).eq('id', cityId)
  } catch (e) {
    // Fallback if error_message column doesn't exist
    await supabase.from('cities').update({
      status: 'draft',
      updated_at: new Date().toISOString()
    }).eq('id', cityId)
  }
}
```

2. Added API key validation before research:
```typescript
if (!apiKey || !apiKey.startsWith('sk-or-')) {
  await updateCityError(cityId, 'OpenRouter API key not configured')
  return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
}
```

3. Created migration 014 to add `error_message` column to cities table

### Status: FIXED (requires migration 014 to be run)

---

## Issue #5: TMH Assistant "Fetch Failed" Errors

### Symptoms
- Chat interface showed "fetch failed" error
- Assistant couldn't respond to queries
- No helpful error message for users

### Root Cause
- OpenRouter API key validation was too strict
- Error messages weren't user-friendly
- Key format check rejected valid keys

### Files Affected
- `src/app/api/chat/route.ts`

### Fix Applied
```typescript
// Better error message when API key missing
if (!config.apiKey) {
  return NextResponse.json(
    { error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.' },
    { status: 500 }
  )
}

// Accept both sk-or- and sk- prefixes
if (!config.apiKey.startsWith('sk-or-') && !config.apiKey.startsWith('sk-')) {
  return NextResponse.json(
    { error: 'OpenRouter API key has invalid format. Should start with sk-or-' },
    { status: 500 }
  )
}
```

### Status: FIXED

---

## Issue #6: Library Showing Blank/Gray Thumbnails

### Symptoms
- Library page showed gray placeholder boxes
- Images not displaying
- "No approved assets yet" even after generation

### Root Cause (Multiple)
1. `generated_content` table had placeholder URLs, not real images
2. Images saved with `status: 'completed'` not `status: 'approved'`
3. Approval flow didn't actually save to database
4. `placehold.co` domain not in next.config.ts

### Files Affected
- `src/app/library/LibraryContent.tsx`
- `src/app/generate/image/page.tsx`
- `src/app/api/generated-content/route.ts` (created)
- `next.config.ts`

### Fix Applied
1. Created `/api/generated-content` endpoint to handle saving approved images
2. Updated `handleApproveSelected()` to actually save to database:
```typescript
const handleApproveSelected = async () => {
  const imagesToApprove = generationResults.filter(r =>
    r.modelA.status === 'completed' && r.modelA.imageUrl
  );

  // Save each approved image to the database
  const savePromises = imagesToApprove.map(async (result) => {
    const response = await fetch('/api/generated-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city_id: selectedCity?.id,
        content_type: result.type === 'product' ? 'product_shot' : 'lifestyle_shot',
        // ... other fields
        status: 'approved'
      })
    });
    // ...
  });

  await Promise.all(savePromises);
};
```

3. Added image domains to next.config.ts:
```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'placehold.co' },
    { protocol: 'https', hostname: 'via.placeholder.com' },
    { protocol: 'https', hostname: '*.supabase.co' },
    { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
  ],
},
```

### Status: PARTIALLY FIXED (approval saves, but real image generation still returns placeholders)

---

## Issue #7: city_elements Table Missing

### Symptoms
- Database diagnostic showed table missing
- City research couldn't store cultural elements

### Root Cause
- Migration 002 had not been run

### Files Affected
- `supabase/migrations/002_create_city_elements.sql`

### Fix Applied
User ran migration 002 in Supabase SQL editor

### Status: FIXED (requires migration to be run)

---

## Issue #8: CitySelector areaCodes Undefined Error

### Symptoms
- Runtime error when selecting a city
- Error: "Cannot read properties of undefined (reading 'join')"
- Page crashed after city selection

### Root Cause
- `selectedCity.areaCodes` was undefined for some cities
- No null check before calling `.join()`

### Files Affected
- `src/components/CitySelector.tsx`

### Fix Applied
```typescript
// Before
Area Codes: {selectedCity.areaCodes.join(', ')}

// After
{selectedCity.areaCodes?.length > 0 && ` | Area Codes: ${selectedCity.areaCodes.join(', ')}`}
```

### Status: FIXED

---

## Issue #9: Hydration Mismatch Warning

### Symptoms
- Console warning about hydration mismatch
- Body className different between server and client

### Root Cause
- Browser extension (ClickUp) adding classes to body tag
- Not a code issue

### Files Affected
- `src/app/layout.tsx` (not actually broken)

### Fix Applied
None needed - this is a browser extension conflict. Test in incognito mode to avoid.

### Status: NOT A BUG (browser extension)

---

## Issue #10: Error Fetching Feedback

### Symptoms
- Console error: "Error fetching feedback: {}"
- Non-blocking but noisy

### Root Cause
- `feedback` table may not exist
- Preferences system queries table that doesn't exist

### Files Affected
- `src/lib/preferences.ts`
- `src/app/generate/page.tsx`

### Fix Applied
Falls back to default preferences - non-blocking error

### Status: LOW PRIORITY (graceful degradation works)

---

## Issue #11: Vercel Diagnostics Not Working

### Symptoms
- Diagnostic endpoints returned nothing on Vercel
- Only worked on localhost

### Root Cause
- Environment variables may not have been deployed
- Potential caching issues

### Files Affected
- `src/app/api/debug/env/route.ts`
- `src/app/api/debug/test-openrouter/route.ts`
- `src/app/api/debug/database/route.ts`

### Fix Applied
User verified Vercel env vars are set correctly via dashboard. May need redeploy.

### Status: NEEDS VERIFICATION after redeploy

---

## Diagnostic Endpoints Created

For future debugging, these endpoints were created:

| Endpoint | Purpose |
|----------|---------|
| `/api/debug/env` | Check all environment variables |
| `/api/debug/test-openrouter` | Test OpenRouter API key and available models |
| `/api/debug/database` | Check database connection and table existence |
| `/api/seed/content-types` | GET: check if content_types exists, POST: seed default types |

---

## Database Migrations Status

| Migration | Description | Status |
|-----------|-------------|--------|
| 002 | Create city_elements table | Needs to be run |
| 006 | Create content_types table | Needs to be run |
| 014 | Add error_message column to cities | Needs to be run |

**How to run migrations:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of migration file
3. Run the SQL

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
WAVESPEED_API_KEY=...
```

All confirmed present in Vercel dashboard.

---

## Core Unresolved Issues

### 1. No Real Images Being Generated
- Image generation APIs return placeholder URLs
- OpenRouter image modality may not be working as expected
- Need to verify actual API calls are being made

### 2. Fragmented Codebase
- Multiple project folders: `TMH/`, `tmh-app/`, `tmh-dashboard/`, `Claude Code/tmh-dashboard/`
- Unclear which is the "real" project
- Possible conflicting code between versions

### 3. Research API Partially Working
- Basic flow works but may not store results properly
- Perplexity integration needs verification

### 4. Video Generation Not Tested
- Sora and Veo endpoints exist but untested
- Status polling endpoints exist but unused

### 5. Complex Multi-Page Flow
- Generate → Review → Approve → Library is multi-step
- Each step has potential failure points
- No simple end-to-end test path

---

## Recommendations

### Option A: Continue Fixing Current Project
**Pros:**
- Basic infrastructure exists (Supabase, OpenRouter, Next.js)
- Many issues are now documented and partially fixed
- Don't lose existing work

**Cons:**
- Technical debt from multiple iterations
- Unclear which code is authoritative
- May keep hitting new issues

**Effort:** Medium - need to clean up, consolidate, and test

### Option B: Fresh Start with Simpler Architecture
**Pros:**
- Clean slate, no legacy issues
- Can design AI-chat-first from beginning
- Simpler mental model

**Cons:**
- Lose existing integration work
- Need to rebuild Supabase schema
- Time to get back to current state

**Effort:** High initially, but cleaner long-term

### Option C: Hybrid - New UI, Keep Backend
**Pros:**
- Keep working Supabase/API integrations
- Fresh frontend with chat-first design
- Reuse what works, replace what doesn't

**Cons:**
- Need to identify what actually works
- Risk of importing problems

**Effort:** Medium

---

## Files Modified During QA Sessions

| File | Changes |
|------|---------|
| `src/components/CitySelector.tsx` | API response handling, status filtering, areaCodes null check |
| `src/lib/supabase.ts` | Error handling for getContentTypes |
| `src/app/globals.css` | Input text color fixes |
| `src/app/api/cities/route.ts` | Error handling, updateCityError helper, API key validation |
| `src/app/api/chat/route.ts` | Better error messages, API key validation |
| `src/app/api/generated-content/route.ts` | Created - handles saving approved content |
| `src/app/api/debug/env/route.ts` | Created - diagnostic endpoint |
| `src/app/api/debug/test-openrouter/route.ts` | Created - diagnostic endpoint |
| `src/app/api/debug/database/route.ts` | Created - diagnostic endpoint |
| `src/app/api/seed/content-types/route.ts` | Created - seed endpoint |
| `src/app/generate/image/page.tsx` | Fixed handleApproveSelected to save to DB |
| `next.config.ts` | Added image remote patterns |
| `supabase/migrations/014_add_error_message_to_cities.sql` | Created |
| `PRD.md` | Created - comprehensive product requirements doc |

---

## Next Steps (If Continuing)

1. Run all migrations (002, 006, 014) in Supabase
2. Redeploy to Vercel
3. Test diagnostic endpoints on production
4. Test single image generation end-to-end
5. Verify image appears in Library
6. Test research flow for one city
7. Test chat assistant

---

*Document last updated: January 2025*
