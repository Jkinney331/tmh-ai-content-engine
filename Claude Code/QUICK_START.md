# TMH Dashboard - Quick Start Guide

## 🚀 Get Started in 30 Seconds

```bash
# 1. Navigate to project
cd "/Users/greenmachine2.0/TMH/Claude Code/tmh-dashboard"

# 2. Start development server
npm run dev

# 3. Open browser
# Go to: http://localhost:3000
```

## 📂 File Locations

### Key Files You'll Work With

| File | Purpose | Status |
|------|---------|--------|
| `src/types/index.ts` | All TypeScript types | ✅ Done |
| `src/lib/mockData.ts` | Sample data for testing | ✅ Done |
| `src/components/shared/` | Reusable UI components | ⏳ Next |
| `src/components/city/` | City selection components | ⏳ Next |
| `src/components/image/` | Image gallery components | ⏳ Next |
| `src/components/approval/` | Approval workflow | ⏳ Next |
| `src/components/reddit/` | Reddit management | ⏳ Next |
| `src/stores/` | Zustand state stores | ⏳ Later |
| `src/lib/api/` | API integration layer | ⏳ Later |
| `src/app/` | Next.js pages | ⏳ Next |

## 🎯 What We're Building

```
User Flow:
1. Select a city (Seattle, Detroit, Chicago)
2. Enter design concept ("minimalist coffee culture hoodie")
3. AI generates 4 design variations
4. Approve 2 best designs
5. System creates comparison template
6. Post to Reddit for feedback
7. Analyze community response
8. Identify winning design
```

## 🧩 Component Breakdown

### Phase 1A: Shared Components (Build First)
```
src/components/shared/
├── LoadingSpinner.tsx      # Simple spinner animation
├── ImageSkeleton.tsx       # Skeleton loader for images
├── ErrorMessage.tsx        # Error display with retry button
└── EmptyState.tsx          # Empty state with icon + CTA
```

**Prompt for Claude:**
> "Build the 4 shared components in src/components/shared/. Use Tailwind CSS. Keep them simple and reusable."

### Phase 1B: Feature Components (Build Next)

#### 1. CitySelector
```typescript
// What it does:
- Dropdown showing cities from mock data
- Search/filter functionality
- Shows: "Seattle (206)"
- onCitySelect callback

// Test with:
import { mockCities } from '@/lib/mockData'
```

#### 2. ConceptInput
```typescript
// What it does:
- Large textarea for concept input
- Suggestion chips below (from city cultural elements)
- Sidebar showing existing concepts
- "Generate Images" button

// Test with:
import { mockCityContexts, mockDesignConcepts } from '@/lib/mockData'
```

#### 3. ImageGallery
```typescript
// What it does:
- Grid of generated images
- Hover to show metadata
- Selection checkboxes (single/multiple/none modes)
- Filter by approval status
- Lightbox on click

// Test with:
import { mockGeneratedImages } from '@/lib/mockData'
```

#### 4. ApprovalInterface
```typescript
// What it does:
- Side-by-side comparison of 2 selected images
- Image selector sidebar
- Reddit post config form
- Submit button (requires exactly 2 images)

// Test with:
import { mockGeneratedImages } from '@/lib/mockData'
```

#### 5. RedditPostManager
```typescript
// What it does:
- Table/card view of Reddit posts
- Status badges (queued, posted, archived)
- Expandable comments section
- Sentiment color coding

// Test with:
import { mockRedditPosts, mockRedditComments } from '@/lib/mockData'
```

#### 6. AnalyticsDashboard
```typescript
// What it does:
- Performance cards (total posts, comments, etc.)
- City-by-city performance table
- Top performing designs
- Sentiment pie chart (recharts)
- Design preference bar chart (recharts)

// Test with:
import { mockAnalyticsDashboard } from '@/lib/mockData'
```

## 🎨 Using Mock Data

