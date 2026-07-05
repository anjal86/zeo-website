import { requireAdmin } from "@/server/auth/require-admin";
import { ok } from "@/server/http/api-response";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  return ok({ user: admin.user });
}
