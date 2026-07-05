import { listPosts } from "@/server/repositories/content";
import { ok, serverError } from "@/server/http/api-response";
import { maybePaginated, searchParams } from "@/server/http/route-utils";

export async function GET(request: Request) {
  try {
    const result = await listPosts(searchParams(request));
    return ok(maybePaginated(request, "posts", result.items, result.total));
  } catch (error) {
    return serverError(error);
  }
}
