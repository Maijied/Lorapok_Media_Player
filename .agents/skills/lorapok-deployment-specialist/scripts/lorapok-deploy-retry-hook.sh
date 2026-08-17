#!/usr/bin/env bash
# Lorapok Deployment Retry Hook Script
# Executed by lorapok-deployment-specialist to manage CI/CD deployment & retry loops.

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
LOG_FILE="$PROJECT_ROOT/build_execution.log"
MAX_ATTEMPTS=${1:-3}
ATTEMPT=1

echo "🚀 Launching Lorapok Deployment Pipeline (Max Attempts: $MAX_ATTEMPTS)..."

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "--------------------------------------------------------"
    echo "🔄 Deployment Attempt $ATTEMPT of $MAX_ATTEMPTS"
    echo "--------------------------------------------------------"

    if "$PROJECT_ROOT/manage_lorapok.sh" build > "$LOG_FILE" 2>&1; then
        echo "✅ Deployment Build Successful on Attempt $ATTEMPT!"
        echo "📦 Build Artifacts Created in release/ and packages/website/dist/"
        exit 0
    else
        EXIT_CODE=$?
        echo "❌ Deployment Failed on Attempt $ATTEMPT (Exit Code: $EXIT_CODE)."
        echo "📋 Extracting Log Summary from $LOG_FILE:"
        echo "========================================================"
        tail -n 25 "$LOG_FILE"
        echo "========================================================"

        if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
            echo "⚠️  Triggering error diagnosis and repair cycle before retry..."
            # Signal failure for agent diagnosis
            exit $EXIT_CODE
        else
            echo "🚨 Exceeded maximum retry attempts ($MAX_ATTEMPTS). Manual inspection required."
            exit $EXIT_CODE
        fi
    fi
    ATTEMPT=$((ATTEMPT + 1))
done
