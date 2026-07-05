import { listDestinations } from "@/server/repositories/catalog";
import { ok, serverError } from "@/server/http/api-response";
import { maybePaginated, searchParams } from "@/server/http/route-utils";

export async function GET(request: Request) {
  try {
    const result = await listDestinations(searchParams(request));
    return ok(maybePaginated(request, "destinations", result.items, result.total));
  } catch (error) {
    return serverError(error);
  }
}
