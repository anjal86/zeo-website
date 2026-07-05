import { clearAdminSession } from "@/server/auth/session";
import { ok } from "@/server/http/api-response";

export async function POST() {
  await clearAdminSession();
  return ok({ success: true });
}
