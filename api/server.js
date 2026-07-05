const fs = require('fs');
const path = require('path');
const { generateSitemap } = require('./generateSitemap');

// Natively parse .env file to avoid external dependency (e.g. dotenv package)
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split(/\r?\n/).forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return;
      const delimiterIdx = trimmedLine.indexOf('=');
      if (delimiterIdx > 0) {
        const key = trimmedLine.substring(0, delimiterIdx).trim();
        let val = trimmedLine.substring(delimiterIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    });
  }
} catch (err) {
  console.warn('Warning: Failed to parse .env file natively:', err.message);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

// =============================================================================
// DATABASE CONNECTION (MySQL) - Using mysql2/promise connection pool
// =============================================================================
let db;
try {
  db = require('./database');
  console.log('✅ Database module loaded');
} catch (err) {
  console.warn('⚠️  Database module not found, using JSON fallback mode');
  db = null;
}

// =============================================================================
// EXPRESS APP SETUP
// =============================================================================
const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// VERCEL BLOB PROXY MIDDLEWARE
// Redirect private blob URLs through the API proxy
// =============================================================================
const BLOB_PROXY_DOMAINS = [
  'private.blob.vercel-storage.com',
  'blob.vercel-storage.com'
];

app.use((req, res, next) => {
  const origin = req.get('origin') || req.get('referer') || '';

  // Check if this is a request to Vercel Blob that needs proxying
  if (origin.includes('private.blob.vercel-storage.com') || origin.includes('blob.vercel-storage.com')) {
    const urlObj = new URL(origin);
    if (BLOB_PROXY_DOMAINS.some(domain => urlObj.hostname.includes(domain))) {
      // This is a private blob URL - redirect through proxy
      const pathname = urlObj.pathname + urlObj.search;
      return res.redirect(`/api/blob?pathname=${encodeURIComponent(origin)}`);
    }
  }

  next();
});

// =============================================================================
// BLOB URL REDIRECT MIDDLEWARE
// Redirect blob.vercel-storage.com URLs to local /uploads/
// =============================================================================
app.use((req, res, next) => {
  const referer = req.get('referer') || '';

  // If request is to blob vercel storage, redirect to local uploads
  if (req.hostname && req.hostname.includes('blob.vercel-storage.com')) {
    const pathname = req.path;
    // Convert blob URL path to local uploads path
    // e.g., /destinations/everest/image.jpg -> /uploads/destinations/everest/image.jpg
    const localPath = pathname.replace(/^\/destinations\/|\/tours\/|\/activities\//, '/uploads/');
    return res.redirect(301, localPath);
  }

  next();
});

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'zeo-tourism-admin-secret-key-2024') {
    console.warn('WARNING: JWT_SECRET env var should be set to a secure unique value in production mode!');
  }
  if (!process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL === 'admin@zeotourism.com') {
    console.warn('WARNING: ADMIN_EMAIL env var should be configured and secure in production mode!');
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'admin123') {
    console.warn('WARNING: ADMIN_PASSWORD env var should be configured and secure in production mode!');
  }
}

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET env var not set. Using insecure default — set it in production!');
}
const JWT_SECRET = process.env.JWT_SECRET || 'zeo-tourism-admin-secret-key-2024';

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.warn('WARNING: ADMIN_EMAIL / ADMIN_PASSWORD env vars not set. Using insecure defaults — set them in production!');
}
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@zeotourism.com';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD
  ? null // will be hashed on first use
  : null;
const ADMIN_PASSWORD_PLAIN = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Dynamic subdomain check for zeotourism.com and brandspire.com.np
    const isZeoSubdomain = origin.match(/^https?:\/\/([a-z0-9-]+\.)*zeotourism\.com$/i);
    const isBrandspireSubdomain = origin.match(/^https?:\/\/([a-z0-9-]+\.)*brandspire\.com\.np$/i);

    if (isZeoSubdomain || isBrandspireSubdomain) {
      return callback(null, true);
    }

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000',
    ];

    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // For development, allow any localhost origin
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('Allowing development origin:', origin);
      return callback(null, true);
    }

    console.log('CORS blocked origin:', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Cache-Control', 'X-Requested-With', 'Accept', 'Accept-Encoding'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type']
}));
app.use(morgan('combined'));
app.use(express.json());

// =============================================================================
// ASYNC HANDLER & DATABASE ERROR HANDLING MIDDLEWARE
// =============================================================================

// Async handler wrapper to catch errors from async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware to handle database connection errors
app.use((err, req, res, next) => {
  // Handle MySQL connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('❌ Database connection error:', err.message);
    return res.status(503).json({
      error: 'Database temporarily unavailable. Please try again later.',
      code: 'DB_CONNECTION_ERROR'
    });
  }

  // Handle query errors
  if (err.code === 'ER_PARSE_ERROR' || err.code === 'ER_BAD_FIELD_ERROR') {
    console.error('❌ Database query error:', err.message);
    return res.status(500).json({
      error: 'Database query failed.',
      code: 'DB_QUERY_ERROR'
    });
  }

  // Pass to other error handlers
  next(err);
});

const PUBLIC_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=86400';
const MEDIA_CACHE_CONTROL = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400';

const sendHealth = (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
  }

  res.status(200).json({
    status: 'success',
    message: 'Zeo Tourism API is running successfully!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'json-mode',
    database: 'JSON Files'
  });
};

app.get('/api/health', sendHealth);
app.get('/api/server', sendHealth);

const isAllowedRequestSource = (source) => {
  if (!source) return false;

  try {
    const { hostname, protocol } = new URL(source);
    const isHttp = protocol === 'http:' || protocol === 'https:';
    const allowedHosts = new Set([
      'zeotourism.com',
      'www.zeotourism.com',
      'localhost',
      '127.0.0.1'
    ]);

    return isHttp && allowedHosts.has(hostname);
  } catch (error) {
    return false;
  }
};

// API Protection Middleware: reject hostile cross-site calls without blocking the site or public reads.
app.use('/api', (req, res, next) => {
  const source = req.get('origin') || req.get('referer') || '';

  if (req.path === '/health' || req.path === '/server') {
    return next();
  }

  if (req.path.startsWith('/public') || req.path.startsWith('/uploads')) {
    return next();
  }

  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  if (isAllowedRequestSource(source)) {
    return next();
  }

  const isPublicRead = (req.method === 'GET' || req.method === 'HEAD') && !req.path.startsWith('/admin');
  if (!source && isPublicRead) {
    return next();
  }

  console.warn(`Blocked API request from source: ${source || 'none'} path: ${req.originalUrl}`);
  return res.status(403).json({ error: 'Access denied. Unofficial API usage is prohibited.' });
});

const isPublicCacheableApiPath = (apiPath) => {
  if (apiPath.startsWith('/admin') || apiPath.startsWith('/auth') || apiPath.startsWith('/uploads')) {
    return false;
  }

  return [
    /^\/health$/,
    /^\/tours(\/[^/]+)?$/,
    /^\/destinations(\/[^/]+)?$/,
    /^\/activities(\/[^/]+)?$/,
    /^\/sliders(\/[^/]+)?$/,
    /^\/testimonials(\/[^/]+)?$/,
    /^\/posts(\/[^/]+)?$/,
    /^\/blogs(\/[^/]+)?$/,
    /^\/contact$/,
    /^\/director-message$/,
    /^\/team$/,
    /^\/logos$/
  ].some(pattern => pattern.test(apiPath));
};

app.use('/api', (req, res, next) => {
  if ((req.method === 'GET' || req.method === 'HEAD') && isPublicCacheableApiPath(req.path)) {
    res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
  }
  next();
});

// Compatibility route for direct local/API root checks.
app.get('/', sendHealth);

// Determine upload directories based on environment
// On Vercel serverless, use /tmp for writable directories
// On local dev, use the local filesystem
const os = require('os');
const isVercel = !!process.env.VERCEL;

const uploadsDir = isVercel
  ? path.join(os.tmpdir(), 'zeop-uploads')
  : path.join(__dirname, 'uploads');
const slidersDir = path.join(uploadsDir, 'sliders');
const imagesDir = path.join(slidersDir, 'images');
const videosDir = path.join(slidersDir, 'videos');
const kailashGalleryDir = path.join(uploadsDir, 'kailash-gallery');

// Create all necessary directories (safe to attempt on Vercel /tmp)
[uploadsDir, slidersDir, imagesDir, videosDir, kailashGalleryDir].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn(`Warning: Could not create directory ${dir}:`, err.message);
  }
});

// Serve uploaded files statically — only in local development
// On Vercel, media is served from Blob storage instead
if (!isVercel) {
  app.use(['/uploads', '/api/uploads'], (req, res, next) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': MEDIA_CACHE_CONTROL
    });
    next();
  }, express.static(uploadsDir));
}


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on file type
    let uploadPath;
    if (file.mimetype.startsWith('image/')) {
      uploadPath = imagesDir;
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = videosDir;
    } else {
      return cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;
    cb(null, filename);
  }
});

const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const allowedVideoExtensions = new Set(['.mp4', '.webm', '.mov']);
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
const allowedVideoMimeTypes = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

// TODO: Move production media to Cloudflare R2, S3, Supabase Storage, Vercel Blob, Cloudinary, or VPS storage.
// Vercel serverless/local uploads are temporary compatibility only and are not durable across deployments.

// File filter to only allow known image/video MIME types and extensions.
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const isAllowedImage = allowedImageMimeTypes.has(file.mimetype) && allowedImageExtensions.has(ext);
  const isAllowedVideo = allowedVideoMimeTypes.has(file.mimetype) && allowedVideoExtensions.has(ext);

  if (isAllowedImage || isAllowedVideo) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WebP, AVIF, GIF, MP4, WebM and MOV files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  }
});

// Compression functions
const compressImage = async (inputPath, outputPath, quality = 85) => {
  try {
    const ext = path.extname(outputPath);
    let webpOutputPath = outputPath;
    if (ext.toLowerCase() !== '.webp') {
      webpOutputPath = outputPath.slice(0, -ext.length) + '.webp';
    }

    let pipeline = sharp(inputPath);
    // Force WebP conversion and compression
    pipeline = pipeline.webp({ quality, effort: 4 });

    await pipeline.toFile(webpOutputPath);

    // Delete original file if compression was successful
    if (fs.existsSync(webpOutputPath) && inputPath !== webpOutputPath) {
      fs.unlinkSync(inputPath);
    }

    // If the path was renamed, ensure old non-webp file doesn't exist
    if (outputPath !== webpOutputPath && fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    return webpOutputPath;
  } catch (error) {
    console.error('Image compression error:', error);
    // If compression fails, return original path
    return inputPath;
  }
};

const compressVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .videoBitrate('2000k') // Increased for better quality
      .audioBitrate('128k')
      .format('mp4')
      .size('1920x1080') // Ensure consistent resolution
      .outputOptions([
        '-preset medium', // Better compression
        '-crf 20', // Higher quality (lower CRF)
        '-movflags +faststart', // Optimize for web streaming
        '-pix_fmt yuv420p', // Ensure compatibility
        '-profile:v baseline', // Better browser compatibility
        '-level 3.0' // Compatibility level
      ])
      .on('progress', (progress) => {
        console.log(`Video compression progress: ${Math.round(progress.percent || 0)}%`);
      })
      .on('end', () => {
        console.log('Video compression completed successfully');
        // Delete original file if compression was successful
        if (fs.existsSync(outputPath) && inputPath !== outputPath) {
          fs.unlinkSync(inputPath);
        }
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Video compression error:', err);
        // If compression fails, return original path
        resolve(inputPath);
      })
      .save(outputPath);
  });
};

