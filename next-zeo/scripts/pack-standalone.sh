#!/bin/bash
set -e

echo "📦 Packaging Next.js standalone build for cPanel..."

# Ensure the standalone directory exists
if [ ! -d ".next/standalone" ]; then
  echo "Error: .next/standalone directory not found. Please run 'npm run build' first, ensuring 'output: \"standalone\"' is set in next.config.ts"
  exit 1
fi

# Create a temporary staging directory
STAGING_DIR="cpanel-deploy"
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"

# Copy standalone output
echo "📂 Copying standalone files..."
cp -r .next/standalone/* "$STAGING_DIR/"

# Create public and .next/static directories since standalone doesn't include them by default
mkdir -p "$STAGING_DIR/public"
mkdir -p "$STAGING_DIR/.next/static"

# Copy public assets and static files
echo "📂 Copying public and static assets..."
if [ -d "public" ]; then
    cp -r public/* "$STAGING_DIR/public/"
fi
if [ -d ".next/static" ]; then
    cp -r .next/static/* "$STAGING_DIR/.next/static/"
fi

# Zip the contents
echo "🗜️  Zipping the package..."
cd "$STAGING_DIR"
# zip recursively, quietly
zip -rq ../cpanel-deploy.zip .
cd ..

# Cleanup staging dir
rm -rf "$STAGING_DIR"

echo "✅ Success! cPanel deployment package created at cpanel-deploy.zip"
echo "Instructions:"
echo "1. Upload cpanel-deploy.zip to your cPanel file manager and extract it."
echo "2. Setup a Node.js App in cPanel pointing to this extracted folder."
echo "3. Set the application startup file to: server.js"
