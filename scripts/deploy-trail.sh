#!/bin/bash
# Deploy forecast page and assets for a single trail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check for config file
if [ ! -f "$SCRIPT_DIR/config.sh" ]; then
  echo "Error: config.sh not found. See config.sh.example."
  exit 1
fi

source "$SCRIPT_DIR/config.sh"

TRAIL=$1

if [ -z "$TRAIL" ]; then
  echo "Usage: $0 <trail-code>"
  echo "Example: $0 ct"
  exit 1
fi

if [ ! -d "dist" ]; then
  echo "Error: dist/ directory not found. Run 'npm run build' first."
  exit 1
fi

if [ ! -f "configs/${TRAIL}.json" ]; then
  echo "Error: configs/${TRAIL}.json not found"
  exit 1
fi

if [ ! -f "pages/redirect.html" ]; then
  echo "Error: pages/redirect.html not found"
  exit 1
fi

echo "Deploying to trail: $TRAIL"

# Deploy config.json (not cached - max-age=0)
echo "Deploying config.json..."
aws s3 cp "configs/${TRAIL}.json" "s3://${BUCKET}/${TRAIL}/config.json" \
  --content-type "application/json" \
  --cache-control "max-age=0"

# Deploy redirect page (not cached - max-age=0)
echo "Deploying ${TRAIL}.html..."
aws s3 cp pages/redirect.html "s3://${BUCKET}/${TRAIL}/${TRAIL}.html" \
  --content-type "text/html" \
  --cache-control "max-age=0"

# Deploy forecast.html (not cached - max-age=0)
echo "Deploying forecast.html..."
aws s3 cp dist/forecast.html "s3://${BUCKET}/${TRAIL}/forecast.html" \
  --content-type "text/html" \
  --cache-control "max-age=0"

# Deploy assets (cached for 1 year with immutable)
echo "Deploying assets..."
aws s3 sync dist/assets/ "s3://${BUCKET}/assets/" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

echo "Deployment to $TRAIL complete."
