# TMH AI Content Engine

AI-powered content generation platform for city research, asset generation, and drops management.

## LTRFL (Laid to Rest for Less)

LTRFL is the urn design and marketing workspace within TMH. It includes:
- Template library for urn concept prompts
- Concept generator with multi-variation images
- Concept approval flow and CAD pipeline hooks
- Marketing content creation (image/video ads, social posts, product photos)

### Key Routes
- `/ltrfl` - LTRFL dashboard
- `/ltrfl/templates` - Template library
- `/ltrfl/concepts` - Concepts gallery
- `/ltrfl/concepts/new` - Concept generator
- `/ltrfl/marketing` - Marketing content hub

### Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (for storage uploads)
- `OPENROUTER_API_KEY` (fallback image generation)
- `WAVESPEED_API_KEY` (primary image generation)
- `WAVESPEED_IMAGE_ENDPOINT` (optional override; defaults to WaveSpeed GPT Image 1.5 endpoint)

### Tests

Run LTRFL integration tests:
```
npx jest --runTestsByPath src/app/ltrfl/__tests__/template-library.test.tsx \
  src/app/ltrfl/__tests__/concept-generator.test.tsx \
  src/app/ltrfl/__tests__/concept-approval.test.tsx
```
