# That's My Hoodie - Frontend Requirements & Specs
## React/Next.js Dashboard Technical Specifications

---

## OVERVIEW

This document provides complete technical specifications for building the TMH creative automation dashboard. The frontend is a React/Next.js application that interfaces with n8n workflows and Supabase.

**Tech Stack:**
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand or React Context
- **API Client:** Axios + React Query
- **Database Client:** Supabase JS Client
- **Deployment:** Netlify
- **Repository:** GitHub

---

## APPLICATION ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYERS                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  UI Components (React)                                │  │
│  │  - CitySelector, ConceptInput, ImageGallery, etc.    │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  State Management (Zustand)                          │  │
│  │  - cityStore, imageStore, approvalStore              │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  API Layer (React Query + Axios)                     │  │
│  │  - Fetches data, handles caching                     │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
    ┌────▼────┐          ┌─────▼─────┐
    │ n8n API │          │ Supabase  │
    │ (Webhooks)│        │ (Direct)  │
    └─────────┘          └───────────┘
```

---

## PAGES & ROUTING

### Page Structure

```
/app
├── page.tsx                      # Homepage/Dashboard
├── layout.tsx                    # Root layout
├── cities/
│   ├── page.tsx                  # City list view
│   └── [cityId]/
│       ├── page.tsx              # City detail/concept page
│       └── history/
│           └── page.tsx          # City generation history
├── generate/
│   └── page.tsx                  # Image generation interface
├── approve/
│   └── page.tsx                  # Approval workflow
├── reddit/
│   ├── page.tsx                  # Reddit post management
│   └── analytics/
│       └── page.tsx              # Reddit analytics dashboard
├── library/
│   ├── designs/page.tsx          # Design concept library
│   ├── images/page.tsx           # Reference image library
│   └── prompts/page.tsx          # Prompt template library
└── settings/
    └── page.tsx                  # App settings
```

---

## COMPONENT LIBRARY

### Core Components

#### COMPONENT 1: CitySelector

**Purpose:** Select city for content generation  
**Location:** `components/CitySelector.tsx`

**Props:**
```typescript
interface CitySelectorProps {
  selectedCityId?: string;
  onCitySelect: (cityId: string) => void;
  showCreateNew?: boolean;
}
```

**Features:**
- Dropdown of active cities
- Search/filter cities
- Display city metadata (name, area code, nickname)
- "Create New City" button (if showCreateNew)

**State Management:**
```typescript
// Zustand store
interface CityStore {
  cities: City[];
  selectedCity: City | null;
  fetchCities: () => Promise<void>;
  selectCity: (cityId: string) => void;
  createCity: (cityData: CityInput) => Promise<void>;
}
```

**API Calls:**
```typescript
// GET /api/cities
const { data: cities } = useQuery({
  queryKey: ['cities'],
  queryFn: async () => {
    const { data } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return data;
  }
});
```

**UI/UX:**
- Clean dropdown with city icons
- Shows: City name + Area code (e.g., "Seattle (206)")
- Active state styling for selected city
- Loading skeleton while fetching

---

#### COMPONENT 2: ConceptInput

**Purpose:** Input and refine concept ideas  
**Location:** `components/ConceptInput.tsx`

**Props:**
```typescript
interface ConceptInputProps {
  cityId: string;
  onConceptSubmit: (concept: ConceptData) => void;
  existingConcepts?: DesignConcept[];
}
```

**Features:**
- Textarea for concept description
- Pre-filled suggestions based on city context
- Select from existing approved concepts
- Save concept as draft

**State:**
```typescript
const [concept, setConcept] = useState('');
const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
```

**API Calls:**
```typescript
// GET /api/cities/:id/context
const { data: cityContext } = useQuery({
  queryKey: ['cityContext', cityId],
  queryFn: async () => {
    const response = await axios.post(N8N_WEBHOOK_URL + '/get-city-context', {
      city_name: cityName
    });
    return response.data;
  }
});

