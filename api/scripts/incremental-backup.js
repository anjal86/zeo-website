#!/usr/bin/env node

/**
 * Incremental backup runner for Zeo backend.
 *
 * Backs up only changed upload files and changed MySQL records, compresses the
 * run payload, and uploads it to an S3-compatible bucket such as Cloudflare R2/R3.
 *
 * No runtime npm dependencies are required beyond the backend's existing mysql2.
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

const API_ROOT = path.resolve(__dirname, '..');
const DEFAULT_STATE_FILE = path.join(API_ROOT, 'data', 'backups', 'incremental-state.json');
const DEFAULT_LOG_FILE = path.join(API_ROOT, 'logs', 'incremental-backup.log');
const DEFAULT_WORK_DIR = path.join(os.tmpdir(), 'zeo-incremental-backups');

loadDotEnv(path.join(API_ROOT, '.env'));

function env(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

const config = {
  bucket: env('BACKUP_BUCKET', 'R3_BUCKET', 'S3_BUCKET'),
  endpoint: env('BACKUP_ENDPOINT_URL', 'R3_ENDPOINT', 'S3_ENDPOINT'),
  region: env('BACKUP_REGION', 'R3_REGION', 'S3_REGION', 'AWS_REGION') || 'auto',
  accessKeyId: env('BACKUP_ACCESS_KEY_ID', 'R3_ACCESS_KEY_ID', 'S3_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID'),
  secretAccessKey: env('BACKUP_SECRET_ACCESS_KEY', 'R3_SECRET_ACCESS_KEY', 'S3_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY'),
  prefix: normalizePrefix(env('BACKUP_PREFIX', 'R3_PREFIX', 'S3_PREFIX') || 'zeo/incremental'),
  forcePathStyle: env('BACKUP_S3_FORCE_PATH_STYLE', 'S3_FORCE_PATH_STYLE') !== 'false',
  uploadDirs: parseList(env('BACKUP_UPLOAD_DIRS') || 'uploads'),
  dbTables: parseList(env('BACKUP_DB_TABLES')),
  dbTimestampColumns: parseList(env('BACKUP_DB_TIMESTAMP_COLUMNS') || 'updated_at,created_at,updatedAt,createdAt'),
  stateFile: path.resolve(API_ROOT, env('BACKUP_STATE_FILE') || DEFAULT_STATE_FILE),
  logFile: path.resolve(API_ROOT, env('BACKUP_LOG_FILE') || DEFAULT_LOG_FILE),
  workDir: path.resolve(API_ROOT, env('BACKUP_WORK_DIR') || DEFAULT_WORK_DIR),
  dryRun: env('BACKUP_DRY_RUN') === 'true',
  uploadEmptyRuns: env('BACKUP_UPLOAD_EMPTY_RUNS') === 'true',
  excludeRegex: env('BACKUP_FILE_EXCLUDE_REGEX') ? new RegExp(env('BACKUP_FILE_EXCLUDE_REGEX')) : null,
  maxJsonRowsPerFile: Number(env('BACKUP_DB_JSON_CHUNK_SIZE') || 5000),
};

async function main() {
  await ensureDir(path.dirname(config.logFile));
  await ensureDir(path.dirname(config.stateFile));
  await ensureDir(config.workDir);

  const startedAt = new Date();
  const runId = startedAt.toISOString().replace(/[:.]/g, '-');
  const runDir = path.join(config.workDir, runId);
  const payloadDir = path.join(runDir, 'payload');
  const filesDir = path.join(payloadDir, 'files');
  const dbDir = path.join(payloadDir, 'db');

  await ensureDir(filesDir);
  await ensureDir(dbDir);

  const state = await readJson(config.stateFile, {
    version: 1,
    lastSuccessfulAt: null,
    fileIndex: {},
  });

  const since = state.lastSuccessfulAt ? new Date(state.lastSuccessfulAt) : new Date(0);
  const until = startedAt;

  const summary = {
    runId,
    startedAt: startedAt.toISOString(),
    incrementalFrom: since.toISOString(),
    incrementalTo: until.toISOString(),
    changedFiles: 0,
    deletedFiles: 0,
    changedDbRows: 0,
    dbTablesBackedUp: 0,
    dbTablesSkipped: 0,
    archiveKey: null,
    archiveBytes: 0,
    dryRun: config.dryRun,
  };

  log('info', 'incremental backup started', { runId, since: summary.incrementalFrom, until: summary.incrementalTo });

  validateConfig();

  const fileResult = await backupChangedFiles({ since, state, filesDir });
  summary.changedFiles = fileResult.changedFiles.length;
  summary.deletedFiles = fileResult.deletedFiles.length;

  const dbResult = await backupChangedDatabaseRows({ since, until, dbDir });
  summary.changedDbRows = dbResult.changedRows;
  summary.dbTablesBackedUp = dbResult.tablesBackedUp;
  summary.dbTablesSkipped = dbResult.tablesSkipped;

  const hasPayload = summary.changedFiles > 0 || summary.deletedFiles > 0 || summary.changedDbRows > 0;
  const manifest = {
    ...summary,
    uploadDirs: config.uploadDirs,
    dbTables: config.dbTables.length ? config.dbTables : 'auto',
    files: fileResult.changedFiles,
    deletedFiles: fileResult.deletedFiles,
    database: dbResult.manifest,
  };

  await writeJson(path.join(payloadDir, 'manifest.json'), manifest);

  if (!hasPayload && !config.uploadEmptyRuns) {
    state.lastSuccessfulAt = until.toISOString();
    state.fileIndex = fileResult.fileIndex;
    await writeJson(config.stateFile, state);
    log('info', 'no changed files or database records detected; state advanced without archive upload', summary);
    await safeRm(runDir);
    return;
  }

  const archiveName = `zeo-incremental-${runId}.tar.gz`;
  const archivePath = path.join(runDir, archiveName);
  await createTarGz(payloadDir, archivePath);

  const archiveStat = await fsp.stat(archivePath);
  const datePrefix = startedAt.toISOString().slice(0, 10);
  const objectKey = [config.prefix, datePrefix, archiveName].filter(Boolean).join('/');
  summary.archiveKey = objectKey;
  summary.archiveBytes = archiveStat.size;

  if (config.dryRun) {
    log('info', 'dry run enabled; archive created locally but not uploaded', { archivePath, objectKey, bytes: archiveStat.size });
  } else {
    await putObjectToS3({
      endpoint: config.endpoint,
      region: config.region,
      bucket: config.bucket,
      key: objectKey,
      filePath: archivePath,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      forcePathStyle: config.forcePathStyle,
      contentType: 'application/gzip',
    });
    log('info', 'archive uploaded to S3-compatible storage', { bucket: config.bucket, key: objectKey, bytes: archiveStat.size });
  }

  state.lastSuccessfulAt = until.toISOString();
  state.fileIndex = fileResult.fileIndex;
  state.lastArchiveKey = objectKey;
  state.lastRunId = runId;
  await writeJson(config.stateFile, state);

  log('info', 'incremental backup completed', summary);
  await safeRm(runDir);
}

async function backupChangedFiles({ since, state, filesDir }) {
  const previousIndex = state.fileIndex || {};
  const currentIndex = {};
  const changedFiles = [];
  const deletedFiles = [];

  for (const configuredDir of config.uploadDirs) {
    const absoluteDir = path.resolve(API_ROOT, configuredDir);
    const rootLabel = toPosix(path.relative(API_ROOT, absoluteDir));

    if (!absoluteDir.startsWith(API_ROOT)) {
      log('warn', 'skipping upload dir outside api root', { configuredDir });
      continue;
    }

    if (!fs.existsSync(absoluteDir)) {
      log('warn', 'upload dir does not exist; skipping', { configuredDir });
      continue;
    }

    for await (const filePath of walkFiles(absoluteDir)) {
      const relativePath = toPosix(path.relative(API_ROOT, filePath));
      if (config.excludeRegex && config.excludeRegex.test(relativePath)) continue;

      const stat = await fsp.stat(filePath);
      const current = {
        size: stat.size,
        mtimeMs: Math.trunc(stat.mtimeMs),
      };
      currentIndex[relativePath] = current;

      const previous = previousIndex[relativePath];
      const changedByIndex = !previous || previous.size !== current.size || previous.mtimeMs !== current.mtimeMs;
      const changedByTime = stat.mtime > since;

      if (changedByIndex || changedByTime) {
        const target = path.join(filesDir, rootLabel, path.relative(absoluteDir, filePath));
        await ensureDir(path.dirname(target));
        await fsp.copyFile(filePath, target);
        changedFiles.push({ path: relativePath, size: stat.size, mtime: stat.mtime.toISOString() });
      }
    }
  }

  for (const oldPath of Object.keys(previousIndex)) {
    if (!currentIndex[oldPath]) deletedFiles.push(oldPath);
  }

  await writeJson(path.join(filesDir, 'file-manifest.json'), { changedFiles, deletedFiles });
  log('info', 'file scan completed', { changedFiles: changedFiles.length, deletedFiles: deletedFiles.length });

  return { changedFiles, deletedFiles, fileIndex: currentIndex };
}

async function backupChangedDatabaseRows({ since, until, dbDir }) {
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch (error) {
    log('warn', 'mysql2 is not installed; database backup skipped', { error: error.message });
    return { changedRows: 0, tablesBackedUp: 0, tablesSkipped: 0, manifest: [] };
  }

  const dbName = env('DB_NAME', 'MYSQL_DATABASE') || 'zeo_website';
  const pool = mysql.createPool({
    host: env('DB_HOST', 'MYSQL_HOST') || 'localhost',
    port: Number(env('DB_PORT', 'MYSQL_PORT') || 3306),
    user: env('DB_USER', 'MYSQL_USER') || 'zeo_user',
    password: env('DB_PASSWORD', 'MYSQL_PASSWORD') || '',
    database: dbName,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
  });

  const manifest = [];
  let changedRows = 0;
  let tablesBackedUp = 0;
  let tablesSkipped = 0;

  try {
    const tables = config.dbTables.length ? config.dbTables : await listDatabaseTables(pool, dbName);

    for (const tableName of tables) {
      const timestampColumn = await findTimestampColumn(pool, dbName, tableName);
      if (!timestampColumn) {
        tablesSkipped += 1;
        manifest.push({ table: tableName, skipped: true, reason: 'No configured timestamp column found' });
        continue;
      }

      const rows = await selectChangedRows(pool, tableName, timestampColumn, since, until);
      if (rows.length === 0) {
        manifest.push({ table: tableName, timestampColumn, rows: 0 });
        continue;
      }

      tablesBackedUp += 1;
      changedRows += rows.length;
      await writeRowsInChunks(dbDir, tableName, rows);
      manifest.push({ table: tableName, timestampColumn, rows: rows.length });
    }
  } finally {
    await pool.end();
  }

  await writeJson(path.join(dbDir, 'db-manifest.json'), manifest);
  log('info', 'database scan completed', { changedRows, tablesBackedUp, tablesSkipped });

  return { changedRows, tablesBackedUp, tablesSkipped, manifest };
}

async function listDatabaseTables(pool, dbName) {
  const [rows] = await pool.execute(
    `SELECT TABLE_NAME AS tableName
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
     ORDER BY TABLE_NAME`,
    [dbName]
  );
  return rows.map(row => row.tableName);
}

async function findTimestampColumn(pool, dbName, tableName) {
  const [rows] = await pool.execute(
    `SELECT COLUMN_NAME AS columnName
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [dbName, tableName]
  );
  const available = new Set(rows.map(row => row.columnName));
  return config.dbTimestampColumns.find(column => available.has(column)) || null;
}

async function selectChangedRows(pool, tableName, timestampColumn, since, until) {
  const table = quoteIdentifier(tableName);
  const column = quoteIdentifier(timestampColumn);
  const sql = `SELECT * FROM ${table} WHERE ${column} > ? AND ${column} <= ? ORDER BY ${column} ASC`;
  const [rows] = await pool.execute(sql, [toMysqlDateTime(since), toMysqlDateTime(until)]);
  return rows;
}

async function writeRowsInChunks(dbDir, tableName, rows) {
  const safeName = tableName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const tableDir = path.join(dbDir, safeName);
  await ensureDir(tableDir);

  for (let i = 0; i < rows.length; i += config.maxJsonRowsPerFile) {
    const chunk = rows.slice(i, i + config.maxJsonRowsPerFile);
    const chunkNo = String(Math.floor(i / config.maxJsonRowsPerFile) + 1).padStart(4, '0');
    await writeJson(path.join(tableDir, `${safeName}-${chunkNo}.json`), chunk);
  }
}

async function putObjectToS3({ endpoint, region, bucket, key, filePath, accessKeyId, secretAccessKey, forcePathStyle, contentType }) {
  const endpointUrl = new URL(endpoint);
  const fileStat = await fsp.stat(filePath);
  const payloadHash = await sha256File(filePath);
  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const service = 's3';

  const encodedKey = encodeS3Key(key);
  const pathStylePath = `/${encodeURIComponent(bucket)}/${encodedKey}`;
  const virtualHostPath = `/${encodedKey}`;
  const requestPath = forcePathStyle ? pathStylePath : virtualHostPath;
  const host = forcePathStyle ? endpointUrl.host : `${bucket}.${endpointUrl.host}`;

  const headers = {
    host,
    'content-length': String(fileStat.size),
    'content-type': contentType,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };

  const signedHeaders = Object.keys(headers).sort().join(';');
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(name => `${name}:${headers[name]}\n`)
    .join('');

  const canonicalRequest = [
    'PUT',
    requestPath,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = hmacHex(signingKey, stringToSign);

  headers.authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const requestOptions = {
    protocol: endpointUrl.protocol,
    hostname: forcePathStyle ? endpointUrl.hostname : `${bucket}.${endpointUrl.hostname}`,
    port: endpointUrl.port || undefined,
    method: 'PUT',
    path: requestPath,
    headers,
  };

  await new Promise((resolve, reject) => {
    const client = endpointUrl.protocol === 'http:' ? http : https;
    const req = client.request(requestOptions, res => {
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve();
        reject(new Error(`S3 upload failed with HTTP ${res.statusCode}: ${responseBody.slice(0, 500)}`));
      });
    });

    req.on('error', reject);
    fs.createReadStream(filePath).pipe(req);
  });
}

function validateConfig() {
  const missing = [];
  if (!config.bucket) missing.push('BACKUP_BUCKET or R3_BUCKET');
  if (!config.endpoint) missing.push('BACKUP_ENDPOINT_URL or R3_ENDPOINT');
  if (!config.accessKeyId) missing.push('BACKUP_ACCESS_KEY_ID or R3_ACCESS_KEY_ID');
  if (!config.secretAccessKey) missing.push('BACKUP_SECRET_ACCESS_KEY or R3_SECRET_ACCESS_KEY');

  if (missing.length && !config.dryRun) {
    throw new Error(`Missing backup configuration: ${missing.join(', ')}`);
  }
}

async function createTarGz(sourceDir, archivePath) {
  await new Promise((resolve, reject) => {
    const child = spawn('tar', ['-czf', archivePath, '-C', sourceDir, '.'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) return resolve();
      reject(new Error(`tar failed with code ${code}: ${stderr}`));
    });
  });
}

async function* walkFiles(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      yield* walkFiles(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index <= 0) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseList(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizePrefix(prefix) {
  return String(prefix || '').replace(/^\/+|\/+$/g, '');
}

function toMysqlDateTime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function quoteIdentifier(value) {
  return `\`${String(value).replace(/`/g, '``')}\``;
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fsp.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeJson(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await fsp.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

async function safeRm(target) {
  try {
    await fsp.rm(target, { recursive: true, force: true });
  } catch (error) {
    log('warn', 'failed to remove temporary backup directory', { target, error: error.message });
  }
}

function log(level, message, extra = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, message, ...extra });
  console.log(line);
  try {
    fs.mkdirSync(path.dirname(config.logFile), { recursive: true });
    fs.appendFileSync(config.logFile, `${line}\n`);
  } catch (error) {
    console.error(`failed to write backup log: ${error.message}`);
  }
}

function encodeS3Key(key) {
  return String(key)
    .split('/')
    .map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`))
    .join('/');
}

function toAmzDate(date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

async function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

function hmac(key, value) {
  return crypto.createHmac('sha256', key).update(value, 'utf8').digest();
}

function hmacHex(key, value) {
  return crypto.createHmac('sha256', key).update(value, 'utf8').digest('hex');
}

function getSignatureKey(secret, dateStamp, region, service) {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

main().catch(error => {
  log('error', 'incremental backup failed', { error: error.message, stack: error.stack });
  process.exitCode = 1;
});
