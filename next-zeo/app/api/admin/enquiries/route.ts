import { requireAdmin } from "@/server/auth/require-admin";
import { listEnquiries } from "@/server/repositories/admin";
import { ok, serverError } from "@/server/http/api-response";
import { adminList, searchParams } from "@/server/http/route-utils";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const result = await listEnquiries(searchParams(request));
    return ok(adminList(request, "enquiries", result.items, result.total));
  } catch (error) {
    return serverError(error);
  }
}
