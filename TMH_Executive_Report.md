# That's My Hoodie (TMH) - Executive Project Report
**Date:** January 20, 2026
**Prepared for:** Executive Leadership Team

---

## EXECUTIVE SUMMARY

**That's My Hoodie (TMH)** is a creative automation platform designed to streamline the entire product creation and social media content pipeline for city-branded premium apparel. The platform combines AI-powered design generation, community validation through social media, and performance analytics into a unified system.

### The Vision
Create a repeatable, data-driven pipeline that:
1. Generates product designs using AI based on city-specific cultural data
2. Tests designs with real audiences before production
3. Creates social media content from the same creative engine
4. Learns what works to improve future output

### Current Status: **70% Complete**
- Full technical architecture documented
- Frontend dashboard built and functional (using test data)
- Backend integration pending configuration

---

## SECTION 1: BUSINESS OVERVIEW
*For Executive Team*

### What We're Building

TMH is a **product-to-content pipeline** that solves three business problems:

| Problem | TMH Solution |
|---------|--------------|
| **Design guesswork** | AI generates designs based on cultural data; community validates before production |
| **Scattered tools** | Single dashboard connects design generation, approval, posting, and analytics |
| **Content creation bottleneck** | Same prompts that create product mockups generate social media content |

### Market Approach

We're starting with **city-pride premium hoodies** featuring local area codes, landmarks, and cultural elements. Each city is treated as a micro-market:

**Currently Configured:**
- Seattle (206) - Space Needle, coffee culture, grunge heritage
- Detroit (313) - Motor City, Motown, automotive pride
- Chicago (312) - Windy City, blues, architectural identity

### Revenue Model Alignment

The platform supports:
- **Pre-production validation** - Test designs before committing to inventory
- **Content multiplication** - One design session produces product shots + social content
- **Data-driven decisions** - Analytics show which designs resonate before production

### Social Media Integration

The social team has been creating content from our prompts. TMH centralizes this by:

1. **Storing successful prompts** - 20+ templates already catalogued with quality scores
2. **Tracking what works** - Connects prompt variations to engagement metrics
3. **Enabling correlation** - Links design elements to audience response

---

## SECTION 2: TECHNICAL OVERVIEW
*For Technical Leadership*

### Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    TMH DASHBOARD (Next.js 16)               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │
│  │ Generate│ │ Approve │ │ Post    │ │ Analytics       │   │
│  │ Designs │ │ Designs │ │ Content │ │ Dashboard       │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────────┬────────┘   │
└───────┼──────────┼──────────┼────────────────┼─────────────┘
        │          │          │                │
        ▼          ▼          ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    n8n WORKFLOW ENGINE                      │
│  WF1: City Context │ WF2: Image Gen │ WF3: Template Build  │
│  WF4: Reddit Post  │ WF5: Analytics                        │
└─────────────────────────────────────────────────────────────┘
        │          │          │                │
        ▼          ▼          ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐
│   Supabase   │ │  OpenRouter  │ │   Reddit API             │
│   Database   │ │  (AI Images) │ │   (Community Feedback)   │
└──────────────┘ └──────────────┘ └──────────────────────────┘
```

### Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | Next.js 16, React 19, TypeScript | Built |
| Styling | Tailwind CSS v4 | Built |
| State | Zustand | Specified, not implemented |
| Database | Supabase (PostgreSQL) | Schema ready, not connected |
| Automation | n8n (5 workflows) | Designed, not deployed |
| AI Generation | OpenRouter API | Route built, not configured |
| Deployment | Netlify | Ready |

### Database Schema (13 Tables)

**Core Entities:**
- `cities` - City metadata (name, area code, timezone, climate)
- `city_landmarks` / `city_cultural_elements` / `city_catchphrases` - Cultural data
- `design_concepts` - Product variations with flexible JSON schema
- `generated_images` - AI outputs with prompt tracking

**Content Pipeline:**
- `prompt_templates` - Reusable prompts with quality scores and variables
- `reddit_posts` - Scheduled and published social content
- `reddit_comments` - Engagement data with sentiment analysis

### Prompt System Architecture

The Master Prompt Library contains 20+ templates across 5 categories:

1. **Lifestyle Scenes** - Urban, coffee shop, rooftop photography
2. **Product Shots** - Flat lay, ghost mannequin, detail close-ups
3. **Comparison Templates** - Side-by-side voting layouts
4. **Logo Variations** - Pure embroidery design generation
5. **Video Prompts** - For Sora/Veo short-form content

**Variable System:**
```
Template: "Premium lifestyle photography of {{person_description}}
          on urban {{city_name}} street wearing {{hoodie_color}}
          hoodie with {{logo_placement}} embroidery..."
