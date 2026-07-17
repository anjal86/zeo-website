'use strict';

const REDACTED = '[REDACTED]';
const SENSITIVE_KEYS = /authorization|cookie|password|secret|token|api[-_]?key|email|phone|message/i;

function sanitize(value, seen = new WeakSet()) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return value.length > 500 ? `${value.slice(0, 500)}…` : value;
  if (typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';
  seen.add(value);

  if (Array.isArray(value)) return value.map((item) => sanitize(item, seen));

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    output[key] = SENSITIVE_KEYS.test(key) ? REDACTED : sanitize(item, seen);
  }
  return output;
}

function write(level, event, details = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    service: process.env.SERVICE_NAME || 'zeotourism-api',
    release: process.env.RELEASE_ID || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'development',
    environment: process.env.NODE_ENV || 'development',
    ...sanitize(details),
  };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

module.exports = {
  info: (event, details) => write('info', event, details),
  warn: (event, details) => write('warn', event, details),
  error: (event, details) => write('error', event, details),
  sanitize,
};
