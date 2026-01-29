# LTRFL Feature Handoff Document
## For: TMH Platform AI Developer
## From: Jay (via Claude context)
## Date: January 2025

---

## 🎯 Executive Summary

We're adding a new tab/section to the TMH Social Media Engine called **LTRFL** (Laid to Rest for Less). This is Jay's direct cremation coordination business that sells custom memorial urns. 

The LTRFL tab will mirror the structure of the existing TMH city profiles but focused on:
1. **Urn concept generation** (AI images → approval → CAD file conversion)
2. **Marketing content** (video ads, image ads, social posts)
3. **Product photography prompts**

---

## 🏢 What is LTRFL?

**Laid to Rest for Less** is a California-based direct cremation coordination service that:

- **Is NOT a funeral home** - Partners with licensed crematories for regulated duties
- **Sells custom memorial urns** - Figurines, traditional, biodegradable, aluminum, resin, ceramic
- **Coordinates celebration-of-life events** - At non-traditional venues (restaurants, museums, parks)
- **Operates online-first** - Families complete intake digitally, no funeral home visits

### Urn Product Lines

| Tier | Materials | Price Range |
|------|-----------|-------------|
| Budget | Biodegradable, Resin/Polymer | $75-$199 |
| Mid | Ceramic, Cultured Marble, Aluminum | $200-$499 |
| Premium | Bronze, Metal, Hybrid designs | $500-$1,500+ |

### Urn Design Types

1. **Traditional urns** - Classic shapes with lids (threaded, press-fit)
2. **Figurine urns** - Sculptural designs (angels, animals, objects) with **bottom-loading base** (no visible lid)
3. **Keepsake urns** - Mini urns (1-20 cu in) for sharing remains
4. **Themed urns** - Sports, hobbies, travel, vintage, pets, military, etc.

### Key Technical Spec for Urns

- **Adult urn volume**: ~200-220 cubic inches
- **Access method for figurines**: Bottom-loading with removable base plate + screws + gasket
- **Materials for 3D printing**: Resin (SLA), Biodegradable (FDM/PLA), Ceramic, Aluminum

---

## 🎨 What We're Building

### The LTRFL Tab Feature Set

```
LTRFL Tab
├── Urn Design Studio
│   ├── Concept Generator (AI images)
│   │   ├── Multi-image variations (3-4 per concept)
│   │   ├── Multi-model support (Wavespeed API)
│   │   ├── Category filtering (Sports, Pets, Travel, etc.)
│   │   └── Template library (editable, stored in Supabase)
│   ├── Approval Workflow
│   │   ├── Review generated images
│   │   ├── Approve/reject/request variations
│   │   └── Version history
│   └── CAD Conversion
│       ├── Auto-generate specs from category defaults
│       ├── Editable spec form before generation
│       ├── Mesh-based output (for 3D printing)
│       └── Parametric fallback (OpenSCAD)
│
├── Marketing Content (mirrors TMH city structure)
│   ├── Video Ads
│   ├── Image/Text Ads
│   ├── Social Media Posts
│   └── Product Photography Prompts
│
└── Template Library
    ├── 200+ pre-built prompts (from LTRFL Prompt Library V2)
    ├── Category organization
    ├── Editable via UI
    └── Stored in Supabase
```

---

## 🔧 Technical Requirements

### Integrations Needed

| Integration | Purpose | Status |
|-------------|---------|--------|
| **Wavespeed API** | Image generation (Nano Banana 3.1, ChatGPT 1.5) | Needs setup |
| **Supabase** | Template library, versioning, generated assets | Existing? |
| **FreeCAD MCP** | Mesh-based CAD generation | New |
| **OpenSCAD MCP** | Parametric CAD fallback | New |

### Data Models (Supabase)

#### `ltrfl_templates` table
```sql
id: uuid
category: text (Sports, Pets, Travel, Vintage, etc.)
subcategory: text
name: text
prompt: text
variables: jsonb (customizable parts of prompt)
created_at: timestamp
updated_at: timestamp
is_active: boolean
```

#### `ltrfl_concepts` table
```sql
id: uuid
template_id: uuid (nullable, if from template)
prompt_used: text
category: text
images: jsonb (array of image URLs/paths)
selected_image_index: integer (nullable)
status: enum (draft, reviewing, approved, cad_pending, cad_complete, rejected)
version: integer
parent_version_id: uuid (nullable, for versioning)
created_at: timestamp
updated_at: timestamp
```

