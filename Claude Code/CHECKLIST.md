# TMH Dashboard - Development Checklist

## 📋 Complete Project Checklist

Track your progress through all phases of development.

---

## Phase 0: Project Setup ✅ COMPLETE

- [x] Initialize Next.js 15 project with TypeScript
- [x] Install all required dependencies
- [x] Create folder structure
- [x] Set up environment variables (.env.local, .env.example)
- [x] Configure Tailwind CSS
- [x] Configure ESLint
- [x] Git repository initialized

**Status:** ✅ 100% Complete | **Time:** 30 minutes

---

## Phase 1: Frontend UI Shell with Mock Data 🔄 IN PROGRESS

### 1.1 Foundation ✅ COMPLETE

- [x] Create TypeScript type definitions (src/types/index.ts)
- [x] Create comprehensive mock data (src/lib/mockData.ts)
- [x] Verify types work with mock data

**Status:** ✅ 100% Complete | **Time:** ~1 hour

### 1.2 Shared Components ⏳ PENDING

- [ ] Create LoadingSpinner.tsx
  - [ ] Component file created
  - [ ] Animated spinner implemented
  - [ ] Multiple size variants
  - [ ] Test page created

- [ ] Create ImageSkeleton.tsx
  - [ ] Component file created
  - [ ] Skeleton animation
  - [ ] Grid layout support
  - [ ] Test page created

- [ ] Create ErrorMessage.tsx
  - [ ] Component file created
  - [ ] Error display with icon
  - [ ] Retry button
  - [ ] Test page created

- [ ] Create EmptyState.tsx
  - [ ] Component file created
  - [ ] Icon + title + description
  - [ ] Call-to-action button
  - [ ] Test page created

**Status:** ⏳ 0% Complete | **Est. Time:** 30-45 minutes

### 1.3 City Components ⏳ PENDING

- [ ] Create CitySelector.tsx
  - [ ] Component file created
  - [ ] Dropdown with search
  - [ ] Display format: "City (Area Code)"
  - [ ] Active state styling
  - [ ] Uses mockCities data
  - [ ] Test page created
  - [ ] Desktop responsive
  - [ ] Mobile responsive

- [ ] Create ConceptInput.tsx
  - [ ] Component file created
  - [ ] Large textarea (Gemini-style)
  - [ ] Suggestion chips from cultural elements
  - [ ] Sidebar with existing concepts
  - [ ] Generate button with validation
  - [ ] Uses mockCityContexts, mockDesignConcepts
  - [ ] Test page created
  - [ ] Desktop responsive
  - [ ] Mobile responsive

**Status:** ⏳ 0% Complete | **Est. Time:** 2 hours

### 1.4 Image Components ⏳ PENDING

- [ ] Create ImageGallery.tsx
  - [ ] Component file created
  - [ ] Grid layout (responsive)
  - [ ] Hover to show metadata
  - [ ] Selection mode (none/single/multiple)
  - [ ] Selection checkboxes
  - [ ] Filter by approval status
  - [ ] Approval status badges
  - [ ] Lightbox modal on click
  - [ ] Loading state with ImageSkeleton
  - [ ] Empty state with EmptyState
  - [ ] Uses mockGeneratedImages
  - [ ] Test page created
  - [ ] Desktop responsive
  - [ ] Mobile responsive

**Status:** ⏳ 0% Complete | **Est. Time:** 1.5 hours

### 1.5 Approval Components ⏳ PENDING

- [ ] Create ApprovalInterface.tsx
  - [ ] Component file created
  - [ ] Side-by-side comparison view
  - [ ] Image selector sidebar (uses ImageGallery)
  - [ ] Preview pane (60% of screen)
  - [ ] Reddit post configuration form
    - [ ] Subreddit input
    - [ ] Post title input
    - [ ] Post body textarea
    - [ ] Schedule time picker
  - [ ] Submit button (disabled until 2 images selected)
  - [ ] Validation logic
  - [ ] Uses mockGeneratedImages
  - [ ] Test page created
  - [ ] Desktop responsive
  - [ ] Mobile responsive

**Status:** ⏳ 0% Complete | **Est. Time:** 1.5 hours

### 1.6 Reddit Components ⏳ PENDING

