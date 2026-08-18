#!/bin/bash
set -e

ACCOUNTS=("acc1" "acc2" "acc3")
CURRENT_INDEX=0
TASK_PROMPT="$1"

if [ -z "$TASK_PROMPT" ]; then
  echo "Usage: ./orchestrator.sh \"Your development prompt here\""
  exit 1
fi

TOTAL_ACCS=${#ACCOUNTS[@]}

while true; do
  ACC=${ACCOUNTS[$CURRENT_INDEX]}
  echo "🚀 [Orchestrator] Running task with profile: $ACC"
  source ./switcher.sh "$ACC"

  # Run Antigravity CLI with state context
  agy -p "Current Task: $TASK_PROMPT. Check TASK_STATE.md if present, implement next required changes, update TASK_STATE.md with progress, and commit changes." --dangerously-skip-permissions
  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ [Orchestrator] Task completed successfully on $ACC."
    git push origin main || true
    break
  else
    echo "⚠️ [Orchestrator] Account $ACC encountered an error/quota limit. Rotating..."
    git add . && git commit -m "chore: save state before failover rotation" || true
    CURRENT_INDEX=$(( (CURRENT_INDEX + 1) % TOTAL_ACCS ))
    sleep 3
  fi
done