#### `ltrfl_cad_specs` table
```sql
id: uuid
concept_id: uuid
urn_type: enum (traditional, figurine, keepsake)
material: text
volume_cu_in: decimal
height_mm: decimal
diameter_mm: decimal
wall_thickness_mm: decimal
access_method: enum (top_lid, bottom_loading, permanent_seal)
lid_type: text (nullable)
base_plate_specs: jsonb (nullable, for figurines)
engraving_area: jsonb
cad_file_url: text (nullable)
cad_format: text (STL, OBJ, STEP, etc.)
status: enum (pending, generating, complete, failed)
created_at: timestamp
updated_at: timestamp
```

#### `ltrfl_marketing_content` table
```sql
id: uuid
content_type: enum (video_ad, image_ad, social_post, product_photo)
prompt: text
generated_content: jsonb
status: enum (draft, approved, published)
created_at: timestamp
updated_at: timestamp
```

---

## 📋 Discovery Questions for AI Dev

**Please answer these so we can finalize the technical spec:**

### Current Stack
1. What frontend framework is TMH using? (React, Next.js, Vue, etc.)
2. What UI component library? (Tailwind, shadcn, MUI, etc.)
3. Is Supabase already integrated? If yes, what tables exist?
4. How are city profiles currently structured in the codebase?
5. Is there an existing image generation integration?

### API & Services
6. Is Wavespeed API already set up, or do we need to add it?
7. What's the current auth setup? (Supabase auth, Clerk, etc.)
8. Are there existing file upload/storage patterns? (Supabase storage, S3, etc.)

### Code Architecture
9. What's the folder structure for features/tabs?
10. Is there a state management library? (Zustand, Redux, Context, etc.)
11. How are API calls handled? (React Query, SWR, fetch, etc.)
12. Are there existing reusable components we should leverage?

### Deployment
13. Where is TMH deployed? (Vercel, Netlify, self-hosted, etc.)
14. Any CI/CD pipeline we need to be aware of?
15. Environment variable management approach?

---

## 🚀 Phased Implementation

### Phase 1: Foundation + Urn Concept Generation
- Set up LTRFL tab structure
- Supabase tables for templates and concepts
- Template library UI (CRUD operations)
- Image generation integration (Wavespeed)
- Multi-image variation generation
- Basic approval workflow

### Phase 2: CAD Conversion Pipeline
- CAD spec form with auto-populate
- FreeCAD MCP integration
- Mesh generation workflow
- File storage and download
- Version history

### Phase 3: Marketing Content Suite
- Video ad generation
- Image/text ad generation
- Social media post templates
- Product photography prompt library
- Content calendar integration (if applicable)

---

## 📚 Reference: LTRFL Prompt Library Categories

The template library should support these categories (from existing prompt library):

1. **Sports & Recreation** - Baseball, Basketball, Football, Golf, Soccer, etc.
2. **Pets & Animals** - Dogs, Cats, Horses, Birds, etc.
3. **Hobbies & Interests** - Gardening, Music, Art, Cooking, Gaming, etc.
4. **Professions** - Nurses, Teachers, Firefighters, Military, etc.
5. **Faith & Spirituality** - Angels, Crosses, Religious symbols
6. **Travel & Adventure** - Globes, Suitcases, Landmarks, etc.
7. **Vintage & Nostalgia** - Radios, Cars, Motorcycles, etc.
8. **Nature & Outdoors** - Mountains, Trees, Ocean, etc.
9. **Creative/Whimsical** - Rubik's Cube, Lego, Fortune Cookie, etc.

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- [ ] LTRFL tab appears in navigation
- [ ] Template library loads from Supabase
- [ ] Can create/edit/delete templates
- [ ] Can generate 3-4 image variations from a prompt
- [ ] Can approve/reject generated concepts
- [ ] Concepts saved to Supabase with versioning

### Phase 2 Complete When:
- [ ] Approved concepts show CAD spec form
- [ ] Specs auto-populate based on urn category
- [ ] Can edit specs before generation
- [ ] CAD file generates successfully
- [ ] Can download CAD file in multiple formats

### Phase 3 Complete When:
- [ ] Can generate video ad concepts
- [ ] Can generate image/text ads
- [ ] Can generate social media posts
- [ ] All content types follow LTRFL brand guidelines
- [ ] Content saved and versioned in Supabase

---

## 📞 Questions?

This document was prepared based on extensive conversations about LTRFL's business model, urn specifications, manufacturing requirements, and the vision for this feature. If anything is unclear, Jay can provide additional context from those discussions.

---

*Document version: 1.0*
*Last updated: January 2025*