// Backup helper to keep historical backups of database files (max 5 per file type)
const backupFile = (filename) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    const backupsDir = path.join(dataDir, 'backups');
    const sourcePath = path.join(dataDir, filename);

    if (!fs.existsSync(sourcePath)) return;

    // Resolve target path under backupsDir, preserving subfolders (e.g., tour-details/)
    const targetBackupPath = path.join(backupsDir, filename);
    const targetBackupDir = path.dirname(targetBackupPath);

    // Ensure the specific backup directory exists
    if (!fs.existsSync(targetBackupDir)) {
      fs.mkdirSync(targetBackupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);

    // Construct unique timestamped filename
    const backupFilePath = path.join(targetBackupDir, `${base}_${timestamp}${ext}`);

    // Copy the file
    fs.copyFileSync(sourcePath, backupFilePath);

    // Keep only the 5 most recent backups for this specific file prefix
    const files = fs.readdirSync(targetBackupDir);
    const prefix = `${base}_`;
    const relevantBackups = files
      .filter(f => f.startsWith(prefix) && f.endsWith(ext))
      .map(f => ({ name: f, time: fs.statSync(path.join(targetBackupDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (relevantBackups.length > 5) {
      for (let i = 5; i < relevantBackups.length; i++) {
        fs.unlinkSync(path.join(targetBackupDir, relevantBackups[i].name));
      }
    }
  } catch (error) {
    console.error(`Error backing up ${filename}:`, error);
  }
};

// Load data from JSON files
const loadData = (filename) => {
  try {
    const filePath = path.join(__dirname, 'data', filename);

    // Auto-initialize from default template if the database file does not exist
    if (!fs.existsSync(filePath)) {
      const defaultPath = `${filePath}.default`;
      if (fs.existsSync(defaultPath)) {
        console.log(`Initializing ${filename} from default template...`);
        fs.copyFileSync(defaultPath, filePath);
      }
    }

    // Trigger backup on startup/load to ensure we have a restore point
    backupFile(filename);

    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    // Return appropriate default structure depending on filename
    return filename === 'posts.json' ? { posts: [] } : [];
  }
};// Save data to JSON files atomically
const saveData = (filename, data) => {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    const tempPath = `${filePath}.tmp`;

    // Write to a temporary file first
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
    // Atomically rename to target path to prevent corruption/truncation
    fs.renameSync(tempPath, filePath);

    // Trigger automated backup
    backupFile(filename);

    // Trigger automated sitemap update if it affects routes/URLs
    const sitemapRelatedFiles = ['tours.json', 'destinations.json', 'activities.json', 'posts.json'];
    if (sitemapRelatedFiles.includes(filename) || filename.includes('tour-details')) {
      generateSitemap().catch(err => {
        console.error('Failed to auto-regenerate sitemap on saveData:', err);
      });
    }

    return true;
  } catch (error) {
    console.error(`Error saving ${filename}:`, error);
    return false;
  }
};

// Load tour details from individual files
const loadTourDetails = () => {
  const tourDetailsDir = path.join(__dirname, 'data', 'tour-details');
  const tourDetails = [];

  // Ensure tour-details directory exists
  if (!fs.existsSync(tourDetailsDir)) {
    fs.mkdirSync(tourDetailsDir, { recursive: true });
  }

  try {
    // 1. Copy any missing tour details from their default templates
    const files = fs.readdirSync(tourDetailsDir);
    files.forEach(file => {
      if (file.endsWith('.json.default')) {
        const jsonFile = file.replace('.json.default', '.json');
        const jsonPath = path.join(tourDetailsDir, jsonFile);
        if (!fs.existsSync(jsonPath)) {
          console.log(`Initializing tour detail ${jsonFile} from default template...`);
          fs.copyFileSync(path.join(tourDetailsDir, file), jsonPath);
        }
      }
    });

    // 2. Read and parse the actual .json files
    const refreshedFiles = fs.readdirSync(tourDetailsDir);
    refreshedFiles.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(tourDetailsDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const tourDetail = JSON.parse(data);
          tourDetails.push(tourDetail);
        } catch (error) {
          console.error(`Error loading tour detail file ${file}:`, error);
        }
      }
    });
  } catch (error) {
    console.error('Error reading tour-details directory:', error);
  }

  return tourDetails;
};

// Reload tour details from disk (called after create/update/delete operations)
const reloadTourDetails = () => {
  console.log('Reloading tour details from disk...');
  tourDetails = loadTourDetails();
  console.log(`Reloaded ${tourDetails.length} tour details`);
};

// Load all data
let toursData = loadData('tours.json');
let destinationsData = loadData('destinations.json');
let activitiesData = loadData('activities.json');
let slidersData = loadData('sliders.json');
let usersData = loadData('users.json');
let contactData = loadData('contact.json');
let testimonialsData = loadData('testimonials.json');
let logoData = loadData('logos.json');
let enquiriesData = loadData('enquiries.json');
let kailashGalleryData = loadData('kailash-gallery.json');
let tourDetails = loadTourDetails();
let postsData = loadData('posts.json');
let directorMessageData = loadData('director-message.json');
let teamData = loadData('team.json');

// Extract arrays from the loaded data
let tours = toursData.tours || toursData || [];
let destinations = destinationsData.destinations || destinationsData || [];
let activities = activitiesData.activities || activitiesData || [];
let sliders = slidersData.sliders || slidersData || [];
let users = usersData.users || usersData || [];
let contact = contactData || {};
let testimonials = testimonialsData.testimonials || testimonialsData || [];
let enquiries = enquiriesData || {};
let posts = postsData.posts || postsData || [];
let directorMessage = directorMessageData || {};
let team = teamData.team || teamData || [];
let leadsData = loadData('leads.json');
let leads = leadsData.leads || [];

let logos = logoData.logos || logoData || {
  header: '/src/assets/zeo-logo.png',
  footer: '/src/assets/zeo-logo-white.png',
  lastUpdated: new Date().toISOString()
};
let kailashGallery = kailashGalleryData || {
  gallery: [],
  metadata: {
    totalPhotos: 0,
    lastUpdated: new Date().toISOString(),
    pageTitle: 'Kailash Mansarovar',
    pageSubtitle: 'Sacred Journey Gallery'
  }
};

// In-memory rate limiter for login (max 10 attempts per IP per 15 minutes)
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;

const loginRateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    // Purge attempts outside the window
    record.attempts = record.attempts.filter(t => now - t < LOGIN_WINDOW_MS);
    if (record.attempts.length >= LOGIN_MAX_ATTEMPTS) {
      const retryAfter = Math.ceil((record.attempts[0] + LOGIN_WINDOW_MS - now) / 1000);
      res.set('Retry-After', retryAfter);
      return res.status(429).json({ error: `Too many login attempts. Try again in ${retryAfter}s.` });
    }
    record.attempts.push(now);
  } else {
    loginAttempts.set(ip, { attempts: [now] });
  }

  next();
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTHENTICATION API ====================

