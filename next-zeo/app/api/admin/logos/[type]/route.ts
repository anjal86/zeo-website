import { adminLogoDelete } from "@/server/http/mutation-handlers";

export async function DELETE(_request: Request, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  return adminLogoDelete(type);
}
