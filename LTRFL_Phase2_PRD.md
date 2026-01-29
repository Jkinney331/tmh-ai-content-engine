# LTRFL Phase 2: CAD Conversion Pipeline
## PRD.md - Ralph Wiggums Executable Spec for Claude Code

---

## Context

Phase 2 adds the CAD conversion pipeline to LTRFL. When users approve an urn concept image, they can generate CAD files for manufacturing. This includes auto-populated specs based on urn category, an editable form, and integration with FreeCAD MCP for mesh generation.

**Prerequisite:** Phase 1 must be complete (all tasks marked `[x]` in Phase 1 PRD).

---

## The Rule (CRITICAL - Read Every Time)

1. Read this entire file first.
2. Find the FIRST unchecked task (marked `[ ]`).
3. Execute that task AND ONLY that task.
4. Verify it works (run build, test, or manual verification as specified).
5. If successful, mark it as `[x]` in this file.
6. Commit the code with message: `[LTRFL-P2-XX] <task description>`
7. If ALL tasks are `[x]`, output exactly: `<promise>PHASE_2_COMPLETE</promise>`

---

## Pre-Flight Checklist

Before starting Phase 2:

- [ ] **CONFIRM:** Phase 1 is 100% complete
- [ ] **CONFIRM:** FreeCAD installed on development machine (or accessible via MCP)
- [ ] **CONFIRM:** OpenSCAD installed as fallback option
- [ ] **CONFIRM:** Supabase storage configured for CAD files

---

## Reference: Urn Specification Defaults

### By Urn Type

| Type | Volume | Height | Diameter | Wall | Access Method |
|------|--------|--------|----------|------|---------------|
| Traditional (Adult) | 200 cu in | 170-210mm | 100-120mm | 3mm | top_lid |
| Figurine (Adult) | 200 cu in | varies | varies | 2-3mm | bottom_loading |
| Keepsake | 1-20 cu in | 50-80mm | 40-60mm | 2mm | top_lid |

### By Material

| Material | Wall Thickness | Notes |
|----------|----------------|-------|
| Resin (SLA) | 2-3mm | High detail, smooth finish |
| Biodegradable (PLA) | 3-4mm | Slightly thicker for strength |
| Ceramic | 4-6mm | Fired clay requirements |
| Aluminum | 2-3mm | Metal printing/machining |

### Bottom-Loading Figurine Specs

```json
{
  "base_plate_specs": {
    "plate_type": "removable",
    "thickness_mm": 3,
    "screw_count": 4,
    "screw_type": "M3 stainless",
    "gasket": true,
    "gasket_material": "silicone",
    "felt_pad": true
  }
}
```

---

## Task List - Phase 2

### Section A: CAD Spec Form & Auto-Population

- [ ] **A1: Create CAD spec auto-population service**
    - *File:* `src/services/cadSpecDefaults.ts`
    - *Function:* `getDefaultSpecs(category: string, urnType: string, material: string)`
    - *Returns:* Default values for all CAD spec fields based on inputs
    - *Logic:*
      - Figurine urns default to bottom_loading
      - Traditional urns default to top_lid
      - Volume always 200 cu in for adult, 10 cu in for keepsake
      - Wall thickness varies by material
    - *Verification:* Unit test passes for all urn type combinations

- [ ] **A2: Create CADSpecForm component**
    - *Route:* `/ltrfl/concepts/:id/cad-specs`
    - *Sections:*
      1. Basic Info (read-only: concept image, prompt)
      2. Urn Type selector (traditional, figurine, keepsake)
      3. Material selector (resin, biodegradable, ceramic, aluminum)
      4. Dimensions (auto-populated, editable)
      5. Access Method (conditional based on type)
      6. Base Plate Specs (shown only for figurines)
      7. Engraving Area (optional)
    - *Verification:* Form renders with all fields

- [ ] **A3: Implement auto-populate on type/material change**
    - *Behavior:*
      - When user changes urn type or material
      - Call `getDefaultSpecs()` 
      - Pre-fill dimension fields
      - Show toast: "Specs auto-populated based on selection"
      - User can still edit all values
    - *Verification:* Changing type updates fields instantly

- [ ] **A4: Add dimension validation**
    - *Rules:*
      - Volume must be > 0 and < 500 cu in
      - Height, diameter, wall thickness must be positive
      - Wall thickness minimum 1.5mm
      - If figurine, base_plate_specs required
    - *Error display:* Inline field errors, prevent submission
    - *Verification:* Cannot submit invalid specs

- [ ] **A5: Create base plate specs sub-form**
    - *Fields:*
      - Plate type (removable, press-fit, permanent)
      - Thickness (mm)
      - Screw count (2, 4, 6)
      - Screw type (M2, M3, M4)
      - Gasket (yes/no)
      - Felt pad (yes/no)
    - *Shown:* Only when access_method = 'bottom_loading'
    - *Verification:* Sub-form toggles correctly

