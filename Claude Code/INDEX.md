# TMH Dashboard - Claude Code Workspace Index

## 📂 File Organization

This workspace contains all development work for the TMH (That's My Hoodie) Dashboard project.

---

## 📚 Documentation (Read These First)

### Start Here
1. **[README.md](README.md)** - Complete project overview
   - What is TMH Dashboard?
   - Tech stack overview
   - Project architecture
   - Development workflow

2. **[QUICK_START.md](QUICK_START.md)** - Developer quick reference
   - Get started in 30 seconds
   - File locations
   - Component breakdown
   - Common issues & fixes
   - Pro tips

### Progress Tracking
3. **[BUILD_PROGRESS.md](BUILD_PROGRESS.md)** - Detailed progress tracker
   - Phase-by-phase completion status
   - Current phase details
   - Next immediate steps
   - Comprehensive checklist

4. **[SESSION_SUMMARY.md](SESSION_SUMMARY.md)** - Latest session summary
   - What was accomplished
   - Statistics & metrics
   - Decisions made
   - Next steps

### Reference Documents (In Parent Directory)
Located at `/Users/greenmachine2.0/TMH/`:
- `TMH_Knowledge_Base_Schema_Supabase.md` - Database schema
- `TMH_Master_Prompt_Library.md` - AI prompts
- `TMH_n8n_Workflow_Architecture.md` - Workflow designs
- `TMH_Frontend_Requirements_Specs.md` - UI specifications
- `TMH_Reddit_Integration_Strategy.md` - Social strategy

---

## 🏗️ Project Structure

### Main Application
```
tmh-dashboard/                  # Next.js 15 application
├── src/
│   ├── types/
│   │   └── index.ts           ✅ 44 TypeScript interfaces (467 lines)
│   │
│   ├── lib/
│   │   ├── mockData.ts        ✅ Comprehensive mock data (1,121 lines)
│   │   ├── api/               ⏳ API layer (Phase 4)
│   │   └── utils/             ⏳ Utility functions
│   │
│   ├── components/
│   │   ├── shared/            ⏳ LoadingSpinner, ImageSkeleton, etc.
│   │   ├── city/              ⏳ CitySelector, ConceptInput
│   │   ├── image/             ⏳ ImageGallery
│   │   ├── approval/          ⏳ ApprovalInterface
│   │   └── reddit/            ⏳ RedditPostManager, AnalyticsDashboard
│   │
│   ├── stores/                ⏳ Zustand state stores (Phase 2)
│   │
│   └── app/                   # Next.js App Router pages
│       ├── cities/            ⏳ City management pages
│       ├── generate/          ⏳ Image generation page
│       ├── approve/           ⏳ Design approval page
│       ├── reddit/            ⏳ Reddit management pages
│       ├── library/           ⏳ Design library
│       └── settings/          ⏳ App settings
│
├── .env.local                 ✅ Environment variables (template ready)
├── .env.example               ✅ Environment template
├── package.json               ✅ Dependencies configured
├── tsconfig.json              ✅ TypeScript configured
└── tailwind.config.ts         ✅ Tailwind configured
```

---

## ✅ Current Status

**Phase:** 1 - Frontend UI Shell (In Progress)
**Progress:** 15% of total project complete
**Last Updated:** November 14, 2024

### Completed ✅
- Phase 0: Project setup and configuration
- Phase 1 (Partial): TypeScript types and mock data

### In Progress 🔄
- Phase 1: Building UI components

### Not Started ⏳
- Phase 2: Supabase integration
- Phase 3: n8n workflows
- Phase 4: Frontend-backend connection
- Phase 5: Polish and deploy

---

## 🎯 Quick Access

### Essential Commands
```bash
# Navigate to project
cd "/Users/greenmachine2.0/TMH/Claude Code/tmh-dashboard"

# Start development
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint code
npm run lint
```

### Key URLs
- **Dev Server:** http://localhost:3000
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Lucide Icons:** https://lucide.dev
- **Recharts:** https://recharts.org

---

## 📊 Project Statistics

### Code Written (So Far)
- **TypeScript:** 467 lines of type definitions
- **Mock Data:** 1,121 lines of sample data
- **Total:** 1,588 lines of production code
- **Documentation:** ~21,000 words

### Data Created
- Cities: 3 (Seattle, Detroit, Chicago)
- Landmarks: 9 (3 per city)
- Cultural elements: 12 (4 per city)
- Design concepts: 9 (3 per city)
- Generated images: 12 (mock)
- Reddit posts: 4
- Reddit comments: 11
- Prompt templates: 5

---

## 🎨 Component Development Order

### Phase 1A: Shared Components (Next)
1. LoadingSpinner
2. ImageSkeleton
3. ErrorMessage
4. EmptyState

### Phase 1B: Feature Components
5. CitySelector
6. ConceptInput
7. ImageGallery
8. ApprovalInterface
9. RedditPostManager
10. AnalyticsDashboard

### Phase 1C: Pages & Navigation
11. Navigation component
12. All main pages
13. Full flow testing

---

## 💡 Development Tips

### For Your Next Session
1. **Read:** [QUICK_START.md](QUICK_START.md) first
2. **Start:** Build shared components
3. **Test:** Create test pages as you go
4. **Reference:** Use [src/types/index.ts](tmh-dashboard/src/types/index.ts) for types
5. **Data:** Import from [src/lib/mockData.ts](tmh-dashboard/src/lib/mockData.ts)

### Best Practices
- Build one component at a time
- Test immediately after building
- Use TypeScript types for everything
- Keep components simple and focused
- Mobile-first responsive design
- Document as you go

---

## 🔄 Update This Index

After each significant session:
1. Update progress percentages
2. Mark completed items with ✅
3. Update "Last Updated" date
4. Add new files to structure
5. Update statistics

---

## 📞 Need Help?

### Stuck? Check These
1. [QUICK_START.md](QUICK_START.md) - Common issues
2. [BUILD_PROGRESS.md](BUILD_PROGRESS.md) - Current phase details
3. [SESSION_SUMMARY.md](SESSION_SUMMARY.md) - Latest work
4. Component test pages - Isolated testing

### Debugging
- Check TypeScript errors: `npm run type-check`
- Check console: Browser DevTools (F12)
- Restart dev server: Ctrl+C, then `npm run dev`
- Clear cache: Delete `.next/` folder

---

## 🎯 End Goal

**Vision:** A fully automated system that:
1. Generates city-themed hoodie designs using AI
2. Posts designs to Reddit for community feedback
3. Analyzes sentiment and preferences
4. Identifies winning designs for production
5. Scales to multiple cities nationwide

**Current Phase:** Building the UI to visualize this entire system

**Next Milestone:** Complete all components with mock data (Phase 1)

---

## 🚀 Let's Build!

**Ready to continue?**

```bash
cd "/Users/greenmachine2.0/TMH/Claude Code/tmh-dashboard"
npm run dev
```

Then start with the shared components in [QUICK_START.md](QUICK_START.md)!

---

*This index is your navigation hub. Bookmark this file!*

**Location:** `/Users/greenmachine2.0/TMH/Claude Code/INDEX.md`
**Last Updated:** November 14, 2024
**Maintained By:** Claude Code Build Assistant
