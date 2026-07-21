import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import mysql from "mysql2/promise";

const requiredEnv = [
  "MYSQL_HOST",
  "MYSQL_PORT",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
  "MYSQL_DATABASE",
];

for (const name of requiredEnv) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
}

const migrationsDir = new URL("./migrations/", import.meta.url);
const backupDir = path.join(process.env.HOME, "apps/zeo/backups/database");
const database = process.env.MYSQL_DATABASE;

function checksum(content) {
  return createHash("sha256").update(content).digest("hex");
}

function splitSql(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function assertForwardOnly(filename, content) {
  if (/\b(?:DROP|TRUNCATE)\b/i.test(content)) {
    throw new Error(`${filename} contains destructive SQL; production migrations must be forward-only`);
  }
}

async function createBackup() {
  await fs.mkdir(backupDir, { recursive: true, mode: 0o700 });
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const backupPath = path.join(backupDir, `pre-deploy-${timestamp}.sql`);
  const output = createWriteStream(backupPath, { mode: 0o600 });
  const args = [
    "--single-transaction",
    "--quick",
    "--skip-lock-tables",
    "--no-tablespaces",
    "--skip-triggers",
    "--host", process.env.MYSQL_HOST,
    "--port", process.env.MYSQL_PORT,
    "--user", process.env.MYSQL_USER,
    database,
  ];

  await new Promise((resolve, reject) => {
    const child = spawn("mysqldump", args, {
      env: { ...process.env, MYSQL_PWD: process.env.MYSQL_PASSWORD },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let errorOutput = "";
    let processFinished = false;
    let outputFinished = false;
    const finish = () => {
      if (processFinished && outputFinished) resolve();
    };
    child.stdout.pipe(output);
    output.on("finish", () => {
      outputFinished = true;
      finish();
    });
    output.on("error", reject);
    child.stderr.on("data", (chunk) => { errorOutput += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`mysqldump failed with exit code ${code}: ${errorOutput.trim()}`));
        return;
      }
      processFinished = true;
      finish();
    });
  });

  const stat = await fs.stat(backupPath);
  if (stat.size === 0) throw new Error("Database backup is empty");

  const backups = (await fs.readdir(backupDir))
    .filter((name) => name.startsWith("pre-deploy-") && name.endsWith(".sql"))
    .sort()
    .reverse();
  await Promise.all(backups.slice(5).map((name) => fs.rm(path.join(backupDir, name))));
  console.log(`database backup created: ${path.basename(backupPath)}`);
}

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database,
  multipleStatements: false,
});

let lockAcquired = false;
try {
  const [[lock]] = await connection.query("SELECT GET_LOCK('zeo_schema_migrations', 30) AS acquired");
  if (lock.acquired !== 1) throw new Error("Could not acquire database migration lock");
  lockAcquired = true;

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(64) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [rows] = await connection.query("SELECT filename, checksum FROM schema_migrations");
  const applied = new Map(rows.map((row) => [row.filename, row.checksum]));
  const files = (await fs.readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();
  const pending = [];

  for (const filename of files) {
    const content = await fs.readFile(new URL(filename, migrationsDir), "utf8");
    const digest = checksum(content);
    const recorded = applied.get(filename);
    if (recorded) {
      if (recorded.length === 64 && recorded !== digest) {
        throw new Error(`Applied migration was modified: ${filename}`);
      }
      continue;
    }
    assertForwardOnly(filename, content);
    pending.push({ filename, content, digest });
  }

  if (pending.length === 0) {
    console.log("migrations applied: 0");
  } else {
    await createBackup();
    for (const migration of pending) {
      for (const statement of splitSql(migration.content)) {
        await connection.query(statement);
      }
      await connection.execute(
        "INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)",
        [migration.filename, migration.digest],
      );
      console.log(`applied ${migration.filename}`);
    }
    console.log(`migrations applied: ${pending.length}`);
  }
} finally {
  if (lockAcquired) await connection.query("SELECT RELEASE_LOCK('zeo_schema_migrations')");
  await connection.end();
}
