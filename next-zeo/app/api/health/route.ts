import { ok } from "@/server/http/api-response";
import { testConnection } from "@/server/db/mysql";

export async function GET() {
  let database = "ok";
  try {
    await testConnection();
  } catch {
    database = "unavailable";
  }

  return ok({
    status: "success",
    message: "Zeo Tourism API is running successfully!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database,
  });
}
