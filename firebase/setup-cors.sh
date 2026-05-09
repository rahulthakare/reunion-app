#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# Apply CORS rules to the Firebase Storage bucket so the browser
# can upload photos / PDFs / fun-zone files directly.
#
# Run this ONCE per environment. Re-run if you ever change which
# origins (Vercel preview URLs, custom domains, etc.) need access.
# ─────────────────────────────────────────────────────────────────

set -euo pipefail

BUCKET="${1:-reunion-app-1a3ff.firebasestorage.app}"
HERE="$(cd "$(dirname "$0")" && pwd)"
CORS_FILE="$HERE/cors.json"

if ! command -v gsutil >/dev/null 2>&1; then
  echo "❌ gsutil not found."
  echo "   Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
  echo "   On macOS: brew install --cask google-cloud-sdk && gcloud init"
  exit 1
fi

echo "▶ Applying CORS rules from $CORS_FILE to gs://$BUCKET …"
gsutil cors set "$CORS_FILE" "gs://$BUCKET"

echo ""
echo "▶ Verifying current CORS configuration:"
gsutil cors get "gs://$BUCKET"

echo ""
echo "✅ Done. Hard-refresh the app and try the upload again."
echo "   If it still fails, run:  gcloud auth login   and try again."
