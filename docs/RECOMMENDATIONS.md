# TMH AI Content Engine
## Recommendations & Action Plan

**Created**: January 25, 2026
**Purpose**: Prioritized action items to get the platform fully operational

---

## Quick Reference

| Priority | Items | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 Critical | 5 | Hours | Unblocks core functionality |
| 🟠 High | 8 | Days | Major UX improvements |
| 🟡 Medium | 10 | 1-2 weeks | Polish & reliability |
| 🟢 Nice-to-Have | 7 | Ongoing | Future enhancements |

---

## 🔴 Critical: Fix Now (Low-Hanging Fruit)

These items are blocking core functionality and can be fixed quickly.

### 1. Add Toast Notifications for Errors
**Problem**: API errors fail silently, users don't know what went wrong.

**Solution**: Add a global toast system.

```bash
# Install sonner (lightweight toast library)
npm install sonner
```

**File**: `src/app/layout.tsx`
```tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
```

**Usage in any component**:
```tsx
import { toast } from 'sonner'

// On error
toast.error('Failed to save. Please try again.')

// On success
toast.success('Research completed!')

// With action
toast('Video processing', {
  action: {
    label: 'View Status',
    onClick: () => router.push('/content')
  }
})
```

**Effort**: 1-2 hours
**Impact**: Massive UX improvement

---

### 2. Add Loading States to All Buttons
**Problem**: Users click buttons multiple times because there's no feedback.

**Solution**: Add disabled + spinner state to action buttons.

**Create utility component** `src/components/ui/loading-button.tsx`:
```tsx
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

export function LoadingButton({ loading, children, disabled, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
```

**Effort**: 1 hour
**Impact**: Prevents duplicate submissions, better UX

---

### 3. Fix Video Status Polling UI
**Problem**: Users don't see video generation progress.

**Solution**: Add a "Processing Videos" indicator in the sidebar or header.

**File**: `src/components/layout/AppShell.tsx` (or similar)
```tsx
const [processingVideos, setProcessingVideos] = useState<number>(0)

useEffect(() => {
  const checkProcessing = async () => {
    const res = await fetch('/api/generated-content?status=processing&content_type=video')
    if (res.ok) {
      const data = await res.json()
      setProcessingVideos(data.data?.length || 0)
    }
  }

  checkProcessing()
  const interval = setInterval(checkProcessing, 30000) // Check every 30s
  return () => clearInterval(interval)
}, [])

// In render:
{processingVideos > 0 && (
  <div className="flex items-center gap-2 text-xs text-amber-400">
    <Loader2 className="h-3 w-3 animate-spin" />
    {processingVideos} video{processingVideos > 1 ? 's' : ''} processing
  </div>
)}
```

**Effort**: 2 hours
**Impact**: Users know videos are being generated

---

### 4. Add Retry Button for Failed Operations
**Problem**: When something fails, users have to refresh and start over.

**Solution**: Add retry buttons next to error messages.

**Pattern**:
```tsx
const [error, setError] = useState<string | null>(null)
const [retryFn, setRetryFn] = useState<(() => void) | null>(null)

const handleAction = async () => {
  setError(null)
  try {
    await doSomething()
  } catch (err) {
    setError(err.message)
    setRetryFn(() => handleAction) // Store the retry function
  }
}

// In render:
{error && (
  <div className="flex items-center gap-2 text-destructive">
    <span>{error}</span>
    {retryFn && (
      <Button size="sm" variant="outline" onClick={retryFn}>
        Retry
      </Button>
    )}
  </div>
)}
```

**Effort**: 2-3 hours (apply to key pages)
**Impact**: Better error recovery

---

### 5. Add Confirmation Dialogs for Destructive Actions
**Problem**: "Reject" and "Delete" actions happen immediately with no confirmation.

**Solution**: Add confirmation dialogs.

**Install AlertDialog from shadcn**:
```bash
npx shadcn@latest add alert-dialog
```