```

Variables include: `{{city_name}}`, `{{landmark_name}}`, `{{hoodie_color}}`, `{{logo_placement}}`, `{{embroidery_color}}`, `{{area_code}}`

### Workflow Engine (n8n)

| Workflow | Trigger | Function |
|----------|---------|----------|
| WF1 | City selection | Assembles complete city context |
| WF2 | Generate button | Creates 4 AI image variations |
| WF3 | Approval submit | Builds comparison templates |
| WF4 | Schedule/On-demand | Posts to Reddit, monitors comments |
| WF5 | Nightly (2 AM UTC) | Aggregates analytics, sends reports |

### Code Metrics

- **Frontend:** ~4,500 lines TypeScript/TSX
- **Documentation:** ~20,000 lines (specs, schemas, prompts)
- **Components:** 6 core, 9 pages implemented
- **Type Coverage:** 420 lines of TypeScript interfaces

---

## SECTION 3: WHAT'S WORKING

### Completed & Functional

| Component | Status | Notes |
|-----------|--------|-------|
| Dashboard UI | Working | All pages render, navigation functional |
| City Selector | Working | Dropdown with city context display |
| Image Gallery | Working | Grid view, filtering, selection |
| Approval Interface | Working | Side-by-side comparison workflow |
| Reddit Post Manager | Working | Queue management, scheduling UI |
| Analytics Dashboard | Working | Charts, metrics visualization |
| API Routes | Built | OpenRouter generation endpoint ready |

### Documentation Assets (Ready to Implement)

- `TMH_Frontend_Requirements_Specs.md` - Complete component specifications
- `TMH_Knowledge_Base_Schema_Supabase.md` - Full SQL schema with indexes
- `TMH_Master_Prompt_Library.md` - All prompt templates with variables
- `TMH_n8n_Workflow_Architecture.md` - Workflow logic and data flows
- `TMH_Reddit_Integration_Strategy.md` - Community management playbook

---

## SECTION 4: WHAT'S NEEDED TO GO LIVE

### Critical Path Items

| Task | Effort | Dependency |
|------|--------|------------|
| Configure Supabase credentials | 1 session | Account creation |
| Implement Zustand stores | 1-2 sessions | None |
| Connect frontend to Supabase | 2-3 sessions | Supabase config |
| Deploy n8n workflows | 2-3 sessions | n8n instance |
| Configure Reddit OAuth | 1 session | API credentials |
| Configure OpenRouter API | 1 session | API key |

### Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENROUTER_API_KEY=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
N8N_WEBHOOK_BASE_URL=
```

---

## SECTION 5: SOCIAL MEDIA CONTENT CORRELATION

### Current State

The social team has created content using prompts we've developed. To correlate what works:

**Data We Can Track:**
- Which prompt templates were used for each post
- Design elements in each image (color, logo style, placement)
- City/cultural elements featured
- Engagement metrics (likes, comments, shares, saves)

**Correlation Opportunities:**
1. **Prompt Performance** - Which templates generate highest engagement?
2. **Design Element Analysis** - Do certain colors/placements perform better?
3. **City Resonance** - Which cities have strongest audience response?
4. **Content Type** - Lifestyle vs. product shots vs. video

### Recommended Integration

To pull social media performance into TMH:

1. **Import historical posts** - Add past content to `reddit_posts` table with metrics
2. **Tag with prompt IDs** - Link each post to the prompt template used
3. **Build correlation dashboard** - New analytics view showing prompt-to-performance

---

## SECTION 6: PRODUCT CREATION PIPELINE VISION

### End-to-End Flow

```
1. SELECT CITY
   └─> System loads cultural context, landmarks, color palette

2. GENERATE DESIGNS
   └─> AI creates 4 variations using city-specific prompts
   └─> Same session produces: product mockups + social content

3. INTERNAL REVIEW
   └─> Team approves/rejects designs in dashboard
   └─> Approved designs enter validation queue

4. COMMUNITY VALIDATION
   └─> Side-by-side comparisons posted to Reddit
   └─> Audience votes on preferences
   └─> Sentiment analysis extracts insights

5. ANALYTICS & LEARNING
   └─> Performance data flows back to system
   └─> Successful prompts/elements identified
   └─> Future generation improves based on data

6. PRODUCTION DECISION
   └─> Data-backed design selection
   └─> Inventory commitment with confidence
```

### Key Differentiator

Traditional apparel workflow: Design → Produce → Market → Hope
TMH workflow: Design → Test → Learn → Produce (with data)

---

## SECTION 7: RECOMMENDATIONS

### Immediate Next Steps

1. **Complete backend integration** - Connect Supabase, enable live data
2. **Import social media history** - Bring past content into the system for correlation
3. **Deploy one n8n workflow** - Start with WF2 (image generation) as proof of concept
4. **Run pilot city** - Seattle as first complete end-to-end test

### 30-Day Targets

- [ ] Live database connection
- [ ] First AI-generated designs through dashboard
- [ ] First Reddit post via platform
- [ ] Historical social content imported
- [ ] Initial correlation report generated

### 90-Day Vision

- Full pipeline operational for 3 cities
- Social team using platform for all content creation
- Performance data driving design decisions
- Clear metrics on prompt effectiveness

---

## APPENDIX: PROJECT FILES

| File | Purpose |
|------|---------|
| [TMH_Frontend_Requirements_Specs.md](TMH_Frontend_Requirements_Specs.md) | UI component specifications |
| [TMH_Knowledge_Base_Schema_Supabase.md](TMH_Knowledge_Base_Schema_Supabase.md) | Database schema |
| [TMH_Master_Prompt_Library.md](TMH_Master_Prompt_Library.md) | AI prompt templates |
| [TMH_n8n_Workflow_Architecture.md](TMH_n8n_Workflow_Architecture.md) | Automation workflows |
| [TMH_Reddit_Integration_Strategy.md](TMH_Reddit_Integration_Strategy.md) | Community engagement playbook |
| [tmh-dashboard/](tmh-dashboard/) | Next.js application code |

---

*Report generated by project analysis. For technical questions, refer to documentation files. For strategic questions, schedule executive review.*
