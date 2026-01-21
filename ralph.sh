#!/bin/bash

# ============================================================================
# RALPH WIGGUM - TMH AI Content Engine Autonomous Execution Loop
# ============================================================================
# This script runs through prd.json stories sequentially, executing each
# atomic user story and marking completion status.
#
# Usage: ./ralph.sh [options]
#   --dry-run     Preview what would be executed without making changes
#   --start-from  Start from a specific story ID (e.g., --start-from 2-1-1)
#   --phase       Only run stories from a specific phase (1-6)
#   --verbose     Show detailed output for each story
#   --help        Show this help message
#
# ============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
LOG_DIR="$SCRIPT_DIR/ralph_logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/ralph_run_$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false
VERBOSE=false
START_FROM=""
PHASE_FILTER=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --start-from)
            START_FROM="$2"
            shift 2
            ;;
        --phase)
            PHASE_FILTER="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "Ralph Wiggum - TMH Autonomous Execution Loop"
            echo ""
            echo "Usage: ./ralph.sh [options]"
            echo ""
            echo "Options:"
            echo "  --dry-run       Preview what would be executed without making changes"
            echo "  --start-from ID Start from a specific story ID (e.g., --start-from 2-1-1)"
            echo "  --phase N       Only run stories from a specific phase (1-6)"
            echo "  --verbose       Show detailed output for each story"
            echo "  --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./ralph.sh                    # Run all pending stories"
            echo "  ./ralph.sh --phase 1         # Run only Phase 1 stories"
            echo "  ./ralph.sh --start-from 3-2-1 # Resume from story 3-2-1"
            echo "  ./ralph.sh --dry-run         # Preview execution plan"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# ============================================================================
# Helper Functions
# ============================================================================

log() {
    local message="$1"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "[$timestamp] $message" | tee -a "$LOG_FILE"
}

