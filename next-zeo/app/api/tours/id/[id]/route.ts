import { getTourByLegacyId } from "@/server/repositories/tours";
import { badRequest, notFound, ok, serverError } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const parsed = Number.parseInt(id, 10);
    if (!Number.isFinite(parsed)) return badRequest("Invalid tour id");
    const tour = await getTourByLegacyId(parsed);
    return tour ? ok(tour) : notFound("Tour not found");
  } catch (error) {
    return serverError(error);
  }
}
