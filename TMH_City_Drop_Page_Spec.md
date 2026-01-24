# TMH City Intelligence — City & Drop Inventory

Date: 2026-01-23  
Scope: City list, City Profile page sections/actions, Drop Profile page sections/actions  
Sources: `src/data/cities.ts`, `src/components/city/city-profile.tsx`, `src/components/drop/drop-profile.tsx`

## 1) Cities (Current List)
Tier | City | Country | ID | Last Activity
---|---|---|---|---
T1 | Tokyo | Japan | `tokyo` | 2m ago
T1 | Shanghai | China | `shanghai` | 10m ago
T1 | Seoul | South Korea | `seoul` | 25m ago
T1 | London | United Kingdom | `london` | 1h ago
T1 | Paris | France | `paris` | 2h ago
T1 | New York | United States | `new-york` | 3h ago
T2 | Los Angeles | United States | `los-angeles` | 5h ago
T2 | Detroit | United States | `detroit` | 8h ago
T2 | Chicago | United States | `chicago` | 1d ago
T2 | Miami | United States | `miami` | 1d ago
T3 | Compton | United States | `compton` | 2d ago

## 2) City Profile Page — Sections & Actions

### 2.1 City Header
- Title: Flag + City Name
- Metadata: Country, research status chip
- Actions: `Start Research`, `Add Note`, `Export`
- Stats cards: Population, Streetwear Shops, Market Growth, Avg Spend

### 2.2 Research Insights
- Actions: `Ask AI about Research`, `Add Research Note`
- Collapsible subsections:
  - Research Snapshot
  - Signal Pulse
  - Cultural Signals
  - Streetwear Landscape
  - Local Slang
  - Color Palettes
  - Typography Inspiration
  - Key Landmarks
  - Trending Sounds / Music
  - Notable Local Creators
  - What to Avoid

### 2.3 Your Notes
- Action: `Pin Note`
- Content: free-form notes textarea
- Metadata: last edited timestamp, character count

### 2.4 Design Concepts
- Actions: `Generate 5 Concepts`, `Generate More`
- Concept card fields:
  - Concept Name
  - Description
  - Suggested Colorways
  - Suggested Placement
  - Tagline / Slang
- Card actions:
  - `Thumbs Up`
  - `Thumbs Down` (opens rejection modal)
  - `Generate Assets` (visible when approved)

### 2.5 Generate Assets Modal
- Concept summary
- Asset type checkboxes (first 6 types)
- Quantity per type
- Model / Pipeline selector
- Estimated Cost
- Actions: `Generate`, `Cancel`

### 2.6 Generated Assets
- Section actions: `Generate New Assets`, `Upload`
- Collapsible subsections by asset type:
  - Product Shots (with models)
  - Product Shots (without models)
  - Ghost Mannequin (photo)
  - Ghost Mannequin (video)
  - Lifestyle / Scene Shots
  - TikTok Ads
  - IG Ads
  - Community Content
- Asset card fields:
  - Asset type tag
  - Timestamp
  - Preview placeholder
  - Concept link
- Asset card actions:
  - `Approve`
  - `Reject` (opens rejection modal)
  - `Regenerate`
  - `View Full`
  - `Edit`
  - `Download`

### 2.7 Approved for Drop
- Actions: Drop selector, `Add to Drop`
- Staging grid with:
  - Checkbox
  - Timestamp
  - Preview placeholder
  - Concept label

### 2.8 Insights (Agentic Transparency)
- Actions: `Ask AI about Insights`, `Create Action Plan`
- Panels:
  - Execution Plan
  - Reasoning Summary
  - Audit Trail

### 2.9 Rejection Modal
- Title: "Why didn’t this work?"
- Feedback textarea
- Quick tags: Wrong vibe, Off-brand, Low quality, Overdone, Other
- Actions: `Submit`, `Skip`, `Close`

## 3) Drop Profile Page — Sections & Actions

### 3.1 Drop Header
- Fields: Drop name (editable), launch date (date picker), status badge
- Actions: `Generate Social Ideas` (primary), `Edit Drop`, `Export Drop`
- Summary cards: Cities in Drop, Total Approved Assets, Days Until Launch, Status
- Informational note about correlative social ideas

### 3.2 Cities in Drop
- Actions: `Add City`, `Manage Cities`
- City cards:
  - Flag + City Name + Country
  - Tier badge
  - Asset count summary
  - Actions: `View Assets`, `Remove`

### 3.3 Individual City Content
- Per-city collapsible sections
- Asset type groups (same list as City Profile)
- Asset card actions: `View Full`, `Download`, `Remove from Drop`

### 3.4 Cross-City Collection Content
- Actions: `Generate More`, generation status badge
- Content cards:
  - Title + description
  - City flags involved
  - Actions: `Approve`, `Reject`, `Regenerate`, `View Full`

### 3.5 Social Media Content
- Subsections:
  - Single City Posts
  - All Products Together
  - Text Ads
  - Video Ads
  - Community Content
- Subsection action: `Generate`
- Content card actions: `Copy`, `Edit`, `Schedule`, `Reject`

### 3.6 Logistics
- Actions: `Add Field`, `Export Logistics`
- Default areas:
  - SKUs (table placeholder)
  - Inventory (table placeholder)
  - Pricing (table placeholder)
  - Shipping Dates (inputs)
  - Manufacturer Status (status badges)
  - Notes (textarea)

### 3.7 Launch Checklist
- Actions: `Add Item`, `Confirm Launch`
- Progress bar with completion count
- Checklist items with checkbox + priority badge

### 3.8 Rejection Modal
- Title: "Why didn't this work?"
- Feedback textarea
- Actions: `Submit Feedback`, `Cancel`

## Notes
- This document reflects the current UI implementation and mock data in the components listed above.
- Backend logic (persistence, generation, approvals, and scheduling) is not wired yet.