- [ ] **A6: Create engraving area specification**
    - *Fields:*
      - Has engraving area (yes/no)
      - Width (mm)
      - Height (mm)
      - Position (front, back, side, base)
      - Depth (mm, for engraved vs raised)
    - *Verification:* Engraving specs save correctly

- [ ] **A7: Save CAD specs to database**
    - *On submit:*
      - Validate all fields
      - Insert into `ltrfl_cad_specs` table
      - Update concept status to 'cad_pending'
      - Navigate to CAD generation status page
    - *Verification:* Specs saved, status updated

---

### Section B: FreeCAD MCP Integration

- [ ] **B1: Install and configure FreeCAD MCP**
    - *Installation:*
      ```bash
      # In terminal
      pip install freecad-mcp
      # Or via uvx
      uvx freecad-mcp
      ```
    - *Configuration:* Add to MCP config (Claude Code or project config)
    - *Verification:* MCP server responds to ping

- [ ] **B2: Create FreeCAD service wrapper**
    - *File:* `src/services/freecadService.ts`
    - *Functions:*
      - `createUrnDocument(specs: CADSpecs): Promise<string>` - Returns document ID
      - `generateMesh(docId: string, format: 'STL' | 'OBJ'): Promise<Buffer>`
      - `getDocumentStatus(docId: string): Promise<'processing' | 'complete' | 'error'>`
    - *Verification:* Can create basic document via API

- [ ] **B3: Create urn shape generation functions**
    - *Traditional urn shape:*
      ```python
      # Pseudo-code for FreeCAD
      - Create cylinder for body
      - Create sphere/dome for lid
      - Boolean union
      - Shell operation for wall thickness
      - Add lid cutline
      ```
    - *Figurine base (interior only):*
      - Create internal cavity
      - Base plate cutout
      - Screw holes
    - *Verification:* Can generate basic cylinder urn shape

- [ ] **B4: Implement shape-from-silhouette for figurines**
    - *Approach:*
      - Use approved concept image
      - Extract silhouette
      - Generate rotation solid OR
      - Create simplified mesh approximation
    - *Fallback:* If complex, generate interior cavity only with placeholder exterior
    - *Verification:* Can generate mesh from simple figurine image

- [ ] **B5: Add export format options**
    - *Formats:*
      - STL (default, for 3D printing)
      - OBJ (with materials)
      - STEP (for CNC/professional)
      - 3MF (for modern slicers)
    - *UI:* Format selector before/during generation
    - *Verification:* Can export in all 4 formats

---

### Section C: OpenSCAD Fallback (Parametric)

- [ ] **C1: Install and configure OpenSCAD MCP**
    - *Installation:*
      ```bash
      npx -y openscad-mcp-server
      ```
    - *Verification:* Server responds

- [ ] **C2: Create OpenSCAD service wrapper**
    - *File:* `src/services/openscadService.ts`
    - *Functions:*
      - `generateSCADCode(specs: CADSpecs): string`
      - `renderToMesh(scadCode: string, format: string): Promise<Buffer>`
    - *Verification:* Can render basic SCAD code

- [ ] **C3: Create parametric urn templates in OpenSCAD**
    - *Templates:*
      ```scad
      // Traditional urn
      module traditional_urn(height, diameter, wall, lid_height) {
        difference() {
          union() {
            cylinder(h=height-lid_height, d=diameter);
            translate([0,0,height-lid_height])
              sphere(d=diameter*0.8);
          }
          // Hollow interior
          translate([0,0,wall])
            cylinder(h=height, d=diameter-wall*2);
        }
      }
      ```
    - *Verification:* Templates render correctly

- [ ] **C4: Implement fallback logic**
    - *Flow:*
      1. Try FreeCAD first
      2. If FreeCAD fails or times out (30s)
      3. Fall back to OpenSCAD parametric
      4. Log which method used
    - *Verification:* Fallback triggers when FreeCAD unavailable

---

### Section D: CAD Generation Workflow UI

- [ ] **D1: Create CADGenerationStatus page**
    - *Route:* `/ltrfl/concepts/:id/cad-status`
    - *Display:*
      - Concept image thumbnail
      - Specs summary
      - Generation progress (spinner/progress bar)
      - Status messages ("Initializing...", "Generating mesh...", etc.)
      - Estimated time remaining (if available)
    - *Verification:* Page shows during generation

- [ ] **D2: Implement real-time status updates**
    - *Options:*
      - Polling every 2 seconds
      - OR Supabase realtime subscription
    - *Status transitions:*
      - pending → generating → complete/failed
    - *Verification:* Status updates automatically

- [ ] **D3: Create CADComplete view**
    - *Display:*
      - 3D preview of generated mesh (use three.js or similar)
      - Download buttons for each format
      - Specs summary
      - "Regenerate" button
      - "Edit Specs" button
    - *Verification:* Can view and download generated CAD

