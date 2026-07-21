import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, 'migrations');

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required migration environment variable: ${name}`);
  return value;
}

function checksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function splitSql(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map(statement => statement.trim())
    .filter(Boolean);
}

const pool = mysql.createPool({
  host: required('MYSQL_HOST'),
  port: Number(process.env.MYSQL_PORT || 3306),
  user: required('MYSQL_USER'),
  password: required('MYSQL_PASSWORD'),
  database: required('MYSQL_DATABASE'),
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  enableKeepAlive: true,
});

async function ensureMigrationTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(64) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function main() {
  await ensureMigrationTable();

  const [rows] = await pool.execute('SELECT filename, checksum FROM schema_migrations ORDER BY filename');
  const applied = new Map(rows.map(row => [String(row.filename), String(row.checksum)]));
  const files = (await fs.readdir(migrationsDir)).filter(file => file.endsWith('.sql')).sort();

  let appliedCount = 0;
  for (const file of files) {
    const content = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    const digest = checksum(content);
    const existingChecksum = applied.get(file);

    if (existingChecksum) {
      if (existingChecksum !== digest) {
        throw new Error(`Applied migration checksum changed: ${file}`);
      }
      console.log(`skip ${file}`);
      continue;
    }

    const statements = splitSql(content);
    console.log(`apply ${file} (${statements.length} statements)`);
    for (const statement of statements) await pool.execute(statement);
    await pool.execute('INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)', [file, digest]);
    appliedCount += 1;
    console.log(`applied ${file}`);
  }

  console.log(`migrations applied: ${appliedCount}`);
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
