import { adminTourGalleryDelete } from "@/server/http/mutation-handlers";

export async function DELETE(request: Request, context: { params: Promise<{ id: string; filename: string }> }) {
  const { id, filename } = await context.params;
  return adminTourGalleryDelete(request, id, filename);
}
