import { adminTourGalleryDelete } from "@/server/http/mutation-handlers";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; filename: string }> }) {
  const { id, filename } = await context.params;
  return adminTourGalleryDelete(id, filename);
}
