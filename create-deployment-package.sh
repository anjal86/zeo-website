#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment package creation..."

# Define directories
ROOT_DIR=$(pwd)
FRONTEND_DIR="$ROOT_DIR/zeopwebsite"
BACKEND_DIR="$ROOT_DIR/api"
DEPLOY_DIR="$ROOT_DIR/deployment"

# clean previous deployment
echo "🧹 Cleaning up previous deployment..."
rm -rf "$DEPLOY_DIR"
rm -f deployment.zip

# Create deployment directory
mkdir -p "$DEPLOY_DIR"

# 1. Build Frontend
echo "🏗️  Building Frontend..."
cd "$FRONTEND_DIR"
npm run build
cd "$ROOT_DIR"

# 2. Copy Backend Files
echo "📂 Copying Backend..."
# Copy all files from api to deployment
rsync -av --exclude 'node_modules' --exclude '.git' --exclude 'uploads' --exclude 'test-results' "$BACKEND_DIR/" "$DEPLOY_DIR/"

# 3. Copy Frontend Build to deployment/public
echo "📂 Copying Frontend Build..."
mkdir -p "$DEPLOY_DIR/public"
cp -r "$FRONTEND_DIR/dist/"* "$DEPLOY_DIR/public/"

# 4. Create package.json for deployment (copy from api)
echo "📝 Configuring package.json..."
cp "$BACKEND_DIR/package.json" "$DEPLOY_DIR/package.json"

# 5. Create .env.example if not exists
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    echo "PORT=3000" > "$DEPLOY_DIR/.env.example"
    echo "JWT_SECRET=change_this_secret_in_production" >> "$DEPLOY_DIR/.env.example"
fi

# 6. Create ZIP package
echo "📦 Zipping deployment package..."
zip -r deployment.zip deployment

echo "✅ Deployment package created successfully!"
echo "📍 Location: $ROOT_DIR/deployment.zip"
echo "📂 Unzipped: $DEPLOY_DIR"
echo ""
echo "👉 To run locally:"
echo "   cd deployment"
echo "   npm install --production"
echo "   node server.js"