**Usage**:
```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Reject Asset</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Reject this asset?</AlertDialogTitle>
      <AlertDialogDescription>
        This will mark the asset as rejected. You can regenerate it later.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleReject}>Reject</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Effort**: 2 hours
**Impact**: Prevents accidental data loss

---

## 🟠 High Priority: This Week

### 6. Implement Automatic Video Retry
**Problem**: Videos get stuck in "processing" forever.

**Solution**: Add automatic retry with exponential backoff.

**File**: `src/lib/video-polling.ts` (new file)
```typescript
interface VideoJob {
  id: string
  jobId: string
  provider: 'sora' | 'veo'
  attempts: number
  lastAttempt: Date
}

const MAX_ATTEMPTS = 5
const BASE_DELAY_MS = 5000

export async function pollVideoWithRetry(job: VideoJob): Promise<'completed' | 'failed' | 'pending'> {
  const delay = BASE_DELAY_MS * Math.pow(2, job.attempts)

  const response = await fetch(
    `/api/generate/video/${job.provider}/status?jobId=${job.jobId}&contentId=${job.id}`
  )

  if (!response.ok) {
    if (job.attempts >= MAX_ATTEMPTS) {
      // Mark as failed
      await fetch('/api/generated-content', {
        method: 'PATCH',
        body: JSON.stringify({ id: job.id, status: 'failed' })
      })
      return 'failed'
    }
    return 'pending' // Will retry
  }

  const data = await response.json()
  return data.status
}
```

**Effort**: 4 hours
**Impact**: Videos complete reliably

---

### 7. Add Research Progress Indicator
**Problem**: "Start Research" runs for 30-60 seconds with no feedback.

**Solution**: Show step-by-step progress.

**Backend change** - stream progress:
```typescript
// In research route, emit progress events
const categories = ['slang', 'landmark', 'sport', 'cultural', ...]
for (const category of categories) {
  // Could use Server-Sent Events or just update a status field
  await updateResearchStatus(cityId, `Researching ${category}...`)
  const results = await researchCategory(category)
  // ...
}
```

**Frontend change** - poll for status:
```tsx
const [researchProgress, setResearchProgress] = useState<string>('')

useEffect(() => {
  if (!isResearching) return

  const interval = setInterval(async () => {
    const res = await fetch(`/api/cities/${cityId}`)
    const city = await res.json()
    setResearchProgress(city.research_status || 'Processing...')
  }, 2000)

  return () => clearInterval(interval)
}, [isResearching, cityId])
```

**Effort**: 4 hours
**Impact**: Users know research is working

---

### 8. Fix Cost Tracking Display
**Problem**: Budget shows $0.00 even when generations have occurred.

**Solution**: Ensure cost logging works and display real data.

**Check**: Verify `cost_logs` table is being populated:
```sql
SELECT * FROM cost_logs ORDER BY created_at DESC LIMIT 10;
```

**Fix analytics API** `src/app/api/analytics/route.ts`:
```typescript
export async function GET() {
  const supabase = hasServiceKey ? supabaseAdmin : getSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ costs: { total: 0 }, mock: true })
  }

  // Get actual costs from generated_content
  const { data: content } = await supabase
    .from('generated_content')
    .select('generation_cost_cents, content_type, created_at')
    .gte('created_at', getFirstOfMonth())

  const total = content?.reduce((sum, item) => sum + (item.generation_cost_cents || 0), 0) || 0

  return NextResponse.json({
    costs: {
      total: total / 100, // Convert cents to dollars
      byCategory: groupByCategory(content)
    }
  })
}
```

**Effort**: 3 hours
**Impact**: Accurate budget tracking

---

### 9. Add Keyboard Shortcuts
**Problem**: Power users can't work quickly.

**Solution**: Add common shortcuts.

**File**: `src/hooks/useKeyboardShortcuts.ts`
```typescript
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k': // Cmd+K: Open city selector
            e.preventDefault()
            // Open city selector modal
            break
          case 'g': // Cmd+G: Generate
            e.preventDefault()
            router.push('/generate')
            break
          case 'r': // Cmd+R: Research (if on city page)
            e.preventDefault()
            // Trigger research
            break
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])
}
```

**Effort**: 3 hours
**Impact**: Faster workflows for power users

---

### 10. Improve Empty States
**Problem**: Empty pages look broken.

**Solution**: Add helpful empty states with actions.

**Create component** `src/components/EmptyState.tsx`:
```tsx
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
      <div className="mb-4 rounded-full bg-muted p-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Usage:
