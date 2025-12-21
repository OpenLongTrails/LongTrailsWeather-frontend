#!/bin/bash
# Deploy forecast pages to every trail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TRAILS=("at" "azt" "ct" "lt" "pct")

echo "Deploying to every trail..."

for trail in "${TRAILS[@]}"; do
  echo ""
  echo "======================================"
  "$SCRIPT_DIR/deploy-trail.sh" "$trail"
done

echo ""
echo "======================================"
echo "Deployment script completed."
