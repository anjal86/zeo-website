'use strict';

const fs = require('fs');
const path = require('path');

const loadDotEnv = () => {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    if (Object.prototype.hasOwnProperty.call(process.env, key)) continue;
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
};

loadDotEnv();

const isProduction = process.env.NODE_ENV === 'production';
const insecureValues = new Set([
  'admin123',
  'admin@zeotourism.com',
  'zeo-tourism-admin-secret-key-2024',
  'replace-with-a-long-random-secret',
  'replace-with-secure-password-or-bcrypt-hash',
  'replace-with-mysql-password'
]);

const required = ['JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
if (process.env.DB_HOST || process.env.DB_NAME || process.env.DB_USER) {
  required.push('DB_PASSWORD');
}

if (isProduction) {
  const errors = [];
  for (const key of required) {
    const value = String(process.env[key] || '').trim();
    if (!value) errors.push(`${key} is required`);
    if (insecureValues.has(value)) errors.push(`${key} still uses an insecure example/default value`);
  }

  if ((process.env.JWT_SECRET || '').length < 64) {
    errors.push('JWT_SECRET must contain at least 64 characters');
  }
  if (!/^\$2[aby]\$(?:0[4-9]|[12]\d|3[01])\$[./A-Za-z0-9]{53}$/.test(process.env.ADMIN_PASSWORD || '')) {
    errors.push('ADMIN_PASSWORD must be a bcrypt hash, not a plaintext password');
  }
  if (!/^https?:\/\//.test(process.env.PUBLIC_SITE_URL || '')) {
    errors.push('PUBLIC_SITE_URL must be an absolute http(s) URL');
  }

  const jwtExpiry = String(process.env.JWT_EXPIRES_IN || '60m').trim();
  const expiryMatch = jwtExpiry.match(/^(\d+)(s|m|h)$/);
  const expiryMultipliers = { s: 1, m: 60, h: 3600 };
  const expirySeconds = expiryMatch
    ? Number(expiryMatch[1]) * expiryMultipliers[expiryMatch[2]]
    : Number.NaN;
  if (!Number.isFinite(expirySeconds) || expirySeconds <= 0 || expirySeconds > 3600) {
    errors.push('JWT_EXPIRES_IN must be a positive duration no longer than 60 minutes (for example, 60m)');
  }

  if (errors.length) {
    console.error('\nSECURITY CONFIGURATION ERROR\n- ' + errors.join('\n- ') + '\n');
    process.exit(1);
  }
}

// Enforce safer JWT defaults without requiring every call site to repeat them.
const jwt = require('jsonwebtoken');
const originalSign = jwt.sign.bind(jwt);
const originalVerify = jwt.verify.bind(jwt);
const jwtIssuer = process.env.JWT_ISSUER || 'zeotourism-api';
const jwtAudience = process.env.JWT_AUDIENCE || 'zeotourism-admin';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '60m';

jwt.sign = (payload, secretOrPrivateKey, options = {}, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const secureOptions = {
    algorithm: 'HS256',
    issuer: jwtIssuer,
    audience: jwtAudience,
    expiresIn: jwtExpiresIn,
    ...options,
    // Never permit a call site to silently weaken these values.
    algorithm: 'HS256',
    issuer: jwtIssuer,
    audience: jwtAudience,
    expiresIn: jwtExpiresIn
  };
  return originalSign(payload, secretOrPrivateKey, secureOptions, callback);
};

jwt.verify = (token, secretOrPublicKey, options = {}, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const secureOptions = {
    ...options,
    algorithms: ['HS256'],
    issuer: jwtIssuer,
    audience: jwtAudience
  };
  return originalVerify(token, secretOrPublicKey, secureOptions, callback);
};

// Tighten CORS to an exact production allowlist.
const corsPath = require.resolve('cors');
const originalCors = require(corsPath);
const allowedOrigins = new Set(
  (process.env.CORS_ALLOWED_ORIGINS || process.env.PUBLIC_SITE_URL || '')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean)
);
const allowNoOrigin = process.env.CORS_ALLOW_NO_ORIGIN !== 'false';

const secureCors = (options = {}) => originalCors({
  ...options,
  origin(origin, callback) {
    if (!origin) return callback(null, allowNoOrigin);
    const normalized = origin.replace(/\/$/, '');
    return callback(null, allowedOrigins.has(normalized));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Cache-Control', 'X-Requested-With', 'Accept'],
  maxAge: 600
});
Object.assign(secureCors, originalCors);
require.cache[corsPath].exports = secureCors;

// Add global abuse protection and safer Express defaults.
const expressPath = require.resolve('express');
const originalExpress = require(expressPath);
const originalJson = originalExpress.json;
const originalUrlencoded = originalExpress.urlencoded;
const requestBuckets = new Map();

const consume = (key, max, windowMs) => {
  const now = Date.now();
  const current = requestBuckets.get(key);
  if (!current || current.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }
  current.count += 1;
  return { allowed: current.count <= max, remaining: Math.max(0, max - current.count), resetAt: current.resetAt };
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestBuckets) {
    if (value.resetAt <= now) requestBuckets.delete(key);
  }
}, 10 * 60 * 1000).unref();

function secureExpress(...args) {
  const app = originalExpress(...args);
  app.disable('x-powered-by');
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 1));

  app.use((req, res, next) => {
    res.set({
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      'X-Content-Type-Options': 'nosniff',
      'X-Permitted-Cross-Domain-Policies': 'none'
    });

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const pathname = req.path || req.url || '/';
    const isLogin = pathname === '/api/auth/login';
    const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
    const max = isLogin ? 5 : isMutation ? 60 : 300;
    const windowMs = isLogin ? 15 * 60 * 1000 : 60 * 1000;
    const bucket = consume(`${ip}:${isLogin ? 'login' : isMutation ? 'write' : 'read'}`, max, windowMs);

    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(bucket.remaining));
    res.set('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    if (!bucket.allowed) {
      res.set('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000))));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    // Keep public health responses intentionally minimal.
    if (pathname === '/api/health' || pathname === '/api/server') {
      const originalJsonResponse = res.json.bind(res);
      res.json = () => originalJsonResponse({ status: 'ok' });
    }

    req.setTimeout(Number(process.env.REQUEST_TIMEOUT_MS || 30000));
    res.setTimeout(Number(process.env.REQUEST_TIMEOUT_MS || 30000));
    next();
  });

  return app;
}

Object.assign(secureExpress, originalExpress);
secureExpress.json = (options = {}) => originalJson({ ...options, limit: process.env.JSON_BODY_LIMIT || '250kb', strict: true });
secureExpress.urlencoded = (options = {}) => originalUrlencoded({ ...options, limit: process.env.FORM_BODY_LIMIT || '250kb', extended: false });
require.cache[expressPath].exports = secureExpress;

if (isProduction) {
  console.log('Production security bootstrap enabled');
}
