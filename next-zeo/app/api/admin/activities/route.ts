import { requireAdmin } from "@/server/auth/require-admin";
import { listActivities } from "@/server/repositories/catalog";
import { ok, serverError } from "@/server/http/api-response";
import { adminList, searchParams } from "@/server/http/route-utils";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const result = await listActivities(searchParams(request), true);
    return ok(adminList(request, "activities", result.items, result.total));
  } catch (error) {
    return serverError(error);
  }
}
