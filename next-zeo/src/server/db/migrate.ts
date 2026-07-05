import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { RowDataPacket } from "mysql2/promise";
import { execute, getAll, pool } from "./mysql";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, "migrations");

async function ensureMigrationTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(64) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function migrationTableExists() {
  const rows = await getAll<RowDataPacket & { table_name: string }>(
    "SELECT TABLE_NAME AS table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schema_migrations'",
  );
  return rows.length > 0;
}

function checksum(content: string) {
  let hash = 0;
  for (let i = 0; i < content.length; i += 1) {
    hash = (hash * 31 + content.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function splitSql(sql: string) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (!dryRun) await ensureMigrationTable();
  const applied = dryRun && !(await migrationTableExists())
    ? []
    : await getAll<RowDataPacket & { filename: string }>("SELECT filename FROM schema_migrations");
  const appliedNames = new Set(applied.map((row) => row.filename));
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  let appliedCount = 0;
  for (const file of files) {
    if (appliedNames.has(file)) {
      console.log(`skip ${file}`);
      continue;
    }

    const content = await fs.readFile(path.join(migrationsDir, file), "utf8");
    const statements = splitSql(content);
    if (dryRun) {
      console.log(`pending ${file} (${statements.length} statements)`);
      appliedCount += 1;
      continue;
    }
    for (const statement of statements) {
      await execute(statement);
    }
    await execute("INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)", [
      file,
      checksum(content),
    ]);
    appliedCount += 1;
    console.log(`applied ${file}`);
  }

  console.log(dryRun ? `migrations pending: ${appliedCount}` : `migrations applied: ${appliedCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
