# TMH AI Content Engine - Product Requirements Document

**Version:** 1.0
**Last Updated:** January 21, 2026
**Status:** Active Development
**Document Owner:** Technical Project Manager

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Target Users](#3-target-users)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Feature Inventory](#6-feature-inventory)
7. [Database Schema](#7-database-schema)
8. [External Integrations](#8-external-integrations)
9. [User Flows](#9-user-flows)
10. [Current State Assessment](#10-current-state-assessment)
11. [Known Issues & Technical Debt](#11-known-issues--technical-debt)
12. [Environment & Configuration](#12-environment--configuration)
13. [Testing & Seed Data](#13-testing--seed-data)
14. [Success Metrics](#14-success-metrics)
15. [Glossary](#15-glossary)

---

## 1. Executive Summary

### What is TMH AI Content Engine?

TMH (That's My Hoodie) AI Content Engine is an internal AI-powered content generation platform for a premium streetwear brand. The system automates the creation of city-specific marketing content including product photography, lifestyle shots, video ads, and social media captions.

### Business Problem

Creating authentic, city-specific streetwear content is:
- **Time-consuming:** Manual photography and copywriting per city
- **Expensive:** Traditional photoshoots cost $5,000-$20,000+ per city
- **Inconsistent:** Different photographers/writers produce varying quality
- **Slow to scale:** Adding new cities takes weeks/months

### Solution

An AI-driven content engine that:
- Generates city-authentic content in minutes, not weeks
- Costs $0.02-$0.80 per asset vs. thousands for traditional methods
- Maintains brand consistency through knowledge base guardrails
- Learns from feedback to improve over time
- Enables A/B testing of AI models to optimize cost/quality

### Key Value Propositions

| Metric | Traditional | TMH Engine |
|--------|-------------|------------|
| Cost per city launch | $10,000+ | ~$50-100 |
| Time to generate content | 2-4 weeks | Minutes |
| Content variations | 5-10 | Unlimited |
| Brand consistency | Variable | Enforced via KB |
| Learning & improvement | Manual | Automated |

---

## 2. Product Overview

### Brand Context

**TMH (That's My Hoodie)** is a premium streetwear brand specializing in city-specific hoodies featuring embroidered designs that celebrate local culture, slang, landmarks, and sports teams.

- **Price point:** $150+ per hoodie
- **Aesthetic:** Premium casual, sporty luxury ("Moncler meets Stüssy")
- **Brand voice:** Confident, authentic, slightly exclusive
- **Tagline:** "Wear where you're from"
- **Target audience:** Urban fashion-conscious adults 18-35

### Product Vision

Build an AI-powered content factory that enables TMH to launch in 50+ cities with consistent, high-quality, culturally-authentic marketing content at a fraction of traditional costs.

### Core Capabilities

1. **City Research** - Automated cultural intelligence gathering via Perplexity AI
2. **Content Generation** - AI image/video generation with dual-model comparison
3. **Knowledge Base** - Curated sneakers, models, styles, and learnings
4. **Feedback Loop** - User feedback drives continuous improvement
5. **Cost Optimization** - Budget tracking and model performance analytics

---

## 3. Target Users

### Primary Users

| Role | Description | Key Actions |
|------|-------------|-------------|
| **Brand Manager** | Oversees content strategy and approvals | Review/approve generated content, configure cities |
| **Content Creator** | Generates day-to-day marketing assets | Generate images/videos, select from comparisons |
| **Creative Director** | Sets brand guidelines and knowledge base | Configure sneakers, models, styles, prompt templates |

### User Personas

**Persona 1: Marcus (Brand Manager)**
- Needs to launch TMH in 5 new cities this quarter
- Wants quick content turnaround without sacrificing quality
- Cares about brand consistency across all cities
- Uses: Dashboard, City Research, Content Approval

**Persona 2: Jayla (Content Creator)**
- Creates 20+ social posts per week across multiple cities
- Needs variety in generated content
- Wants easy comparison between model outputs
- Uses: Generate page, Library, Comparison Viewer

**Persona 3: Derek (Creative Director)**
- Establishes visual and copy standards
- Curates sneaker/model/style knowledge base
- Reviews AI learnings and adjusts weights
- Uses: Settings, Knowledge Base, Prompt Templates

---

## 4. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.4 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 4.1.18 | Styling |
| Zustand | 5.0.10 | State management |
| Lucide React | - | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | - | Backend endpoints |
| Supabase | - | PostgreSQL database + auth |
| OpenRouter | - | Multi-model AI gateway |

### AI/ML Services
| Service | Models | Purpose |
|---------|--------|---------|
| OpenRouter | GPT-5 Image, Gemini Flash/Pro | Image generation |
| OpenRouter | Sora 2, VEO 3 | Video generation |
| OpenRouter | Claude Sonnet, GPT-4o | Text generation |
| Perplexity | sonar-pro | City research |

### Infrastructure
| Component | Provider | Purpose |
|-----------|----------|---------|
| Hosting | Vercel | Next.js deployment |
| Database | Supabase | PostgreSQL + RLS |
| Storage | Supabase Storage | Video/image storage |
| AI Gateway | OpenRouter | Model routing + billing |

---

## 5. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Dashboard │  │ Generate │  │ Library  │  │ Settings │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │                │
│  ┌────┴─────────────┴─────────────┴─────────────┴────┐          │
│  │              Zustand State Stores                  │          │
│  │  (budget, generation, city, chat, feedback)        │          │
│  └────────────────────────┬──────────────────────────┘          │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                      API ROUTES                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ /api/cities │  │/api/generate│  │/api/knowledge│              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│  ┌──────┴────────────────┴────────────────┴──────┐              │
│  │              OpenRouter Client                 │              │
│  │         (lib/openrouter.ts)                   │              │
│  └────────────────────────┬──────────────────────┘              │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │ Supabase │  │OpenRouter│  │Perplexity│                       │
│  │(Database)│  │(AI Models)│  │(Research)│                       │
│  └──────────┘  └──────────┘  └──────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
/src
├── /app                    # Next.js App Router pages
│   ├── /api               # Backend API routes
│   │   ├── /cities        # City CRUD + research
│   │   ├── /generate      # Content generation
│   │   ├── /knowledge     # Knowledge base CRUD
│   │   ├── /decision      # AI decision/suggestion
│   │   └── /feedback      # Feedback collection
│   ├── /cities            # City management pages
│   ├── /generate          # Generation interface
│   ├── /library           # Asset library
│   ├── /settings          # Configuration pages
│   └── page.tsx           # Dashboard
├── /components            # React UI components
├── /lib                   # Utilities & integrations
│   ├── openrouter.ts      # OpenRouter API client
│   └── supabase.ts        # Supabase client + helpers
├── /stores                # Zustand state stores
└── /types                 # TypeScript definitions

/supabase
└── /migrations            # Database migrations (001-013)
```

---

## 6. Feature Inventory

### 6.1 Dashboard (`/`)

**Purpose:** Central hub showing budget status, AI suggestions, and recent activity.

**Components:**
- Budget tracking widget (monthly spend vs. limit)
- AI suggestion cards (recommended generations)
- Recent test results with win/loss indicators
- Quick action buttons (Product Shot, Lifestyle Shot, Video)

**Status:** ✅ Implemented

---

### 6.2 Content Generation (`/generate`)

**Purpose:** Primary interface for generating AI content.

**User Flow:**
1. Select city from dropdown (loads city-specific knowledge)
2. Choose product type: Hoodie, T-Shirt, Hat
3. Select design style: Minimal, Bold, Vintage, Modern, Luxury
4. Optionally pick slang term or let AI suggest
5. Click "Generate" → dual models run in parallel
6. Compare results side-by-side
7. Vote for winner → feedback captured

**Components:**
- `CitySelector` - City dropdown with status filtering
- `PipelineSelector` - Dual model configuration
- `ComparisonViewer` - Side-by-side results with voting

**AI Models Available:**

| Type | Model | Cost | Latency |
|------|-------|------|---------|
| Image | GPT-5 Image | $0.04 | ~5s |
| Image | GPT-5 Image Mini | $0.02 | ~3s |
| Image | Gemini Flash | $0.03 | ~4s |
| Image | Gemini Pro | $0.05 | ~6s |
| Video | Sora 2 | $0.20 | ~15s |
| Video | Sora 2 Pro | $0.40 | ~20s |
| Video | VEO 3 | $0.30 | ~18s |

**Status:** ⚠️ UI complete, model response parsing needs work

---

### 6.3 Asset Library (`/library`)

**Purpose:** Gallery of all generated content with filtering and management.

**Features:**
- Grid view of generated images/videos
- Filter by city, content type, status
- Asset detail modal with metadata
- Download, delete, use in post actions
- Approval workflow

**Status:** ✅ Implemented (displays from `generated_content` table)

---

### 6.4 City Management (`/cities`)

**Purpose:** Add, research, and manage city-specific data.

**Features:**
- City list with status indicators
- Add city modal with research category selection
- City detail page (`/cities/[cityId]`)
  - Research status and results
  - City elements (slang, landmarks, sports, cultural)
  - Element approval/rejection workflow

**Research Categories:**
- Slang & expressions
- Landmarks & neighborhoods
- Sports teams & colors
- Streetwear culture
- Visual identity
- Area codes

**Research API:** Uses Perplexity (sonar-pro) via OpenRouter

**Status:** ✅ CRUD works, ⚠️ Research may timeout/fail silently

---

### 6.5 Knowledge Base (`/settings/knowledge-base`)

**Purpose:** Configure curated data that feeds into AI prompts.

#### 6.5.1 Sneakers
- 6 tiers: ultra_grail → banned
- Fields: name, brand, colorway, cultural_notes, best_cities
- 30+ seeded sneakers

#### 6.5.2 Model Specs
- AI-generated human model configurations
- Fields: gender, ethnicity, age_range, build, vibe, hairstyle
- City-linked recommendations
- 12+ seeded specs

#### 6.5.3 Style Slots
- 12 outfit templates (M1-M6, W1-W6)
- Fields: sneaker_vibe, pants_style, chain_style
- Examples: "Jordan Head", "Athleisure Boss"

#### 6.5.4 Competitors
- 8 competitor profiles
- Tiers: direct, aspirational, city-specific
- Tracks strengths, weaknesses, positioning

#### 6.5.5 Learnings
- Auto-extracted from user feedback
- Categories: preference, dislike, rule, sneakers, models, etc.
- Confidence scores (0-1)
- Auto-apply to future generations

**Status:** ✅ All tables seeded, UI functional

---

### 6.6 Content Types (`/settings/content-types`)

**Purpose:** Define custom content format templates.

**Seeded Types:**
- Twitter Post (280 char limit)
- Instagram Caption (2200 char, hashtag optimized)
- Reddit Post (markdown format)
- Blog Post Intro (SEO optimized)
- TikTok Script (30s format)

**Status:** ⚠️ Table may not be deployed to production

---

### 6.7 Prompt Templates (`/settings/prompts`)

**Purpose:** Edit AI prompt templates with variable support.

**Features:**
- Template editor with `{{variable}}` syntax
- Variable definition with types
- Model recommendations per template
- Version tracking

**Status:** ✅ Editor functional

---

### 6.8 TMH Assistant (Chat)

**Purpose:** AI chat interface for research and assistance.

**Capabilities (via function calling):**
- `get_city_info` - Query city knowledge
- `get_sneakers` - Search sneaker library
- `trigger_research` - Start city research
- `suggest_content` - Get content ideas
- `queue_generation` - Queue generation jobs

**Status:** ⚠️ Framework built, may have API key issues

---

### 6.9 Calendar (`/calendar`)

**Purpose:** Content calendar view for scheduling.

**Status:** ❌ Stub implementation

---

### 6.10 Analytics (`/settings/analytics`)

**Purpose:** Usage metrics and performance tracking.

**Planned Metrics:**
- Generation volume by city/type
- Cost trends over time
- Model win rates
- Learning confidence scores

**Status:** ⚠️ Partially implemented

---

## 7. Database Schema

### 7.1 Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    cities    │────<│  city_elements   │     │   sneakers   │
└──────────────┘     └──────────────────┘     └──────────────┘
       │
       │             ┌──────────────────┐     ┌──────────────┐
       │────────────<│generated_content │     │ model_specs  │
       │             └──────────────────┘     └──────────────┘
       │                    │
       │             ┌──────┴───────┐         ┌──────────────┐
       │             │   feedback   │         │ style_slots  │
       │             └──────────────┘         └──────────────┘
       │                    │
       │             ┌──────┴───────┐         ┌──────────────┐
       └────────────<│  learnings   │         │ competitors  │
                     └──────────────┘         └──────────────┘
```

### 7.2 Core Tables

#### cities
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | City name |
| state | TEXT | State/province |
| country | TEXT | Country |
| status | ENUM | draft, researching, ready, active, archived, error |
| nicknames | JSONB | Array of city nicknames |
| area_codes | JSONB | Array of area codes |
| slang | JSONB | Slang terms and meanings |
| landmarks | JSONB | Notable locations |
| sports_teams | JSONB | Teams and colors |
| visual_identity | JSONB | Colors, symbols, aesthetic |
| avoid | JSONB | Sensitive topics to avoid |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

#### city_elements
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| city_id | UUID | FK to cities |
| element_type | ENUM | slang, landmark, sport, cultural |
| element_key | TEXT | Unique identifier within type |
| element_value | JSONB | Element data |
| status | ENUM | pending, approved, rejected |

#### generated_content
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| city_id | UUID | FK to cities |
| content_type | ENUM | image, video, caption, script |
| title | TEXT | Content title |
| prompt | TEXT | Generation prompt used |
| model | TEXT | AI model used |
| output_url | TEXT | URL to generated asset |
| status | ENUM | pending, processing, completed, failed, approved, rejected |
| generation_cost_cents | INT | Cost in cents |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### sneakers
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Sneaker name |
| tier | ENUM | ultra_grail, heavy_heat, certified_heat, new_heat, city_specific, banned |
| brand | TEXT | Brand name |
| colorway | TEXT | Color description |
| cultural_notes | TEXT | Cultural significance |
| best_cities | TEXT[] | Cities where popular |
| is_active | BOOLEAN | Active status |

#### learnings
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| category | ENUM | preference, dislike, rule, intel, sneakers, models, styles, cities, prompts, general |
| insight | TEXT | The learning |
| source | ENUM | feedback, conversation, manual |
| confidence | DECIMAL | 0-1 confidence score |
| auto_apply | BOOLEAN | Auto-apply to generations |
| applied_count | INT | Times applied |

### 7.3 Row Level Security (RLS)

All tables have RLS enabled with policies:
- `authenticated` users: Full CRUD access
- `anon` users: Read-only access (for development)
- Service role: Unrestricted access

**Current Issue:** RLS was causing write failures; may be disabled in production.

---

## 8. External Integrations

### 8.1 OpenRouter

**Purpose:** Multi-model AI gateway for image, video, and text generation.

**Configuration:**
```typescript
// lib/openrouter.ts
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
// Required env: OPENROUTER_API_KEY
```

**Endpoints Used:**
- `POST /chat/completions` - All generation requests

**Models:**
| Category | Model ID | Avg Cost | Use Case |
|----------|----------|----------|----------|
| Image | openai/gpt-5-image | $0.04 | Premium product shots |
| Image | openai/gpt-5-image-mini | $0.02 | Quick iterations |
| Image | google/gemini-2.5-flash-image | $0.03 | Variations |
| Video | openai/sora-2 | $0.20 | Social clips |
| Video | openai/sora-2-pro | $0.40 | Premium video |
| Video | google/veo-3 | $0.30 | Alternative provider |
| Text | anthropic/claude-sonnet-4 | $0.01 | Brand voice copy |
| Research | perplexity/sonar-pro | Variable | City research |

**Budget Tracking:**
- Monthly budget configurable via `MONTHLY_BUDGET_CENTS`
- Cost logged per generation
- Budget status displayed on dashboard

### 8.2 Supabase

**Purpose:** PostgreSQL database with auth and storage.

**Configuration:**
```typescript
// lib/supabase.ts
// Required env:
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_ANON_KEY
// - SUPABASE_SERVICE_KEY (for backend)
```

**Features Used:**
- PostgreSQL database (13+ tables)
- Row Level Security
- Storage buckets (videos, images)
- Real-time subscriptions (future)

### 8.3 Perplexity (via OpenRouter)

**Purpose:** Real-time web search for city cultural research.

**Model:** `perplexity/sonar-pro`

**Use Cases:**
- City slang research
- Landmark identification
- Sports team data
- Streetwear scene analysis

**Flow:**
1. User creates new city
2. System calls Perplexity with research prompt
3. Results parsed as JSON
4. Stored in city_elements table
5. User reviews and approves elements

---

## 9. User Flows

### 9.1 Content Generation Flow

```
┌─────────────┐
│  Dashboard  │
└──────┬──────┘
       │ Click "Product Shot"
       ▼
┌─────────────┐
│  /generate  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────┐
│ 1. Select City               │
│    └─ CitySelector dropdown  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 2. Select Product Type       │
│    └─ Hoodie/T-Shirt/Hat     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 3. Select Design Style       │
│    └─ Minimal/Bold/etc.      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 4. Optional: Select Slang    │
│    └─ AI Suggest or pick     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 5. Click "Generate"          │
│    └─ Dual models run        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 6. ComparisonViewer          │
│    └─ Side-by-side results   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 7. Vote for Winner           │
│    └─ Feedback captured      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 8. Asset saved to Library    │
│    └─ Learning extracted     │
└──────────────────────────────┘
```

### 9.2 City Research Flow

```
┌─────────────┐
│  /cities    │
└──────┬──────┘
       │ Click "Add City"
       ▼
┌────────────────────────────────┐
│ AddCityModal                   │
│ - Enter city name              │
│ - Select research categories:  │
│   □ Slang                      │
│   □ Landmarks                  │
│   □ Sports                     │
│   □ Culture                    │
│   □ Visual Identity            │
│   □ Area Codes                 │
└──────────────┬─────────────────┘
               │ Submit
               ▼
┌────────────────────────────────┐
│ POST /api/cities               │
│ - Create city (status: draft)  │
│ - Trigger research async       │
│   └─ Status: researching       │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ Perplexity Research (async)    │
│ - Calls sonar-pro model        │
│ - Parses JSON response         │
│ - Stores in city_elements      │
│ - Updates status: ready        │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ /cities/[cityId]               │
│ - View research results        │
│ - Approve/reject elements      │
└────────────────────────────────┘
```

### 9.3 Feedback Learning Flow

```
┌────────────────────────────────┐
│ User votes for winning model   │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ POST /api/feedback             │
│ - Record vote (thumbs up/down) │
│ - Extract learnings            │
│   - Model preference           │
│   - Style preference           │
│   - City-specific insight      │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ Learnings Table Updated        │
│ - New learning created         │
│ - Confidence score assigned    │
│ - auto_apply flag set          │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ Future Generations             │
│ - Query learnings              │
│ - High-confidence learnings    │
│   auto-applied to prompts      │
│ - applied_count incremented    │
└────────────────────────────────┘
```

---

## 10. Current State Assessment

### 10.1 Feature Status Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard | ✅ Working | Budget, suggestions, recent tests |
| Generate Page | ⚠️ Partial | UI complete, model parsing needs work |
| Asset Library | ✅ Working | Displays from generated_content |
| City Management | ✅ Working | CRUD functional |
| City Research | ⚠️ Partial | May timeout, status stuck at "researching" |
| Knowledge Base | ✅ Working | All 5 sections functional |
| Content Types | ⚠️ Partial | Table may not exist in prod |
| Prompt Templates | ✅ Working | Editor functional |
| TMH Assistant | ⚠️ Partial | Fetch failures reported |
| Calendar | ❌ Stub | Not implemented |
| Analytics | ⚠️ Partial | Basic tracking only |
| Export | ❌ Stub | Not implemented |

### 10.2 What's Working

1. **Database Layer**
   - All migrations run successfully
   - Tables created with proper indexes
   - Seed data populated (sneakers, models, styles, competitors)
   - RLS policies configured (though may be disabled)

2. **UI Components**
   - Dashboard renders with mock/real data
   - City selector with status filtering
   - Knowledge base management pages
   - Comparison viewer layout
   - Preview components (Instagram, TikTok)

3. **API Routes**
   - City CRUD (`/api/cities`)
   - Knowledge base CRUD (`/api/knowledge/*`)
   - Feedback submission (`/api/feedback`)

4. **State Management**
   - Zustand stores functional
   - LocalStorage persistence

### 10.3 What's Broken/Incomplete

1. **Content Generation**
   - Models return responses but parsing incomplete
   - Images display as placeholder URLs
   - No actual AI images being generated

2. **City Research**
   - Perplexity calls may fail silently
   - Cities stuck in "researching" status
   - No retry mechanism

3. **TMH Assistant**
   - "fetch failed" errors
   - Likely missing `OPENROUTER_API_KEY`

4. **Content Types**
   - Table may not exist in production Supabase
   - Page shows "Failed to load content types"

5. **Video Generation**
   - Status polling may not work
   - Stitching not implemented

---

## 11. Known Issues & Technical Debt

### 11.1 Critical Issues

| Issue | Impact | Root Cause | Fix Priority |
|-------|--------|------------|--------------|
| No real images generated | Content shows placeholders | OpenRouter API key missing/invalid | P0 |
| Research stuck at "researching" | Cities unusable | API call fails, status never updates | P0 |
| TMH Assistant fetch failed | Feature unusable | Missing API key | P1 |
| Content types not loading | Page broken | Table may not exist | P1 |

### 11.2 Technical Debt

| Item | Description | Effort |
|------|-------------|--------|
| Type safety | Many `any` casts in Supabase queries | Medium |
| Error handling | Research API fails silently | Low |
| RLS bypass | RLS may be disabled for development | Medium |
| Async operations | Fire-and-forget research with no status endpoint | Medium |
| Model availability | Some model IDs may not exist on OpenRouter | Low |
| Test coverage | No unit/integration tests visible | High |

### 11.3 Environment Issues

**Required Environment Variables (check these first):**
```env
OPENROUTER_API_KEY=sk-...        # ← Most likely missing/invalid
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
```

**Verification Steps:**
1. Check Vercel environment variables
2. Test OpenRouter key validity
3. Confirm Supabase tables exist
4. Check Vercel deployment logs for errors

---

## 12. Environment & Configuration

### 12.1 Required Environment Variables

```env
# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...  # For backend operations

# OpenRouter (AI)
OPENROUTER_API_KEY=sk-or-v1-...

# App Config
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=TMH AI Content Engine

# Optional: Reddit API
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USER_AGENT=TMH_Bot/1.0
```

### 12.2 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### 12.3 Deployment

**Hosting:** Vercel (auto-deploys from main branch)

**Database:** Supabase hosted PostgreSQL

**To deploy new migrations:**
1. Add SQL file to `/supabase/migrations/`
2. Run migration manually in Supabase SQL editor
3. Or use Supabase CLI: `npx supabase db push`

---

## 13. Testing & Seed Data

### 13.1 Seed Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/seed/knowledge-base` | POST | Populate all knowledge tables |
| `/api/seed/test-run` | POST | Generate test cities + content |
| `/api/seed/test-run` | GET | Get current content counts |

### 13.2 Test Data Included

**Cities:** London, Detroit, Chicago (via test-run)

**Sneakers (30+):**
- Ultra Grail: Travis Scott Jordan 1, Nike Mag
- Heavy Heat: Off-White Chicago, Union LA
- Certified Heat: Jordan 1 Chicago, Yeezy 350
- New Heat: New Balance 550
- City Specific: Nike Dunk Detroit
- Banned: Nazi imagery, counterfeit

**Model Specs (12+):**
- NYC: Bodega, Deadass, Yerr
- Detroit: What Up Doe
- Chicago: The Chi
- LA: LA variants

**Style Slots (12):**
- M1-M6: Boot Heavy, Jordan Head, NB Dad, Dunk Culture, Yeezy Wave, High Fashion Edge
- W1-W6: Tomboy Clean, Athleisure Boss, Street Glam, Minimalist Flex, Y2K Revival, Designer Edge

### 13.3 Manual Testing Checklist

```
□ Dashboard loads with budget data
□ City selector shows cities
□ Generate page loads all selectors
□ Knowledge base pages load data
□ City research triggers successfully
□ TMH Assistant responds without errors
□ Generated content appears in Library
□ Feedback submission works
```

---

## 14. Success Metrics

### 14.1 Product Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Cities launched | 10+ | 3 (test) |
| Assets generated/month | 500+ | 0 (broken) |
| Avg cost per asset | <$0.10 | N/A |
| Time to launch new city | <1 hour | N/A |
| User approval rate | >70% | N/A |

### 14.2 Technical Metrics

| Metric | Target | Current |
|--------|--------|---------|
| API success rate | >99% | Unknown |
| Average generation latency | <10s (image), <30s (video) | N/A |
| Budget tracking accuracy | 100% | N/A |
| Learning confidence accuracy | >80% correlation | N/A |

### 14.3 Business Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Content cost reduction | 90% vs traditional | $50 vs $5,000+ |
| Time to market | 95% reduction | Days vs months |
| Brand consistency score | >90% | Via human review |

---

## 15. Glossary

| Term | Definition |
|------|------------|
| **City Element** | A piece of city-specific knowledge (slang term, landmark, etc.) |
| **Comparison Viewer** | UI component showing two model outputs side-by-side |
| **Content Type** | Category of generated content (product shot, video ad, etc.) |
| **Generation Pipeline** | Specific model configuration for content creation |
| **Knowledge Base** | Curated data (sneakers, models, styles) that informs AI prompts |
| **Learning** | Insight extracted from user feedback |
| **Model Spec** | Configuration for AI-generated human models in images |
| **OpenRouter** | AI model gateway providing access to multiple providers |
| **Pipeline** | Combination of image + video models for generation |
| **Prompt Template** | Reusable text template with variable placeholders |
| **RLS** | Row Level Security - Supabase feature for data access control |
| **Seed Data** | Pre-populated test/default data |
| **Sneaker Tier** | Classification of sneakers by desirability/exclusivity |
| **Style Slot** | Pre-defined outfit configuration (M1-M6, W1-W6) |
| **TMH** | That's My Hoodie - the brand name |

---

## Appendix A: API Reference

### Cities API

```
GET /api/cities
  → Returns: City[]

GET /api/cities/[cityId]
  → Returns: City with elements

POST /api/cities
  Body: { name, researchCategories }
  → Creates city, triggers research

GET /api/cities/[cityId]/elements
  Query: ?element_type=slang&status=approved
  → Returns: CityElement[]
```

### Generation API

```
POST /api/generate/pipeline
  Body: { cityId, productType, designStyle, slangTerm, pipelines }
  → Returns: { modelA: Result, modelB: Result }

POST /api/generate/product-shot
  Body: { cityId, prompt, model }
  → Returns: { imageUrl, cost }

POST /api/generate/video/sora
  Body: { prompt, duration }
  → Returns: { jobId }

GET /api/generate/video/sora/status?jobId=xxx
  → Returns: { status, videoUrl? }
```

### Knowledge API

```
GET /api/knowledge/sneakers
  Query: ?tier=heavy_heat
  → Returns: Sneaker[]

POST /api/knowledge/sneakers
  Body: { name, tier, brand, ... }
  → Creates sneaker

PUT /api/knowledge/sneakers/[id]
  Body: { ...updates }
  → Updates sneaker

DELETE /api/knowledge/sneakers/[id]
  → Deletes sneaker
```

---

## Appendix B: Migration History

| # | Name | Description |
|---|------|-------------|
| 001 | create_cities | Cities table with JSONB fields |
| 002 | create_city_elements | Slang, landmarks, sports, cultural |
| 003 | create_designs | Design configurations |
| 004 | create_generated_content | First version (deprecated) |
| 005 | create_feedback | User feedback table |
| 006 | create_content_types | Social content templates |
| 007 | create_prompt_templates | AI prompt templates |
| 008 | seed_prompt_templates | Default prompts |
| 009 | add_order_index | Ordering support |
| 010 | create_knowledge_base | Sneakers, models, styles, etc. |
| 011 | create_generated_content | Updated schema |
| 012 | create_videos_bucket | Supabase storage |
| 013 | add_city_research_fields | Research metadata |

---

*Document generated by TMH AI Content Engine Technical Analysis*