- [ ] Create RedditPostManager.tsx
  - [ ] Component file created
  - [ ] Table/card view toggle
  - [ ] Status badges (queued/posted/archived)
  - [ ] Expandable comments section
  - [ ] Comment sentiment color coding
  - [ ] Post details:
    - [ ] City name
    - [ ] Subreddit
    - [ ] Post title
    - [ ] Status
    - [ ] Scheduled time (if queued)
    - [ ] Upvotes & comments (if posted)
    - [ ] Reddit link
  - [ ] Filter by status
  - [ ] Uses mockRedditPosts, mockRedditComments
  - [ ] Test page created
  - [ ] Desktop responsive
  - [ ] Mobile responsive

- [ ] Create AnalyticsDashboard.tsx
  - [ ] Component file created
  - [ ] Performance metric cards
    - [ ] Total posts
    - [ ] Total comments
    - [ ] Avg engagement
  - [ ] City-by-city performance table
  - [ ] Top performing designs list
  - [ ] Sentiment breakdown pie chart (recharts)
  - [ ] Design preference bar chart (recharts)
  - [ ] Date range filter (UI only)
  - [ ] Uses mockAnalyticsDashboard
  - [ ] Test page created
  - [ ] Desktop responsive
  - [ ] Mobile responsive

**Status:** ⏳ 0% Complete | **Est. Time:** 2.5 hours

### 1.7 Navigation & Layout ⏳ PENDING

- [ ] Create Navigation.tsx
  - [ ] Component file created
  - [ ] Logo/branding
  - [ ] Navigation links to all pages
  - [ ] Active state styling
  - [ ] Mobile hamburger menu
  - [ ] Desktop sidebar/header

- [ ] Update app/layout.tsx
  - [ ] Add Navigation component
  - [ ] Global styles
  - [ ] Metadata
  - [ ] Mobile responsive

**Status:** ⏳ 0% Complete | **Est. Time:** 1 hour

### 1.8 Main Pages ⏳ PENDING

- [ ] Create app/page.tsx (Homepage/Dashboard)
  - [ ] Recent activity section
  - [ ] Quick stats cards
  - [ ] Links to main sections
  - [ ] Uses AnalyticsDashboard component

- [ ] Create app/cities/page.tsx (City List)
  - [ ] Grid of city cards
  - [ ] Uses CitySelector component
  - [ ] Click to navigate to city detail

- [ ] Create app/cities/[cityId]/page.tsx (City Detail)
  - [ ] City context display
  - [ ] ConceptInput component
  - [ ] Recent generations (ImageGallery filtered)

- [ ] Create app/generate/page.tsx (Generation Interface)
  - [ ] CitySelector at top
  - [ ] ConceptInput component
  - [ ] Generate button
  - [ ] ImageGallery below (shows mock results)

- [ ] Create app/approve/page.tsx (Approval Workflow)
  - [ ] ApprovalInterface component

- [ ] Create app/reddit/page.tsx (Reddit Management)
  - [ ] RedditPostManager component

- [ ] Create app/reddit/analytics/page.tsx (Analytics)
  - [ ] AnalyticsDashboard component

**Status:** ⏳ 0% Complete | **Est. Time:** 2 hours

### 1.9 Polish & Testing ⏳ PENDING

- [ ] Consistent styling across all pages
- [ ] Loading states on all buttons
- [ ] Hover effects and transitions
- [ ] Responsive design verified
  - [ ] Desktop (1920px)
  - [ ] Laptop (1280px)
  - [ ] Tablet (768px)
  - [ ] Mobile (375px)
- [ ] Proper spacing and typography
- [ ] Full user flow test:
  - [ ] Navigate to /generate
  - [ ] Select a city
  - [ ] Enter concept
  - [ ] See "generated" images
  - [ ] Navigate to /approve
  - [ ] Select 2 images
  - [ ] Configure Reddit post
  - [ ] Submit (shows success)
  - [ ] Navigate to /reddit
  - [ ] See "queued" post
  - [ ] Navigate to /reddit/analytics
  - [ ] See analytics dashboard

**Status:** ⏳ 0% Complete | **Est. Time:** 1 hour

**Phase 1 Overall:** 🔄 25% Complete | **Est. Remaining:** 10-12 hours

---

## Phase 2: Supabase Integration ⏳ NOT STARTED

### 2.1 Supabase Setup

- [ ] Create Supabase account
- [ ] Create new project: "tmh-dashboard"
- [ ] Copy project URL and anon key
- [ ] Update .env.local with credentials

### 2.2 Database Schema

- [ ] Open Supabase SQL Editor
- [ ] Run schema from TMH_Knowledge_Base_Schema_Supabase.md
- [ ] Verify all 13 tables created
- [ ] Create storage buckets:
  - [ ] brand-assets
  - [ ] reference-images
  - [ ] generated-images
  - [ ] reddit-comparison-templates
