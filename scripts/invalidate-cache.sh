#!/bin/bash
# Invalidate CloudFront cache for specified paths
#
# Usage:
#   ./invalidate-cache.sh              # Invalidate everything (default: /*)
#   ./invalidate-cache.sh /ct/*        # Invalidate all CT trail paths
#   ./invalidate-cache.sh /*/forecast.html   # Invalidate forecast.html for all trails
#   ./invalidate-cache.sh /ct/forecast.html /pct/forecast.html   # Multiple specific paths

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check for config file
if [ ! -f "$SCRIPT_DIR/config.sh" ]; then
  echo "Error: config.sh not found. See config.sh.example."
  exit 1
fi

source "$SCRIPT_DIR/config.sh"

PATHS="${@:-/*}"

echo "Invalidating CloudFront cache..."
echo "Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
echo "Paths: $PATHS"

aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths $PATHS

echo "Cache invalidation request submitted and may take several minutes to complete."
