import { listTours } from "@/server/repositories/tours";
import { ok, serverError } from "@/server/http/api-response";
import { maybePaginated, searchParams } from "@/server/http/route-utils";
import { getPagination, getPaginationMeta } from "@/server/http/pagination";

export async function GET(request: Request) {
  try {
    const params = searchParams(request);
    const result = await listTours(params);
    const url = new URL(request.url);

    if (url.searchParams.has("page") || url.searchParams.has("limit")) {
      const pagination = getPagination({
        page: url.searchParams.get("page"),
        limit: url.searchParams.get("limit"),
      });
      const meta = getPaginationMeta(result.total, pagination);

      return ok(result.items, {
        headers: {
          "X-Total-Count": String(meta.totalItems),
          "X-Total-Pages": String(meta.totalPages),
          "X-Current-Page": String(meta.currentPage),
          "X-Items-Per-Page": String(meta.itemsPerPage),
          "X-Has-Next": String(meta.hasNextPage),
          "X-Has-Previous": String(meta.hasPrevPage),
        },
      });
    }

    return ok(maybePaginated(request, "tours", result.items, result.total));
  } catch (error) {
    return serverError(error);
  }
}
