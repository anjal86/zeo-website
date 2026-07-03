// Automatic sitemap update script
// This can be run as a scheduled task or webhook to keep sitemap updated

const fs = require('fs');
const path = require('path');

// Configuration
const SITEMAP_CHECK_INTERVAL = 60000; // Check every minute
const DATA_DIRECTORIES = [
  path.join(__dirname, '../../api/data/tour-details'),
  path.join(__dirname, '../../api/data/destinations.json'),
  path.join(__dirname, '../../api/data/activities.json')
];

let lastModifiedTimes = new Map();

// Initialize last modified times
function initializeModifiedTimes() {
  DATA_DIRECTORIES.forEach(dir => {
    try {
      if (fs.existsSync(dir)) {
        const stats = fs.statSync(dir);
        lastModifiedTimes.set(dir, stats.mtime.getTime());
      }
    } catch (error) {
      console.error(`Error checking ${dir}:`, error);
    }
  });
}

// Check if any data files have been modified
function hasDataChanged() {
  let changed = false;
  
  DATA_DIRECTORIES.forEach(dir => {
    try {
      if (fs.existsSync(dir)) {
        const stats = fs.statSync(dir);
        const currentTime = stats.mtime.getTime();
        const lastTime = lastModifiedTimes.get(dir) || 0;
        
        if (currentTime > lastTime) {
          console.log(`📝 Data change detected in: ${dir}`);
          lastModifiedTimes.set(dir, currentTime);
          changed = true;
        }
      }
    } catch (error) {
      console.error(`Error checking ${dir}:`, error);
    }
  });
  
  return changed;
}

// Auto-regenerate sitemap
async function autoRegenerateSitemap() {
  try {
    const { generateSitemap } = require('./generateSitemap.cjs');
    await generateSitemap();
    console.log('🔄 Sitemap automatically updated due to data changes');
  } catch (error) {
    console.error('❌ Failed to auto-regenerate sitemap:', error);
  }
}

// Main monitoring function
function startSitemapMonitoring() {
  console.log('🚀 Starting automatic sitemap monitoring...');
  console.log(`📊 Checking for changes every ${SITEMAP_CHECK_INTERVAL / 1000} seconds`);
  
  initializeModifiedTimes();
  
  setInterval(() => {
    if (hasDataChanged()) {
      autoRegenerateSitemap();
    }
  }, SITEMAP_CHECK_INTERVAL);
}

// Webhook endpoint for manual trigger
function createWebhookEndpoint() {
  const express = require('express');
  const app = express();
  const PORT = process.env.SITEMAP_WEBHOOK_PORT || 3001;
  
  app.use(express.json());
  
  app.post('/webhook/regenerate-sitemap', async (req, res) => {
    try {
      await autoRegenerateSitemap();
      res.json({
        success: true,
        message: 'Sitemap regenerated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  app.listen(PORT, () => {
    console.log(`🔗 Sitemap webhook server running on port ${PORT}`);
    console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook/regenerate-sitemap`);
  });
}

// Run based on command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--webhook')) {
    createWebhookEndpoint();
  } else if (args.includes('--monitor')) {
    startSitemapMonitoring();
  } else if (args.includes('--once')) {
    autoRegenerateSitemap().then(() => {
      console.log('✅ One-time sitemap regeneration completed');
      process.exit(0);
    });
  } else {
    console.log('🔧 Sitemap Auto-Update Utility');
    console.log('');
    console.log('Usage:');
    console.log('  node autoSitemapUpdate.js --monitor   # Start file monitoring');
    console.log('  node autoSitemapUpdate.js --webhook   # Start webhook server');
    console.log('  node autoSitemapUpdate.js --once      # Generate once and exit');
    console.log('');
    console.log('For production, you can:');
    console.log('1. Run with --monitor to continuously watch for file changes');
    console.log('2. Set up a cron job to run --once periodically');
    console.log('3. Use --webhook to trigger regeneration via HTTP POST');
  }
}

module.exports = {
  autoRegenerateSitemap,
  startSitemapMonitoring,
  createWebhookEndpoint
};