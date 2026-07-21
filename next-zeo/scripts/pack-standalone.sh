#!/bin/bash
set -euo pipefail

echo "📦 Packaging Next.js standalone build for cPanel..."

if [ ! -d ".next/standalone" ]; then
  echo "Error: .next/standalone directory not found. Run 'npm run build' first and keep output: standalone enabled."
  exit 1
fi

STAGING_DIR="cpanel-deploy"
ARCHIVE="cpanel-deploy.zip"
rm -rf "$STAGING_DIR"
rm -f "$ARCHIVE"
mkdir -p "$STAGING_DIR"

echo "📂 Copying standalone runtime..."
cp -r .next/standalone/* "$STAGING_DIR/"

mkdir -p "$STAGING_DIR/public" "$STAGING_DIR/.next/static"
if [ -d "public" ]; then
  cp -r public/. "$STAGING_DIR/public/"
fi
if [ -d ".next/static" ]; then
  cp -r .next/static/. "$STAGING_DIR/.next/static/"
fi

echo "🗄️  Adding production migration assets..."
mkdir -p "$STAGING_DIR/deployment/migrations"
cp deployment/run-migrations.mjs "$STAGING_DIR/deployment/run-migrations.mjs"
cp deployment/cpanel-release.sh "$STAGING_DIR/deployment/cpanel-release.sh"
cp src/server/db/migrations/*.sql "$STAGING_DIR/deployment/migrations/"
chmod +x "$STAGING_DIR/deployment/cpanel-release.sh"

cat > "$STAGING_DIR/release.json" <<EOF
{
  "commit": "${GITHUB_SHA:-local}",
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "node": "$(node --version)"
}
EOF

echo "🗜️  Creating deployment archive..."
(
  cd "$STAGING_DIR"
  zip -rq "../$ARCHIVE" .
)
rm -rf "$STAGING_DIR"

echo "✅ Created $ARCHIVE"
