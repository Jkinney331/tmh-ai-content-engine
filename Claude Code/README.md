# TMH Dashboard - That's My Hoodie Creative Automation System

## 🎯 Project Overview

**TMH Dashboard** is a comprehensive creative automation platform that:
1. Generates AI-powered city-themed hoodie designs
2. Validates designs through Reddit community feedback
3. Analyzes market response to identify winning designs
4. Automates the entire design-to-market validation pipeline

## 📁 Project Structure

```
Claude Code/
├── tmh-dashboard/              # Main Next.js application
│   ├── src/
│   │   ├── types/              # TypeScript type definitions
│   │   ├── lib/                # Utilities and mock data
│   │   ├── components/         # React components
│   │   │   ├── shared/         # Reusable UI components
│   │   │   ├── city/           # City selection & concept input
│   │   │   ├── image/          # Image gallery & management
│   │   │   ├── approval/       # Design approval workflow
│   │   │   └── reddit/         # Reddit posting & analytics
│   │   ├── stores/             # Zustand state management
│   │   ├── app/                # Next.js 15 App Router pages
│   │   │   ├── cities/         # City management
│   │   │   ├── generate/       # Image generation
│   │   │   ├── approve/        # Design approval
│   │   │   ├── reddit/         # Reddit management
│   │   │   ├── library/        # Design library
│   │   │   └── settings/       # App settings
│   ├── .env.local              # Environment variables (git-ignored)
│   └── .env.example            # Environment template
├── BUILD_PROGRESS.md           # Detailed build progress tracker
└── README.md                   # This file
```

## 🚀 What's Been Built So Far

### ✅ Phase 0: Project Foundation (COMPLETE)
- Next.js 15 project with TypeScript
- TailwindCSS for styling
- All required dependencies installed
- Complete folder structure
- Environment configuration

### ✅ Phase 1 (Partial): TypeScript & Data Foundation (COMPLETE)
1. **Type System** - [src/types/index.ts](tmh-dashboard/src/types/index.ts)
   - 44 comprehensive TypeScript interfaces
   - Full type safety across the application
   - Covers: Cities, Designs, Images, Reddit, Analytics, API, Stores

2. **Mock Data** - [src/lib/mockData.ts](tmh-dashboard/src/lib/mockData.ts)
   - 3 complete cities (Seattle, Detroit, Chicago)
   - Full city contexts with landmarks, culture, catchphrases
   - 12 generated images across different cities
   - 9 design concepts
   - 4 Reddit posts with varying statuses
   - 11 Reddit comments with sentiment analysis
   - Complete analytics dashboard data
   - 5 prompt templates for different styles

## 💡 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Data Fetching:** React Query
- **Icons:** Lucide React
- **Charts:** Recharts
- **Date Handling:** date-fns

### Backend (To Be Integrated)
- **Database:** Supabase (PostgreSQL)
- **Automation:** n8n workflows
- **AI:** OpenRouter (Flux Pro, DALL-E 3, Midjourney)
- **Social:** Reddit API
- **Storage:** Supabase Storage

## 📊 Sample Data Overview

### Cities
- **Seattle (206)** - Coffee culture, grunge, tech innovation
- **Detroit (313)** - Motor City, Motown, automotive heritage
- **Chicago (312)** - Architecture, deep dish, blues music

### Design Concepts per City
- **Minimalist designs** - Clean, modern aesthetics
- **Vintage/Retro designs** - Nostalgic, heritage-focused
- **Bold graphic designs** - Eye-catching, statement pieces
- **Urban streetwear** - Authentic city culture

### Mock Generated Images
- 12 AI-generated designs across all cities
- Various approval statuses (pending, approved, rejected)
- Different AI models (Flux Pro, DALL-E 3, Midjourney)
- Complete metadata (prompts, params, timestamps)

### Reddit Integration Data
- Posts in different states (queued, posted, archived)
- Comments with sentiment analysis (positive/neutral/negative)
- Design preference tracking (design 1 vs 2)
- Engagement metrics (upvotes, comment counts)

## 🎨 Component Architecture

### Planned Components (Next Steps)

#### Shared Components
- `LoadingSpinner` - Animated loading indicator
- `ImageSkeleton` - Loading placeholder for images
- `ErrorMessage` - Error display with retry
- `EmptyState` - Empty state with call-to-action