log_header() {
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

log_story() {
    local id="$1"
    local title="$2"
    echo -e "${BLUE}┌─────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${BLUE}│${NC} Story: ${YELLOW}$id${NC} - $title"
    echo -e "${BLUE}└─────────────────────────────────────────────────────────────────┘${NC}"
}

check_dependencies() {
    log "Checking dependencies..."

    # Check for jq (JSON processor)
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is required but not installed.${NC}"
        echo "Install with: brew install jq"
        exit 1
    fi

    # Check for claude CLI
    if ! command -v claude &> /dev/null; then
        echo -e "${RED}Error: claude CLI is required but not installed.${NC}"
        echo "Install Claude Code CLI to use Ralph"
        exit 1
    fi

    # Check for prd.json
    if [ ! -f "$PRD_FILE" ]; then
        echo -e "${RED}Error: prd.json not found at $PRD_FILE${NC}"
        exit 1
    fi

    log "${GREEN}All dependencies satisfied${NC}"
}

create_log_dir() {
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        log "Created log directory: $LOG_DIR"
    fi
}

get_story_count() {
    jq '.stories | length' "$PRD_FILE"
}

get_pending_stories() {
    local filter='.stories | map(select(.passes == false))'

    if [ -n "$PHASE_FILTER" ]; then
        filter=".stories | map(select(.passes == false and .phase == $PHASE_FILTER))"
    fi

    jq -r "$filter | .[].id" "$PRD_FILE"
}

get_story_by_id() {
    local story_id="$1"
    jq -r ".stories | map(select(.id == \"$story_id\")) | .[0]" "$PRD_FILE"
}

check_dependencies_met() {
    local story_id="$1"
    local deps=$(jq -r ".stories | map(select(.id == \"$story_id\")) | .[0].dependencies | .[]?" "$PRD_FILE")

    if [ -z "$deps" ]; then
        return 0
    fi

    for dep in $deps; do
        local dep_passes=$(jq -r ".stories | map(select(.id == \"$dep\")) | .[0].passes" "$PRD_FILE")
        if [ "$dep_passes" != "true" ]; then
            echo "$dep"
            return 1
        fi
    done

    return 0
}

mark_story_complete() {
    local story_id="$1"
    local tmp_file=$(mktemp)

    # Update the passes field for the matching story
    jq --arg id "$story_id" '(.stories[] | select(.id == $id) | .passes) = true' "$PRD_FILE" > "$tmp_file"

    # Verify the temp file is valid JSON before replacing
    if jq empty "$tmp_file" 2>/dev/null; then
        mv "$tmp_file" "$PRD_FILE"
        log "${GREEN}✓ Marked story $story_id as complete${NC}"
    else
        log "${RED}✗ Failed to mark story $story_id - invalid JSON produced${NC}"
        rm -f "$tmp_file"
        return 1
    fi
}

execute_story() {
    local story_id="$1"
    local story=$(get_story_by_id "$story_id")

    local title=$(echo "$story" | jq -r '.title')
    local description=$(echo "$story" | jq -r '.description')
    local acceptance=$(echo "$story" | jq -r '.acceptance_criteria | join("\n- ")')
    local files=$(echo "$story" | jq -r '.files | join(", ")')
    local phase=$(echo "$story" | jq -r '.phase')
    local feature=$(echo "$story" | jq -r '.feature')

    log_story "$story_id" "$title"

    if $VERBOSE; then
        echo -e "${CYAN}Description:${NC} $description"
        echo -e "${CYAN}Files:${NC} $files"
        echo -e "${CYAN}Acceptance Criteria:${NC}"
        echo -e "- $acceptance"
        echo ""
    fi

    # Check dependencies
    local unmet_dep=$(check_dependencies_met "$story_id")
    if [ $? -ne 0 ]; then
        log "${YELLOW}⏸ Skipping $story_id - dependency $unmet_dep not complete${NC}"
        return 1
    fi

    if $DRY_RUN; then
        log "${YELLOW}[DRY RUN] Would execute story: $story_id${NC}"
        return 0
    fi

    # Build the prompt for Claude - comprehensive context
    local prompt="AUTONOMOUS EXECUTION MODE - STORY $story_id

PROJECT: TMH AI Content Engine
PHASE: $phase | FEATURE: $feature

═══════════════════════════════════════════════════════════════
STORY: $title
═══════════════════════════════════════════════════════════════

DESCRIPTION:
$description

FILES TO CREATE/MODIFY:
$files

ACCEPTANCE CRITERIA (ALL must be satisfied):
- $acceptance

═══════════════════════════════════════════════════════════════
EXECUTION INSTRUCTIONS:
═══════════════════════════════════════════════════════════════

1. Read any existing files that need modification before editing
2. Create directories if needed (use mkdir -p)
3. Implement this story COMPLETELY - do not leave placeholders
4. For database migrations: create the SQL file with full schema
5. For TypeScript files: include proper types and imports
6. For React components: include full JSX and styling
7. Verify each acceptance criterion is satisfied
8. Do NOT work on any other stories - focus only on this one
9. When done, list which acceptance criteria were completed

WORKING DIRECTORY: $SCRIPT_DIR

BEGIN IMPLEMENTATION NOW."

    # Execute with Claude Code
    log "Executing story $story_id with Claude Code..."

    local story_log="$LOG_DIR/story_${story_id}_$TIMESTAMP.log"

    # Run Claude Code with the prompt piped in, auto-accept mode
    # Using --dangerously-skip-permissions for autonomous execution
    if echo "$prompt" | claude --dangerously-skip-permissions -p > "$story_log" 2>&1; then
        log "${GREEN}✓ Story $story_id completed successfully${NC}"
        mark_story_complete "$story_id"
        return 0
    else
        local exit_code=$?
        log "${RED}✗ Story $story_id failed (exit code: $exit_code) - check $story_log for details${NC}"
        return 1
    fi
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    log_header "RALPH WIGGUM - TMH Autonomous Execution Loop"

    check_dependencies
    create_log_dir

    log "Configuration:"
    log "  PRD File: $PRD_FILE"
    log "  Log File: $LOG_FILE"
    log "  Dry Run: $DRY_RUN"
    log "  Phase Filter: ${PHASE_FILTER:-all}"
    log "  Start From: ${START_FROM:-beginning}"
    echo ""

    local total_stories=$(get_story_count)
    local pending_stories=$(get_pending_stories)
    local pending_count=$(echo "$pending_stories" | grep -c '^' || echo 0)

    log "Stories: $pending_count pending of $total_stories total"
    echo ""

    if [ "$pending_count" -eq 0 ]; then
        log "${GREEN}All stories complete! Nothing to execute.${NC}"
        exit 0
    fi

    # Handle --start-from flag
    local should_skip=false
    if [ -n "$START_FROM" ]; then
        should_skip=true
    fi

    local completed=0
    local failed=0
    local skipped=0

    for story_id in $pending_stories; do
        # Skip until we hit the start-from story
        if $should_skip; then
            if [ "$story_id" == "$START_FROM" ]; then
                should_skip=false
            else
                ((skipped++))
                continue
            fi
        fi

        if execute_story "$story_id"; then
            ((completed++))
        else
            ((failed++))
            # Continue to next story even on failure
        fi

        # Brief pause between stories
        if ! $DRY_RUN; then
            sleep 2
        fi
    done

    echo ""
    log_header "Execution Summary"
    log "  ${GREEN}Completed:${NC} $completed"
    log "  ${RED}Failed:${NC} $failed"
    log "  ${YELLOW}Skipped:${NC} $skipped"
    log "  Log file: $LOG_FILE"

    if [ $failed -gt 0 ]; then
        exit 1
    fi
}

# Run main function
main
