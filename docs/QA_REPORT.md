# TMH AI Content Engine - Comprehensive QA Report

**Date**: January 25, 2026
**Reviewer**: Claude (Code Quality, Performance, UX Focus)
**Codebase**: `tmh-ai-content-engine-main`
**Total Lines Analyzed**: ~16,500 lines across 60+ files

---

## Executive Summary

| Category | Score | Notes |
|----------|-------|-------|
| **Code Quality** | 6/10 | Heavy `any` usage, type mismatches, large components |
| **Performance** | 7/10 | Good interval cleanup, missing memoization opportunities |
| **UX** | 5/10 | Missing toast integration, inconsistent error handling, no global loading states |
| **Architecture** | 7/10 | Clean separation, but some god components |

### Top 5 Critical Issues

1. **No global toast system** - Errors fail silently in most components
2. **Type safety erosion** - 168 `any` usages, 54 explicit `as any` casts
3. **Status enum mismatch** - Database types don't match application usage
4. **Large monolithic components** - 5 files over 800 lines each
5. **Missing Toaster in root layout** - sonner installed but not globally mounted

---

## 🔴 Critical Issues (Fix Immediately)

### 1. Global Toast System Not Integrated

**Location**: `src/app/layout.tsx`

**Problem**: `sonner` is installed and used in 2 isolated pages, but the `<Toaster />` component is NOT in the root layout. This means toast notifications only work in `test-grid` and `instagram-grid-demo` pages.

**Impact**: All API errors across the app fail silently. Users have no feedback when operations fail.

**Fix**:
```tsx
// src/app/layout.tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <MobileNav />
          <main className="flex-1 md:ml-60 overflow-y-auto">
            <div className="p-8 pt-20 md:pt-8">
              <Breadcrumb />
              {children}
            </div>
          </main>
          <ChatPanel />
        </div>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
```

**Effort**: 5 minutes
**Priority**: 🔴 CRITICAL

---

### 2. Type/Status Enum Mismatch

**Locations**:
- `src/types/database.types.ts` line 18
- `src/components/CitySelector.tsx` line 130

**Problem**: The `cities.status` type is defined as `'draft' | 'active' | 'archived'` but code checks for `'ready'`, `'approved'`, `'paused'`, `'inactive'` which don't exist in the type.

**TypeScript Error**:
```
error TS2367: This comparison appears to be unintentional because the
types '"paused" | "inactive"' and '"ready"' have no overlap.
```

**Impact**:
- TypeScript compilation warnings
- Potential runtime filtering bugs
- Dead code paths

**Fix Options**:

Option A - Update database types to match actual usage:
```typescript
// src/types/database.types.ts
status: 'draft' | 'active' | 'archived' | 'ready' | 'approved' | 'researching' | 'error'
```

Option B - Update code to only use valid statuses:
```typescript
// src/components/CitySelector.tsx line 130
const approvedCities = cities.filter(city =>
  city.status === 'active' || city.status === 'draft'
);
```

**Effort**: 30 minutes
**Priority**: 🔴 CRITICAL

---

### 3. Excessive `any` Type Usage

**Count**: 168 total `any` occurrences, 54 explicit `as any` casts

**Worst Offenders**:
| File | `as any` Count | Issue |
|------|----------------|-------|
| `src/app/api/cities/route.ts` | 18 | Supabase responses cast everywhere |
| `src/lib/supabase.ts` | 6 | Type assertions on database operations |
| `src/lib/research.ts` | 5 | Element value handling |
| `src/components/PromptTemplateEditor.tsx` | 3 | Form state handling |

**Example Problem**:
```typescript
// src/app/api/cities/route.ts line 402
.insert(cityData as any)

// src/lib/supabase.ts line 82
const { data, error } = await (supabase as any)
  .from('cities')
  .update({ status, updated_at: new Date().toISOString() })
```

**Impact**:
- No type safety on database operations
- Runtime errors from shape mismatches
- Difficult refactoring