// Login endpoint
app.post('/api/auth/login', loginRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailMatch = email === ADMIN_EMAIL;
    // Use bcrypt compare if the password looks like a hash, otherwise plain comparison
    const passwordMatch = ADMIN_PASSWORD_PLAIN.startsWith('$2')
      ? await bcrypt.compare(password, ADMIN_PASSWORD_PLAIN)
      : password === ADMIN_PASSWORD_PLAIN;

    if (emailMatch && passwordMatch) {
      const user = {
        id: 1,
        name: 'Admin User',
        email: ADMIN_EMAIL,
        isAdmin: true
      };

      const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SLIDERS API ====================

// Get all active sliders (public endpoint)
app.get('/api/sliders', async (req, res) => {
  try {
    const activeSliders = sliders
      .filter(slider => slider.is_active)
      .sort((a, b) => a.order_index - b.order_index);
    res.json(activeSliders);
  } catch (error) {
    console.error('Error fetching sliders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all sliders including inactive ones (admin endpoint)
app.get('/api/admin/sliders', authenticateToken, async (req, res) => {
  try {
    const sortedSliders = sliders.sort((a, b) => a.order_index - b.order_index);
    res.json(sortedSliders);
  } catch (error) {
    console.error('Error fetching admin sliders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create new slider with file upload
app.post('/api/admin/sliders', authenticateToken, (req, res) => {
  upload.single('mediaFile')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      console.log('Creating new slider...');
      console.log('Request body:', req.body);
      console.log('Uploaded file:', req.file);

      const sliderData = JSON.parse(req.body.sliderData || '{}');
      const file = req.file;

      console.log('Parsed slider data:', sliderData);

      // Build the slider object
      const newSlider = {
        id: Math.max(...sliders.map(s => s.id), 0) + 1,
        title: sliderData.title || '',
        subtitle: sliderData.subtitle || '',
        location: sliderData.location || '',
        image: sliderData.image || '',
        video: sliderData.video || '',
        order_index: sliderData.order_index || 1,
        is_active: sliderData.is_active !== undefined ? sliderData.is_active : true,
        button_text: sliderData.button_text || '',
        button_url: sliderData.button_url || '',
        button_style: sliderData.button_style || 'primary',
        show_button: sliderData.show_button !== undefined ? sliderData.show_button : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // If a file was uploaded, compress and update the appropriate field
      if (file) {
        console.log('Processing uploaded file:', file.filename);
        let processedFilePath = file.path;

        if (file.mimetype.startsWith('image/')) {
          // Compress image
          const compressedFileName = `compressed_${file.filename}`;
          const compressedPath = path.join(path.dirname(file.path), compressedFileName);

          console.log('Compressing image...');
          processedFilePath = await compressImage(file.path, compressedPath, 85);

          const relativePath = path.relative(uploadsDir, processedFilePath).replace(/\\/g, '/');
          const fileUrl = `/uploads/${relativePath}`;

          newSlider.image = fileUrl;
          newSlider.video = ''; // Clear video if image is uploaded

          console.log('Image compressed and saved:', fileUrl);
        } else if (file.mimetype.startsWith('video/')) {
          // Compress video
          const compressedFileName = `compressed_${path.parse(file.filename).name}.mp4`;
          const compressedPath = path.join(path.dirname(file.path), compressedFileName);

          console.log('Compressing video...');
          processedFilePath = await compressVideo(file.path, compressedPath);

          const relativePath = path.relative(uploadsDir, processedFilePath).replace(/\\/g, '/');
          const fileUrl = `/uploads/${relativePath}`;

          newSlider.video = fileUrl;
          // Keep existing image as thumbnail or use a default
          if (!newSlider.image) {
            newSlider.image = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&h=1080&fit=crop';
          }

          console.log('Video compressed and saved:', fileUrl);
        }
      }

      console.log('Final slider object:', newSlider);

      sliders.push(newSlider);
      const saved = saveData('sliders.json', sliders);

      if (!saved) {
        throw new Error('Failed to save slider data to file');
      }

      console.log('Slider created successfully');
      res.status(201).json(newSlider);
    } catch (error) {
      console.error('Error creating slider:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
});

// Admin: Update slider with file upload
app.put('/api/admin/sliders/:id', authenticateToken, (req, res) => {
  upload.single('mediaFile')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      console.log('Updating slider with ID:', req.params.id);
      console.log('Request body:', req.body);
      console.log('Uploaded file:', req.file);

      const { id } = req.params;
      const updateData = JSON.parse(req.body.sliderData || '{}');
      const file = req.file;
      const sliderIndex = sliders.findIndex(s => s.id === parseInt(id));

      if (sliderIndex === -1) {
        return res.status(404).json({ error: 'Slider not found' });
      }

      const existingSlider = sliders[sliderIndex];

      // If a new file was uploaded, compress and handle it
      if (file) {
        console.log('Processing uploaded file for update:', file.filename);
        let processedFilePath = file.path;

        // Delete old file if it exists and is a local upload
        if (file.mimetype.startsWith('image/') && existingSlider.image && existingSlider.image.startsWith('/uploads/')) {
          const oldImagePath = path.join(__dirname, existingSlider.image);
          if (fs.existsSync(oldImagePath)) {
            console.log('Deleting old image:', oldImagePath);
            fs.unlinkSync(oldImagePath);
          }
        } else if (file.mimetype.startsWith('video/') && existingSlider.video && existingSlider.video.startsWith('/uploads/')) {
          const oldVideoPath = path.join(__dirname, existingSlider.video);
          if (fs.existsSync(oldVideoPath)) {
            console.log('Deleting old video:', oldVideoPath);
            fs.unlinkSync(oldVideoPath);
          }
        }

        if (file.mimetype.startsWith('image/')) {
          // Compress image
          const compressedFileName = `compressed_${file.filename}`;
          const compressedPath = path.join(path.dirname(file.path), compressedFileName);

          console.log('Compressing image for update...');
          processedFilePath = await compressImage(file.path, compressedPath, 85);

          const relativePath = path.relative(uploadsDir, processedFilePath).replace(/\\/g, '/');
          const fileUrl = `/uploads/${relativePath}`;

          updateData.image = fileUrl;
          updateData.video = ''; // Clear video if image is uploaded

          console.log('Image compressed and updated:', fileUrl);
        } else if (file.mimetype.startsWith('video/')) {
          // Compress video
          const compressedFileName = `compressed_${path.parse(file.filename).name}.mp4`;
          const compressedPath = path.join(path.dirname(file.path), compressedFileName);

          console.log('Compressing video for update...');
          processedFilePath = await compressVideo(file.path, compressedPath);

          const relativePath = path.relative(uploadsDir, processedFilePath).replace(/\\/g, '/');
          const fileUrl = `/uploads/${relativePath}`;

          updateData.video = fileUrl;
          // Keep existing image as thumbnail if not provided
          if (!updateData.image) {
            updateData.image = existingSlider.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&h=1080&fit=crop';
          }

          console.log('Video compressed and updated:', fileUrl);
        }
      }

      sliders[sliderIndex] = {
        ...existingSlider,
        ...updateData,
        updated_at: new Date().toISOString()
      };

      console.log('Updated slider:', sliders[sliderIndex]);

      const saved = saveData('sliders.json', sliders);
      if (!saved) {
        throw new Error('Failed to save slider data to file');
      }

      console.log('Slider updated successfully');
      res.json(sliders[sliderIndex]);
    } catch (error) {
      console.error('Error updating slider:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
});

// Admin: Delete slider
app.delete('/api/admin/sliders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const sliderIndex = sliders.findIndex(s => s.id === parseInt(id));

    if (sliderIndex === -1) {
      return res.status(404).json({ error: 'Slider not found' });
    }

    const slider = sliders[sliderIndex];

    // Delete associated files if they are local uploads
    if (slider.image && slider.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, slider.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (slider.video && slider.video.startsWith('/uploads/')) {
      const videoPath = path.join(__dirname, slider.video);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    sliders.splice(sliderIndex, 1);
    saveData('sliders.json', sliders);

    res.json({ message: 'Slider deleted successfully' });
  } catch (error) {
    console.error('Error deleting slider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to update destination relationships when tour relationships change
const updateDestinationRelationships = (tourId, newPrimaryDestId, newSecondaryDestIds = [], oldPrimaryDestId = null, oldSecondaryDestIds = []) => {
  // Remove tour from all old destinations
  const allOldDestIds = [oldPrimaryDestId, ...oldSecondaryDestIds].filter(Boolean);
  allOldDestIds.forEach(destId => {
    const destIndex = destinations.findIndex(d => d.id === destId);
    if (destIndex !== -1) {
      const relatedTours = destinations[destIndex].relatedTours || [];
      destinations[destIndex].relatedTours = relatedTours.filter(id => id !== tourId);
    }
  });

  // Add tour to all new destinations (primary + secondary)
  const allNewDestIds = [newPrimaryDestId, ...newSecondaryDestIds].filter(Boolean);
  allNewDestIds.forEach(destId => {
    const destIndex = destinations.findIndex(d => d.id === destId);
    if (destIndex !== -1) {
      const relatedTours = destinations[destIndex].relatedTours || [];
      if (!relatedTours.includes(tourId)) {
        destinations[destIndex].relatedTours = [...relatedTours, tourId];
      }
    }
  });

  // Save updated destinations
  saveData('destinations.json', destinations);
};

// ==================== BLOG POSTS API ====================

// Get all posts
app.get('/api/posts', async (req, res) => {
  // Sort posts by date descending
  const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(sortedPosts);
});

// Get single post by slug
app.get('/api/posts/:slug', async (req, res) => {
  const { slug } = req.params;
  const post = posts.find(p => p.slug === slug);

  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

// Admin: Get single post by ID for editing
app.get('/api/admin/posts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const post = posts.find(p => p.id === parseInt(id));

  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

// Admin: Create new post
app.post('/api/admin/posts', authenticateToken, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const postData = JSON.parse(req.body.postData || '{}');
      const file = req.file;

      const newPost = {
        id: Math.max(...posts.map(p => p.id), 0) + 1,
        slug: postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: postData.title,
        excerpt: postData.excerpt,
        content: postData.content,
        author: postData.author || 'Admin',
        date: postData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        readTime: postData.readTime || '5 min read',
        category: postData.category,
        featured: postData.featured || false,
        image: postData.image || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (file) {
        // Compress image
        const compressedFileName = `compressed_${file.filename}`;
        const compressedPath = path.join(path.dirname(file.path), compressedFileName);

        const processedPath = await compressImage(file.path, compressedPath, 85);

        const relativePath = path.relative(uploadsDir, processedPath).replace(/\\/g, '/');
        // Ensure it uses the /uploads prefix
        const fileUrl = `/uploads/${relativePath}`;
        newPost.image = fileUrl;
      }

      posts.push(newPost);
      saveData('posts.json', { posts });
      res.status(201).json(newPost);

    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Admin: Update post
app.put('/api/admin/posts/:id', authenticateToken, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { id } = req.params;
      const postData = JSON.parse(req.body.postData || '{}');
      const file = req.file;

      const index = posts.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const updatedPost = {
        ...posts[index],
        ...postData,
        updated_at: new Date().toISOString()
      };

      if (file) {
        const compressedFileName = `compressed_${file.filename}`;
        const compressedPath = path.join(path.dirname(file.path), compressedFileName);

        const processedPath = await compressImage(file.path, compressedPath, 85);

        const relativePath = path.relative(uploadsDir, processedPath).replace(/\\/g, '/');
        updatedPost.image = `/uploads/${relativePath}`;
      }

      posts[index] = updatedPost;
      saveData('posts.json', { posts });
      res.json(updatedPost);

    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Admin: Delete post
app.delete('/api/admin/posts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const index = posts.findIndex(p => p.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  posts.splice(index, 1);
  saveData('posts.json', { posts });
  res.json({ message: 'Post deleted' });
});

// ==================== DIRECTOR MESSAGE API ====================

app.get('/api/director-message', async (req, res) => {
  res.json(directorMessage);
});

app.put('/api/admin/director-message', authenticateToken, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      // Handle both JSON-encoded data and direct form fields
      let updatedMessage = {};
      if (req.body.directorData) {
        updatedMessage = JSON.parse(req.body.directorData);
      } else {
        updatedMessage = { ...req.body };
      }

      const file = req.file;

      // Update basic fields
      directorMessage = { ...directorMessage, ...updatedMessage };

      // Handle file upload if present
      if (file) {
        console.log('Processing uploaded director image:', file.filename);

        // Compress image
        const compressedFileName = `compressed_${file.filename}`;
        const compressedPath = path.join(path.dirname(file.path), compressedFileName);

        const processedPath = await compressImage(file.path, compressedPath, 85);

        const relativePath = path.relative(uploadsDir, processedPath).replace(/\\/g, '/');
        const fileUrl = `/uploads/${relativePath}`;

        directorMessage.image = fileUrl;
        console.log('Director image updated:', fileUrl);
      }

      saveData('director-message.json', directorMessage);
      res.json(directorMessage);
    } catch (error) {
      console.error('Error updating director message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// ==================== TEAM API ====================

app.get('/api/team', async (req, res) => {
  // Sort by order_index
  const sortedTeam = [...team].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  res.json(sortedTeam);
});

app.post('/api/admin/team', authenticateToken, (req, res) => {
  try {
    const newMember = {
      id: Math.max(...team.map(m => m.id), 0) + 1,
      ...req.body,
      created_at: new Date().toISOString()
    };
    team.push(newMember);
    saveData('team.json', team);
    res.status(201).json(newMember);
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/team/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const index = team.findIndex(m => m.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    team[index] = { ...team[index], ...req.body };
    saveData('team.json', team);
    res.json(team[index]);
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/team/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const index = team.findIndex(m => m.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    team.splice(index, 1);
    saveData('team.json', team);
    res.json({ message: 'Team member deleted' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/team/order', authenticateToken, (req, res) => {
  try {
    const updates = req.body; // Array of { id, order_index }

    updates.forEach(update => {
      const member = team.find(m => m.id === update.id);
      if (member) {
        member.order_index = update.order_index;
      }
    });

    saveData('team.json', team);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// =============================================================================
// MYSQL DATABASE-POWERED ENDPOINTS (when db module is available)
// =============================================================================

// Helper to check if database is available
const isDbAvailable = () => db && typeof db.query === 'function';

// Admin middleware wrapper for database routes
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = user;
    next();
  });
};

// =============================================================================
// MYSQL-powered TOURS endpoints
// =============================================================================

// GET /api/db/tours - Tours from MySQL database
app.get('/api/db/tours', asyncHandler(async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({
      error: 'Database not available',
      message: 'MySQL database is not connected. Use /api/tours for JSON fallback.'
    });
  }

  const { category, destination, featured, search } = req.query;

  try {
    let query = `
      SELECT t.*, d.name as destination_name, d.slug as destination_slug 
      FROM tours t 
      LEFT JOIN destinations d ON t.destination_id = d.id 
      WHERE t.listed = 1
    `;
    const params = [];

    if (category) {
      query += ' AND t.category = ?';
      params.push(category);
    }

    if (featured === 'true') {
      query += ' AND t.featured = 1';
    }

    if (search) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ? OR t.location LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY t.id DESC';

    const tours = await db.query(query, params);

    // Parse itinerary_json string back to JSON array
    const processedTours = tours.map(tour => ({
      ...tour,
      itinerary: tour.itinerary_json ? JSON.parse(tour.itinerary_json) : [],
      gallery: tour.gallery ? JSON.parse(tour.gallery) : [],
      highlights: tour.highlights ? JSON.parse(tour.highlights) : [],
      inclusions: tour.inclusions ? JSON.parse(tour.inclusions) : [],
      exclusions: tour.exclusions ? JSON.parse(tour.exclusions) : []
    }));

    res.json(processedTours);
  } catch (error) {
    console.error('Error fetching tours from database:', error);
    res.status(500).json({ error: 'Failed to fetch tours from database' });
  }
}));

// GET /api/db/tours/:slug - Single tour from MySQL
app.get('/api/db/tours/:slug', asyncHandler(async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'Database not available' });
  }

  const { slug } = req.params;

  try {
    const tours = await db.query(
      'SELECT t.*, d.name as destination_name, d.slug as destination_slug FROM tours t LEFT JOIN destinations d ON t.destination_id = d.id WHERE t.slug = ? AND t.listed = 1',
      [slug]
    );

    if (tours.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    const tour = tours[0];

    // Parse all JSON fields
    const processedTour = {
      ...tour,
      itinerary: tour.itinerary_json ? JSON.parse(tour.itinerary_json) : [],
      gallery: tour.gallery ? JSON.parse(tour.gallery) : [],
      highlights: tour.highlights ? JSON.parse(tour.highlights) : [],
      inclusions: tour.inclusions ? JSON.parse(tour.inclusions) : [],
      exclusions: tour.exclusions ? JSON.parse(tour.exclusions) : [],
      activities: tour.activities ? JSON.parse(tour.activities) : []
    };

    res.json(processedTour);
  } catch (error) {
    console.error('Error fetching tour from database:', error);
    res.status(500).json({ error: 'Failed to fetch tour' });
  }
}));

// =============================================================================
// MYSQL-powered DESTINATIONS endpoints  
// =============================================================================

// GET /api/db/destinations - Destinations from MySQL database
app.get('/api/db/destinations', asyncHandler(async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({
      error: 'Database not available',
      message: 'MySQL database is not connected. Use /api/destinations for JSON fallback.'
    });
  }

  const { country } = req.query;

  try {
    let query = 'SELECT * FROM destinations WHERE listed = 1';
    const params = [];

    if (country) {
      query += ' AND country = ?';
      params.push(country);
    }

    query += ' ORDER BY id DESC';

    const destinations = await db.query(query, params);

    res.json(destinations);
  } catch (error) {
    console.error('Error fetching destinations from database:', error);
    res.status(500).json({ error: 'Failed to fetch destinations from database' });
  }
}));

// GET /api/db/destinations/:slug - Single destination from MySQL
app.get('/api/db/destinations/:slug', asyncHandler(async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'Database not available' });
  }

  const { slug } = req.params;

  try {
    const destinations = await db.query(
      'SELECT * FROM destinations WHERE slug = ? AND listed = 1',
      [slug]
    );

    if (destinations.length === 0) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json(destinations[0]);
  } catch (error) {
    console.error('Error fetching destination from database:', error);
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
}));

// =============================================================================
// MYSQL-powered ENQUIRIES endpoints
// =============================================================================

// POST /api/db/enquiries - Submit enquiry to MySQL
app.post('/api/db/enquiries', asyncHandler(async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({
      error: 'Database not available',
      message: 'MySQL database is not connected. Use /api/contact/enquiry for JSON fallback.'
    });
  }

  const { name, email, phone, subject, message, tour_id, tour_name, destination, number_of_people, travel_date } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const result = await db.query(
      `INSERT INTO enquiries (name, email, phone, subject, message, tour_id, tour_name, destination, number_of_people, travel_date, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', NOW())`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        phone?.trim() || null,
        subject?.trim() || 'General Inquiry',
        message.trim(),
        tour_id || null,
        tour_name?.trim() || null,
        destination?.trim() || null,
        number_of_people?.trim() || null,
        travel_date || null
      ]
    );

    console.log(`✅ New enquiry saved to database: ID ${result.insertId} from ${email}`);

    res.status(201).json({
      success: true,
      message: 'Thank you for your enquiry! We will get back to you soon.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error saving enquiry to database:', error);
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
}));

// =============================================================================
// MYSQL-powered ADMIN CRUD endpoints
// =============================================================================

// GET /api/db/admin/tours - List all tours (admin)
app.get('/api/db/admin/tours', requireAdmin, asyncHandler(async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    const tours = await db.query(
      'SELECT t.*, d.name as destination_name FROM tours t LEFT JOIN destinations d ON t.destination_id = d.id ORDER BY t.id DESC'
    );

    // Parse JSON fields
    const processedTours = tours.map(tour => ({
      ...tour,
      itinerary: tour.itinerary_json ? JSON.parse(tour.itinerary_json) : []
    }));

    res.json(processedTours);
  } catch (error) {
    console.error('Error fetching admin tours:', error);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
}));

// POST /api/db/admin/tours - Create new tour (admin)
app.post('/api/db/admin/tours', requireAdmin, asyncHandler(async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'Database not available' });
  }

  const {
    slug, title, category, description, location, price, duration, duration_days,
    group_size, difficulty, rating, reviews, best_time, featured, listed,
    image_url, gallery, highlights, inclusions, exclusions, activities,
    itinerary, destination_id
  } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ error: 'Title and slug are required' });
  }

  try {
    // Stringify JSON fields
    const itineraryJson = itinerary ? JSON.stringify(itinerary) : '[]';
    const galleryJson = gallery ? JSON.stringify(gallery) : '[]';
    const highlightsJson = highlights ? JSON.stringify(highlights) : '[]';
    const inclusionsJson = inclusions ? JSON.stringify(inclusions) : '[]';
    const exclusionsJson = exclusions ? JSON.stringify(exclusions) : '[]';
    const activitiesJson = activities ? JSON.stringify(activities) : '[]';

    const result = await db.query(
      `INSERT INTO tours (slug, title, category, description, location, price, duration, duration_days, 
        group_size, difficulty, rating, reviews, best_time, featured, listed, image_url, 
        gallery, highlights, inclusions, exclusions, activities, itinerary_json, destination_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        slug.trim().toLowerCase(),
        title.trim(),
        category?.trim() || '',
        description || '',
        location?.trim() || '',
        parseFloat(price) || 0,
        duration?.trim() || '',
        parseInt(duration_days) || null,
        group_size?.trim() || '',
        difficulty?.trim() || '',
        parseFloat(rating) || 0,
        parseInt(reviews) || 0,
        best_time?.trim() || '',
        featured === true || featured === 'true',
        listed !== false && listed !== 'false',
        image_url?.trim() || '',
        galleryJson,
        highlightsJson,
        inclusionsJson,
        exclusionsJson,
        activitiesJson,
        itineraryJson,
        parseInt(destination_id) || null
      ]
    );

    console.log(`✅ New tour created in database: ID ${result.insertId}`);

    res.status(201).json({
      success: true,
      message: 'Tour created successfully',
      id: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'A tour with this slug already exists' });
    }
    console.error('Error creating tour in database:', error);
    res.status(500).json({ error: 'Failed to create tour' });
  }
}));

// PUT /api/db/admin/tours/:id - Update tour (admin)
app.put('/api/db/admin/tours/:id', requireAdmin, asyncHandler(async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'Database not available' });
  }

  const { id } = req.params;
  const {
    slug, title, category, description, location, price, duration, duration_days,
    group_size, difficulty, rating, reviews, best_time, featured, listed,
    image_url, gallery, highlights, inclusions, exclusions, activities,
    itinerary, destination_id
  } = req.body;

  try {
    // Build dynamic update query
    const updates = [];
    const params = [];

    if (slug !== undefined) { updates.push('slug = ?'); params.push(slug.trim().toLowerCase()); }
    if (title !== undefined) { updates.push('title = ?'); params.push(title.trim()); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category?.trim() || ''); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (location !== undefined) { updates.push('location = ?'); params.push(location?.trim() || ''); }
    if (price !== undefined) { updates.push('price = ?'); params.push(parseFloat(price) || 0); }
    if (duration !== undefined) { updates.push('duration = ?'); params.push(duration?.trim() || ''); }
    if (duration_days !== undefined) { updates.push('duration_days = ?'); params.push(parseInt(duration_days) || null); }
    if (group_size !== undefined) { updates.push('group_size = ?'); params.push(group_size?.trim() || ''); }
    if (difficulty !== undefined) { updates.push('difficulty = ?'); params.push(difficulty?.trim() || ''); }
    if (rating !== undefined) { updates.push('rating = ?'); params.push(parseFloat(rating) || 0); }
    if (reviews !== undefined) { updates.push('reviews = ?'); params.push(parseInt(reviews) || 0); }
    if (best_time !== undefined) { updates.push('best_time = ?'); params.push(best_time?.trim() || ''); }
    if (featured !== undefined) { updates.push('featured = ?'); params.push(featured === true); }
    if (listed !== undefined) { updates.push('listed = ?'); params.push(listed !== false); }
    if (image_url !== undefined) { updates.push('image_url = ?'); params.push(image_url?.trim() || ''); }
    if (gallery !== undefined) { updates.push('gallery = ?'); params.push(JSON.stringify(gallery)); }
    if (highlights !== undefined) { updates.push('highlights = ?'); params.push(JSON.stringify(highlights)); }
    if (inclusions !== undefined) { updates.push('inclusions = ?'); params.push(JSON.stringify(inclusions)); }
    if (exclusions !== undefined) { updates.push('exclusions = ?'); params.push(JSON.stringify(exclusions)); }
    if (activities !== undefined) { updates.push('activities = ?'); params.push(JSON.stringify(activities)); }
    if (itinerary !== undefined) { updates.push('itinerary_json = ?'); params.push(JSON.stringify(itinerary)); }
    if (destination_id !== undefined) { updates.push('destination_id = ?'); params.push(parseInt(destination_id) || null); }

    updates.push('updated_at = NOW()');
    params.push(parseInt(id));

    const result = await db.query(
      `UPDATE tours SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    console.log(`✅ Tour updated in database: ID ${id}`);

    res.json({ success: true, message: 'Tour updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'A tour with this slug already exists' });
    }
    console.error('Error updating tour in database:', error);
    res.status(500).json({ error: 'Failed to update tour' });
  }
}));

// DELETE /api/db/admin/tours/:id - Delete tour (admin)
app.delete('/api/db/admin/tours/:id', requireAdmin, asyncHandler(async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'Database not available' });
  }

  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM tours WHERE id = ?', [parseInt(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    console.log(`✅ Tour deleted from database: ID ${id}`);

    res.json({ success: true, message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour from database:', error);
    res.status(500).json({ error: 'Failed to delete tour' });
  }
}));

// =============================================================================
// MYSQL-powered ADMIN ENQUIRIES endpoints
// =============================================================================

// GET /api/db/admin/enquiries - List enquiries (admin)
app.get('/api/db/admin/enquiries', requireAdmin, asyncHandler(async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'Database not available' });
  }

  const { status } = req.query;

  try {
    let query = 'SELECT * FROM enquiries';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const enquiries = await db.query(query, params);
    res.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries from database:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
}));

// PUT /api/db/admin/enquiries/:id - Update enquiry status (admin)
app.put('/api/db/admin/enquiries/:id', requireAdmin, asyncHandler(async (req, res) => {
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'Database not available' });
  }

  const { id } = req.params;
  const { status, notes, assigned_to } = req.body;

  const validStatuses = ['new', 'contacted', 'converted', 'lost'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const updates = [];
    const params = [];

    if (status) { updates.push('status = ?'); params.push(status); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (assigned_to !== undefined) { updates.push('assigned_to = ?'); params.push(assigned_to); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = NOW()');
    params.push(parseInt(id));

    const result = await db.query(
      `UPDATE enquiries SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({ success: true, message: 'Enquiry updated successfully' });
  } catch (error) {
    console.error('Error updating enquiry in database:', error);
    res.status(500).json({ error: 'Failed to update enquiry' });
  }
}));

// =============================================================================
// END OF MYSQL DATABASE-POWERED ENDPOINTS
// =============================================================================

// ==================== TOURS API (JSON Fallback) ====================

const getTourExcerpt = (description = '') => {
  if (!description) return '';
  return description.length > 220 ? `${description.slice(0, 217).trim()}...` : description;
};

const serializeTourListItem = (tour) => ({
  id: tour.id,
  slug: tour.slug,
  title: tour.title,
  category: tour.category,
  description: getTourExcerpt(tour.description),
  image: tour.image,
  duration: tour.duration,
  location: tour.location,
  price: tour.price,
  priceAvailable: tour.priceAvailable,
  featured: tour.featured,
  listed: tour.listed,
  rating: tour.rating,
  updated_at: tour.updated_at || tour.updatedAt,
  primary_destination_id: tour.primary_destination_id,
  secondary_destination_ids: tour.secondary_destination_ids || []
});

// Get all tours (merge basic tours with detailed tours)
app.get('/api/tours', asyncHandler(async (req, res) => {
  const { category, location, search, featured, view } = req.query;

  // Use MySQL if database is available
  if (db && typeof db.query === 'function') {
    try {
      let query = `
        SELECT t.*, d.name as destination_name, d.slug as destination_slug 
        FROM tours t 
        LEFT JOIN destinations d ON t.destination_id = d.id 
        WHERE t.listed = 1
      `;
      const params = [];

      if (category) {
        query += ' AND t.category = ?';
        params.push(category);
      }

      if (featured === 'true') {
        query += ' AND t.featured = 1';
      }

      if (search) {
        query += ' AND (t.title LIKE ? OR t.description LIKE ? OR t.location LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (location) {
        query += ' AND (t.location LIKE ? OR d.name LIKE ?)';
        const locationTerm = `%${location}%`;
        params.push(locationTerm, locationTerm);
      }

      query += ' ORDER BY t.id DESC';

      const tours = await db.query(query, params);

      // Parse JSON fields
      const processedTours = tours.map(tour => ({
        ...tour,
        itinerary: tour.itinerary_json ? JSON.parse(tour.itinerary_json) : [],
        gallery: tour.gallery ? JSON.parse(tour.gallery) : [],
        highlights: tour.highlights ? JSON.parse(tour.highlights) : [],
        inclusions: tour.inclusions ? JSON.parse(tour.inclusions) : [],
        exclusions: tour.exclusions ? JSON.parse(tour.exclusions) : []
      }));

      if (view === 'list') {
        return res.json(processedTours.map(serializeTourListItem));
      }

      return res.json(processedTours);
    } catch (dbError) {
      console.error('MySQL query error, falling back to JSON:', dbError.message);
      // Fall through to JSON fallback
    }
  }

  // JSON fallback mode
  // Merge basic tours with detailed tours, prioritizing detailed tours
  const allTours = [...tourDetails];

  // Add basic tours that don't have detailed versions
  tours.forEach(basicTour => {
    const hasDetailedVersion = tourDetails.some(detailedTour => detailedTour.id === basicTour.id);
    if (!hasDetailedVersion) {
      allTours.push(basicTour);
    }
  });

  // Filter out unlisted tours (only show tours where listed is true or undefined)
  let filteredTours = allTours.filter(tour => tour.listed !== false);

  // Filter out tours whose primary destination is unlisted
  const unlistedDestinationIds = (destinations || [])
    .filter(dest => dest.listed === false)
    .map(dest => dest.id);

  filteredTours = filteredTours.filter(tour =>
    !unlistedDestinationIds.includes(tour.primary_destination_id)
  );

  // Filter by category
  if (category) {
    filteredTours = filteredTours.filter(tour =>
      tour.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by location (check location string AND destination relationships)
  if (location) {
    const searchLocation = location.toLowerCase();

    // Find destination IDs that match the search location (check name, country, and type)
    const matchedDestIds = destinations
      .filter(d =>
        d.name.toLowerCase().includes(searchLocation) ||
        d.name.toLowerCase() === searchLocation ||
        (d.country && d.country.toLowerCase() === searchLocation) ||
        (d.type && d.type.toLowerCase() === searchLocation)
      )
      .map(d => d.id);

    filteredTours = filteredTours.filter(tour => {
      // Check 1: Location string match
      const locationMatch = tour.location?.toLowerCase().includes(searchLocation);

      // Check 2: Primary destination match
      const primaryDestMatch = matchedDestIds.includes(tour.primary_destination_id);

      // Check 3: Secondary destinations match
      const secondaryDestMatch = tour.secondary_destination_ids?.some(id => matchedDestIds.includes(id));

      return locationMatch || primaryDestMatch || secondaryDestMatch;
    });
  }

  // Search filter
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredTours = filteredTours.filter(tour =>
      (tour.title?.toLowerCase().includes(searchTerm) || false) ||
      (tour.description?.toLowerCase().includes(searchTerm) || false) ||
      (tour.location?.toLowerCase().includes(searchTerm) || false) ||
      (tour.category?.toLowerCase().includes(searchTerm) || false) ||
      (tour.highlights && tour.highlights.some(h => h?.toLowerCase().includes(searchTerm)))
    );
  }

  if (featured === 'true') {
    filteredTours = filteredTours.filter(tour => tour.featured === true);
  }

  if (view === 'list') {
    return res.json(filteredTours.map(serializeTourListItem));
  }

  res.json(filteredTours);
}));

// Admin: Export all tour data
app.get('/api/admin/tours/export', authenticateToken, async (req, res) => {
  try {
    console.log('Exporting all tours...');

    // Merge basic tours with detailed tours to ensure we have everything
    const allTours = [...tourDetails];

    // Add basic tours that don't have detailed versions
    tours.forEach(basicTour => {
      const hasDetailedVersion = tourDetails.some(detailedTour => detailedTour.id === basicTour.id);
      if (!hasDetailedVersion) {
        allTours.push(basicTour);
      }
    });

    // Sort by ID
    allTours.sort((a, b) => a.id - b.id);

    // Set headers for file download
    const timestamp = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Disposition', `attachment; filename=zeo_tours_export_${timestamp}.json`);
    res.setHeader('Content-Type', 'application/json');

    res.json(allTours);
  } catch (error) {
    console.error('Error exporting tours:', error);
    res.status(500).json({ error: 'Failed to export tours' });
  }
});

// Admin: Export single tour data
app.get('/api/admin/tours/:id/export', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Exporting tour ${id}...`);

    let tour = tourDetails.find(t => t.id === parseInt(id));
    if (!tour) {
      tour = tours.find(t => t.id === parseInt(id));
    }

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Set headers for file download
    const filename = tour.slug ? `${tour.slug}.json` : `tour_${tour.id}.json`;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/json');

    res.json(tour);
  } catch (error) {
    console.error('Error exporting tour:', error);
    res.status(500).json({ error: 'Failed to export tour' });
  }
});

// Admin: Get all tours with pagination and admin-specific features
app.get('/api/admin/tours', authenticateToken, async (req, res) => {
  try {
    console.log('Admin tours request:', req.query);

    const { page = 1, limit = 20, search, destination } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Merge basic tours with detailed tours, prioritizing detailed tours
    const allTours = [...tourDetails];

    // Add basic tours that don't have detailed versions
    tours.forEach(basicTour => {
      const hasDetailedVersion = tourDetails.some(detailedTour => detailedTour.id === basicTour.id);
      if (!hasDetailedVersion) {
        allTours.push(basicTour);
      }
    });

    let filteredTours = [...allTours];

    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTours = filteredTours.filter(tour => {
        // Basic fields
        const basicMatch =
          (tour.title?.toLowerCase().includes(searchTerm) || false) ||
          (tour.description?.toLowerCase().includes(searchTerm) || false) ||
          (tour.location?.toLowerCase().includes(searchTerm) || false) ||
          (tour.category?.toLowerCase().includes(searchTerm) || false) ||
          (tour.highlights && tour.highlights.some(h => h?.toLowerCase().includes(searchTerm)));

        if (basicMatch) return true;

        // Check related_destinations array
        if (tour.related_destinations && Array.isArray(tour.related_destinations)) {
          const matchesRelated = tour.related_destinations.some(d => {
            const tourDest = d.toLowerCase();
            return tourDest.includes(searchTerm) || searchTerm.includes(tourDest);
          });
          if (matchesRelated) return true;
        }

        // Check assigned destination name
        if (tour.primary_destination_id) {
          const dest = destinations.find(d => d.id === tour.primary_destination_id);
          if (dest) {
            const matchesDest =
              (dest.name || dest.title || '').toLowerCase().includes(searchTerm) ||
              (dest.country || '').toLowerCase().includes(searchTerm);

            if (matchesDest) return true;
          }
        }

        return false;
      });
    }

    // Destination filter
    if (destination) {
      const destSearch = destination.toLowerCase();
      filteredTours = filteredTours.filter(tour => {
        // Check direct fields
        const matchesDirect =
          (tour.location && tour.location.toLowerCase().includes(destSearch)) ||
          (tour.destination_name && tour.destination_name.toLowerCase().includes(destSearch));

        if (matchesDirect) return true;

        // Check related_destinations array
        if (tour.related_destinations && Array.isArray(tour.related_destinations)) {
          const matchesRelated = tour.related_destinations.some(d => {
            const tourDest = d.toLowerCase();
            return tourDest.includes(destSearch) || destSearch.includes(tourDest);
          });
          if (matchesRelated) return true;
        }

        // Check primary_destination_id relationship
        if (tour.primary_destination_id) {
          const destObj = destinations.find(d => d.id === tour.primary_destination_id);
          if (destObj) {
            const matchesDest =
              (destObj.name || destObj.title || '').toLowerCase().includes(destSearch) ||
              (destObj.country || '').toLowerCase().includes(destSearch);

            if (matchesDest) return true;
          }
        }

        return false;
      });
    }

    // Status filter (listed/unlisted)
    if (req.query.status) {
      if (req.query.status === 'listed') {
        filteredTours = filteredTours.filter(tour => tour.listed !== false);
      } else if (req.query.status === 'unlisted') {
        filteredTours = filteredTours.filter(tour => tour.listed === false);
      }
    }

    // Region filter (nepal/international)
    if (req.query.region) {
      const region = req.query.region.toLowerCase();
      filteredTours = filteredTours.filter(tour => {
        // Try to identify the tour's region type
        let type = null;

        // 1. Check primary destination object
        if (tour.primary_destination_id) {
          const dest = destinations.find(d => d.id === tour.primary_destination_id);
          if (dest && dest.type) type = dest.type;
        }

        // 2. Check location string field
        if (!type && tour.location) {
          const loc = tour.location.toLowerCase();
          if (loc.includes('nepal')) type = 'nepal';
          else if (/bhutan|tibet|india|dubai|thailand|maldives|vietnam|indonesia|philippines|azerbaijan|kenya|canada|uae/.test(loc)) {
            type = 'international';
          }
        }

        // 3. Check related_destinations array
        if (!type && tour.related_destinations && Array.isArray(tour.related_destinations)) {
          const hasNepal = tour.related_destinations.some(d => d.toLowerCase().includes('nepal'));
          const hasIntl = tour.related_destinations.some(d => /bhutan|tibet|india|dubai|thailand|maldives|sri lanka/.test(d.toLowerCase()));

          if (hasNepal) type = 'nepal';
          else if (hasIntl) type = 'international';
        }

        return type === region;
      });
    }

    // Sort by ID descending (newest first)
    filteredTours.sort((a, b) => b.id - a.id);

    // Calculate pagination
    const totalItems = filteredTours.length;
    const totalPages = Math.ceil(totalItems / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    // Apply pagination
    const paginatedTours = filteredTours.slice(startIndex, endIndex);

    console.log(`Returning ${paginatedTours.length} tours out of ${totalItems} total`);

    res.json({
      tours: paginatedTours,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching admin tours:', error);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
});

// Admin: Create new tour with relationship management
app.post('/api/admin/tours', authenticateToken, async (req, res) => {
  try {
    console.log('Creating new tour with relationships...');
    console.log('Request body:', req.body);

    const tourData = req.body;
    const newTour = {
      ...tourData,
      id: Math.max(...tours.map(t => t.id), ...tourDetails.map(t => t.id), 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update destination relationships
    if (newTour.primary_destination_id || (newTour.secondary_destination_ids && newTour.secondary_destination_ids.length > 0)) {
      updateDestinationRelationships(
        newTour.id,
        newTour.primary_destination_id,
        newTour.secondary_destination_ids || []
      );
    }

    // Save tour data to the individual tour-detail file
    const detailFilename = path.join('tour-details', `${newTour.slug}.json`);
    const savedDetail = saveData(detailFilename, newTour);

    // Also add to the main tours array and save
    tours.push(newTour);
    const savedMain = saveData('tours.json', { tours });

    if (!savedDetail || !savedMain) {
      throw new Error('Failed to save tour data to file');
    }

    // Reload tour details to refresh in-memory data
    reloadTourDetails();

    console.log('Tour created successfully with relationships');
    res.status(201).json(newTour);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Helper: Save tour detail to file
const saveTourDetailFile = (tour) => {
  const filename = path.join('tour-details', `${tour.slug}.json`);
  return saveData(filename, tour);
};

// Helper: Delete tour detail file
const deleteTourDetailFile = (slug) => {
  if (!slug) return;
  try {
    const filePath = path.join(__dirname, 'data', 'tour-details', `${slug}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted tour file: ${slug}.json`);
    }
  } catch (error) {
    console.error(`Error deleting tour file ${slug}:`, error);
  }
};

// Admin: Update tour with relationship management
app.put('/api/admin/tours/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tourData = req.body;

    console.log(`Updating tour ${id}...`);

    // 1. Find existing tour (prefer detailed version)
    const tourIndex = tours.findIndex(t => t.id === parseInt(id));
    const tourDetailIndex = tourDetails.findIndex(t => t.id === parseInt(id));

    if (tourIndex === -1 && tourDetailIndex === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    const existingTour = tourDetailIndex !== -1 ? tourDetails[tourDetailIndex] : tours[tourIndex];
    const oldSlug = existingTour.slug;

    // 2. Prepare updated tour object
    const updatedTour = {
      ...existingTour,
      ...tourData,
      slug: tourData.slug || oldSlug,
      updated_at: new Date().toISOString()
    };

    // 3. Update relationships
    updateDestinationRelationships(
      parseInt(id),
      updatedTour.primary_destination_id || null,
      updatedTour.secondary_destination_ids || [],
      existingTour.primary_destination_id || existingTour.destination_id || null,
      existingTour.secondary_destination_ids || []
    );

    // 4. Handle file operations
    saveTourDetailFile(updatedTour);

    // Check for rename
    if (oldSlug && updatedTour.slug !== oldSlug) {
      deleteTourDetailFile(oldSlug);
    }

    // 5. Update main tours list and save
    if (tourIndex !== -1) {
      tours[tourIndex] = updatedTour;
    } else {
      // If it was only in tourDetails (e.g., new tour not yet in tours.json), add it
      tours.push(updatedTour);
    }
    saveData('tours.json', { tours });

    // 6. Refresh memory
    reloadTourDetails();

    console.log('Tour updated successfully');
    res.json(updatedTour);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Admin: Delete tour with relationship cleanup
app.delete('/api/admin/tours/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Deleting tour with relationships...');

    const { id } = req.params;

    // Find tour in both arrays
    const tourIndex = tours.findIndex(t => t.id === parseInt(id));
    const tourDetailIndex = tourDetails.findIndex(t => t.id === parseInt(id));

    if (tourIndex === -1 && tourDetailIndex === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    const tour = tourIndex !== -1 ? tours[tourIndex] : tourDetails[tourDetailIndex];
    const primaryDestId = tour.primary_destination_id || tour.destination_id || null;
    const secondaryDestIds = tour.secondary_destination_ids || [];

    // Remove tour from arrays
    if (tourIndex !== -1) {
      tours.splice(tourIndex, 1);
    }
    if (tourDetailIndex !== -1) {
      tourDetails.splice(tourDetailIndex, 1);
    }

    // Clean up destination relationships
    updateDestinationRelationships(
      parseInt(id),
      null, // no new primary destination
      [], // no new secondary destinations
      primaryDestId, // old primary destination to remove
      secondaryDestIds // old secondary destinations to remove
    );

    // Delete the individual tour-detail file
    if (tour.slug) {
      const detailFilePath = path.join(__dirname, 'data', 'tour-details', `${tour.slug}.json`);
      if (fs.existsSync(detailFilePath)) {
        fs.unlinkSync(detailFilePath);
        console.log(`Deleted tour detail file: ${tour.slug}.json`);
      }
    }

    // Save updated tours data
    const saved = saveData('tours.json', { tours });
    if (!saved) {
      throw new Error('Failed to save tour data to file');
    }

    // Reload tour details to refresh in-memory data
    reloadTourDetails();

    console.log('Tour deleted successfully with relationship cleanup');
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Admin: Update tour listing status
app.patch('/api/admin/tours/:id/listing', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { listed } = req.body;

    // Validate input
    if (typeof listed !== 'boolean') {
      return res.status(400).json({ error: 'Listed status must be a boolean value' });
    }

    // Find tour in both arrays
    const tourIndex = tours.findIndex(t => t.id === parseInt(id));
    const tourDetailIndex = tourDetails.findIndex(t => t.id === parseInt(id));

    if (tourIndex === -1 && tourDetailIndex === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Update the listing status in both arrays
    if (tourIndex !== -1) {
      tours[tourIndex].listed = listed;
    }
    if (tourDetailIndex !== -1) {
      tourDetails[tourDetailIndex].listed = listed;
    }

    const updatedTour = tourIndex !== -1 ? tours[tourIndex] : tourDetails[tourDetailIndex];

    // Save to individual tour-detail file
    if (updatedTour.slug) {
      const detailFilename = path.join('tour-details', `${updatedTour.slug}.json`);
      saveData(detailFilename, updatedTour);
    }

    // Save the updated data to main tours.json
    const saved = saveData('tours.json', { tours });
    if (!saved) {
      throw new Error('Failed to save tour data to file');
    }

    // Reload tour details to refresh in-memory data
    reloadTourDetails();

    console.log(`Tour ${id} listing status updated to: ${listed}`);
    res.json(updatedTour);
  } catch (error) {
    console.error('Error updating tour listing status:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get tour by slug (admin endpoint with authentication)
app.get('/api/admin/tours/slug/:slug', authenticateToken, async (req, res) => {

  const { slug } = req.params;
  const tour = tourDetails.find(t => t.slug === slug);

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  res.json(tour);
});

// Get tour by ID (check detailed tours first, then basic tours)
app.get('/api/tours/:id', async (req, res) => {

  const tourId = parseInt(req.params.id);

  // First check detailed tours
  let tour = tourDetails.find(t => t.id === tourId);

  // If not found, check basic tours
  if (!tour) {
    tour = tours.find(t => t.id === tourId);
  }

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Check if tour is listed (public access should only see listed tours)
  if (tour.listed === false) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  res.json(tour);
});

// Get tour by slug (for detailed tours)
app.get('/api/tours/slug/:slug', async (req, res) => {

  const { slug } = req.params;
  const tour = tourDetails.find(t => t.slug === slug);

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Check if tour is listed (public access should only see listed tours)
  if (tour.listed === false) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  res.json(tour);
});

// ==================== DESTINATIONS API ====================

// Get all destinations
app.get('/api/destinations', async (req, res) => {

  const { country } = req.query;
  let filteredDestinations = [...destinations];

  // Calculate dynamic tour counts based on actual relationships
  filteredDestinations = filteredDestinations.map(dest => ({
    ...dest,
    tourCount: (dest.relatedTours || []).length
  }));

  // Filter out unlisted destinations unless explicitly requested
  if (req.query.includeUnlisted !== 'true') {
    filteredDestinations = filteredDestinations.filter(dest => dest.listed !== false);
  }

  // Filter by country
  if (country) {
    filteredDestinations = filteredDestinations.filter(dest =>
      dest.country.toLowerCase() === country.toLowerCase()
    );
  }

  res.json(filteredDestinations);
});

// Get destination by slug
app.get('/api/destinations/:slug', async (req, res) => {

  const slug = req.params.slug;
  const destination = destinations.find(d => d.slug === slug);

  if (!destination) {
    return res.status(404).json({
      success: false,
      message: 'Destination not found'
    });
  }

  res.json(destination);
});

// ==================== ACTIVITIES API ====================

// Get all activities
app.get('/api/activities', async (req, res) => {

  const { type } = req.query;
  let filteredActivities = [...activities];

  // Filter by type
  if (type) {
    filteredActivities = filteredActivities.filter(activity => activity.type === type);
  }

  // Filter out unlisted activities (assuming listed: true or listed !== false)
  filteredActivities = filteredActivities.filter(activity => activity.listed !== false);

  res.json(filteredActivities);
});

// Get activity by ID
app.get('/api/activities/:id', async (req, res) => {

  const activityId = parseInt(req.params.id);
  const activity = activities.find(a => a.id === activityId);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  res.json(activity);
});

// ==================== ADMIN ACTIVITIES API ====================

// Admin: Get all activities
app.get('/api/admin/activities', authenticateToken, async (req, res) => {
  try {
    res.json(activities);
  } catch (error) {
    console.error('Error fetching admin activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create new activity
app.post('/api/admin/activities', authenticateToken, (req, res) => {
  upload.single('mediaFile')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      console.log('Creating new activity...');

      const activityData = JSON.parse(req.body.activityData || '{}');
      const file = req.file;

      const newActivity = {
        id: Math.max(...activities.map(a => a.id), 0) + 1,
        name: activityData.name || '',
        image: '', // Will be set below
        tourCount: 0,
        href: `/activities/${(activityData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        type: activityData.type || 'adventure',
        description: activityData.description || '',
        highlights: activityData.highlights || [],
        difficulty: activityData.difficulty || 'Moderate',
        bestTime: activityData.bestTime || 'Year-round',
        duration: activityData.duration || '1 Day',
        popularDestinations: activityData.popularDestinations || [],
        relatedTours: [],
        relatedDestinations: []
      };

      // Handle file upload
      if (file) {
        let processedFilePath = file.path;

        if (file.mimetype.startsWith('image/')) {
          const compressedFileName = `compressed_${file.filename}`;
          const compressedPath = path.join(path.dirname(file.path), compressedFileName);

          processedFilePath = await compressImage(file.path, compressedPath, 85);

          const relativePath = path.relative(uploadsDir, processedFilePath).replace(/\\/g, '/');
          newActivity.image = `/uploads/${relativePath}`;
        }
      } else if (activityData.image) {
        newActivity.image = activityData.image;
      }

      activities.push(newActivity);
      saveData('activities.json', activities);

      res.status(201).json(newActivity);
    } catch (error) {
      console.error('Error creating activity:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
});

// Admin: Update activity
app.put('/api/admin/activities/:id', authenticateToken, (req, res) => {
  upload.single('mediaFile')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { id } = req.params;
      const activityIndex = activities.findIndex(a => a.id === parseInt(id));

      if (activityIndex === -1) {
        return res.status(404).json({ error: 'Activity not found' });
      }

      const activityData = JSON.parse(req.body.activityData || '{}');
      const file = req.file;
      const existingActivity = activities[activityIndex];

      const updatedActivity = {
        ...existingActivity,
        ...activityData,
        image: existingActivity.image // Preserve unless updated
      };

      // Handle file upload
      if (file) {
        let processedFilePath = file.path;

        // Delete old image if it exists and is local
        if (existingActivity.image && existingActivity.image.startsWith('/uploads/')) {
          const oldPath = path.join(__dirname, existingActivity.image);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        if (file.mimetype.startsWith('image/')) {
          const compressedFileName = `compressed_${file.filename}`;
          const compressedPath = path.join(path.dirname(file.path), compressedFileName);

          processedFilePath = await compressImage(file.path, compressedPath, 85);

          const relativePath = path.relative(uploadsDir, processedFilePath).replace(/\\/g, '/');
          updatedActivity.image = `/uploads/${relativePath}`;
        }
      }

      activities[activityIndex] = updatedActivity;
      saveData('activities.json', activities);

      res.json(updatedActivity);
    } catch (error) {
      console.error('Error updating activity:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
});

// Admin: Delete activity
app.delete('/api/admin/activities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const activityIndex = activities.findIndex(a => a.id === parseInt(id));

    if (activityIndex === -1) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const activity = activities[activityIndex];

    // Delete image if local
    if (activity.image && activity.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, activity.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    activities.splice(activityIndex, 1);
    saveData('activities.json', activities);

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ==================== ADMIN DESTINATIONS API ====================

// Admin: Get all destinations (including inactive ones)
app.get('/api/admin/destinations', authenticateToken, async (req, res) => {
  try {
    res.json(destinations);
  } catch (error) {
    console.error('Error fetching admin destinations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get single destination by identifier (slug or ID)
app.get('/api/admin/destinations/:identifier', authenticateToken, async (req, res) => {
  try {
    const { identifier } = req.params;

    // Try to find by slug first, then by ID
    let destination = destinations.find(d => d.slug === identifier);
    if (!destination) {
      destination = destinations.find(d => d.id === parseInt(identifier));
    }

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json(destination);
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create new destination
app.post('/api/admin/destinations', authenticateToken, async (req, res) => {
  try {
    console.log('Creating new destination...');
    console.log('Request body:', req.body);

    const { slug, title, country, region, image, featured, listed, description } = req.body;

    // Validate required fields
    if (!slug || !title || !country) {
      return res.status(400).json({ error: 'Slug, title, and country are required' });
    }

    // Check if destination with this slug already exists
    const existingDestination = destinations.find(d => d.slug === slug);
    if (existingDestination) {
      return res.status(400).json({ error: 'A destination with this slug already exists' });
    }

    const newDestination = {
      id: Math.max(...destinations.map(d => d.id), 0) + 1,
      name: title,
      slug: slug,
      title: title,
      country: country,
      region: region || '',
      image: image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop',
      featured: featured || false,
      listed: listed !== false, // Default to true unless explicitly set to false
      tourCount: 0,
      href: `/destinations/${slug}`,
      type: country.toLowerCase() === 'nepal' ? 'nepal' : 'international',
      description: description || `Discover the beauty and culture of ${title} in ${country}.`,
      highlights: [],
      bestTime: 'Year-round',
      altitude: 'Varies',
      difficulty: 'Easy to Moderate',
      relatedTours: [],
      relatedActivities: []
    };

    destinations.push(newDestination);
    const saved = saveData('destinations.json', destinations);

    if (!saved) {
      throw new Error('Failed to save destination data to file');
    }

    console.log('Destination created successfully');
    res.status(201).json(newDestination);
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Admin: Update destination (supports both slug and ID)
app.put('/api/admin/destinations/:identifier', authenticateToken, async (req, res) => {
  try {
    console.log('Updating destination with identifier:', req.params.identifier);
    console.log('Request body:', req.body);

    const { identifier } = req.params;
    const { title, country, region, image, featured, listed, description } = req.body;

    // Try to find by slug first, then by ID
    let destinationIndex = destinations.findIndex(d => d.slug === identifier);
    if (destinationIndex === -1) {
      destinationIndex = destinations.findIndex(d => d.id === parseInt(identifier));
    }

    if (destinationIndex === -1) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    const existingDestination = destinations[destinationIndex];

    // Update the destination with explicit image URL update
    const updatedDestination = {
      ...existingDestination,
      name: title || existingDestination.name,
      title: title || existingDestination.title,
      country: country || existingDestination.country,
      region: region !== undefined ? region : existingDestination.region,
      image: image || existingDestination.image, // This should be the new uploaded image URL
      featured: featured !== undefined ? featured : existingDestination.featured,
      listed: listed !== undefined ? listed : existingDestination.listed,
      type: country ? (country.toLowerCase() === 'nepal' ? 'nepal' : 'international') : existingDestination.type,
      description: description || (title ? `Discover the beauty and culture of ${title} in ${country || existingDestination.country}.` : existingDestination.description)
    };

    destinations[destinationIndex] = updatedDestination;

    const saved = saveData('destinations.json', destinations);
    if (!saved) {
      throw new Error('Failed to save destination data to file');
    }

    console.log('Destination updated successfully with new image:', updatedDestination.image);
    res.json(updatedDestination);
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Admin: Delete destination (supports both slug and ID)
app.delete('/api/admin/destinations/:identifier', authenticateToken, async (req, res) => {
  try {
    const { identifier } = req.params;

    // Validate identifier
    if (!identifier || identifier.trim() === '' || identifier === 'undefined' || identifier === 'null') {
      console.error('Invalid destination identifier received:', identifier);
      return res.status(400).json({ error: 'Invalid destination identifier provided' });
    }

    // Log the deletion attempt for debugging
    console.log('Attempting to delete destination with identifier:', identifier);
    console.log('Available destinations:', destinations.map(d => ({ id: d.id, slug: d.slug, name: d.name })));

    // Try to find by slug first, then by ID
    let destinationIndex = destinations.findIndex(d => d.slug === identifier);
    if (destinationIndex === -1) {
      // Only try to parse as integer if it looks like a number
      const numericId = parseInt(identifier);
      if (!isNaN(numericId)) {
        destinationIndex = destinations.findIndex(d => d.id === numericId);
      }
    }

    if (destinationIndex === -1) {
      console.error('Destination not found:', {
        identifier,
        availableDestinations: destinations.map(d => ({ id: d.id, slug: d.slug, name: d.name }))
      });
      return res.status(404).json({
        error: 'Destination not found',
        message: `No destination found with identifier "${identifier}". Please check if the destination exists.`
      });
    }

    const destinationToDelete = destinations[destinationIndex];
    console.log('Found destination to delete:', destinationToDelete);

    destinations.splice(destinationIndex, 1);
    const saved = saveData('destinations.json', destinations);

    if (!saved) {
      throw new Error('Failed to save destination data to file');
    }

    console.log('Successfully deleted destination:', destinationToDelete.name || destinationToDelete.title);
    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== LEADS API (Conversion Tracking) ====================

// Public: Submit a new lead from any conversion tool
app.post('/api/leads', async (req, res) => {
  try {
    const { type, name, email, meta } = req.body;

    const VALID_TYPES = ['exit_popup', 'trip_planner', 'pdf_download', 'price_alert'];

    if (!type || !VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid lead type. Must be one of: ${VALID_TYPES.join(', ')}` });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    const newLead = {
      id: leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1,
      type,
      name: name || null,
      email,
      meta: meta || {},
      status: 'new',
      created_at: new Date().toISOString()
    };

    leads.push(newLead);
    saveData('leads.json', { leads });

    console.log(`New lead captured [${type}]:`, email);
    res.status(201).json({ success: true, id: newLead.id });
  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all leads with optional type filter
app.get('/api/admin/leads', authenticateToken, async (req, res) => {
  try {
    const { type, status } = req.query;
    let filtered = [...leads];
    if (type) filtered = filtered.filter(l => l.type === type);
    if (status) filtered = filtered.filter(l => l.status === status);
    // Newest first
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update lead status
app.put('/api/admin/leads/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Lead not found' });
    leads[idx] = { ...leads[idx], status: status || leads[idx].status, updated_at: new Date().toISOString() };
    saveData('leads.json', { leads });
    res.json(leads[idx]);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete a lead
app.delete('/api/admin/leads/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Lead not found' });
    leads.splice(idx, 1);
    saveData('leads.json', { leads });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ENQUIRIES API (Public) ====================

// Public: Submit new enquiry
app.post('/api/contact/enquiry', async (req, res) => {
  try {
    console.log('New enquiry received:', req.body);
    const { name, email, phone, subject, message, tour_title, destination, travelers, date } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Ensure enquiries object exists properly
    if (!enquiries.enquiries) {
      enquiries = { enquiries: [] };
    }

    const newEnquiry = {
      id: Math.max(...(enquiries.enquiries.map(e => e.id) || [0]), 0) + 1,
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Enquiry',
      message,
      tour_id: null,
      tour_name: tour_title || null,
      destination: destination || null,
      number_of_people: travelers || null,
      travel_date: date || null,
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: null,
      notes: ''
    };

    enquiries.enquiries.push(newEnquiry);

    // Save to disk
    const saved = saveData('enquiries.json', enquiries);
    if (!saved) {
      console.error('Failed to save enquiry to disk');
      // Continue anyway as it's in memory, but this is bad
    }

    console.log('Enquiry created successfully:', newEnquiry.id);
    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      enquiry: { id: newEnquiry.id }
    });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ==================== ADMIN ENQUIRIES API ====================

// Admin: Get all enquiries
app.get('/api/admin/enquiries', authenticateToken, async (req, res) => {
  try {
    res.json(enquiries.enquiries || []);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get single enquiry by ID
app.get('/api/admin/enquiries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = enquiries.enquiries.find(e => e.id === parseInt(id));

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json(enquiry);
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update enquiry (for notes, assignment, etc.)
app.put('/api/admin/enquiries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, notes, responded_at } = req.body;

    const enquiryIndex = enquiries.enquiries.findIndex(e => e.id === parseInt(id));
    if (enquiryIndex === -1) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    const updatedEnquiry = {
      ...enquiries.enquiries[enquiryIndex],
      assigned_to: assigned_to !== undefined ? assigned_to : enquiries.enquiries[enquiryIndex].assigned_to,
      notes: notes !== undefined ? notes : enquiries.enquiries[enquiryIndex].notes,
      responded_at: responded_at !== undefined ? responded_at : enquiries.enquiries[enquiryIndex].responded_at,
      updated_at: new Date().toISOString()
    };

    enquiries.enquiries[enquiryIndex] = updatedEnquiry;

    const saved = saveData('enquiries.json', enquiries);
    if (!saved) {
      throw new Error('Failed to save enquiry data to file');
    }

    res.json(updatedEnquiry);
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete enquiry
app.delete('/api/admin/enquiries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const enquiryIndex = enquiries.enquiries.findIndex(e => e.id === parseInt(id));
    if (enquiryIndex === -1) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    enquiries.enquiries.splice(enquiryIndex, 1);
    const saved = saveData('enquiries.json', enquiries);

    if (!saved) {
      throw new Error('Failed to save enquiry data to file');
    }

    res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== FILE UPLOAD API ====================

// Admin: Upload file endpoint
app.post('/api/admin/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? 'Bearer [REDACTED]' : 'None'
      }
    });

    if (!req.file) {
      console.error('No file uploaded in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const destinationSlug = req.body.destinationSlug || 'destination';
    const file = req.file;

    console.log(`Uploading file for destination: ${destinationSlug}`, {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      tempPath: file.path
    });

    // Create destination-specific directory with clean slug
    const cleanSlug = destinationSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const destinationDir = path.join(uploadsDir, 'destinations', cleanSlug);

    console.log(`Creating directory: ${destinationDir}`);
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
      console.log(`Created directory: ${destinationDir}`);
    }

    // Delete any existing files for this destination to keep directory clean
    try {
      const existingFiles = fs.readdirSync(destinationDir);
      existingFiles.forEach(existingFile => {
        if (existingFile.startsWith(cleanSlug)) {
          const oldFilePath = path.join(destinationDir, existingFile);
          fs.unlinkSync(oldFilePath);
          console.log(`Deleted old file: ${oldFilePath}`);
        }
      });
    } catch (error) {
      console.log('No existing files to delete or error cleaning up:', error.message);
    }

    // Generate simple filename with destination name and timestamp to avoid caching issues
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const filename = `${cleanSlug}_${timestamp}${fileExtension}`;
    const finalPath = path.join(destinationDir, filename);

    console.log(`Moving file from ${file.path} to ${finalPath}`);

    // Move file to final location
    try {
      fs.renameSync(file.path, finalPath);
      console.log(`File moved successfully to: ${finalPath}`);
    } catch (moveError) {
      console.error('Error moving file:', moveError);
      throw new Error(`Failed to move uploaded file: ${moveError.message}`);
    }

    // Return the URL path
    const relativePath = path.relative(uploadsDir, finalPath).replace(/\\/g, '/');
    const fileUrl = `/uploads/${relativePath}`;

    console.log(`File uploaded successfully: ${fileUrl}`);

    res.json({
      success: true,
      url: fileUrl,
      filename: filename,
      destination: cleanSlug
    });
  } catch (error) {
    console.error('Error uploading file:', error);

    // Clean up temp file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up temp file:', req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== DESTINATIONS UPLOAD API ====================

// Destination-specific upload endpoint
app.post('/api/admin/uploads/destinations', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const destinationSlug = req.body.destinationSlug || 'destination';
    const file = req.file;

    console.log(`Uploading file for destination: ${destinationSlug}`);

    // Create destination-specific directory with clean slug
    const cleanSlug = destinationSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const destinationDir = path.join(uploadsDir, 'destinations', cleanSlug);
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
      console.log(`Created directory: ${destinationDir}`);
    }

    // Delete any existing files for this destination to keep directory clean
    try {
      const existingFiles = fs.readdirSync(destinationDir);
      existingFiles.forEach(existingFile => {
        if (existingFile.startsWith(cleanSlug)) {
          const oldFilePath = path.join(destinationDir, existingFile);
          fs.unlinkSync(oldFilePath);
          console.log(`Deleted old file: ${oldFilePath}`);
        }
      });
    } catch (error) {
      console.log('No existing files to delete or error cleaning up:', error.message);
    }

    // Generate simple filename with destination name and timestamp to avoid caching issues
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const filename = `${cleanSlug}_${timestamp}${fileExtension}`;
    const finalPath = path.join(destinationDir, filename);

    // Move file to final location
    fs.renameSync(file.path, finalPath);

    // Return the URL path
    const relativePath = path.relative(uploadsDir, finalPath).replace(/\\/g, '/');
    const fileUrl = `/uploads/${relativePath}`;

    console.log(`File uploaded successfully: ${fileUrl}`);

    res.json({
      success: true,
      url: fileUrl,
      path: fileUrl,
      filename: filename,
      destination: cleanSlug
    });
  } catch (error) {
    console.error('Error uploading destination file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Tour-specific upload endpoint
app.post('/api/admin/uploads/tours', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const tourSlug = req.body.tourSlug || 'general';
    const file = req.file;

    console.log(`Uploading file for tour: ${tourSlug}`, {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Create tour-specific directory with clean slug
    const cleanSlug = tourSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const tourDir = path.join(uploadsDir, 'tours', cleanSlug);

    if (!fs.existsSync(tourDir)) {
      fs.mkdirSync(tourDir, { recursive: true });
      console.log(`Created directory: ${tourDir}`);
    }

    // Generate simple filename with timestamp to avoid caching/overwriting issues
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const filename = `tour_${timestamp}${fileExtension}`;
    const finalPath = path.join(tourDir, filename);

    // Move file to final location
    fs.renameSync(file.path, finalPath);

    // Return the URL path
    const relativePath = path.relative(uploadsDir, finalPath).replace(/\\/g, '/');
    const fileUrl = `/uploads/${relativePath}`;

    console.log(`File uploaded successfully: ${fileUrl}`);

    res.json({
      success: true,
      url: fileUrl,
      path: fileUrl,
      filename: filename,
      tour: cleanSlug
    });
  } catch (error) {
    console.error('Error uploading tour file:', error);
    // Cleanup allowed here if we had a temp mechanism
    res.status(500).json({ error: 'Internal server error while uploading tour media' });
  }
});

// ==================== CONTACT API ====================

// Get contact information
app.get('/api/contact', async (req, res) => {
  try {
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact information:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update contact information
app.put('/api/admin/contact', authenticateToken, async (req, res) => {
  try {
    console.log('Updating contact information...');
    console.log('Request body:', req.body);

    const updatedContact = req.body;

    // Validate required fields
    if (!updatedContact.company?.name || !updatedContact.contact?.email?.primary) {
      return res.status(400).json({ error: 'Company name and primary email are required' });
    }

    // Update the contact data
    contact = updatedContact;

    // Save to file
    const saved = saveData('contact.json', contact);
    if (!saved) {
      throw new Error('Failed to save contact data to file');
    }

    console.log('Contact information updated successfully');
    res.json(contact);
  } catch (error) {
    console.error('Error updating contact information:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ==================== TESTIMONIALS API ====================

const serializePublicTestimonial = (testimonial) => ({
  id: testimonial.id,
  name: testimonial.name,
  country: testimonial.country,
  tour: testimonial.tour,
  rating: testimonial.rating,
  title: testimonial.title,
  message: testimonial.message,
  image: testimonial.image,
  date: testimonial.date,
  is_featured: testimonial.is_featured,
  is_approved: testimonial.is_approved,
  created_at: testimonial.created_at,
  updated_at: testimonial.updated_at
});

// Get all approved testimonials (public endpoint)
app.get('/api/testimonials', async (req, res) => {
  try {
    const { featured, limit } = req.query;

    let filteredTestimonials = testimonials.filter(testimonial => testimonial.is_approved);

    // Filter by featured if requested
    if (featured === 'true') {
      filteredTestimonials = filteredTestimonials.filter(testimonial => testimonial.is_featured);
    }

    // Sort by date (newest first)
    filteredTestimonials.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Limit results if specified
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        filteredTestimonials = filteredTestimonials.slice(0, limitNum);
      }
    }

    res.json(filteredTestimonials.map(serializePublicTestimonial));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get testimonial by ID (public endpoint)
app.get('/api/testimonials/:id', async (req, res) => {
  try {
    const testimonialId = parseInt(req.params.id);
    const testimonial = testimonials.find(t => t.id === testimonialId && t.is_approved);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json(serializePublicTestimonial(testimonial));
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit new testimonial (public endpoint)
app.post('/api/testimonials', async (req, res) => {
  try {
    console.log('Submitting new testimonial...');
    console.log('Request body:', req.body);

    const { name, email, country, tour, rating, title, message } = req.body;

    // Validate required fields
    if (!name || !email || !tour || !rating || !title || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const newTestimonial = {
      id: Math.max(...testimonials.map(t => t.id), 0) + 1,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      country: country?.trim() || '',
      tour: tour.trim(),
      rating: parseInt(rating),
      title: title.trim(),
      message: message.trim(),
      image: '', // Will be set by admin if needed
      date: new Date().toISOString().split('T')[0],
      is_featured: false,
      is_approved: false, // Requires admin approval
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    testimonials.push(newTestimonial);
    const saved = saveData('testimonials.json', testimonials);

    if (!saved) {
      throw new Error('Failed to save testimonial data to file');
    }

    console.log('Testimonial submitted successfully');
    res.status(201).json({
      success: true,
      message: 'Testimonial submitted successfully. It will be reviewed before being published.',
      testimonial: newTestimonial
    });
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ==================== ADMIN TESTIMONIALS API ====================

// Admin: Get all testimonials (including unapproved ones)
app.get('/api/admin/testimonials', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;

    let filteredTestimonials = [...testimonials];

    // Filter by approval status if requested
    if (status === 'approved') {
      filteredTestimonials = filteredTestimonials.filter(t => t.is_approved);
    } else if (status === 'pending') {
      filteredTestimonials = filteredTestimonials.filter(t => !t.is_approved);
    }

    // Sort by date (newest first)
    filteredTestimonials.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(filteredTestimonials);
  } catch (error) {
    console.error('Error fetching admin testimonials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update testimonial
app.put('/api/admin/testimonials/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Updating testimonial with ID:', req.params.id);
    console.log('Request body:', req.body);

    const { id } = req.params;
    const updateData = req.body;
    const testimonialIndex = testimonials.findIndex(t => t.id === parseInt(id));

    if (testimonialIndex === -1) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    const existingTestimonial = testimonials[testimonialIndex];

    // Update testimonial data
    testimonials[testimonialIndex] = {
      ...existingTestimonial,
      ...updateData,
      updated_at: new Date().toISOString()
    };

    const saved = saveData('testimonials.json', testimonials);
    if (!saved) {
      throw new Error('Failed to save testimonial data to file');
    }

    console.log('Testimonial updated successfully');
    res.json(testimonials[testimonialIndex]);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Admin: Delete testimonial
app.delete('/api/admin/testimonials/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const testimonialIndex = testimonials.findIndex(t => t.id === parseInt(id));

    if (testimonialIndex === -1) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    testimonials.splice(testimonialIndex, 1);
    const saved = saveData('testimonials.json', testimonials);

    if (!saved) {
      throw new Error('Failed to save testimonial data to file');
    }

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Approve testimonial
app.patch('/api/admin/testimonials/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const testimonialIndex = testimonials.findIndex(t => t.id === parseInt(id));

    if (testimonialIndex === -1) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    testimonials[testimonialIndex].is_approved = true;
    testimonials[testimonialIndex].updated_at = new Date().toISOString();

    const saved = saveData('testimonials.json', testimonials);
    if (!saved) {
      throw new Error('Failed to save testimonial data to file');
    }

    res.json({
      success: true,
      message: 'Testimonial approved successfully',
      testimonial: testimonials[testimonialIndex]
    });
  } catch (error) {
    console.error('Error approving testimonial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Toggle featured status
app.patch('/api/admin/testimonials/:id/featured', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const testimonialIndex = testimonials.findIndex(t => t.id === parseInt(id));

    if (testimonialIndex === -1) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    testimonials[testimonialIndex].is_featured = !testimonials[testimonialIndex].is_featured;
    testimonials[testimonialIndex].updated_at = new Date().toISOString();

    const saved = saveData('testimonials.json', testimonials);
    if (!saved) {
      throw new Error('Failed to save testimonial data to file');
    }

    res.json({
      success: true,
      message: `Testimonial ${testimonials[testimonialIndex].is_featured ? 'featured' : 'unfeatured'} successfully`,
      testimonial: testimonials[testimonialIndex]
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== LOGOS API ====================

// Get logos (public endpoint)
app.get('/api/logos', async (req, res) => {
  try {
    res.json(logos);
  } catch (error) {
    console.error('Error fetching logos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ADMIN LOGOS API ====================

// Admin: Get all logos
app.get('/api/admin/logos', authenticateToken, async (req, res) => {
  try {
    res.json(logos);
  } catch (error) {
    console.error('Error fetching admin logos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Upload logo with file upload
app.post('/api/admin/logos/upload', authenticateToken, (req, res) => {
  upload.single('logo')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      console.log('Uploading logo...');
      console.log('Request body:', req.body);
      console.log('Uploaded file:', req.file);

      const { type } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No logo file uploaded' });
      }

      if (!type) {
        return res.status(400).json({ error: 'Logo type is required' });
      }

      if (!['header', 'footer'].includes(type)) {
        return res.status(400).json({ error: 'Invalid logo type' });
      }

      // Create logos directory
      const logosDir = path.join(uploadsDir, 'logos');
      if (!fs.existsSync(logosDir)) {
        fs.mkdirSync(logosDir, { recursive: true });
      }

      // Delete old logo file if it exists and is a local upload
      const oldLogoPath = logos[type];
      if (oldLogoPath && oldLogoPath.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, oldLogoPath);
        if (fs.existsSync(oldFilePath)) {
          console.log('Deleting old logo:', oldFilePath);
          fs.unlinkSync(oldFilePath);
        }
      }

      // Generate filename
      const timestamp = Date.now();
      const fileExtension = path.extname(file.originalname);
      const filename = `${type}_${timestamp}${fileExtension}`;
      const finalPath = path.join(logosDir, filename);

      // Compress and save image
      console.log('Compressing logo image...');
      const processedFilePath = await compressImage(file.path, finalPath, 90);

      const relativePath = path.relative(uploadsDir, processedFilePath).replace(/\\/g, '/');
      const fileUrl = `/uploads/${relativePath}`;

      // Update logos object
      logos[type] = fileUrl;
      logos.lastUpdated = new Date().toISOString();

      // Save to file
      const saved = saveData('logos.json', logos);
      if (!saved) {
        throw new Error('Failed to save logo data to file');
      }

      console.log(`Logo uploaded successfully: ${type} -> ${fileUrl}`);
      res.json({
        success: true,
        message: `${type} logo uploaded successfully`,
        logo: {
          type,
          url: fileUrl
        },
        logos: logos
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
});

// Admin: Update logo URLs (for external URLs)
app.put('/api/admin/logos', authenticateToken, async (req, res) => {
  try {
    console.log('Updating logo URLs...');
    console.log('Request body:', req.body);

    const { header, footer } = req.body;

    if (header) {
      logos.header = header;
    }

    if (footer) {
      logos.footer = footer;
    }

    logos.lastUpdated = new Date().toISOString();

    const saved = saveData('logos.json', logos);
    if (!saved) {
      throw new Error('Failed to save logo data to file');
    }

    console.log('Logo URLs updated successfully');
    res.json({
      success: true,
      message: 'Logo URLs updated successfully',
      logos: logos
    });
  } catch (error) {
    console.error('Error updating logo URLs:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Admin: Reset logo to default
app.delete('/api/admin/logos/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;

    if (!['header', 'footer'].includes(type)) {
      return res.status(400).json({ error: 'Invalid logo type' });
    }

    // Delete uploaded file if it exists
    const logoPath = logos[type];
    if (logoPath && logoPath.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, logoPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted logo file:', filePath);
      }
    }

    // Reset to default
    const defaults = {
      header: '/src/assets/zeo-logo.png',
      footer: '/src/assets/zeo-logo-white.png'
    };

    logos[type] = defaults[type];
    logos.lastUpdated = new Date().toISOString();

    const saved = saveData('logos.json', logos);
    if (!saved) {
      throw new Error('Failed to save logo data to file');
    }

    res.json({
      success: true,
      message: `${type} logo reset to default`,
      logos: logos
    });
  } catch (error) {
    console.error('Error resetting logo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== KAILASH GALLERY ENDPOINTS ====================

// GET /api/kailash-gallery - Public endpoint for gallery
app.get('/api/kailash-gallery', async (req, res) => {
  try {
    // Filter only active photos and sort by order
    const activePhotos = kailashGallery.gallery
      .filter(photo => photo.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({
      success: true,
      gallery: activePhotos,
      metadata: kailashGallery.metadata
    });
  } catch (error) {
    console.error('Error fetching Kailash Gallery:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/kailash-gallery - Admin endpoint for gallery management
app.get('/api/admin/kailash-gallery', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Sort by order, then by uploadedAt (newest first)
    const sortedPhotos = [...kailashGallery.gallery].sort((a, b) => {
      if (a.order !== b.order) {
        return (a.order || 999) - (b.order || 999);
      }
      return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
    });

    const paginatedPhotos = sortedPhotos.slice(startIndex, endIndex);

    res.json({
      success: true,
      gallery: paginatedPhotos,
      metadata: {
        ...kailashGallery.metadata,
        totalPhotos: kailashGallery.gallery.length,
        currentPage: page,
        totalPages: Math.ceil(kailashGallery.gallery.length / limit),
        hasNextPage: endIndex < kailashGallery.gallery.length,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching admin Kailash Gallery:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/kailash-gallery - Upload new photo
app.post('/api/admin/kailash-gallery', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { title, alt, gridSpan, order, isActive } = req.body;

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = path.parse(req.file.originalname).name;
    const extension = path.extname(req.file.originalname);
    const filename = `kailash-${timestamp}-${originalName}${extension}`;

    const inputPath = req.file.path;
    const outputPath = path.join(kailashGalleryDir, filename);

    // Compress and save image
    const processedPath = await compressImage(inputPath, outputPath, 85);
    const finalFilename = path.basename(processedPath);

    // Remove temporary file
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    // Create new photo object
    const newPhoto = {
      id: timestamp.toString(),
      title: title || 'Kailash Gallery Photo',
      image: `/uploads/kailash-gallery/${finalFilename}`,
      alt: alt || title || 'Kailash Gallery Photo',
      gridSpan: parseInt(gridSpan) || 1,
      order: parseInt(order) || kailashGallery.gallery.length,
      isActive: isActive !== 'false',
      uploadedAt: new Date().toISOString()
    };

    // Add to gallery
    kailashGallery.gallery.push(newPhoto);
    kailashGallery.metadata.totalPhotos = kailashGallery.gallery.length;
    kailashGallery.metadata.lastUpdated = new Date().toISOString();

    // Save to file
    saveData('kailash-gallery.json', kailashGallery);

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: newPhoto,
      metadata: kailashGallery.metadata
    });

  } catch (error) {
    console.error('Error uploading Kailash Gallery photo:', error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// DELETE /api/admin/kailash-gallery/:id - Delete photo
app.delete('/api/admin/kailash-gallery/:id', authenticateToken, async (req, res) => {
  try {
    const photoId = req.params.id;
    const photoIndex = kailashGallery.gallery.findIndex(photo => photo.id === photoId);

    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const photo = kailashGallery.gallery[photoIndex];

    // Delete physical file
    if (photo.image) {
      const imagePath = path.join(__dirname, photo.image.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove from gallery
    kailashGallery.gallery.splice(photoIndex, 1);
    kailashGallery.metadata.totalPhotos = kailashGallery.gallery.length;
    kailashGallery.metadata.lastUpdated = new Date().toISOString();

    // Save to file
    saveData('kailash-gallery.json', kailashGallery);

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      metadata: kailashGallery.metadata
    });

  } catch (error) {
    console.error('Error deleting Kailash Gallery photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// DELETE /api/admin/tours/:tourId/gallery/:filename - Delete individual gallery image
app.delete('/api/admin/tours/:tourId/gallery/:filename', authenticateToken, async (req, res) => {
  try {
    const { tourId, filename } = req.params;
    console.log(`Deleting gallery image: ${filename} from tour: ${tourId}`);

    // Find the tour
    const tourIndex = tourDetails.findIndex(t => t.id === parseInt(tourId));
    if (tourIndex === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    const tour = tourDetails[tourIndex];

    // Remove the image from the gallery array
    if (tour.gallery && Array.isArray(tour.gallery)) {
      const imageUrl = `/uploads/tours/${filename}`;
      const updatedGallery = tour.gallery.filter(img => !img.includes(filename));

      // Update the tour data
      tourDetails[tourIndex] = {
        ...tour,
        gallery: updatedGallery,
        updated_at: new Date().toISOString()
      };

      // Persist the updated tour detail to its specific file
      const detailFilename = path.join('tour-details', `${tour.slug}.json`);
      const saved = saveData(detailFilename, tourDetails[tourIndex]);
      if (!saved) {
        throw new Error('Failed to save tour detail');
      }
    }

    // Delete the physical file
    const filePath = path.join(__dirname, 'uploads', 'tours', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }

    res.json({
      message: 'Gallery image deleted successfully',
      filename: filename,
      tourId: tourId
    });

  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

// Vercel Blob proxy — serves private Blob videos through the API using the RW token
app.get('/api/blob', async (req, res) => {
  try {
    const pathname = req.query.pathname;
    if (!pathname) {
      return res.status(400).json({ error: 'Missing pathname query param' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured' });
    }

    const { list } = require('@vercel/blob');

    // Fetch the blob content using the token
    const blobResponse = await fetch(pathname, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!blobResponse.ok) {
      return res.status(blobResponse.status).json({ error: 'Blob fetch failed' });
    }

    // Stream the blob content back to the client
    const contentType = blobResponse.headers.get('content-type') || 'application/octet-stream';
    const contentLength = blobResponse.headers.get('content-length');

    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    });

    if (contentLength) {
      res.set('Content-Length', contentLength);
    }

    // Handle range requests for video seeking
    const range = req.headers.range;
    if (range) {
      const blobArrayBuffer = await blobResponse.arrayBuffer();
      const total = blobArrayBuffer.byteLength;
      const parts = range.replace(/bytes=/, '').split('-');
      const partialStart = parseInt(parts[0], 10);
      const partialEnd = parts[1] ? parseInt(parts[1], 10) : total - 1;
      const chunkSize = (partialEnd - partialStart) + 1;

      res.status(206);
      res.set({
        'Content-Range': `bytes ${partialStart}-${partialEnd}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
      });

      const chunk = Buffer.from(blobArrayBuffer).slice(partialStart, partialEnd + 1);
      return res.send(chunk);
    }

    const blobArrayBuffer = await blobResponse.arrayBuffer();
    res.send(Buffer.from(blobArrayBuffer));
  } catch (error) {
    console.error('Blob proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch blob' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    database: 'JSON Files'
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ==================== NEWSLETTER API ====================

// Subscribe to newsletter (public)
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const filePath = path.join(__dirname, 'data', 'newsletter.json');
    let subscribers = [];
    if (fs.existsSync(filePath)) {
      try { subscribers = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { subscribers = []; }
    }

    const normalised = email.toLowerCase().trim();
    if (subscribers.find(s => s.email === normalised)) {
      return res.status(200).json({ success: true, message: 'You are already subscribed!' });
    }

    subscribers.push({ email: normalised, subscribedAt: new Date().toISOString() });
    fs.writeFileSync(filePath, JSON.stringify(subscribers, null, 2));

    res.status(201).json({ success: true, message: 'Thank you for subscribing!' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List subscribers (admin only)
app.get('/api/admin/newsletter', authenticateToken, (req, res) => {
  try {
    const filePath = path.join(__dirname, 'data', 'newsletter.json');
    const subscribers = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : [];
    res.json({ subscribers, count: subscribers.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server (only for local dev — Vercel uses exported app as serverless handler)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Zeo Tourism API Server started`);
    console.log(`📊 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️ Database: JSON Files`);
    console.log(`🔐 Admin Login: POST /api/auth/login`);
    console.log(`📊 Tours: http://localhost:${PORT}/api/tours`);
    console.log(`🏔️ Destinations: http://localhost:${PORT}/api/destinations`);
    console.log(`🎯 Activities: http://localhost:${PORT}/api/activities`);
    console.log(`🖼️ Sliders: http://localhost:${PORT}/api/sliders`);
    console.log(`💬 Testimonials: http://localhost:${PORT}/api/testimonials`);
  });

}

module.exports = app;
