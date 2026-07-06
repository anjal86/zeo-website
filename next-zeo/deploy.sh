#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment to salom-vps..."

# Define paths
# Since this script is now run from inside the next-zeo folder:
LOCAL_DIR="./"
VPS_TARGET="salom-vps:/var/www/zeo/next-zeo/"
VPS_DIR="/var/www/zeo/next-zeo"

echo "📂 Syncing files via rsync..."
# IMPORTANT: We explicitly exclude .env* files so we don't overwrite the production environment variables!
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env*' \
    --exclude '.DS_Store' \
    "$LOCAL_DIR" "$VPS_TARGET"

echo "⚙️  Connecting to VPS to build and restart..."
ssh salom-vps "cd $VPS_DIR && \
    echo '📦 Installing dependencies...' && \
    npm install && \
    echo '🏗️  Building Next.js application...' && \
    npm run build && \
    echo '🔄 Restarting PM2 process...' && \
    pm2 restart zeo-next && \
    echo '✅ Deployment successful!'"

echo "🎉 All done!"
