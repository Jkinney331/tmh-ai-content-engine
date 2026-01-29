# LTRFL Feature Testing Plan
## Comprehensive QA Strategy for Phases 1-3

---

## Overview

This document outlines the testing strategy for the LTRFL feature across all three phases. Tests should be written alongside feature development and run before marking tasks complete.

---

## Testing Stack Assumptions

*(Confirm with AI dev and update accordingly)*

- **Unit Tests:** Jest / Vitest
- **Component Tests:** React Testing Library
- **E2E Tests:** Playwright / Cypress
- **API Tests:** Supertest or similar
- **Database Tests:** Supabase test helpers

---

## Phase 1 Testing

### Unit Tests

#### Template Service Tests
```typescript
// src/services/__tests__/templateService.test.ts

describe('Template Service', () => {
  test('getTemplates returns paginated results', async () => {
    // Setup: Seed 30 templates
    // Action: Call getTemplates({ page: 1, limit: 20 })
    // Assert: Returns 20 items, hasNextPage = true
  });

  test('getTemplates filters by category', async () => {
    // Setup: Seed templates in different categories
    // Action: Call getTemplates({ category: 'Sports' })
    // Assert: Only Sports templates returned
  });

  test('searchTemplates finds by name', async () => {
    // Setup: Create template named "Baseball Memorial"
    // Action: Search "baseball"
    // Assert: Template found
  });

  test('createTemplate validates required fields', async () => {
    // Action: Create template without name
    // Assert: Throws validation error
  });

  test('updateTemplate preserves unchanged fields', async () => {
    // Setup: Create template
    // Action: Update only name
    // Assert: Other fields unchanged
  });

  test('deleteTemplate sets is_active false', async () => {
    // Setup: Create active template
    // Action: Delete template
    // Assert: is_active = false, still exists in DB
  });
});
```

#### Concept Service Tests
```typescript
// src/services/__tests__/conceptService.test.ts

describe('Concept Service', () => {
  test('createConcept saves with draft status', async () => {
    // Action: Create new concept
    // Assert: status = 'draft', version = 1
  });

  test('createConcept links to template if provided', async () => {
    // Setup: Create template
    // Action: Create concept from template
    // Assert: template_id populated
  });

  test('approveConceptImage sets selected index', async () => {
    // Setup: Create concept with 4 images
    // Action: Select image at index 2
    // Assert: selected_image_index = 2
  });

  test('approveConceptImage updates status', async () => {
    // Setup: Concept in 'reviewing' status
    // Action: Approve
    // Assert: status = 'approved'
  });

  test('createNewVersion increments version number', async () => {
    // Setup: Concept at version 2
    // Action: Create new version
    // Assert: New concept version = 3, parent_version_id set
  });

  test('getVersionHistory returns all versions', async () => {
    // Setup: Create concept, then 2 new versions
    // Action: Get version history
    // Assert: Returns 3 items in order
  });
});
```

#### Image Generation Tests
```typescript
// src/services/__tests__/wavespeedService.test.ts

describe('Wavespeed Image Generation', () => {
  test('generateImages returns correct count', async () => {
    // Action: Generate 4 images
    // Assert: Returns array of 4 URLs
  });

  test('generateImages handles API timeout', async () => {
    // Setup: Mock slow response
    // Action: Generate images
    // Assert: Throws timeout error after configured duration
  });

  test('generateImages retries on transient failure', async () => {
    // Setup: Mock first call fails, second succeeds
    // Action: Generate images
    // Assert: Returns images (retried successfully)
  });

  test('generateImages validates prompt length', async () => {
    // Action: Call with empty prompt
    // Assert: Throws validation error
  });
});
```

### Component Tests