### Import Mock Data
```typescript
import {
  mockCities,
  mockCityContexts,
  mockGeneratedImages,
  mockDesignConcepts,
  mockRedditPosts,
  mockRedditComments,
  mockAnalyticsDashboard,
} from '@/lib/mockData'
```

### Example Usage in Component
```typescript
'use client'

import { mockCities } from '@/lib/mockData'
import { City } from '@/types'

export function CitySelector() {
  const [cities, setCities] = useState<City[]>(mockCities)

  return (
    <div>
      {cities.map(city => (
        <div key={city.id}>
          {city.name} ({city.area_code})
        </div>
      ))}
    </div>
  )
}
```

## 🧪 Testing Components

### Create Test Pages
For each component, create a test page:

```typescript
// src/app/test-city-selector/page.tsx
import { CitySelector } from '@/components/city/CitySelector'

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CitySelector Test</h1>
      <CitySelector onCitySelect={(city) => console.log(city)} />
    </div>
  )
}
```

Then visit: `http://localhost:3000/test-city-selector`

## 🎨 Tailwind CSS Tips

### Common Patterns
```tsx
// Card
<div className="bg-white rounded-lg shadow-md p-6">

// Button Primary
<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">

// Button Secondary
<button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">

// Grid Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Flex Center
<div className="flex items-center justify-center">

// Loading Spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600">
```

## 📋 Checklist for Each Component

- [ ] Create component file
- [ ] Import required types from `@/types`
- [ ] Import mock data from `@/lib/mockData`
- [ ] Build UI with Tailwind CSS
- [ ] Add loading states
- [ ] Add error states
- [ ] Add empty states
- [ ] Make responsive (mobile-first)
- [ ] Create test page
- [ ] Test in browser
- [ ] Verify all interactions work

## 🐛 Common Issues & Fixes

### "Module not found" Error
```bash
# Make sure you're in the right directory
cd "/Users/greenmachine2.0/TMH/Claude Code/tmh-dashboard"

# Reinstall dependencies
rm -rf node_modules
npm install
```

### TypeScript Errors
```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or check types manually
npm run type-check
```

### Tailwind Not Working
```bash
# Make sure dev server is running
npm run dev

# Check tailwind.config.ts includes your files
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

## 📊 Progress Tracking

Current progress is tracked in:
- `BUILD_PROGRESS.md` - Detailed phase-by-phase progress
- This file - Quick reference for current work

## 🎯 Next Actions

1. **Build shared components** (30 min)
   ```bash
   # Files to create:
   src/components/shared/LoadingSpinner.tsx
   src/components/shared/ImageSkeleton.tsx
   src/components/shared/ErrorMessage.tsx
   src/components/shared/EmptyState.tsx
   ```

2. **Build CitySelector** (45 min)
   ```bash
   # Files to create:
   src/components/city/CitySelector.tsx
   src/app/test-city-selector/page.tsx
   ```

3. **Build ConceptInput** (1 hour)
   ```bash
   # Files to create:
   src/components/city/ConceptInput.tsx
   src/app/test-concept-input/page.tsx
   ```

4. **Continue with remaining components...**

## 💡 Pro Tips

1. **Build one component at a time** - Don't try to build everything at once
2. **Test as you go** - Create test pages for each component
3. **Use mock data** - Don't worry about real data until Phase 2
4. **Keep it simple** - Focus on functionality first, polish later
5. **Mobile-first** - Use Tailwind responsive classes from the start
6. **TypeScript is your friend** - Let the type system guide you

## 🔗 Quick Links

- **Dev Server:** http://localhost:3000
- **Type Definitions:** [src/types/index.ts](tmh-dashboard/src/types/index.ts)
- **Mock Data:** [src/lib/mockData.ts](tmh-dashboard/src/lib/mockData.ts)
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Lucide Icons:** https://lucide.dev
- **Recharts:** https://recharts.org

---

**Ready to build?** Start with the shared components!

```bash
cd "/Users/greenmachine2.0/TMH/Claude Code/tmh-dashboard"
npm run dev
```
