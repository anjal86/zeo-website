import { adminPatchTourListing } from "@/server/http/mutation-handlers";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminPatchTourListing(request, id);
}
