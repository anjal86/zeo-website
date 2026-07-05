import { getDestinationBySlug } from "@/server/repositories/catalog";
import { notFound, ok, serverError } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const destination = await getDestinationBySlug(slug);
    return destination ? ok(destination) : notFound("Destination not found");
  } catch (error) {
    return serverError(error);
  }
}
