import { listActivities } from "@/server/repositories/catalog";
import { ok, serverError } from "@/server/http/api-response";
import { maybePaginated, searchParams } from "@/server/http/route-utils";

export async function GET(request: Request) {
  try {
    const result = await listActivities(searchParams(request));
    return ok(maybePaginated(request, "activities", result.items, result.total));
  } catch (error) {
    return serverError(error);
  }
}