<EmptyState
  icon={<Sparkles className="h-8 w-8" />}
  title="No assets yet"
  description="Generate your first product shots or lifestyle images to see them here."
  action={{
    label: "Generate Assets",
    onClick: () => setActiveConceptId(conceptCards[0]?.id)
  }}
/>
```

**Effort**: 2 hours
**Impact**: Clearer guidance for new users

---

### 11. Add Search/Filter to Asset Gallery
**Problem**: Can't find specific assets quickly.

**Solution**: Add search and filter controls.

```tsx
const [searchQuery, setSearchQuery] = useState('')
const [filterType, setFilterType] = useState<string>('all')
const [filterStatus, setFilterStatus] = useState<string>('all')

const filteredAssets = useMemo(() => {
  return assets.filter(asset => {
    const matchesSearch = !searchQuery ||
      asset.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.title?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || asset.content_type === filterType
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })
}, [assets, searchQuery, filterType, filterStatus])

// In render:
<div className="flex gap-4 mb-4">
  <Input
    placeholder="Search assets..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="max-w-xs"
  />
  <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
    <option value="all">All Types</option>
    <option value="image">Images</option>
    <option value="video">Videos</option>
  </select>
  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
    <option value="all">All Status</option>
    <option value="pending">Pending</option>
    <option value="approved">Approved</option>
    <option value="rejected">Rejected</option>
  </select>
</div>
```

**Effort**: 3 hours
**Impact**: Easier asset management

---

### 12. Batch Actions for Assets
**Problem**: Can only approve/reject one asset at a time.

**Solution**: Add multi-select with batch actions.

```tsx
const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())

const toggleSelect = (id: string) => {
  const next = new Set(selectedAssets)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  setSelectedAssets(next)
}

const handleBatchApprove = async () => {
  const ids = Array.from(selectedAssets)
  await Promise.all(
    ids.map(id =>
      fetch('/api/generated-content', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: 'approved' })
      })
    )
  )
  setSelectedAssets(new Set())
  await fetchCityData()
}

// Toolbar when items selected:
{selectedAssets.size > 0 && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 rounded-lg bg-background border shadow-lg px-4 py-3">
    <span className="text-sm">{selectedAssets.size} selected</span>
    <Button size="sm" onClick={handleBatchApprove}>Approve All</Button>
    <Button size="sm" variant="destructive" onClick={handleBatchReject}>Reject All</Button>
    <Button size="sm" variant="ghost" onClick={() => setSelectedAssets(new Set())}>Cancel</Button>
  </div>
)}
```

**Effort**: 4 hours
**Impact**: Much faster bulk operations

---

### 13. Add Drag-and-Drop for Drop Organization
**Problem**: Can't reorder assets within a drop.

**Solution**: Add drag-and-drop reordering.

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

**Effort**: 6 hours
**Impact**: Better drop curation experience

---

## 🟡 Medium Priority: This Month

### 14. Add Image Cropping/Editing
**Problem**: Can't adjust generated images without regenerating.

**Solution**: Add basic editing modal.

```bash
npm install react-image-crop
```

Features:
- Crop to different aspect ratios
- Rotate
- Flip horizontal/vertical
- Save edited version as new asset

**Effort**: 8 hours
**Impact**: Reduce regeneration costs

---

### 15. Implement Proper Authentication
**Problem**: No auth = anyone can access/modify data.

**Solution**: Implement Supabase Auth.

**Steps**:
1. Enable Auth in Supabase dashboard
2. Add login page
3. Add middleware to protect routes
4. Add user_id to generated content
5. Update RLS policies

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}
```

**Effort**: 1-2 days
**Impact**: Security + multi-user support

---

### 16. Add Webhook Support for Video Status
**Problem**: Polling is inefficient and unreliable.

**Solution**: If providers support webhooks, use them.

**Alternative**: Use Vercel Cron to check status:

```typescript
// src/app/api/cron/check-videos/route.ts
export async function GET() {
  // Vercel Cron job
  const processingVideos = await getProcessingVideos()

  for (const video of processingVideos) {
    await checkAndUpdateStatus(video)
  }

  return new Response('OK')
}
```

