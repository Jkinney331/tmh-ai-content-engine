# TMH AI Content Engine
## Product Requirements Document & Post-Mortem

**Version**: 2.0
**Last Updated**: January 25, 2026
**Status**: Active Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision & Goals](#product-vision--goals)
3. [Technical Architecture](#technical-architecture)
4. [Feature Status Matrix](#feature-status-matrix)
5. [What's Working](#whats-working)
6. [What's Not Working](#whats-not-working)
7. [Recent Fixes & Changes](#recent-fixes--changes)
8. [Persisting Issues](#persisting-issues)
9. [Challenges Encountered](#challenges-encountered)
10. [Data Model](#data-model)
11. [API Reference](#api-reference)
12. [Recommendations & Next Steps](#recommendations--next-steps)

---

## Executive Summary

TMH AI Content Engine is a comprehensive AI-powered content generation platform built for "The Milkman's Hustle" streetwear brand. The platform enables city-specific cultural research, multi-model image and video generation, and intelligent content management workflows.

### Current State: **Beta / Active Development**

| Metric | Status |
|--------|--------|
| Core Features | 75% Complete |
| Research Pipeline | Working (with fallback mode) |
| Image Generation | Working |
| Video Generation | Partially Working |
| Database Integration | Working |
| Chat Assistant | Working |
| Drops Workflow | Working |

---

## Product Vision & Goals

### Vision
Create an AI-powered creative engine that generates culturally authentic, city-specific streetwear content at scale while maintaining brand consistency and premium quality.

### Primary Goals

1. **Cultural Intelligence** - Research and synthesize city-specific cultural signals (slang, landmarks, sports, music, creators) to inform content generation
2. **Multi-Model Generation** - Leverage best-in-class AI models for images (GPT-5, Gemini) and video (Sora, VEO)
3. **Quality Control** - Implement approval workflows, feedback loops, and learning systems
4. **Efficiency** - Reduce content creation time from days to hours
5. **Brand Consistency** - Maintain TMH aesthetic across all generated content

### Target Users
- Brand creative directors
- Social media managers
- Marketing teams

---

## Technical Architecture

### Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js 16 (App Router) + React 18 + TypeScript            │
│  Tailwind CSS + shadcn/ui + Zustand State                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  Next.js API Routes (40+ endpoints)                         │
│  Authentication: Supabase Auth (planned)                    │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Database     │ │   AI Services   │ │    Storage      │
│   Supabase      │ │                 │ │   Supabase      │
│   PostgreSQL    │ │ - OpenRouter    │ │   Storage       │
│                 │ │ - Perplexity    │ │                 │
│ Tables:         │ │ - OpenAI        │ │ Buckets:        │
│ - cities        │ │ - WaveSpeed     │ │ - images        │
│ - city_elements │ │                 │ │ - videos        │
│ - generated_*   │ │ Models:         │ │                 │
│ - knowledge_*   │ │ - GPT-5 Image   │ │                 │
│ - feedback      │ │ - Gemini Pro    │ │                 │
│ - cost_logs     │ │ - Sora 2/Pro    │ │                 │
│                 │ │ - VEO 3/Fast    │ │                 │
│                 │ │ - Claude        │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js 16 App Router | Server components, streaming, better DX |
| Supabase | PostgreSQL + Auth + Storage in one platform |
| OpenRouter | Unified API for multiple AI providers |
| Zustand | Lightweight state management with persistence |
| WaveSpeed API | Proxy for Sora/VEO video generation |

### Environment Requirements

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=           # Critical for DB writes
OPENROUTER_API_KEY=             # Multi-model AI
OPENAI_API_KEY=                 # Sora video generation

# Optional
WAVESPEED_API_KEY=              # VEO video generation
ANTHROPIC_API_KEY=              # Direct Claude access
PERPLEXITY_API_KEY=             # Dedicated research
```

---

## Feature Status Matrix

### Research & Intelligence

| Feature | Status | Notes |
|---------|--------|-------|
| City Research Pipeline | ✅ Working | Fallback mode when no service key |
| Perplexity Integration | ✅ Working | Real-time web search |
| Element Type Categories | ✅ Working | 11 categories supported |
| Research Synthesis | ✅ Working | Claude summarization |
| Human-Readable Formatting | ✅ Working | Recently added |
| Element Approval Flow | ✅ Working | Thumbs up/down |
| Research Persistence | ⚠️ Partial | Requires SUPABASE_SERVICE_KEY |

### Content Generation

| Feature | Status | Notes |
|---------|--------|-------|
| Product Shots (5 types) | ✅ Working | flat-front, flat-back, ghost, hanging, macro |
| Lifestyle Photography | ✅ Working | Scene-based generation |
| Video - Sora | ⚠️ Partial | Job tracking improved, some stuck jobs |
| Video - VEO | ⚠️ Partial | Job tracking improved, status polling |
| Caption Generation | ✅ Working | Platform-specific |
| Video Script Generation | ✅ Working | |
| Multi-Model A/B Testing | ✅ Working | Comparison viewer |

### Content Management

| Feature | Status | Notes |
|---------|--------|-------|
| Asset Gallery | ✅ Working | Grid view with filters |
| Asset Detail Modal | ✅ Working | Recently fixed |
| Asset Approval Flow | ✅ Working | Approve/Reject/Regenerate |
| Drops Assignment | ✅ Working | via output_metadata.drop_id |
| Export Functionality | ⚠️ Partial | ZIP download needs work |

### Knowledge Base

| Feature | Status | Notes |
|---------|--------|-------|
| Sneaker Database | ✅ Working | 6-tier system |
| Model Specs | ✅ Working | Demographics + styling |
| Style Slots | ✅ Working | Clothing combinations |
| Competitor Analysis | ✅ Working | 4-tier system |
| Learning Insights | ✅ Working | Feedback-driven |

### UI/UX

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard | ✅ Working | Compact layout |
| City Detail Page | ✅ Working | Full research + generation |
| Drops Page | ✅ Working | Asset management |
| AI Chat Assistant | ✅ Working | Context-aware |
| Mobile Responsive | ⚠️ Partial | Desktop-first design |

---

## What's Working

### 1. Research Pipeline
The city research system successfully:
- Queries Perplexity for real-time cultural intelligence
- Parses responses into structured elements (slang, landmarks, sports, etc.)
- Displays human-readable titles and descriptions
- Supports approval/rejection workflow
- Has fallback mode for viewing without persistence

### 2. Image Generation
Product and lifestyle shot generation is reliable:
- Multiple shot types (flat-front, flat-back, ghost, hanging, macro)
- Aspect ratio control
- City-context injection into prompts
- Dual-model generation option
- Proper storage and database tracking

### 3. Chat Assistant
The AI assistant provides:
- Context-aware responses based on current page/city
- Conversation persistence across sessions
- Quick prompt suggestions
- Research summary capability

### 4. Dashboard & Navigation
- Clean, functional UI with glassmorphism design
- City selector with search
- Budget tracking display
- Recent assets gallery
- Suggested ideas section

### 5. Drops Workflow
Complete workflow for:
- Viewing approved assets by city
- Asset preview with detail modal
- Drop scheduling
- Asset organization by type

---

## What's Not Working

### 1. Video Generation Reliability
**Problem**: Video jobs frequently get stuck in "processing" status.

**Root Cause**:
- Job IDs weren't being stored in `output_metadata`
- Status polling couldn't find jobs to update
- No automatic retry mechanism

**Partial Fix Applied**:
- Now storing `job_id`, `provider`, `asset_type`, `started_at` in metadata
- Created `/api/generate/video/retry-stuck` endpoint
- Marked unrecoverable jobs as failed

**Still Needed**:
- Automatic retry on transient failures
- Better error messaging to users
- Webhook-based status updates

### 2. Database Writes Without Service Key
**Problem**: Many operations silently fail without SUPABASE_SERVICE_KEY.

**Impact**:
- Research doesn't persist
- Cost tracking incomplete
- Some API routes return 400 errors

**Workaround**: Fallback modes show data but warn about non-persistence.

### 3. Export Functionality
**Problem**: ZIP export for assets not fully implemented.

**Status**: API endpoint exists but needs completion.

### 4. Mobile Responsiveness
**Problem**: UI is desktop-first, mobile experience is poor.

**Impact**: Chat dock hidden on mobile, forms cramped.

---

## Recent Fixes & Changes

### Session: January 25, 2026

#### 1. Research Data Not Rendering (Fixed)
**Problem**: After "Start Research", no data appeared in UI.

**Solution**:
- Created fallback research mode in `/api/cities/[cityId]/research/route.ts`
- API now returns elements directly when service key unavailable
- City page handles both database-fetched and API-returned elements

#### 2. View Full Modal Not Working (Fixed)
**Problem**: "View Full" button opened new tab instead of modal.

**Solution**:
- Changed from `window.open()` to `setPreviewAsset(asset)`
- Added `AssetDetailModal` rendering in city and drops pages
- Modal now shows full asset details with download option

#### 3. Approved Assets Not Showing in Drops (Fixed)
**Problem**: Variable declaration order error in drops page.

**Solution**:
- Reordered useMemo declarations (`dropAssets` before `dropCities`)
- Fixed TypeScript compilation errors

#### 4. Dashboard Layout Improvements (Fixed)
**Problem**: Two-column layout was cramped, budget section too large.

**Solution**:
- Changed to single-column stacked layout
- Made budget section a compact single row with progress bar
- Improved visual hierarchy

#### 5. Video Jobs Stuck in Processing (Fixed)
**Problem**: 7+ videos stuck with no way to retry or fail them.

**Solution**:
- Added `job_id` storage in `output_metadata` for new generations
- Created `/api/generate/video/retry-stuck` endpoint
- Manually marked unrecoverable jobs as failed

#### 6. AI Assistant Text Overflow (Fixed)
**Problem**: Long prompts and messages overflowed containers.

**Solution**:
- Changed quick prompts to vertical stack with `break-words`
- Split header buttons into two rows
- Added `whitespace-pre-wrap break-words` to message content

#### 7. Research Insights Formatting (Fixed)
**Problem**: Raw JSON and internal fields displayed to users.

**Solution**:
- Added `formatElementTitle()` - extracts human-readable names
- Added `formatElementBody()` - extracts descriptions with meta info
- Added `HIDDEN_ELEMENT_FIELDS` to filter `query`, `search_query`

---

## Persisting Issues

### Critical

| Issue | Impact | Workaround |
|-------|--------|------------|
| Service key required for writes | Data loss risk | Must set SUPABASE_SERVICE_KEY |
| Video jobs can still get stuck | User frustration | Manual retry via API |

### High Priority

| Issue | Impact | Workaround |
|-------|--------|------------|
| No auth system | Security risk | Currently open access |
| RLS policies may block writes | Silent failures | Use service key |
| Cost tracking incomplete | Budget overruns | Manual monitoring |

### Medium Priority

| Issue | Impact | Workaround |
|-------|--------|------------|
| Mobile UX poor | Limited mobile use | Use desktop |
| Export not complete | Manual downloads | Download individually |
| No image editing | Limited refinement | Regenerate |

### Low Priority

| Issue | Impact | Workaround |
|-------|--------|------------|
| Some unused components | Code bloat | None needed |
| Mock data still present | Confusion | Ignore |

---

## Challenges Encountered

### 1. Supabase RLS (Row-Level Security)
**Challenge**: RLS policies blocked writes from the anon key.

**Impact**: All database writes failed silently or returned errors.

**Solution**:
- Created `supabaseAdmin.ts` with service role client
- Added `hasServiceKey` check to conditionally use admin client
- Created fallback modes for read-only scenarios

**Lesson**: Always test with actual RLS policies, not just admin access.

### 2. Video Generation Async Nature
**Challenge**: Video APIs return job IDs, not completed videos.

**Impact**:
- Need polling mechanism for status
- Jobs can timeout or fail without notification
- No webhook support from providers

**Solution**:
- Implemented polling with configurable intervals
- Store job metadata for later retrieval
- Created retry mechanism for stuck jobs

**Lesson**: Async workflows need robust state management and error recovery.

### 3. Multiple AI Provider Integration
**Challenge**: Each AI provider has different APIs, rate limits, costs.

**Impact**:
- Complex abstraction layer needed
- Different error handling per provider
- Cost tracking varies by model

**Solution**:
- OpenRouter as unified gateway for most models
- WaveSpeed as proxy for video generation
- Centralized cost calculation in API routes

**Lesson**: Unified APIs (OpenRouter) significantly reduce complexity.

### 4. Type Safety Across Stack
**Challenge**: Database types, API responses, and UI components need alignment.

**Impact**:
- Runtime errors from type mismatches
- Difficult refactoring

**Solution**:
- Generated types from Supabase schema (`types/database.ts`)
- Strict TypeScript configuration
- Runtime validation where needed

**Lesson**: Invest in type generation early.

### 5. Research Data Normalization
**Challenge**: Perplexity returns unstructured text, need structured data.

**Impact**:
- Inconsistent element quality
- Manual parsing errors
- Missing required fields

**Solution**:
- Claude synthesis step for normalization
- Minimum validation (5 slang, 5 landmarks, 3 sports)
- Fallback values for missing fields

**Lesson**: AI-to-AI pipelines (research → synthesis) need careful prompting.

---

## Data Model

### Core Tables

```
cities
├── id (UUID, PK)
├── name, state, country
├── status (draft|active|archived|researching|ready|error)
├── research fields (nicknames, area_codes, landmarks, etc.)
├── visual_identity (JSON)
├── sports_teams (JSON)
├── slang (JSON array)
└── timestamps

city_elements
├── id (UUID, PK)
├── city_id (FK → cities)
├── element_type (slang|landmark|sport|cultural|visual_identity|...)
├── element_key
├── element_value (JSON)
├── status (approved|rejected|pending)
└── timestamps

generated_content
├── id (UUID, PK)
├── city_id (FK → cities)
├── content_type (image|video)
├── output_url
├── prompt, model, status
├── output_metadata (JSON - includes job_id, drop_id, etc.)
├── generation_cost_cents
└── timestamps
```

### Knowledge Base Tables

```
sneakers (6-tier system)
model_specs (demographics + styling)
style_slots (clothing combinations)
competitors (4-tier competitive analysis)
learnings (feedback-driven insights)
```

### Tracking Tables

```
cost_logs (API cost tracking)
feedback (user ratings: fire|good|mid|miss)
generation_queue (job management)
```

---

## API Reference

### City Management
- `GET/POST /api/cities` - List/create cities
- `GET/PATCH/DELETE /api/cities/[cityId]` - Single city operations
- `GET/PATCH /api/cities/[cityId]/elements` - City elements
- `POST /api/cities/[cityId]/research` - Trigger research

### Content Generation
- `POST /api/generate/product-shot` - Product photography
- `POST /api/generate/lifestyle-shot` - Lifestyle photography
- `POST /api/generate/video/sora` - Sora video generation
- `POST /api/generate/video/veo` - VEO video generation
- `GET /api/generate/video/[provider]/status` - Check video status
- `POST /api/generate/video/retry-stuck` - Retry failed videos

### Content Management
- `GET/POST/PATCH /api/generated-content` - CRUD for generated assets
- `POST /api/feedback` - Submit generation feedback
- `GET/POST /api/analytics` - Usage analytics

### Chat
- `POST /api/chat` - AI chat with context

---

## Recommendations & Next Steps

### Immediate (This Week)

1. **Add Authentication**
   - Implement Supabase Auth
   - Protect API routes
   - Add user context to generations

2. **Video Reliability**
   - Add automatic retry with exponential backoff
   - Implement maximum retry count
   - Add user-facing status indicators

3. **Error Handling**
   - Add toast notifications for API errors
   - Improve error messages
   - Add retry buttons in UI

### Short-Term (This Month)

4. **Complete Export**
   - Implement ZIP download for bulk assets
   - Add metadata export (JSON/CSV)

5. **Mobile Optimization**
   - Responsive layouts for key pages
   - Mobile-friendly chat interface

6. **Cost Dashboard**
   - Real-time cost tracking UI
   - Budget alerts
   - Per-city cost breakdown

### Medium-Term (Next Quarter)

7. **Workflow Automation**
   - Scheduled research updates
   - Auto-generation from approved concepts
   - Publishing pipeline to social

8. **Quality Improvements**
   - Image editing (crop, adjust)
   - Video trimming
   - Prompt refinement suggestions

9. **Analytics & Learning**
   - Win rate dashboard
   - Model performance comparison
   - Feedback-driven prompt optimization

---

## Appendix

### A. Environment Setup

```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...  # CRITICAL - enables DB writes
OPENROUTER_API_KEY=sk-or-...
OPENAI_API_KEY=sk-...

# Optional
WAVESPEED_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
```

### B. Deployment

Currently deployed to Vercel:
- Production: https://tmh-ai-content-engine.vercel.app
- Branch: `ui-redesign`

### C. Key File Locations

```
/src/app/api/cities/[cityId]/research/route.ts  - Research pipeline
/src/app/cities/[cityId]/page.tsx               - City detail page
/src/app/drops/[dropId]/page.tsx                - Drops management
/src/lib/video-generation.ts                    - Video generation
/src/lib/research.ts                            - Research synthesis
/src/components/AssetDetailModal.tsx            - Asset preview
```

### D. Testing Endpoints

```bash
# Test database connectivity
curl https://tmh-ai-content-engine.vercel.app/api/debug/database

# Test OpenRouter
curl -X POST https://tmh-ai-content-engine.vercel.app/api/debug/test-openrouter

# List stuck videos
curl https://tmh-ai-content-engine.vercel.app/api/generate/video/retry-stuck
```

---

**Document maintained by**: Development Team
**Last deployment**: January 25, 2026
**Next review**: February 1, 2026
