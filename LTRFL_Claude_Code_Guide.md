# Claude Code Execution Guide for LTRFL PRDs
## How to Run Ralph Wiggums Style Specs in Claude Code

---

## Overview

The LTRFL feature is broken into 3 phases, each with a PRD.md file written in "Ralph Wiggums" executable spec format. This guide explains how to run these specs in Claude Code (within Cursor or standalone).

---

## The Core Loop

Each PRD file follows this exact pattern:

```
1. Read the entire PRD file
2. Find the FIRST unchecked task [ ]
3. Execute ONLY that task
4. Verify it works
5. Mark it [x] in the file
6. Commit the code
7. Repeat until all [x], then output the completion signal
```

---

## Setting Up for Claude Code

### Step 1: Place PRD Files in Project Root

```
your-tmh-project/
├── LTRFL_Phase1_PRD.md    <- Place here
├── LTRFL_Phase2_PRD.md    <- Place here
├── LTRFL_Phase3_PRD.md    <- Place here
├── LTRFL_Testing_Plan.md  <- Reference
├── LTRFL_Feature_Handoff.md <- Reference
├── src/
├── package.json
└── ...
```

### Step 2: Create CLAUDE.md Project Instructions (Optional but Recommended)

Create a `CLAUDE.md` file in your project root:

```markdown
# LTRFL Feature Development

## Current Phase
Working on: Phase 1

## Active PRD
Read: LTRFL_Phase1_PRD.md

## Execution Rule
1. Find the FIRST unchecked task `[ ]` in the PRD
2. Execute ONLY that one task
3. Verify it works
4. Mark as `[x]` 
5. Commit with message format: `[LTRFL-P1-XX] description`
6. Report completion

## Do Not
- Skip ahead to future tasks
- Execute multiple tasks at once
- Mark tasks complete without verification
- Modify the PRD structure (only checkboxes)

## Tech Stack Reference
- Frontend: [fill in from discovery]
- Database: Supabase
- Image Gen: Wavespeed API
- State: [fill in from discovery]
```

---

## Running a Task

### Method 1: Direct Instruction

Open Claude Code in your project and say:

```
Read LTRFL_Phase1_PRD.md and execute the first unchecked task.
Follow The Rule section exactly.
```

### Method 2: Continue Loop

After each task, Claude Code should know to:
1. Look for next unchecked task
2. Execute it
3. Mark complete

You can prompt:
```
Continue with the next unchecked task in LTRFL_Phase1_PRD.md
```

### Method 3: Fresh Context (True Ralph Style)

If you want each task run in completely fresh context:

```
Read LTRFL_Phase1_PRD.md from scratch.
Find the first [ ] task.
Execute only that task.
Verify it works.
Mark it [x] in the file.
Commit with appropriate message.
```

---

## Maintaining Fresh Context

### Why Fresh Context Matters

The Ralph Wiggums approach assumes the AI has NO memory between runs. This means:
- The PRD file IS the memory
- The codebase IS the state
- Each run should be independent

### Techniques for Fresh Context in Claude Code

**Option A: New Chat per Task**
- Start a new Claude Code session for each task
- Reference the PRD file fresh each time

**Option B: Explicit Reset Prompt**
```
Forget all previous context. 
Read LTRFL_Phase1_PRD.md fresh.
Find the first unchecked [ ] task.
Execute only that task.
```

**Option C: Use Progress File**

Create `LTRFL_Progress.md`:

```markdown
# LTRFL Progress Log

## Last Completed Task
- Date: 2025-01-28
- Task: A1 - Create ltrfl_templates table
- Status: Success
- Notes: Table created with all fields, RLS enabled

## Known Issues
- None yet

## Decisions Made
- Using Supabase RLS for security
- Template soft delete (is_active = false)

## Next Task
A2 - Create ltrfl_concepts table
```

Then instruct Claude Code:
```
Read LTRFL_Progress.md to understand where we are.
Read LTRFL_Phase1_PRD.md to find the next task.
Execute the next unchecked task.
Update LTRFL_Progress.md with what you did.
```

---

## Verification Before Marking Complete

Each task in the PRD has a "Verification" line. Examples:

| Task Type | Verification Method |
|-----------|---------------------|
| Database table | `SELECT * FROM table LIMIT 1;` returns no error |
| React component | Component renders without error |
| API integration | Console log shows expected response |
| Full flow | Manual test of user journey |

**Do not mark `[x]` unless verification passes.**

---

## Commit Message Format

Follow this pattern for git commits:

```
[LTRFL-P{phase}-{task}] {description}

Examples:
[LTRFL-P1-A1] Create ltrfl_templates table in Supabase
[LTRFL-P1-B2] Add LTRFL layout component with sidebar
[LTRFL-P2-B3] Implement urn shape generation in FreeCAD
[LTRFL-P3-C4] Add video ad templates
```

---

## Completion Signals

Each phase has a completion signal. When ALL tasks are `[x]`:

| Phase | Signal |
|-------|--------|
| Phase 1 | `<promise>PHASE_1_COMPLETE</promise>` |
| Phase 2 | `<promise>PHASE_2_COMPLETE</promise>` |
| Phase 3 | `<promise>PHASE_3_COMPLETE</promise>` |
| All Done | `<promise>LTRFL_FEATURE_COMPLETE</promise>` |

---

## Troubleshooting

### Task Keeps Failing

1. Check the Progress Log for previous attempts
2. Add notes about the failure to Progress Log
3. Try an alternative approach
4. If blocked, add `[BLOCKED]` prefix to task and move to next

### Lost Context Mid-Task

1. Read the PRD file
2. Read the Progress Log
3. Check git history for recent commits
4. Resume where you left off

### Verification Unclear

If a verification step is ambiguous:
1. Use your best judgment
2. Document what you tested in Progress Log
3. Mark complete if reasonably confident

---

## Sample Session

```
You: Read LTRFL_Phase1_PRD.md and execute the first unchecked task.

Claude Code: 
I've read the PRD. The first unchecked task is:

**A1: Create `ltrfl_templates` table**

Executing now...

[Creates the SQL migration]
[Runs in Supabase]
[Verifies with SELECT query]

✅ Verification passed: Table exists and accepts queries.

I've marked task A1 as [x] in the PRD file.
Committing with message: [LTRFL-P1-A1] Create ltrfl_templates table in Supabase

Ready for next task. Say "continue" to proceed.

You: continue

Claude Code:
Next unchecked task is:

**A2: Create `ltrfl_concepts` table**

Executing now...
```

---

## Tips for Success

1. **One task at a time** - Don't let Claude Code get ambitious
2. **Verify before marking** - The checkbox is sacred
3. **Commit frequently** - Each task = one commit
4. **Use the Progress Log** - It's your memory
5. **Stay in phase order** - Don't skip to Phase 2 before Phase 1 is done

---

## Quick Reference Commands

```
# Start fresh on Phase 1
"Read LTRFL_Phase1_PRD.md and execute the first unchecked task."

# Continue to next task
"Continue with the next unchecked task."

# Check progress
"How many tasks remain in LTRFL_Phase1_PRD.md?"

# Start Phase 2 (after Phase 1 complete)
"Phase 1 is complete. Read LTRFL_Phase2_PRD.md and begin."

# Debug a failing task
"Task X is failing. Read the Progress Log and help me debug."
```

---

*Guide Version: 1.0*
*For use with Claude Code in Cursor or standalone*
