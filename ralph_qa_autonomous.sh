#!/bin/bash

# ============================================================================
# RALPH QA AUTONOMOUS - Full unattended execution with QA cycles
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
LOG_DIR="$SCRIPT_DIR/ralph_logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
QA_LOG="$LOG_DIR/qa_run_$TIMESTAMP.log"

log() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a "$QA_LOG"
}

wait_for_ralph() {
    log "Waiting for Ralph to complete all stories..."
    while true; do
        local completed=$(jq '[.stories[] | select(.passes == true)] | length' "$PRD_FILE")
        local total=$(jq '.stories | length' "$PRD_FILE")
        
        if [ "$completed" -eq "$total" ]; then
            log "✓ All $total stories completed!"
            return 0
        fi
        
        # Check if ralph is still running
        if ! pgrep -f "ralph.sh" > /dev/null && ! pgrep -f "ralph_run" > /dev/null; then
            # Ralph not running, check if stories done
            if [ "$completed" -lt "$total" ]; then
                log "Ralph stopped but only $completed/$total complete. Restarting..."
                cd "$SCRIPT_DIR" && ./ralph.sh >> "$LOG_DIR/ralph_restart_$TIMESTAMP.log" 2>&1 &
            fi
        fi
        
        log "Progress: $completed / $total - waiting..."
        sleep 60
    done
}

run_qa_cycle() {
    local cycle_num="$1"
    log "═══════════════════════════════════════════════════════════════"
    log "QA CYCLE $cycle_num"
    log "═══════════════════════════════════════════════════════════════"
    
    local qa_prompt="QA CYCLE $cycle_num - TMH AI Content Engine

You have full authorization to fix any issues found. No user approval needed.

TASKS:
1. Run TypeScript type checking (npx tsc --noEmit) and fix all errors
2. Run ESLint (npx eslint . --ext .ts,.tsx) and fix all errors
3. Try to build the project (npm run build) and fix any build errors
4. Check that all imports resolve correctly
5. Verify database migrations are syntactically correct
6. Check for any obvious runtime issues in the code

For EACH issue found:
- Fix it immediately
- Do not ask for permission
- Continue to the next issue

After fixing all issues, provide a summary of:
- Total issues found
- Issues fixed
- Any remaining issues that couldn't be auto-fixed

WORKING DIRECTORY: $SCRIPT_DIR

BEGIN QA NOW."

    local qa_log_file="$LOG_DIR/qa_cycle_${cycle_num}_$TIMESTAMP.log"
    
    log "Running QA cycle $cycle_num with Claude Code..."
    
    if echo "$qa_prompt" | claude --dangerously-skip-permissions -p > "$qa_log_file" 2>&1; then
        log "✓ QA cycle $cycle_num completed"
        
        # Check if issues were found and fixed
        if grep -q "issues found: 0\|no issues\|all clear" "$qa_log_file" -i; then
            log "✓ No issues found in QA cycle $cycle_num"
            return 0
        else
            log "Issues were found and fixed in cycle $cycle_num"
            return 1
        fi
    else
        log "⚠ QA cycle $cycle_num had errors - check $qa_log_file"
        return 1
    fi
}

# ============================================================================
# MAIN
# ============================================================================

log "═══════════════════════════════════════════════════════════════"
log "RALPH QA AUTONOMOUS - Starting unattended execution"
log "═══════════════════════════════════════════════════════════════"

# Step 1: Wait for Ralph to finish all stories
wait_for_ralph

# Step 2: Run first QA cycle
log ""
log "Starting QA Phase..."
run_qa_cycle 1

# Step 3: Run second QA cycle
sleep 5
run_qa_cycle 2

# Step 4: Deploy to Vercel with automatic bug fixing
deploy_to_vercel() {
    local attempt="$1"
    log "═══════════════════════════════════════════════════════════════"
    log "VERCEL DEPLOYMENT - Attempt $attempt"
    log "═══════════════════════════════════════════════════════════════"

    local deploy_log="$LOG_DIR/vercel_deploy_${attempt}_$TIMESTAMP.log"

    # First try direct vercel deploy
    log "Running vercel deploy..."
    if vercel --prod --yes > "$deploy_log" 2>&1; then
        log "✓ Vercel deployment successful!"
        cat "$deploy_log" | grep -E "Production:|https://" | tail -5
        return 0
    else
        log "Vercel deploy failed - running fix cycle..."

        # Run Claude to fix the deployment errors
        local fix_prompt="VERCEL DEPLOYMENT FIX - Attempt $attempt

You have full authorization to fix any issues. No user approval needed.

The Vercel deployment failed. Here are the errors:
$(cat "$deploy_log")

TASKS:
1. Analyze the deployment errors above
2. Fix each error in the codebase
3. Common Vercel issues to check:
   - Missing dependencies in package.json
   - TypeScript errors (run npx tsc --noEmit)
   - Build errors (run npm run build)
   - Import/export issues
   - Environment variable issues
   - Next.js config issues
   - Missing files or components
   - Incorrect paths
4. After fixing, the script will retry deployment

Fix ALL issues you find. Do not ask for permission.

WORKING DIRECTORY: $SCRIPT_DIR

BEGIN FIXING NOW."

        local fix_log="$LOG_DIR/vercel_fix_${attempt}_$TIMESTAMP.log"
        echo "$fix_prompt" | claude --dangerously-skip-permissions -p > "$fix_log" 2>&1
        log "Fix cycle $attempt completed - check $fix_log"
        return 1
    fi
}

log ""
log "Starting Vercel deployment phase..."

max_deploy_attempts=5
for ((i=1; i<=max_deploy_attempts; i++)); do
    if deploy_to_vercel $i; then
        break
    fi

    if [ $i -eq $max_deploy_attempts ]; then
        log "⚠ Max deployment attempts reached. Check logs for remaining issues."
    else
        log "Retrying deployment after fixes..."
        sleep 5
    fi
done

# Step 5: Final summary
log ""
log "═══════════════════════════════════════════════════════════════"
log "AUTONOMOUS EXECUTION COMPLETE"
log "═══════════════════════════════════════════════════════════════"
log "Pipeline completed:"
log "  - All stories executed"
log "  - 2 QA cycles completed"
log "  - Vercel deployment attempted (up to 5 fix cycles)"
log ""
log "Check logs in: $LOG_DIR"
log "Main QA log: $QA_LOG"

