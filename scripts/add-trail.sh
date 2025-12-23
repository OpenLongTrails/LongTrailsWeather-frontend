#!/bin/bash
# Add a new trail to the frontend and deploy it

set -e

show_help() {
  cat << 'EOF'
Usage: add-trail.sh <trail-code> <trail-name>
Example: add-trail.sh cdt "Continental Divide Trail"

Steps to add a new trail:
  1. Update the backend to generate forecasts for the new trail
  2. Forecast data must already exist at s3://bucket/forecasts/processed/<code>.json
  3. Run this script with the trail code and full name

This script will:
  - Create configs/<code>.json
  - Deploy config.json to s3://bucket/<code>/config.json
  - Deploy forecast.html to s3://bucket/<code>/forecast.html
  - Deploy index.html to s3://bucket/index.html
  - Invalidate CloudFront cache
EOF
}

if [ $# -eq 0 ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  show_help
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check for config file
if [ ! -f "$SCRIPT_DIR/config.sh" ]; then
  echo "Error: config.sh not found. See config.sh.example."
  exit 1
fi

source "$SCRIPT_DIR/config.sh"

# Parse arguments
if [ $# -ne 2 ]; then
  show_help
  exit 1
fi

TRAIL_CODE=$1
TRAIL_NAME=$2

echo "Adding trail: $TRAIL_NAME ($TRAIL_CODE)"

# Check that dist/forecast.html exists
if [ ! -f "$PROJECT_DIR/dist/forecast.html" ]; then
  echo "Error: dist/forecast.html not found. Run 'npm run build' first."
  exit 1
fi

# Create config file
echo "Creating configs/${TRAIL_CODE}.json..."
cat > "$PROJECT_DIR/configs/${TRAIL_CODE}.json" << EOF
{
  "code": "${TRAIL_CODE}",
  "name": "${TRAIL_NAME}"
}
EOF

# Prompt user to update index.html manually
echo ""
echo "Please add the following lines to pages/index.html in alphabetical order:"
echo ""
echo "    <a href=\"https://www.longtrailsweather.net/${TRAIL_CODE}/forecast.html\">${TRAIL_NAME}</a><br>"
echo "    <br>"
echo ""
read -p "Press any key to continue after updating index.html..."

# Deploy config.json to S3
echo "Deploying config.json to S3..."
aws s3 cp "$PROJECT_DIR/configs/${TRAIL_CODE}.json" "s3://${BUCKET}/${TRAIL_CODE}/config.json" \
  --content-type "application/json" \
  --cache-control "max-age=0"

# Deploy forecast.html to S3
echo "Deploying forecast.html to S3..."
aws s3 cp "$PROJECT_DIR/dist/forecast.html" "s3://${BUCKET}/${TRAIL_CODE}/forecast.html" \
  --content-type "text/html" \
  --cache-control "max-age=0"

# Deploy index.html to S3
echo "Deploying index.html to S3..."
aws s3 cp "$PROJECT_DIR/pages/index.html" "s3://${BUCKET}/index.html" \
  --content-type "text/html" \
  --cache-control "max-age=0"

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/index.html" "/${TRAIL_CODE}/*" \
  --output text

echo "Done. Trail '$TRAIL_NAME' ($TRAIL_CODE) has been added."