#### TemplateLibrary Component
```typescript
// src/components/__tests__/TemplateLibrary.test.tsx

describe('TemplateLibrary', () => {
  test('renders loading state initially', () => {
    // Render component
    // Assert: Loading skeleton visible
  });

  test('renders template cards after load', async () => {
    // Setup: Mock API to return 5 templates
    // Render and wait
    // Assert: 5 cards visible
  });

  test('category filter updates list', async () => {
    // Render with templates
    // Click "Sports" category
    // Assert: Only Sports templates shown
  });

  test('search filters by name', async () => {
    // Render with templates
    // Type in search box
    // Assert: Filtered results
  });

  test('clicking template opens editor', async () => {
    // Render with templates
    // Click a template card
    // Assert: Editor modal opens
  });

  test('empty state shown when no templates', async () => {
    // Setup: Mock API returns empty
    // Render
    // Assert: Empty state message visible
  });
});
```

#### ConceptGenerator Component
```typescript
// src/components/__tests__/ConceptGenerator.test.tsx

describe('ConceptGenerator', () => {
  test('template selector populates prompt', async () => {
    // Setup: Templates exist
    // Select a template
    // Assert: Prompt textarea populated
  });

  test('generate button disabled without prompt', () => {
    // Render
    // Assert: Generate button disabled
  });

  test('generate button shows loading during generation', async () => {
    // Fill prompt
    // Click generate
    // Assert: Loading state shown
  });

  test('generated images display in grid', async () => {
    // Setup: Mock successful generation
    // Generate
    // Assert: 4 images in grid
  });

  test('can select an image', async () => {
    // Setup: Images generated
    // Click select on image 2
    // Assert: Image 2 marked selected
  });

  test('approve button requires selection', () => {
    // Setup: Images generated, none selected
    // Assert: Approve button disabled
  });

  test('approve navigates to CAD specs', async () => {
    // Setup: Image selected
    // Click approve
    // Assert: Navigation to /ltrfl/concepts/:id/cad-specs
  });
});
```

### E2E Tests

```typescript
// e2e/ltrfl-phase1.spec.ts

describe('LTRFL Phase 1 E2E', () => {
  beforeEach(async () => {
    // Login as test user
    // Navigate to LTRFL tab
  });

  test('complete template CRUD flow', async () => {
    // Go to Template Library
    // Click "Create Template"
    // Fill form, save
    // Verify template in list
    // Edit template
    // Verify changes
    // Delete template
    // Verify removed from list
  });

  test('complete concept generation flow', async () => {
    // Go to Concept Generator
    // Select template
    // Click Generate
    // Wait for images
    // Select an image
    // Click Approve
    // Verify status updated to 'approved'
  });

  test('version history works correctly', async () => {
    // Create concept
    // Approve
    // Click "Create New Version"
    // Modify prompt
    // Generate new images
    // Verify version number incremented
    // Verify original version accessible
  });
});
```

---

## Phase 2 Testing

### Unit Tests

#### CAD Spec Defaults Tests
```typescript
// src/services/__tests__/cadSpecDefaults.test.ts

describe('CAD Spec Defaults', () => {
  test('traditional urn gets top_lid access', () => {
    const specs = getDefaultSpecs('Sports', 'traditional', 'resin');
    expect(specs.access_method).toBe('top_lid');
  });

  test('figurine urn gets bottom_loading access', () => {
    const specs = getDefaultSpecs('Pets', 'figurine', 'ceramic');
    expect(specs.access_method).toBe('bottom_loading');
  });

  test('keepsake urn has smaller volume', () => {
    const specs = getDefaultSpecs('Memorial', 'keepsake', 'resin');
    expect(specs.volume_cu_in).toBeLessThan(30);
  });

  test('aluminum has correct wall thickness', () => {
    const specs = getDefaultSpecs('Sports', 'traditional', 'aluminum');
    expect(specs.wall_thickness_mm).toBe(2);
  });

  test('biodegradable has thicker walls', () => {
    const specs = getDefaultSpecs('Nature', 'traditional', 'biodegradable');
    expect(specs.wall_thickness_mm).toBeGreaterThanOrEqual(3);
  });

  test('figurine includes base plate specs', () => {
    const specs = getDefaultSpecs('Pets', 'figurine', 'resin');
    expect(specs.base_plate_specs).toBeDefined();
    expect(specs.base_plate_specs.plate_type).toBe('removable');
  });
});
```