**vercel.json**:
```json
{
  "crons": [{
    "path": "/api/cron/check-videos",
    "schedule": "*/5 * * * *"
  }]
}
```

**Effort**: 4 hours
**Impact**: Reliable video completion

---

### 17. Add Export to ZIP
**Problem**: Can't bulk download assets.

**Solution**: Implement ZIP generation.

```bash
npm install archiver
```

```typescript
// src/app/api/export/route.ts
import archiver from 'archiver'

export async function POST(request: Request) {
  const { assetIds } = await request.json()

  // Fetch assets
  const assets = await getAssets(assetIds)

  // Create ZIP
  const archive = archiver('zip')

  for (const asset of assets) {
    const response = await fetch(asset.output_url)
    const buffer = await response.arrayBuffer()
    archive.append(Buffer.from(buffer), { name: `${asset.id}.${asset.content_type === 'video' ? 'mp4' : 'png'}` })
  }

  // Add manifest
  archive.append(JSON.stringify(assets, null, 2), { name: 'manifest.json' })

  archive.finalize()

  // Return ZIP stream or upload to storage and return URL
}
```

**Effort**: 6 hours
**Impact**: Easy bulk export

---

### 18. Mobile-Responsive Chat
**Problem**: Chat is hidden on mobile.

**Solution**: Add mobile chat overlay.

```tsx
// Mobile chat button (fixed position)
<button
  className="fixed bottom-6 right-6 lg:hidden rounded-full bg-primary p-4 shadow-lg"
  onClick={() => setMobileChatOpen(true)}
>
  <Bot className="h-6 w-6 text-primary-foreground" />
</button>

// Mobile chat drawer
{mobileChatOpen && (
  <div className="fixed inset-0 z-50 lg:hidden">
    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileChatOpen(false)} />
    <div className="absolute bottom-0 left-0 right-0 h-[80vh] bg-background rounded-t-xl">
      <ChatDock collapsed={false} />
    </div>
  </div>
)}
```

**Effort**: 4 hours
**Impact**: Mobile usability

---

### 19. Add Analytics Dashboard
**Problem**: No visibility into generation performance.

**Solution**: Create dedicated analytics page.

**Metrics to track**:
- Generations per day/week/month
- Approval rate by content type
- Cost per city
- Most used prompts
- Model performance comparison
- Time to approval

**Effort**: 1 day
**Impact**: Data-driven decisions

---

### 20. Prompt Templates Library
**Problem**: Users write prompts from scratch each time.

**Solution**: Add prompt template management.

```tsx
interface PromptTemplate {
  id: string
  name: string
  category: 'product' | 'lifestyle' | 'video'
  template: string // With {{variables}}
  variables: string[]
  successRate?: number
}

// Template picker in generation UI
<TemplateSelector
  category="product"
  onSelect={(template) => {
    // Fill variables
    const filled = fillTemplate(template, { city: city.name, product: 'Hoodie' })
    setPrompt(filled)
  }}
/>
```

**Effort**: 6 hours
**Impact**: Consistent quality, faster generation

---

### 21. Research Cache/Refresh Strategy
**Problem**: Research runs full pipeline every time.

**Solution**: Cache research with TTL.

```typescript
// Check cache before running
const cached = await supabase
  .from('city_elements')
  .select('*')
  .eq('city_id', cityId)
  .order('created_at', { ascending: false })
  .limit(1)

const lastResearch = cached.data?.[0]?.created_at
const cacheAge = Date.now() - new Date(lastResearch).getTime()
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

if (cacheAge < CACHE_TTL) {
  return { message: 'Using cached research', elements: cached.data }
}

// Run fresh research
```

**Effort**: 2 hours
**Impact**: Faster loads, lower costs

---

### 22. Add Undo/Redo for Approvals
**Problem**: Accidental approvals can't be easily undone.

**Solution**: Add undo toast with action.

