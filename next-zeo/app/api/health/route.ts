import { testConnection } from "@/server/db/mysql";

export async function GET() {
  try {
    await testConnection();
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}
