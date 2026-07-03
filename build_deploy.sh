#!/bin/bash

# Configuration
PROJECT_ROOT="/Users/shrestha/Brandspire Work/zeopwebsite-new"
DEPLOY_DIR="$PROJECT_ROOT/deployment_package"
FRONTEND_DIR="$PROJECT_ROOT/zeopwebsite"
BACKEND_DIR="$PROJECT_ROOT/api"

echo "🚀 Starting Deployment Build Process..."

# 1. Clean previous deployment package
if [ -d "$DEPLOY_DIR" ]; then
    echo "🧹 Cleaning previous deployment folder..."
    rm -rf "$DEPLOY_DIR"
fi
mkdir -p "$DEPLOY_DIR"

# 2. Build Frontend
echo "📦 Building Frontend (React)..."
cd "$FRONTEND_DIR" || exit
# Ensure dependencies are installed (optional, maybe skip if node_modules exists to save time?)
# npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

# 3. Copy Frontend Build files
echo "📂 Copying Frontend files to deployment folder..."
cp -r "$FRONTEND_DIR/dist/"* "$DEPLOY_DIR/"

# 4. Copy .htaccess
if [ -f "$FRONTEND_DIR/.htaccess" ]; then
    echo "📄 Copying .htaccess..."
    cp "$FRONTEND_DIR/.htaccess" "$DEPLOY_DIR/"
else
    echo "⚠️  Warning: .htaccess not found in zeopwebsite! Please create one."
fi

# 5. Prepare Backend
echo "⚙️  Preparing Backend (API)..."
mkdir -p "$DEPLOY_DIR/api"

# Use rsync to copy backend files, excluding node_modules, .git, and specific extensive folders if needed
# We include uploads and exclude raw database JSON files to prevent overwriting active production databases
rsync -av --progress "$BACKEND_DIR/" "$DEPLOY_DIR/api/" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude '.DS_Store' \
    --exclude 'package-lock.json' \
    --exclude 'optimize_media.js' \
    --exclude 'data/*.json' \
    --exclude 'data/tour-details/*.json' \
    --exclude 'data/*.tmp' \
    --exclude 'data/backups'

if [ -d "$DEPLOY_DIR/api/node_modules" ]; then
    echo "🧹 Removing node_modules from API deployment folder (CloudLinux requirement)..."
    rm -rf "$DEPLOY_DIR/api/node_modules"
fi

# Create uploads directory if it doesn't exist (because we excluded content)
mkdir -p "$DEPLOY_DIR/api/uploads"

# Create data directories
mkdir -p "$DEPLOY_DIR/api/data"
mkdir -p "$DEPLOY_DIR/api/data/tour-details"

# Generate default database template files (.json.default) in the deployment folder
echo "🗄️  Generating database default templates..."
for f in "$BACKEND_DIR/data"/*.json; do
    if [ -f "$f" ]; then
        filename=$(basename "$f")
        cp "$f" "$DEPLOY_DIR/api/data/${filename}.default"
    fi
done

for f in "$BACKEND_DIR/data/tour-details"/*.json; do
    if [ -f "$f" ]; then
        filename=$(basename "$f")
        cp "$f" "$DEPLOY_DIR/api/data/tour-details/${filename}.default"
    fi
done

echo "📄 Creating default .env information..."
# Create a dummy .env or copy example
if [ -f "$BACKEND_DIR/.env.example" ]; then
    cp "$BACKEND_DIR/.env.example" "$DEPLOY_DIR/api/.env"
else
    echo "# Production Environment Variables" > "$DEPLOY_DIR/api/.env"
    echo "PORT=3000" >> "$DEPLOY_DIR/api/.env"
    echo "JWT_SECRET=change_this_to_a_secure_random_string" >> "$DEPLOY_DIR/api/.env"
    echo "NODE_ENV=production" >> "$DEPLOY_DIR/api/.env"
fi

# 6. Create Deployment Instructions
echo "📝 Generating Deployment Instructions..."
cat > "$DEPLOY_DIR/README_DEPLOY.txt" << EOL
Zeo Tourism Website - Deployment Instructions
=============================================

This folder contains everything needed to deploy the website to a cPanel/hosting environment.

Structure:
- /         -> Contains the React Frontend files (index.html, assets/, etc.)
- /api      -> Contains the Node.js Backend
- .htaccess -> Application routing configuration

Instructions:
1. Upload all contents of this folder to your 'public_html' (or subdomain folder).
2. Backend Setup:
   - Go to 'api' folder.
   - If using cPanel Node.js Selector:
     - Point Application Root to 'api' folder.
     - IMPORTANT: Ensure NO 'node_modules' folder exists in 'api' before clicking 'Create' or 'Run NPM Install'.
     - The panel will create a symlink for 'node_modules'.
     - Run 'npm install' via the panel or terminal.
     - Restart the Node.js application.
   - Note on Database Isolation:
     This deployment package ONLY contains database templates (*.json.default).
     On server startup, missing database files are auto-generated from these templates.
     Your live database files (e.g. tours.json) on the production server will NEVER be overwritten.

3. Frontend Setup:
   - The frontend files are static and pre-built.
   - Ensure .htaccess is present in the root.

IMPORTANT:
- Edit 'api/.env' with your production secrets if needed.
- Ensure file permissions are correct (usually 644 for files, 755 for folders).

EOL

# 7. Zip the deployment package for easy upload
echo "🤐 Creating full deployment.zip package (includes optimized media)..."
ZIP_FILE="$PROJECT_ROOT/deployment.zip"
if [ -f "$ZIP_FILE" ]; then
    rm -f "$ZIP_FILE"
fi

cd "$DEPLOY_DIR" || exit
zip -r "$ZIP_FILE" . > /dev/null

echo "🤐 Creating code-only deployment-code-only.zip (excludes media to save bandwidth)..."
ZIP_CODE_ONLY="$PROJECT_ROOT/deployment-code-only.zip"
if [ -f "$ZIP_CODE_ONLY" ]; then
    rm -f "$ZIP_CODE_ONLY"
fi
zip -r "$ZIP_CODE_ONLY" . -x "api/uploads/*" > /dev/null

echo "✅ Build & Package Complete!"
echo "📂 Raw folder: $DEPLOY_DIR"
echo "📦 Full ZIP (for media + code): $ZIP_FILE"
echo "⚡ Code-Only ZIP (super fast upload, excludes media): $ZIP_CODE_ONLY"