```tsx
const handleApprove = async (assetId: string) => {
  const previousStatus = asset.status

  // Optimistic update
  setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'approved' } : a))

  // Show undo toast
  toast('Asset approved', {
    action: {
      label: 'Undo',
      onClick: async () => {
        await fetch('/api/generated-content', {
          method: 'PATCH',
          body: JSON.stringify({ id: assetId, status: previousStatus })
        })
        await fetchCityData()
      }
    }
  })

  // Persist
  await fetch('/api/generated-content', {
    method: 'PATCH',
    body: JSON.stringify({ id: assetId, status: 'approved' })
  })
}
```

**Effort**: 2 hours
**Impact**: Safer operations

---

### 23. Add Activity Feed
**Problem**: No visibility into what's happening across the platform.

**Solution**: Add activity/notification feed.

```typescript
// Activity types
type Activity = {
  id: string
  type: 'research_complete' | 'asset_generated' | 'asset_approved' | 'video_complete' | 'error'
  message: string
  cityId?: string
  assetId?: string
  timestamp: Date
}

// Store in database or in-memory for session
// Display in sidebar or dedicated panel
```

**Effort**: 4 hours
**Impact**: Better awareness

---

## 🟢 Nice-to-Have: Future

### 24. AI-Powered Prompt Suggestions
Based on what's worked well, suggest prompts.

### 25. Social Media Preview
Show how assets will look on IG/TikTok before export.

### 26. Version History for Assets
Track regenerations and allow rollback.

### 27. Collaborative Features
Multiple users, comments, assignments.

### 28. API for External Integrations
Allow other tools to trigger generations.

### 29. Scheduled Generations
Auto-generate at specific times or triggers.

### 30. A/B Test Tracking
Track which variants perform better on social.

---

## Implementation Order

### Week 1: Core Stability
1. ✅ Toast notifications (#1)
2. ✅ Loading buttons (#2)
3. ✅ Retry buttons (#4)
4. ✅ Confirmation dialogs (#5)
5. ✅ Video status indicator (#3)

### Week 2: UX Polish
6. Empty states (#10)
7. Search/filter (#11)
8. Keyboard shortcuts (#9)
9. Cost tracking fix (#8)

### Week 3: Reliability
10. Automatic video retry (#6)
11. Research progress (#7)
12. Batch actions (#12)

### Week 4: Features
13. Authentication (#15)
14. Export ZIP (#17)
15. Analytics dashboard (#19)

---

## Quick Wins Checklist

Copy this to track progress:

```markdown
## Quick Wins Progress

### Critical (Do First)
- [ ] Toast notifications
- [ ] Loading states on buttons
- [ ] Video processing indicator
- [ ] Retry buttons for errors
- [ ] Confirmation dialogs

### High Priority
- [ ] Automatic video retry
- [ ] Research progress indicator
- [ ] Cost tracking display
- [ ] Keyboard shortcuts
- [ ] Empty states
- [ ] Search/filter assets
- [ ] Batch actions
- [ ] Drag-and-drop drops

### Medium Priority
- [ ] Image editing
- [ ] Authentication
- [ ] Webhook/cron for videos
- [ ] Export to ZIP
- [ ] Mobile chat
- [ ] Analytics dashboard
- [ ] Prompt templates
- [ ] Research caching
- [ ] Undo/redo
- [ ] Activity feed

### Nice-to-Have
- [ ] AI prompt suggestions
- [ ] Social preview
- [ ] Version history
- [ ] Collaboration
- [ ] External API
- [ ] Scheduled generations
- [ ] A/B tracking
```

---

## Estimated Total Effort

| Category | Items | Hours |
|----------|-------|-------|
| Critical | 5 | ~10 hours |
| High | 8 | ~30 hours |
| Medium | 10 | ~50 hours |
| Nice-to-Have | 7 | ~40+ hours |

**Total to full stability**: ~40 hours (Critical + High)
**Total to polished product**: ~90 hours (+ Medium)

---

## Next Actions

1. **Today**: Implement toast notifications (#1) and loading buttons (#2)
2. **Tomorrow**: Add video status indicator (#3) and retry buttons (#4)
3. **This Week**: Complete all Critical items
4. **Next Week**: Start High Priority items

---

**Document maintained by**: Development Team
**Last updated**: January 25, 2026