#### Feature Components
1. **CitySelector** - Dropdown with search, showing city + area code
2. **ConceptInput** - Large textarea with suggestion chips
3. **ImageGallery** - Grid with selection, filters, lightbox
4. **ApprovalInterface** - Side-by-side comparison, Reddit config
5. **RedditPostManager** - Post table with comments, status badges
6. **AnalyticsDashboard** - Charts, tables, performance metrics

## 🔄 Development Workflow

### Current Phase: Building UI Components
```bash
# Navigate to project
cd "/Users/greenmachine2.0/TMH/Claude Code/tmh-dashboard"

# Start dev server
npm run dev

# Open browser to http://localhost:3000
```

### Build Order
1. ✅ **Phase 0:** Project setup
2. 🔄 **Phase 1:** UI Shell with mock data (25% complete)
3. ⏳ **Phase 2:** Supabase database integration
4. ⏳ **Phase 3:** n8n workflow automation
5. ⏳ **Phase 4:** Connect frontend to backend
6. ⏳ **Phase 5:** Polish and deploy

## 🎯 Next Immediate Steps

1. Build shared UI components (LoadingSpinner, etc.)
2. Build CitySelector component
3. Build ConceptInput component
4. Build ImageGallery component
5. Build ApprovalInterface component
6. Build RedditPostManager component
7. Build AnalyticsDashboard component
8. Create all main pages with navigation
9. Test full UI flow with mock data

## 📝 Environment Variables

Create a `.env.local` file with:

```bash
# Supabase (to be filled in Phase 2)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# n8n Webhooks (to be filled in Phase 3)
NEXT_PUBLIC_N8N_WEBHOOK_URL=your-n8n-webhook-url

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🧪 Testing Strategy

### Phase 1 (Current)
- Test each component in isolation with mock data
- Create test pages for each component
- Verify full user flow works with mock data

### Phase 2-4
- Test Supabase queries
- Test n8n workflow triggers
- End-to-end integration testing

### Phase 5
- Performance testing
- Mobile responsiveness
- Cross-browser testing
- Production deployment testing

## 📚 Reference Documents

Located in parent TMH directory:
1. `TMH_Knowledge_Base_Schema_Supabase.md` - Database schema
2. `TMH_Master_Prompt_Library.md` - AI prompts
3. `TMH_n8n_Workflow_Architecture.md` - Workflow designs
4. `TMH_Frontend_Requirements_Specs.md` - UI specifications
5. `TMH_Reddit_Integration_Strategy.md` - Social strategy

## 🚧 Known Limitations

### Current (Phase 1)
- No actual image generation (using placeholders)
- No database persistence (in-memory only)
- No Reddit integration (mock posts/comments)
- No actual workflow automation

### Will Be Resolved
- Phase 2: Real database with Supabase
- Phase 3: Actual AI image generation via n8n
- Phase 3: Real Reddit posting and monitoring
- Phase 4: Full end-to-end automation

## 🤝 Contributing

This is a solo entrepreneur project. The systematic build approach ensures:
- Each phase can be tested independently
- Easy to track progress
- Clear rollback points if needed
- Demonstrable prototypes at each stage

## 📊 Project Timeline

- **Phase 0:** ✅ 30 minutes (Complete)
- **Phase 1:** 🔄 4-6 hours (25% complete)
- **Phase 2:** ⏳ 2-3 hours (Not started)
- **Phase 3:** ⏳ 4-6 hours (Not started)
- **Phase 4:** ⏳ 2-3 hours (Not started)
- **Phase 5:** ⏳ 2-3 hours (Not started)

**Total Estimated Time:** 15-22 hours
**Time Invested:** ~2 hours
**Progress:** 15% complete

## 🎓 Learning Outcomes

This project demonstrates:
- Modern Next.js 15 App Router patterns
- TypeScript best practices
- State management with Zustand
- AI integration strategies
- Reddit API integration
- n8n workflow automation
- Full-stack application architecture
- Database design with Supabase
- End-to-end testing strategies

## 📞 Support

For issues or questions:
- Review the BUILD_PROGRESS.md file
- Check reference documents in parent directory
- Refer to inline code comments
- Review TypeScript types for data structures

---

**Status:** Active Development
**Last Updated:** 2024-11-14
**Version:** 0.1.0 (Phase 1 in progress)