**Fix Strategy**:
1. Generate proper Supabase types with `supabase gen types typescript`
2. Create helper functions with proper generics
3. Use Zod for runtime validation of API responses

**Effort**: 2-3 hours
**Priority**: 🔴 HIGH

---

## 🟠 High Priority Issues

### 4. God Components (800+ Lines)

| Component | Lines | Responsibility Overload |
|-----------|-------|------------------------|
| `src/app/generate/image/page.tsx` | 993 | Settings, generation, review, approval |
| `src/app/generate/video/page.tsx` | 983 | Settings, polling, comparison, feedback |
| `src/components/PromptTemplateEditor.tsx` | 943 | Form, validation, preview, test mode |
| `src/app/content/create/CreateContent.tsx` | 908 | Multi-step wizard with embedded logic |
| `src/app/generate/shots/GenerateShotsContent.tsx` | 797 | Shot config, generation, approval flow |

**Impact**:
- Hard to maintain and test
- Slow re-renders (no code splitting)
- Difficult to onboard new developers

**Recommended Refactoring** for `image/page.tsx`:
```
src/app/generate/image/
├── page.tsx (100 lines - composition only)
├── components/
│   ├── ImageSettings.tsx
│   ├── GenerationResults.tsx
│   ├── ReviewMode.tsx
│   └── ApprovalPanel.tsx
├── hooks/
│   ├── useImageGeneration.ts
│   └── useImageReview.ts
└── types.ts
```

**Effort**: 4-6 hours per component
**Priority**: 🟠 HIGH

---

### 5. Missing Error Boundaries

**Problem**: No error boundaries anywhere in the app. If any component throws, the entire app crashes.

**Recommended Implementation**:
```tsx
// src/components/ErrorBoundary.tsx
'use client'
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
          <p className="text-gray-600 mt-2">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

**Effort**: 1 hour
**Priority**: 🟠 HIGH

---

### 6. Inconsistent Error Handling in API Routes

**Pattern Observed**: Some routes return proper error objects, others just status codes.

**Good Example** (`src/app/api/generate/video/sora/route.ts`):
```typescript
return NextResponse.json({
  error: 'Failed to start video generation',
  details: error instanceof Error ? error.message : 'Unknown error',
}, { status: 500 });
```

**Bad Example** (`src/app/api/cities/route.ts` line 490):
```typescript
const { error } = await supabase.from('cities')...
// error is caught but never returned to client properly
```

**Standardized Error Response**:
```typescript
// src/lib/api-utils.ts
export function apiError(message: string, details?: string, status = 500) {
  return NextResponse.json({
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString()
  }, { status })
}

export function apiSuccess<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  })
}
```

**Effort**: 2 hours
**Priority**: 🟠 HIGH

---

### 7. Missing Loading States on Actions

**Problem**: Many buttons don't show loading state during async operations.

**Files Missing Loading States**:
- `src/app/cities/[cityId]/page.tsx` - Approval buttons (partial)
- `src/app/generate/image/page.tsx` - No spinner during generation
- `src/app/library/LibraryContent.tsx` - Filter/search actions

**Recommended Pattern**:
```tsx
// Create reusable LoadingButton
import { Loader2 } from 'lucide-react'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

export function LoadingButton({ loading, children, disabled, className, ...props }: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`${className} disabled:opacity-50`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />}
      {children}
    </button>
  )
}
```

**Effort**: 2 hours
**Priority**: 🟠 HIGH

---

## 🟡 Medium Priority Issues

### 8. Missing Memoization

**Problem**: Only 20 `useMemo`/`useCallback` usages across 37 `useEffect` hooks. Large lists and expensive computations aren't memoized.

**Key Opportunities**:

```tsx
// src/app/cities/[cityId]/page.tsx
// Current: recalculates on every render
const getFilteredElements = () => { ... }

