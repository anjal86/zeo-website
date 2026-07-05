import { adminTourExport } from "@/server/http/mutation-handlers";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminTourExport(id);
}
