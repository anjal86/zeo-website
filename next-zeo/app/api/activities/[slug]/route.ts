import { getActivityBySlug } from "@/server/repositories/catalog";
import { notFound, ok, serverError } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const activity = await getActivityBySlug(slug);
    return activity ? ok(activity) : notFound("Activity not found");
  } catch (error) {
    return serverError(error);
  }
}
