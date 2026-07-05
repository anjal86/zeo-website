import { requireAdmin } from "@/server/auth/require-admin";
import { listDestinations } from "@/server/repositories/catalog";
import { ok, serverError } from "@/server/http/api-response";
import { adminList, searchParams } from "@/server/http/route-utils";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const result = await listDestinations(searchParams(request), true);
    return ok(adminList(request, "destinations", result.items, result.total));
  } catch (error) {
    return serverError(error);
  }
}
