import "dotenv/config";
import fs from "node:fs/promises";
import { execute, pool } from "../src/server/db/mysql";

function checksum(content: string) {
  let hash = 0;
  for (let i = 0; i < content.length; i += 1) {
    hash = (hash * 31 + content.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

async function run() {
  const file = "002_uploaded_files_registry_fields.sql";
  const content = await fs.readFile("src/server/db/migrations/" + file, "utf8");
  await execute("INSERT IGNORE INTO schema_migrations (filename, checksum) VALUES (?, ?)", [file, checksum(content)]);
  console.log("Marked 002 applied");
  await pool.end();
}
run().catch(console.error);
