import { adminPatchTestimonial } from "@/server/http/mutation-handlers";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminPatchTestimonial(id, "is_featured", request);
}
