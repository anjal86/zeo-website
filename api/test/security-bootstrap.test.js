'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

const apiDirectory = path.resolve(__dirname, '..');
const validEnvironment = {
  NODE_ENV: 'production',
  JWT_SECRET: 'a'.repeat(64),
  JWT_ISSUER: 'zeotourism-api',
  JWT_AUDIENCE: 'zeotourism-admin',
  JWT_EXPIRES_IN: '60m',
  ADMIN_EMAIL: 'private-admin@example.com',
  ADMIN_PASSWORD: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxQlpbmY2WdnQjO6u1ShC4L2Q3e',
  PUBLIC_SITE_URL: 'https://zeotourism.com',
};

function runBootstrap(overrides = {}, expression = '') {
  return spawnSync(process.execPath, ['-r', './security-bootstrap.js', '-e', expression], {
    cwd: apiDirectory,
    encoding: 'utf8',
    env: { ...process.env, ...validEnvironment, ...overrides },
  });
}

test('accepts a complete production security configuration', () => {
  const result = runBootstrap();
  assert.equal(result.status, 0, result.stderr);
});

test('rejects the example bcrypt placeholder', () => {
  const result = runBootstrap({ ADMIN_PASSWORD: '$2b$12$replace-with-a-real-bcrypt-hash' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ADMIN_PASSWORD must be a bcrypt hash/);
});

test('rejects JWT expiry longer than 60 minutes', () => {
  const result = runBootstrap({ JWT_EXPIRES_IN: '24h' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no longer than 60 minutes/);
});

test('forces signed JWTs to expire within 60 minutes', () => {
  const expression = [
    "const jwt = require('jsonwebtoken')",
    "const token = jwt.sign({ sub: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' })",
    "const payload = jwt.verify(token, process.env.JWT_SECRET)",
    "if (payload.exp - payload.iat > 3600) process.exit(2)",
  ].join(';');
  const result = runBootstrap({}, expression);
  assert.equal(result.status, 0, result.stderr);
});

test('preserves the JWT callback verification API used by the server', () => {
  const expression = [
    "const jwt = require('jsonwebtoken')",
    "const token = jwt.sign({ sub: 'admin' }, process.env.JWT_SECRET)",
    'let called = false',
    'jwt.verify(token, process.env.JWT_SECRET, (error, payload) => { called = !error && payload.sub === \'admin\' })',
    'setImmediate(() => { if (!called) process.exit(2) })',
  ].join(';');
  const result = runBootstrap({}, expression);
  assert.equal(result.status, 0, result.stderr);
});

test('direct production server execution cannot bypass the security bootstrap', () => {
  const result = spawnSync(process.execPath, ['server.js'], {
    cwd: apiDirectory,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...validEnvironment,
      VERCEL: '1',
      JWT_SECRET: '',
    },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /JWT_SECRET is required/);
});

test('blob proxy rejects a URL outside the configured storage origin', () => {
  const expression = [
    "const app = require('./server')",
    "const server = app.listen(0, '127.0.0.1', async () => {",
    "const port = server.address().port",
    "const response = await fetch('http://127.0.0.1:' + port + '/api/blob?pathname=https%3A%2F%2Fattacker.example%2Fsteal')",
    "server.close()",
    "process.exit(response.status === 403 ? 0 : 2)",
    "})",
  ].join(';');
  const result = spawnSync(process.execPath, ['-e', expression], {
    cwd: apiDirectory,
    encoding: 'utf8',
    timeout: 10_000,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      VERCEL: '1',
      BLOB_READ_WRITE_TOKEN: 'test-secret-token',
      BLOB_PUBLIC_BASE_URL: 'https://trusted.public.blob.vercel-storage.com',
    },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
