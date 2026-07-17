'use strict';

const fs = require('node:fs');
const path = require('node:path');

const backupDirectory = path.resolve(process.env.BACKUP_DIRECTORY || path.join(__dirname, '..', 'backups'));
const maximumAgeHours = Number(process.env.BACKUP_MAX_AGE_HOURS || 26);
const minimumBytes = Number(process.env.BACKUP_MIN_BYTES || 1024);

function fail(message) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    event: 'backup_health_failed',
    message,
    backupDirectory,
  }));
  process.exit(1);
}

if (!Number.isFinite(maximumAgeHours) || maximumAgeHours <= 0) fail('BACKUP_MAX_AGE_HOURS must be positive');
if (!Number.isFinite(minimumBytes) || minimumBytes < 1) fail('BACKUP_MIN_BYTES must be at least 1');
if (!fs.existsSync(backupDirectory)) fail('Backup directory does not exist');

const files = fs.readdirSync(backupDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => {
    const filePath = path.join(backupDirectory, entry.name);
    const stats = fs.statSync(filePath);
    return { name: entry.name, filePath, size: stats.size, modifiedAt: stats.mtimeMs };
  })
  .filter((file) => file.size >= minimumBytes)
  .sort((a, b) => b.modifiedAt - a.modifiedAt);

if (!files.length) fail(`No backup file meets the minimum size of ${minimumBytes} bytes`);

const latest = files[0];
const ageHours = (Date.now() - latest.modifiedAt) / 3_600_000;
if (ageHours > maximumAgeHours) fail(`Latest backup is ${ageHours.toFixed(2)} hours old`);

console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  event: 'backup_health_ok',
  backupDirectory,
  latestFile: latest.name,
  sizeBytes: latest.size,
  ageHours: Number(ageHours.toFixed(2)),
}));