#### FreeCAD Service Tests
```typescript
// src/services/__tests__/freecadService.test.ts

describe('FreeCAD Service', () => {
  test('createUrnDocument returns document ID', async () => {
    const specs = mockCADSpecs('traditional');
    const docId = await createUrnDocument(specs);
    expect(docId).toMatch(/^[a-f0-9-]+$/);
  });

  test('generateMesh returns buffer for STL', async () => {
    const docId = 'test-doc-123';
    const buffer = await generateMesh(docId, 'STL');
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  test('generateMesh supports all formats', async () => {
    const formats = ['STL', 'OBJ', 'STEP', '3MF'];
    for (const format of formats) {
      const buffer = await generateMesh('test-doc', format);
      expect(buffer).toBeDefined();
    }
  });

  test('handles FreeCAD timeout gracefully', async () => {
    // Setup: Mock slow FreeCAD response
    await expect(createUrnDocument(mockSpecs)).rejects.toThrow('Timeout');
  });
});
```

#### OpenSCAD Fallback Tests
```typescript
// src/services/__tests__/openscadService.test.ts

describe('OpenSCAD Service', () => {
  test('generateSCADCode produces valid code', () => {
    const specs = mockCADSpecs('traditional');
    const code = generateSCADCode(specs);
    expect(code).toContain('module');
    expect(code).toContain(specs.height_mm.toString());
  });

  test('renderToMesh produces STL output', async () => {
    const code = 'sphere(r=10);';
    const buffer = await renderToMesh(code, 'stl');
    expect(buffer).toBeInstanceOf(Buffer);
  });

  test('fallback triggers when FreeCAD fails', async () => {
    // Setup: Mock FreeCAD to fail
    const result = await generateCADWithFallback(mockSpecs);
    expect(result.method).toBe('openscad');
    expect(result.file).toBeDefined();
  });
});
```

### Component Tests

#### CADSpecForm Component
```typescript
// src/components/__tests__/CADSpecForm.test.tsx

describe('CADSpecForm', () => {
  test('auto-populates on urn type change', async () => {
    // Render with concept
    // Change urn type to "figurine"
    // Assert: access_method changed to "bottom_loading"
    // Assert: base_plate_specs section visible
  });

  test('auto-populates on material change', async () => {
    // Change material to "aluminum"
    // Assert: wall_thickness updated
  });

  test('validates minimum wall thickness', async () => {
    // Enter wall thickness = 0.5
    // Assert: Validation error shown
  });

  test('base plate section only shows for figurines', async () => {
    // Select "traditional" type
    // Assert: Base plate section hidden
    // Select "figurine" type
    // Assert: Base plate section visible
  });

  test('submit saves specs and updates status', async () => {
    // Fill valid form
    // Submit
    // Assert: API called with correct data
    // Assert: Navigates to CAD status page
  });
});
```

#### 3D Preview Component
```typescript
// src/components/__tests__/ThreeDPreview.test.tsx

describe('ThreeDPreview', () => {
  test('loads and renders STL file', async () => {
    // Provide STL file URL
    // Wait for render
    // Assert: Canvas contains mesh
  });

  test('mouse drag rotates model', async () => {
    // Render with model
    // Simulate mouse drag
    // Assert: Camera position changed
  });

  test('scroll zooms model', async () => {
    // Render with model
    // Simulate scroll
    // Assert: Camera zoom changed
  });

  test('reset button restores initial view', async () => {
    // Rotate and zoom
    // Click reset
    // Assert: Camera at initial position
  });
});
```

### E2E Tests