// Should be:
const filteredElements = useMemo(() => {
  if (activeTab === 'all') {
    return Object.values(elements).flat()
  }
  return elements[activeTab] || []
}, [elements, activeTab])
```

```tsx
// src/app/generate/image/page.tsx
// Handlers recreated every render
const handleToggleShotType = useCallback((shotType: ShotType) => {
  setSelectedShotTypes(prev =>
    prev.includes(shotType)
      ? prev.filter(st => st !== shotType)
      : [...prev, shotType]
  )
}, [])
```

**Effort**: 2-3 hours
**Priority**: 🟡 MEDIUM

---

### 9. Console Statements in Production

**Count**: 189 console statements (log, error, warn)

**Problem**: Excessive logging clutters browser console and potentially leaks info.

**Recommendation**:
```typescript
// src/lib/logger.ts
const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  error: (...args: any[]) => console.error(...args), // Keep errors
  warn: (...args: any[]) => isDev && console.warn(...args),
  debug: (...args: any[]) => isDev && console.debug(...args),
}
```

**Effort**: 1 hour to create, 2 hours to replace all
**Priority**: 🟡 MEDIUM

---

### 10. No Empty States

**Problem**: Empty data scenarios show blank areas instead of helpful UI.

**Files Needing Empty States**:
- `src/app/page.tsx` - Recent tests section
- `src/app/library/LibraryContent.tsx` - Asset grid
- `src/app/cities/[cityId]/page.tsx` - Elements grid (partial)

**Recommended Component**:
```tsx
// src/components/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
      {action && (
        <button
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
```

**Effort**: 2 hours
**Priority**: 🟡 MEDIUM

---

### 11. Video Polling Has No Retry Logic

**Location**: `src/app/generate/video/page.tsx` lines 252-306

**Current Behavior**:
- Polls every 5 seconds
- Max 60 attempts (5 minutes)
- If job fails, marks as error with no retry option

**Missing**:
- Exponential backoff
- Retry button for failed jobs
- User-facing progress indicator

**Recommended Enhancement**:
```typescript
// Add to video generation state
const [retryCount, setRetryCount] = useState<Record<string, number>>({})
const MAX_RETRIES = 3

const handleRetry = async (jobKey: 'sora' | 'veo', jobId: string) => {
  const currentRetries = retryCount[jobKey] || 0
  if (currentRetries >= MAX_RETRIES) {
    toast.error('Maximum retries reached')
    return
  }

  setRetryCount(prev => ({ ...prev, [jobKey]: currentRetries + 1 }))
  // Restart polling with exponential backoff
  const delay = Math.pow(2, currentRetries) * 5000
  // ... restart polling logic
}
```

**Effort**: 3-4 hours
**Priority**: 🟡 MEDIUM

---

### 12. Database Service Key Dependency

**Problem**: Many operations silently fail without `SUPABASE_SERVICE_KEY`. The PRD mentions this but code doesn't consistently handle it.

**Affected Routes**:
- `/api/cities/route.ts` - City creation
- `/api/cities/[cityId]/research/route.ts` - Research persistence
- `/api/generate/video/*/route.ts` - Content saving

**Recommendation**: Add clear user feedback when service key is missing:
```typescript
// src/lib/supabase-admin.ts
export const hasServiceKey = !!process.env.SUPABASE_SERVICE_KEY

export function requireServiceKey(operation: string) {
  if (!hasServiceKey) {
    return NextResponse.json({
      error: 'Database write operation not available',
      details: `${operation} requires SUPABASE_SERVICE_KEY to be configured`,
      code: 'SERVICE_KEY_REQUIRED'
    }, { status: 503 })
  }
  return null
}
```

**Effort**: 1-2 hours
**Priority**: 🟡 MEDIUM

---

## 🟢 Low Priority / Nice to Have

### 13. ESLint Configuration Issues

**Problem**: ESLint throws errors for Node.js globals (`process`, `console`, `fetch`, `URL`) because config doesn't specify environment.

**Quick Fix** - Update `eslint.config.js`:
```javascript
export default [
  {
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
      }
    }
  },
  // ... rest of config
]
```

**Effort**: 15 minutes
**Priority**: 🟢 LOW

---

### 14. Missing `package.json` Type Field

**Warning**: `Module type of file is not specified`

**Fix**:
```json
{
  "name": "tmh-ai-content-engine",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  ...
}
```

**Effort**: 1 minute
**Priority**: 🟢 LOW

---

### 15. Unused Dependencies Check

**Potentially Unused**:
- `@heroicons/react` - Only lucide-react is used throughout
- `@types/jszip` - Can be auto-inferred

**Recommendation**: Run `npx depcheck` to identify truly unused deps.

**Effort**: 30 minutes
**Priority**: 🟢 LOW

---

## Performance Observations

### ✅ What's Working Well

1. **Video polling cleanup** - Proper `useEffect` cleanup at line 147-156 in video page
2. **Zustand state management** - Clean store setup with devtools
3. **No obvious memory leaks** - All intervals have cleanup
4. **Reasonable bundle** - Dependencies are focused

### ⚠️ Performance Concerns

1. **No code splitting** - Large pages load entirely
2. **No image optimization** - Using raw URLs, not `next/image`
3. **No suspense boundaries** - All-or-nothing loading
4. **Potential waterfall requests** - Sequential API calls in generation flows

---

## Recommended Fix Priority

### This Week (8-10 hours)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Add Toaster to root layout | 5 min | Critical UX |
| 2 | Fix type/status enum mismatch | 30 min | Type safety |
| 3 | Create LoadingButton component | 1 hr | UX feedback |
| 4 | Add basic ErrorBoundary | 1 hr | Crash prevention |
| 5 | Standardize API error responses | 2 hr | Debugging |
| 6 | Add memoization to heavy pages | 2 hr | Performance |

### Next Week (10-15 hours)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 7 | Reduce `as any` in cities/route.ts | 2 hr | Type safety |
| 8 | Add EmptyState component | 2 hr | UX polish |
| 9 | Video retry logic | 3 hr | Reliability |
| 10 | Extract image page into components | 4 hr | Maintainability |

### Next Month (20+ hours)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 11 | Refactor all god components | 20 hr | Long-term maintainability |
| 12 | Add proper logging system | 3 hr | Production readiness |
| 13 | Generate proper Supabase types | 4 hr | Type safety |
| 14 | Add integration tests | 10 hr | Reliability |

---

## Quick Wins Checklist

```markdown
## Immediate Actions (Today)
- [ ] Add `<Toaster />` to layout.tsx
- [ ] Fix CitySelector status type check
- [ ] Add `"type": "module"` to package.json

## This Week
- [ ] Create LoadingButton component
- [ ] Create EmptyState component
- [ ] Create ErrorBoundary component
- [ ] Create api-utils.ts with standard responses
- [ ] Add memoization to cities/[cityId]/page.tsx

## QA Tracking
- [ ] Run `npx tsc --noEmit` - should have 0 errors
- [ ] Run `npx eslint src` - should have <20 warnings
- [ ] Manual test: all toast notifications appear
- [ ] Manual test: loading states on all buttons
```

---

## Appendix: Files Reviewed

### Core Application
- `src/app/layout.tsx` ✅
- `src/app/page.tsx` ✅
- `src/app/cities/[cityId]/page.tsx` ✅
- `src/app/generate/image/page.tsx` ✅
- `src/app/generate/video/page.tsx` ✅

### Libraries
- `src/lib/supabase.ts` ✅
- `src/lib/video-generation.ts` ✅
- `src/lib/research.ts` ✅

### Components
- `src/components/ChatPanel.tsx` ✅
- `src/components/CitySelector.tsx` ✅
- `src/components/PromptTemplateEditor.tsx` ✅

### Stores
- `src/stores/generationStore.ts` ✅
- `src/stores/chatStore.ts` (referenced)
- `src/stores/cityStore.ts` (referenced)

### API Routes
- `src/app/api/generate/video/sora/route.ts` ✅
- `src/app/api/generate/video/sora/status/route.ts` ✅
- `src/app/api/cities/route.ts` (lint output reviewed)

---

**Report Generated**: January 25, 2026
**Next Review Recommended**: After completing "This Week" fixes
