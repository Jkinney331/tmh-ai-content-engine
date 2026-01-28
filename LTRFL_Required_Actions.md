# LTRFL Required Actions & Known Issues

## Pre-Requisites Before Full Functionality

### 1. Database Migrations (CRITICAL)
**Status:** Pending - Run all at once when ready
**Owner:** Admin
**Action Required:** Run migrations in Supabase SQL Editor

Navigate to: Supabase Dashboard → SQL Editor → New Query

**Run migrations in this order:**

| # | File | Description |
|---|------|-------------|
| 1 | `supabase/migrations/018_create_ltrfl_tables.sql` | Create LTRFL tables (concepts, templates, cad_specs, marketing_content) |
| 2 | `supabase/migrations/019_seed_ltrfl_templates.sql` | Seed 60+ urn design templates |
| 3 | `supabase/migrations/020_create_marketing_templates.sql` | Create marketing templates table (Phase 3) |
| 4 | `supabase/migrations/021_seed_marketing_templates.sql` | Seed marketing content templates (Phase 3) |

**Note:** Tables affected:
- `ltrfl_templates` - Urn design prompt templates
- `ltrfl_concepts` - Generated urn concepts
- `ltrfl_cad_specs` - CAD specifications for manufacturing
- `ltrfl_marketing_content` - Generated marketing content
- `ltrfl_marketing_templates` - Marketing content templates

---

### 2. Wavespeed Video Credits
**Status:** Insufficient credits
**Owner:** Admin/Billing
**Action Required:** Top up Wavespeed account

Error returned: `"Insufficient credits. Please top up."`

The VEO video generation API is working correctly but needs credits to generate videos.

---

## Phase 1 Completion Checklist

- [x] LTRFL tab added to navigation
- [x] Dashboard page with stats
- [x] Template Library UI with category filtering
- [x] Concept Generator page (template/custom modes)
- [x] My Concepts gallery with status filtering
- [x] Concept detail page with review workflow
- [x] API routes for templates, concepts, generation
- [x] TypeScript types for all entities
- [x] LTRFL brand colors integrated
- [ ] **Database tables created** (pending migration run)
- [ ] **Template data seeded** (pending migration run)

---

## Known Issues / Technical Debt

### Minor
1. **Supabase CLI not linked** - Can't run migrations via CLI, must use dashboard
2. **VEO duration validation** - Must be 4, 6, or 8 seconds (not 5)

### None blocking Phase 2
All Phase 1 code is complete and deployed. Only pending item is database setup.

---

## Deployment Info

- **Production URL:** https://tmh-ai-content-engine.vercel.app
- **Branch:** ui-redesign
- **Last Deploy:** 2026-01-28

---

## Next: Phase 2 - CAD Pipeline

Phase 2 can proceed in parallel with database setup. The CAD specification form and workflow don't require the concept generation to be functional.
