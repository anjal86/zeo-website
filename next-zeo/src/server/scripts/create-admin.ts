import "dotenv/config";
import bcrypt from "bcryptjs";
import { loadEnv } from "@/env";
import { execute, pool } from "../db/mysql";

async function main() {
  const env = loadEnv();
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await execute(
    `
      INSERT INTO admin_users (email, name, password_hash, role, is_active)
      VALUES (?, ?, ?, 'admin', TRUE)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password_hash = VALUES(password_hash),
        role = 'admin',
        is_active = TRUE,
        updated_at = CURRENT_TIMESTAMP
    `,
    [env.ADMIN_EMAIL, "Admin User", passwordHash],
  );
  console.log(`Admin user created/updated: ${env.ADMIN_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