```typescript
// e2e/ltrfl-phase2.spec.ts

describe('LTRFL Phase 2 E2E', () => {
  test('complete CAD generation flow', async () => {
    // Start with approved concept
    // Navigate to CAD specs
    // Verify auto-population
    // Modify specs
    // Submit for generation
    // Wait for completion
    // Verify 3D preview loads
    // Download STL file
    // Verify file downloads
  });

  test('CAD version history preserved', async () => {
    // Generate CAD for concept
    // Edit specs and regenerate
    // Verify both versions in history
    // Can download both versions
  });

  test('handles generation failure gracefully', async () => {
    // Setup: Force generation to fail
    // Submit specs
    // Verify error message shown
    // Retry button visible
    // Click retry
    // Verify retry attempts
  });
});
```

---

## Phase 3 Testing

### Unit Tests

#### Marketing Content Service Tests
```typescript
// src/services/__tests__/marketingService.test.ts

describe('Marketing Content Service', () => {
  test('createVideoAd saves with correct type', async () => {
    const result = await createContent({ type: 'video_ad', ... });
    expect(result.content_type).toBe('video_ad');
  });

  test('caption generator respects platform limits', async () => {
    const caption = await generateCaption({ platform: 'twitter', prompt: '...' });
    expect(caption.length).toBeLessThanOrEqual(280);
  });

  test('hashtag suggestions based on category', async () => {
    const tags = await suggestHashtags({ category: 'Pets' });
    expect(tags).toContain('#PetMemorial');
  });

  test('scheduling sets correct date', async () => {
    const scheduleDate = new Date('2025-02-01');
    const content = await scheduleContent(contentId, scheduleDate);
    expect(content.scheduled_date).toEqual(scheduleDate);
  });

  test('publishing updates status', async () => {
    const content = await publishContent(contentId);
    expect(content.status).toBe('published');
  });
});
```

### Component Tests

```typescript
// src/components/__tests__/VideoAdGenerator.test.tsx

describe('VideoAdGenerator', () => {
  test('duration options match platform requirements', async () => {
    // Select TikTok
    // Assert: Duration options include 15s, 30s, 60s
  });

  test('aspect ratio updates with platform', async () => {
    // Select Instagram Reels
    // Assert: 9:16 selected by default
  });

  test('preview plays generated video', async () => {
    // Generate video
    // Assert: Video player shows
    // Assert: Can play/pause
  });
});

// src/components/__tests__/ContentCalendar.test.tsx

describe('ContentCalendar', () => {
  test('shows dots on scheduled dates', async () => {
    // Setup: Content scheduled on Jan 15
    // Assert: Jan 15 has indicator dot
  });

  test('clicking date shows scheduled content', async () => {
    // Click on date with content
    // Assert: Content list appears
  });

  test('drag reschedules content', async () => {
    // Drag content from Jan 15 to Jan 20
    // Assert: Content rescheduled
    // Assert: Database updated
  });
});
```

### E2E Tests

```typescript
// e2e/ltrfl-phase3.spec.ts

describe('LTRFL Phase 3 E2E', () => {
  test('create and publish video ad', async () => {
    // Navigate to Video Ads
    // Create new ad
    // Select template
    // Configure settings
    // Generate video
    // Preview
    // Approve
    // Schedule
    // Verify on calendar
  });

  test('create carousel image ad', async () => {
    // Navigate to Image Ads
    // Create carousel
    // Add 4 slides
    // Reorder slides
    // Preview carousel flow
    // Export
  });

  test('generate social posts for all platforms', async () => {
    const platforms = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn'];
    for (const platform of platforms) {
      // Create post for platform
      // Verify character limit enforced
      // Verify hashtag suggestions
    }
  });

  test('product photography full flow', async () => {
    // Select urn concept
    // Choose photography style
    // Select template from Prompt Library
    // Customize prompt
    // Generate 4 variations
    // Select best
    // Save to library
    // Verify in Product Photo library
  });
});
```

---

## Performance Tests