- [ ] **D4: Implement 3D preview component**
    - *Library:* three.js (already available per artifacts config)
    - *Features:*
      - Load STL/OBJ file
      - Rotate with mouse drag
      - Zoom with scroll
      - Reset view button
    - *Verification:* 3D model renders and is interactive

- [ ] **D5: Implement file download functionality**
    - *Flow:*
      - Fetch file from Supabase storage
      - Trigger browser download
      - Track download in analytics (optional)
    - *File naming:* `{concept_name}_{version}_{format}.{ext}`
    - *Verification:* Downloaded file opens in 3D software

- [ ] **D6: Add regeneration with modified specs**
    - *Flow:*
      - User clicks "Edit Specs"
      - Returns to CADSpecForm with current values
      - On save, creates new CAD generation
      - Old CAD files preserved (versioning)
    - *Verification:* Can regenerate with different specs

---

### Section E: Storage & Versioning

- [ ] **E1: Create Supabase storage bucket for CAD files**
    - *Bucket name:* `ltrfl-cad-files`
    - *Structure:* `{concept_id}/{version}/urn.{format}`
    - *Verification:* Bucket created with correct policies

- [ ] **E2: Implement CAD file upload service**
    - *Function:* `uploadCADFile(conceptId, version, buffer, format)`
    - *Returns:* Public URL or signed URL
    - *Verification:* File uploads and URL works

- [ ] **E3: Update concept status on CAD completion**
    - *On success:*
      - Update `ltrfl_cad_specs.status` = 'complete'
      - Update `ltrfl_cad_specs.cad_file_url` with URL
      - Update `ltrfl_concepts.status` = 'cad_complete'
    - *On failure:*
      - Update status = 'failed'
      - Store error message
      - Allow retry
    - *Verification:* Status flows work correctly

- [ ] **E4: Add CAD version history to concept detail**
    - *Display:*
      - List of all CAD generations for this concept
      - Date, specs summary, status
      - Download links for completed
      - Delete option for failed/unwanted
    - *Verification:* History displays correctly

---

### Section F: Testing & Error Handling

- [ ] **F1: Add comprehensive error handling for CAD generation**
    - *Errors to handle:*
      - FreeCAD connection failed
      - Generation timeout
      - Invalid specs
      - File upload failed
      - Mesh generation error
    - *UI:* Clear error messages with suggested actions
    - *Verification:* All error states have UI

- [ ] **F2: Add retry mechanism**
    - *Automatic:* Retry once on transient failures
    - *Manual:* "Retry" button on failed generations
    - *Limit:* Max 3 retries
    - *Verification:* Retry works, doesn't infinite loop

- [ ] **F3: Write integration tests for CAD pipeline**
    - *Tests:*
      - Spec form validation
      - Auto-populate logic
      - FreeCAD service (mock)
      - OpenSCAD fallback
      - File upload
      - Status updates
    - *Verification:* All tests pass

- [ ] **F4: Add loading skeletons for CAD views**
    - *Components:*
      - CAD spec form loading
      - 3D preview loading
      - Generation status loading
    - *Verification:* No empty states flash

- [ ] **F5: Performance optimization**
    - *Optimizations:*
      - Lazy load 3D viewer
      - Compress CAD files before upload
      - Cache downloaded files
    - *Verification:* 3D preview loads under 3 seconds

- [ ] **F6: Final Phase 2 review**
    - *Checklist:*
      - All CAD formats generate correctly
      - Files downloadable and valid
      - Versioning works
      - Error states handled
      - No console errors
      - TypeScript clean
    - *Verification:* `npm run build` passes

---

## Progress Log

*Append notes here after each task completion:*

```
[Date] [Task] - Notes
---
```

---

## Environment Variables Needed (Phase 2 additions)

```env
# FreeCAD MCP
FREECAD_MCP_ENABLED=true
FREECAD_TIMEOUT_MS=30000

# OpenSCAD (fallback)
OPENSCAD_PATH=/usr/bin/openscad
OPENSCAD_TIMEOUT_MS=60000

# CAD Storage
SUPABASE_CAD_BUCKET=ltrfl-cad-files
```

---

## Completion Criteria

Phase 2 is complete when:
- [ ] All tasks above marked `[x]`
- [ ] Approved concepts can proceed to CAD spec form
- [ ] Specs auto-populate based on urn type and material
- [ ] All spec fields are editable
- [ ] FreeCAD generates mesh files
- [ ] OpenSCAD works as fallback
- [ ] Can export STL, OBJ, STEP, 3MF
- [ ] 3D preview works
- [ ] Files downloadable
- [ ] Versioning preserved
- [ ] All tests pass

When all complete, output: `<promise>PHASE_2_COMPLETE</promise>`