// GET existing concepts
const { data: concepts } = useQuery({
  queryKey: ['concepts', cityId],
  queryFn: async () => {
    const { data } = await supabase
      .from('design_concepts')
      .select('*')
      .eq('city_id', cityId)
      .order('created_at', { ascending: false });
    return data;
  }
});
```

**UI/UX:**
- Large textarea (like Gemini interface)
- Suggestion chips below input (from city context)
- Sidebar showing existing concepts
- "Generate Images" CTA button

---

#### COMPONENT 3: ImageGallery

**Purpose:** Display generated images with metadata  
**Location:** `components/ImageGallery.tsx`

**Props:**
```typescript
interface ImageGalleryProps {
  images: GeneratedImage[];
  onImageSelect?: (imageId: string) => void;
  selectionMode?: 'single' | 'multiple' | 'none';
  maxSelections?: number;
  showMetadata?: boolean;
}
```

**Features:**
- Grid layout of images
- Hover to see details (prompt used, model, timestamp)
- Select mode for approval workflow
- Filter by city, date, approved status
- Lightbox view on click

**State:**
```typescript
const [selectedImages, setSelectedImages] = useState<string[]>([]);
const [filter, setFilter] = useState({
  cityId: null,
  isApproved: null,
  dateRange: null
});
```

**UI/UX:**
- Masonry grid or fixed grid (configurable)
- Selection checkboxes in top-right of each image
- Badge showing approval status
- Loading skeletons for pending images
- Empty state when no images

---

#### COMPONENT 4: ApprovalInterface

**Purpose:** Review and approve generated images  
**Location:** `components/ApprovalInterface.tsx`

**Props:**
```typescript
interface ApprovalInterfaceProps {
  cityId: string;
  onApprovalComplete: (approvedIds: string[]) => void;
}
```

**Features:**
- Side-by-side comparison view
- Require exactly 2 selections
- Preview what Reddit post will look like
- Notes/feedback textarea
- Submit approval

**Workflow:**
1. User selects 2 images from gallery
2. Preview pane shows side-by-side comparison
3. Configure Reddit post settings
4. Submit approval → triggers n8n Workflow 3

**API Calls:**
```typescript
const approveDesigns = async (approvedIds: string[], redditConfig: RedditPostConfig) => {
  const response = await axios.post(N8N_WEBHOOK_URL + '/approve-designs', {
    city_name: selectedCity.name,
    approved_image_ids: approvedIds,
    comparison_type: 'side_by_side',
    reddit_post_config: redditConfig
  });
  return response.data;
};
```

**UI/UX:**
- Large comparison preview (60% of screen)
- Image selector sidebar (40%)
- Disabled submit until exactly 2 selected
- Success animation on approval

---

#### COMPONENT 5: RedditPostManager

**Purpose:** Manage Reddit posts and schedule  
**Location:** `components/RedditPostManager.tsx`

**Props:**
```typescript
interface RedditPostManagerProps {
  cityId?: string;
  showOnlyPending?: boolean;
}
```

**Features:**
- List of queued, posted, and archived posts
- Edit scheduled post time
- View post on Reddit (external link)
- Cancel queued post
- View comments and sentiment

**State:**
```typescript
const [posts, setPosts] = useState<RedditPost[]>([]);
const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);
```

**API Calls:**
```typescript
// GET Reddit posts
const { data: posts } = useQuery({
  queryKey: ['redditPosts', cityId],
  queryFn: async () => {
    let query = supabase
      .from('reddit_posts')
      .select('*, reddit_comments(*)')
      .order('scheduled_post_time', { ascending: true });
    
    if (cityId) {
      query = query.eq('city_id', cityId);
    }
    
    const { data } = await query;
    return data;
  }
});
```

**UI/UX:**
- Table/card view of posts
- Status badges (queued, posted, archived)
- Click to expand comments
- Edit icon for scheduled posts

---

#### COMPONENT 6: AnalyticsDashboard

**Purpose:** Display Reddit performance metrics  
**Location:** `components/AnalyticsDashboard.tsx`

**Features:**
- Overall engagement metrics
- City-by-city performance
- Top performing designs
- Sentiment breakdown (pie/bar charts)
- Design preference analysis

**Data:**
```typescript
interface AnalyticsData {
  summary: {
    total_posts: number;
    total_comments: number;
    avg_engagement_rate: number;
  };
  city_performance: CityMetrics[];
  top_designs: DesignPerformance[];
  sentiment_breakdown: Record<string, number>;
}
```

**API Calls:**
```typescript
// Aggregated from Workflow 5 or direct query
const { data: analytics } = useQuery({
  queryKey: ['analytics'],
  queryFn: async () => {
    const { data } = await supabase
      .rpc('get_analytics_summary'); // Custom function
    return data;
  },
  refetchInterval: 60000 // Refresh every minute
});
```

**UI/UX:**
- Card-based layout
- Charts using Recharts or Chart.js
- Filters by date range
- Export to CSV option

---

#### COMPONENT 7: PromptTemplateSelector

**Purpose:** Choose prompt template for generation  
**Location:** `components/PromptTemplateSelector.tsx`

**Props:**
```typescript
interface PromptTemplateSelectorProps {
  category?: string;
  onTemplateSelect: (template: PromptTemplate) => void;
  showPreview?: boolean;
}
```

**Features:**
- List templates by category
- Preview prompt text
- Show quality score and usage count
- Search templates

**API Calls:**
```typescript
const { data: templates } = useQuery({
  queryKey: ['promptTemplates', category],
  queryFn: async () => {
    let query = supabase
      .from('prompt_templates')
      .select('*')
      .order('quality_score', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data } = await query;
    return data;
  }
});
```

---

### Shared Components

#### Loading States
```typescript
// components/shared/LoadingSpinner.tsx
export const LoadingSpinner = () => { /* ... */ };

