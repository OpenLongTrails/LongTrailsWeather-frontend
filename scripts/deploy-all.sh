#!/bin/bash
# Deploy forecast pages to every trail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Get trail list from configs directory
TRAILS=($(ls "$PROJECT_DIR/configs/"*.json 2>/dev/null | xargs -n1 basename | sed 's/\.json$//'))

echo "Deploying to every trail..."

for trail in "${TRAILS[@]}"; do
  echo ""
  echo "======================================"
  "$SCRIPT_DIR/deploy-trail.sh" "$trail"
done

echo ""
echo "======================================"
echo "Deployment script completed."
