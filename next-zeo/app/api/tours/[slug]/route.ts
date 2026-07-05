import { getTourBySlug } from "@/server/repositories/tours";
import { notFound, ok, serverError } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const tour = await getTourBySlug(slug);
    return tour ? ok(tour) : notFound("Tour not found");
  } catch (error) {
    return serverError(error);
  }
}
