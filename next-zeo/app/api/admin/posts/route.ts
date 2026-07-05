import { requireAdmin } from "@/server/auth/require-admin";
import { listPosts } from "@/server/repositories/content";
import { ok, serverError } from "@/server/http/api-response";
import { adminList, searchParams } from "@/server/http/route-utils";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const result = await listPosts(searchParams(request), true);
    return ok(adminList(request, "posts", result.items, result.total));
  } catch (error) {
    return serverError(error);
  }
}
