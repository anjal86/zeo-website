import { listTours } from "@/server/repositories/tours";
import { ok, serverError } from "@/server/http/api-response";
import { maybePaginated, searchParams } from "@/server/http/route-utils";

export async function GET(request: Request) {
  try {
    const result = await listTours(searchParams(request));
    return ok(maybePaginated(request, "tours", result.items, result.total));
  } catch (error) {
    return serverError(error);
  }
}