- [ ] Create database functions:
  - [ ] get_city_context()
  - [ ] log_prompt_usage()

### 2.3 Seed Data

- [ ] Create scripts/seed.ts
- [ ] Insert 3 cities (Seattle, Detroit, Chicago)
- [ ] Insert landmarks (2-3 per city)
- [ ] Insert cultural elements (3-4 per city)
- [ ] Insert catchphrases (2-3 per city)
- [ ] Insert color palettes (1 per city)
- [ ] Insert design concepts (2-3 per city)
- [ ] Insert prompt templates (3-4 templates)
- [ ] Run seed script: npm run seed
- [ ] Verify data in Supabase Table Editor

### 2.4 Supabase Client

- [ ] Create src/lib/supabase.ts
- [ ] Configure Supabase client
- [ ] Test connection with simple query

### 2.5 Zustand Stores

- [ ] Create src/stores/cityStore.ts
  - [ ] fetchCities (query Supabase)
  - [ ] selectCity
  - [ ] fetchCityContext (call RPC function)
  - [ ] createCity

- [ ] Create src/stores/imageStore.ts
  - [ ] fetchImages (query generated_images)
  - [ ] selectImage
  - [ ] clearSelection
  - [ ] (approveImages will connect in Phase 3)

- [ ] Create src/stores/redditStore.ts
  - [ ] fetchPosts (query reddit_posts)
  - [ ] fetchComments (query reddit_comments)
  - [ ] fetchAnalytics (aggregate queries)

- [ ] Test each store in isolation

### 2.6 Connect Components

- [ ] Update CitySelector to use useCityStore()
- [ ] Update ConceptInput to use useCityStore()
- [ ] Update ImageGallery to use useImageStore()
- [ ] Update ApprovalInterface to use useImageStore()
- [ ] Update RedditPostManager to use useRedditStore()
- [ ] Update AnalyticsDashboard to use useRedditStore()
- [ ] Remove all mock data imports

### 2.7 End-to-End Testing

- [ ] Cities load from database
- [ ] City context shows real data
- [ ] All pages load without errors
- [ ] No console warnings

**Status:** ⏳ 0% Complete | **Est. Time:** 2-3 hours

---

## Phase 3: n8n Workflows ⏳ NOT STARTED

### 3.1 n8n Setup

- [ ] Set up n8n instance (cloud or self-hosted)
- [ ] Get webhook base URL
- [ ] Update .env.local with n8n URL

### 3.2 Workflow 1 - Knowledge Base Query

- [ ] Create workflow in n8n
- [ ] Add webhook trigger: POST /get-city-context
- [ ] Add validation node
- [ ] Add Supabase queries
- [ ] Add response formatter
- [ ] Test with curl
- [ ] Verify returns city context JSON

### 3.3 Workflow 2 - Image Generation Pipeline

- [ ] Create workflow in n8n
- [ ] Add webhook trigger: POST /generate-images
- [ ] Connect to WF1 for city context
- [ ] Add prompt template query
- [ ] Add prompt building logic
- [ ] Add OpenRouter API call
- [ ] Add image download
- [ ] Add Supabase storage upload
- [ ] Add database insert
- [ ] Test end-to-end
- [ ] Verify images saved to Supabase

### 3.4 Workflow 3 - Approval & Template Creation

- [ ] Create workflow in n8n
- [ ] Add webhook trigger: POST /approve-designs
- [ ] Add approval validation
- [ ] Add image fetching
- [ ] Add comparison template creation
- [ ] Add template upload to Supabase
- [ ] Add Reddit post record creation
- [ ] Connect to WF4
- [ ] Test approval flow

### 3.5 Workflow 4 - Reddit Posting & Monitoring

- [ ] Create workflow in n8n
- [ ] Subflow A - Posting:
  - [ ] Webhook/schedule trigger
  - [ ] Get post data
  - [ ] Check ready to post
  - [ ] Upload to Reddit
  - [ ] Update database
- [ ] Subflow B - Monitoring:
  - [ ] Schedule trigger (15 min)
  - [ ] Get active posts
  - [ ] Fetch comments
  - [ ] Analyze sentiment (OpenRouter)
  - [ ] Save to database
  - [ ] Update metrics
- [ ] Set up Reddit OAuth2
- [ ] Test with test subreddit

### 3.6 Workflow 5 - Data Aggregation & Analytics