```typescript
// performance/ltrfl-performance.spec.ts

describe('LTRFL Performance', () => {
  test('template library loads under 2 seconds', async () => {
    const start = Date.now();
    await page.goto('/ltrfl/templates');
    await page.waitForSelector('[data-testid="template-card"]');
    expect(Date.now() - start).toBeLessThan(2000);
  });

  test('image generation completes under 30 seconds', async () => {
    // Trigger generation
    // Wait for completion
    // Assert: Under 30 seconds
  });

  test('CAD generation completes under 60 seconds', async () => {
    // Submit CAD specs
    // Wait for complete status
    // Assert: Under 60 seconds
  });

  test('3D preview loads under 3 seconds', async () => {
    // Navigate to CAD preview
    // Wait for model render
    // Assert: Under 3 seconds
  });

  test('calendar renders with 100+ items smoothly', async () => {
    // Seed 100 scheduled content items
    // Load calendar
    // Assert: No visible lag
    // Assert: Frame rate acceptable
  });
});
```

---

## Accessibility Tests

```typescript
// accessibility/ltrfl-a11y.spec.ts

describe('LTRFL Accessibility', () => {
  test('template library is keyboard navigable', async () => {
    // Tab through template cards
    // Enter opens detail
    // Escape closes
  });

  test('image selection works with keyboard', async () => {
    // Tab to images
    // Space/Enter selects
    // Arrow keys navigate
  });

  test('forms have proper labels', async () => {
    // Run axe-core on CAD spec form
    // Assert: No label violations
  });

  test('color contrast meets WCAG AA', async () => {
    // Run contrast check on all pages
    // Assert: All text meets 4.5:1 ratio
  });

  test('screen reader announces status changes', async () => {
    // Trigger generation
    // Assert: aria-live region announces progress
  });
});
```

---

## Test Data Fixtures

```typescript
// tests/fixtures/ltrfl.ts

export const mockTemplate = {
  id: 'template-123',
  category: 'Sports',
  subcategory: 'Baseball',
  name: 'Baseball Glove Memorial',
  prompt: 'Product photography of LTRFL baseball glove memorial keeper...',
  variables: { color: 'brown', personalization: '' },
  is_active: true
};

export const mockConcept = {
  id: 'concept-456',
  template_id: 'template-123',
  prompt_used: 'Product photography of LTRFL baseball glove...',
  category: 'Sports',
  images: ['url1', 'url2', 'url3', 'url4'],
  selected_image_index: null,
  status: 'reviewing',
  version: 1
};

export const mockCADSpecs = (urnType = 'traditional') => ({
  urn_type: urnType,
  material: 'resin',
  volume_cu_in: 200,
  height_mm: 180,
  diameter_mm: 110,
  wall_thickness_mm: 3,
  access_method: urnType === 'figurine' ? 'bottom_loading' : 'top_lid',
  base_plate_specs: urnType === 'figurine' ? {
    plate_type: 'removable',
    thickness_mm: 3,
    screw_count: 4
  } : null
});

export const mockMarketingContent = {
  id: 'content-789',
  content_type: 'image_ad',
  title: 'Memorial Keepers Ad',
  platform: 'Instagram',
  status: 'draft'
};
```

---

## CI/CD Integration

```yaml
# .github/workflows/ltrfl-tests.yml

name: LTRFL Tests

on:
  push:
    paths:
      - 'src/features/ltrfl/**'
      - 'src/services/ltrfl/**'
  pull_request:
    paths:
      - 'src/features/ltrfl/**'

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:a11y
```

---

## Test Coverage Goals

| Phase | Unit Tests | Component Tests | E2E Tests | Coverage Target |
|-------|------------|-----------------|-----------|-----------------|
| Phase 1 | 30+ | 20+ | 5+ | 80%+ |
| Phase 2 | 25+ | 15+ | 3+ | 80%+ |
| Phase 3 | 35+ | 25+ | 8+ | 80%+ |

---

## Testing Checklist per Task

Before marking any task `[x]` in the PRD:

- [ ] Unit tests written and passing
- [ ] Component tests written and passing (if UI)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Manual smoke test passes
- [ ] Code reviewed (if team)

---

*Testing Plan Version: 1.0*
*Last Updated: January 2025*
