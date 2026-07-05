import "dotenv/config";
import { pool, testConnection } from "../db/mysql";

async function main() {
  const ok = await testConnection();
  console.log(ok ? "Database connection OK" : "Database connection failed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