- [ ] Create workflow in n8n
- [ ] Add schedule trigger (daily 2 AM)
- [ ] Add post aggregation queries
- [ ] Add metrics calculation
- [ ] Add insights generation
- [ ] Add database save (optional)
- [ ] Test manual trigger

### 3.7 Documentation

- [ ] Document all webhook URLs
- [ ] Update .env.local

**Status:** ⏳ 0% Complete | **Est. Time:** 4-6 hours

---

## Phase 4: Frontend-Backend Connection ⏳ NOT STARTED

### 4.1 API Layer

- [ ] Create src/lib/api/config.ts
- [ ] Create src/lib/api/client.ts (Axios)
- [ ] Create src/lib/api/cities.ts
- [ ] Create src/lib/api/images.ts
- [ ] Create src/lib/api/approvals.ts
- [ ] Create src/lib/api/reddit.ts

### 4.2 Connect Stores to API

- [ ] Update cityStore: fetchCityContext → n8n WF1
- [ ] Update imageStore: generateImages → n8n WF2
- [ ] Update imageStore: approveImages → n8n WF3
- [ ] Update redditStore: postToReddit → n8n WF4
- [ ] Add loading states
- [ ] Add error handling

### 4.3 Update Components

- [ ] ConceptInput: Generate button → calls API
- [ ] ApprovalInterface: Submit button → calls API
- [ ] RedditPostManager: Post Now button → calls API
- [ ] Add loading spinners
- [ ] Add success messages
- [ ] Add error messages

### 4.4 End-to-End Testing

- [ ] Full user journey test:
  - [ ] Select city
  - [ ] Enter concept
  - [ ] Generate images (real API call)
  - [ ] Wait for images to appear
  - [ ] Navigate to approval
  - [ ] Select 2 images
  - [ ] Configure Reddit post
  - [ ] Submit approval
  - [ ] See queued post
  - [ ] Post to Reddit
  - [ ] Verify on Reddit
  - [ ] See analytics update

**Status:** ⏳ 0% Complete | **Est. Time:** 2-3 hours

---

## Phase 5: Polish & Deploy ⏳ NOT STARTED

### 5.1 Error Handling

- [ ] Network errors handled
- [ ] Validation errors displayed
- [ ] Rate limiting handled
- [ ] Empty states work
- [ ] Loading states everywhere
- [ ] Test failure scenarios

### 5.2 User Feedback

- [ ] Add toast notifications library
- [ ] Success toasts for all actions
- [ ] Error toasts for failures
- [ ] Progress indicators for long operations
- [ ] Success animations
- [ ] Improve visual feedback

### 5.3 Mobile Responsive

- [ ] Navigation mobile-friendly
- [ ] All components tested on mobile
- [ ] Forms work on mobile
- [ ] Charts responsive
- [ ] Test on real devices

### 5.4 Performance

- [ ] Lazy load images
- [ ] Pagination/infinite scroll
- [ ] Debounce search inputs
- [ ] React Query caching
- [ ] Code splitting
- [ ] Bundle size optimization
- [ ] Lighthouse audit
- [ ] Fix performance issues

### 5.5 Deployment

- [ ] Push code to GitHub
- [ ] Connect repo to Netlify
- [ ] Configure build settings
- [ ] Add environment variables in Netlify
- [ ] Deploy to production
- [ ] Test production site
- [ ] Set up custom domain (optional)

### 5.6 Post-Launch

- [ ] Monitor n8n executions
- [ ] Monitor Supabase usage
- [ ] Check Reddit posts daily
- [ ] Review error logs
- [ ] Collect user feedback
- [ ] Plan iteration 2

**Status:** ⏳ 0% Complete | **Est. Time:** 2-3 hours

---

## 🏆 COMPLETION SUMMARY

### Overall Progress
- Phase 0: ✅ 100%
- Phase 1: 🔄 25%
- Phase 2: ⏳ 0%
- Phase 3: ⏳ 0%
- Phase 4: ⏳ 0%
- Phase 5: ⏳ 0%

**Total: 15% Complete**

### Time Investment
- Time spent: ~2 hours
- Time remaining: ~18-20 hours
- Total estimated: ~20-22 hours

---

## 📝 Notes

### Update This Checklist
Mark items as complete with [x] as you finish them.

### Track Your Time
Add actual time spent in each phase to refine estimates.

### Celebrate Milestones
- ✅ Phase 0 complete!
- 🎯 Next: Complete Phase 1
- 🏆 Future: Full system operational

---

**Last Updated:** November 14, 2024
**Next Update:** After completing shared components
