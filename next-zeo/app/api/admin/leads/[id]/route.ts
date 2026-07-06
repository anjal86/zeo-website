import { adminDeleteSimple, adminLeadUpdate, adminOnly } from "@/server/http/mutation-handlers";
import { getOne } from "@/server/db/mysql";
import { notFound, ok } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminOnly();
  if (denied) return denied;
  const { id } = await context.params;
  const lead = await getOne("SELECT * FROM leads WHERE id = ?", [Number(id)]);
  if (!lead) return notFound();
  return ok(lead);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminLeadUpdate(request, id);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple("leads", id, "Lead");
}