// components/shared/ImageSkeleton.tsx
export const ImageSkeleton = () => { /* ... */ };

// components/shared/TableSkeleton.tsx
export const TableSkeleton = () => { /* ... */ };
```

#### Error Handling
```typescript
// components/shared/ErrorBoundary.tsx
export const ErrorBoundary = ({ children }) => { /* ... */ };

// components/shared/ErrorMessage.tsx
export const ErrorMessage = ({ error, retry }) => { /* ... */ };
```

#### Empty States
```typescript
// components/shared/EmptyState.tsx
export const EmptyState = ({ title, description, action }) => { /* ... */ };
```

---

## STATE MANAGEMENT

### Zustand Stores

#### City Store
```typescript
// stores/cityStore.ts
import { create } from 'zustand';

interface CityStore {
  cities: City[];
  selectedCity: City | null;
  cityContext: CityContext | null;
  loading: boolean;
  error: string | null;
  
  fetchCities: () => Promise<void>;
  selectCity: (cityId: string) => void;
  fetchCityContext: (cityId: string) => Promise<void>;
  createCity: (cityData: CityInput) => Promise<void>;
}

export const useCityStore = create<CityStore>((set, get) => ({
  cities: [],
  selectedCity: null,
  cityContext: null,
  loading: false,
  error: null,
  
  fetchCities: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true);
      set({ cities: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  selectCity: (cityId: string) => {
    const city = get().cities.find(c => c.id === cityId);
    set({ selectedCity: city });
  },
  
  fetchCityContext: async (cityId: string) => {
    const city = get().cities.find(c => c.id === cityId);
    if (!city) return;
    
    try {
      const response = await axios.post(N8N_WEBHOOK_URL + '/get-city-context', {
        city_name: city.name
      });
      set({ cityContext: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  createCity: async (cityData: CityInput) => {
    const { data } = await supabase
      .from('cities')
      .insert(cityData)
      .select()
      .single();
    
    set(state => ({ cities: [...state.cities, data] }));
  }
}));
```

#### Image Store
```typescript
// stores/imageStore.ts
interface ImageStore {
  generatedImages: GeneratedImage[];
  selectedImages: string[];
  loading: boolean;
  
  fetchImages: (filters?: ImageFilters) => Promise<void>;
  generateImages: (params: GenerateParams) => Promise<void>;
  selectImage: (imageId: string) => void;
  clearSelection: () => void;
  approveImages: (imageIds: string[], redditConfig: RedditConfig) => Promise<void>;
}
```

#### Reddit Store
```typescript
// stores/redditStore.ts
interface RedditStore {
  posts: RedditPost[];
  comments: Record<string, RedditComment[]>;
  analytics: AnalyticsData | null;
  
  fetchPosts: (cityId?: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  schedulePost: (postId: string, time: Date) => Promise<void>;
  cancelPost: (postId: string) => Promise<void>;
}
```

---

## API LAYER

### API Configuration

```typescript
// lib/api/config.ts
export const API_CONFIG = {
  n8nBaseUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

// lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: API_CONFIG.n8nBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add interceptors for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### API Functions

```typescript
// lib/api/cities.ts
export const citiesApi = {
  getCityContext: async (cityName: string) => {
    const response = await apiClient.post('/get-city-context', {
      city_name: cityName,
      context_type: 'full'
    });
    return response.data;
  }
};

// lib/api/images.ts
export const imagesApi = {
  generateImages: async (params: GenerateImageParams) => {
    const response = await apiClient.post('/generate-images', params);
    return response.data;
  }
};

// lib/api/approvals.ts
export const approvalsApi = {
  approveDesigns: async (data: ApprovalData) => {
    const response = await apiClient.post('/approve-designs', data);
    return response.data;
  }
};

// lib/api/reddit.ts
export const redditApi = {
  postToReddit: async (postId: string) => {
    const response = await apiClient.post('/post-to-reddit', {
      reddit_post_id: postId,
      immediate_post: true
    });
    return response.data;
  }
};
```

---

## DATA TYPES

```typescript
// types/index.ts

export interface City {
  id: string;
  name: string;
  state: string;
  area_code: string;
  nickname: string;
  timezone: string;
  climate: string;
  primary_sports_team: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CityContext {
  city: City;
  landmarks: Landmark[];
  cultural_elements: CulturalElement[];
  events: CityEvent[];
  catchphrases: Catchphrase[];
  design_concepts: DesignConcept[];
  reference_images: ReferenceImage[];
  color_palette: ColorPalette;
  top_landmark: string;
  cultural_vibe: string;
}

export interface GeneratedImage {
  id: string;
  city_id: string;
  design_concept_id: string;
  image_url: string;
  prompt_used: string;
  model_used: string;
  image_type: string;
  is_approved: boolean;
  approval_notes?: string;
  created_at: string;
}

export interface DesignConcept {
  id: string;
  city_id: string;
  concept_name: string;
  description: string;
  design_elements: {
    logo_style: string;
    logo_placement: string;
    hoodie_color: string;
    embroidery_color: string;
    logo_size_inches: number;
  };
  status: 'draft' | 'in_review' | 'approved' | 'produced';
  created_at: string;
}

export interface RedditPost {
  id: string;
  city_id: string;
  subreddit: string;
  reddit_post_id?: string;
  post_title: string;
  post_body: string;
  image_1_id: string;
  image_2_id: string;
  comparison_image_url: string;
  status: 'queued' | 'posted' | 'archived';
  scheduled_post_time?: string;
  actual_post_time?: string;
  upvotes: number;
  comments_count: number;
  created_at: string;
}

export interface RedditComment {
  id: string;
  reddit_post_id: string;
  reddit_comment_id: string;
  author: string;
  comment_text: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'question';
  design_preference: 'option_1' | 'option_2' | 'both' | 'neither' | 'unclear';
  is_flagged: boolean;
  flag_reason?: string;
  created_at: string;
}

export interface PromptTemplate {
  id: string;
  template_name: string;
  category: string;
  prompt_text: string;
  variables: Record<string, string>;
  model_preference: string;
  quality_score: number;
  usage_count: number;
}
```

---

## USER FLOWS

### Flow 1: Generate Images

1. User navigates to `/generate`
2. Selects city from CitySelector
3. CitySelector triggers fetch of city context
4. ConceptInput loads with city-specific suggestions
5. User types concept or selects existing
6. User selects prompt template (optional)
7. User clicks "Generate Images"
8. Loading state shows "Generating..."
9. n8n Workflow 2 runs (4 variations generated)
10. ImageGallery updates with new images
11. User can generate more or proceed to approval

### Flow 2: Approve and Post to Reddit

1. User navigates to `/approve`
2. ImageGallery shows unapproved images for selected city
3. User selects exactly 2 images
4. ApprovalInterface shows side-by-side preview
5. User configures Reddit post (subreddit, title, body, schedule)
6. User clicks "Approve and Schedule"
7. n8n Workflow 3 runs (creates comparison, queues post)
8. Success message with link to Reddit post manager
9. User can track post in `/reddit`

### Flow 3: Monitor Reddit Performance

1. User navigates to `/reddit/analytics`
2. AnalyticsDashboard loads data from Workflow 5
3. User views metrics by city, design, sentiment
4. User clicks on specific post to see comments
5. Flagged comments highlighted for review
6. User can respond to questions (manually on Reddit)

---

## ENVIRONMENT VARIABLES

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com

# Optional: For client-side analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

---

## DEPLOYMENT (Netlify)

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Build Configuration

1. Connect GitHub repo to Netlify
2. Set environment variables in Netlify dashboard
3. Configure build command: `npm run build`
4. Set publish directory: `.next`
5. Enable automatic deploys on push to main

---

## PERFORMANCE OPTIMIZATION

- Use React Query for caching API responses
- Implement lazy loading for images (react-lazyload)
- Code splitting by route
- Optimize images with Next.js Image component
- Debounce search/filter inputs
- Virtual scrolling for large image galleries (react-window)

---

## ACCESSIBILITY

- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Color contrast compliance (WCAG AA)
- Screen reader friendly

---

This frontend spec is production-ready for Claude Code to implement!
