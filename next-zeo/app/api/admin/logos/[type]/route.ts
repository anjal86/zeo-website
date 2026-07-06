import { adminLogoDelete } from "@/server/http/mutation-handlers";

export async function DELETE(request: Request, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  return adminLogoDelete(request, type);
}
