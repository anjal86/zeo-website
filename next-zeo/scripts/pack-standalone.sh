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
# The standalone runtime's application build lives in the hidden `.next`
# directory. A `*` glob omits it and produces an archive that has server.js
# but cannot boot because `.next/BUILD_ID` is missing.
cp -a .next/standalone/. "$STAGING_DIR/"

if [ ! -f "$STAGING_DIR/.next/BUILD_ID" ]; then
  echo "Error: packaged standalone runtime is missing .next/BUILD_ID"
  exit 1
fi

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

migration_packages=(
  mysql2 aws-ssl-profiles denque generate-function iconv-lite long lru.min
  named-placeholders sql-escaper is-property safer-buffer
)
mkdir -p "$STAGING_DIR/node_modules"
for package_name in "${migration_packages[@]}"; do
  if [ -d "node_modules/$package_name" ]; then
    cp -r "node_modules/$package_name" "$STAGING_DIR/node_modules/"
  fi
done

cat > "$STAGING_DIR/release.json" <<EOF
{
  "commit": "${GITHUB_SHA:-local}",
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "node": "$(node --version)"
}
EOF
mkdir -p "$STAGING_DIR/public"
cp "$STAGING_DIR/release.json" "$STAGING_DIR/public/release.json"

echo "🗜️  Creating deployment archive..."
(
  cd "$STAGING_DIR"
  zip -rq "../$ARCHIVE" .
)
rm -rf "$STAGING_DIR"

echo "✅ Created $ARCHIVE"
