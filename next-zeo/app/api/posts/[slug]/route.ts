import { getPostBySlug } from "@/server/repositories/content";
import { notFound, ok, serverError } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const post = await getPostBySlug(slug);
    return post ? ok(post) : notFound("Post not found");
  } catch (error) {
    return serverError(error);
  }
}
