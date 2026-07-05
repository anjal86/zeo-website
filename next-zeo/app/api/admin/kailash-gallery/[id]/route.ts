import { adminDeleteSimple } from "@/server/http/mutation-handlers";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple("kailash_gallery", id, "Gallery item");
}
